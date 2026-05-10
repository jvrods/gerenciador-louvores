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
    const cached = this.getFromCache(url);
    if (cached) return cached;

    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(err.error || `Erro ${response.status}`);
    }

    const { html, debug } = await response.json();

    // Log de diagnóstico — ver no console do browser
    if (debug) {
      console.group('[LetraProxy] Debug');
      console.log('Título da página:', debug.title);
      console.log('Classes encontradas:', debug.classes);
      console.log('Preview do texto:', debug.bodyPreview);
      console.groupEnd();
    }

    const conteudo = this.extrairConteudo(html, url, debug?.bodyPreview);
    this.salvarNoCache(url, conteudo);
    return conteudo;
  }

  private extrairConteudo(html: string, url: string, bodyPreview?: string): ConteudoMusica {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove elementos que poluem o conteúdo
    doc.querySelectorAll(
      'script, style, iframe, noscript, header, footer, nav, aside, ' +
      '.adv, .ad, [class*="banner"], [class*="pub"], [id*="ad"], ' +
      '[class*="social"], [class*="share"], [class*="related"], [class*="comment"]'
    ).forEach(el => el.remove());

    const hostname = new URL(url).hostname;
    let htmlExtraido = '';

    if (hostname.includes('letras.mus.br')) {
      htmlExtraido = this.extrairLetrasMusBr(doc);
    } else if (hostname.includes('cifraclub.com.br')) {
      htmlExtraido = this.extrairCifraClub(doc);
    }

    // Fallback genérico — tenta encontrar o maior bloco de texto da página
    if (!htmlExtraido) {
      htmlExtraido = this.extrairFallback(doc);
    }

    return {
      html: htmlExtraido
        || (bodyPreview ? `<pre style="white-space:pre-wrap;font-size:13px;opacity:0.8">${bodyPreview}</pre><p style="font-size:11px;opacity:0.5;margin-top:12px">⚠️ Exibição parcial — use o link abaixo para ver completo.</p>` : '<p>Não foi possível extrair o conteúdo desta página.</p>'),
      fonte: hostname,
      urlOrigem: url,
    };
  }

  private extrairLetrasMusBr(doc: Document): string {
    // Seletores em ordem de prioridade para letras.mus.br
    const seletores = [
      '.cnt-letra',
      'article.cnt-letra',
      '[class="cnt-letra"]',
      '[class*="cnt-letra"]',
      '.lyric-original',
      '.letra-original',
      '[class*="lyric"]',
      '[class*="letra"]',
      'article[itemprop="text"]',
      '[itemprop="text"]',
      'article[itemprop="description"]',
      '[itemprop="description"]',
      'article p',
    ];

    for (const sel of seletores) {
      const el = doc.querySelector(sel);
      if (el && el.textContent && el.textContent.trim().length > 100) {
        // Limpa atributos de estilo e classes desnecessárias
        this.limparAtributos(el);
        return el.innerHTML;
      }
    }
    return '';
  }

  private extrairCifraClub(doc: Document): string {
    const seletores = [
      '.cifra_cnt',
      '[class*="cifra-cnt"]',
      '[class*="cifra_cnt"]',
      'article pre',
      'pre',
      '[class*="cifra"]',
    ];

    for (const sel of seletores) {
      const el = doc.querySelector(sel);
      if (el && el.textContent && el.textContent.trim().length > 50) {
        const texto = el.textContent || '';
        return `<pre class="cifra-pre">${texto}</pre>`;
      }
    }
    return '';
  }

  // Fallback: encontra o maior bloco de parágrafos contínuos na página
  private extrairFallback(doc: Document): string {
    const candidates = doc.querySelectorAll('div, article, section, main');
    let best: Element | null = null;
    let bestLen = 0;

    candidates.forEach(el => {
      const paragraphs = el.querySelectorAll('p');
      if (paragraphs.length < 3) return;

      const text = Array.from(paragraphs)
        .map(p => p.textContent?.trim() || '')
        .join('\n');

      if (text.length > bestLen) {
        bestLen = text.length;
        best = el;
      }
    });

    if (best && bestLen > 150) {
      this.limparAtributos(best);
      return (best as Element).innerHTML;
    }
    return '';
  }

  private limparAtributos(el: Element): void {
    el.querySelectorAll('*').forEach(child => {
      child.removeAttribute('style');
      child.removeAttribute('class');
      child.removeAttribute('id');
    });
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
