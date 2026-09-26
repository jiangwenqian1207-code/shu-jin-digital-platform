import { WEFT_ROWS } from './weaving-gesture.mjs';
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
uniform float direction;
const vec3 ground = vec3(.04706,.06275,.05882);
float hash(float n){return fract(sin(n*127.1+311.7)*43758.5453);}
void main(){
  float aspect=resolution.x/resolution.y;
  vec2 scale=aspect>1.777778 ? vec2(1.777778/aspect,1.) : vec2(1.,aspect/1.777778);
  vec2 p=(uv-.5)/scale+.5;
  if(any(lessThan(p,vec2(0.)))||any(greaterThan(p,vec2(1.)))) {color=vec4(ground,1.);return;}
  float r=min(276.,floor(p.y*277.)); float c=floor(p.x*277.);
  // One traversal inserts exactly one fine thread, not a multi-row band.
  float passes=clamp(progress*presence,0.,1.)*${WEFT_ROWS}.;
  float run=clamp(passes-r,0.,1.);
  float reverse=mod(r,2.);
  if(direction<0.)reverse=1.-reverse;
  float along=mix(p.x,1.-p.x,reverse);
  float deposited=step(.00001,run)*(1.-smoothstep(run-.002,run+.002,along));
  if(run>=.9999)deposited=1.;
  float dy=abs(fract(p.y*277.)-.5), dx=abs(fract(p.x*277.)-.5);
  vec2 aa=max(fwidth(p)*277.*.55,vec2(.025));
  float warp=1.-smoothstep(.10-aa.x*.3,.10+aa.x*.7,dx);
  float weft=1.-smoothstep(.27-aa.y*.4,.27+aa.y*.6,dy);
  // Same aspect, crop and bounds as the previous artwork.
  vec2 texUV=vec2(p.x,.5+(p.y-.5)/1.777778);
  vec3 ink=texture(pattern,texUV).rgb;
  float overUnder=mod(r+c,2.);
  vec3 bare=ground+vec3(.40,.32,.20)*warp*(.36+.24*hash(c));
  float threadShade=.66+.25*weft+.09*warp*overUnder;
  vec3 result=mix(bare,ink*threadShade,deposited*max(weft,warp*.65));
  // Small shuttle glint, confined to the active weft band; never a UI line.
  float movingWeft=step(.001,run)*(1.-step(.999,run));
  result=mix(result,vec3(.88,.68,.32),movingWeft*weft*deposited*.6);
  float tip=(1.-smoothstep(.001,.008,abs(along-run)))*movingWeft*weft;
  result+=vec3(.55,.43,.23)*tip*.45;
  float selvage=smoothstep(0.,.005,min(min(p.x,1.-p.x),min(p.y,1.-p.y)));
  color=vec4(mix(ground,result,selvage),1.);
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
    this.uniforms=Object.fromEntries(['resolution','progress','presence','direction'].map(n=>[n,gl.getUniformLocation(this.program,n)]));
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
  draw(progress,presence,direction=1) { const gl=this.gl;gl.uniform2f(this.uniforms.resolution,this.canvas.width,this.canvas.height);gl.uniform1f(this.uniforms.progress,progress);gl.uniform1f(this.uniforms.presence,presence);gl.uniform1f(this.uniforms.direction,direction);gl.drawArrays(gl.TRIANGLES,0,6); }
  destroy(){const gl=this.gl;gl.deleteTexture(this.texture);gl.deleteBuffer(this.buffer);gl.deleteProgram(this.program);}
}

// Older devices still get ordered, textured warp/weft masks rather than a blank screen.
export class CanvasLoomRenderer {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.mask=document.createElement('canvas');this.m=this.mask.getContext('2d');}
  setImage(image){this.image=image;}
  resize(w,h){this.canvas.width=Math.max(1,Math.round(w));this.canvas.height=Math.max(1,Math.round(h));this.mask.width=this.canvas.width;this.mask.height=this.canvas.height;}
  draw(progress,presence,direction=1){
    const {ctx,m,canvas}=this,w=canvas.width,h=canvas.height;
    const aw=Math.min(w,h*16/9),ah=aw*9/16,x=(w-aw)/2,y=(h-ah)/2;
    ctx.fillStyle='#0c100f';ctx.fillRect(0,0,w,h);m.clearRect(0,0,w,h);m.globalCompositeOperation='source-over';m.fillStyle='#fff';
    const rows=WEFT_ROWS,passes=Math.min(1,progress*presence)*rows;
    ctx.fillStyle='#514533';
    for(let i=0;i<277;i++)ctx.fillRect(x+(i+.5)*aw/277,y,Math.max(.5,aw/277*.18),ah);
    for(let i=0;i<rows;i++){
      const run=Math.max(0,Math.min(1,passes-i));
      const reverse=(i%2===1)!==(direction<0);
      m.fillRect(x+(reverse?aw*(1-run):0),y+ah-(i+.77)*ah/rows,aw*run,ah/rows*.54);
    }
    m.globalCompositeOperation='source-in';
    const image=this.image,sy=(image.height-image.width*9/16)/2;
    m.drawImage(image,0,sy,image.width,image.width*9/16,x,y,aw,ah);
    ctx.drawImage(this.mask,0,0);
    const row=Math.floor(passes),run=passes-row,reverse=(row%2===1)!==(direction<0);
    if(run>0&&row<rows){ctx.fillStyle='#dcb367';ctx.fillRect(x+(reverse?aw*(1-run):0),y+ah-(row+.77)*ah/rows,aw*run,ah/rows*.54);}
  }
  destroy(){}
}
