(function () {
  var KEY = "machands-lang";

  function currentLang() {
    return document.documentElement.lang === "en" ? "en" : "zh-CN";
  }

  function apply(lang) {
    var l = lang === "en" ? "en" : "zh-CN";
    document.documentElement.lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    var title = document.documentElement.getAttribute(l === "en" ? "data-title-en" : "data-title-zh");
    if (title) document.title = title;
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-set-lang") === l ? "true" : "false");
    });
    var short = l === "en" ? "en" : "zh";
    document.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || /^(https?:|mailto:|#)/i.test(href)) return;
      try {
        var url = new URL(href, location.href);
        if (url.origin !== location.origin) return;
        if (!/\.html?$/.test(url.pathname) && url.pathname !== "/" && !url.pathname.endsWith("/")) return;
        url.searchParams.set("lang", short);
        a.setAttribute("href", url.pathname + url.search + url.hash);
      } catch (e) {}
    });
  }

  function bootLang() {
    var q = null;
    try { q = new URLSearchParams(location.search).get("lang"); } catch (e) {}
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    var l = "zh-CN";
    if (q === "en" || (!q && saved === "en")) l = "en";
    if (q === "zh" || q === "zh-CN") l = "zh-CN";
    apply(l);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-set-lang]");
    if (!btn) return;
    apply(btn.getAttribute("data-set-lang"));
    try {
      var url = new URL(location.href);
      url.searchParams.set("lang", currentLang() === "en" ? "en" : "zh");
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (err) {}
  });

  function revealMedia() {
    var root = document.querySelector("[data-media-root]");
    if (!root) return;
    var empty = document.querySelectorAll("[data-media-empty]");
    var pending = 0;
    var shown = 0;
    function finish() {
      if (pending > 0) return;
      empty.forEach(function (el) {
        el.hidden = shown > 0;
      });
    }
    root.querySelectorAll("[data-try-src]").forEach(function (node) {
      var src = node.getAttribute("data-try-src");
      if (!src) return;
      var slot = node.closest(".media-slot") || node;
      pending += 1;
      if (node.tagName === "VIDEO") {
        node.addEventListener("loadeddata", function () {
          slot.hidden = false;
          shown += 1;
          pending -= 1;
          finish();
        }, { once: true });
        node.addEventListener("error", function () {
          pending -= 1;
          finish();
        }, { once: true });
        node.src = src;
      } else {
        node.addEventListener("load", function () {
          slot.hidden = false;
          shown += 1;
          pending -= 1;
          finish();
        }, { once: true });
        node.addEventListener("error", function () {
          pending -= 1;
          finish();
        }, { once: true });
        node.src = src;
      }
    });
    if (pending === 0) finish();
  }

  bootLang();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", revealMedia);
  } else {
    revealMedia();
  }
})();
