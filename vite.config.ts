import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Figma exports reference design assets through the `figma:asset/<file>`
// specifier. The matching PNGs live under `public/src/assets`, so resolve the
// import to that public URL (consistent with every other asset reference in
// the app, which uses runtime string paths served from `public/`).
function figmaAsset() {
  const PREFIX = 'figma:asset/';
  return {
    name: 'figma-asset',
    enforce: 'pre' as const,
    resolveId(id: string) {
      if (id.startsWith(PREFIX)) return '\0' + id;
    },
    load(id: string) {
      if (id.startsWith('\0' + PREFIX)) {
        const file = id.slice(('\0' + PREFIX).length);
        return `export default ${JSON.stringify('/src/assets/' + file)};`;
      }
    },
  };
}

export default defineConfig({
  plugins: [figmaAsset(), react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 2000,
  },
});
