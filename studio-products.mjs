import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';

export const productConfigs = {
  pillow: {id:'pillow',name:'抱枕',model:'./public/ai-pattern-generation/product-models/pillow.obj',scale:3/59.42,position:[0,0,0],rotation:[Math.PI/2,0,0],viewRotation:-Math.PI/2,worldYaw:-Math.PI/3,finalViewTilt:-25*Math.PI/180,camera:[1,.7,6.5],uvScale:1/300,frameLargestMesh:true},
  skirt: {id:'skirt',name:'裙子',model:'./public/ai-pattern-generation/product-models/skirt.obj',scale:3.4/1603.31,position:[0,0,0],rotation:[0,0,0],camera:[0,.3,6.5],uvScale:1/400},
  scarf: {id:'scarf',name:'围巾',model:'./public/ai-pattern-generation/product-models/scarf.obj',scale:3.2/41.3,position:[0,0,0],rotation:[0,0,0],camera:[0,.5,6.5],uvScale:4},
  silk: {id:'silk',name:'丝巾',model:'./public/ai-pattern-generation/product-models/silk-scarf.obj',scale:3.2/35.94,position:[0,0,0],rotation:[0,0,0],camera:[0,.5,6.5],uvScale:3},
  hat: {id:'hat',name:'帽子',model:'./public/ai-pattern-generation/product-models/hat.obj',scale:3/240.04,position:[0,0,0],rotation:[0,0,0],camera:[1,2.3,6],uvScale:1/200},
  bag: {id:'bag',name:'手提包',model:'./public/ai-pattern-generation/product-models/handbag.obj',scale:3.2/354,position:[0,0,0],rotation:[0,-Math.PI/2,0],camera:[.7,.5,6.5],uvScale:1/250},
  tie: {id:'tie',name:'领带',model:'./public/ai-pattern-generation/product-models/tie.obj',
    scale:3.4/514.263184,position:[0,0,0],rotation:[0,0,0],camera:[0,0,6.5],
    // CLO export uses physical-sized UV coordinates, not the usual 0–1 tile.
    // Uniformly rescale both axes: preserve all original seams/islands and aspect ratios.
    uvScale:1/200}
};

export const products = [
  ['pillow','抱枕'], ['skirt','裙子'], ['scarf','围巾'], ['silk','丝巾'],
  ['hat','帽子'], ['bag','手提包'], ['notebook','笔记本'], ['tie','领带']
];

export async function loadProduct(type,fabric){
  const config=productConfigs[type];
  if(!config?.model)return buildProduct(type,fabric);
  const object=await new OBJLoader().loadAsync(config.model);
  const silk=new THREE.MeshPhysicalMaterial({map:fabric.map,roughness:.58,metalness:0,
    side:THREE.DoubleSide,sheen:.35,sheenRoughness:.75,sheenColor:0xe1dfd5});
  object.traverse(mesh=>{
    if(!mesh.isMesh)return;
    for(const old of Array.isArray(mesh.material)?mesh.material:[mesh.material])old.dispose();
    mesh.material=silk;mesh.castShadow=true;mesh.receiveShadow=true;
    const uv=mesh.geometry.attributes.uv;
    if(uv){for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*config.uvScale,uv.getY(i)*config.uvScale);uv.needsUpdate=true;}
  });
  object.rotation.set(...config.rotation);object.scale.setScalar(config.scale);
  // Rotate in the default viewing plane, keeping geometry and UVs unchanged.
  if(config.viewRotation)object.rotateOnWorldAxis(new THREE.Vector3(...config.camera).normalize(),config.viewRotation);
  if(config.worldYaw)object.rotateOnWorldAxis(new THREE.Vector3(0,1,0),config.worldYaw);
  // Apply screen-space tilt last, after the model's facing direction is established.
  if(config.finalViewTilt)object.rotateOnWorldAxis(new THREE.Vector3(...config.camera).normalize(),config.finalViewTilt);
  object.updateMatrixWorld(true);
  // Some exports include a remote tiny helper. Keep it intact, but frame the product.
  let framingObject=object;
  if(config.frameLargestMesh)object.traverse(mesh=>{if(mesh.isMesh&&(!framingObject.isMesh||mesh.geometry.attributes.position.count>framingObject.geometry.attributes.position.count))framingObject=mesh;});
  const center=new THREE.Box3().setFromObject(framingObject).getCenter(new THREE.Vector3());
  object.position.copy(center).multiplyScalar(-1).add(new THREE.Vector3(...config.position));
  return object;
}

// Every builder returns a group with UVs. Replace a builder with a GLTF
// adapter later without changing the viewer or its texture controls.
export function buildProduct(type, fabric) {
  const group = new THREE.Group();
  const trim = new THREE.MeshStandardMaterial({color:0xd7c7a6,roughness:.75});
  const pages = new THREE.MeshStandardMaterial({color:0xf5f0de,roughness:.9});
  const add = (geometry, material=fabric, position=[0,0,0]) => {
    const mesh = new THREE.Mesh(geometry,material); mesh.position.set(...position);
    mesh.castShadow=true; mesh.receiveShadow=true; group.add(mesh); return mesh;
  };
  const box=(w,h,d,material=fabric,pos)=>add(new THREE.BoxGeometry(w,h,d),material,pos);
  const tube=(points,r,material=trim)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),48,r,8,false),material);
  if(type==='pillow'){
    const geometry=new THREE.SphereGeometry(1,80,48);
    const p=geometry.attributes.position;
    const power=v=>Math.sign(v)*Math.pow(Math.abs(v),.43);
    for(let i=0;i<p.count;i++){
      const x=power(p.getX(i)),y=power(p.getY(i)),z=p.getZ(i);
      p.setXYZ(i,x*1.3,y*1.3,z*.43*(1+.06*Math.cos(y*24)*Math.pow(Math.abs(x),6)));
    }
    // Planar UVs keep the front face legible rather than pinching at a pole.
    const uv=geometry.attributes.uv;
    for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)/2.6)+.5,(p.getY(i)/2.6)+.5);
    geometry.computeVertexNormals();add(geometry);
    const seam=[];
    for(let i=0;i<=160;i++){const a=i/160*Math.PI*2;seam.push([power(Math.cos(a))*1.302,power(Math.sin(a))*1.302,0]);}
    tube(seam,.012);group.rotation.z=-.12;
  }else if(type==='skirt'){
    const g=new THREE.CylinderGeometry(.55,1.25,2.4,96,28,true),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const a=Math.atan2(p.getZ(i),p.getX(i));const s=1+.045*Math.cos(a*16)*(1.3-p.getY(i));p.setX(i,p.getX(i)*s);p.setZ(i,p.getZ(i)*s);}
    g.computeVertexNormals();add(g);add(new THREE.CylinderGeometry(.56,.58,.16,64,1,true),fabric,[0,1.22,0]);
  }else if(type==='silk'||type==='scarf'){
    const w=type==='silk'?2.8:1.1,h=type==='silk'?2.8:3.4;
    const g=new THREE.PlaneGeometry(w,h,64,80),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,.14*Math.sin(x*7+y*2)+.07*Math.cos(y*6));}
    g.computeVertexNormals();add(g);group.rotation.set(type==='silk'?-.7:0,0,type==='silk'?.35:-.12);
    if(type==='scarf')for(let i=0;i<14;i++){let x=-w/2+i*w/13;tube([[x,-h/2,0],[x+.025,-h/2-.15,.02]],.009);}
  }else if(type==='socks'){
    for(const x of [-.48,.48]){
      add(new THREE.CylinderGeometry(.29,.25,1.8,40),fabric,[x,.35,0]);
      const foot=add(new THREE.SphereGeometry(1,40,24),fabric,[x,-.59,.3]);foot.scale.set(.29,.32,.64);
      add(new THREE.CylinderGeometry(.3,.3,.18,40),trim,[x,1.22,0]);
    }
  }else if(type==='bag'){
    box(2.15,1.9,.55,fabric,[0,-.2,0]);
    for(const z of [-.22,.22])tube([[-.65,.75,z],[-.65,1.4,z],[0,1.7,z],[.65,1.4,z],[.65,.75,z]],.055);
    box(2.15,.055,.56,trim,[0,.76,0]);
  }else{
    box(1.9,2.6,.25,pages);
    box(2.02,2.72,.045,fabric,[0,0,.15]);box(2.02,2.72,.045,fabric,[0,0,-.15]);
    box(.09,2.72,.32,fabric,[-.98,0,0]);
    box(.035,2.75,.02,trim,[.76,0,.18]);
    group.rotation.set(-.15,-.2,.05);
  }
  const bounds=new THREE.Box3().setFromObject(group);
  const center=bounds.getCenter(new THREE.Vector3());
  group.position.sub(center);
  return group;
}

export function disposeProduct(group, sharedMaterial) {
  const materials=new Set();
  group.traverse(o=>{if(o.isMesh){o.geometry.dispose();if(o.material!==sharedMaterial)materials.add(o.material);}});
  materials.forEach(m=>m.dispose());
}
