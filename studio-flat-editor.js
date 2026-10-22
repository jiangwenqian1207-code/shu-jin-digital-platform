/* Raster editing is independent of product UV / camera controls. */
(() => {
  const $ = s => document.querySelector(s);
  const panel = $('#edit-panel');
  const product = document.createElement('div');
  product.id = 'product-edit-controls';
  product.append(...panel.childNodes);
  panel.append(product);
  const flat = document.createElement('div');
  flat.id = 'flat-edit-controls';
  panel.append(flat);
  const defaults = {brightness:100,saturation:100,hue:0,scale:100,rotation:0,density:2,gap:0,x:0,y:0,mirrorX:false,mirrorY:false,composition:'方格式',background:'#fcfbf4'};
  let state = {...defaults}, past = [], future = [], source = null, loadToken = 0;
  const names = ['矩形式','方格式','散点式'];
  function diagram(name) {
    const file = {'矩形式':'rectangle','方格式':'grid','散点式':'scatter'}[name];
    return `<img src="./public/ai-studio/composition-${file}.svg" alt="">`;
  }
  function slider(key,label,min,max,unit,step=1) {
    return `<label class="flat-slider"><span>${label}</span><input type="range" data-flat="${key}" min="${min}" max="${max}" step="${step}" value="${state[key]}"><output data-value="${key}">${state[key]}${unit}</output></label>`;
  }
  flat.innerHTML = `<header><span class="flat-eyebrow">PATTERN EDITOR / 2D</span><h2>平面纹样编辑</h2><p>编辑图像单元，再将结果应用到产品。</p></header>
    <section><h3><b>01</b> 配色调整</h3>${slider('brightness','明度',30,170,'%')}${slider('saturation','饱和度',0,200,'%')}${slider('hue','色相',-180,180,'°')}<label class="flat-color">留白底色<input type="color" data-flat="background" value="#fcfbf4"></label></section>
    <section><h3><b>02</b> 单元调整</h3>${slider('scale','缩放',20,200,'%')}${slider('rotation','旋转',-180,180,'°')}<div class="flat-actions"><button data-mirror="mirrorX" aria-pressed="false">水平镜像</button><button data-mirror="mirrorY" aria-pressed="false">垂直镜像</button></div>${slider('x','水平偏移',-50,50,'%')}${slider('y','垂直偏移',-50,50,'%')}</section>
    <section><h3><b>03</b> 构图与重复</h3><div class="flat-compositions">${names.map(name=>`<button data-flat-composition="${name}" aria-pressed="${name===state.composition}">${diagram(name)}<span>${name}</span></button>`).join('')}</div>${slider('density','重复数量',1,5,'',1)}${slider('gap','单元间距',0,60,'%')}<p class="flat-help">单元视图展示一个编辑单元；切换连续铺平，查看排列效果。块面示意用于排列参考。</p></section>
    <section><h3><b>04</b> 编辑记录</h3><div class="flat-actions"><button id="flat-undo" disabled>撤销</button><button id="flat-redo" disabled>重做</button><button id="flat-reset">恢复原图</button></div></section>
    <p class="flat-help" id="flat-status" role="status">正在载入本地示例…</p><div class="flat-actions"><button id="flat-save">导出 PNG</button><button id="flat-apply" class="flat-primary">应用到 3D →</button></div><button type="button" class="flat-upload" id="flat-publish">上传到素材纹样库</button><p class="flat-help">登录后填写作品信息与使用授权。当前发布仅保存于本浏览器，不会公开上传。</p>`;
  const preview = document.createElement('section');
  preview.className = 'flat-preview'; preview.hidden = true;
  preview.innerHTML = '<div class="flat-preview-heading"><span id="flat-preview-title">单元纹样</span><span>实时预览 / 2D</span></div><div class="flat-canvas-wrap"><canvas id="flat-canvas" width="1000" height="1000" aria-label="编辑后的平面纹样预览"></canvas></div><p id="flat-source-note">花鸟基础单元示例 · 非 AI 生成结果</p>';
  $('.studio-stage').append(preview);
  const canvas = $('#flat-canvas'), ctx = canvas.getContext('2d');
  const view = () => $('[data-view][aria-pressed="true"]').dataset.view;
  function message(text) {$('#flat-status').textContent=text;}
  function sync() {
    const editing = !panel.hidden, v = view();
    product.hidden = v!=='product'; flat.hidden = v==='product';
    preview.hidden = !(editing && v!=='product');
    $('.studio-stage').classList.toggle('flat-editing',!preview.hidden);
    $('#single-view').hidden = v!=='single' || !preview.hidden;
    $('#repeat-view').hidden = v!=='repeat' || !preview.hidden;
    $('#flat-preview-title').textContent=v==='repeat'?'连续铺平 · 构图预览':'单元纹样 · 图像单元';
    render();
  }
  function drawMotif(side) {
    // Draw the source directly: no intermediate tile can clip a scaled/rotated motif.
    ctx.save();ctx.translate(state.x*side/100,state.y*side/100);
    ctx.rotate(state.rotation*Math.PI/180);
    ctx.scale((state.mirrorX?-1:1)*state.scale/100,(state.mirrorY?-1:1)*state.scale/100);
    ctx.filter=`brightness(${state.brightness}%) saturate(${state.saturation}%) hue-rotate(${state.hue}deg)`;
    const ratio=.86*side/Math.max(source.width,source.height);
    ctx.drawImage(source,-source.width*ratio/2,-source.height*ratio/2,source.width*ratio,source.height*ratio);
    ctx.restore();
  }
  function render() {
    if(!source)return;
    ctx.clearRect(0,0,1000,1000);
    canvas.style.backgroundColor=state.background;
    if(view()!=='repeat'){ctx.save();ctx.translate(500,500);drawMotif(1000);ctx.restore();return;}
    ctx.fillStyle=state.background;ctx.fillRect(0,0,1000,1000);
    // Integer columns fit one complete repeat period; a partial last column used to
    // wrap back over the first motif and create an extra bird at the left edge.
    const columns=state.composition==='矩形式'?Math.ceil(state.density/.6):state.density;
    const w=1000/columns, h=1000/state.density;
    for(let row=0;row<state.density;row++)for(let col=0;col<columns;col++){
      const scatter=state.composition==='散点式';
      const seed=(row*31+col*17+13)%23;
      const px=col*w+w/2+(scatter?(seed/23-.5)*w*.5:0);
      const py=row*h+h/2+(scatter?((seed*7%23)/23-.5)*h*.5:0);
      const f=(1-state.gap/100)*(scatter?.52+seed/23*.25:1);
      const side=Math.min(w,h)*f;
      // Wrap whole transparent motifs at the tile boundary, without geometric clipping.
      for(const dx of [-1000,0,1000])for(const dy of [-1000,0,1000]){
        ctx.save();ctx.translate(px+dx,py+dy);
        if(scatter)ctx.rotate((seed/23-.5)*.7);
        drawMotif(side);ctx.restore();
      }
    }
  }
  function controls(){
    flat.querySelectorAll('[data-flat]').forEach(el=>{el.value=state[el.dataset.flat];const out=flat.querySelector(`[data-value="${el.dataset.flat}"]`);if(out)out.textContent=el.value+(['hue','rotation'].includes(el.dataset.flat)?'°':el.dataset.flat==='density'?'':'%');});
    flat.querySelectorAll('[data-mirror]').forEach(el=>el.setAttribute('aria-pressed',state[el.dataset.mirror]));
    flat.querySelectorAll('[data-flat-composition]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.flatComposition===state.composition));
    $('#flat-undo').disabled=!past.length;$('#flat-redo').disabled=!future.length;render();
  }
  let committed=JSON.stringify(state);
  function commit(){if(JSON.stringify(state)===committed)return;past.push(JSON.parse(committed));if(past.length>30)past.shift();future=[];committed=JSON.stringify(state);controls();}
  flat.addEventListener('input',e=>{const key=e.target.dataset.flat;if(!key)return;state[key]=key==='background'?e.target.value:Number(e.target.value);controls();});
  flat.addEventListener('change',e=>{if(e.target.dataset.flat)commit();});
  flat.addEventListener('click',e=>{
    const mirror=e.target.closest('[data-mirror]'), comp=e.target.closest('[data-flat-composition]');
    if(mirror){state[mirror.dataset.mirror]=!state[mirror.dataset.mirror];commit();}
    if(comp){state.composition=comp.dataset.flatComposition;commit();$('[data-view="repeat"]').click();}
  });
  $('#flat-undo').onclick=()=>{if(!past.length)return;future.push({...state});state=past.pop();committed=JSON.stringify(state);controls();};
  $('#flat-redo').onclick=()=>{if(!future.length)return;past.push({...state});state=future.pop();committed=JSON.stringify(state);controls();};
  $('#flat-reset').onclick=()=>{state={...defaults};commit();};
  async function load(url,label){
    const token=++loadToken;
    try{const img=new Image();img.src=url;await img.decode();if(token!==loadToken)return;
      if(img.width*img.height>40000000)throw new Error('图像过大');
      source=img;state={...defaults};past=[];future=[];committed=JSON.stringify(state);controls();
      $('#flat-source-note').textContent=label;message('以独立主体进行排列，单元 PNG 保留透明底。完成编辑后，可导出、应用到 3D，或填写授权信息上传到素材纹样库。');
    }catch{if(token===loadToken)message('图像读取失败，请使用不超过 4000 万像素的 PNG、JPG 或 WebP 图片。');}
  }
  $('#flat-publish').onclick=()=>{
    if(!source){message('纹样尚未载入，请稍后重试。');return;}
    const snapshot={composition:state.composition,mode:view()==='repeat'?'连续构图':'单元纹样',source:$('#flat-source-note').textContent};
    canvas.toBlob(blob=>{if(blob)document.dispatchEvent(new CustomEvent('studio:publish-request',{detail:{...snapshot,blob}}));else message('无法生成作品快照，请重试。');});
  };
  $('#flat-save').onclick=()=>{if(!source)return;canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=view()==='repeat'?'纹样-连续构图.png':'纹样-透明单元.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('已导出 PNG；单元模式保留透明底，连续模式包含构图底色。');});};
  $('#flat-apply').onclick=()=>{if(!source)return;const url=canvas.toDataURL('image/png');$('[data-view="product"]').click();document.dispatchEvent(new CustomEvent('studio:apply-pattern',{detail:{url}}));};
  document.addEventListener('studio:pattern-ready',e=>{if(e.detail?.url){load(e.detail.url,'生成纹样 · 平面编辑');$('[data-view="single"]').click();$('[data-step="edit"]').click();}});
  document.addEventListener('studio:mode-change',sync);
  new MutationObserver(sync).observe(panel,{attributes:true,attributeFilter:['hidden']});
  // Reuse the original three studio diagrams; the homepage is untouched.
  const choices=$('.composition-options');
  choices.innerHTML=names.map(name=>`<button type="button" data-composition="${name}" aria-pressed="false"><span>${diagram(name)}</span>${name}</button>`).join('');
  document.addEventListener('click',e=>{const choice=e.target.closest('[data-composition]');if(choice&&names.includes(choice.dataset.composition)){state.composition=choice.dataset.composition;commit();}});
  const exportPanel=$('#export-panel');
  exportPanel.innerHTML='<h2>导出平面纹样</h2><p>导出当前单元或连续构图，尺寸为 1000 × 1000 像素。</p><p class="muted">PNG 位图文件，不包含矢量图层或 3D 模型。示例作品不代表 AI 生成结果。</p><button class="secondary" id="flat-export-download">下载平面 PNG</button><button class="secondary" id="flat-export-edit">继续平面编辑</button>';
  $('#flat-export-download').onclick=()=>$('#flat-save').click();
  $('#flat-export-edit').onclick=()=>{if(view()==='product')$('[data-view="single"]').click();$('[data-step="edit"]').click();};
  load('./public/ai-pattern-generation/mosaic-floral-bird-unit.png','花鸟独立单元 · 原图经 AI 辅助去底提取');sync();
})();
