/* Original personal control model; palette adapted to the Film B shell. */
(function(){
var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
var pal;
function refreshPalette(){
 const css=getComputedStyle(document.body), light=document.documentElement.dataset.theme==='light';
 const ink=light?'24,26,28':'232,234,236';
 const accent=css.getPropertyValue('--gk-a').trim()||'#ff8a3d';
 pal={line:a=>`rgba(${ink},${a})`,dot:`rgba(${ink},.5)`,accent:a=>`color-mix(in srgb, ${accent} ${a*100}%, transparent)`,accentSolid:accent,nodeFill:light?'#f4f6f5':'#000',nodeStroke:`rgba(${ink},.4)`,label:`rgba(${ink},.7)`,labelHot:light?'#181a1c':'#f2f2f3'};
}
refreshPalette();
new MutationObserver(refreshPalette).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
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

})();
