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
    /**
     * 保守的构建目标（兼容老浏览器）：
     * 1. 阻止 lightningcss 把 `@media (max-width: 860px)` 改写成 MQ4 区间语法
     *    `(width <= 860px)` —— Safari < 16.4 不识别，会导致窄屏侧栏抽屉与
     *    单列降级全部失效。
     * 2. color-mix()（Safari 16.2+）无法降级，已在各 CSS 中就地补写等价回退声明，
     *    老浏览器读到的是回退值，仅失去按项目 tone 的微调色。
     */
    target: ['es2020', 'chrome87', 'safari14', 'firefox78', 'edge88'],
    cssTarget: ['chrome87', 'safari14', 'firefox78', 'edge88'],
    rollupOptions: {
      input: {
        index: resolve(rootDir, 'index.html'),
        tools: resolve(rootDir, 'tools.html'),
      },
    },
  },
});
