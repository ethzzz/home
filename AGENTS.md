# home —— 个人主页门户（Vite + React + TS）

> 本文件只写「本仓特有、不知道就会出错」的信息。完整技术栈、目录树、全仓库索引与提交规范见本仓 `README.md`；全局信息见根 `../AGENTS.md`。

## 定位
占根路径 `/` 的个人主页门户。**Vite 8 + React 19 + TypeScript 7 的多页应用（MPA）**，全屏「左竖直 tab / 右内容」布局。

> ⚠️ **这已不是「三文件纯静态站」**。v1 时代是三文件（`index.html`/`style.css`/`main.js`）+ `scp` 同步，**已经作废**。现在有完整构建链，且服务器有 git 工作副本。

| 项 | 值 |
|---|---|
| 入口 1 | `index.html` → `src/main.tsx`，个人主页（项目 / 文章） |
| 入口 2 | `tools.html` → `src/tools.tsx`，工具页 |
| 本地镜像 | `E:\code\NoteLab\home` |
| 服务器源码 | `/root/home`（**git 工作副本**，非 scp 同步） |
| 部署产物 | `/var/www/home`（只放 dist 内容） |
| 线上入口 | http://117.72.32.87/ 与 http://117.72.32.87/tools.html |
| GitHub | `git@github.com:ethzzz/home.git`（main） |

## 构建与发布（本地改 → 服务器从 git 同步）
```bash
# 本地自检
npm run build          # tsc --noEmit && vite build → dist/

# 本地：改完提交推送 → 服务器：同步 + 构建 + 发布，一条命令
git push origin main
ssh myapp "/root/notelab-java/ops/sync-deploy.sh home"
```
- 脚本会**先备份** `/var/www/home` 到 `/root/backups/home-static-<时间戳>`，再清空回填 `dist/`、`chmod -R a+rX`（这几步已收进脚本，不用再手敲）。完整行为与参数见根 `AGENTS.md`「开发流程」。
- **不要在 `/root/home` 里手改代码**——服务器是只读部署目标；脚本发现工作区脏会直接拒绝执行。
- 纯静态，**没有 pm2 进程**，nginx 无需改动；因此脚本对 home 只发布不重启、也不做端口探活。
- 回滚：`rm -rf /var/www/home && cp -r /root/backups/home-static-<时间戳> /var/www/home`。
- 本地镜像用 `git pull origin main` 同步源码，**不要**用 `docs/sync-from-server.ps1`（该脚本已随流程变更作废）。

## 改内容先看这里
站点是**数据驱动**，改文案优先改数据而不是改组件：
- `src/data/site.ts` —— 站点元信息与联系方式
- `src/data/projects.ts` —— 项目导航卡（各仓对应关系也在这里）
- `src/data/tools.ts` —— 工具页卡片

文章列表由前端拉 `/blog/rss.xml` 解析（`src/lib/rss.ts`）。博客源码在 `E:\code\astro-blog-fuwari`，**不在本仓**。

## 约束（改之前必读）
- **必须保持 MPA 双入口**：`vite.config.ts` 的 `rollupOptions.input` 里 index / tools 两个入口都要在。nginx 用 `try_files $uri $uri/ =404`，**没有 SPA 回退**——真实静态文件缺失就是 404。
- `base: '/'` 不要改（本站占根路径）。
- **样式只用 CSS Modules + 全局设计令牌**，不引入 UI 组件库（antd / mui 一律不要）；图标用内联 SVG（`src/components/Icons.tsx`）。
- `build.target` / `cssTarget` 的保守降级**不要放宽**：它阻止 lightningcss 把 `@media (max-width: 860px)` 改写成 Safari < 16.4 不认的 MQ4 区间语法，一旦被改，窄屏抽屉与单列降级会全部失效。`color-mix()` 已在各 CSS 就地补了等价回退声明。
