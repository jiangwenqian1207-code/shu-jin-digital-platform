// Continuous warp and weft ribbons. Both sets meet at the same sample positions,
// with opposite heights at each crossing to make a plain over/under weave.
export function createWeaveData(threadCount=128){
 const samples=(threadCount-1)*2+1;
 const vertexCount=threadCount*samples*4;
 const positions=new Float32Array(vertexCount*3);
 const uvs=new Float32Array(vertexCount*2);
 const seeds=new Float32Array(vertexCount*3);
 const threads=new Float32Array(vertexCount*3);
 const indices=new Uint32Array(2*threadCount*(samples-1)*6);
 const spacing=4/(threadCount-1);
 let vertex=0,index=0;
 for(let axis=0;axis<2;axis++){
  for(let thread=0;thread<threadCount;thread++){
   const start=vertex;
   for(let sample=0;sample<samples;sample++){
    const along=sample/(samples-1),across=thread/(threadCount-1);
    const u=axis===0?across:along,v=axis===0?along:across;
    const lift=Math.cos(Math.PI*(thread+sample/2))*spacing*.22*(axis===0?1:-1);
    for(const side of [-1,1]){
     positions.set([(u-.5)*4,(v-.5)*4,0],vertex*3);
     uvs.set([u,v],vertex*2);
     // Shared smooth seeds keep a thread continuous while retaining the same
     // high-frequency motion equation used by the original particle renderer.
     seeds.set([Math.sin(u*7.1+v*3.7),Math.sin(u*4.3-v*6.1),Math.cos(u*5.7+v*8.3)],vertex*3);
     threads.set([side,lift,axis],vertex*3);
     vertex++;
    }
    if(sample<samples-1){
     const a=start+sample*2;
     indices.set([a,a+1,a+2,a+1,a+3,a+2],index);
     index+=6;
    }
   }
  }
 }
 return {positions,uvs,seeds,threads,indices,halfWidth:spacing*.23};
}
