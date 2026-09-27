import { defineConfig } from 'vite';
import { writeFileSync } from 'node:fs';

// Dev-only endpoint used by src/dev/og.js to save the generated share-card image into public/.
const saveOg = {
  name: 'save-og',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/__save-og', (req, res) => {
      const chunks = [];
      req.on('data', c => chunks.push(c));
      req.on('end', () => { writeFileSync('public/og.png', Buffer.concat(chunks)); res.end('saved'); });
    });
  },
};

export default defineConfig({ plugins: [saveOg] });
