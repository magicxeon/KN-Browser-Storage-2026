import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Configure development proxy and port using loaded environment variables
export default defineConfig(({ mode }) => {
  // Load env variables from frontend/.env
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.VITE_PORT) || 5173;
  const target = env.VITE_API_URL || 'http://localhost:7400';

  return {
    plugins: [react()],
    server: {
      port: port,
      proxy: {
        '/api': {
          target: target,
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy Error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to Backend:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from Backend:', proxyRes.statusCode, req.url);
            });
          }
        }
      }
    }
  };
});
