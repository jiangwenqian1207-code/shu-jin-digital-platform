import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {products,productConfigs,loadProduct,disposeProduct} from './studio-products.mjs';

const root=document.querySelector('#product-view');
const host=root.querySelector('.product-viewport');
const status=document.querySelector('#edit-panel .product-status');
let renderer,scene,camera,controls,model,material,texture,active=false,frame=0,request=0;
let product='pillow';
let modelRequest=0;
const sample='./public/ai-pattern-generation/ai-geometric-dot-lattice-pattern.png';
const say=text=>{status.textContent=text;};
function reset(){camera.position.set(...(productConfigs[product]?.camera||[3,1.7,6]));controls.target.set(0,0,0);controls.update();}
function resize(){
  if(!renderer||!host.clientWidth)return;
  renderer.setSize(host.clientWidth,host.clientHeight);
  camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();
}
async function select(id){
  product=id;
  if(!scene)return;
  const token=++modelRequest;
  root.querySelectorAll('[data-product]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.product===id)));
  root.querySelector('.product-name').textContent=products.find(p=>p[0]===id)[1];
  if(model){scene.remove(model);disposeProduct(model,material);model=null;}
  say('正在加载产品模型…');
  try{
    const next=await loadProduct(id,material);
    if(token!==modelRequest){disposeProduct(next,material);return;}
    model=next;scene.add(model);syncPattern();reset();
    root.querySelector('.product-model-note').textContent=productConfigs[id]?.model?'3D / 原始 OBJ 模型':'3D / 简化模型';
    say(productConfigs[id]?.model?`${productConfigs[id].name}已加载 · 保留原模型与 UV 结构`:'产品已加载 · 简化产品模型');
  }catch(error){if(token===modelRequest)say('模型加载失败，请重新选择产品重试。');console.error(error);}
}
function syncPattern(){model?.traverse(mesh=>{if(mesh.isMesh&&mesh.material.isMeshPhysicalMaterial){mesh.material.map=texture||null;mesh.material.needsUpdate=true;}});}
function render(){if(!active||!renderer)return;controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(render);}
function setActive(){
  active=!root.hidden&&!document.hidden;
  cancelAnimationFrame(frame);
  if(active){try{if(!renderer)init();resize();render();}catch(error){say('无法启动 3D 预览，请启用浏览器硬件加速后刷新重试。');console.error(error);}}
}
async function setPattern(url){
  const token=++request;
  say('正在加载纹样…');
  try{
    const next=await new THREE.TextureLoader().loadAsync(url);
    if(token!==request){next.dispose();return;}
    next.colorSpace=THREE.SRGBColorSpace;
    next.wrapS=next.wrapT=THREE.RepeatWrapping;
    next.anisotropy=renderer.capabilities.getMaxAnisotropy();
    texture?.dispose();texture=next;material.map=texture;material.needsUpdate=true;
    syncPattern();updateTexture();say(productConfigs[product]?.model?'纹样已应用 · 原始 OBJ 模型':'纹样已应用 · 简化产品模型');
  }catch{if(token===request)say('纹样加载失败，请选择有效的 PNG、JPEG 或 WebP 图片。');}
}
function updateTexture(){
  if(!texture)return;
  const repeat=Number(document.querySelector('#texture-repeat').value);
  texture.repeat.set(repeat,repeat);texture.center.set(.5,.5);
  texture.rotation=THREE.MathUtils.degToRad(Number(document.querySelector('#texture-angle').value));
  texture.offset.set(Number(document.querySelector('#texture-x').value),Number(document.querySelector('#texture-y').value));
  document.querySelector('#repeat-value').textContent=repeat.toFixed(1)+'×';
}
function init(){
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.setClearColor(0xf7f7f5);renderer.outputColorSpace=THREE.SRGBColorSpace;
  host.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-label','产品三维预览，拖动旋转，滚轮缩放，右键拖动平移');
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(36,1,.1,80);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=3;controls.maxDistance=12;controls.maxPolarAngle=Math.PI*.88;
  material=new THREE.MeshStandardMaterial({roughness:.8,metalness:0,side:THREE.DoubleSide});
  scene.add(new THREE.HemisphereLight(0xffffff,0xc2b8a4,2.2));
  const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,6,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.bias=-.001;key.shadow.normalBias=.03;scene.add(key);
  const fill=new THREE.DirectionalLight(0xe1eaff,1);fill.position.set(4,2,-3);scene.add(fill);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.12}));ground.rotation.x=-Math.PI/2;ground.position.y=-2;ground.receiveShadow=true;scene.add(ground);
  select(product);setPattern(sample);
  new ResizeObserver(resize).observe(host);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();active=false;cancelAnimationFrame(frame);say('3D 显示连接已中断，请刷新页面恢复。');});
}
for(const [id,name] of products){
  const button=document.createElement('button');button.type='button';button.dataset.product=id;button.textContent=name;button.setAttribute('aria-pressed',String(id===product));button.addEventListener('click',()=>select(id));root.querySelector('.product-options').append(button);
}
document.querySelector('#texture-repeat').addEventListener('input',updateTexture);
document.querySelector('#texture-angle').addEventListener('input',updateTexture);
document.querySelector('#texture-x').addEventListener('input',updateTexture);
document.querySelector('#texture-y').addEventListener('input',updateTexture);
root.querySelector('#product-rotate').addEventListener('click',e=>{if(!controls)return;controls.autoRotate=!controls.autoRotate;controls.autoRotateSpeed=.6;e.currentTarget.setAttribute('aria-pressed',String(controls.autoRotate));});
document.querySelector('#product-pattern').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>15*1024*1024){say('请选择不超过 15 MB 的 PNG、JPEG 或 WebP 图片。');return;}
  const url=URL.createObjectURL(file);await setPattern(url);URL.revokeObjectURL(url);e.target.value='';
});
// Future generator integration: dispatch a local URL/blob URL in detail.url.
document.addEventListener('studio:pattern-ready',e=>{if(e.detail?.url){if(!renderer)init();setPattern(e.detail.url);}});
document.addEventListener('studio:apply-pattern',e=>{if(e.detail?.url){if(!renderer)init();setPattern(e.detail.url);}});
new MutationObserver(setActive).observe(root,{attributes:true,attributeFilter:['hidden']});
document.addEventListener('visibilitychange',setActive);
