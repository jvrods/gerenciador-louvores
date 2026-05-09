import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LouvorService, PlaylistConfig } from '../../core/services/louvor.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="header">
      <div class="container header-content">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="material-symbols-outlined" style="font-size: 28px;">church</span>
          <h1>Gerenciador de Louvores</h1>
        </div>
        <a routerLink="/login" class="btn-login">Admin</a>
      </div>
    </header>

    <main class="container">
      <h2 style="text-align: center; margin-bottom: 30px; font-weight: 400;">Selecione o Culto/Tema</h2>
      
      <div class="temas-grid">
        <a routerLink="/tema/Ceia" class="tema-card">
          <div class="tema-icon"><span class="material-icons">wine_bar</span></div>
          <h3>Ceia</h3>
        </a>

        <a routerLink="/tema/Primícias" class="tema-card">
          <div class="tema-icon"><span class="material-icons">volunteer_activism</span></div>
          <h3>Primícias</h3>
        </a>

        <a routerLink="/tema/Missões" class="tema-card">
          <div class="tema-icon"><span class="material-icons">public</span></div>
          <h3>Missões</h3>
        </a>

        <a routerLink="/tema/Culto Solene" class="tema-card">
          <div class="tema-icon"><span class="material-icons">account_balance</span></div>
          <h3>Culto Solene</h3>
        </a>

        <!-- Playlist Card -->
        <a href="javascript:void(0)" (click)="abrirModalPlaylist()" class="tema-card playlist-card">
          <div class="tema-icon"><span class="material-icons">queue_music</span></div>
          <h3>Playlist Next Service</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 8px; text-align: center;">Ouvir Agora</p>
        </a>

        <!-- Repositório Card -->
        <a routerLink="/repositorio" class="tema-card repositorio-card">
          <div class="tema-icon"><span class="material-icons">library_music</span></div>
          <h3>Repositório</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 8px; text-align: center;">Todas as Músicas</p>
        </a>
      </div>

      <!-- Modal de Plataforma -->
      <div class="modal-overlay" *ngIf="showModal" (click)="fecharModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Escolha a Plataforma</h3>
          <p style="color: var(--text-muted); margin-bottom: 20px;">Onde você deseja escutar a playlist do culto?</p>
          
          <div style="display: flex; gap: 15px;">
            <button class="btn btn-platform youtube" (click)="abrirLinkPlaylist('youtube')">
              <span class="material-icons">play_circle_filled</span>
              YouTube
            </button>
            <button class="btn btn-platform ytmusic" (click)="abrirLinkPlaylist('ytmusic')">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.38 0 0 5.38 0 12s5.38 12 12 12 12-5.38 12-12S18.62 0 12 0zm0 18.27A6.27 6.27 0 1 1 18.27 12 6.28 6.28 0 0 1 12 18.27zm3.17-6.52l-4.57 2.65a.29.29 0 0 1-.43-.25v-5.3a.29.29 0 0 1 .43-.25l4.57 2.65a.29.29 0 0 1 0 .5z"/>
              </svg>
              YT Music
            </button>
            <button class="btn btn-platform spotify" (click)="abrirLinkPlaylist('spotify')">
              <span class="material-icons">podcasts</span>
              Spotify
            </button>
          </div>
          <button class="btn btn-cancel" (click)="fecharModal()">Cancelar</button>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .header {
      background-color: var(--header-bg);
      color: white;
      padding: 15px 0;
      margin-bottom: 30px;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    .btn-login {
      font-size: 14px;
      padding: 6px 12px;
      background: rgba(255,255,255,0.2);
      border-radius: 4px;
      color: white;
    }
    .temas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    .tema-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 40px 20px;
      color: var(--text-color);
      transition: transform 0.2s, box-shadow 0.2s;
      text-decoration: none;
    }
    .tema-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      background: rgba(255, 255, 255, 0.12);
    }
    .tema-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .tema-icon span {
      font-size: 40px;
      color: white;
    }
    .tema-card h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
    .playlist-card {
      background: linear-gradient(135deg, rgba(255,0,0,0.1) 0%, rgba(200,0,0,0.05) 100%);
      border-color: rgba(255,0,0,0.2);
    }
    .playlist-card .tema-icon {
      background: #ff0000;
    }
    .repositorio-card {
      background: linear-gradient(135deg, rgba(90,117,230,0.15) 0%, rgba(60,80,180,0.05) 100%);
      border-color: rgba(90,117,230,0.3);
    }
    .repositorio-card .tema-icon {
      background: linear-gradient(135deg, #5a75e6, #3c50b4);
    }
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    .modal-content {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 30px;
      width: 100%;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    .modal-content h3 {
      margin-top: 0;
      font-size: 20px;
    }
    .btn-platform {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 15px 10px;
      border: none;
      border-radius: 12px;
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.2s;
    }
    .btn-platform:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }
    .btn-platform span {
      font-size: 32px;
    }
    .btn-platform.youtube {
      background: #ff0000;
    }
    .btn-platform.ytmusic {
      background: #000000;
      border: 1px solid #333;
    }
    .btn-platform.spotify {
      background: #1DB954;
    }
    .btn-cancel {
      margin-top: 20px;
      width: 100%;
      background: transparent;
      border: 1px solid var(--text-muted);
      color: var(--text-color);
    }
    .btn-cancel:hover {
      background: rgba(255,255,255,0.05);
    }
  `]
})
export class HomeComponent implements OnInit {
  private louvorService = inject(LouvorService);
  showModal = false;
  configPlaylist: PlaylistConfig | null = null;

  ngOnInit() {
    this.louvorService.getPlaylistConfig().subscribe(config => {
      this.configPlaylist = config;
    });
  }

  abrirModalPlaylist() {
    this.showModal = true;
  }

  fecharModal() {
    this.showModal = false;
  }

  async abrirLinkPlaylist(plataforma: 'youtube' | 'ytmusic' | 'spotify') {
    if (plataforma === 'youtube') {
      try {
        const louvores = await firstValueFrom(this.louvorService.getLouvores());
        const selecionados = louvores.filter(l => l.inPlaylist && l.linkYoutube);
        
        if (selecionados.length === 0) {
          alert('Nenhum louvor com link do YouTube foi selecionado para a playlist.');
          return;
        }

        const videoIds = selecionados.map(l => {
          const match = l.linkYoutube!.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
          return match ? match[1] : null;
        }).filter(id => id !== null);

        if (videoIds.length === 0) {
          alert('Não foi possível extrair os IDs dos vídeos.');
          return;
        }

        const playlistUrl = `https://www.youtube.com/watch_videos?video_ids=${videoIds.join(',')}`;
        window.open(playlistUrl, '_blank');
        this.fecharModal();
      } catch (error) {
        console.error('Erro ao gerar playlist do YouTube:', error);
        alert('Erro ao carregar os louvores.');
      }
      return;
    }

    // Lógica para YT Music e Spotify
    if (!this.configPlaylist) {
      alert('A playlist do próximo culto ainda não foi configurada pelo administrador.');
      return;
    }

    const url = this.configPlaylist[plataforma];
    
    if (!url) {
      alert(`O link da playlist no ${plataforma === 'ytmusic' ? 'YouTube Music' : 'Spotify'} não foi configurado.`);
      return;
    }

    window.open(url, '_blank');
    this.fecharModal();
  }
}
