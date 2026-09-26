import { GestureController } from './weaving-gesture.mjs';
const clamp=x=>Math.max(0,Math.min(1,x));
const distance=(a,b,aspect)=>Math.hypot((a.x-b.x)*aspect,a.y-b.y);
// Two-hand latch/dwell is shared; weaving stroke outputs are deliberately ignored.
export class ParticleGesture {
 constructor(){this.dual=new GestureController();this.reset();}
 reset(){this.dual.reset();this.target=0;this.angle=0;this.seen=-Infinity;this.blockUntil=0;this.pinched=false;this.anchor=null;this.anchorAngle=0;}
 update(hands,now,aspect=4/3,labels=[]){
  const dual=this.dual.update(hands,now,aspect,labels);
  if(hands.length)this.seen=now;
  if(hands.length===2){this.blockUntil=now+300;this.anchor=null;this.pinched=false;return {next:dual.switchPattern,mode:dual.latched?'双手已确认 · 松开双手后可再次切换':`已识别双手 · ${dual.pinched}/2 捏合`,target:this.target,angle:this.angle};}
  if(now<this.blockUntil)return {target:this.target,angle:this.angle,mode:'等待单手稳定'};
  if(hands.length===1){
   const p=hands[0],ratio=distance(p[4],p[8],aspect)/Math.max(.035,distance(p[5],p[17],aspect),distance(p[0],p[9],aspect));
   this.pinched=ratio<(this.pinched?.65:.45);
   this.target=clamp((.85-ratio)/.55);
   const x=1-(p[0].x+p[9].x)/2;
   if(this.pinched){if(this.anchor===null){this.anchor=x;this.anchorAngle=this.angle;}const dx=x-this.anchor;this.angle=Math.max(-1.15,Math.min(1.15,this.anchorAngle+(Math.abs(dx)<.015?0:dx)*3));}
   else this.anchor=null;
  }else if(now-this.seen>650){this.target=0;this.anchor=null;this.pinched=false;}
  return {target:this.target,angle:this.angle,mode:!hands.length?'寻找手部 · 可按住画面体验':this.pinched?'单手捏合 · 左右移动旋转':'单手张开 · 粒子游离'};
 }
}
