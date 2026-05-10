import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LouvorService } from '../../core/services/louvor.service';
import { LouvorCardComponent } from '../../shared/components/louvor-card/louvor-card.component';
import { Louvor } from '../../core/models/louvor.model';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';

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

    /* ── Responsive ── */
    @media (max-width: 480px) {
      .header-title h1 { font-size: 16px; }
      .louvores-grid { grid-template-columns: 1fr; gap: 14px; }
    }
  `]
})
export class RepositorioComponent implements OnInit {
  private louvorService = inject(LouvorService);

  termoBusca = '';
  private busca$ = new BehaviorSubject<string>('');

  louvoresFiltrados$!: Observable<Louvor[]>;

  ngOnInit() {
    this.louvoresFiltrados$ = combineLatest([
      this.louvorService.getLouvores(),
      this.busca$.pipe(debounceTime(200), distinctUntilChanged()),
    ]).pipe(
      map(([louvores, busca]) => {
        const termo = busca.trim().toLowerCase();
        return louvores
          .filter(l =>
            !termo ||
            l.titulo.toLowerCase().includes(termo) ||
            l.artista.toLowerCase().includes(termo)
          )
          .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR', { sensitivity: 'base' }));
      })
    );
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
