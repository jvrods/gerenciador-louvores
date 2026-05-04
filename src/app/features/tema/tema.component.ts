import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LouvorService } from '../../core/services/louvor.service';
import { Louvor } from '../../core/models/louvor.model';
import { LouvorCardComponent } from '../../shared/components/louvor-card/louvor-card.component';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-tema',
  standalone: true,
  imports: [CommonModule, RouterLink, LouvorCardComponent],
  template: `
    <header class="header">
      <div class="container header-content">
        <a routerLink="/" class="back-btn"><span class="material-icons">arrow_back</span></a>
        <h1>Culto: {{ temaNome }}</h1>
        <div style="width: 24px;"></div> <!-- spacer -->
      </div>
    </header>

    <main class="container">
      <div class="louvores-list">
        <app-louvor-card *ngFor="let louvor of louvores$ | async" [louvor]="louvor"></app-louvor-card>
      </div>
      
      <div *ngIf="(louvores$ | async)?.length === 0" class="empty-state">
        <span class="material-icons" style="font-size: 64px; color: rgba(255,255,255,0.2); margin-bottom: 20px;">queue_music</span>
        <h3>Nenhum louvor cadastrado</h3>
        <p>Ainda não há músicas para o culto de {{ temaNome }}.</p>
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
    .back-btn {
      color: white;
      display: flex;
      align-items: center;
      text-decoration: none;
    }
    .louvores-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted);
    }
    .empty-state h3 {
      color: var(--text-color);
      margin-bottom: 10px;
    }
  `]
})
export class TemaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private louvorService = inject(LouvorService);

  temaNome: string = '';
  louvores$!: Observable<Louvor[]>;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.temaNome = params.get('nome') || '';
      
      this.louvores$ = this.louvorService.getLouvores().pipe(
        map(louvores => louvores.filter(l => l.tema === this.temaNome))
      );
    });
  }
}
