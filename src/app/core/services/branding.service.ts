import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

export interface BrandingConfig {
  appName: string;
  churchName: string;
  primaryColor: string;
  secondaryColor: string;
  headerBg: string;
  logoIcon: string;
}

@Injectable({
  providedIn: 'root'
})
export class BrandingService {
  private http = inject(HttpClient);
  private configSubject = new BehaviorSubject<BrandingConfig | null>(null);
  config$ = this.configSubject.asObservable();

  loadConfig() {
    return this.http.get<BrandingConfig>('assets/config/branding.json').pipe(
      tap(config => {
        this.configSubject.next(config);
        this.applyTheme(config);
      })
    );
  }

  private applyTheme(config: BrandingConfig) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', config.primaryColor);
    root.style.setProperty('--header-bg', config.headerBg);
    // Adicione outras variáveis CSS se necessário
    
    // Atualiza o título da página
    document.title = config.appName;
  }
}
