import test from 'node:test';
import assert from 'node:assert/strict';
import {ParticleGesture} from '../particles-gesture.mjs';
function hand(pinch,x=.5){const p=Array.from({length:21},()=>({x,y:.5}));p[0]={x,y:.75};p[9]={x,y:.5};p[5]={x:x-.1,y:.55};p[17]={x:x+.1,y:.55};p[4]={x,y:.4};p[8]={x:x+(pinch?.025:.24),y:.4};return p;}
test('single pinch forms, movement rotates, release disperses',()=>{const g=new ParticleGesture();let s=g.update([hand(true)],0);assert.equal(s.target,1);s=g.update([hand(true,.65)],40);assert.ok(s.angle<0);assert.ok(!s.next);assert.equal(g.update([hand(false)],80).target,0);});
test('brief loss holds target, sustained loss disperses',()=>{const g=new ParticleGesture();g.update([hand(true)],0);assert.equal(g.update([],300).target,1);assert.equal(g.update([],700).target,0);});
test('two-hand priority, dwell, latch and explicit release to rearm',()=>{const g=new ParticleGesture();let count=0;for(let t=0;t<5000;t+=40)count+=!!g.update([hand(true,.3),hand(true,.7)],t).next;assert.equal(count,1);for(let t=5000;t<5400;t+=40)g.update([hand(false,.3),hand(false,.7)],t);for(let t=5400;t<6100;t+=40)count+=!!g.update([hand(true,.3),hand(true,.7)],t).next;assert.equal(count,2);});
test('lost hand cannot rearm a held dual pinch',()=>{const g=new ParticleGesture();let count=0;for(let t=0;t<500;t+=40)count+=!!g.update([hand(true),hand(true)],t).next;g.update([],3000);for(let t=3100;t<4000;t+=40)count+=!!g.update([hand(true),hand(true)],t).next;assert.equal(count,1);});
