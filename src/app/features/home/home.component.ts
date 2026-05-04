import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  `]
})
export class HomeComponent { }
