export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: 'URL é obrigatória' });
  }

  // Valida e restringe os domínios permitidos (evita SSRF)
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'URL inválida' });
  }

  const allowedDomains = [
    'letras.mus.br',
    'www.letras.mus.br',
    'cifraclub.com.br',
    'www.cifraclub.com.br',
  ];

  if (!allowedDomains.includes(parsedUrl.hostname)) {
    return res.status(403).json({ error: 'Domínio não permitido' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        Referer: 'https://www.google.com.br/',
        DNT: '1',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res
        .status(502)
        .json({ error: `Falha ao buscar conteúdo: HTTP ${response.status}` });
    }

    const html = await response.text();

    // Debug info: título da página e primeiros elementos com classe
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const classMatches = [...html.matchAll(/class="([^"]{3,40})"/g)]
      .map(m => m[1])
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 30);

    return res.status(200).json({
      html,
      url,
      debug: {
        title: titleMatch?.[1] || 'sem título',
        classes: classMatches,
        bodyPreview: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 500),
      }
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Timeout ao buscar conteúdo (10s)' });
    }
    return res.status(500).json({ error: `Erro interno: ${error.message}` });
  }
}
