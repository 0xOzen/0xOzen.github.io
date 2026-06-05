/* 0xOzen v3 - reliable interaction layer */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function cssVar(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  function palette() {
    var light = root.getAttribute("data-theme") === "light";
    return light ? {
      line: function (a) { return "rgba(70,82,74," + a + ")"; },
      dot: "rgba(20,28,22,.5)",
      accent: function (a) { return "rgba(16,176,110," + a + ")"; },
      accentSolid: "#10b06e",
      nodeFill: "#ffffff",
      nodeStroke: "rgba(60,72,64,.5)",
      label: "rgba(40,52,44,.72)",
      labelHot: "#0d100e"
    } : {
      line: function (a) { return "rgba(150,160,156," + a + ")"; },
      dot: "rgba(200,208,204,.5)",
      accent: function (a) { return "rgba(94,240,166," + a + ")"; },
      accentSolid: "#5ef0a6",
      nodeFill: "#0e100f",
      nodeStroke: "rgba(170,180,176,.5)",
      label: "rgba(180,188,184,.68)",
      labelHot: "#e8ece9"
    };
  }

  var pal = palette();
  function refreshPalette() { pal = palette(); }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("0xozen-theme", theme); } catch (error) {}
    var meta = document.getElementById("theme-color-meta");
    if (meta) meta.setAttribute("content", theme === "light" ? "#f4f6f3" : "#060707");
    document.querySelectorAll("[data-theme-icon]").forEach(function (icon) {
      icon.hidden = icon.getAttribute("data-theme-icon") !== theme;
    });
    refreshPalette();
  }

  (function initTheme() {
    var saved = "dark";
    try { saved = localStorage.getItem("0xozen-theme") || root.getAttribute("data-theme") || "dark"; } catch (error) {}
    setTheme(saved === "light" ? "light" : "dark");
    document.addEventListener("click", function (event) {
      if (!event.target.closest("[data-toggle-theme]")) return;
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  })();

  (function mobileMenu() {
    document.addEventListener("click", function (event) {
      var bar = document.querySelector(".topbar");
      if (!bar) return;
      if (event.target.closest("[data-menu]")) {
        bar.classList.toggle("open");
        return;
      }
      if (bar.classList.contains("open") && !event.target.closest(".navlinks")) {
        bar.classList.remove("open");
      }
    });
    document.querySelectorAll(".topbar .navlinks a").forEach(function (link) {
      link.addEventListener("click", function () {
        var bar = document.querySelector(".topbar");
        if (bar) bar.classList.remove("open");
      });
    });
  })();

  (function typeHero() {
    var host = document.querySelector("[data-type]");
    if (!host) return;
    var lines = Array.prototype.slice.call(host.querySelectorAll(".term-line"));
    var html = lines.map(function (line) { return line.innerHTML; });
    function typeLine(index) {
      if (index >= lines.length) return;
      var node = lines[index];
      node.style.visibility = "visible";
      if (reduced) {
        node.innerHTML = html[index];
        typeLine(index + 1);
        return;
      }
      var text = node.textContent;
      var pos = 0;
      node.textContent = "";
      var timer = setInterval(function () {
        node.textContent = text.slice(0, ++pos) + (pos < text.length ? "|" : "");
        if (pos >= text.length) {
          clearInterval(timer);
          node.innerHTML = html[index];
          setTimeout(function () { typeLine(index + 1); }, 110);
        }
      }, 15);
    }
    typeLine(0);
  })();

  (function spotlights() {
    document.querySelectorAll("[data-spotlight], .signal-stage").forEach(function (el) {
      el.addEventListener("pointermove", function (event) {
        var rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", (event.clientX - rect.left) + "px");
        el.style.setProperty("--my", (event.clientY - rect.top) + "px");
      });
    });
  })();

  (function ripples() {
    document.querySelectorAll("[data-ripple]").forEach(function (el) {
      el.addEventListener("click", function (event) {
        if (reduced) return;
        var rect = el.getBoundingClientRect();
        var ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.left = (event.clientX - rect.left) + "px";
        ripple.style.top = (event.clientY - rect.top) + "px";
        el.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 650);
      });
    });
  })();

  (function signalField() {
    var canvas = document.getElementById("signalField");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var width = 0;
    var height = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var points = [];
    var mouse = { x: -999, y: -999 };
    var raf = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      width = rect.width | 0;
      height = rect.height | 0;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(42, Math.min(reduced ? 70 : 150, (width * height / 13000) | 0));
      points = [];
      for (var i = 0; i < count; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, width, height);
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var dx = p.x - mouse.x;
        var dy = p.y - mouse.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 14500) {
          var f = (1 - d2 / 14500) * 0.62;
          p.vx += dx / Math.sqrt(d2 + 1) * f * 0.2;
          p.vy += dy / Math.sqrt(d2 + 1) * f * 0.2;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));
      }

      for (var a = 0; a < points.length; a++) {
        for (var b = a + 1; b < points.length; b++) {
          var p1 = points[a];
          var p2 = points[b];
          var ldx = p1.x - p2.x;
          var ldy = p1.y - p2.y;
          var dist = Math.sqrt(ldx * ldx + ldy * ldy);
          if (dist < 120) {
            var midX = (p1.x + p2.x) / 2;
            var midY = (p1.y + p2.y) / 2;
            var near = Math.hypot(midX - mouse.x, midY - mouse.y) < 150;
            var alpha = (1 - dist / 120) * (near ? 0.85 : 0.16);
            ctx.strokeStyle = near ? pal.accent(alpha) : pal.line(alpha);
            ctx.lineWidth = near ? 1 : 0.7;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      for (var j = 0; j < points.length; j++) {
        var dot = points[j];
        ctx.fillStyle = Math.hypot(dot.x - mouse.x, dot.y - mouse.y) < 150 ? pal.accent(0.9) : pal.dot;
        ctx.fillRect(dot.x - 1, dot.y - 1, 2, 2);
      }
      raf = requestAnimationFrame(frame);
    }

    canvas.addEventListener("pointermove", function (event) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    });
    canvas.addEventListener("pointerleave", function () { mouse.x = -999; mouse.y = -999; });
    resize();
    window.addEventListener("resize", function () { cancelAnimationFrame(raf); resize(); frame(); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) cancelAnimationFrame(raf);
      else { cancelAnimationFrame(raf); frame(); }
    });
    frame();
  })();

  (function modelGraph() {
    var canvas = document.getElementById("modelGraph");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var tip = document.getElementById("graphTip");
    var width = 0;
    var height = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var mouse = { x: -999, y: -999, on: false };
    var raf = 0;
    var nodes = {};
    var defs = [
      { id: "discover", x: 0.1, y: 0.5, title: "01 . Discover", desc: "Map AI use, risk, ownership, and first useful workflow." },
      { id: "adopt", x: 0.3, y: 0.5, title: "02 . Adopt", desc: "Select one department pilot with data boundaries and success metrics." },
      { id: "design", x: 0.5, y: 0.5, title: "03 . Design", desc: "Create agent and workflow rules: suggest, prepare, modify, trigger, commit." },
      { id: "govern", x: 0.7, y: 0.5, title: "04 . Govern", desc: "Policy, responsibility matrix, logging, approval, and escalation rules." },
      { id: "anchor", x: 0.9, y: 0.5, title: "05 . Anchor", desc: "Evidence, Digital Product Passport thinking, and tokenization readiness where it fits." },
      { id: "human", x: 0.5, y: 0.16, title: "Human approval rail", desc: "Named humans decide and approve before high-impact actions." },
      { id: "evidence", x: 0.5, y: 0.84, title: "Evidence rail", desc: "Prompts, outputs, decisions, logs, and rollback paths remain reviewable." }
    ];
    var chain = [["discover", "adopt"], ["adopt", "design"], ["design", "govern"], ["govern", "anchor"]];
    var rails = [];
    ["human", "evidence"].forEach(function (rail) {
      ["discover", "adopt", "design", "govern", "anchor"].forEach(function (node) {
        rails.push([rail, node]);
      });
    });

    function resize() {
      var rect = canvas.getBoundingClientRect();
      width = rect.width | 0;
      height = rect.height | 0;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      defs.forEach(function (def) {
        var node = nodes[def.id] || (nodes[def.id] = {});
        node.homeX = def.x * width;
        node.homeY = def.y * height;
        if (node.x == null) {
          node.x = node.homeX;
          node.y = node.homeY;
        }
        node.title = def.title;
        node.desc = def.desc;
        node.r = def.id === "human" || def.id === "evidence" ? 6 : 9;
      });
    }

    function drawLine(a, b, base, near) {
      var p = nodes[a];
      var q = nodes[b];
      var mx = (p.x + q.x) / 2;
      var my = (p.y + q.y) / 2;
      var hot = near === a || near === b || (mouse.on && Math.hypot(mx - mouse.x, my - mouse.y) < 70);
      ctx.strokeStyle = hot ? pal.accent(0.85) : base;
      ctx.lineWidth = hot ? 1.6 : 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
    }

    function frame() {
      ctx.clearRect(0, 0, width, height);
      var time = performance.now() / 1000;
      defs.forEach(function (def) {
        var n = nodes[def.id];
        n.vx = (n.vx || 0) + (n.homeX - n.x) * 0.02;
        n.vy = (n.vy || 0) + (n.homeY - n.y) * 0.02;
        if (!reduced) {
          n.vx += Math.cos(time * 0.8 + n.homeX) * 0.03;
          n.vy += Math.sin(time * 0.9 + n.homeY) * 0.03;
        }
        if (mouse.on) {
          var dx = n.x - mouse.x;
          var dy = n.y - mouse.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 9000) {
            var f = (1 - d2 / 9000) * 2.2;
            n.vx += dx / Math.sqrt(d2 + 1) * f;
            n.vy += dy / Math.sqrt(d2 + 1) * f;
          }
        }
        n.vx *= 0.86;
        n.vy *= 0.86;
        n.x += n.vx;
        n.y += n.vy;
      });

      var near = null;
      var nearestDistance = Infinity;
      if (mouse.on) {
        defs.forEach(function (def) {
          var n = nodes[def.id];
          var distance = Math.hypot(n.x - mouse.x, n.y - mouse.y);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            near = def.id;
          }
        });
        if (nearestDistance > 90) near = null;
      }

      rails.forEach(function (edge) { drawLine(edge[0], edge[1], pal.line(0.1), near); });
      chain.forEach(function (edge) { drawLine(edge[0], edge[1], pal.line(0.3), near); });

      defs.forEach(function (def) {
        var n = nodes[def.id];
        var hot = near === def.id;
        var s = n.r;
        ctx.fillStyle = pal.nodeFill;
        ctx.strokeStyle = hot ? pal.accentSolid : pal.nodeStroke;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.rect(n.x - s, n.y - s, s * 2, s * 2);
        ctx.fill();
        ctx.stroke();
        if (hot) {
          ctx.fillStyle = pal.accent(0.18);
          ctx.fillRect(n.x - s - 4, n.y - s - 4, s * 2 + 8, s * 2 + 8);
        }
        ctx.fillStyle = hot ? pal.labelHot : pal.label;
        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.textAlign = "center";
        var rail = def.id === "human" || def.id === "evidence";
        ctx.fillText(def.title, n.x, rail && def.id === "human" ? n.y - s - 10 : n.y + s + 17);
      });

      if (near && tip) {
        var active = nodes[near];
        tip.innerHTML = "<b>" + active.title + "</b>" + active.desc;
        tip.style.left = Math.min(Math.max(active.x + 14, 8), width - 250) + "px";
        tip.style.top = Math.min(Math.max(active.y - 10, 8), height - 84) + "px";
        tip.classList.add("on");
      } else if (tip) {
        tip.classList.remove("on");
      }
      raf = requestAnimationFrame(frame);
    }

    canvas.addEventListener("pointermove", function (event) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.on = true;
    });
    canvas.addEventListener("pointerleave", function () { mouse.on = false; mouse.x = -999; mouse.y = -999; });
    resize();
    window.addEventListener("resize", function () { cancelAnimationFrame(raf); resize(); frame(); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) cancelAnimationFrame(raf);
      else { cancelAnimationFrame(raf); frame(); }
    });
    frame();
  })();

  (function ladder() {
    var data = {
      suggest: {
        meta: "01 / suggest",
        title: "Suggest",
        text: "Summarize, draft, classify, or analyze. Output is read by a human; nothing changes in a system of record.",
        risk: "low",
        riskLabel: "low risk",
        gates: ["source attribution", "logged prompt and output", "reviewer can ignore safely"]
      },
      prepare: {
        meta: "02 / prepare",
        title: "Prepare",
        text: "Create a next action for review: a draft message, CRM update proposal, ticket, invoice match, or implementation plan.",
        risk: "low",
        riskLabel: "low-medium risk",
        gates: ["diff visible before save", "named owner approves", "edit history retained"]
      },
      modify: {
        meta: "03 / modify",
        title: "Modify",
        text: "Change a file, record, ticket, or field. The state of the system moves and humans review after the fact.",
        risk: "med",
        riskLabel: "medium risk",
        gates: ["field-level audit log", "rollback path defined", "restricted to scoped objects"]
      },
      trigger: {
        meta: "04 / trigger",
        title: "Trigger",
        text: "Start a workflow, escalate, notify, or route work to others. Side effects ripple to people downstream.",
        risk: "high",
        riskLabel: "high risk",
        gates: ["idempotency keys", "escalation owner on call", "cancel and reverse path tested"]
      },
      commit: {
        meta: "05 / commit",
        title: "Commit",
        text: "Spend, approve, deploy, sign, or contact externally. The action cannot be silently undone.",
        risk: "crit",
        riskLabel: "critical risk",
        gates: ["two-party authorization", "pre-commit eval gate", "recovery drill rehearsed"]
      }
    };
    var buttons = document.querySelectorAll(".ladder-step");
    var meta = document.getElementById("ladderMeta");
    var title = document.getElementById("ladderTitle");
    var text = document.getElementById("ladderText");
    var risk = document.getElementById("ladderRisk");
    var gates = document.getElementById("ladderGates");
    function render(key) {
      var item = data[key];
      if (!item) return;
      meta.textContent = item.meta;
      title.textContent = item.title;
      text.textContent = item.text;
      risk.className = "risk " + item.risk;
      risk.innerHTML = "<i></i> " + item.riskLabel;
      gates.innerHTML = item.gates.map(function (gate) { return "<li>" + gate + "</li>"; }).join("");
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (other) {
          other.classList.remove("active");
          other.setAttribute("aria-selected", "false");
        });
        button.classList.add("active");
        button.setAttribute("aria-selected", "true");
        render(button.getAttribute("data-step"));
      });
    });
  })();

  (function signalLoop() {
    var data = {
      search: { code: '1  search("agent governance")\n2  results -> sources[]\n3  sources -> readable evidence' },
      scrape: { code: '1  scrape(url)\n2  html -> markdown + json\n3  screenshot -> review artifact' },
      map: { code: '1  map(domain)\n2  routes -> source graph\n3  changes -> watch list' },
      crawl: { code: '1  crawl(site)\n2  pages -> structured dataset\n3  duplicates -> merged context' },
      govern: { code: '1  attach owner\n2  cite source + timestamp\n3  publish only after approval' }
    };
    var controls = document.querySelectorAll("[data-signal]");
    var meta = document.getElementById("signalMeta");
    var code = document.getElementById("signalCode");
    function render(key) {
      if (!data[key]) return;
      meta.textContent = key;
      code.textContent = data[key].code;
    }
    controls.forEach(function (button) {
      button.addEventListener("click", function () {
        controls.forEach(function (other) { other.classList.remove("active"); });
        button.classList.add("active");
        render(button.getAttribute("data-signal"));
      });
    });
  })();

  (function commandPalette() {
    var backdrop = document.getElementById("cmdkBackdrop");
    var input = document.getElementById("cmdkInput");
    var list = document.getElementById("cmdkList");
    var trigger = document.getElementById("cmdkTrigger");
    if (!backdrop || !input || !list) return;
    var commands = [
      { section: "Navigate", label: "Home", icon: "i-home", meta: "#top", action: function () { location.href = "#top"; } },
      { section: "Navigate", label: "Work surfaces", icon: "i-grid", meta: "#work", action: function () { go("#work"); } },
      { section: "Navigate", label: "Operating model", icon: "i-flow", meta: "#model", action: function () { go("#model"); } },
      { section: "Navigate", label: "Interactive diagrams", icon: "i-shield", meta: "#diagrams", action: function () { go("#diagrams"); } },
      { section: "Navigate", label: "Writing archive", icon: "i-writing", meta: "writing-archive.html", action: function () { location.href = "writing-archive.html"; } },
      { section: "Navigate", label: "Department adoption", icon: "i-grid", meta: "department-adoption.html", action: function () { location.href = "department-adoption.html"; } },
      { section: "Actions", label: "Copy email", icon: "i-copy", meta: "ali.ozen@rwth-aachen.de", action: copyEmail },
      { section: "Actions", label: "Send email", icon: "i-mail", meta: "mailto", action: function () { location.href = "mailto:ali.ozen@rwth-aachen.de"; } },
      { section: "Theme", label: "Dark terminal", icon: "i-moon", action: function () { setTheme("dark"); } },
      { section: "Theme", label: "Light terminal", icon: "i-sun", action: function () { setTheme("light"); } }
    ];
    var filtered = commands.slice();
    var activeIndex = 0;

    function go(selector) {
      var el = document.querySelector(selector);
      if (!el) return;
      var y = el.getBoundingClientRect().top + window.pageYOffset - 58;
      window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
      history.replaceState(null, "", selector);
    }

    function copyEmail() {
      var email = "ali.ozen@rwth-aachen.de";
      if (navigator.clipboard) navigator.clipboard.writeText(email);
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>]/g, function (char) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char];
      });
    }

    function render() {
      if (!filtered.length) {
        list.innerHTML = '<div class="cmdk-empty">No matches.</div>';
        return;
      }
      var lastSection = "";
      var html = "";
      filtered.forEach(function (cmd, index) {
        if (cmd.section !== lastSection) {
          html += '<div class="cmdk-section">' + escapeHtml(cmd.section) + "</div>";
          lastSection = cmd.section;
        }
        html += '<button class="cmdk-result' + (index === activeIndex ? " active" : "") + '" type="button" data-idx="' + index + '">' +
          '<svg aria-hidden="true"><use href="#' + cmd.icon + '"/></svg>' +
          '<span><span class="ttl">' + escapeHtml(cmd.label) + '</span>' +
          (cmd.meta ? '<span class="meta">' + escapeHtml(cmd.meta) + '</span>' : '') +
          '</span><span class="arr">enter</span></button>';
      });
      list.innerHTML = html;
      list.querySelectorAll(".cmdk-result").forEach(function (button) {
        button.addEventListener("click", function () { exec(parseInt(button.getAttribute("data-idx"), 10)); });
        button.addEventListener("mousemove", function () {
          activeIndex = parseInt(button.getAttribute("data-idx"), 10);
          updateActive();
        });
      });
    }

    function updateActive() {
      list.querySelectorAll(".cmdk-result").forEach(function (button, index) {
        button.classList.toggle("active", index === activeIndex);
      });
    }

    function exec(index) {
      var cmd = filtered[index];
      if (!cmd) return;
      close();
      setTimeout(function () { cmd.action(); }, 50);
    }

    function filter(query) {
      query = (query || "").trim().toLowerCase();
      filtered = query ? commands.filter(function (cmd) {
        return (cmd.section + " " + cmd.label + " " + (cmd.meta || "")).toLowerCase().indexOf(query) !== -1;
      }) : commands.slice();
      activeIndex = 0;
      render();
    }

    function open() {
      backdrop.classList.add("open");
      document.body.style.overflow = "hidden";
      setTimeout(function () { input.focus(); input.select(); }, 0);
      filter(input.value);
    }

    function close() {
      backdrop.classList.remove("open");
      document.body.style.overflow = "";
    }

    if (trigger) trigger.addEventListener("click", open);
    document.addEventListener("keydown", function (event) {
      var mod = event.metaKey || event.ctrlKey;
      if (mod && (event.key === "k" || event.key === "K")) {
        event.preventDefault();
        backdrop.classList.contains("open") ? close() : open();
        return;
      }
      if (!backdrop.classList.contains("open")) return;
      if (event.key === "Escape") { event.preventDefault(); close(); }
      else if (event.key === "ArrowDown") { event.preventDefault(); activeIndex = Math.min(activeIndex + 1, filtered.length - 1); updateActive(); }
      else if (event.key === "ArrowUp") { event.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); updateActive(); }
      else if (event.key === "Enter") { event.preventDefault(); exec(activeIndex); }
    });
    input.addEventListener("input", function () { filter(input.value); });
    backdrop.addEventListener("click", function (event) { if (event.target === backdrop) close(); });
    filter("");
  })();

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
