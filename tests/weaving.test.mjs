import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GestureController, WeaveProgress, PatternTransition, WEFT_ROWS, GESTURE } from '../weaving-gesture.mjs';
import { patterns, Typewriter } from '../weaving-data.mjs';
function hand(x=.5,ratio=1.1,y=.6){
  const p=Array.from({length:21},()=>({x:1-x,y,z:0}));
  p[0].y=y+.2;p[5]={x:1-x-.1,y};p[17]={x:1-x+.1,y};
  p[8].y=y-.3;p[4]={x:p[8].x+.2*ratio,y:p[8].y};return p;
}
function sequence(g,from,to,start,duration=650,ratio=1.1){
  const results=[];for(let dt=0;dt<=duration;dt+=25)results.push(g.update([hand(from+(to-from)*dt/duration,ratio)],start+dt,1));return results;
}
test('stationary hand, jitter and a single pinch generate no strokes or switches',()=>{
  const g=new GestureController();
  for(let t=0;t<6000;t+=25){const s=g.update([hand(.5+Math.sin(t)*.015,t<3000?1.1:.15)],t,1);assert.equal(s.stroke,0);assert.equal(s.switchPattern,false);}
});
test('right, left, right traversals count once each, and single pinch is irrelevant',()=>{
  const g=new GestureController();
  const all=[...sequence(g,.2,.8,0),...sequence(g,.8,.2,675),...sequence(g,.2,.8,1350,650,.15)];
  assert.deepEqual(all.map(s=>s.stroke).filter(Boolean),[1,-1,1]);assert.ok(all.every(s=>!s.switchPattern));
});
test('one long movement cannot count repeatedly; vertical motion and teleports ignored',()=>{
  const g=new GestureController();assert.equal(sequence(g,.05,.95,0,1500).filter(s=>s.stroke).length,1);
  g.reset();g.update([hand(.1)],0,1);assert.equal(g.update([hand(.9)],25,1).stroke,0);
  g.reset();for(let t=0;t<1000;t+=25)assert.equal(g.update([hand(.5,1,.3+t/2000)],t,1).stroke,0);
});
test('lost tracking does not turn reacquisition into a shuttle stroke',()=>{
  const g=new GestureController();g.update([hand(.2)],0,1);g.update([],100,1);assert.equal(g.update([hand(.8)],150,1).stroke,0);
});
test('two hands: one pinching is insufficient, simultaneous pinch dwells then latches',()=>{
  const g=new GestureController();let count=0;
  for(let t=0;t<1000;t+=25){const s=g.update([hand(.3,.15),hand(.7,1)],t,1);assert.equal(s.switchPattern,false);assert.equal(s.stroke,0);}
  for(let t=1000;t<6000;t+=25){const s=g.update([hand(.3,.15),hand(.7,.15)],t,1);count+=Number(s.switchPattern);assert.equal(s.stroke,0);if(t<1000+GESTURE.pinchDwell)assert.equal(s.switchPattern,false);}
  assert.equal(count,1);
  g.resetMotion();for(let t=6000;t<7000;t+=25)count+=Number(g.update([hand(.3,.15),hand(.7,.15)],t,1).switchPattern);
  assert.equal(count,1,'pattern reset must not reset the pinch latch');
  for(let t=7000;t<7500;t+=25)g.update([],t,1);
  for(let t=7500;t<8500;t+=25)count+=Number(g.update([hand(.3,.15),hand(.7,.15)],t,1).switchPattern);
  assert.equal(count,1,'tracking loss cannot rearm');
  for(let t=8500;t<9000;t+=25)g.update([hand(.3,1),hand(.7,1)],t,1);
  for(let t=9000;t<9700;t+=25)count+=Number(g.update([hand(.3,.15),hand(.7,.15)],t,1).switchPattern);
  assert.equal(count,2);
});
test('brief dual pinch and alternating non-simultaneous pinches never switch',()=>{
  const g=new GestureController();let count=0;
  for(let t=0;t<4000;t+=25){const both=t<200;count+=Number(g.update([hand(.3,both||t%800<400?.15:1),hand(.7,both||t%800>=400?.15:1)],t,1).switchPattern);}
  assert.equal(count,0);
});
test('dual pinch tolerates one dropped hand frame but never triggers on missing hands',()=>{
  const g=new GestureController();let count=0;
  for(let t=0;t<650;t+=25){const hands=t===125?[hand(.3,.4)]:[hand(.3,.4),hand(.7,.4)];const s=g.update(hands,t,1);if(t===125){assert.equal(s.switchPattern,false);assert.equal(s.stroke,0);}count+=Number(s.switchPattern);}
  assert.equal(count,1);
  g.reset();for(let t=0;t<150;t+=25)g.update([hand(.3,.2),hand(.7,.2)],t,1);
  for(let t=150;t<2000;t+=25)assert.equal(g.update([hand(.3,.2)],t,1).switchPattern,false);
});
test('release during cooldown rearms safely, held pinch without release never does',()=>{
  const g=new GestureController();let count=0;
  for(let t=0;t<400;t+=25)count+=Number(g.update([hand(.3,.2),hand(.7,.2)],t,1).switchPattern);
  for(let t=400;t<800;t+=25)g.update([hand(.3,1),hand(.7,1)],t,1);
  for(let t=800;t<1800;t+=25)assert.equal(g.update([hand(.3,.2),hand(.7,.2)],t,1).switchPattern,false);
  for(let t=1800;t<5000;t+=25)count+=Number(g.update([hand(.3,.2),hand(.7,.2)],t,1).switchPattern);
  assert.equal(count,2);
});
test('turned palms use palm length to normalize pinch and report progress',()=>{
  const hands=[hand(.3,.4),hand(.7,.4)];for(const p of hands){p[5].x=p[0].x-.02;p[17].x=p[0].x+.02;}
  const g=new GestureController();let switches=0;
  for(let t=0;t<500;t+=25){const s=g.update(hands,t,1);assert.equal(s.pinched,2);switches+=Number(s.switchPattern);}
  assert.equal(switches,1);
});
test('progress starts at zero, accumulates, holds on idle, clamps and resets',()=>{
  const p=new WeaveProgress();assert.equal(p.update(3),0);p.advance();assert.equal(p.target,1/WEFT_ROWS);
  const first=p.update(.1);assert.ok(first>0&&first<p.target);p.update(2);const settled=p.value;assert.equal(p.update(10),settled);
  for(let i=0;i<WEFT_ROWS+1;i++)p.advance();assert.equal(p.target,1);assert.equal(p.update(100),1);p.reset();assert.equal(p.update(20),0);
});
test('short missed frame preserves motion, but never generates a stroke by itself',()=>{
  const g=new GestureController();g.update([hand(.3)],0,1);
  g.update([hand(.35)],70,1);const missing=g.update([],100,1);
  assert.equal(missing.recovering,true);assert.equal(missing.stroke,0);
  const s=g.update([hand(.49)],190,1);assert.equal(s.stroke,1);
  assert.equal(g.update([],600,1).recovering,false);
});
test('moderate 20-percent swings are responsive without counting twice',()=>{
  const g=new GestureController();const all=[...sequence(g,.3,.5,0,350),...sequence(g,.5,.3,375,350)];
  assert.deepEqual(all.map(s=>s.stroke).filter(Boolean),[1,-1]);
});
test('pattern changes reset progress, cycle five images and cannot double switch',()=>{
  const p=new WeaveProgress(),changes=[];const s=new PatternTransition(5,i=>{p.reset();changes.push(i);});
  for(let n=0;n<6;n++){p.advance();p.update(1);const t=n*2000;assert.equal(s.next(t),true);assert.equal(s.next(t+10),false);assert.equal(s.update(t),1);assert.equal(s.update(t+520),0);assert.equal(p.value,0);s.update(t+650);assert.equal(s.update(t+1200),1);assert.equal(p.update(10),0);}
  assert.deepEqual(changes,[1,2,3,4,0,1]);
});
test('typewriter cancels previous callbacks and resets without overlap',()=>{
  let output='',id=0;const jobs=new Map(),all=[];
  const w=new Typewriter(s=>output=s,fn=>{all.push(fn);jobs.set(++id,fn);return id;},i=>jobs.delete(i));
  w.start('旧的说明');const stale=all[0];w.start('新纹样');assert.equal(jobs.size,1);stale();assert.equal(output,'');
  while(jobs.size){const [key,fn]=jobs.entries().next().value;jobs.delete(key);fn();}assert.equal(output,'新纹样');w.stop();assert.equal(jobs.size,0);
});
test('five descriptions retain 100–150 Chinese characters',()=>{
  assert.equal(patterns.length,5);for(const p of patterns){const count=(p.description.match(/\p{Script=Han}/gu)||[]).length;assert.ok(count>=100&&count<=150);}
});
