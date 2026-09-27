import {patterns,description,measureBands,smoothBands,transitionAt,timecode} from './sound-data.mjs';
import {SoundRenderer} from './sound-renderer.mjs';
const $=id=>document.getElementById(id),stage=$('sound-stage');
let renderer,context,analyser,buffer,source,frequency,wave,playing=false,offset=0,startedAt=0,loadingAudio=false,disposed=false,frame,last=0,index=0,transition=null,queued=null;
const bands=[0,0,0,0],silence=[0,0,0,0],abort=new AbortController();
$('description').textContent=description;
stage.querySelector('.stage-label').textContent='声场 / 按住拖拽，旋转纹样';
function show(){const p=patterns[index];$('pattern-name').textContent=p.name;$('pattern-note').textContent=p.note;$('pattern-index').textContent=`0${index+1} / 05`;[...$('patterns').children].forEach((b,i)=>b.setAttribute('aria-current',String(index===i)));}
function select(i){if(!renderer)return;if(transition){queued=i;return;}if(i===index)return;renderer.setTargets(index,i);transition={to:i,start:performance.now()};}
patterns.forEach((p,i)=>{const b=document.createElement('button');b.setAttribute('aria-label',`切换到${p.name}`);const im=new Image();im.src=p.url;im.alt='';const label=document.createElement('span');label.textContent=`0${i+1}`;b.append(im,label);b.onclick=()=>select(i);$('patterns').append(b);});
$('prev').onclick=()=>select(((queued??transition?.to??index)+4)%5);$('next').onclick=()=>select(((queued??transition?.to??index)+1)%5);
function position(){return buffer?Math.min(buffer.duration,offset+(playing?context.currentTime-startedAt:0)):0;}
function stopSource(){if(source){source.onended=null;source.stop();source.disconnect();source=null;}}
function pause(message='已暂停 · 纹样逐渐回归'){offset=position();playing=false;stopSource();$('play').textContent='播放';$('audio-message').textContent=message;}
function launch(){stopSource();source=context.createBufferSource();source.buffer=buffer;source.connect(analyser);source.onended=()=>{if(playing){playing=false;offset=buffer.duration;$('play').textContent='播放';$('audio-message').textContent='音乐已结束 · 可重新播放';}};if(offset>=buffer.duration)offset=0;startedAt=context.currentTime;source.start(0,offset);playing=true;$('play').textContent='暂停';$('audio-message').textContent='声音正在驱动纹样内部的粒子';}
async function play(restart=false){if(loadingAudio||disposed)return;if(playing&&!restart){pause();return;}loadingAudio=true;$('play').disabled=true;$('restart').disabled=true;
 try{
  if(!context){context=new AudioContext();analyser=context.createAnalyser();analyser.fftSize=2048;analyser.smoothingTimeConstant=.72;analyser.connect(context.destination);frequency=new Uint8Array(analyser.frequencyBinCount);wave=new Float32Array(analyser.fftSize);}
  await context.resume();
  if(!buffer){$('audio-message').textContent='正在载入音乐…';const response=await fetch('./public/digital-artworks/collapsing-world-audio.m4a',{signal:abort.signal});if(!response.ok)throw new Error('audio');buffer=await context.decodeAudioData(await response.arrayBuffer());}
  if(disposed)return;if(restart||offset>=buffer.duration){offset=0;renderer.resetGrowth();}if(!document.hidden)launch();else $('audio-message').textContent='音乐已就绪，返回后点击播放';$('seek').disabled=false;$('seek').max=buffer.duration;
 }catch(e){if(!disposed){$('audio-message').textContent='音乐未能播放，请点击重试';$('play').textContent='重试播放';}}
 finally{loadingAudio=false;if(!disposed){$('play').disabled=false;$('restart').disabled=!buffer;}}
}
$('play').onclick=()=>play();$('restart').onclick=()=>play(true);
$('seek').addEventListener('input',()=>{if(!buffer)return;offset=Number($('seek').value);if(playing)launch();});
function animate(now){if(disposed)return;const dt=Math.min(.05,(now-(last||now))/1000);last=now;let target=silence;
 if(playing&&context.state==='running'){analyser.getByteFrequencyData(frequency);analyser.getFloatTimeDomainData(wave);target=measureBands(frequency,wave,context.sampleRate);}
 smoothBands(bands,target,dt);let state={mix:0,loose:0};
 if(transition){state=transitionAt((now-transition.start)/1000);if(state.done){index=transition.to;transition=null;renderer.setTargets(index,index);state={mix:0,loose:0};show();const next=queued;queued=null;if(next!==null)select(next);}}
 renderer.draw(now/1000,bands,state,playing&&context?.state==='running');stage.dataset.amplitude=bands[3].toFixed(3);stage.dataset.pattern=String(index);stage.dataset.transition=String(!!transition);
 $('bass').textContent=Math.round(bands[0]*100);$('mid').textContent=Math.round(bands[1]*100);$('treble').textContent=Math.round(bands[2]*100);
 $('state').textContent=transition?'重构 · 粒子进入新的纹样':!playing?'静默 · 纹样轻轻呼吸':bands[3]>.65?'共振 · 声音唤醒织构':bands[3]>.2?'律动 · 纹样随声起伏':'回归 · 聆听细微变化';
 if(buffer){const p=position();$('time').textContent=`${timecode(p)} / ${timecode(buffer.duration)}`;if(document.activeElement!==$('seek'))$('seek').value=p;}
 frame=requestAnimationFrame(animate);
}
const resize=new ResizeObserver(()=>renderer?.resize(stage.clientWidth,stage.clientHeight));
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(playing)pause('页面已离开，音乐暂停');cancelAnimationFrame(frame);}else if(renderer&&!disposed){last=0;frame=requestAnimationFrame(animate);}});
window.addEventListener('keydown',e=>{if(e.code==='Escape')location.href='./digital-artworks.html#sound';});
window.addEventListener('pagehide',()=>{disposed=true;abort.abort();stopSource();context?.close();cancelAnimationFrame(frame);resize.disconnect();renderer?.destroy();});
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
async function init(){show();try{const images=await Promise.all(patterns.map(p=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=p.url;})));if(disposed)return;renderer=new SoundRenderer($('sound-canvas'),images);renderer.resize(stage.clientWidth,stage.clientHeight);resize.observe(stage);$('loading').hidden=true;$('play').disabled=false;frame=requestAnimationFrame(animate);$('sound-canvas').addEventListener('webglcontextlost',e=>{e.preventDefault();pause();cancelAnimationFrame(frame);$('play').disabled=true;$('restart').disabled=true;$('loading').hidden=false;$('loading').textContent='图形已暂停，请刷新页面恢复';});}catch{$('loading').textContent='作品加载失败，请刷新重试或返回列表';}}
init();
