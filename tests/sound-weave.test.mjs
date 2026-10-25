import test from 'node:test';
import assert from 'node:assert/strict';
import {createWeaveData} from '../sound-weave.mjs';

test('each warp and weft is a continuous indexed ribbon, not separate points',()=>{
 const count=8,samples=(count-1)*2+1,data=createWeaveData(count);
 assert.equal(data.positions.length/3,2*count*samples*2);
 assert.equal(data.indices.length,2*count*(samples-1)*6);
 for(let strip=0;strip<2*count;strip++){
  const first=strip*samples*2;
  for(let segment=0;segment<samples-1;segment++){
   const offset=(strip*(samples-1)+segment)*6,a=first+segment*2;
   assert.deepEqual([...data.indices.slice(offset,offset+6)],[a,a+1,a+2,a+1,a+3,a+2]);
  }
 }
 assert.ok(data.halfWidth>0&&data.halfWidth<4/(count-1)/2);
});

test('warp and weft cross in matching positions with alternating over/under heights',()=>{
 const count=8,samples=(count-1)*2+1,data=createWeaveData(count);
 for(let x=0;x<count;x++)for(let y=0;y<count;y++){
  const warp=(x*samples+y*2)*2,weft=((count+y)*samples+x*2)*2;
  assert.deepEqual([...data.positions.slice(warp*3,warp*3+3)],[...data.positions.slice(weft*3,weft*3+3)]);
  assert.deepEqual([...data.seeds.slice(warp*3,warp*3+3)],[...data.seeds.slice(weft*3,weft*3+3)]);
  assert.equal(data.threads[warp*3+1],-data.threads[weft*3+1]);
  assert.equal(Math.sign(data.threads[warp*3+1]),(x+y)%2===0?1:-1);
 }
});

test('ribbon edges share centerline colors and motion, and all buffer values are finite',()=>{
 const data=createWeaveData();
 for(const key of ['positions','uvs','seeds','threads','indices'])assert.ok(data[key].every(Number.isFinite));
 const vertices=data.positions.length/3;
 for(let i=0;i<vertices;i+=2){
  assert.equal(data.uvs[i*2],data.uvs[(i+1)*2]);
  assert.equal(data.uvs[i*2+1],data.uvs[(i+1)*2+1]);
  assert.equal(data.threads[i*3],-1);
  assert.equal(data.threads[(i+1)*3],1);
 }
 assert.ok(data.indices.every(index=>index<vertices));
});
