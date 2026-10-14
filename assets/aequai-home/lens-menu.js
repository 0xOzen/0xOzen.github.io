/* Disclosure navigation: hover, touch and native keyboard tab order. */
(function () {
  const nav = document.querySelector('.lv-nav');
  const toggle = document.querySelector('.lv-menu-toggle');
  const shade = document.querySelector('.lv-menu-shade');
  if (!nav || !toggle || !shade) return;
  const groups = Array.from(nav.querySelectorAll('.lv-menu-group'));
  let timer;
  let current;
  function close(restore) {
    clearTimeout(timer);
    groups.forEach(function (group) {
      group.querySelector('button').setAttribute('aria-expanded', 'false');
      const panel = group.querySelector('.lv-menu-panel');
      panel.setAttribute('aria-hidden', 'true');
      panel.inert = true;
    });
    if (restore && current) current.querySelector('button').focus();
    current = null;
    shade.hidden = !nav.hasAttribute('data-mobile-open');
  }
  function open(group) {
    close(false);
    current = group;
    group.querySelector('button').setAttribute('aria-expanded', 'true');
    const panel = group.querySelector('.lv-menu-panel');
    panel.inert = false;
    panel.setAttribute('aria-hidden', 'false');
    shade.hidden = false;
  }
  groups.forEach(function (group) {
    const trigger = group.querySelector('button');
    const panel = group.querySelector('.lv-menu-panel');
    trigger.addEventListener('pointerenter', function (event) {
      if (event.pointerType === 'mouse') open(group);
    });
    trigger.addEventListener('click', function () {
      if (current === group && matchMedia('(hover:none)').matches) close(false);
      else open(group);
    });
    trigger.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') {
        event.preventDefault(); open(group); panel.querySelector('a').focus();
      }
    });
    [trigger, panel].forEach(function (element) {
      element.addEventListener('pointerenter', function () { clearTimeout(timer); });
      element.addEventListener('pointerleave', function () {
        timer = setTimeout(function () {
          if (!group.contains(document.activeElement)) close(false);
        }, 220);
      });
    });
  });
  nav.addEventListener('focusout', function (event) {
    if (!nav.contains(event.relatedTarget)) close(false);
  });
  toggle.addEventListener('click', function () {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(expanded));
    nav.toggleAttribute('data-mobile-open', expanded);
    close(false);
  });
  function dismiss(restore) {
    const mobileOpen = nav.hasAttribute('data-mobile-open');
    close(restore && !mobileOpen);
    nav.removeAttribute('data-mobile-open');
    toggle.setAttribute('aria-expanded', 'false');
    shade.hidden = true;
    if (restore && mobileOpen) toggle.focus();
  }
  shade.addEventListener('click', function () { dismiss(false); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') dismiss(true);
  });
  matchMedia('(max-width:960px)').addEventListener('change', function () { dismiss(false); });
})();
