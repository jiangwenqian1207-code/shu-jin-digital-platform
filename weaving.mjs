import { patterns, Typewriter } from './weaving-data.mjs';
import { GestureController, ShuttleTracker, WeaveProgress, PatternTransition, WEFT_ROWS } from './weaving-gesture.mjs';
import { LoomRenderer, CanvasLoomRenderer } from './weaving-renderer.mjs';

const $=id=>document.getElementById(id);
const stage=$('loom-frame'),video=$('hand-video'),status=$('camera-status'),cameraButton=$('camera-toggle'),hold=$('weave-hold'),next=$('pattern-next');
const writer=new Typewriter(text=>$('pattern-description').textContent=text);
const gesture=new GestureController();
const loom=new WeaveProgress(),pointerMotion=new ShuttleTracker();
let renderer,images=[],frame=0,previous=0,manual=false,disposed=false,lastManualStroke=-Infinity;
let stream=null,worker=null,cameraGeneration=0,workerReady=false,busy=false,videoTime=-1,lastInference=0,watchdog=null,initializationTimer=null;
let cameraRequested=false;
const transition=new PatternTransition(patterns.length,index=>{
  loom.reset();gesture.resetMotion();release();renderer.setImage(images[index]);showPattern(index);
});

function showPattern(index){
  const p=patterns[index];$('pattern-index').textContent=String(index+1).padStart(2,'0');
  $('pattern-title').textContent=p.name;$('pattern-english').textContent=p.english;
  $('pattern-accessible').textContent=p.description;writer.start(p.description);
}
function switchPattern(){
  if(!renderer||!images.length)return;
  if(transition.next(performance.now())) { release();gesture.resetMotion();writer.stop();$('pattern-description').textContent='';next.disabled=true; }
}
function advance(direction){if(renderer&&transition.started===null)loom.advance(direction);}
function release(){manual=false;pointerMotion.reset();hold.classList.remove('is-held');}
function beginHold(event){
  if(event.button!==undefined&&event.button!==0)return;
  manual=true;pointerMotion.reset();const rect=stage.getBoundingClientRect();pointerMotion.update((event.clientX-rect.left)/rect.width,(event.clientY-rect.top)/rect.height,performance.now());stage.setPointerCapture(event.pointerId);
}
for(const target of [stage]){
  target.addEventListener('pointerdown',beginHold);
  for(const event of ['pointerup','pointercancel','lostpointercapture'])target.addEventListener(event,release);
}
stage.addEventListener('pointermove',event=>{if(!manual)return;const rect=stage.getBoundingClientRect();const direction=pointerMotion.update((event.clientX-rect.left)/rect.width,(event.clientY-rect.top)/rect.height,performance.now());if(direction)advance(direction);});
function manualStroke(){const now=performance.now();if(now-lastManualStroke<180)return;lastManualStroke=now;advance(Math.round(loom.target*WEFT_ROWS)%2?-1:1);}
hold.addEventListener('click',manualStroke);
hold.addEventListener('keydown',event=>{if(event.repeat)event.preventDefault();});
next.addEventListener('click',switchPattern);
window.addEventListener('keydown',event=>{
  if(event.code==='Escape'){window.location.href='./digital-artworks.html#weaving';return;}
  if(event.code==='Space'&&!['BUTTON','A','INPUT'].includes(document.activeElement?.tagName)){event.preventDefault();if(!event.repeat)manualStroke();}
  if(event.code==='ArrowRight'&&!event.repeat){event.preventDefault();switchPattern();}
});
window.addEventListener('blur',release);

function stopCamera(message){
  cameraGeneration++;cameraRequested=false;clearTimeout(initializationTimer);clearTimeout(watchdog);
  stream?.getTracks().forEach(track=>track.stop());stream=null;video.srcObject=null;
  worker?.terminate();worker=null;workerReady=false;busy=false;gesture.reset();videoTime=-1;
  cameraButton.textContent='开启摄像头';cameraButton.disabled=false;
  if(message)status.textContent=message;
}
async function startCamera(){
  stopCamera();cameraRequested=true;const generation=cameraGeneration;
  cameraButton.textContent='取消摄像头';status.textContent='请允许摄像头；也可左右拖动织造';
  try{
    if(!navigator.mediaDevices?.getUserMedia)throw new Error('unavailable');
    const acquired=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:640},height:{ideal:480},frameRate:{ideal:30,max:30}}});
    if(generation!==cameraGeneration||disposed){acquired.getTracks().forEach(track=>track.stop());return;}
    stream=acquired;video.srcObject=stream;await video.play();
    if(generation!==cameraGeneration||disposed)return;
    for(const track of stream.getVideoTracks())track.addEventListener('ended',()=>{if(generation===cameraGeneration)stopCamera('摄像头已断开 · 左右拖动或逐次按空格织造');},{once:true});
    status.textContent='摄像头已连接，正在准备手势识别…';cameraButton.textContent='关闭摄像头';
    worker=new Worker(new URL('./weaving-hands-worker.mjs',import.meta.url));
    const fail=()=>{if(generation===cameraGeneration)stopCamera('手势识别暂不可用 · 左右拖动或逐次按空格织造');};
    worker.onerror=fail;
    worker.onmessage=({data})=>{
      if(generation!==cameraGeneration)return;
      if(data.type==='ready'){clearTimeout(initializationTimer);workerReady=true;status.textContent='伸出一只手 · 左右来回摆动，逐层织造';}
      if(data.type==='error'){console.warn('Hand tracking:',data.message);fail();}
      if(data.type==='landmarks'){
        clearTimeout(watchdog);busy=false;
        const state=gesture.update(data.hands,data.time,video.videoWidth/Math.max(1,video.videoHeight),data.labels);
        if(state.switchPattern)switchPattern();else if(state.stroke&&!manual)advance(state.stroke);
        status.textContent=state.switchPattern?'已识别双手捏合 · 正在切换纹样':!state.visible?(state.recovering?'正在重新捕捉手部 · 已织进度保留':'未检测到手 · 请将双手放入镜头范围'):state.hands===2?(state.latched?'已切换 · 请松开双手的拇指和食指':state.cooling?'已识别双手 · 换纹冷却中':state.confirming?'双手已捏合 · 请保持片刻':'已识别 2 只手 · '+state.pinched+'/2 捏合，请各自合拢拇指与食指'):loom.target>=1?'仅识别 1 只手 · 请将另一只手也放入镜头':'已识别 1 只手 · 已织 '+Math.round(loom.target*WEFT_ROWS)+' 根纬线';
      }
    };
    initializationTimer=setTimeout(fail,25000);worker.postMessage({type:'init'});
  }catch(error){
    if(generation!==cameraGeneration)return;
    const message=error.name==='NotAllowedError'?'未授权摄像头':error.name==='NotFoundError'?'未找到摄像头':'摄像头暂不可用';
    stopCamera(`${message} · 左右拖动或逐次按空格织造`);
  }
}
cameraButton.addEventListener('click',()=>cameraRequested?stopCamera('摄像头已关闭 · 左右拖动或逐次按空格织造'):startCamera());

async function infer(now){
  if(!workerReady||busy||!stream||video.readyState<2||video.currentTime===videoTime||now-lastInference<33)return;
  busy=true;lastInference=now;videoTime=video.currentTime;const generation=cameraGeneration;
  try{
    const bitmap=await createImageBitmap(video);
    if(generation!==cameraGeneration||!worker){bitmap.close();return;}
    worker.postMessage({type:'frame',frame:bitmap,time:now},[bitmap]);
    watchdog=setTimeout(()=>{if(generation===cameraGeneration)stopCamera('识别响应超时 · 请使用鼠标或空格继续体验');},4000);
  }catch{if(generation===cameraGeneration)stopCamera('手势识别暂不可用 · 左右拖动或逐次按空格织造');}
}
function animate(now){
  if(disposed)return;
  const dt=Math.min(.05,(now-(previous||now))/1000);previous=now;
  const presence=transition.update(now);next.disabled=transition.started!==null;
  const progress=transition.started===null?loom.update(dt):loom.value;
  stage.dataset.progress=progress.toFixed(4);
  renderer.draw(progress,presence,loom.direction);infer(now);
  frame=requestAnimationFrame(animate);
}
const resize=new ResizeObserver(entries=>{if(renderer){const {width,height}=entries[0].contentRect;renderer.resize(width,height);}});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){release();cancelAnimationFrame(frame);previous=0;stopCamera('已暂停摄像头 · 返回后可重新开启');}
  else if(renderer&&!disposed){previous=0;frame=requestAnimationFrame(animate);}
});
function dispose(){disposed=true;release();stopCamera();writer.stop();cancelAnimationFrame(frame);resize.disconnect();renderer?.destroy();}
window.addEventListener('pagehide',dispose);
window.addEventListener('pageshow',event=>{if(event.persisted)window.location.reload();});

async function init(){
  showPattern(0);startCamera();
  try{
    images=await Promise.all(patterns.map(p=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(p.file));image.src=`./public/weaving/patterns/${p.file}`;})));
    if(disposed)return;
    try{renderer=new LoomRenderer($('loom'));}
    catch(error){
      console.warn('Using Canvas loom:',error);
      const replacement=$('loom').cloneNode();$('loom').replaceWith(replacement);renderer=new CanvasLoomRenderer(replacement);
    }
    renderer.setImage(images[0]);renderer.resize(stage.clientWidth,stage.clientHeight);resize.observe(stage);
    $('loading-note').hidden=true;frame=requestAnimationFrame(animate);
    $('loom').addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);stopCamera('图形上下文已暂停 · 请刷新恢复');$('loading-note').textContent='图形已暂停，请刷新页面恢复';$('loading-note').hidden=false;});
  }catch(error){
    console.error('Weaving assets:',error);stopCamera('素材未能加载');
    $('loading-note').textContent='纹样加载失败，请刷新重试；也可通过右上角返回作品列表。';
  }
}
init();
