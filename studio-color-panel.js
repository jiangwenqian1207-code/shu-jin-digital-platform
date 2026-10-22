(() => {
  const $=s=>document.querySelector(s),colors=window.shujinColors;
  const roles=[['C1','勾线'],['C2','主色'],['C3','点缀'],['C4','辅色'],['底色','底色']];
  const defaults=[{hex:'#438f80',name:'默认青绿'},{hex:'#b1442b',name:'默认朱红'},{hex:'#c48b35',name:'默认暖黄'},{hex:'#2c4b78',name:'默认靛蓝'},{hex:'#f0e5ca',name:'默认米白'}];
  let palette=defaults.map(c=>({...c})),active=0,pending=null,uploadToken=0,referenceUrl;
  const dialog=document.createElement('dialog');dialog.className='spectrum-dialog';dialog.setAttribute('aria-labelledby','spectrum-title');
  dialog.innerHTML='<header><h2 id="spectrum-title">替换 C1 · 勾线</h2><button type="button" class="spectrum-close" aria-label="关闭蜀锦色谱"><img src="./public/icons/icon-spectrum-close.svg" alt=""></button></header><div class="role-switcher"></div><h3 class="spectrum-subtitle">蜀锦色谱 · 107 色</h3><div class="spectrum-grid"></div><h3 class="spectrum-subtitle reference-title" hidden>参考图提取色</h3><div class="reference-grid"></div><section class="role-color-info" aria-label="颜色信息"><p>请选择要使用的颜色</p></section><button type="button" class="spectrum-confirm" disabled>应用到当前色位</button>';
  document.body.append(dialog);
  const confirm=dialog.querySelector('.spectrum-confirm');
  function emit(source){const detail={source,colors:palette.map((c,i)=>({...c,role:roles[i][0],purpose:roles[i][1]}))};window.studioSelectedPalette=detail;document.dispatchEvent(new CustomEvent('studio:palette-selected',{detail}));}
  function details(c){
    const rgb=c.hex.slice(1).match(/../g).map(v=>parseInt(v,16)),[r,g,b]=rgb.map(v=>v/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
    const h=d===0?0:((max===r?(g-b)/d:max===g?(b-r)/d+2:(r-g)/d+4)*60+360)%360;
    const section=dialog.querySelector('.role-color-info');section.replaceChildren();
    const sample=document.createElement('i');sample.style.background=c.hex;section.append(sample);
    const text=document.createElement('div');const name=document.createElement('strong');name.textContent=c.name;text.append(name);
    const p=document.createElement('p');p.textContent=`HEX ${c.hex.toUpperCase()} · RGB ${rgb.join(', ')} · HSB ${Math.round(h)}° / ${Math.round(max?d/max*100:0)}% / ${Math.round(max*100)}%`;text.append(p);section.append(text);
  }
  function choose(c){pending={...c};details(c);confirm.disabled=false;dialog.querySelectorAll('.spectrum-swatch').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hex===c.hex)));}
  function swatch(c){const b=document.createElement('button');b.type='button';b.className='spectrum-swatch';b.style.background=c.hex;b.dataset.hex=c.hex;b.title=c.name+' '+c.hex;b.setAttribute('aria-label',b.title);b.addEventListener('click',()=>choose(c));return b;}
  function updateDialog(){dialog.querySelector('h2').textContent=`替换 ${roles[active][0]} · ${roles[active][1]}`;confirm.textContent=`应用到 ${roles[active][0]}`;dialog.querySelectorAll('[data-role]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.role===active)));choose(palette[active]);}
  function openRole(i){active=i;updateDialog();if(!dialog.open)dialog.showModal();}
  function render(){const container=$('.role-colors');container.replaceChildren();palette.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.className='role-color';b.setAttribute('aria-label',`替换 ${roles[i][0]} ${roles[i][1]}：${c.name}`);const dot=document.createElement('i');dot.style.background=c.hex;const label=document.createElement('span');label.textContent=roles[i][0];const small=document.createElement('small');small.textContent=roles[i][1];b.append(dot,label,small);b.addEventListener('click',()=>openRole(i));container.append(b);});}
  roles.forEach(([id,name],i)=>{const b=document.createElement('button');b.type='button';b.textContent=id+' '+name;b.dataset.role=i;b.addEventListener('click',()=>{active=i;updateDialog();});dialog.querySelector('.role-switcher').append(b);});
  colors.forEach(c=>dialog.querySelector('.spectrum-grid').append(swatch(c)));
  $('#all-custom-colors').addEventListener('click',()=>openRole(active));
  confirm.addEventListener('click',()=>{if(!pending)return;palette[active]={...pending};render();emit('custom');dialog.close();});
  dialog.querySelector('.spectrum-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
  $('#custom-reset').addEventListener('click',()=>{palette=defaults.map(c=>({...c}));render();emit('custom');});
  document.addEventListener('studio:classic-palette',e=>{
    // Largest-area extracted color becomes background; others keep frequency order.
    const c=e.detail.colors;palette=[c[1],c[2],c[3],c[4],c[0]].map(x=>({...x}));render();emit('classic');
  });
  $('#palette-reference').addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file)return;const token=++uploadToken,status=$('#extraction-status');
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>15*1024*1024){status.textContent='请选择 15 MB 以内的 PNG、JPEG 或 WebP 图片。';e.target.value='';return;}
    const url=URL.createObjectURL(file);status.textContent='正在本地提取主要颜色…';
    try{const extracted=await window.extractStudioColors(url);if(token!==uploadToken){URL.revokeObjectURL(url);return;}
      if(referenceUrl)URL.revokeObjectURL(referenceUrl);referenceUrl=url;
      const thumb=$('#reference-thumbnail');thumb.src=url;thumb.hidden=false;
      const result=extracted.map((c,i)=>({...c,name:`参考图取色 ${i+1}（${Math.round(c.weight*100)}%）`}));
      $('#extracted-colors').replaceChildren();dialog.querySelector('.reference-grid').replaceChildren();dialog.querySelector('.reference-title').hidden=false;
      result.forEach(c=>{const b=swatch(c);b.addEventListener('click',()=>{openRole(active);choose(c);});$('#extracted-colors').append(b);dialog.querySelector('.reference-grid').append(swatch(c));});
      status.textContent=`已提取 ${result.length} 个主要颜色。点击色位后，可选择参考图提取色。图片仅在本机处理。`;
    }catch(error){URL.revokeObjectURL(url);if(token===uploadToken)status.textContent=error.message.includes('图片')?error.message:'提取失败，请尝试其他图片。';}
    e.target.value='';
  });
  render();
})();
