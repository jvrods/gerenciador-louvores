import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Louvor } from '../../../core/models/louvor.model';

@Component({
  selector: 'app-louvor-card',
  standalone: true,
  imports: [CommonModule],
  template: `
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
          <a [href]="louvor?.linkCifra" target="_blank" class="btn-cifra">
            <span class="material-icons" style="font-size: 16px; margin-right: 5px;">description</span>
            Ver Cifra
          </a>
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
    .btn-cifra {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-color);
      color: white;
      text-decoration: none;
      padding: 8px 15px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      flex-grow: 1;
      transition: opacity 0.2s;
    }
    .btn-cifra:hover {
      opacity: 0.9;
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
    .btn-icon:hover {
      opacity: 0.8;
    }
    .spotify { background: #1DB954; }
    .yt-music { background: #FF0000; }
  `]
})
export class LouvorCardComponent {
  @Input() louvor!: Louvor;
  private sanitizer = inject(DomSanitizer);
  playingVideo = false;

  onImageClick(event: Event) {
    if (this.louvor?.linkYoutube) {
      event.preventDefault(); // Previne que abra uma nova guia
      this.playingVideo = true; // Mostra o iframe
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
