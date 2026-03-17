// ============================================================
// 1. THEME TOGGLE
// ============================================================
(function () {
  var STORAGE_KEY = "portfolio-theme";
  var root = document.documentElement;

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "dark";
    } catch (e) {
      return "dark";
    }
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
  }

  setTheme(getStoredTheme());

  var btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") || "dark";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }
})();

// ============================================================
// 2. ACTIVE NAV LINK HIGHLIGHT
// ============================================================
(function () {
  var currentPage = window.location.pathname.split("/").pop() || "index.html";
  var links = document.querySelectorAll(".main-nav a");
  links.forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === currentPage) {
      a.classList.add("active");
    }
  });
})();

// ============================================================
// 3. HEADER SCROLL SHADOW
// ============================================================
(function () {
  var header = document.querySelector(".site-header");
  if (!header) return;
  var scrolled = false;
  window.addEventListener(
    "scroll",
    function () {
      var shouldAdd = window.scrollY > 20;
      if (shouldAdd !== scrolled) {
        scrolled = shouldAdd;
        header.classList.toggle("scrolled", scrolled);
      }
    },
    { passive: true }
  );
})();

// ============================================================
// 4. PAGE TRANSITION
// ============================================================
(function () {
  var main = document.querySelector("main");
  if (main) main.classList.add("page-transition");
})();

// ============================================================
// 5. SCROLL REVEAL (Intersection Observer)
// ============================================================
(function () {
  if (!("IntersectionObserver" in window)) {
    // Fallback: just show everything
    document.querySelectorAll(".reveal, .reveal-scale, .reveal-stagger").forEach(function (el) {
      el.classList.add("visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal, .reveal-scale, .reveal-stagger").forEach(function (el) {
    observer.observe(el);
  });
})();

// ============================================================
// 6. ANIMATED STAT COUNTERS
// ============================================================
(function () {
  if (!("IntersectionObserver" in window)) return;

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1800;
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  var counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll(".stat-number[data-count]").forEach(function (el) {
    counterObserver.observe(el);
  });
})();

// ============================================================
// 7. CANVAS PARTICLE BACKGROUND
// ============================================================
(function () {
  var canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var particles = [];
  var PARTICLE_COUNT = 45;
  var mouse = { x: -1000, y: -1000 };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });

  document.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  function Particle() {
    this.reset();
  }

  Particle.prototype.reset = function () {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.radius = Math.random() * 2 + 0.5;
    this.opacity = Math.random() * 0.4 + 0.1;
    this.hue = Math.random() > 0.5 ? 240 : 270; // indigo or purple
  };

  for (var i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var isDark = document.documentElement.getAttribute("data-theme") !== "light";
    var baseAlpha = isDark ? 1 : 0.5;

    particles.forEach(function (p, i) {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;

      // Mouse repulsion
      var dx = p.x - mouse.x;
      var dy = p.y - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        var force = (120 - dist) / 120 * 0.8;
        p.x += (dx / dist) * force;
        p.y += (dy / dist) * force;
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = "hsla(" + p.hue + ", 80%, 70%, " + (p.opacity * baseAlpha) + ")";
      ctx.fill();

      // Draw connections
      for (var j = i + 1; j < particles.length; j++) {
        var p2 = particles[j];
        var ddx = p.x - p2.x;
        var ddy = p.y - p2.y;
        var d = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d < 140) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = "hsla(250, 60%, 70%, " + ((1 - d / 140) * 0.12 * baseAlpha) + ")";
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(draw);
  }

  draw();
})();

// ============================================================
// 8. FOOTER YEAR
// ============================================================
(function () {
  var yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();
})();
