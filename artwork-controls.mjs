// Local files are decoded in the browser only; no upload request or persistence.
const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';
stylesheet.href=new URL('./artwork-controls.css',import.meta.url);document.head.append(stylesheet);
export async function readLocalPattern(file,aspect=1){
 if(!/\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name))throw Error('请选择 PNG、JPG、WebP、GIF 或 BMP 图片');
 if(file.size>25*1024*1024)throw Error('图片请小于 25 MB');
 const url=URL.createObjectURL(file),image=new Image();
 try{
  image.src=url;await image.decode();
  if(!image.naturalWidth||image.naturalWidth*image.naturalHeight>40000000)throw Error('图片尺寸过大，请使用 4000 万像素以内的图片');
  const size=Math.min(2048,Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
  const ctx=canvas.getContext('2d'),scale=Math.min(size/image.naturalWidth,size/aspect/image.naturalHeight);
  ctx.fillStyle='#0b0e10';ctx.fillRect(0,0,size,size);
  const w=image.naturalWidth*scale,h=image.naturalHeight*scale;
  ctx.drawImage(image,(size-w)/2,(size-h)/2,w,h);
  return canvas;
 }catch(error){throw Error(error.message.includes('图片')?error.message:'图片无法读取，请换一张有效图片');}
 finally{URL.revokeObjectURL(url);image.src='';}
}
export function validateLocalAudio(file){
 if(!/\.(mp3|wav|m4a|aac|ogg|oga|flac|webm|opus)$/i.test(file.name))throw Error('请选择 MP3、WAV、M4A、OGG 等音频文件');
 if(file.size>50*1024*1024)throw Error('音乐文件请小于 50 MB');
}
export function setupArtworkControls({stage,uploadHost,onPattern,onRestorePattern,onMusic,onRestoreMusic,patternAspect=1,fullscreenButtons=[]}){
 const events=new AbortController(),signal=events.signal;
 let disposed=false,ready=false,fallback=false,lastExit=-Infinity;
 stage.classList.add('artwork-viewport');
 const notice=document.createElement('p');notice.className='artwork-control-notice';notice.setAttribute('role','status');notice.hidden=true;
 const fs=document.createElement('button');fs.type='button';fs.className='artwork-fullscreen';
 fs.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path class="enter-icon" d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/><path class="exit-icon" d="M3 9h6V3m6 0v6h6M9 21v-6H3m18 0h-6v6"/></svg>';
 stage.append(fs,notice);
 const active=()=>document.fullscreenElement===stage||fallback;
 const say=text=>{notice.textContent=text;notice.hidden=!text;};
 const sync=()=>{
  const full=active();stage.dataset.fullscreen=String(full);
  fs.title=full?'退出全屏（Esc）':'全屏体验';fs.setAttribute('aria-label',full?'退出全屏':'全屏体验');fs.setAttribute('aria-pressed',String(full));
 };
 const leaveFallback=()=>{fallback=false;stage.classList.remove('artwork-immersive');document.body.classList.remove('artwork-immersive-open');lastExit=performance.now();sync();fs.focus({preventScroll:true});};
 for(const event of ['pointerdown','pointerup','pointercancel'])fs.addEventListener(event,e=>e.stopPropagation(),{signal});
 fs.addEventListener('click',async()=>{
  say('');
  if(fallback){leaveFallback();return;}
  if(document.fullscreenElement===stage){try{await document.exitFullscreen();}catch{say('暂时无法退出全屏，请按 Esc');}return;}
  try{if(!stage.requestFullscreen)throw Error('unsupported');await stage.requestFullscreen();}
  catch{if(disposed)return;fallback=true;stage.classList.add('artwork-immersive');document.body.classList.add('artwork-immersive-open');sync();}
 },{signal});
 document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement!==stage&&stage.dataset.fullscreen==='true'){lastExit=performance.now();fs.focus({preventScroll:true});}sync();},{signal});
 // Escape must exit the view, not trigger the artwork's existing "return" shortcut.
 window.addEventListener('keydown',e=>{
  if(e.code!=='Escape'||(!active()&&performance.now()-lastExit>500))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(fallback)leaveFallback();else if(document.fullscreenElement===stage)document.exitFullscreen().catch(()=>{});
 },{capture:true,signal});
 const fullActions=document.createElement('div');fullActions.className='artwork-fullscreen-actions';
 for(const event of ['pointerdown','pointerup','pointercancel'])fullActions.addEventListener(event,e=>e.stopPropagation(),{signal});
 const observers=[];
 for(const source of fullscreenButtons.filter(Boolean)){
  const button=document.createElement('button');button.type='button';
  const update=()=>{button.textContent=source.textContent;button.disabled=source.disabled;const pressed=source.getAttribute('aria-pressed');if(pressed!==null)button.setAttribute('aria-pressed',pressed);};
  update();button.addEventListener('click',()=>source.click(),{signal});fullActions.append(button);
  const observer=new MutationObserver(update);observer.observe(source,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['disabled','aria-pressed']});observers.push(observer);
 }
 if(fullActions.children.length)stage.append(fullActions);
 const fileControls=[];
 function picker(kind,label,accept,onFile,onRestore){
  const row=document.createElement('div');row.className='artwork-upload-row';
  const input=document.createElement('input');input.type='file';input.accept=accept;input.hidden=true;input.id=`local-${kind}-file`;input.setAttribute('aria-label',label);
  const button=document.createElement('button');button.type='button';button.textContent=label;button.disabled=true;
  const restore=document.createElement('button');restore.type='button';restore.className='artwork-restore';restore.textContent=kind==='pattern'?'恢复原纹样':'恢复默认音乐';restore.hidden=true;
  const message=document.createElement('p');message.className='artwork-file-message';message.setAttribute('role','status');message.hidden=true;
  let busy=false;
  const update=()=>{button.disabled=!ready||busy;restore.disabled=!ready||busy;};fileControls.push(update);
  button.addEventListener('click',()=>input.click(),{signal});
  input.addEventListener('change',async()=>{
   const file=input.files[0];input.value='';if(!file||busy||!ready)return;
   busy=true;update();message.hidden=false;message.textContent='正在读取本地文件…';
   try{await onFile(file);if(disposed)return;restore.hidden=false;message.textContent=`已使用：${file.name}`;}
   catch(error){if(!disposed)message.textContent=error.message||'文件无法读取，请重试';}
   finally{busy=false;if(!disposed)update();}
  },{signal});
  restore.addEventListener('click',async()=>{
   if(busy)return;busy=true;update();
   try{await onRestore();if(disposed)return;restore.hidden=true;message.textContent='';message.hidden=true;}
   catch(error){message.hidden=false;message.textContent=error.message||'恢复失败，请重试';}
   finally{busy=false;if(!disposed)update();}
  },{signal});
  row.append(button,restore,input);uploadHost.append(row,message);
 }
 if(onPattern)picker('pattern','上传自己的纹样','.png,.jpg,.jpeg,.webp,.gif,.bmp',async file=>{const image=await readLocalPattern(file,patternAspect);if(!disposed)onPattern(image,file.name);},onRestorePattern);
 if(onMusic)picker('music','上传自己的音乐','.mp3,.wav,.m4a,.aac,.ogg,.oga,.flac,.webm,.opus',async file=>{validateLocalAudio(file);await onMusic(file);},onRestoreMusic);
 sync();
 window.addEventListener('pagehide',()=>{disposed=true;events.abort();observers.forEach(o=>o.disconnect());document.body.classList.remove('artwork-immersive-open');},{once:true});
 return {setReady(value=true){ready=value;fileControls.forEach(update=>update());}};
}
