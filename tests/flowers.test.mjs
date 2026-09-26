import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {flowers} from '../flowers-data.mjs';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Box3,Vector3} from 'three';
test('five flowers keep their specified source mappings and local assets',()=>{
 assert.deepEqual(flowers.map(f=>f.name),['兰花','水仙','菊花','芙蓉','梅花']);
 assert.deepEqual(flowers.map(f=>f.sources.map(s=>s.name)),[['方方锦','黄地对鹿纹锦'],['鹤鹿同春柿蒂纹锦','黄地对鹿纹锦'],['菱纹锦','联珠对鹊纹锦','黄地对鹿纹锦'],['红地五彩鸟纹锦','黄地对鹿纹锦','方方锦'],['黄地对鹿纹锦']]);
 for(const f of flowers){assert.ok(f.description.length>100);for(const path of [f.model,f.poster,...f.sources.map(s=>s.url)])assert.ok(existsSync(path),path);}
});
for(const f of flowers)test(`${f.name}: actual GLB parses with finite geometry bounds`,async()=>{
 const b=readFileSync(f.model);assert.equal(b.toString('utf8',0,4),'glTF');
 const gltf=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 const size=new Box3().setFromObject(gltf.scene).getSize(new Vector3());assert.ok([size.x,size.y,size.z].every(n=>Number.isFinite(n)&&n>0));let count=0;gltf.scene.traverse(o=>{if(o.isMesh)count++;});assert.ok(count>0);
});
