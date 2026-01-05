(function () {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const els = Array.from(document.querySelectorAll(".reveal"));
  if (prefersReduced) {
    els.forEach((e) => e.classList.add("in-view"));
  } else {
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9) el.classList.add("in-view");
    });
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = els.indexOf(entry.target);
            entry.target.style.transitionDelay = `${(idx % 12) * 60}ms`;
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => observer.observe(el));
  }
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.getElementById("nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }),
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (navLinks.classList.contains("open")) {
          navLinks.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
          navToggle.focus();
        }
      }
    });
    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }
  const counters = document.querySelectorAll(".stat .js-count[data-target]");
  if (counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = +el.dataset.target;
            const stat = el.closest(".stat");
            const progress = stat
              ? stat.querySelector("progress.stat-bar")
              : null;
            let current = 0;
            const duration = 900;
            const tick = 16;
            const steps = Math.max(1, Math.floor(duration / tick));
            const step = Math.max(1, Math.floor(target / steps));
            if (progress) {
              progress.max = target;
              progress.value = 0;
            }
            const iv = setInterval(() => {
              current += step;
              if (current >= target) {
                el.textContent = target;
                if (progress) progress.value = target;
                clearInterval(iv);
              } else {
                el.textContent = current;
                if (progress) progress.value = current;
              }
            }, tick);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.6 },
    );
    counters.forEach((c) => counterObserver.observe(c));
  }
  function tryLoad(imgSrc) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imgSrc;
    });
  }
  const pictures = document.querySelectorAll(
    "picture[data-vpn-webp][data-vpn-jpg]",
  );
  pictures.forEach(async (p) => {
    const webp = p.dataset.vpnWebp;
    const jpg = p.dataset.vpnJpg;
    const img = p.querySelector("img");
    const fallback = "images/multi-device.jpg";
    const placeholder =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="%23f3f6f8"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23c0c8cc" font-family="Arial, sans-serif" font-size="20">Image unavailable</text></svg>',
      );

    async function applySrc(src) {
      if (!src) return false;
      const ok = await tryLoad(src);
      if (!ok) return false;
      const sWebp = p.querySelector('source[type="image/webp"]');
      const sJpg = p.querySelector('source[type="image/jpeg"]');
      if (src.endsWith(".webp") && sWebp) sWebp.srcset = src;
      if ((src.endsWith(".jpg") || src.endsWith(".jpeg")) && sJpg)
        sJpg.srcset = src;
      if (img) img.src = src;
      return true;
    }

    if (await applySrc(webp)) {
    } else if (await applySrc(jpg)) {
    } else if (await applySrc(fallback)) {
    } else {
      if (img) img.src = placeholder;
    }

    if (img) {
      img.addEventListener("load", () => img.classList.add("in-view"));
      img.addEventListener("error", async () => {
        if (img.src !== fallback) {
          if (await tryLoad(fallback)) img.src = fallback;
          else img.src = placeholder;
        }
        img.classList.add("in-view");
      });
      if (img.complete && img.naturalWidth) img.classList.add("in-view");
    }
  });
  const allImgs = document.querySelectorAll("img");
  allImgs.forEach((img) => {
    if (!img.classList.contains("img-cover")) img.classList.add("img-cover");
    if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
  });

  const heroWaveEl = document.querySelector(".hero-wave");
  let lastY = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY || 0;
    if (Math.abs(y - lastY) < 2) return;
    lastY = y;
    if (heroWaveEl) heroWaveEl.style.transform = `translateX(${y * 0.02}px)`;
  });
})();
