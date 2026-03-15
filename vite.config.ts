import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/gemini-proxy': {
            target: 'https://kotproxy.lewds.dev',
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/api\/gemini-proxy/, '/google/v1beta'),
          },
          '/api/jina-proxy': {
            target: 'https://r.jina.ai',
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/api\/jina-proxy/, ''),
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_BASE_URL': JSON.stringify(env.GEMINI_BASE_URL),
        'process.env.GEMINI_MODEL': JSON.stringify(env.GEMINI_MODEL),
        'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
        'process.env.JINA_API_KEY': JSON.stringify(env.JINA_API_KEY),
        'process.env.SITE_URL': JSON.stringify(env.SITE_URL || ''),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
