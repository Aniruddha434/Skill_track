// Vercel Serverless Function: Gemini API Proxy
// Forwards requests to the Gemini proxy, bypassing CORS issues.
// Handles: /api/gemini-proxy and /api/gemini-proxy/[...path]

export default async function handler(req, res) {
  // Build the target URL
  // req.url will be like /api/gemini-proxy/models/gemini-3.1-pro-preview:generateContent?...
  const proxyPath = req.url.replace(/^\/api\/gemini-proxy/, '');
  const targetUrl = `https://kotproxy.lewds.dev/google/v1beta${proxyPath}`;

  // Forward the request
  try {
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
    };

    // Forward auth headers
    if (req.headers['x-goog-api-key']) {
      headers['x-goog-api-key'] = req.headers['x-goog-api-key'];
    }
    if (req.headers['authorization']) {
      headers['Authorization'] = req.headers['authorization'];
    }

    const fetchOptions = {
      method: req.method,
      headers,
    };

    // Forward body for POST/PUT/PATCH
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);

    // Forward response headers
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    res.status(response.status);

    // Stream the response body
    const data = await response.text();
    res.send(data);
  } catch (error) {
    console.error('Gemini proxy error:', error);
    res.status(502).json({ error: 'Proxy request failed', details: error.message });
  }
}
