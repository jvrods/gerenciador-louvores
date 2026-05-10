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
  private readonly CACHE_PREFIX = 'gl_letra_';
  private readonly CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

  /**
   * Busca a letra usando a API pública lyrics.ovh (sem proxy, sem CORS).
   * Fallback: retorna link para o site original.
   */
  async buscarLetra(artista: string, titulo: string, urlOrigem: string): Promise<ConteudoMusica> {
    const cacheKey = `${artista}::${titulo}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artista)}/${encodeURIComponent(titulo)}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });

      if (response.ok) {
        const data = await response.json();
        if (data.lyrics && data.lyrics.trim().length > 10) {
          const html = `<pre class="letra-pre">${this.limparLetra(data.lyrics)}</pre>`;
          const conteudo: ConteudoMusica = { html, fonte: 'lyrics.ovh', urlOrigem };
          this.salvarNoCache(cacheKey, conteudo);
          return conteudo;
        }
      }
    } catch (e) {
      console.warn('[LetraProxy] lyrics.ovh falhou:', e);
    }

    // Não encontrou — retorna mensagem com link para site original
    return {
      html: `
        <div style="text-align:center; padding: 20px 0; color: var(--text-muted);">
          <span class="material-icons" style="font-size:48px; opacity:0.3; display:block; margin-bottom:12px;">search_off</span>
          <p>Letra não encontrada automaticamente para<br><strong style="color:var(--text-color)">"${titulo}"</strong>.</p>
          <p style="font-size:13px; margin-top:8px;">Use o link abaixo para ver no site original.</p>
        </div>`,
      fonte: 'não encontrado',
      urlOrigem,
    };
  }

  private limparLetra(texto: string): string {
    return texto
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n') // máximo 2 linhas em branco seguidas
      .trim();
  }

  private getFromCache(key: string): ConteudoMusica | null {
    try {
      const cacheKey = this.CACHE_PREFIX + btoa(encodeURIComponent(key));
      const item = localStorage.getItem(cacheKey);
      if (!item) return null;
      const { conteudo, timestamp } = JSON.parse(item);
      if (Date.now() - timestamp > this.CACHE_TTL_MS) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      return conteudo;
    } catch {
      return null;
    }
  }

  private salvarNoCache(key: string, conteudo: ConteudoMusica): void {
    try {
      const cacheKey = this.CACHE_PREFIX + btoa(encodeURIComponent(key));
      localStorage.setItem(cacheKey, JSON.stringify({ conteudo, timestamp: Date.now() }));
    } catch { /* localStorage cheio */ }
  }
}
