(() => {
  const colors=window.shujinColors;
  const dialog=document.createElement('dialog');
  dialog.className='spectrum-dialog';
  dialog.setAttribute('aria-labelledby','spectrum-title');
  dialog.innerHTML='<header><h2 id="spectrum-title">蜀锦色谱</h2><button type="button" class="spectrum-close" aria-label="关闭蜀锦色谱"><img src="./public/icons/icon-spectrum-close.svg" alt=""></button></header><div class="spectrum-grid"></div><p class="spectrum-feedback" role="status"></p><button type="button" class="spectrum-confirm" disabled>确定（0/5）</button>';
  document.body.append(dialog);
  const info=document.createElement('div');
  info.className='color-info';info.setAttribute('popover','auto');info.setAttribute('role','region');info.setAttribute('aria-label','颜色信息');
  document.body.append(info);
  let committed=[],draft=[],beforeModal=[];
  const confirm=dialog.querySelector('.spectrum-confirm');
  const inlineConfirm=document.querySelector('.custom-confirm');
  function values(hex){
    const rgb=hex.slice(1).match(/../g).map(v=>parseInt(v,16));
    const [r,g,b]=rgb.map(v=>v/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
    let hue=d===0?0:max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;
    hue=(hue*60+360)%360;
    return {rgb:rgb.join(', '),hsb:`${Math.round(hue)}° / ${Math.round(max?d/max*100:0)}% / ${Math.round(max*100)}%`};
  }
  function paintSelection(){
    document.querySelectorAll('.spectrum-grid [data-color],.custom-color-grid [data-color]').forEach(b=>b.setAttribute('aria-pressed',String(draft.includes(Number(b.dataset.color)))));
    for(const button of [confirm,inlineConfirm]){button.textContent=`确定（${draft.length}/5）`;button.disabled=draft.length!==5;}
  }
  function showInfo(index,button){
    const color=colors[index],v=values(color.hex);
    info.innerHTML='<div class="color-info-sample"></div><h3></h3><dl><dt>HEX</dt><dd></dd><dt>RGB</dt><dd></dd><dt>HSB</dt><dd></dd></dl><p>颜色信息 · 只读</p>';
    info.querySelector('.color-info-sample').style.background=color.hex;
    info.querySelector('h3').textContent=color.name;
    info.querySelectorAll('dd').forEach((dd,i)=>dd.textContent=[color.hex.toUpperCase(),v.rgb,v.hsb][i]);
    if(dialog.open||committed.length===0){
      const add=document.createElement('button');add.type='button';add.className='color-info-add';
      add.textContent=draft.includes(index)?'从搭配中移除':'加入五色搭配';
      add.addEventListener('click',()=>{
        if(draft.includes(index))draft=draft.filter(i=>i!==index);
        else if(draft.length<5)draft.push(index);
        else {info.querySelector('p').textContent='最多选择五种颜色，请先移除一种。';return;}
        dialog.querySelector('.spectrum-feedback').textContent='';paintSelection();showInfo(index,button);
      });info.append(add);
    }
    info.showPopover();
    const rect=button.getBoundingClientRect(),w=info.offsetWidth,h=info.offsetHeight;
    info.style.left=Math.max(8,Math.min(rect.left,innerWidth-w-8))+'px';
    info.style.top=Math.max(8,rect.bottom+h+12<innerHeight?rect.bottom+8:rect.top-h-8)+'px';
  }
  function colorButton(index){
    const c=colors[index],b=document.createElement('button');b.type='button';b.className='spectrum-swatch';b.dataset.color=index;b.style.background=c.hex;
    b.setAttribute('aria-label',`${c.name} ${c.hex.toUpperCase()}`);b.title=c.name;
    b.addEventListener('click',()=>showInfo(index,b));return b;
  }
  // Figma's initial 6 × 3 overview.
  [0,1,4,5,6,7,2,3,15,16,17,8,11,12,26,18,19,9].forEach(i=>document.querySelector('.custom-color-grid').append(colorButton(i)));
  colors.forEach((_,i)=>dialog.querySelector('.spectrum-grid').append(colorButton(i)));
  document.querySelector('#all-custom-colors').addEventListener('click',()=>{
    info.hidePopover();beforeModal=[...draft];paintSelection();dialog.querySelector('.spectrum-feedback').textContent='';dialog.append(info);dialog.showModal();
  });
  dialog.querySelector('.spectrum-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{info.hidePopover();document.body.append(info);draft=[...beforeModal];paintSelection();});
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
  function applyPalette(){
    if(draft.length!==5)return;committed=[...draft];
    const panel=document.querySelector('#custom-selection');panel.hidden=false;
    document.querySelector('#custom-color-picker').hidden=true;
    document.querySelector('#custom-color-title').textContent='当前五色搭配';
    const row=panel.querySelector('.chosen-color-row');row.replaceChildren();committed.forEach(i=>row.append(colorButton(i)));
    info.hidePopover();beforeModal=[...committed];
    document.dispatchEvent(new CustomEvent('studio:palette-selected',{detail:{colors:committed.map(i=>({...colors[i]}))}}));if(dialog.open)dialog.close();
  }
  confirm.addEventListener('click',applyPalette);
  inlineConfirm.addEventListener('click',applyPalette);
  document.querySelector('#custom-reset').addEventListener('click',()=>{
    info.hidePopover();committed=[];draft=[];beforeModal=[];paintSelection();
    document.querySelector('#custom-selection').hidden=true;
    document.querySelector('#custom-color-picker').hidden=false;
    document.querySelector('#custom-color-title').textContent='选择你的五色搭配';
    document.querySelector('.chosen-color-row').replaceChildren();
    document.dispatchEvent(new CustomEvent('studio:palette-selected',{detail:{colors:[]}}));
  });
  paintSelection();
  document.querySelectorAll('[data-palette-tab]').forEach(b=>b.addEventListener('click',()=>info.hidePopover()));
  window.addEventListener('resize',()=>info.hidePopover());
})();
