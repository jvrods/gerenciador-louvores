import { Component, Input, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import { Louvor } from '../../../core/models/louvor.model';
import { LetraProxyService } from '../../../core/services/letra-proxy.service';

@Component({
  selector: 'app-louvor-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container>
    <div class="card">
      <div class="card-image-container">
        <!-- Mostra iframe quando clica em play -->
        <iframe *ngIf="playingVideo && getEmbedUrl() as embed"
                [src]="embed"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                class="video-iframe">
        </iframe>

        <!-- Mostra a capa por padrão -->
        <a *ngIf="!playingVideo"
           [href]="louvor?.linkYoutube || louvor?.linkCifra"
           (click)="onImageClick($event)"
           target="_blank"
           class="card-image">
          <img *ngIf="getThumbnailUrl(louvor?.linkYoutube) || louvor?.imagemUrl as img; else placeholder" [src]="img" [alt]="louvor?.titulo">
          <ng-template #placeholder>
            <div class="placeholder-img">
              <span class="material-icons" style="font-size: 48px;">music_note</span>
            </div>
          </ng-template>
          <div class="play-overlay" *ngIf="louvor?.linkYoutube">
            <span class="material-icons" style="font-size: 48px;">play_circle_outline</span>
          </div>
        </a>
      </div>

      <div class="card-content">
        <div class="tags">
          <span class="tag tag-blue" *ngIf="louvor?.tema">{{ louvor?.tema }}</span>
        </div>
        <h3>{{ louvor?.titulo }}</h3>
        <p class="artist">{{ louvor?.artista }}</p>
        <div class="actions">
          <a *ngIf="louvor?.linkCifra" [href]="louvor?.linkCifra" target="_blank" class="btn-action">
            Cifra
          </a>
          <button *ngIf="louvor?.linkLetra" (click)="abrirModal()" class="btn-action btn-letra">
            Letra
          </button>
          <div class="music-links">
            <a *ngIf="louvor?.linkSpotify" [href]="louvor?.linkSpotify" target="_blank" class="btn-icon spotify" title="Ouvir no Spotify">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.3 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.781s.18-1.2.78-1.381c4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.239.54-.959.72-1.62.36z"/>
              </svg>
            </a>
            <a *ngIf="louvor?.linkYoutubeMusic" [href]="louvor?.linkYoutubeMusic" target="_blank" class="btn-icon yt-music" title="Ouvir no YouTube Music">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.38 0 0 5.38 0 12s5.38 12 12 12 12-5.38 12-12S18.62 0 12 0zm0 18.27A6.27 6.27 0 1 1 18.27 12 6.28 6.28 0 0 1 12 18.27zm3.17-6.52l-4.57 2.65a.29.29 0 0 1-.43-.25v-5.3a.29.29 0 0 1 .43-.25l4.57 2.65a.29.29 0 0 1 0 .5z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Modal de Letra/Cifra ── -->
    <div class="modal-overlay" *ngIf="showModal" (click)="fecharModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">

        <!-- Header do Modal -->
        <div class="modal-header">
          <div class="modal-titulo">
            <span class="material-icons modal-tipo-icon">article</span>
            <div>
              <h2>{{ louvor?.titulo }}</h2>
              <p class="modal-artista">{{ louvor?.artista }}</p>
            </div>
          </div>
          <button class="modal-close" (click)="fecharModal()" title="Fechar (Esc)">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Conteúdo do Modal -->
        <div class="modal-body">
          <!-- Loading -->
          <div *ngIf="modalLoading" class="modal-loading">
            <div class="spinner"></div>
            <p>Carregando letra...</p>
          </div>

          <!-- Erro -->
          <div *ngIf="modalErro && !modalLoading" class="modal-erro">
            <span class="material-icons" style="font-size: 48px; color: rgba(255,255,255,0.2);">wifi_off</span>
            <p>{{ modalErro }}</p>
            <p style="font-size: 13px; color: var(--text-muted);">Isso pode acontecer em ambiente local. Em produção o proxy estará disponível.</p>
          </div>

          <!-- Conteúdo -->
          <div *ngIf="!modalLoading && !modalErro && modalConteudoSafe"
               class="modal-conteudo"
               [innerHTML]="modalConteudoSafe">
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <a [href]="modalUrl" target="_blank" class="modal-link-original">
            <span class="material-icons" style="font-size: 16px;">open_in_new</span>
            Abrir no site original
          </a>
        </div>

      </div>
    </div>
    </ng-container>
  `,
  styles: [`
    .card {
      display: flex;
      flex-direction: column;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      color: var(--text-color);
      height: 100%;
    }
    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    .card-image-container {
      width: 100%;
      aspect-ratio: 16 / 10;
      background: #11081f;
      display: block;
      position: relative;
    }
    .card-image {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
    }
    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .video-iframe {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
    .play-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .card-image:hover .play-overlay {
      opacity: 1;
    }
    .placeholder-img {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.2);
    }
    .card-content {
      padding: 15px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }
    .tags {
      display: flex;
      gap: 6px;
      margin-bottom: 10px;
    }
    .tag {
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .tag-blue { background: #5a75e6; color: white; }

    .card-content h3 {
      margin: 0 0 5px 0;
      font-size: 16px;
      font-weight: 500;
      line-height: 1.3;
    }
    .artist {
      margin: 0 0 15px 0;
      font-size: 13px;
      color: var(--text-muted);
    }
    .actions {
      margin-top: auto;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn-action {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-color);
      color: white;
      text-decoration: none;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      flex-grow: 1;
      transition: opacity 0.2s;
      white-space: nowrap;
      border: none;
      cursor: pointer;
      font-family: inherit;
    }
    .btn-action:hover {
      opacity: 0.85;
    }
    .btn-letra {
      background: #4a5568;
    }
    .music-links {
      display: flex;
      gap: 8px;
    }
    .btn-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 6px;
      color: white;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .btn-icon:hover { opacity: 0.8; }
    .spotify { background: #1DB954; }
    .yt-music { background: #FF0000; }

    /* ── Modal ── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 16px;
    }
    .modal-box {
      background: var(--card-bg, #1a1128);
      border: 1px solid var(--card-border, rgba(255,255,255,0.1));
      border-radius: 16px;
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 24px 64px rgba(0,0,0,0.6);
      animation: modalIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.94) translateY(12px); }
      to   { opacity: 1; transform: scale(1)    translateY(0); }
    }
    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--card-border, rgba(255,255,255,0.08));
      gap: 12px;
      flex-shrink: 0;
    }
    .modal-titulo {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .modal-tipo-icon {
      font-size: 28px;
      color: var(--primary-color, #5a75e6);
      margin-top: 2px;
      flex-shrink: 0;
    }
    .modal-titulo h2 {
      margin: 0 0 4px;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.3;
      color: var(--text-color);
    }
    .modal-artista {
      margin: 0;
      font-size: 13px;
      color: var(--text-muted);
    }
    .modal-close {
      background: rgba(255,255,255,0.07);
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      border-radius: 8px;
      padding: 6px;
      display: flex;
      align-items: center;
      transition: background 0.2s, color 0.2s;
      flex-shrink: 0;
    }
    .modal-close:hover {
      background: rgba(255,255,255,0.14);
      color: var(--text-color);
    }
    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }
    .modal-body::-webkit-scrollbar { width: 6px; }
    .modal-body::-webkit-scrollbar-track { background: transparent; }
    .modal-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }

    /* Loading */
    .modal-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      color: var(--text-muted);
      gap: 16px;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: var(--primary-color, #5a75e6);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Erro */
    .modal-erro {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      text-align: center;
      color: var(--text-muted);
      gap: 12px;
    }

    /* Conteúdo extraído */
    .modal-conteudo {
      color: var(--text-color);
      line-height: 1.8;
      font-size: 15px;
    }
    .modal-conteudo p {
      margin: 0 0 16px;
    }
    .modal-conteudo :global(.cifra-pre),
    .modal-conteudo pre {
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      white-space: pre-wrap;
      line-height: 1.6;
      color: var(--text-color);
    }

    /* Footer */
    .modal-footer {
      padding: 14px 20px;
      border-top: 1px solid var(--card-border, rgba(255,255,255,0.08));
      flex-shrink: 0;
    }
    .modal-link-original {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.2s;
    }
    .modal-link-original:hover {
      color: var(--text-color);
    }

    @media (max-width: 480px) {
      .modal-box { max-height: 95vh; border-radius: 12px 12px 0 0; align-self: flex-end; }
      .modal-overlay { align-items: flex-end; padding: 0; }
    }
  `]
})
export class LouvorCardComponent {
  @Input() louvor!: Louvor;
  private sanitizer = inject(DomSanitizer);
  private letraProxy = inject(LetraProxyService);

  // Estado do vídeo
  playingVideo = false;

  // Estado do modal
  showModal = false;
  modalUrl = '';
  modalLoading = false;
  modalErro = '';
  modalConteudoSafe: SafeHtml | null = null;

  @HostListener('document:keydown.escape')
  onEscKey() {
    if (this.showModal) this.fecharModal();
  }

  async abrirModal() {
    const url = this.louvor?.linkLetra;
    if (!url) return;

    this.modalUrl = url;
    this.showModal = true;
    this.modalLoading = true;
    this.modalErro = '';
    this.modalConteudoSafe = null;

    try {
      const conteudo = await this.letraProxy.buscarConteudo(url);
      this.modalConteudoSafe = this.sanitizer.bypassSecurityTrustHtml(conteudo.html);
    } catch (err: any) {
      this.modalErro = err?.message || 'Não foi possível carregar o conteúdo.';
    } finally {
      this.modalLoading = false;
    }
  }

  fecharModal() {
    this.showModal = false;
    this.modalConteudoSafe = null;
    this.modalErro = '';
  }

  onImageClick(event: Event) {
    if (this.louvor?.linkYoutube) {
      event.preventDefault();
      this.playingVideo = true;
    }
  }

  getEmbedUrl(): SafeResourceUrl | null {
    if (!this.louvor?.linkYoutube) return null;
    const match = this.louvor.linkYoutube.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (match) {
      const url = `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return null;
  }

  getThumbnailUrl(url?: string): string | null {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
  }
}
