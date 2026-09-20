# home — 个人主页 & 全仓库管理索引

**Vite + React + TypeScript** 多页应用（MPA），占根路径 `/`，部署在服务器 `/var/www/home`。
全屏「左竖直 tab / 右内容」布局：`index.html` 为个人主页（项目 / 文章），`tools.html` 为独立工具页（按分类左 tab）。
本 README 同时充当 **NoteLab 全部仓库的索引与管理入口**：一处看清各仓角色、路径、端口/路由与 GitHub 地址，并统一提交规范。

- 线上入口：`http://117.72.32.87/`（工具页 `http://117.72.32.87/tools.html`）
- GitHub：`https://github.com/ethzzz/home`（Private，分支 `main`）
- 本地：`e:\code\NoteLab\home`　服务器 git 工作副本：`/root/home`（构建产物 → `/var/www/home`）

## 技术栈

| 项 | 选型 | 说明 |
|---|---|---|
| 构建 | **Vite 8** | 多页构建（`build.rollupOptions.input` 含 index/tools 两个入口），`base: '/'` |
| 框架 | **React 19** | 函数组件 + Hooks，`StrictMode` |
| 语言 | **TypeScript 7**（`strict`） | 全量类型标注，`tsc --noEmit` 参与构建 |
| 样式 | **CSS Modules** + 全局设计令牌 | 无 UI 组件库（不引入 antd/mui），保持轻量 |
| 图标 | 内联 SVG（`src/components/Icons.tsx`） | 无图标依赖 |

## 目录结构

```
home/
├── index.html            # 入口 1：个人主页（挂载 /src/main.tsx）
├── tools.html            # 入口 2：工具页（挂载 /src/tools.tsx）
├── vite.config.ts        # 多页 rollupOptions.input + base '/'
├── tsconfig.json         # strict / verbatimModuleSyntax / noUnusedLocals …
├── public/
│   └── favicon.svg       # 站点图标（原样拷贝到 dist 根）
└── src/
    ├── main.tsx          # index 入口：createRoot + <App/>
    ├── tools.tsx         # tools 入口：createRoot + <ToolsPage/>
    ├── App.tsx           # 主页两个 tab（项目 / 文章）+ 工具页入口
    ├── ToolsPage.tsx     # 工具页：分类 tab（全部/AI/游戏/效率/开发运维）
    ├── components/
    │   ├── TabLayout.tsx        # 全屏左 tab / 右内容外壳（两页共用）
    │   ├── TabLayout.module.css
    │   ├── ProjectsTab.tsx      # hero 个人介绍 + 项目卡网格
    │   ├── ProjectsTab.module.css
    │   ├── BlogTab.tsx          # RSS 最新文章（加载中 / 空态 / 失败兜底）
    │   ├── BlogTab.module.css
    │   ├── ToolsGrid.tsx        # 工具卡网格（占位条目渲染为不可点击）
    │   ├── ToolsGrid.module.css
    │   └── Icons.tsx            # 内联 SVG 图标集
    ├── data/
    │   ├── site.ts       # 品牌 / 联系方式 / 技能标签 / 页面路径
    │   ├── projects.ts   # 项目卡数据（id/emoji/name/desc/href/cta/repo/tone）
    │   └── tools.ts      # 工具分类 + TOOLS 数组 + 查询工具函数
    ├── lib/
    │   ├── rss.ts        # RSS 拉取/解析/日期格式化/链接白名单
    │   └── hooks.ts      # useLatestPosts、useHashTab
    ├── styles/
    │   └── global.css    # 设计令牌（配色/字体/圆角/阴影）+ reset + 环境背景
    └── vite-env.d.ts     # vite/client 类型 + *.module.css 声明
```

## 多页结构（MPA，无 SPA 路由）

| 页面 | 路径 | 入口 | 左 tab | 右内容 |
|---|---|---|---|---|
| 个人主页 | `/`（`index.html`） | `src/main.tsx` | 项目、文章 | hero + 项目卡 / RSS 文章列表 |
| 工具页 | `/tools.html` | `src/tools.tsx` | 全部、AI 应用、游戏、效率工具、开发运维 | 该分类下的工具卡 |

两页通过 URL hash 记忆当前 tab（如 `/#blog`、`/tools.html#ai`），刷新后停留在原 tab。
**nginx 无需 SPA 回退**：`index.html` 与 `tools.html` 都是真实静态文件，现有 `try_files $uri $uri/ =404` 即可。

## 本地开发

```bash
npm install     # 安装依赖
npm run dev     # 启动 Vite 开发服务器（默认 http://localhost:5173）
```

开发服务器同样按多页服务：`/` 打开主页，`/tools.html` 打开工具页。
本地调试 RSS 需要 `/blog/rss.xml`；若本机没有博客，可在 `vite.config.ts` 临时加 `server.proxy`
把 `/blog` 代理到线上（例如 `http://117.72.32.87`），否则「文章」tab 会走失败兜底并提示「直接去博客看看 →」。

## 类型检查与构建

```bash
npm run typecheck   # tsc --noEmit
npm run build       # tsc --noEmit && vite build（类型检查失败即中断，不产出 dist）
npm run preview     # 本地预览 dist 产物
```

`npm run build` 产出：

```
dist/
├── index.html            # 主页（引用 /assets/index-*.js + 共享 global-*.{js,css}）
├── tools.html            # 工具页（引用 /assets/tools-*.js + 共享 global-*.{js,css}）
├── favicon.svg
└── assets/
    ├── global-*.js       # React + 两页共享运行时代码
    ├── global-*.css      # 全局设计令牌 + 共享布局（TabLayout）样式
    ├── index-*.js / index-*.css
    └── tools-*.js / tools-*.css
```

## 部署（服务器）

产物部署到 `/var/www/home`，**nginx 配置无需改动**。

```bash
# 1. 备份线上（可回滚）
cp -r /var/www/home /root/backups/home-static-$(date +%Y%m%d-%H%M%S)

# 2. 构建
cd /root/home && npm install && npm run build

# 3. 部署：清掉旧静态文件后同步 dist（保持 nginx 可读权限）
find /var/www/home -mindepth 1 -maxdepth 1 -exec rm -rf {} +
cp -r /root/home/dist/. /var/www/home/
chmod -R a+rX /var/www/home

# 4. 验证（都应返回 200）
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1/
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1/tools.html
curl -sS http://127.0.0.1/ | grep -o '<div id="root"></div>'
```

回滚：`rm -rf /var/www/home && cp -r /root/backups/home-static-<时间戳> /var/www/home`。

> **重要**：旧的纯静态站没有 git 服务器镜像，靠 `scp` 同步；**改造为 Vite 工程后，服务器 `/root/home` 就是 git 工作副本**，
> 改动 → 提交推送 → 在 `/root/home` 构建 → 部署 `dist/` 到 `/var/www/home`。本地镜像 `e:\code\NoteLab\home` 用 `git pull origin main` 同步源码。

## 内容与行为约定

- **项目 tab**：数据在 `src/data/projects.ts`，新增项目卡只需往 `PROJECTS` 追加一条（含 `repo` 与 `tone` 强调色）。
  当前 6 项：游戏中心 `/games`、博客 `/blog`、AI 试验场 `/ailab/`、管理后台 `/admin`、雷霆战机 `/thunder/`、幸存者割草 `/vs`。
- **文章 tab**：`fetch('/blog/rss.xml')` → `DOMParser` 解析 `<item>` → 展示最新 5 篇（标题 / 日期 / 摘要 / 链接）。
  三态齐全：加载中骨架、空态（「博客还没有文章」）、失败兜底（「文章列表加载失败 · 直接去博客看看 →」+ 重新加载按钮）。
  **安全**：标题/日期/摘要一律作为 React 文本子节点渲染（自动转义），**不使用 `dangerouslySetInnerHTML`**；
  `href` 经 `sanitizeLink` 协议白名单（仅 http(s) 与站内相对路径，其余回退 `/blog`），拦截 `javascript:` 等注入。
- **工具页**：数据在 `src/data/tools.ts`（`CATEGORIES` + `TOOLS`，字段 `cat/emoji/name/desc/href`）。
  `href` 为 `'#'`（`PLACEHOLDER_HREF`）的条目视为**未上线**：渲染为 `<div>` 而非 `<a>`（点击不跳转），
  标注「敬请期待 / 未上线」。当前占位 4 项：小说工坊、每日巡检、SSO 统一登录、自动备份。
- **品牌与联系方式**：`src/data/site.ts`。GitHub `https://github.com/ethzzz`（`target=_blank rel=noreferrer`）、
  邮箱 `mailto:ethzzz@users.noreply.github.com`、版权 `© 2026 ethzzz · Powered by 手搓与好奇心`。
- **视觉**：设计令牌集中在 `src/styles/global.css`（配色 / 字体 / 圆角 / 阴影 / 动效曲线），
  浅色为主并 `prefers-color-scheme: dark` 自动深色；尊重 `prefers-reduced-motion`。
- **响应式**：≤860px 侧栏降级为抽屉（顶栏汉堡唤出，Esc / 遮罩关闭）；卡片网格 `auto-fill` 自适应，窄屏单列。

## 仓库总览（8 个业务仓，均在 GitHub `ethzzz` 下、Private、分支 `main`）

| 仓 | 角色 / 技术栈 | 本地路径 | 服务器路径 | 端口 / 路由 | GitHub |
|---|---|---|---|---|---|
| **home** | 个人主页门户（Vite + React + TS，MPA：index/tools） | `home/` | `/root/home`（源码）→ `/var/www/home`（仅产物） | `/`、`/tools.html` | ethzzz/home |
| **notelab-java** | 后端 API（Spring Boot + MyBatis-Plus）；**运维脚本单一真相源** `ops/daily-iteration/` | `notelab-java/`（镜像） | `/root/notelab-java` | `:8001`（`/api/*`，无独立前端路由） | ethzzz/notelab-java |
| **notelab-c** | C 端前端（Next.js，basePath `/games`） | `notelab-c/`（镜像） | `/root/notelab-c` | `:3010` → `/games` | ethzzz/notelab-c |
| **notelab-b** | B 端前端（Next.js + antd，basePath `/admin`） | `notelab-b/`（镜像） | `/root/notelab-b` | `:3020` → `/admin` | ethzzz/notelab-b |
| **ai-lab** | AI 试验场（FastAPI）：聊天 / TTS / RAG / 工具 / 简历优化 | `ai-lab/`（**文件镜像，git 源在服务器**） | `/root/ai-lab` | `:8002` → `/ailab/` | ethzzz/ai-lab |
| **thunder-h5** | 雷霆战机（H5 游戏） | 无本地镜像 | `/root/thunder-h5` | → `/thunder/` | ethzzz/thunder-h5 |
| **vs-h5** | 吸血鬼幸存者（H5 游戏） | 无本地镜像 | `/root/vs-h5` | → `/vs` | ethzzz/vs-h5 |
| **blog** | 个人博客（Astro） | 源码在本机 `E:\code\astro-blog-fuwari` | `/var/www/blog`（仅产物） | → `/blog`（含 `/blog/rss.xml`） | ethzzz/blog |

> 说明：本地 `e:\code\NoteLab` 根目录与各仓父目录**不是** git 仓；各仓平级独立，无父仓 / submodule / manifest。生产代码在服务器，本地目录多为阅读对比用的镜像。

## 主页导航 → 仓库映射

home 主页是**用户侧门户**，「项目」tab 卡片与工具页菜单链接到以下仓：

| 主页链接 | 路由 | 关联仓 | 位置 |
|---|---|---|---|
| 游戏中心 / TRPG 跑团 / 尖塔爬塔 / TRPG 剧本生成 | `/games` | notelab-c | 项目 tab + 工具页 |
| 管理后台 / 低代码设计器 / RBAC 权限体系 | `/admin` | notelab-b | 项目 tab + 工具页 |
| AI 试验场 / 英语发音教练 | `/ailab/` | ai-lab | 项目 tab + 工具页 |
| 雷霆战机 | `/thunder/` | thunder-h5 | 项目 tab + 工具页 |
| 幸存者割草 | `/vs` | vs-h5 | 项目 tab + 工具页 |
| 博客（文章 tab 拉取 RSS 最新文章） | `/blog` | blog | 项目 tab + 文章 tab + 工具页 |

未直接关联：**notelab-java**（纯后端，无前端入口，作为 `/games`、`/admin` 的 API 提供方）。
工具页中仍为占位（`href="#"`，尚未接线，标注「敬请期待 / 未上线」）：小说工坊、每日巡检、SSO 统一登录、自动备份。

## 同步 / 部署约定

- **业务代码生产在服务器**：改动在服务器进行 → 构建（`npm run build` / `mvn -DskipTests package`）→ `pm2 restart <进程>`（纯静态站无需 pm2）。
- **GitHub 对齐**：服务器 `/root/<仓>` 与本地镜像各自 `git pull/push origin main`；`scp` / `docs/sync-from-server.ps1` 仅用于单文件热部署或未入库的临时传输。
- **ai-lab 特例**：git 源在服务器，本地 `ai-lab/` 只是文件镜像（无 `.git`），提交/推送在服务器执行。
- **home 特例**：服务器 `/root/home` 为 git 工作副本，`npm run build` 后把 `dist/` 内容部署到 `/var/www/home`（`node_modules/`、`dist/` 均不入库）。
- **blog 特例**：无 git 服务器镜像——本机构建后 `scp` 产物到 `/var/www/blog`。
- **SSH 纪律**：命令保持 `ssh -n myapp "..."` 单段形式，外层不加管道 / `;` / 重定向 / `$()`。

## Git 提交规范（所有仓库通用）

自 2026-09-20 起，推送到各仓的 commit message 统一遵循：

```
<type>: <一句话描述本次改动>

【产生原因】：<为什么要做这个改动：需求背景 / bug 现象与根因>
【解决方案】：<怎么解决的：技术方案、关键改动点>
【影响范围】：<可选：涉及的模块/页面/接口，方便回归测试>
```

`<type>` 取值：

| type | 含义 |
|---|---|
| `feat` | 新功能 / 新应用 |
| `fix` | 缺陷修复 |
| `docs` | 文档（README / AGENTS / 注释类） |
| `refactor` | 重构（不改外部行为） |
| `perf` | 性能优化 |
| `style` | 样式/格式调整（不影响逻辑） |
| `test` | 测试相关 |
| `build` | 构建/依赖/打包 |
| `ci` | CI/CD 配置 |
| `chore` | 杂项（脚本、配置、清理） |
| `revert` | 回滚提交 |

约定要点：标题用祈使句、首行不超 ~72 字；正文三段固定用中文方括号小标题；【影响范围】可省略但涉及接口/页面变更时建议写明，便于回归。

## 服务器其它目录（非业务托管仓，仅备注）

`/root/myapp`（旧前端，已停）、`/root/notelab`（旧 Python 版，已停）、`/root/kokoro-tts`（本地 TTS 服务）、`/root/ops`（巡检报告与日志运行时目录）、`/root/backups`（数据库备份 + 部署前静态站备份）、`/root/openclaw`（服务器 git 仓，未配 origin，非业务）。
