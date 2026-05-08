import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container login-container">
      <div class="login-card">
        <h2>Acesso Restrito</h2>
        <p>Área para a equipe de louvor</p>

        <div *ngIf="error" class="error-msg">
          {{ error }}
        </div>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Usuário</label>
            <input type="text" id="username" [(ngModel)]="username" name="username" required>
          </div>
          <div class="form-group">
            <label for="password">Senha</label>
            <input type="password" id="password" [(ngModel)]="password" name="password" required>
          </div>
          <button type="submit" class="btn" style="width: 100%; margin-top: 10px;">Entrar</button>
        </form>
        <div style="text-align: center; margin-top: 15px;">
          <a routerLink="/" style="color: var(--primary-color); font-size: 14px;">Voltar para o site</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: var(--bg-gradient);
    }
    .login-card {
      background: var(--card-bg);
      padding: 30px;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 400px;
      color: var(--text-color);
    }
    .login-card h2 {
      margin-bottom: 5px;
      color: var(--text-color);
      text-align: center;
    }
    .login-card p {
      text-align: center;
      color: var(--text-muted);
      margin-bottom: 20px;
    }
    .error-msg {
      background: #f8d7da;
      color: #721c24;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 15px;
      font-size: 14px;
      text-align: center;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  private authService = inject(AuthService);

  async onSubmit() {
    try {
      this.error = '';
      // Adiciona um domínio fictício para que o Firebase aceite como e-mail
      const emailFormatado = `${this.username.trim()}@admin.com`;
      await this.authService.login(emailFormatado, this.password);
    } catch (e: any) {
      this.error = 'Usuário ou senha incorretos.';
    }
  }
}
