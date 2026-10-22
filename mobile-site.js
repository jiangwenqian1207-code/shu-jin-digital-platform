(() => {
  const mobile=matchMedia('(max-width:767px)');
  const links=[['index.html','首页'],['digital-pattern-library.html','数字纹样库'],['digital-artworks.html','数字艺术作品'],['ai-studio.html','AI纹样创作空间']];
  const bar=document.createElement('div');bar.className='mobile-site-bar';
  bar.innerHTML='<a href="./index.html" aria-label="锦官织境首页"><img class="mobile-mark" src="./public/figma-assets/logo-mark.png" alt=""><img class="mobile-wordmark" src="./public/figma-assets/logo-wordmark.svg" alt="锦官织境"></a><button class="mobile-site-toggle" type="button" aria-label="打开侧边菜单" aria-haspopup="dialog" aria-controls="mobile-site-drawer" aria-expanded="false"><i></i><i></i><i></i></button>';
  const drawer=document.createElement('dialog');drawer.id='mobile-site-drawer';drawer.className='mobile-site-drawer';drawer.setAttribute('aria-labelledby','mobile-drawer-title');
  const file=location.pathname.split('/').pop()||'index.html';
  drawer.innerHTML='<div class="mobile-drawer-head"><span id="mobile-drawer-title">锦官织境</span><button class="mobile-drawer-close" type="button" aria-label="关闭侧边菜单">×</button></div><nav aria-label="手机端主导航">'+links.map(([href,label])=>`<a href="./${href}" ${file===href?'aria-current="page"':''}>${label}</a>`).join('')+'</nav><p>以数字技术连接蜀锦传统纹样、<br>文化知识与当代创作。</p>';
  document.body.append(bar,drawer);
  const toggle=bar.querySelector('button');
  toggle.onclick=()=>{drawer.showModal();toggle.setAttribute('aria-expanded','true');document.body.classList.add('mobile-site-open');};
  drawer.querySelector('button').onclick=()=>drawer.close();
  drawer.addEventListener('click',e=>{if(e.target===drawer){const r=drawer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right)drawer.close();}});
  drawer.addEventListener('close',()=>{toggle.setAttribute('aria-expanded','false');document.body.classList.remove('mobile-site-open');if(mobile.matches)toggle.focus({preventScroll:true});});
  drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>drawer.close()));
  // Enforce a 12px floor only for text-bearing HTML elements, including dynamic cards.
  // Keep each element's original inline style so desktop presentation is unchanged.
  const changed=new Map();
  function floorFonts(){
    if(!mobile.matches){if(drawer.open)drawer.close();changed.forEach((v,e)=>{if(v.value)e.style.setProperty('font-size',v.value,v.priority);else e.style.removeProperty('font-size');});changed.clear();return;}
    document.body.querySelectorAll('*').forEach(e=>{
      if(!(e instanceof HTMLElement)||e.matches('script,style')||!e.getClientRects().length)return;
      const text=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())||e.matches('input,textarea');
      const size=parseFloat(getComputedStyle(e).fontSize);
      if(text&&size>0&&size<12){if(!changed.has(e))changed.set(e,{value:e.style.getPropertyValue('font-size'),priority:e.style.getPropertyPriority('font-size')});e.style.setProperty('font-size','12px','important');}
    });
  }
  let frame;const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(floorFonts);};
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  mobile.addEventListener('change',schedule);window.addEventListener('resize',schedule);document.addEventListener('click',schedule);schedule();
})();
