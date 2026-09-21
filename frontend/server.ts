import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT ?? 4174);

  app.use(express.json());

  const backendUrl = (process.env.BACKEND_URL ?? 'http://127.0.0.1:8001').replace(/\/$/, '');

  // Keep browser requests same-origin while FastAPI remains the API and database owner.
  app.use('/api/v1', async (req, res) => {
    try {
      const hasBody = !['GET', 'HEAD'].includes(req.method);
      const response = await fetch(`${backendUrl}${req.originalUrl}`, {
        method: req.method,
        headers: req.is('application/json') ? { 'Content-Type': 'application/json' } : undefined,
        body: hasBody ? JSON.stringify(req.body) : undefined,
      });
      const contentType = response.headers.get('content-type');
      if (contentType) res.type(contentType);
      res.status(response.status).send(await response.text());
    } catch {
      res.status(502).json({ detail: 'Saral AI backend is unavailable.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '::1', () => {
    console.log(`Saral AI Server active on http://localhost:${PORT}`);
  });
}

startServer();
