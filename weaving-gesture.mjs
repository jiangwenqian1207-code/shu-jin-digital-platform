const distance=(a,b,aspect)=>Math.hypot((a.x-b.x)*aspect,a.y-b.y);
export const WEFT_ROWS=277;
export const GESTURE=Object.freeze({travel:.12,minDuration:100,maxDuration:1800,strokeCooldown:180,pinchOn:.45,pinchOff:.65,pinchDwell:240,pinchGrace:180,releaseDwell:240,cooldown:1800});

// A completed traversal requires a reversal before another can count.
export class ShuttleTracker {
  constructor(){this.reset();}
  reset(){this.x=null;this.rawX=null;this.time=null;this.pivot=null;this.lastDirection=0;this.started=null;this.lastStroke=-Infinity;}
  update(rawX,y,now){
    if(this.time===null||now-this.time>300||Math.abs(rawX-this.rawX)>.23){this.reset();this.x=rawX;this.rawX=rawX;this.time=now;this.pivot={x:rawX,y};return 0;}
    const dt=Math.max(1,now-this.time);this.time=now;this.rawX=rawX;this.x+=(rawX-this.x)*(1-Math.exp(-dt/35));
    const dx=this.x-this.pivot.x;
    if(this.lastDirection&&dx*this.lastDirection>0){this.pivot={x:this.x,y};this.started=null;return 0;}
    if(Math.abs(dx)<.03){this.started=null;return 0;}
    if(this.started===null)this.started=now;
    const elapsed=now-this.started;
    if(elapsed>GESTURE.maxDuration||Math.abs(y-this.pivot.y)>.14){this.pivot={x:this.x,y};this.started=null;return 0;}
    const direction=Math.sign(dx);
    if(Math.abs(dx)>=GESTURE.travel&&elapsed>=GESTURE.minDuration&&now-this.lastStroke>=GESTURE.strokeCooldown&&direction!==this.lastDirection){this.lastDirection=direction;this.lastStroke=now;this.pivot={x:this.x,y};this.started=null;return direction;}
    return 0;
  }
}
export class GestureController {
  constructor(){this.motion=new ShuttleTracker();this.reset();}
  reset(){this.motion.reset();this.bothSince=null;this.pinchMs=0;this.lastPinchFrame=null;this.lastBothSeen=-Infinity;this.releaseSince=null;this.latched=false;this.cooldownUntil=0;this.lastTime=null;this.lastSeen=-Infinity;this.singleLabel=null;}
  resetMotion(){this.motion.reset();this.singleLabel=null;}
  update(hands,now,aspect=4/3,labels=[]){
    hands=hands||[];
    const result={stroke:0,switchPattern:false,visible:hands.length>0,hands:hands.length};
    if(hands.length)this.lastSeen=now;
    result.recovering=!hands.length&&now-this.lastSeen<300;
    if(this.lastTime!==null&&now-this.lastTime>300){this.bothSince=null;this.releaseSince=null;this.resetMotion();}
    this.lastTime=now;
    // Palm length stays usable when turning the hand makes palm width narrow.
    const ratios=hands.map(p=>distance(p[4],p[8],aspect)/Math.max(.035,distance(p[5],p[17],aspect),distance(p[0],p[9],aspect)));
    result.pinched=ratios.filter(r=>r<GESTURE.pinchOn).length;
    result.latched=this.latched;result.cooling=now<this.cooldownUntil;result.confirming=false;
    if(hands.length===2){
      this.lastBothSeen=now;
      this.resetMotion();
      // Missing hands cannot rearm a held pinch: require two visible releases.
      if(ratios.every(r=>r>GESTURE.pinchOff)){this.bothSince=null;if(this.releaseSince===null)this.releaseSince=now;if(now-this.releaseSince>=GESTURE.releaseDwell)this.latched=false;}else this.releaseSince=null;
      const both=ratios.every(r=>r<(this.bothSince===null?GESTURE.pinchOn:GESTURE.pinchOff));
      if(both){
        if(this.bothSince===null){this.bothSince=now;this.pinchMs=0;this.lastPinchFrame=null;}
        // Only jointly observed frames count. A missed frame pauses, never confirms.
        if(this.lastPinchFrame!==null)this.pinchMs+=Math.min(100,now-this.lastPinchFrame);
        this.lastPinchFrame=now;result.confirming=true;result.pinched=2;
        if(!this.latched&&now>=this.cooldownUntil&&this.pinchMs>=GESTURE.pinchDwell){result.switchPattern=true;this.latched=true;this.cooldownUntil=now+GESTURE.cooldown;}
      }else{this.bothSince=null;this.pinchMs=0;this.lastPinchFrame=null;}
      result.latched=this.latched;result.cooling=now<this.cooldownUntil;
      return result;
    }
    this.lastPinchFrame=null;this.releaseSince=null;
    if(now-this.lastBothSeen<=GESTURE.pinchGrace){this.resetMotion();return result;}
    this.bothSince=null;this.pinchMs=0;
    // Keep a short real-coordinate history through an occasional missed frame.
    // Never synthesize movement; long gaps and position jumps still reset it.
    if(!hands.length){if(!result.recovering)this.resetMotion();return result;}
    if(now<this.cooldownUntil){this.resetMotion();return result;}
    const p=hands[0],x=1-(p[0].x+p[5].x+p[9].x+p[17].x)/4,y=(p[0].y+p[5].y+p[9].y+p[17].y)/4;
    result.stroke=this.motion.update(x,y,now);return result;
  }
}
export class WeaveProgress {
  constructor(){this.reset();}
  reset(){this.target=0;this.value=0;this.direction=1;}
  advance(direction=1){if(this.target===0)this.direction=direction;this.target=Math.min(1,this.target+1/WEFT_ROWS);}
  update(dt){this.value=Math.min(this.target,this.value+Math.max(0,dt)/(WEFT_ROWS*.24));if(this.target-this.value<1e-7)this.value=this.target;return this.value;}
}
// Retract old weft, then swap. New pattern starts with bare warp, not a fade-in.
export class PatternTransition {
  constructor(count,onChange){this.count=count;this.onChange=onChange;this.index=0;this.started=null;this.changed=false;}
  next(now){if(this.started!==null)return false;this.started=now;this.changed=false;return true;}
  update(now){if(this.started===null)return 1;const t=now-this.started;if(t<520)return .5+.5*Math.cos(Math.PI*t/520);if(!this.changed){this.index=(this.index+1)%this.count;this.changed=true;this.onChange(this.index);}if(t<1200)return .5-.5*Math.cos(Math.PI*(t-520)/680);this.started=null;return 1;}
}
