/* 0xOzen v3 - reliable interaction layer */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function cssVar(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  function palette() {
    var theme = root.getAttribute("data-theme");
    if (theme === "linear") {
      return {
        line: function (a) { return "rgba(208,216,224," + a + ")"; },
        dot: "rgba(208,216,224,.45)",
        accent: function (a) { return "rgba(94,106,210," + a + ")"; },
        accentSolid: "#5e6ad2",
        nodeFill: "#161718",
        nodeStroke: "rgba(208,216,224,.5)",
        label: "rgba(208,216,224,.68)",
        labelHot: "#f7f8f8"
      };
    }
    return {
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
    if (theme === "dark" || theme === "light" || theme === "cursor") theme = "terminal";
    if (["terminal", "linear"].indexOf(theme) === -1) theme = "terminal";
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (error) {}
    var meta = document.getElementById("theme-color-meta");
    var color = { terminal: "#060707", linear: "#08090a" }[theme];
    if (meta) meta.setAttribute("content", color);
    document.querySelectorAll("[data-theme-set]").forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-theme-set") === theme ? "true" : "false");
    });
    refreshPalette();
  }

  (function initTheme() {
    var saved = "terminal";
    try { saved = localStorage.getItem("theme") || root.getAttribute("data-theme") || "terminal"; } catch (error) {}
    setTheme(saved);
    document.addEventListener("click", function (event) {
      var themeButton = event.target.closest("[data-theme-set]");
      if (!themeButton) return;
      setTheme(themeButton.getAttribute("data-theme-set"));
    });
  })();

  (function heroRotator() {
    document.querySelectorAll("[data-hero-word]").forEach(function (word) {
      var host = word.closest("[data-hero-words]");
      var words = host && host.getAttribute("data-hero-words")
        ? host.getAttribute("data-hero-words").split("|").map(function (item) { return item.trim(); }).filter(Boolean)
        : ["control plane", "permission rail", "evidence trail", "recovery path", "workflow map"];
      var index = Math.max(0, words.indexOf(word.textContent.trim()));
      if (reduced || words.length < 2) return;
      window.setInterval(function () {
        word.classList.remove("swap-in");
        word.classList.add("swap-out");
        window.setTimeout(function () {
          index = (index + 1) % words.length;
          word.textContent = words[index];
          word.classList.remove("swap-out");
          word.classList.add("swap-in");
        }, 260);
      }, 2200);
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
    var drag = null;
    var raf = 0;
    var nodes = {};
    var defs = [];
    var pipelineIds = ["input", "control", "workflow"];
    var packetPhase = 0;

    function nodeDef(id, x, y, w, h, kind, title, label, desc) {
      return { id: id, x: x, y: y, w: w, h: h, kind: kind, title: title, label: label, desc: desc };
    }

    function buildLayout() {
      var mobile = width < 700;
      var next = [];
      if (mobile) {
        var mainX = width * 0.50;
        var cardW = Math.max(228, Math.min(320, width * 0.78));
        var supportW = Math.max(134, Math.min(164, width * 0.38));
        next.push(nodeDef("input", mainX, 86, cardW, 74, "pipeline", "scattered AI work", "before", "Prompts, pilots, research, and agent drafts live in different places."));
        next.push(nodeDef("control", mainX, 226, cardW, 108, "hub", "control plane", "owner / permission / gate", "Names the owner, defines what AI can touch, and keeps approval before impact."));
        next.push(nodeDef("workflow", mainX, 366, cardW, 76, "outcome", "approved workflow", "after", "Only reviewed work becomes a repeatable operating habit."));
        next.push(nodeDef("evidence", width * 0.31, 500, supportW, 76, "support", "evidence trail", "proof", "Sources, prompts, decisions, and outputs stay reviewable."));
        next.push(nodeDef("recovery", width * 0.69, 500, supportW, 76, "support", "recovery path", "undo / learn", "Escalation and rollback are planned before scale."));
        return next;
      }

      var midY = height * 0.43;
      var supportY = height * 0.76;
      next.push(nodeDef("input", width * 0.18, midY, 198, 92, "pipeline", "scattered AI work", "before", "Prompts, pilots, web research, and agent drafts live in different places."));
      next.push(nodeDef("control", width * 0.50, midY, 238, 112, "hub", "control plane", "owner / permission / gate", "Who owns it, what it can touch, who approves it, and what remains after it moves."));
      next.push(nodeDef("workflow", width * 0.82, midY, 198, 92, "outcome", "approved workflow", "after", "Only reviewed work becomes a repeatable operating habit."));
      next.push(nodeDef("evidence", width * 0.36, supportY, 178, 78, "support", "evidence trail", "proof", "Sources, prompts, decisions, and outputs stay reviewable."));
      next.push(nodeDef("recovery", width * 0.64, supportY, 178, 78, "support", "recovery path", "undo / learn", "Escalation, rollback, and learning are planned before scale."));
      return next;
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      width = rect.width | 0;
      height = rect.height | 0;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      defs = buildLayout();
      defs.forEach(function (def) {
        var node = nodes[def.id] || (nodes[def.id] = {});
        node.homeX = def.x;
        node.homeY = def.y;
        if (node.x == null) {
          node.x = node.homeX;
          node.y = node.homeY;
        }
        node.w = def.w;
        node.h = def.h;
        node.kind = def.kind;
        node.label = def.label;
        node.title = def.title;
        node.desc = def.desc;
        node.canDrag = def.kind === "pipeline" || def.kind === "hub" || def.kind === "outcome";
      });
    }

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
    }

    function drawGrid() {
      var step = width < 700 ? 36 : 48;
      ctx.save();
      ctx.strokeStyle = pal.line(0.055);
      ctx.lineWidth = 1;
      for (var x = step; x < width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (var y = step; y < height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
      ctx.restore();
    }

    function hit(node) {
      return mouse.on &&
        mouse.x >= node.x - node.w / 2 &&
        mouse.x <= node.x + node.w / 2 &&
        mouse.y >= node.y - node.h / 2 &&
        mouse.y <= node.y + node.h / 2;
    }

    function findActive() {
      if (!mouse.on) return null;
      var active = null;
      defs.forEach(function (def) {
        var node = nodes[def.id];
        if (hit(node)) active = def.id;
      });
      if (active) return active;
      var best = null;
      var bestDistance = Infinity;
      defs.forEach(function (def) {
        var node = nodes[def.id];
        var distance = Math.hypot(node.x - mouse.x, node.y - mouse.y);
        if (distance < bestDistance) {
          best = def.id;
          bestDistance = distance;
        }
      });
      return bestDistance < 74 ? best : null;
    }

    function drawLine(from, to, active, options) {
      var a = nodes[from];
      var b = nodes[to];
      if (!a || !b) return;
      var hot = active === from || active === to;
      var bend = options && options.bend || 0;
      var alpha = options && options.alpha || 0.28;
      var lineWidth = options && options.width || 1;
      var cx = (a.x + b.x) / 2;
      var cy = (a.y + b.y) / 2 + bend;
      ctx.save();
      ctx.strokeStyle = hot ? pal.accent(0.85) : pal.line(alpha);
      ctx.lineWidth = hot ? lineWidth + 0.8 : lineWidth;
      if (options && options.dashed) ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(cx, cy, b.x, b.y);
      ctx.stroke();
      ctx.restore();
      if (options && options.packet && !reduced) {
        var t = (packetPhase + (options.offset || 0)) % 1;
        var inv = 1 - t;
        var px = inv * inv * a.x + 2 * inv * t * cx + t * t * b.x;
        var py = inv * inv * a.y + 2 * inv * t * cy + t * t * b.y;
        ctx.save();
        ctx.fillStyle = hot ? pal.accent(0.96) : pal.accent(0.72);
        ctx.shadowColor = pal.accent(0.9);
        ctx.shadowBlur = hot ? 12 : 8;
        ctx.beginPath();
        ctx.arc(px, py, hot ? 4 : 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function drawRailLabels() {
      ctx.save();
      ctx.font = '11px "IBM Plex Mono", monospace';
      ctx.fillStyle = pal.label;
      if (width >= 700) {
        ctx.fillText("one owner", width * 0.18 - 56, height * 0.18);
        ctx.fillText("permission boundary", width * 0.50 - 72, height * 0.18);
        ctx.fillText("reviewed workflow", width * 0.82 - 74, height * 0.18);
        ctx.fillText("evidence + recovery stay attached", width * 0.38, height * 0.92);
      } else {
        ctx.fillText("owner -> permission -> evidence -> recovery", 18, 30);
      }
      ctx.restore();
    }

    function drawNode(id, active) {
      var n = nodes[id];
      var hot = active === id;
      var x = n.x - n.w / 2;
      var y = n.y - n.h / 2;
      var isSmall = n.kind === "gate" || n.kind === "evidence" || n.kind === "rollback";
      var isHub = n.kind === "hub";
      ctx.save();
      if (hot) {
        ctx.fillStyle = pal.accent(0.1);
        roundRect(x - 5, y - 5, n.w + 10, n.h + 10, 12);
        ctx.fill();
      }
      ctx.fillStyle = pal.nodeFill;
      ctx.strokeStyle = hot ? pal.accentSolid : isHub ? pal.accent(0.58) : pal.nodeStroke;
      ctx.lineWidth = hot ? 1.8 : 1.1;
      roundRect(x, y, n.w, n.h, isSmall ? 7 : 10);
      ctx.fill();
      ctx.stroke();
      if (isHub) {
        ctx.fillStyle = pal.accent(0.07);
        roundRect(x + 7, y + 7, n.w - 14, n.h - 14, 8);
        ctx.fill();
        ctx.strokeStyle = pal.accent(0.22);
        roundRect(x + 7, y + 7, n.w - 14, n.h - 14, 8);
        ctx.stroke();
      }
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.font = (isSmall ? "10px" : "11px") + ' "IBM Plex Mono", monospace';
      ctx.fillStyle = hot ? pal.accentSolid : pal.label;
      ctx.fillText(n.label || n.kind, x + 12, y + (isSmall ? 8 : 11));
      ctx.font = (isHub ? "18px" : isSmall ? "11px" : "14px") + ' "IBM Plex Mono", monospace';
      ctx.fillStyle = hot || isHub ? pal.accentSolid : pal.labelHot;
      ctx.fillText(n.title, x + 12, y + (isSmall ? 20 : 28));
      if (!isSmall && width >= 700) {
        ctx.font = '11px "Inter", sans-serif';
        ctx.fillStyle = pal.label;
        var words = n.desc.split(" ");
        var line = "";
        var lines = [];
        words.forEach(function (word) {
          var test = line ? line + " " + word : word;
          if (ctx.measureText(test).width > n.w - 24 && line) {
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        });
        if (line) lines.push(line);
        lines.slice(0, 2).forEach(function (text, index) {
          ctx.fillText(text, x + 12, y + 48 + index * 15);
        });
      }
      ctx.restore();
    }

    function frame() {
      ctx.clearRect(0, 0, width, height);
      var time = performance.now() / 1000;
      packetPhase = (time * 0.18) % 1;
      defs.forEach(function (def) {
        var n = nodes[def.id];
        if (drag === def.id) {
          n.x = mouse.x;
          n.y = mouse.y;
          n.vx = 0;
          n.vy = 0;
          return;
        }
        n.vx = (n.vx || 0) + (n.homeX - n.x) * 0.045;
        n.vy = (n.vy || 0) + (n.homeY - n.y) * 0.045;
        if (!reduced && n.kind !== "evidence" && n.kind !== "gate") {
          n.vx += Math.cos(time * 0.8 + n.homeX * 0.02) * 0.018;
          n.vy += Math.sin(time * 0.9 + n.homeY * 0.02) * 0.018;
        }
        if (mouse.on && drag !== def.id) {
          var dx = n.x - mouse.x;
          var dy = n.y - mouse.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 12000) {
            var f = (1 - d2 / 12000) * (n.canDrag ? 1.9 : 0.8);
            n.vx += dx / Math.sqrt(d2 + 1) * f;
            n.vy += dy / Math.sqrt(d2 + 1) * f;
          }
        }
        n.vx *= 0.78;
        n.vy *= 0.78;
        n.x += n.vx;
        n.y += n.vy;
      });

      var active = findActive();
      var activeNode = active && nodes[active];
      canvas.style.cursor = drag ? "grabbing" : activeNode && activeNode.canDrag ? "grab" : "crosshair";

      drawGrid();
      drawRailLabels();
      drawLine("input", "control", active, { alpha: 0.34, width: 1.35, packet: true, offset: 0.05, bend: width < 700 ? 0 : -8 });
      drawLine("control", "workflow", active, { alpha: 0.34, width: 1.35, packet: true, offset: 0.48, bend: width < 700 ? 0 : -8 });
      drawLine("control", "evidence", active, { alpha: 0.18, width: 1, dashed: true, bend: width < 700 ? 0 : 22 });
      drawLine("control", "recovery", active, { alpha: 0.18, width: 1, dashed: true, bend: width < 700 ? 0 : 22 });
      drawLine("evidence", "workflow", active, { alpha: 0.14, width: 1, dashed: true, bend: width < 700 ? 0 : -24 });
      drawLine("recovery", "control", active, { alpha: 0.14, width: 1, dashed: true, bend: width < 700 ? 0 : -18 });

      ["evidence", "recovery"].forEach(function (id) { drawNode(id, active); });
      pipelineIds.forEach(function (id) { drawNode(id, active); });

      if (active && tip) {
        var tipNode = nodes[active];
        tip.innerHTML = "<b>" + tipNode.title + "</b>" + tipNode.desc;
        var tipX = width >= 700 ? (tipNode.x > width * 0.55 ? 16 : width - 268) : Math.min(Math.max(tipNode.x + 16, 8), width - 260);
        var tipY = width >= 700 ? 52 : Math.min(Math.max(tipNode.y - 12, 8), height - 90);
        tip.style.left = tipX + "px";
        tip.style.top = tipY + "px";
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
    canvas.addEventListener("pointerdown", function (event) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.on = true;
      var active = findActive();
      if (active && nodes[active] && nodes[active].canDrag) {
        drag = active;
        canvas.setPointerCapture(event.pointerId);
      }
    });
    canvas.addEventListener("pointerup", function () { drag = null; });
    canvas.addEventListener("pointercancel", function () { drag = null; });
    canvas.addEventListener("pointerleave", function () {
      if (!drag) {
        mouse.on = false;
        mouse.x = -999;
        mouse.y = -999;
      }
    });
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

  (function animatedAIChat() {
    var panel = document.querySelector("[data-ai-chat]");
    var input = document.getElementById("aiChatInput");
    var composer = panel ? panel.querySelector(".ai-chat-composer") : null;
    var menu = document.getElementById("aiCommandMenu");
    var state = document.getElementById("aiChatState");
    var typing = document.getElementById("aiChatTyping");
    var agentButtons = panel ? Array.prototype.slice.call(panel.querySelectorAll("[data-chat-agent]")) : [];
    var agentControl = panel ? panel.querySelector("[data-chat-attach]") : null;
    if (!panel || !input || !composer || !menu) return;

    var selectedAgent = agentButtons.length ? agentButtons[0].getAttribute("data-chat-agent") : "ChatGPT";
    function setState(value) {
      if (state) state.textContent = value;
    }
    function setAgent(agent) {
      selectedAgent = agent || "ChatGPT";
      agentButtons.forEach(function (button) {
        button.setAttribute("aria-pressed", button.getAttribute("data-chat-agent") === selectedAgent ? "true" : "false");
      });
      if (agentControl) agentControl.textContent = "agent: " + selectedAgent;
      input.placeholder = "Ask " + selectedAgent + " about adoption, writing, or an operating model";
      setState(input.value.trim() ? "draft / " + selectedAgent : selectedAgent);
    }
    function resize() {
      input.style.height = "auto";
      input.style.height = Math.min(178, Math.max(78, input.scrollHeight)) + "px";
    }
    function updateMenu() {
      var value = input.value.trim();
      var open = value.charAt(0) === "/" && value.indexOf(" ") === -1;
      composer.classList.toggle("commands-open", open);
      if (!open) return;
      menu.querySelectorAll("[data-chat-command]").forEach(function (button) {
        button.classList.toggle("active", button.getAttribute("data-chat-command").indexOf(value) === 0);
      });
    }
    function choose(command) {
      input.value = command + " ";
      input.focus();
      resize();
      composer.classList.remove("commands-open");
      setState(command.slice(1) + " / " + selectedAgent);
    }
    function send() {
      var value = input.value.trim();
      if (!value) return;
      input.value = "";
      resize();
      composer.classList.remove("commands-open");
      setState("asking " + selectedAgent);
      if (typing) typing.hidden = false;
      window.setTimeout(function () {
        if (typing) typing.hidden = true;
        setState(selectedAgent + " ready");
      }, 1600);
    }
    input.addEventListener("input", function () {
      resize();
      updateMenu();
      setState(input.value.trim() ? "draft / " + selectedAgent : selectedAgent);
    });
    input.addEventListener("focus", function () { composer.classList.add("focused"); });
    input.addEventListener("blur", function () { composer.classList.remove("focused"); });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") composer.classList.remove("commands-open");
      if ((event.key === "Tab" || event.key === "Enter") && composer.classList.contains("commands-open")) {
        var active = menu.querySelector(".active") || menu.querySelector("[data-chat-command]");
        if (active) {
          event.preventDefault();
          choose(active.getAttribute("data-chat-command"));
        }
        return;
      }
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        send();
      }
    });
    menu.querySelectorAll("[data-chat-command]").forEach(function (button) {
      button.addEventListener("click", function () { choose(button.getAttribute("data-chat-command")); });
    });
    panel.addEventListener("mousemove", function (event) {
      var rect = panel.getBoundingClientRect();
      panel.style.setProperty("--chat-x", ((event.clientX - rect.left) / rect.width * 100).toFixed(2) + "%");
      panel.style.setProperty("--chat-y", ((event.clientY - rect.top) / rect.height * 100).toFixed(2) + "%");
    });
    panel.querySelector("[data-chat-command-toggle]").addEventListener("click", function () {
      composer.classList.toggle("commands-open");
      input.focus();
    });
    panel.querySelector("[data-chat-send]").addEventListener("click", send);
    agentButtons.forEach(function (button) {
      button.addEventListener("click", function () { setAgent(button.getAttribute("data-chat-agent")); });
    });
    if (agentControl) {
      agentControl.addEventListener("click", function () {
        var index = agentButtons.findIndex(function (button) { return button.getAttribute("data-chat-agent") === selectedAgent; });
        var next = agentButtons[(index + 1) % agentButtons.length];
        if (next) setAgent(next.getAttribute("data-chat-agent"));
      });
    }
    setAgent(selectedAgent);
    resize();
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
      { section: "Navigate", label: "Ask AI agents", icon: "i-search", meta: "#ask-ai", action: function () { go("#ask-ai"); } },
      { section: "Navigate", label: "Department adoption", icon: "i-grid", meta: "department-adoption.html", action: function () { location.href = "department-adoption.html"; } },
      { section: "Navigate", label: "Writing archive", icon: "i-writing", meta: "writing-archive.html", action: function () { location.href = "writing-archive.html"; } },
      { section: "Actions", label: "Copy email", icon: "i-copy", meta: "ali.ozen@rwth-aachen.de", action: copyEmail },
      { section: "Actions", label: "Send email", icon: "i-mail", meta: "mailto", action: function () { location.href = "mailto:ali.ozen@rwth-aachen.de"; } },
      { section: "Theme", label: "Terminal data-field", icon: "i-moon", action: function () { setTheme("terminal"); } },
      { section: "Theme", label: "Old dark Linear", icon: "i-grid", action: function () { setTheme("linear"); } }
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
