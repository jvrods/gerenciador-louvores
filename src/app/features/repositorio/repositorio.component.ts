import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LouvorService } from '../../core/services/louvor.service';
import { LouvorCardComponent } from '../../shared/components/louvor-card/louvor-card.component';
import { Louvor } from '../../core/models/louvor.model';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

type FiltroRecurso = 'todos' | 'cifra' | 'letra' | 'video';
type FiltroTema = 'todos' | 'Ceia' | 'Primícias' | 'Missões' | 'Culto Solene';

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

      <!-- Filtros por Tema -->
      <div class="filtros-section">
        <p class="filtros-label">
          <span class="material-icons" style="font-size: 16px; vertical-align: middle;">label</span>
          Tema
        </p>
        <div class="chips-row">
          <button
            *ngFor="let tema of temaOptions"
            class="chip"
            [class.active]="filtroTema === tema.value"
            (click)="setFiltroTema(tema.value)"
          >
            <span class="material-icons chip-icon">{{ tema.icon }}</span>
            {{ tema.label }}
          </button>
        </div>
      </div>

      <!-- Filtros por Recurso -->
      <div class="filtros-section">
        <p class="filtros-label">
          <span class="material-icons" style="font-size: 16px; vertical-align: middle;">filter_list</span>
          Recursos disponíveis
        </p>
        <div class="chips-row">
          <button
            *ngFor="let rec of recursoOptions"
            class="chip"
            [class.active]="filtroRecurso === rec.value"
            (click)="setFiltroRecurso(rec.value)"
          >
            <span class="material-icons chip-icon">{{ rec.icon }}</span>
            {{ rec.label }}
          </button>
        </div>
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
            <p *ngIf="termoBusca">Nenhum resultado para <strong>"{{ termoBusca }}"</strong>. Tente outro termo.</p>
            <p *ngIf="!termoBusca">Nenhuma música corresponde aos filtros selecionados.</p>
            <button class="btn btn-limpar" (click)="limparFiltros()">
              <span class="material-icons">filter_list_off</span>
              Limpar filtros
            </button>
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
      margin-bottom: 24px;
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

    /* ── Filter Sections ── */
    .filtros-section {
      margin-bottom: 16px;
    }
    .filtros-label {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin: 0 0 8px 4px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .chip {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 7px 14px;
      background: var(--card-bg);
      border: 1.5px solid var(--card-border);
      border-radius: 20px;
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
      white-space: nowrap;
    }
    .chip:hover {
      border-color: var(--primary-color);
      color: var(--text-color);
    }
    .chip.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }
    .chip-icon {
      font-size: 16px;
    }

    /* ── Resultado Info ── */
    .resultado-info {
      font-size: 13px;
      color: var(--text-muted);
      margin: 16px 0 20px;
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
      margin: 0 0 24px;
      font-size: 15px;
    }
    .btn-limpar {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      border: 1.5px solid var(--card-border);
      color: var(--text-color);
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.2s, border-color 0.2s;
    }
    .btn-limpar:hover {
      background: rgba(255,255,255,0.07);
      border-color: var(--text-muted);
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
  filtroTema: FiltroTema = 'todos';
  filtroRecurso: FiltroRecurso = 'todos';

  private busca$ = new BehaviorSubject<string>('');
  private tema$ = new BehaviorSubject<FiltroTema>('todos');
  private recurso$ = new BehaviorSubject<FiltroRecurso>('todos');

  louvoresFiltrados$!: Observable<Louvor[]>;

  temaOptions: { value: FiltroTema; label: string; icon: string }[] = [
    { value: 'todos',        label: 'Todos',        icon: 'apps' },
    { value: 'Ceia',         label: 'Ceia',         icon: 'wine_bar' },
    { value: 'Primícias',    label: 'Primícias',    icon: 'volunteer_activism' },
    { value: 'Missões',      label: 'Missões',      icon: 'public' },
    { value: 'Culto Solene', label: 'Culto Solene', icon: 'account_balance' },
  ];

  recursoOptions: { value: FiltroRecurso; label: string; icon: string }[] = [
    { value: 'todos',  label: 'Todos',     icon: 'library_music' },
    { value: 'cifra',  label: 'Com Cifra', icon: 'music_note' },
    { value: 'letra',  label: 'Com Letra', icon: 'article' },
    { value: 'video',  label: 'Com Vídeo', icon: 'play_circle' },
  ];

  ngOnInit() {
    this.louvoresFiltrados$ = combineLatest([
      this.louvorService.getLouvores(),
      this.busca$.pipe(debounceTime(200), distinctUntilChanged()),
      this.tema$,
      this.recurso$,
    ]).pipe(
      map(([louvores, busca, tema, recurso]) => {
        const termo = busca.trim().toLowerCase();

        return louvores.filter(l => {
          // Filtro de texto
          const matchBusca = !termo ||
            l.titulo.toLowerCase().includes(termo) ||
            l.artista.toLowerCase().includes(termo);

          // Filtro de tema
          const matchTema = tema === 'todos' || l.tema === tema;

          // Filtro de recurso
          const matchRecurso =
            recurso === 'todos' ||
            (recurso === 'cifra' && !!l.linkCifra) ||
            (recurso === 'letra' && !!l.linkLetra) ||
            (recurso === 'video' && !!l.linkYoutube);

          return matchBusca && matchTema && matchRecurso;
        }).sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR', { sensitivity: 'base' }));
      })
    );
  }

  onBuscaChange(valor: string) {
    this.busca$.next(valor);
  }

  setFiltroTema(tema: FiltroTema) {
    this.filtroTema = tema;
    this.tema$.next(tema);
  }

  setFiltroRecurso(recurso: FiltroRecurso) {
    this.filtroRecurso = recurso;
    this.recurso$.next(recurso);
  }

  limparBusca() {
    this.termoBusca = '';
    this.busca$.next('');
  }

  limparFiltros() {
    this.termoBusca = '';
    this.filtroTema = 'todos';
    this.filtroRecurso = 'todos';
    this.busca$.next('');
    this.tema$.next('todos');
    this.recurso$.next('todos');
  }

  trackById(index: number, louvor: Louvor): string {
    return louvor.id ?? String(index);
  }
}
