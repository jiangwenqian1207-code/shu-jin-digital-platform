import * as THREE from 'three';
export class ParticleRenderer{
 constructor(canvas,images){
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(38,1,.1,50);this.camera.position.z=7.5;
  const size=240,count=size*size,positions=new Float32Array(count*3),uv=new Float32Array(count*2);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=y*size+x;positions[i*3]=(x/(size-1)-.5)*4;positions[i*3+1]=(.5-y/(size-1))*4;uv[i*2]=x/(size-1);uv[i*2+1]=1-y/(size-1);}
  this.textures=images.map(image=>{const t=new THREE.Texture(image);t.needsUpdate=true;t.colorSpace=THREE.SRGBColorSpace;return t;});
  this.geometry=new THREE.BufferGeometry();this.geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));this.geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  this.uniforms={time:{value:0},formation:{value:0},pixels:{value:1},pattern:{value:this.textures[0]},nextPattern:{value:this.textures[0]},colorMix:{value:0}};
  this.material=new THREE.ShaderMaterial({uniforms:this.uniforms,transparent:true,depthWrite:false,vertexShader:`
   uniform float time,formation,pixels; varying vec2 vUv; varying float depth;
   void main(){vUv=uv;float loose=1.-formation;vec3 p=position;
    // Correlated waves preserve local structure: loose matter, not white noise.
    vec3 flow=vec3(sin(p.y*3.1+time*.34)+cos(p.x*2.4-time*.22),cos(p.x*3.+time*.29)+sin(p.y*2.-time*.24),sin(p.x*2.+p.y*2.6+time*.3));
    p+=loose*(flow*.65+vec3(position.xy*.13,0.));
    p.z+=loose*.3*sin(p.y*6.+time*.2);vec4 mv=modelViewMatrix*vec4(p,1.);depth=clamp((mv.z+8.)*.1+.75,.4,1.);
    gl_Position=projectionMatrix*mv;gl_PointSize=clamp(pixels*7.5/-mv.z,1.,6.);
   }`,fragmentShader:`uniform sampler2D pattern,nextPattern;uniform float colorMix,formation;varying vec2 vUv;varying float depth;
   void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;vec3 c=mix(texture2D(pattern,vUv).rgb,texture2D(nextPattern,vUv).rgb,colorMix);gl_FragColor=vec4(c, (1.-smoothstep(.32,.5,r))*mix(.52*depth,1.,formation));
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
   }`});
  this.points=new THREE.Points(this.geometry,this.material);this.points.frustumCulled=false;this.scene.add(this.points);
 }
 resize(w,h){this.renderer.setSize(w,h,false);this.camera.aspect=w/Math.max(1,h);this.camera.position.z=Math.max(9.5,9.5/this.camera.aspect);this.camera.updateProjectionMatrix();this.uniforms.pixels.value=Math.max(1.4,Math.min(w,h)*this.renderer.getPixelRatio()/240*1.1);}
 draw(t,formation,angle){this.uniforms.time.value=t;this.uniforms.formation.value=formation;this.points.rotation.y=angle;this.camera.position.z=(9.5-2*formation)*Math.max(1,1/this.camera.aspect);this.renderer.render(this.scene,this.camera);}
 blend(from,to,t){this.uniforms.pattern.value=this.textures[from];this.uniforms.nextPattern.value=this.textures[to];this.uniforms.colorMix.value=t;}
 destroy(){this.geometry.dispose();this.material.dispose();this.textures.forEach(t=>t.dispose());this.renderer.dispose();}
}
