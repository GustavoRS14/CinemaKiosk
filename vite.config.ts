import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [react(), svgr({ include: ['**/*.svg', '**/*.svg?react'] })],
  server: {
    watch: {
      ignored: ['**/Assets/** - Copy/**', '**/* - Copy/**']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@icons': path.resolve(__dirname, './outputs/Assets/Icons'),
      '@asset-icons': path.resolve(__dirname, './Assets/Icons'),
      '@images': path.resolve(__dirname, './outputs/Assets/Images'),
      '@project-images': path.resolve(__dirname, './Assets/Images'),
      '@illustrations': path.resolve(__dirname, './Assets/Illustrations'),
      '@components': path.resolve(__dirname, './outputs/Components')
    }
  }
});
