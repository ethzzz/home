# home — 个人主页 & 全仓库管理索引

纯静态个人主页（`index.html` / `main.js` / `style.css`，无构建），占根路径 `/`，部署在服务器 `/var/www/home`。
本 README 同时充当 **NoteLab 全部仓库的索引与管理入口**：一处看清各仓角色、路径、端口/路由与 GitHub 地址，并统一提交规范。

- 线上入口：`http://117.72.32.87/`
- GitHub：`https://github.com/ethzzz/home`（Private，分支 `main`）
- 本地：`e:\code\NoteLab\home`　服务器：无 git 镜像，改后 `scp` 同步到 `/var/www/home`

## 仓库总览（8 个业务仓，均在 GitHub `ethzzz` 下、Private、分支 `main`）

| 仓 | 角色 / 技术栈 | 本地路径 | 服务器路径 | 端口 / 路由 | GitHub |
|---|---|---|---|---|---|
| **home** | 个人主页门户（纯静态） | `home/` | `/var/www/home`（仅产物） | `/` | ethzzz/home |
| **notelab-java** | 后端 API（Spring Boot + MyBatis-Plus）；**运维脚本单一真相源** `ops/daily-iteration/` | `notelab-java/`（镜像） | `/root/notelab-java` | `:8001`（`/api/*`，无独立前端路由） | ethzzz/notelab-java |
| **notelab-c** | C 端前端（Next.js，basePath `/games`） | `notelab-c/`（镜像） | `/root/notelab-c` | `:3010` → `/games` | ethzzz/notelab-c |
| **notelab-b** | B 端前端（Next.js + antd，basePath `/admin`） | `notelab-b/`（镜像） | `/root/notelab-b` | `:3020` → `/admin` | ethzzz/notelab-b |
| **ai-lab** | AI 试验场（FastAPI）：聊天 / TTS / RAG / 工具 / 简历优化 | `ai-lab/`（**文件镜像，git 源在服务器**） | `/root/ai-lab` | `:8002` → `/ailab/` | ethzzz/ai-lab |
| **thunder-h5** | 雷霆战机（H5 游戏） | 无本地镜像 | `/root/thunder-h5` | → `/thunder/` | ethzzz/thunder-h5 |
| **vs-h5** | 吸血鬼幸存者（H5 游戏） | 无本地镜像 | `/root/vs-h5` | → `/vs` | ethzzz/vs-h5 |
| **blog** | 个人博客（Astro） | 源码在本机 `E:\code\astro-blog-fuwari` | `/var/www/blog`（仅产物） | → `/blog`（含 `/blog/rss.xml`） | ethzzz/blog |

> 说明：本地 `e:\code\NoteLab` 根目录与各仓父目录**不是** git 仓；各仓平级独立，无父仓 / submodule / manifest。生产代码在服务器，本地目录多为阅读对比用的镜像。

## 主页导航 → 仓库映射

home 主页是**用户侧门户**，导航/项目卡/工具菜单链接到以下仓：

| 主页链接 | 路由 | 关联仓 |
|---|---|---|
| TRPG 剧本 / 跑团 / 爬塔肉鸽 | `/games` | notelab-c |
| 低代码设计器 / RBAC | `/admin` | notelab-b |
| AI 试验场 / 英语发音教练 | `/ailab/` | ai-lab |
| 雷霆战机 | `/thunder/` | thunder-h5 |
| 吸血鬼幸存者 | `/vs` | vs-h5 |
| 博客（首页拉取最新文章） | `/blog` | blog |

未直接关联：**notelab-java**（纯后端，无前端入口，作为 `/games`、`/admin` 的 API 提供方）。
主页中仍为占位（`href="#"`，尚未接线）：小说工坊、每日巡检、SSO 统一登录、自动备份。

## 同步 / 部署约定

- **业务代码生产在服务器**：改动在服务器进行 → 构建（`npm run build` / `mvn -DskipTests package`）→ `pm2 restart <进程>`。
- **GitHub 对齐**：服务器 `/root/<仓>` 与本地镜像各自 `git pull/push origin main`；`scp` / `docs/sync-from-server.ps1` 仅用于单文件热部署或未入库的临时传输。
- **ai-lab 特例**：git 源在服务器，本地 `ai-lab/` 只是文件镜像（无 `.git`），提交/推送在服务器执行。
- **home / blog 特例**：无 git 服务器镜像——home 改后 `scp` 到 `/var/www/home`；blog 本机构建后 `scp` 产物到 `/var/www/blog`。
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

`/root/myapp`（旧前端，已停）、`/root/notelab`（旧 Python 版，已停）、`/root/kokoro-tts`（本地 TTS 服务）、`/root/ops`（巡检报告与日志运行时目录）、`/root/backups`（数据库备份）、`/root/openclaw`（服务器 git 仓，未配 origin，非业务）。
