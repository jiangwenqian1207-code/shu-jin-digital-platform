import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { flowers } from './flowers-data.mjs';
import { Typewriter } from './weaving-data.mjs';

const $=id=>document.getElementById(id),stage=$('model-stage'),status=$('model-status');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const writer=new Typewriter(text=>$('description').textContent=text);
let renderer,controls,scene,camera,environment,frame,last=0,current=null,index=-1,requested=0,generation=0,aborter,disposed=false,dragging=false,resumeAt=0,auto=!reduced;
const cache=new Map(),loader=new GLTFLoader();
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function disposeModel(root){const geometries=new Set(),materials=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));if(o.isInstancedMesh)o.dispose();});geometries.forEach(g=>g.dispose());materials.forEach(m=>{for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();});}
function prepare(root){
 // Static authored models: instance repeated geometry without changing any shape.
 root.updateMatrixWorld(true);const groups=new Map(),result=new THREE.Group(),tunedMaterials=new Set();
 root.traverse(o=>{if(!o.isMesh)return;const key=o.geometry.uuid+':'+(Array.isArray(o.material)?o.material.map(m=>m.uuid).join(','):o.material.uuid);if(!groups.has(key))groups.set(key,{geometry:o.geometry,material:o.material,matrices:[]});groups.get(key).matrices.push(o.matrixWorld.clone());});
 for(const {geometry,material,matrices} of groups.values()){
  for(const m of Array.isArray(material)?material:[material]){
   if(tunedMaterials.has(m))continue;tunedMaterials.add(m);
   // Near the first edition: softly deepen the authored pastels, no saturation boost.
   const hsl={};m.color.getHSL(hsl);m.color.setHSL(hsl.h,hsl.s*.98,hsl.l*.93);
   m.roughness=Math.max(.22,m.roughness||0);m.envMapIntensity=1.05;
  }
  const mesh=new THREE.InstancedMesh(geometry,material,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingBox();mesh.computeBoundingSphere();result.add(mesh);
 }
 const box=new THREE.Box3().setFromObject(result),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
 const scale=3.6/Math.max(size.x,size.y,size.z);result.scale.setScalar(scale);result.position.copy(center.multiplyScalar(-scale));
 const wrapper=new THREE.Group();wrapper.add(result);wrapper.rotation.y=Math.PI;const bounds=new THREE.Box3().setFromObject(wrapper);wrapper.userData.size=bounds.getSize(new THREE.Vector3());wrapper.userData.radius=bounds.getBoundingSphere(new THREE.Sphere()).radius;return wrapper;
}
function updateInfo(i){
 const f=flowers[i];$('flower-name').textContent=f.name;$('flower-idea').textContent=f.idea;
 $('flower-number').textContent=$('nav-number').textContent=String(i+1).padStart(2,'0');
 $('accessible-description').textContent=f.description;
 if(reduced)$('description').textContent=f.description;else writer.start(f.description);
 $('sources').replaceChildren(...f.sources.map((s,n)=>{const figure=document.createElement('figure');figure.className='source-card';const image=document.createElement('img');image.src=s.url;image.alt=s.name+'提取纹样元素';const area=document.createElement('div');area.className='source-image';const number=document.createElement('small');number.textContent='SOURCE / 0'+(n+1);area.append(number,image);const caption=document.createElement('figcaption');caption.textContent=s.name;const note=document.createElement('small');note.textContent='纹样提取元素 · 形态转译';caption.append(note);figure.append(area,caption);return figure;}));
 document.querySelectorAll('.flower-option').forEach((b,n)=>b.setAttribute('aria-pressed',String(n===i)));
 stage.setAttribute('aria-label',`${f.name}三维模型，拖动旋转，滚轮缩放；方向键旋转，加减键缩放`);
 document.body.dataset.flower=f.id;
}
function fit(){
 if(!current)return;controls.reset();controls.target.set(0,0,0);
 const v=THREE.MathUtils.degToRad(camera.fov/2),size=current.userData.size;
 const d=Math.max(size.y/(2*Math.tan(v)),size.x/(2*Math.tan(v)*camera.aspect))*1.1+size.z*.3;
 camera.position.set(0,d*.05,d);controls.minDistance=d*.55;controls.maxDistance=d*1.9;camera.near=.01;camera.far=d*10;camera.updateProjectionMatrix();controls.autoRotate=false;controls.update();resumeAt=performance.now()+2500;
}
async function selectFlower(i){
 if(disposed||(!renderer))return;if(i===index&&!stage.classList.contains('is-changing'))return;
 requested=i;const token=++generation;aborter?.abort();aborter=new AbortController();const signal=aborter.signal;
 writer.stop();$('description').textContent='';stage.classList.add('is-changing');stage.setAttribute('aria-busy','true');status.hidden=false;status.textContent=`正在载入${flowers[i].name}…`;$('retry').hidden=true;
 try{
  let model=cache.get(i);
  if(!model){const response=await fetch(flowers[i].model,{signal});if(!response.ok)throw Error('HTTP '+response.status);const data=await response.arrayBuffer();if(token!==generation)return;const gltf=await loader.parseAsync(data,'');model=prepare(gltf.scene);if(token!==generation||disposed){disposeModel(model);return;}cache.set(i,model);}
  await sleep(reduced?0:340);if(token!==generation||disposed)return;
  if(current)scene.remove(current);current=model;scene.add(current);index=i;updateInfo(i);fit();auto=!reduced;updateRotation();
  for(const [key,value] of cache)if(key!==i&&cache.size>2){disposeModel(value);cache.delete(key);}
  // Two frames allow the new scene and reset camera to render before revealing it.
  renderer.render(scene,camera);stage.classList.remove('is-changing');stage.setAttribute('aria-busy','false');status.hidden=true;document.body.dataset.ready='true';
 }catch(error){if(token!==generation||disposed||error.name==='AbortError')return;console.error('Flower model:',error);status.textContent=`${flowers[i].name}加载失败，请重试或选择另一朵花。`;$('retry').hidden=false;stage.setAttribute('aria-busy','false');}
}
function updateRotation(){$('rotation').textContent=auto?'暂停自转':'开启自转';$('rotation').setAttribute('aria-pressed',String(auto));}
flowers.forEach((f,i)=>{const b=document.createElement('button');b.className='flower-option';b.setAttribute('aria-label','查看'+f.name);b.setAttribute('aria-pressed','false');const img=document.createElement('img');img.src=f.poster;img.alt='';img.loading='lazy';const label=document.createElement('span');label.textContent=f.name;b.append(img,label);b.addEventListener('click',()=>selectFlower(i));$('flower-options').append(b);});
$('retry').addEventListener('click',()=>selectFlower(requested));$('reset-view').addEventListener('click',fit);$('rotation').addEventListener('click',()=>{auto=!auto;updateRotation();});
window.addEventListener('keydown',e=>{if(e.code==='Escape')location.href='./digital-artworks.html#flora';});
stage.addEventListener('keydown',e=>{if(!camera||!current)return;const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Equal','Minus','NumpadAdd','NumpadSubtract'];if(!keys.includes(e.code))return;e.preventDefault();resumeAt=performance.now()+4000;const offset=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(offset);if(e.code==='ArrowLeft')s.theta-=.12;if(e.code==='ArrowRight')s.theta+=.12;if(e.code==='ArrowUp')s.phi-=.12;if(e.code==='ArrowDown')s.phi+=.12;if(['Equal','NumpadAdd'].includes(e.code))s.radius*=.9;if(['Minus','NumpadSubtract'].includes(e.code))s.radius*=1.1;s.makeSafe();s.radius=THREE.MathUtils.clamp(s.radius,controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));controls.update();});
const resize=new ResizeObserver(()=>{if(!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();fit();});
try{
 renderer=new THREE.WebGLRenderer({canvas:$('flower-canvas'),alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(35,1,.01,100);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;controls.autoRotateSpeed=.38;
 controls.addEventListener('start',()=>{dragging=true;});controls.addEventListener('end',()=>{dragging=false;resumeAt=performance.now()+3500;});
 const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xf3eaff,0x60504a,1.8));const key=new THREE.DirectionalLight(0xffead1,2.7);key.position.set(3,5,5);scene.add(key);const rim=new THREE.DirectionalLight(0xbacfff,1.8);rim.position.set(-4,2,-3);scene.add(rim);
 resize.observe(stage);
 function animate(now){if(disposed)return;const dt=Math.min(.05,(now-(last||now))/1000);last=now;controls.autoRotate=auto&&!dragging&&now>resumeAt&&!stage.classList.contains('is-changing');controls.update(dt);renderer.render(scene,camera);frame=requestAnimationFrame(animate);}
 frame=requestAnimationFrame(animate);selectFlower(0);
 document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);last=0;if(!document.hidden&&!disposed)frame=requestAnimationFrame(animate);});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);status.hidden=false;status.textContent='三维显示已暂停，请刷新页面恢复。';});
}catch(error){console.error(error);status.textContent='当前浏览器无法开启三维显示，请使用支持 WebGL 的浏览器。';updateInfo(0);}
window.addEventListener('pagehide',()=>{disposed=true;generation++;aborter?.abort();writer.stop();cancelAnimationFrame(frame);resize.disconnect();controls?.dispose();cache.forEach(disposeModel);cache.clear();environment?.dispose();renderer?.dispose();});
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
