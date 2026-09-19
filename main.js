// 个人主页：从博客 RSS 拉取最新文章渲染
// 数据源 /blog/rss.xml（Astro @astrojs/rss 输出，item.link 为绝对 URL）
(function () {
  const RSS_URL = "/blog/rss.xml";
  const MAX_POSTS = 5;
  const box = document.getElementById("posts");

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  // 属性值专用转义：esc 不处理引号，拼进 href="..." 前必须补上
  function escAttr(s) {
    return esc(s).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function fmtDate(raw) {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "";
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function fallback(msg) {
    box.innerHTML =
      '<p class="posts-loading">' + esc(msg) + ' · <a href="/blog" style="color:var(--accent)">直接去博客看看 →</a></p>';
  }

  fetch(RSS_URL)
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then(function (xml) {
      const doc = new DOMParser().parseFromString(xml, "application/xml");
      if (doc.querySelector("parsererror")) throw new Error("XML parse error");
      const items = Array.from(doc.querySelectorAll("item")).slice(0, MAX_POSTS);
      if (!items.length) return fallback("博客还没有文章");
      box.innerHTML = items
        .map(function (it) {
          const title = it.querySelector("title")?.textContent || "无标题";
          const link = it.querySelector("link")?.textContent || "/blog";
          const date = fmtDate(it.querySelector("pubDate")?.textContent);
          const desc = it.querySelector("description")?.textContent || "";
          return (
            '<a class="post" href="' + escAttr(link) + '">' +
            '<span class="post-date">' + esc(date) + "</span>" +
            '<span class="post-title">' + esc(title) +
            (desc ? '<span class="post-desc">' + esc(desc) + "</span>" : "") +
            "</span></a>"
          );
        })
        .join("");
    })
    .catch(function () {
      fallback("文章列表加载失败");
    });
})();

// 工具 / 功能：数据驱动 + 侧边类别菜单筛选
// 新增/修改工具只需改下面 CATEGORIES / TOOLS 两个数组，渲染与筛选自动生效。
(function () {
  const CATEGORIES = [
    { id: "all",  name: "全部",     emoji: "🗂️" },
    { id: "ai",   name: "AI 应用",  emoji: "🧪" },
    { id: "game", name: "游戏",     emoji: "🎮" },
    { id: "tool", name: "效率工具", emoji: "🧰" },
    { id: "dev",  name: "开发运维", emoji: "⚙️" }
  ];
  // 占位示例（基于现有项目推断），看过后可自由替换/增删
  const TOOLS = [
    { cat: "ai",   emoji: "🧪", name: "AI 试验场",   desc: "大模型应用平台：RAG 检索、代码沙盒、本地语音合成。", href: "/ailab/" },
    { cat: "ai",   emoji: "🔊", name: "英语发音教练", desc: "Kokoro-82M 本地 TTS，句子朗读与跟读，离线可用。", href: "/ailab/" },
    { cat: "ai",   emoji: "📜", name: "TRPG 剧本生成", desc: "AI 生成跑团剧本与分支剧情，一键发布到游戏中心。", href: "/games" },
    { cat: "ai",   emoji: "📖", name: "小说工坊",     desc: "AI 辅助写作，docx 编辑与导出。", href: "#" },
    { cat: "game", emoji: "🎲", name: "TRPG 跑团",     desc: "多人文字冒险，回忆模式与卡牌系统。", href: "/games" },
    { cat: "game", emoji: "🃏", name: "尖塔爬塔",     desc: "Roguelike 卡牌爬塔，数据驱动角色与被动。", href: "/games" },
    { cat: "game", emoji: "✈️", name: "雷霆战机",     desc: "本地 H5 弹幕射击，轨道碰撞与波次挑战。", href: "/thunder/" },
    { cat: "game", emoji: "🧟", name: "幸存者割草",   desc: "波次生存，范围武器追身清场。", href: "/vs" },
    { cat: "tool", emoji: "✍️", name: "博客",         desc: "Astro 驱动，全文搜索与深浅色阅读。", href: "/blog" },
    { cat: "tool", emoji: "🧩", name: "低代码设计器", desc: "拖拽生成页面，四列布局与组件库。", href: "/admin" },
    { cat: "tool", emoji: "🩺", name: "每日巡检",     desc: "服务器自动体检 + AI 研判，日报落盘。", href: "#" },
    { cat: "dev",  emoji: "🔐", name: "RBAC 权限体系", desc: "路由组→角色→账户，菜单按权限即时过滤。", href: "/admin" },
    { cat: "dev",  emoji: "🎫", name: "SSO 统一登录",  desc: "nginx auth_request 门禁，B/C 双会话互认。", href: "#" },
    { cat: "dev",  emoji: "🗄️", name: "自动备份",     desc: "每日 mysqldump + gzip，滚动保留最近 7 份。", href: "#" }
  ];

  const menu = document.getElementById("tools-menu");
  const grid = document.getElementById("tools-grid");
  if (!menu || !grid) return;

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }
  function escAttr(s) {
    return esc(s).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  let current = "all";

  function countOf(id) {
    return id === "all" ? TOOLS.length : TOOLS.filter(function (t) { return t.cat === id; }).length;
  }
  function catName(id) {
    const c = CATEGORIES.find(function (x) { return x.id === id; });
    return c ? c.name : "";
  }

  function renderMenu() {
    menu.innerHTML = CATEGORIES.map(function (c) {
      const on = c.id === current;
      return (
        '<button type="button" data-cat="' + escAttr(c.id) + '"' +
        (on ? ' class="active"' : '') + ' aria-pressed="' + on + '">' +
        '<span class="m-emoji">' + esc(c.emoji) + "</span>" +
        "<span>" + esc(c.name) + "</span>" +
        '<span class="m-count">' + countOf(c.id) + "</span>" +
        "</button>"
      );
    }).join("");
  }

  function renderGrid() {
    const list = current === "all" ? TOOLS : TOOLS.filter(function (t) { return t.cat === current; });
    if (!list.length) {
      grid.innerHTML = '<p class="tools-empty">该类别下暂无工具。</p>';
      return;
    }
    grid.innerHTML = list.map(function (t) {
      return (
        '<a class="tool" href="' + escAttr(t.href) + '">' +
        '<span class="tool-emoji">' + esc(t.emoji) + "</span>" +
        "<h3>" + esc(t.name) + "</h3>" +
        "<p>" + esc(t.desc) + "</p>" +
        '<span class="tool-tag">' + esc(catName(t.cat)) + "</span>" +
        "</a>"
      );
    }).join("");
  }

  menu.addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-cat]");
    if (!btn) return;
    current = btn.getAttribute("data-cat");
    renderMenu();
    renderGrid();
  });

  renderMenu();
  renderGrid();
})();
