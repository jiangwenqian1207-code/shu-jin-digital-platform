(() => {
  const colorsSection=document.querySelector('.colors'), footer=document.querySelector('.global-footer');
  const syncHeight=()=>{
    document.documentElement.style.setProperty('--home-colors-height',colorsSection.offsetHeight+'px');
    document.documentElement.style.setProperty('--home-footer-height',footer.offsetHeight+'px');
  };
  const observer=new ResizeObserver(syncHeight);observer.observe(colorsSection);observer.observe(footer);syncHeight();
  const colors=window.shujinColors;
  const dialog=document.createElement('dialog');dialog.className='home-spectrum';dialog.setAttribute('aria-labelledby','home-spectrum-title');
  dialog.innerHTML='<header><h2 id="home-spectrum-title">蜀锦色谱</h2><button class="home-spectrum-close" aria-label="关闭蜀锦色谱">×</button></header><p>点击色块查看颜色名称与数值。当前展示网站已有的 '+colors.length+' 个数字色样；文献提及的 109 色与此数字色卡不作完整对应，屏幕显示也不等同于织物实色。</p><div class="home-spectrum-grid"></div><div class="home-spectrum-info" role="status">请选择一个色块，查看色彩信息。</div>';
  document.body.append(dialog);
  colors.forEach(c=>{
    const button=document.createElement('button');button.type='button';button.style.backgroundColor=c.hex;button.title=c.name+' '+c.hex;button.setAttribute('aria-label',button.title);button.setAttribute('aria-pressed','false');
    button.onclick=()=>{
      dialog.querySelectorAll('.home-spectrum-grid button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      const rgb=c.hex.slice(1).match(/../g).map(v=>parseInt(v,16)),[r,g,b]=rgb.map(v=>v/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
      const h=d===0?0:((max===r?(g-b)/d:max===g?(b-r)/d+2:(r-g)/d+4)*60+360)%360;
      const panel=dialog.querySelector('.home-spectrum-info');panel.replaceChildren();
      const sample=document.createElement('i');sample.style.background=c.hex;
      const text=document.createElement('div'),name=document.createElement('strong'),values=document.createElement('span');name.textContent=c.name;values.textContent=`HEX ${c.hex.toUpperCase()} · RGB ${rgb.join(', ')} · HSB ${Math.round(h)}° / ${Math.round(max?d/max*100:0)}% / ${Math.round(max*100)}%`;
      text.append(name,values);panel.append(sample,text);
    };
    dialog.querySelector('.home-spectrum-grid').append(button);
  });
  document.querySelector('.spectrum-entry').onclick=()=>dialog.showModal();
  dialog.querySelector('.home-spectrum-close').onclick=()=>dialog.close();
})();
