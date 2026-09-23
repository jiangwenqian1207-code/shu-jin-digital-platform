import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GestureController, PatternTransition } from '../weaving-gesture.mjs';
import { patterns, Typewriter } from '../weaving-data.mjs';

function hand(x=.5,ratio=1.1){
  const p=Array.from({length:21},()=>({x:1-x,y:.6,z:0}));
  p[0].y=.8;p[5]={x:1-x-.1,y:.6};p[17]={x:1-x+.1,y:.6};p[9].y=.6;
  for(const [tip,pip] of [[8,6],[12,10],[16,14],[20,18]]){p[pip].y=.48;p[tip].y=.30;}
  p[4]={x:p[8].x+.2*ratio,y:p[8].y};return p;
}
test('pinch dwell, hysteresis, short tracking loss and release',()=>{
  const g=new GestureController();let result;
  for(let t=0;t<=300;t+=20)result=g.update(hand(.5,.2),t,1);
  assert.equal(result.pinch,true);
  for(let t=320;t<900;t+=20){result=g.update(hand(.5,.38+(t%3)*.03),t,1);assert.equal(result.pinch,true);assert.equal(result.swipe,false);}
  assert.equal(g.update(null,1000).pinch,true);
  assert.equal(g.update(null,1300).pinch,false);
  for(let t=1400;t<2000;t+=20)result=g.update(hand(.5,1.1),t,1);
  assert.equal(result.pinch,false);
});
test('one rightward wave fires once, held-open motion cannot retrigger',()=>{
  const g=new GestureController();let count=0;
  for(let t=0;t<500;t+=20)g.update(hand(.25),t,1);
  for(let t=500;t<850;t+=20)count+=Number(g.update(hand(.25+(t-500)/350*.5),t,1).swipe);
  assert.equal(count,1);
  for(let t=850;t<2000;t+=20)count+=Number(g.update(hand(.75+(t-850)/1150*.2),t,1).swipe);
  assert.equal(count,1);
});
test('pinch plus large lateral drift never changes pattern; left swipe ignored',()=>{
  const g=new GestureController();let count=0;
  for(let t=0;t<400;t+=20)g.update(hand(.2,.18),t,1);
  for(let t=400;t<800;t+=20)count+=Number(g.update(hand(.2+(t-400)/400*.6,.18),t,1).swipe);
  assert.equal(count,0);
  g.reset();for(let t=0;t<500;t+=20)g.update(hand(.8),t,1);
  for(let t=500;t<900;t+=20)count+=Number(g.update(hand(.8-(t-500)/400*.6),t,1).swipe);
  assert.equal(count,0);
});
test('a second intentional wave works only after cooldown and stable rearm',()=>{
  const g=new GestureController();let count=0;
  for(let t=0;t<500;t+=20)g.update(hand(.25),t,1);
  for(let t=500;t<850;t+=20)count+=Number(g.update(hand(.25+(t-500)/350*.5),t,1).swipe);
  for(let t=850;t<1200;t+=20)count+=Number(g.update(hand(.75-(t-850)/350*.5),t,1).swipe);
  for(let t=1200;t<2800;t+=20)count+=Number(g.update(hand(.25),t,1).swipe);
  for(let t=2800;t<3150;t+=20)count+=Number(g.update(hand(.25+(t-2800)/350*.5),t,1).swipe);
  assert.equal(count,2);
});
test('jitter cannot switch, release immediately before a wave is suppressed',()=>{
  const g=new GestureController();let count=0;
  for(let t=0;t<3000;t+=20)count+=Number(g.update(hand(.5+Math.sin(t)*.025),t,1).swipe);
  assert.equal(count,0);
  g.reset();for(let t=0;t<400;t+=20)g.update(hand(.3,.15),t,1);
  for(let t=400;t<700;t+=20)count+=Number(g.update(hand(.3+(t-400)/300*.5),t,1).swipe);
  assert.equal(count,0);
});
test('five patterns cycle, transition ignores repeated requests and swaps only once',()=>{
  const changes=[];const s=new PatternTransition(5,i=>changes.push(i));
  for(let n=0;n<6;n++){
    const t=n*2000;assert.equal(s.next(t),true);assert.equal(s.next(t+10),false);
    assert.equal(s.update(t),1);assert.equal(s.update(t+520),0);
    s.update(t+650);assert.equal(s.update(t+1200),1);
  }
  assert.deepEqual(changes,[1,2,3,4,0,1]);
});
test('typewriter cancels previous callbacks and resets without overlapping text',()=>{
  let output='',id=0;const jobs=new Map();const all=[];
  const w=new Typewriter(s=>output=s,fn=>{all.push(fn);jobs.set(++id,fn);return id;},i=>jobs.delete(i));
  w.start('旧的说明');const stale=all[0];w.start('新纹样');assert.equal(jobs.size,1);stale();assert.equal(output,'');
  while(jobs.size){const [key,fn]=jobs.entries().next().value;jobs.delete(key);fn();}
  assert.equal(output,'新纹样');w.stop();assert.equal(jobs.size,0);
});
test('all five descriptions are 100–150 Chinese characters and assets are unique',()=>{
  assert.equal(patterns.length,5);assert.equal(new Set(patterns.map(p=>p.file)).size,5);
  for(const p of patterns){const count=(p.description.match(/\p{Script=Han}/gu)||[]).length;assert.ok(count>=100&&count<=150,`${p.name}: ${count}`);}
});
