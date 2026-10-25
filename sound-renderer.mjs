import * as THREE from 'three';
import {createWeaveData} from './sound-weave.mjs';
// Positions and velocities are evaluated on the GPU, with stable per-particle seeds.
export class SoundRenderer{
 constructor(canvas,images){
  this.r=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'high-performance'});this.r.setPixelRatio(Math.min(devicePixelRatio,1.5));this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(38,1,.1,40);
  this.textures=images.map(im=>{const t=new THREE.Texture(im);t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t;});
  const n=256,count=n*n,seeds=new Float32Array(count*3),dummy=new Float32Array(count*3);
  this.fields=images.map((_,k)=>{const p=new Float32Array(count*3),uv=new Float32Array(count*2);for(let i=0;i<count;i++){const x=((i%n)+k*47)%n,y=(Math.floor(i/n)+k*31)%n;p[i*3]=(x/(n-1)-.5)*4;p[i*3+1]=(.5-y/(n-1))*4;uv[i*2]=x/(n-1);uv[i*2+1]=1-y/(n-1);}return {p:new THREE.BufferAttribute(p,3),uv:new THREE.BufferAttribute(uv,2)};});
  for(let i=0;i<count*3;i++)seeds[i]=Math.sin(i*127.1+31.7)*43758.5453%1;
  this.g=new THREE.BufferGeometry();this.g.setAttribute('position',new THREE.BufferAttribute(dummy,3));this.g.setAttribute('seed',new THREE.BufferAttribute(seeds,3));
  this.lastTime=null;this.reveal=0;this.warmth=0;this.growth=0;
  this.angle={x:.1,y:0};this.drag=null;this.events=new AbortController();
  this.zoom={current:1,target:1};this.basePointSize=2;
  canvas.style.touchAction='none';canvas.style.cursor='grab';
  canvas.addEventListener('wheel',e=>{
   // Leave browser accessibility zoom alone; only capture scrolling on the artwork.
   if(e.ctrlKey||e.metaKey||!e.deltaY)return;
   e.preventDefault();
   const unit=e.deltaMode===1?16:e.deltaMode===2?canvas.clientHeight:1;
   const delta=THREE.MathUtils.clamp(e.deltaY*unit,-240,240);
   this.zoom.target=THREE.MathUtils.clamp(this.zoom.target*Math.exp(-delta*.0015),.5,3);
  },{passive:false,signal:this.events.signal});
  canvas.addEventListener('pointerdown',e=>{
   if(e.button!==0||this.drag)return;
   this.drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';
  },{signal:this.events.signal});
  canvas.addEventListener('pointermove',e=>{
   if(this.drag?.id!==e.pointerId)return;
   const scale=3/Math.max(300,Math.min(canvas.clientWidth,canvas.clientHeight));
   this.angle.y=THREE.MathUtils.clamp(this.angle.y+(e.clientX-this.drag.x)*scale,-1.15,1.15);
   this.angle.x=THREE.MathUtils.clamp(this.angle.x+(e.clientY-this.drag.y)*scale,-.65,.65);
   this.drag.x=e.clientX;this.drag.y=e.clientY;
  },{signal:this.events.signal});
  const release=e=>{if(this.drag?.id!==e.pointerId)return;this.drag=null;canvas.style.cursor='grab';if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);};
  for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,release,{signal:this.events.signal});
  this.u={time:{value:0},bands:{value:new THREE.Vector4()},reveal:{value:0},warmth:{value:0},phase:{value:0},loose:{value:0},pointSize:{value:2},oldMap:{value:this.textures[0]},newMap:{value:this.textures[0]}};
  this.m=new THREE.ShaderMaterial({uniforms:this.u,transparent:true,depthWrite:false,vertexShader:`
   attribute vec3 sourceTarget,destinationTarget,seed;attribute vec2 sourceUV,destinationUV;
   uniform float time,phase,loose,pointSize,reveal,warmth;uniform vec4 bands;
   uniform sampler2D oldMap,newMap;varying vec3 tint;varying float visibility,sparkle,front;
   #ifdef WOVEN_THREAD
   attribute vec3 thread;uniform float threadHalfWidth;
   varying float threadAcross,threadDirection;
   #endif
   // A particle's immutable texture sample selects its palette region, never its position.
   float hueOf(vec3 c){
    float hi=max(c.r,max(c.g,c.b)),lo=min(c.r,min(c.g,c.b)),d=hi-lo;
    if(d<.0001)return 0.;
    float h=hi==c.r?(c.g-c.b)/d:hi==c.g?2.+(c.b-c.r)/d:4.+(c.r-c.g)/d;
    return fract(h/6.+1.);
   }
   vec3 regionPalette(float hue,float heat){
    float h=hue*6.;float f=fract(h);
    vec3 a,b;
    // Red / yellow / green / cyan / blue / purple retain distinct identities.
    vec3 r=mix(vec3(.32,.17,.55),vec3(.65,.10,.055),heat);
    vec3 y=mix(vec3(.11,.47,.44),vec3(.78,.49,.10),heat);
    vec3 g=mix(vec3(.10,.32,.20),vec3(.055,.29,.30),heat);
    vec3 c=mix(vec3(.075,.35,.51),vec3(.13,.22,.44),heat);
    vec3 bl=mix(vec3(.095,.14,.39),vec3(.43,.18,.06),heat);
    vec3 v=mix(vec3(.30,.16,.43),vec3(.35,.065,.12),heat);
    if(h<1.){a=r;b=y;}else if(h<2.){a=y;b=g;}else if(h<3.){a=g;b=c;}
    else if(h<4.){a=c;b=bl;}else if(h<5.){a=bl;b=v;}else{a=v;b=r;}
    return mix(a,b,f);
   }
   void main(){
    float blend=smoothstep(0.,1.,phase);vec3 origin=mix(sourceTarget,destinationTarget,blend);vec3 p=origin;
    vec3 baseColor=mix(texture2D(oldMap,sourceUV).rgb,texture2D(newMap,destinationUV).rgb,smoothstep(.25,.75,phase));
    float light=dot(baseColor,vec3(.2126,.7152,.0722));
    front=smoothstep(.18,.8,light);
    float amplitude=bands.w;float radius=length(origin.xy);float theta=atan(origin.y,origin.x);
    // Coherent islands activate together, preserving recognizable local motifs.
    float island=.5+.25*sin(origin.x*3.1+sin(origin.y*2.4))+.25*cos(origin.y*3.7-origin.x*.8);
    // Reveal contiguous central motifs first, then neighboring regions; never random holes.
    float threshold=radius*.82+island*.2;
    float activation=.82+reveal*1.85;
    float local=smoothstep(threshold-.14,threshold+.14,activation);
    visibility=local;
    // Bright silk floats forward; darker threads sit behind it.
    float mobility=.25+.75*front;
    float layerZ=(front-.45)*.65;
    p.z=layerZ;
    float breath=.003*sin(time*.65+radius)+.055*bands.x*amplitude*sin(time*2.2-radius*2.);
    p.xy+=origin.xy*breath;
    float fold=time*1.8+origin.x*2.6+origin.y*1.8;
    float unfolding=(1.-local)*.025+bands.y*amplitude*.075*mobility;
    p.xy+=vec2(sin(theta*3.+fold*.35),cos(theta*2.-fold*.3))*unfolding;
    p.y+=.17*bands.x*amplitude*mobility*sin(time*3.6-radius*2.);
    p.z+=(.015+.48*bands.y*amplitude)*sin(fold)*mobility;
    p.z+=.22*bands.x*amplitude*mobility*cos(radius*4.-time*3.);
    // Stable seeds provide individual velocity/phase, not newly generated noise.
    vec3 velocity=vec3(cos(time*(1.+abs(seed.x)*2.)+seed.y*6.),sin(time*(1.+abs(seed.y)*2.)+seed.z*6.),cos(time*2.+seed.x*6.));
    p+=velocity*(.001+.024*bands.z*amplitude*mobility);
    // Coherent folds carry the motifs; bright foreground gets more room than dark ground.
    float limitXY=.085+.14*front;
    float limitZ=.18+.45*front;
    vec2 offset=p.xy-origin.xy;p.xy=origin.xy+offset*min(1.,limitXY/max(length(offset),.0001));
    p.z=layerZ+clamp(p.z-layerZ,-limitZ,limitZ);
    p+=loose*(vec3(sin(origin.y*3.+time),cos(origin.x*3.-time*.6),sin(theta*3.+time))*.5+seed*.18);
    sparkle=1.+bands.z*amplitude*(.04+.12*front)*sin(time*12.+seed.x*19.);
    float hi=max(baseColor.r,max(baseColor.g,baseColor.b));
    float saturation=(hi-min(baseColor.r,min(baseColor.g,baseColor.b)))/max(hi,.0001);
    vec3 palette=regionPalette(hueOf(baseColor),warmth);
    // Normalize each mapped region to its source luminance: dark grounds stay dark.
    palette*=light/max(dot(palette,vec3(.2126,.7152,.0722)),.0001);
    vec3 neutral=vec3(light)*mix(vec3(.91,1.02,1.06),vec3(1.05,1.,.91),warmth);
    palette=mix(neutral,palette,smoothstep(.06,.38,saturation));
    tint=mix(baseColor,palette,.62);
    tint=clamp(tint,0.,1.);
    #ifdef WOVEN_THREAD
    // Only the drawing primitive changes; audio deformation above is shared.
    p.xy+=thread.z<.5?vec2(thread.x*threadHalfWidth,0.):vec2(0.,thread.x*threadHalfWidth);
    p.z+=thread.y;
    threadAcross=thread.x;threadDirection=thread.z;
    #endif
    vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(pointSize*(.78+.27*front)*8./-mv.z,1.,4.);
   }`,fragmentShader:`varying vec3 tint;varying float visibility,sparkle,front;
   void main(){float r=length(gl_PointCoord-.5);if(r>.5||visibility<.012)discard;gl_FragColor=vec4(tint*sparkle,visibility*(1.-smoothstep(.18,.5,r)));
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
   }`});
  this.points=new THREE.Points(this.g,this.m);this.points.frustumCulled=false;this.scene.add(this.points);this.setTargets(0,0);
  const weave=createWeaveData();
  this.weaveGeometry=new THREE.BufferGeometry();
  const centers=new THREE.BufferAttribute(weave.positions,3),uvs=new THREE.BufferAttribute(weave.uvs,2);
  this.weaveGeometry.setAttribute('position',centers);
  // Keep neighboring thread samples connected when the pattern changes.
  for(const name of ['sourceTarget','destinationTarget'])this.weaveGeometry.setAttribute(name,centers);
  for(const name of ['sourceUV','destinationUV'])this.weaveGeometry.setAttribute(name,uvs);
  this.weaveGeometry.setAttribute('seed',new THREE.BufferAttribute(weave.seeds,3));
  this.weaveGeometry.setAttribute('thread',new THREE.BufferAttribute(weave.threads,3));
  this.weaveGeometry.setIndex(new THREE.BufferAttribute(weave.indices,1));
  this.weaveMaterial=new THREE.ShaderMaterial({
   uniforms:{...this.u,threadHalfWidth:{value:weave.halfWidth}},defines:{WOVEN_THREAD:1},
   vertexShader:this.m.vertexShader,transparent:true,depthWrite:true,side:THREE.DoubleSide,
   fragmentShader:`varying vec3 tint;varying float visibility,sparkle,front;
    varying float threadAcross,threadDirection;
    void main(){
     float edge=1.-smoothstep(.78,1.,abs(threadAcross));
     if(visibility*edge<.012)discard;
     float crown=sqrt(max(0.,1.-threadAcross*threadAcross));
     float sheen=.18*pow(max(0.,1.-abs(threadAcross+.28)),14.);
     float fiber=.98+.02*cos(threadAcross*22.);
     vec3 silk=tint*(.72+.28*crown+sheen)*fiber*mix(.97,1.03,threadDirection);
     gl_FragColor=vec4(silk*sparkle,visibility*edge);
     #include <tonemapping_fragment>
     #include <colorspace_fragment>
    }`
  });
  this.weave=new THREE.Mesh(this.weaveGeometry,this.weaveMaterial);this.weave.frustumCulled=false;
  this.scene.add(this.weave);this.setMode('weave');
 }
 setMode(mode){this.mode=mode==='particles'?'particles':'weave';this.points.visible=this.mode==='particles';this.weave.visible=this.mode==='weave';}
 setCustomImage(image){
  const slot=this.customSlot??this.textures.length;this.customSlot=slot;
  const previous=this.textures[slot],texture=new THREE.Texture(image);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;
  this.textures[slot]=texture;this.fields[slot]=this.fields[0];this.setTargets(slot,slot);this.resetGrowth();previous?.dispose();return slot;
 }
 setTargets(a,b){if(a!==b)this.resetGrowth();this.g.setAttribute('sourceTarget',this.fields[a].p);this.g.setAttribute('destinationTarget',this.fields[b].p);this.g.setAttribute('sourceUV',this.fields[a].uv);this.g.setAttribute('destinationUV',this.fields[b].uv);this.u.oldMap.value=this.textures[a];this.u.newMap.value=this.textures[b];}
 resetGrowth(){this.growth=0;}
 resize(w,h){this.r.setSize(w,h,false);this.camera.aspect=w/Math.max(1,h);this.camera.position.z=8*Math.max(1,1/this.camera.aspect);this.camera.updateProjectionMatrix();this.basePointSize=Math.max(1.5,Math.min(w,h)*this.r.getPixelRatio()/256*1.15);this.u.pointSize.value=this.basePointSize*this.zoom.current;}
 draw(time,bands,transition,playing=false){
  const dt=this.lastTime===null?0:Math.min(.1,Math.max(0,time-this.lastTime));this.lastTime=time;
  const activity=THREE.MathUtils.smoothstep(bands[3]*.85+bands[1]*.55,.06,.83);
  // Accumulate only while audible playback advances; a loud opening cannot reveal everything.
  if(playing&&bands[3]>.015)this.growth=Math.min(1,this.growth+dt*(.014+.024*activity));
  this.reveal+=(this.growth-this.reveal)*(1-Math.exp(-dt*1.7));
  const heat=THREE.MathUtils.smoothstep(bands[3]*.8+bands[0]*.25,.28,.85);
  this.warmth+=(heat-this.warmth)*(1-Math.exp(-dt*.7));
  this.u.reveal.value=this.reveal;this.u.warmth.value=this.warmth;
  this.u.time.value=time;this.u.bands.value.fromArray(bands);this.u.phase.value=transition.mix;this.u.loose.value=transition.loose;
  const damping=1-Math.exp(-dt*10);
  if(this.zoom.current!==this.zoom.target){
   this.zoom.current+=(this.zoom.target-this.zoom.current)*damping;
   if(Math.abs(this.zoom.target-this.zoom.current)<.0001)this.zoom.current=this.zoom.target;
   // Lens zoom preserves the existing perspective/depth and avoids near-plane clipping.
   this.camera.zoom=this.zoom.current;this.camera.updateProjectionMatrix();
   this.u.pointSize.value=this.basePointSize*this.zoom.current;
  }
  this.points.rotation.x+=(this.angle.x-this.points.rotation.x)*damping;
  this.points.rotation.y+=(this.angle.y-this.points.rotation.y)*damping;
  this.weave.rotation.copy(this.points.rotation);
  this.r.render(this.scene,this.camera);
 }
 destroy(){this.events.abort();this.g.dispose();this.m.dispose();this.weaveGeometry.dispose();this.weaveMaterial.dispose();this.textures.forEach(t=>t.dispose());this.r.dispose();}
}
