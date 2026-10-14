/* Shared subpage theme and square field, using the homepage's palette and mark. */
(() => {
  const root = document.documentElement, toggle = document.getElementById('fbh-theme');
  function setTheme(theme) {
    root.dataset.theme = theme === 'dark' ? 'dark' : 'light';
    try { localStorage.setItem('aequai.site.theme', root.dataset.theme); } catch (_) {}
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
      toggle.setAttribute('aria-label', `Switch to ${root.dataset.theme === 'dark' ? 'light' : 'dark'} theme`);
    }
  }
  window.PersonalSite = { setTheme };
  setTheme(root.dataset.theme);
  toggle?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
  const updateHeader = () => root.classList.toggle("ns-head", scrollY > 100);
  addEventListener("scroll", updateHeader, { passive: true }); updateHeader();
  const canvas = document.querySelector('.ps-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!ctx) return;
  let width = 0, height = 0, frame = 0, time = 0, visible = true;
  const rand = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return v - Math.floor(v); };
  const cells = ['1111111','1000001','1010101','1010101','1010101','1000001','1111111'];
  const points = []; cells.forEach((row,y) => [...row].forEach((v,x) => { if(v==='1') for(let k=0;k<9;k++) points.push([x+(k%3)/3,y+Math.floor(k/3)/3]); }));
  function draw() {
    const style = getComputedStyle(document.body), ink = style.getPropertyValue('--gk-ink-rgb').trim(), accent = style.getPropertyValue('--gk-a').trim();
    ctx.clearRect(0,0,width,height);
    // A quiet square field spans the hero; the right-hand mark cycles through entropy.
    for(let y=0;y<height;y+=14) for(let x=0;x<width;x+=14) {
      const seed=rand(x+y*53);if(seed<.91)continue;
      ctx.globalAlpha=(seed-.9)*.65;ctx.fillStyle=`rgb(${ink})`;ctx.fillRect(x,y,5,5);
    }
    const size=Math.min(280,width*.27), cx=width*.84, cy=Math.min(height*.45,240), phase=reduced.matches?1:(Math.sin(time*.00025)+1)/2, formed=phase*phase*(3-2*phase);
    points.forEach(([x,y],i)=>{
      const sx=rand(i+9)*width,sy=rand(i+48)*height;
      const tx=cx+(x-3.5)*size/7,ty=cy+(y-3.5)*size/7;
      ctx.globalAlpha=(width<700?.12:.25)+formed*.18;ctx.fillStyle=i%7===0?accent:`rgb(${ink})`;
      ctx.fillRect(sx+(tx-sx)*formed,sy+(ty-sy)*formed,4,4);
    });ctx.globalAlpha=1;
  }
  function tick(t) { frame=0;time=t;draw();if(!reduced.matches&&!document.hidden&&visible)frame=requestAnimationFrame(tick); }
  function sync() { cancelAnimationFrame(frame);frame=0;draw();if(!reduced.matches&&!document.hidden&&visible)frame=requestAnimationFrame(tick); }
  function resize() { const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);width=rect.width;height=rect.height;canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);sync(); }
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(canvas);
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-theme']});
  reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);resize();
})();
