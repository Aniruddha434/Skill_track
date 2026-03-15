// Vercel Serverless Function: Jina Reader API Proxy
// Forwards requests to https://r.jina.ai, bypassing CORS issues.
// Handles: /api/jina-proxy/[url]

export default async function handler(req, res) {
  // req.url will be like /api/jina-proxy/https://www.linkedin.com/jobs/...
  const proxyPath = req.url.replace(/^\/api\/jina-proxy\//, '');

  if (!proxyPath || proxyPath === '/') {
    return res.status(400).json({ error: 'Missing URL to scrape' });
  }

  const targetUrl = `https://r.jina.ai/${proxyPath}`;

  try {
    const headers = {
      'Accept': 'application/json',
      'X-Return-Format': 'json',
    };

    // Forward authorization header
    if (req.headers['authorization']) {
      headers['Authorization'] = req.headers['authorization'];
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    res.status(response.status);
    const data = await response.text();
    res.send(data);
  } catch (error) {
    console.error('Jina proxy error:', error);
    res.status(502).json({ error: 'Proxy request failed', details: error.message });
  }
}
