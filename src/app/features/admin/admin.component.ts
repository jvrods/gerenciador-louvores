import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LouvorService } from '../../core/services/louvor.service';
import { AuthService } from '../../core/services/auth.service';
import { Louvor } from '../../core/models/louvor.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="header">
      <div class="container header-content">
        <h1>Painel Admin</h1>
        <div>
          <button (click)="voltar()" class="btn" style="margin-right: 10px; background: transparent; border: 1px solid white;">Voltar</button>
          <button (click)="logout()" class="btn btn-danger">Sair</button>
        </div>
      </div>
    </header>

    <main class="container">
      <div class="admin-panel">
        <h2>{{ editando ? 'Editar Louvor' : 'Adicionar Novo Louvor' }}</h2>
        <form (ngSubmit)="salvarLouvor()">
          <div class="form-group">
            <label>Título</label>
            <input type="text" [(ngModel)]="novoLouvor.titulo" name="titulo" required>
          </div>
          
          <div class="form-group">
            <label>Artista</label>
            <input type="text" [(ngModel)]="novoLouvor.artista" name="artista" required>
          </div>

          <div class="form-group">
            <label>Tema/Culto</label>
            <select [(ngModel)]="novoLouvor.tema" name="tema" required>
              <option value="Ceia">Ceia</option>
              <option value="Primícias">Primícias</option>
              <option value="Missões">Missões</option>
              <option value="Culto Solene">Culto Solene</option>
            </select>
          </div>

          <div class="form-group">
            <label>Link do YouTube (Para gerar a capa automaticamente)</label>
            <input type="url" [(ngModel)]="novoLouvor.linkYoutube" name="linkYoutube" placeholder="https://www.youtube.com/watch?v=...">
          </div>

          <div class="form-group">
            <label>Link da Cifra (Redirecionamento)</label>
            <input type="url" [(ngModel)]="novoLouvor.linkCifra" name="linkCifra" required placeholder="https://...">
          </div>

          <div class="form-group">
            <label>Link da Letra (Opcional)</label>
            <input type="url" [(ngModel)]="novoLouvor.linkLetra" name="linkLetra" placeholder="https://...">
          </div>

          <div class="form-group">
            <label>Link do Spotify (Opcional)</label>
            <input type="url" [(ngModel)]="novoLouvor.linkSpotify" name="linkSpotify" placeholder="https://open.spotify.com/...">
          </div>

          <div class="form-group">
            <label>Link do YouTube Music (Opcional)</label>
            <input type="url" [(ngModel)]="novoLouvor.linkYoutubeMusic" name="linkYoutubeMusic" placeholder="https://music.youtube.com/...">
          </div>

          <div style="display: flex; gap: 10px;">
            <button type="submit" class="btn" style="flex-grow: 1;">{{ editando ? 'Atualizar Louvor' : 'Salvar Louvor' }}</button>
            <button type="button" class="btn btn-danger" *ngIf="editando" (click)="cancelarEdicao()">Cancelar</button>
          </div>
        </form>
      </div>

      <div class="lista-admin">
        <h2>Louvores Cadastrados</h2>
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Tema</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let louvor of louvores$ | async">
              <td>{{ louvor.titulo }}</td>
              <td>{{ louvor.tema }}</td>
              <td>
                <button (click)="editarLouvor(louvor)" class="btn" style="padding: 5px 10px; font-size: 12px; margin-right: 5px;">Editar</button>
                <button (click)="deletarLouvor(louvor.id!)" class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  `,
  styles: [`
    .header {
      background-color: var(--header-bg);
      color: white;
      padding: 15px 0;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .admin-panel {
      background: var(--card-bg);
      padding: 20px;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .lista-admin table {
      width: 100%;
      border-collapse: collapse;
      background: var(--card-bg);
      border-radius: 12px;
      overflow: hidden;
    }
    .lista-admin th, .lista-admin td {
      border: 1px solid var(--card-border);
      padding: 10px;
      text-align: left;
    }
    .lista-admin th {
      background: rgba(0,0,0,0.2);
    }
  `]
})
export class AdminComponent implements OnInit {
  private louvorService = inject(LouvorService);
  private authService = inject(AuthService);
  private router = inject(Router);

  louvores$!: Observable<Louvor[]>;
  editando = false;

  novoLouvor: Louvor = {
    titulo: '',
    artista: '',
    tema: 'Ceia',
    linkCifra: '',
    linkLetra: '',
    linkYoutube: '',
    linkSpotify: '',
    linkYoutubeMusic: ''
  };

  ngOnInit() {
    this.louvores$ = this.louvorService.getLouvores();
  }

  async salvarLouvor() {
    if (this.novoLouvor.titulo && this.novoLouvor.artista && this.novoLouvor.linkCifra) {
      if (this.editando && this.novoLouvor.id) {
        await this.louvorService.updateLouvor(this.novoLouvor);
        alert('Louvor atualizado com sucesso!');
      } else {
        await this.louvorService.addLouvor(this.novoLouvor);
        alert('Louvor adicionado com sucesso!');
      }
      this.cancelarEdicao();
    }
  }

  editarLouvor(louvor: Louvor) {
    this.novoLouvor = { ...louvor };
    this.editando = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao() {
    this.editando = false;
    this.novoLouvor = { titulo: '', artista: '', tema: 'Ceia', linkCifra: '', linkLetra: '', linkYoutube: '', linkSpotify: '', linkYoutubeMusic: '' };
  }

  async deletarLouvor(id: string) {
    if (confirm('Tem certeza que deseja excluir este louvor?')) {
      await this.louvorService.deleteLouvor(id);
    }
  }

  voltar() {
    this.router.navigate(['/']);
  }

  logout() {
    this.authService.logout();
  }
}
