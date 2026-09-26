import {ParticleRenderer} from './particles-renderer.mjs';
import {ParticleGesture} from './particles-gesture.mjs';
import {Typewriter} from './weaving-data.mjs';
const patterns=[['宋 · 灯笼锦纹','song-dynasty-lantern-brocade-pattern.jpg'],['北朝 · 方格兽锦纹','northern-dynasties-grid-beast-brocade-pattern.jpg'],['AI · 紫藤垂饰纹样','ai-wisteria-pendant-pattern.png']];
const description='作品以蜀锦纹样为视觉基础，将完整纹样转译为可实时运动的粒子系统。观众通过手势控制粒子的聚合与消散，使纹样在完整与碎片、生成与消解之间不断转换，形成一种由身体参与驱动的数字织构体验。';
const $=id=>document.getElementById(id),stage=$('particle-stage'),video=$('hand-video'),status=$('camera-status');
const gesture=new ParticleGesture(),writer=new Typewriter(t=>$('description').textContent=t);
let renderer,index=0,transition=null,progress=0,angle=0,target=0,targetAngle=0,manual=false,disposed=false,raf=0,last=0;
let stream=null,worker=null,ready=false,busy=false,generation=0,requested=false,watchdog,initTimer,lastVideo=-1,lastInference=0;
function show(){ $('pattern-name').textContent=patterns[index][0];$('pattern-index').textContent=`0${index+1} / 03`;$('accessible-description').textContent=description;writer.start(description);for(const [i,b] of [...$('pattern-nav').children].entries())b.setAttribute('aria-current',String(i===index));}
function switchTo(i){if(!renderer||transition||i===index)return;transition={to:i,start:performance.now(),from:progress};release();writer.stop();}
patterns.forEach((p,i)=>{const b=document.createElement('button');b.textContent=`0${i+1}`;b.setAttribute('aria-label',p[0]);b.onclick=()=>switchTo(i);$('pattern-nav').append(b);});
function release(){manual=false;target=0;$('preview-form').setAttribute('aria-pressed','false');}
$('preview-form').onclick=()=>{if(transition)return;manual=!manual;target=manual?1:0;$('preview-form').setAttribute('aria-pressed',String(manual));};
stage.addEventListener('pointerdown',e=>{if(e.button!==0||transition)return;manual=true;target=1;stage.setPointerCapture(e.pointerId);});
stage.addEventListener('pointermove',e=>{if(manual){const r=stage.getBoundingClientRect();targetAngle=Math.max(-1.15,Math.min(1.15,((e.clientX-r.left)/r.width-.5)*2.3));}});
for(const name of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(name,release);
window.addEventListener('blur',release);
window.addEventListener('keydown',e=>{if(e.code==='Escape')location.href='./digital-artworks.html#particles';if(e.code==='Space'&&!['BUTTON','A'].includes(document.activeElement.tagName)){e.preventDefault();if(!transition){manual=true;target=1;}}if(e.code==='ArrowRight'&&!e.repeat)switchTo((index+1)%patterns.length);});
window.addEventListener('keyup',e=>{if(e.code==='Space')release();});
function stopCamera(message){generation++;requested=false;clearTimeout(watchdog);clearTimeout(initTimer);stream?.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;worker?.terminate();worker=null;ready=false;busy=false;lastVideo=-1;gesture.reset();if(!manual)target=0;$('camera-toggle').textContent='开启摄像头';if(message)status.textContent=message;}
async function startCamera(){
 stopCamera();requested=true;const gen=generation;status.textContent='请允许摄像头 · 也可使用鼠标';$('camera-toggle').textContent='取消摄像头';
 const fail=()=>{if(gen===generation)stopCamera('手势暂不可用 · 可按住画面聚合，拖动旋转');};
 try{
  const acquired=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:640},height:{ideal:480},frameRate:{ideal:30,max:30}}});
  if(gen!==generation||disposed){acquired.getTracks().forEach(t=>t.stop());return;}
  stream=acquired;video.srcObject=stream;await video.play();if(gen!==generation||disposed)return;
  stream.getVideoTracks().forEach(t=>t.addEventListener('ended',fail,{once:true}));
  worker=new Worker(new URL('./weaving-hands-worker.mjs',import.meta.url));worker.onerror=fail;
  worker.onmessage=({data})=>{if(gen!==generation)return;if(data.type==='ready'){clearTimeout(initTimer);ready=true;status.textContent='请伸出手 · 捏合聚合，双手捏合换纹';$('camera-toggle').textContent='关闭摄像头';}if(data.type==='error')fail();if(data.type==='landmarks'){clearTimeout(watchdog);busy=false;const s=gesture.update(data.hands,data.time,video.videoWidth/Math.max(1,video.videoHeight),data.labels);status.textContent=s.mode;if(s.next)switchTo((index+1)%patterns.length);else if(!manual&&!transition){target=s.target;targetAngle=s.angle;}}};
  initTimer=setTimeout(fail,25000);worker.postMessage({type:'init'});
 }catch(e){if(gen===generation)stopCamera(e.name==='NotAllowedError'?'摄像头未授权 · 按住画面聚合，拖动旋转':'摄像头不可用 · 可使用鼠标体验');}
}
$('camera-toggle').onclick=()=>requested?stopCamera('摄像头已关闭 · 可使用鼠标体验'):startCamera();
async function infer(now){if(!ready||busy||!stream||video.readyState<2||video.currentTime===lastVideo||now-lastInference<33)return;busy=true;lastInference=now;lastVideo=video.currentTime;const gen=generation;try{const bitmap=await createImageBitmap(video);if(gen!==generation||!worker){bitmap.close();return;}worker.postMessage({type:'frame',frame:bitmap,time:now},[bitmap]);watchdog=setTimeout(()=>{if(gen===generation)stopCamera('识别超时 · 可使用鼠标体验');},4000);}catch{if(gen===generation)stopCamera('识别暂停 · 可使用鼠标体验');}}
function animate(now){if(disposed)return;const dt=Math.min(.05,(now-(last||now))/1000);last=now;
 if(transition){const t=now-transition.start;if(t<1000){progress=transition.from*(1-Math.min(1,t/1000))**2;}else{progress=0;renderer.blend(index,transition.to,Math.min(1,(t-1000)/900));}if(t>=1900){index=transition.to;renderer.blend(index,index,0);transition=null;target=0;gesture.target=0;show();}}
 else progress+=(target-progress)*(1-Math.exp(-dt*2.8));angle+=(targetAngle-angle)*(1-Math.exp(-dt*5));
 renderer.draw(now/1000,progress,angle);$('formation').textContent=String(Math.round(progress*100)).padStart(3,'0');stage.dataset.formation=progress.toFixed(3);stage.dataset.transition=String(!!transition);infer(now);raf=requestAnimationFrame(animate);
}
const resize=new ResizeObserver(()=>renderer?.resize(stage.clientWidth,stage.clientHeight));
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);release();stopCamera('已暂停摄像头 · 可点击重新开启');}else if(renderer&&!disposed){last=0;raf=requestAnimationFrame(animate);}});
window.addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(raf);stopCamera();writer.stop();resize.disconnect();renderer?.destroy();});
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
async function init(){show();try{const images=await Promise.all(patterns.map(p=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src='./public/particles/'+p[1];})));if(disposed)return;renderer=new ParticleRenderer($('particle-canvas'),images);renderer.resize(stage.clientWidth,stage.clientHeight);resize.observe(stage);$('loading').hidden=true;$('particle-canvas').addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);stopCamera();$('loading').hidden=false;$('loading').textContent='图形已暂停，请刷新恢复';});raf=requestAnimationFrame(animate);startCamera();}catch{status.textContent='图形或素材加载失败';$('loading').textContent='无法建立粒子场，请刷新重试或通过 CLOSE 返回';}}
init();
