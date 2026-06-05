/* Motion.dev enhancement layer. The static JS keeps the page usable if CDN loading fails. */
(function () {
  "use strict";

  var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  import("https://cdn.jsdelivr.net/npm/motion@12.40.0/+esm")
    .then(function (motion) {
      var animate = motion.animate;
      var inView = motion.inView;
      var stagger = motion.stagger;
      var scroll = motion.scroll;

      var progress = document.createElement("div");
      progress.style.cssText = "position:fixed;top:48px;left:0;right:0;height:2px;transform-origin:0 50%;transform:scaleX(0);background:var(--accent);z-index:29;box-shadow:0 0 10px var(--accent-dim)";
      document.body.appendChild(progress);
      scroll(function (position) {
        progress.style.transform = "scaleX(" + position + ")";
      });

      inView("[data-reveal]", function (info) {
        animate(info.target, { opacity: [0, 1], y: [18, 0] }, { duration: 0.6, easing: [0.2, 0.7, 0.2, 1] });
      }, { margin: "0px 0px -12% 0px" });

      document.querySelectorAll("[data-stagger]").forEach(function (group) {
        inView(group, function () {
          animate(group.children, { opacity: [0, 1], y: [16, 0] }, { delay: stagger(0.06), duration: 0.5, easing: [0.2, 0.7, 0.2, 1] });
        }, { margin: "0px 0px -10% 0px" });
      });

      document.querySelectorAll(".btn, .linkbtn, .iconbtn, .ladder-step, .signal-controls button").forEach(function (control) {
        control.addEventListener("pointerdown", function () { animate(control, { scale: 0.97 }, { duration: 0.08 }); });
        control.addEventListener("pointerup", function () { animate(control, { scale: 1 }, { type: "spring", stiffness: 500, damping: 18 }); });
        control.addEventListener("pointerleave", function () { animate(control, { scale: 1 }, { duration: 0.12 }); });
      });
    })
    .catch(function () {
      /* Offline or blocked CDN: no-op. */
    });
})();
