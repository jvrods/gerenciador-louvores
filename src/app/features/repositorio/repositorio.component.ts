import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LouvorService } from '../../core/services/louvor.service';
import { LouvorCardComponent } from '../../shared/components/louvor-card/louvor-card.component';
import { Louvor } from '../../core/models/louvor.model';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-repositorio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LouvorCardComponent],
  template: `
    <header class="header">
      <div class="container header-content">
        <a routerLink="/" class="back-btn">
          <span class="material-icons">arrow_back</span>
        </a>
        <div class="header-title">
          <span class="material-icons header-icon">library_music</span>
          <h1>Repositório de Músicas</h1>
        </div>
        <div style="width: 40px;"></div>
      </div>
    </header>

    <main class="container">

      <!-- Ações do Repositório (Sugerir e Toggle) -->
      <div class="repo-actions">
        <button class="btn btn-suggest" (click)="abrirModalSugestao()">
          <span class="material-icons">add_circle_outline</span>
          Sugerir Música
        </button>
        <div class="toggle-container">
          <span [class.active]="!verSugestoes">Acervo</span>
          <label class="switch">
            <input type="checkbox" [(ngModel)]="verSugestoes" (change)="onToggleSugestoes()">
            <span class="slider round"></span>
          </label>
          <span [class.active]="verSugestoes">Sugestões</span>
        </div>
      </div>

      <!-- Barra de Pesquisa -->
      <div class="search-wrapper">
        <span class="material-icons search-icon">search</span>
        <input
          id="search-input"
          type="text"
          class="search-input"
          placeholder="Buscar por título ou artista..."
          [(ngModel)]="termoBusca"
          (ngModelChange)="onBuscaChange($event)"
          autocomplete="off"
        />
        <button *ngIf="termoBusca" class="clear-btn" (click)="limparBusca()" title="Limpar busca">
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- Contador de Resultados -->
      <div class="resultado-info">
        <ng-container *ngIf="louvoresFiltrados$ | async as lista">
          <span *ngIf="lista.length > 0">
            <strong>{{ lista.length }}</strong> {{ lista.length === 1 ? 'música encontrada' : 'músicas encontradas' }}
          </span>
        </ng-container>
      </div>

      <!-- Grid de Cards -->
      <ng-container *ngIf="louvoresFiltrados$ | async as lista">
        <div class="louvores-grid" *ngIf="lista.length > 0; else emptyState">
          <app-louvor-card
            *ngFor="let louvor of lista; trackBy: trackById"
            [louvor]="louvor"
          ></app-louvor-card>
        </div>

        <!-- Estado Vazio -->
        <ng-template #emptyState>
          <div class="empty-state">
            <span class="material-icons empty-icon">search_off</span>
            <h3>Nenhuma música encontrada</h3>
            <p>Nenhum resultado para <strong>"{{ termoBusca }}"</strong>. Tente outro termo.</p>
          </div>
        </ng-template>
      </ng-container>

      <!-- Modal de Sugestão -->
      <div class="modal-overlay" *ngIf="showSuggestionModal" (click)="fecharModalSugestao()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Sugerir Nova Música</h3>
            <button class="close-btn" (click)="fecharModalSugestao()"><span class="material-icons">close</span></button>
          </div>
          <p class="modal-subtitle">Conhece um louvor que deveria estar aqui? Envie sua sugestão!</p>
          
          <form (ngSubmit)="enviarSugestao()">
            <div class="form-group">
              <label>Título da Música <span class="required">*</span></label>
              <input type="text" [(ngModel)]="novaSugestao.titulo" name="titulo" required placeholder="Ex: Maranata" class="form-input">
            </div>
            <div class="form-group">
              <label>Artista <span class="required">*</span></label>
              <input type="text" [(ngModel)]="novaSugestao.artista" name="artista" required placeholder="Ex: Ministério Avivah" class="form-input">
            </div>
            <div class="form-group">
              <label>Link do YouTube (Opcional)</label>
              <input type="url" [(ngModel)]="novaSugestao.linkYoutube" name="linkYoutube" placeholder="https://youtube.com/watch?v=..." class="form-input">
            </div>
            
            <button type="submit" class="btn btn-primary" [disabled]="isSubmitting" style="width: 100%; margin-top: 10px;">
              {{ isSubmitting ? 'Enviando...' : 'Enviar Sugestão' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Toast Notification -->
      <div class="toast" [class.show]="toastMessage">
        {{ toastMessage }}
      </div>

    </main>
  `,
  styles: [`
    /* ── Header ── */
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
    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .header-title h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    .header-icon {
      font-size: 26px;
      color: var(--primary-color);
    }
    .back-btn {
      color: white;
      display: flex;
      align-items: center;
      text-decoration: none;
      padding: 6px;
      border-radius: 50%;
      transition: background 0.2s;
    }
    .back-btn:hover {
      background: rgba(255,255,255,0.15);
    }

    /* ── Search Bar ── */
    .search-wrapper {
      position: relative;
      margin-bottom: 8px;
    }
    .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none;
      font-size: 22px;
    }
    .search-input {
      width: 100%;
      padding: 16px 48px 16px 50px;
      background: var(--card-bg);
      border: 1.5px solid var(--card-border);
      border-radius: 50px;
      color: var(--text-color);
      font-size: 16px;
      font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
      outline: none;
    }
    .search-input:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(var(--primary-rgb, 90, 117, 230), 0.2);
    }
    .search-input::placeholder {
      color: var(--text-muted);
    }
    .clear-btn {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 4px;
      border-radius: 50%;
      transition: color 0.2s, background 0.2s;
    }
    .clear-btn:hover {
      color: var(--text-color);
      background: rgba(255,255,255,0.1);
    }

    /* ── Resultado Info ── */
    .resultado-info {
      font-size: 13px;
      color: var(--text-muted);
      margin: 12px 0 20px;
      min-height: 18px;
    }
    .resultado-info strong {
      color: var(--text-color);
    }

    /* ── Grid ── */
    .louvores-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }

    /* ── Empty State ── */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted);
    }
    .empty-icon {
      font-size: 72px;
      color: rgba(255,255,255,0.15);
      margin-bottom: 16px;
      display: block;
    }
    .empty-state h3 {
      color: var(--text-color);
      font-size: 20px;
      margin: 0 0 10px;
      font-weight: 500;
    }
    .empty-state p {
      margin: 0;
      font-size: 15px;
    }

    /* ── Ações e Toggle ── */
    .repo-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 15px;
    }
    .btn-suggest {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 50px;
      padding: 10px 22px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(var(--primary-rgb, 90, 117, 230), 0.3);
    }
    .btn-suggest:hover {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(var(--primary-rgb, 90, 117, 230), 0.4);
    }
    .toggle-container {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--card-bg);
      padding: 8px 15px;
      border-radius: 50px;
      border: 1px solid var(--card-border);
    }
    .toggle-container span {
      font-size: 14px;
      color: var(--text-muted);
      transition: color 0.3s;
    }
    .toggle-container span.active {
      color: var(--text-color);
      font-weight: 500;
    }
    .switch {
      position: relative;
      display: inline-block;
      width: 46px;
      height: 24px;
    }
    .switch input { 
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: var(--card-border);
      transition: .4s;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
    }
    input:checked + .slider {
      background-color: var(--primary-color);
    }
    input:checked + .slider:before {
      transform: translateX(22px);
    }
    .slider.round {
      border-radius: 34px;
    }
    .slider.round:before {
      border-radius: 50%;
    }

    /* ── Modal de Sugestão ── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
    }
    .modal-content {
      background: #150e20;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 30px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.6);
      animation: modalIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.94) translateY(12px); }
      to   { opacity: 1; transform: scale(1)    translateY(0); }
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .modal-header h3 {
      margin: 0;
      font-size: 22px;
    }
    .close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 24px;
      padding: 0;
      display: flex;
    }
    .close-btn:hover {
      color: white;
    }
    .modal-subtitle {
      color: var(--text-muted);
      font-size: 14px;
      margin-bottom: 25px;
    }
    .form-group {
      margin-bottom: 20px;
      text-align: left;
    }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: var(--text-color);
      font-size: 14px;
    }
    .form-group .required {
      color: #ff4444;
    }
    .form-input {
      width: 100%;
      padding: 12px 15px;
      background: rgba(0,0,0,0.2);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      color: white;
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .form-input:focus {
      border-color: var(--primary-color);
    }
    .btn-primary {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 14px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-primary:hover {
      opacity: 0.9;
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* ── Toast ── */
    .toast {
      position: fixed;
      bottom: -50px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--primary-color);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: bottom 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      z-index: 10001;
      font-weight: 500;
      pointer-events: none;
    }
    .toast.show {
      bottom: 20px;
    }

    /* ── Responsive ── */
    @media (max-width: 480px) {
      .header-title h1 { font-size: 16px; }
      .louvores-grid { grid-template-columns: 1fr; gap: 14px; }
      
      .repo-actions { 
        flex-direction: row; 
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 15px;
      }

      .btn-suggest { 
        padding: 8px 12px;
        font-size: 13px;
        gap: 5px;
        flex: 1;
        justify-content: center;
        white-space: nowrap;
      }
      .btn-suggest span { font-size: 18px; }

      .toggle-container { 
        padding: 6px 10px;
        gap: 6px;
        flex: 0 0 auto;
      }
      .toggle-container span { font-size: 12px; }
      .switch { width: 36px; height: 20px; }
      .slider:before { height: 14px; width: 14px; left: 3px; bottom: 3px; }
      input:checked + .slider:before { transform: translateX(16px); }
    }
  `]
})
export class RepositorioComponent implements OnInit {
  private louvorService = inject(LouvorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  termoBusca = '';
  verSugestoes = false;
  private busca$ = new BehaviorSubject<string>('');
  private sugestoes$ = new BehaviorSubject<boolean>(false);

  louvoresFiltrados$!: Observable<Louvor[]>;

  // Variáveis do Modal
  showSuggestionModal = false;
  isSubmitting = false;
  toastMessage = '';
  novaSugestao: Partial<Louvor> = { titulo: '', artista: '', linkYoutube: '', tema: 'Geral', linkCifra: '' };

  ngOnInit() {
    // Verifica se deve abrir o modal de sugestão via URL (?sugerir=true)
    this.route.queryParams.subscribe(params => {
      if (params['sugerir'] === 'true') {
        this.abrirModalSugestao();
      }
    });

    this.louvoresFiltrados$ = combineLatest([
      this.louvorService.getLouvores(),
      this.busca$.pipe(debounceTime(200), distinctUntilChanged()),
      this.sugestoes$
    ]).pipe(
      map(([louvores, busca, showSugestoes]) => {
        const termo = busca.trim().toLowerCase();
        return louvores
          .filter(l => {
            // Filtro de sugestão vs oficial
            const isSugestao = l.isSuggestion === true;
            if (showSugestoes !== isSugestao) return false;

            // Filtro de texto
            if (!termo) return true;
            return l.titulo.toLowerCase().includes(termo) || l.artista.toLowerCase().includes(termo);
          })
          .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR', { sensitivity: 'base' }));
      })
    );
  }

  onToggleSugestoes() {
    this.sugestoes$.next(this.verSugestoes);
  }

  abrirModalSugestao() {
    this.novaSugestao = { titulo: '', artista: '', linkYoutube: '', tema: 'Geral', linkCifra: '' };
    this.showSuggestionModal = true;
    // Atualiza a URL para incluir o parâmetro (Deep Linking)
    this.router.navigate([], { 
      relativeTo: this.route,
      queryParams: { sugerir: 'true' },
      queryParamsHandling: 'merge'
    });
  }

  fecharModalSugestao() {
    this.showSuggestionModal = false;
    // Remove o parâmetro da URL ao fechar
    this.router.navigate([], { 
      relativeTo: this.route,
      queryParams: { sugerir: null },
      queryParamsHandling: 'merge'
    });
  }

  async enviarSugestao() {
    if (!this.novaSugestao.titulo || !this.novaSugestao.titulo.trim()) {
      this.showToast('Erro: O Título é obrigatório.');
      return;
    }
    if (!this.novaSugestao.artista || !this.novaSugestao.artista.trim()) {
      this.showToast('Erro: O Artista é obrigatório.');
      return;
    }

    this.isSubmitting = true;
    try {
      await this.louvorService.addSuggestion(this.novaSugestao);
      this.showToast('Sugestão Enviada Com Sucesso, Muito Obrigado!');
      // Reseta o formulário para uma nova sugestão sem fechar o modal
      this.novaSugestao = { titulo: '', artista: '', linkYoutube: '', tema: 'Geral', linkCifra: '' };
    } catch (error: any) {
      console.error('Erro ao enviar sugestão:', error);
      if (error.code === 'permission-denied') {
        this.showToast('Erro: Permissão negada no Firebase. Verifique as regras de segurança.');
        alert('Erro de Permissão: Você precisa ajustar as regras do Firestore para permitir sugestões públicas.');
      } else {
        this.showToast('Erro ao enviar sugestão. Verifique sua conexão.');
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  showToast(message: string) {
    this.toastMessage = message;
    setTimeout(() => {
      this.toastMessage = '';
    }, 10000);
  }

  onBuscaChange(valor: string) {
    this.busca$.next(valor);
  }

  limparBusca() {
    this.termoBusca = '';
    this.busca$.next('');
  }

  trackById(index: number, louvor: Louvor): string {
    return louvor.id ?? String(index);
  }
}
