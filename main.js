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
