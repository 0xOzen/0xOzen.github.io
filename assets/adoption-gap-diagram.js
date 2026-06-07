const points = [
  {
    id: "access",
    code: "00",
    x: 130,
    y: 322,
    label: "Tool access",
    phase: "baseline",
    detail: "AI enters the team as tool access. Productivity looks stable because the operating model has not changed yet.",
    readout: ["access", "ungoverned"]
  },
  {
    id: "friction",
    code: "01",
    x: 430,
    y: 500,
    label: "Friction valley",
    phase: "workflow disruption",
    detail: "Prompts multiply, context fragments, handoffs get fuzzy, and nobody owns the new decision path.",
    readout: ["context", "fragmented"]
  },
  {
    id: "authority",
    code: "02",
    x: 600,
    y: 522,
    label: "Workflow authority",
    phase: "ownership reset",
    detail: "A real owner defines what AI can touch, who reviews output, and which work moves forward.",
    readout: ["owner", "assigned"]
  },
  {
    id: "turning",
    code: "03",
    x: 760,
    y: 380,
    label: "Turning point",
    phase: "approval gates",
    detail: "The curve turns when teams add approval gates, escalation rules, and recovery paths around AI-assisted work.",
    readout: ["gates", "active"]
  },
  {
    id: "evidence",
    code: "04",
    x: 905,
    y: 255,
    label: "Evidence trail",
    phase: "controlled momentum",
    detail: "Outputs become reviewable: source, prompt, owner, action, exception, and rollback are visible.",
    readout: ["evidence", "logged"]
  },
  {
    id: "momentum",
    code: "05",
    x: 1018,
    y: 120,
    label: "Positive momentum",
    phase: "adoption compounding",
    detail: "Productivity compounds after the operating model catches up with the tools.",
    readout: ["momentum", "rising"]
  }
];

const curvePath = "M92 322 H300 C334 322 342 344 352 388 C380 505 438 566 520 540 C612 510 675 436 760 380 C850 320 910 230 1018 120 C1090 43 1148 -70 1200 -150";

function contourPaths() {
  return [
    "M82 210 C195 82 330 112 458 178 C570 236 645 228 740 126",
    "M82 300 C210 176 342 198 486 280 C585 338 698 338 802 250 C918 152 1018 142 1138 250",
    "M82 390 C210 288 360 288 510 380 C646 464 770 472 900 392 C1010 324 1110 350 1164 446",
    "M82 490 C226 414 372 404 520 482 C640 545 760 590 920 560 C1038 538 1110 572 1176 650",
    "M82 596 C232 520 382 525 528 600 C650 662 762 712 950 735 C1060 748 1130 810 1172 905",
    "M82 720 C255 622 400 640 540 710 C675 778 760 850 886 928 C960 974 1048 1020 1192 1068",
    "M260 95 C402 206 518 318 620 468 C710 600 812 676 950 665 C1030 660 1095 690 1168 768",
    "M618 92 C656 190 704 284 758 352 C840 456 930 500 1090 485",
    "M165 590 C248 430 330 472 386 592 C448 726 460 884 525 1030",
    "M260 660 C348 580 468 640 540 752 C626 888 690 970 812 1030",
    "M565 642 C670 565 792 520 940 448 C1038 400 1100 365 1190 342",
    "M665 1070 C768 948 865 840 996 750 C1075 696 1138 685 1210 708"
  ];
}

function ellipseMarkup() {
  const valley = [
    [520, 545, 55, 70],
    [520, 545, 83, 106],
    [520, 545, 114, 145],
    [520, 545, 147, 188],
    [520, 545, 183, 236],
    [520, 545, 222, 292]
  ];
  const momentum = [
    [925, 318, 80, 170],
    [925, 318, 120, 235],
    [925, 318, 168, 312],
    [925, 318, 228, 398]
  ];
  return valley.concat(momentum).map((e) => (
    `<ellipse class="adoption-gap__contour adoption-gap__contour-strong" cx="${e[0]}" cy="${e[1]}" rx="${e[2]}" ry="${e[3]}" transform="rotate(-7 ${e[0]} ${e[1]})"></ellipse>`
  )).join("");
}

function gridMarkup() {
  let out = "";
  [90, 230, 370, 510, 650, 790, 930, 1070].forEach((x) => {
    out += `<line class="adoption-gap__grid" x1="${x}" y1="74" x2="${x}" y2="600"></line>`;
  });
  [85, 165, 245, 325, 405, 485, 565].forEach((y) => {
    out += `<line class="adoption-gap__grid" x1="76" y1="${y}" x2="1125" y2="${y}"></line>`;
  });
  return out;
}

function controlsMarkup() {
  return points.map((point) => (
    `<button class="adoption-gap__control" type="button" data-gap-point="${point.id}" aria-pressed="${point.id === "access" ? "true" : "false"}">
      <code>${point.code}</code>
      <b>${point.label}</b>
      <small>${point.phase}</small>
    </button>`
  )).join("");
}

function svgMarkup() {
  return `
    <svg class="adoption-gap__svg" viewBox="0 0 1200 640" role="img" aria-labelledby="adoption-gap-title adoption-gap-desc">
      <title id="adoption-gap-title">Adoption Gap Curve</title>
      <desc id="adoption-gap-desc">Interactive productivity over time curve showing tool access, friction valley, workflow authority, approval gates, evidence trail, and positive momentum.</desc>
      <rect x="0" y="0" width="1200" height="640" fill="#f3efe0"></rect>
      <g>${gridMarkup()}</g>
      <g>${contourPaths().map((d) => `<path class="adoption-gap__contour" d="${d}"></path>`).join("")}${ellipseMarkup()}</g>

      <line class="adoption-gap__axis" x1="76" y1="600" x2="1125" y2="600"></line>
      <line class="adoption-gap__axis" x1="76" y1="74" x2="76" y2="600"></line>
      <line class="adoption-gap__guide" x1="76" y1="322" x2="1125" y2="322"></line>
      <line class="adoption-gap__guide" x1="520" y1="545" x2="520" y2="600"></line>
      <line class="adoption-gap__guide" x1="760" y1="380" x2="760" y2="600"></line>
      <line class="adoption-gap__guide" x1="905" y1="255" x2="905" y2="600"></line>
      <line class="adoption-gap__guide" x1="76" y1="545" x2="520" y2="545"></line>
      <line class="adoption-gap__guide" x1="76" y1="380" x2="760" y2="380"></line>

      <text class="adoption-gap__label-muted" x="565" y="628">Time</text>
      <text class="adoption-gap__label-muted" x="24" y="335" transform="rotate(-90 24 335)">Productivity</text>
      <text class="adoption-gap__label-muted" x="88" y="310">shared baseline</text>
      <text class="adoption-gap__annotation" x="798" y="370">TURNING POINT</text>
      <text class="adoption-gap__annotation" x="798" y="390">approval gates + recovery</text>
      <text class="adoption-gap__annotation" x="544" y="566">FRICTION VALLEY</text>
      <text class="adoption-gap__annotation" x="544" y="586">context fragmentation</text>

      <path class="adoption-gap__curve-under" d="${curvePath}"></path>
      <path class="adoption-gap__curve" d="${curvePath}"></path>

      <g class="adoption-gap__points">
        ${points.map((point) => `<circle class="adoption-gap__point${point.id === "access" ? " is-active" : ""}" data-gap-point-dot="${point.id}" cx="${point.x}" cy="${point.y}" r="5.5"></circle>`).join("")}
      </g>

      <g class="adoption-gap__crosshair" data-gap-crosshair>
        <line class="adoption-gap__probe-line" data-gap-xline x1="0" y1="0" x2="0" y2="640"></line>
        <line class="adoption-gap__probe-line" data-gap-yline x1="0" y1="0" x2="1200" y2="0"></line>
        <circle class="adoption-gap__probe" data-gap-probe cx="0" cy="0" r="5"></circle>
      </g>
    </svg>
  `;
}

function componentMarkup() {
  return `
    <div class="adoption-gap" aria-label="Interactive Adoption Gap Curve">
      <div class="adoption-gap__head">
        <span><b>adoption-gap-curve.live</b> / operating-model transition</span>
        <span class="adoption-gap__live"><i></i> interactive checkpoint map</span>
      </div>
      <div class="adoption-gap__body">
        <div class="adoption-gap__chart-shell" data-gap-chart>
          ${svgMarkup()}
        </div>
        <aside class="adoption-gap__side">
          <div class="adoption-gap__console" data-gap-console>
            <div class="adoption-gap__meta"><span data-gap-code>00</span><span>phase monitor</span></div>
            <div class="adoption-gap__phase" data-gap-phase>baseline</div>
            <p class="adoption-gap__copy" data-gap-copy>${points[0].detail}</p>
            <div class="adoption-gap__readout">
              <span><b data-gap-readout-a>${points[0].readout[0]}</b>control surface</span>
              <span><b data-gap-readout-b>${points[0].readout[1]}</b>operational state</span>
            </div>
          </div>
          <div class="adoption-gap__controls" aria-label="Adoption curve checkpoints">
            ${controlsMarkup()}
          </div>
          <div class="adoption-gap__foot">Move across the chart or select a checkpoint. The gap closes only when tool access is wrapped with authority, ownership, approval, evidence, escalation, and recovery.</div>
        </aside>
      </div>
    </div>
  `;
}

function nearestPoint(x, y) {
  return points.reduce((best, point) => {
    const distance = Math.hypot(point.x - x, point.y - y);
    return distance < best.distance ? { point, distance } : best;
  }, { point: points[0], distance: Infinity }).point;
}

function setActive(root, point) {
  root.querySelector("[data-gap-code]").textContent = point.code;
  root.querySelector("[data-gap-phase]").textContent = point.phase;
  root.querySelector("[data-gap-copy]").textContent = point.detail;
  root.querySelector("[data-gap-readout-a]").textContent = point.readout[0];
  root.querySelector("[data-gap-readout-b]").textContent = point.readout[1];
  root.querySelectorAll("[data-gap-point]").forEach((button) => {
    button.setAttribute("aria-pressed", button.getAttribute("data-gap-point") === point.id ? "true" : "false");
  });
  root.querySelectorAll("[data-gap-point-dot]").forEach((dot) => {
    dot.classList.toggle("is-active", dot.getAttribute("data-gap-point-dot") === point.id);
  });
}

function init(root) {
  root.innerHTML = componentMarkup();
  const chart = root.querySelector("[data-gap-chart]");
  const svg = root.querySelector(".adoption-gap__svg");
  const crosshair = root.querySelector("[data-gap-crosshair]");
  const xLine = root.querySelector("[data-gap-xline]");
  const yLine = root.querySelector("[data-gap-yline]");
  const probe = root.querySelector("[data-gap-probe]");
  const consoleBox = root.querySelector("[data-gap-console]");

  root.querySelectorAll("[data-gap-point]").forEach((button) => {
    button.addEventListener("click", () => {
      const point = points.find((item) => item.id === button.getAttribute("data-gap-point"));
      if (point) setActive(root, point);
    });
  });

  svg.addEventListener("pointermove", (event) => {
    const rect = svg.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 1200;
    const y = (event.clientY - rect.top) / rect.height * 640;
    const point = nearestPoint(x, y);
    crosshair.classList.add("is-on");
    xLine.setAttribute("x1", x.toFixed(1));
    xLine.setAttribute("x2", x.toFixed(1));
    yLine.setAttribute("y1", y.toFixed(1));
    yLine.setAttribute("y2", y.toFixed(1));
    probe.setAttribute("cx", point.x);
    probe.setAttribute("cy", point.y);
    if (consoleBox) {
      consoleBox.style.setProperty("--gap-x", `${Math.max(0, Math.min(100, x / 12)).toFixed(2)}%`);
      consoleBox.style.setProperty("--gap-y", `${Math.max(0, Math.min(100, y / 6.4)).toFixed(2)}%`);
    }
    setActive(root, point);
  });

  svg.addEventListener("pointerleave", () => {
    crosshair.classList.remove("is-on");
  });

  if (chart && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          root.classList.add("is-visible");
          observer.disconnect();
        }
      });
    }, { threshold: 0.22 });
    observer.observe(chart);
  }
}

document.querySelectorAll("[data-adoption-gap-diagram]").forEach(init);
