const vertex = `#version 300 es
in vec2 a_position;
out vec2 uv;
void main(){ uv = a_position*.5+.5; gl_Position=vec4(a_position,0.,1.); }
`;
const fragment = `#version 300 es
precision highp float;
in vec2 uv;
out vec4 color;
uniform sampler2D pattern;
uniform vec2 resolution;
uniform float progress;
uniform float presence;
const vec3 ground = vec3(.04706,.06275,.05882);
float hash(float n){return fract(sin(n*127.1+311.7)*43758.5453);}
// Fixed per-thread phase/offset: geometry does not re-randomize each frame.
// Four opposing bundles echo TD geo1..4; 277 rows per bundle.
float reach(float row, float seed, float phase, float cycles){
  float wave = .5+.5*sin((row/277.*cycles+phase)*6.2831853);
  float stagger = hash(row+seed);
  float loose = .025+.21*wave+.095*stagger;
  float growth = smoothstep(stagger*.13, .84+stagger*.16, progress);
  return mix(loose,.70,growth)*presence;
}
float coverage(float position, float length){ return 1.-smoothstep(length-.002,length+.002,position); }
void main(){
  float aspect=resolution.x/resolution.y;
  vec2 scale=aspect>1.777778 ? vec2(1.777778/aspect,1.) : vec2(1.,aspect/1.777778);
  vec2 p=(uv-.5)/scale+.5;
  if(any(lessThan(p,vec2(0.)))||any(greaterThan(p,vec2(1.)))) {color=vec4(ground,1.);return;}
  float r=floor(p.y*277.); float c=floor(p.x*277.);
  float left=reach(r,7.,mix(-.56,-.14,progress),.6);
  float right=reach(r,71.,mix(-.46,-.12,progress),.8);
  float bottom=reach(c,131.,mix(-.46,-.12,progress),.8);
  float top=reach(c,199.,mix(-.46,-.12,progress),.8);
  float horizontal=max(coverage(p.x,left),coverage(1.-p.x,right));
  float vertical=max(coverage(p.y,bottom),coverage(1.-p.y,top));
  float dy=abs(fract(p.y*277.)-.5), dx=abs(fract(p.x*277.)-.5);
  vec2 aa=max(fwidth(p)*277.*.55,vec2(.025));
  float thickness=mix(.12,.49,smoothstep(.05,.98,progress));
  float weft=(1.-smoothstep(thickness-aa.y,thickness+aa.y,dy))*horizontal;
  float warp=(1.-smoothstep(thickness-aa.x,thickness+aa.x,dx))*vertical;
  float cloth=max(weft,warp);
  // Fine projecting line ends remain visible ahead of the coloured fabric.
  float hLead=max(coverage(p.x,left+.105*presence),coverage(1.-p.x,right+.105*presence));
  float vLead=max(coverage(p.y,bottom+.105*presence),coverage(1.-p.y,top+.105*presence));
  float threadH=(1.-smoothstep(.04,.04+aa.y,dy))*hLead;
  float threadV=(1.-smoothstep(.04,.04+aa.x,dx))*vLead;
  // fitoutside in the TD file: source square texture cropped to the 16:9 loom.
  vec2 texUV=vec2(p.x,.5+(p.y-.5)/1.777778);
  vec3 ink=texture(pattern,texUV).rgb;
  float overUnder=mod(r+c,2.);
  float relief=mix(.86,1.,mix(overUnder,1.-overUnder,step(warp,weft)));
  vec3 woven=ink*relief;
  vec3 result=mix(ground,woven,cloth);
  float tip=max(threadH-horizontal*.9,threadV-vertical*.9);
  result+=mix(vec3(.45,.43,.36),ink,.55)*tip*.43*(1.-progress*.8);
  float selvage=smoothstep(0.,.005,min(min(p.x,1.-p.x),min(p.y,1.-p.y)));
  color=vec4(mix(ground,result,presence*selvage),1.);
}
`;

export class LoomRenderer {
  constructor(canvas) {
    this.canvas=canvas;
    const gl=this.gl=canvas.getContext('webgl2',{alpha:false,antialias:false,powerPreference:'high-performance'});
    if (!gl) throw new Error('WebGL2 unavailable');
    const compile=(type,code)=>{ const s=gl.createShader(type); gl.shaderSource(s,code); gl.compileShader(s); if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    this.program=gl.createProgram();
    const vs=compile(gl.VERTEX_SHADER,vertex), fs=compile(gl.FRAGMENT_SHADER,fragment);
    gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);
    gl.deleteShader(vs);gl.deleteShader(fs);
    if(!gl.getProgramParameter(this.program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(this.program));
    gl.useProgram(this.program);
    this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const a=gl.getAttribLocation(this.program,'a_position');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
    this.uniforms=Object.fromEntries(['resolution','progress','presence'].map(n=>[n,gl.getUniformLocation(this.program,n)]));
    this.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(this.program,'pattern'),0);
  }
  setImage(image) { const gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image); }
  resize(width,height) {
    const dpr=Math.min(window.devicePixelRatio||1,1.5,1600/Math.max(1,width));
    this.canvas.width=Math.max(1,Math.round(width*dpr));this.canvas.height=Math.max(1,Math.round(height*dpr));
    this.gl.viewport(0,0,this.canvas.width,this.canvas.height);
  }
  draw(progress,presence) { const gl=this.gl;gl.uniform2f(this.uniforms.resolution,this.canvas.width,this.canvas.height);gl.uniform1f(this.uniforms.progress,progress);gl.uniform1f(this.uniforms.presence,presence);gl.drawArrays(gl.TRIANGLES,0,6); }
  destroy(){const gl=this.gl;gl.deleteTexture(this.texture);gl.deleteBuffer(this.buffer);gl.deleteProgram(this.program);}
}

// Older devices still get ordered, textured warp/weft masks rather than a blank screen.
export class CanvasLoomRenderer {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.mask=document.createElement('canvas');this.m=this.mask.getContext('2d');}
  setImage(image){this.image=image;}
  resize(w,h){this.canvas.width=Math.max(1,Math.round(w));this.canvas.height=Math.max(1,Math.round(h));this.mask.width=this.canvas.width;this.mask.height=this.canvas.height;}
  draw(progress,presence){
    const {ctx,m,canvas}=this,w=canvas.width,h=canvas.height;
    const aw=Math.min(w,h*16/9),ah=aw*9/16,x=(w-aw)/2,y=(h-ah)/2;
    ctx.fillStyle='#0c100f';ctx.fillRect(0,0,w,h);m.clearRect(0,0,w,h);m.globalCompositeOperation='source-over';m.fillStyle='#fff';
    const rows=Math.min(277,Math.max(100,Math.floor(ah/2))), thick=.22+.77*progress;
    for(let i=0;i<rows;i++){
      const wave=.5+.5*Math.sin(i/rows*Math.PI*1.6-2.8+progress*2.2);
      const reach=(.05+.2*wave+progress*.66)*presence;
      m.fillRect(x,y+i*ah/rows,aw*reach,ah/rows*thick);m.fillRect(x+aw*(1-reach),y+i*ah/rows,aw*reach,ah/rows*thick);
      m.fillRect(x+i*aw/rows,y,aw/rows*thick,ah*reach);m.fillRect(x+i*aw/rows,y+ah*(1-reach),aw/rows*thick,ah*reach);
    }
    m.globalCompositeOperation='source-in';
    const image=this.image,sy=(image.height-image.width*9/16)/2;
    m.drawImage(image,0,sy,image.width,image.width*9/16,x,y,aw,ah);
    ctx.globalAlpha=presence;ctx.drawImage(this.mask,0,0);ctx.globalAlpha=1;
  }
  destroy(){}
}
