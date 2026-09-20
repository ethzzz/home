import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** 仓库根目录（ESM 下没有 __dirname，用 import.meta.url 推导） */
const rootDir = fileURLToPath(new URL('.', import.meta.url));

/**
 * 多页应用（MPA）：index.html = 个人主页（项目 / 文章），tools.html = 工具页。
 * 两个入口都是真实静态文件，nginx 无需 SPA 回退（try_files $uri $uri/ =404 即可）。
 */
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        index: resolve(rootDir, 'index.html'),
        tools: resolve(rootDir, 'tools.html'),
      },
    },
  },
});
