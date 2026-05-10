import { Injectable } from '@angular/core';

export interface ConteudoMusica {
  html: string;
  fonte: string;
  urlOrigem: string;
}

@Injectable({
  providedIn: 'root'
})
export class LetraProxyService {
  private readonly CACHE_PREFIX = 'gl_conteudo_';
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

  async buscarConteudo(url: string): Promise<ConteudoMusica> {
    // 1. Verificar cache local
    const cached = this.getFromCache(url);
    if (cached) return cached;

    // 2. Chamar o proxy Vercel
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(err.error || `Erro ${response.status}`);
    }

    const { html } = await response.json();

    // 3. Extrair conteúdo relevante do HTML
    const conteudo = this.extrairConteudo(html, url);

    // 4. Salvar no cache
    this.salvarNoCache(url, conteudo);

    return conteudo;
  }

  private extrairConteudo(html: string, url: string): ConteudoMusica {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove elementos indesejados
    doc.querySelectorAll('script, style, iframe, noscript, header, footer, nav, aside, .adv, [class*="banner"], [class*="pub"], [id*="ad"]')
      .forEach(el => el.remove());

    const hostname = new URL(url).hostname;
    let htmlExtraido = '';

    if (hostname.includes('letras.mus.br')) {
      htmlExtraido = this.extrairLetrasMusBr(doc);
    } else if (hostname.includes('cifraclub.com.br')) {
      htmlExtraido = this.extrairCifraClub(doc);
    }

    return {
      html: htmlExtraido || '<p style="color: var(--text-muted);">Não foi possível extrair o conteúdo desta página.</p>',
      fonte: hostname,
      urlOrigem: url,
    };
  }

  private extrairLetrasMusBr(doc: Document): string {
    const seletores = ['.cnt-letra', 'article.cnt-letra', '[class*="letra-cnt"]', '[itemprop="description"]'];
    for (const sel of seletores) {
      const el = doc.querySelector(sel);
      if (el && el.textContent?.trim()) {
        return el.innerHTML;
      }
    }
    return '';
  }

  private extrairCifraClub(doc: Document): string {
    const seletores = ['.cifra_cnt', '[class*="cifra-cnt"]', 'article pre', 'pre'];
    for (const sel of seletores) {
      const el = doc.querySelector(sel);
      if (el && el.textContent?.trim()) {
        const texto = el.textContent || '';
        return `<pre class="cifra-pre">${texto}</pre>`;
      }
    }
    return '';
  }

  private getFromCache(url: string): ConteudoMusica | null {
    try {
      const key = this.CACHE_PREFIX + btoa(encodeURIComponent(url));
      const item = localStorage.getItem(key);
      if (!item) return null;

      const { conteudo, timestamp } = JSON.parse(item);
      if (Date.now() - timestamp > this.CACHE_TTL_MS) {
        localStorage.removeItem(key);
        return null;
      }
      return conteudo;
    } catch {
      return null;
    }
  }

  private salvarNoCache(url: string, conteudo: ConteudoMusica): void {
    try {
      const key = this.CACHE_PREFIX + btoa(encodeURIComponent(url));
      localStorage.setItem(key, JSON.stringify({ conteudo, timestamp: Date.now() }));
    } catch {
      // localStorage cheio ou indisponível — ignora silenciosamente
    }
  }
}
