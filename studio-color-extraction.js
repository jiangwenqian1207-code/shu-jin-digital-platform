// Deterministic, local-only dominant-color extraction shared by presets and uploads.
window.extractStudioColors = async function(source) {
  const image=new Image();image.src=source;await image.decode();
  if(image.naturalWidth*image.naturalHeight>40000000)throw new Error('图片尺寸过大，请使用不超过 4000 万像素的参考图。');
  const canvas=document.createElement('canvas'),ratio=Math.min(1,160/Math.max(image.naturalWidth,image.naturalHeight));
  canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0,canvas.width,canvas.height);
  const data=ctx.getImageData(0,0,canvas.width,canvas.height).data,bins=new Map();
  for(let i=0;i<data.length;i+=4){if(data[i+3]<128)continue;const rgb=[data[i],data[i+1],data[i+2]],key=rgb.map(v=>v>>4).join(',');
    if(!bins.has(key))bins.set(key,{sum:[0,0,0],n:0});const bin=bins.get(key);bin.n++;rgb.forEach((v,j)=>bin.sum[j]+=v);}
  const points=[...bins.values()].map(b=>({rgb:b.sum.map(v=>v/b.n),n:b.n})).sort((a,b)=>b.n-a.n);
  if(!points.length)throw new Error('图片没有可提取的可见颜色。');
  const distance=(a,b)=>a.reduce((s,v,j)=>s+(v-b[j])**2,0);
  const centers=[points[0].rgb.slice()];
  while(centers.length<Math.min(5,points.length)){
    const best=points.reduce((a,p)=>{const score=Math.min(...centers.map(c=>distance(c,p.rgb)))*Math.sqrt(p.n);return score>a.score?{score,p}:a;},{score:-1});
    centers.push(best.p.rgb.slice());
  }
  let groups;
  for(let iteration=0;iteration<18;iteration++){
    groups=centers.map(()=>({sum:[0,0,0],n:0}));
    for(const p of points){let index=0;centers.forEach((c,i)=>{if(distance(c,p.rgb)<distance(centers[index],p.rgb))index=i;});const g=groups[index];g.n+=p.n;p.rgb.forEach((v,j)=>g.sum[j]+=v*p.n);}
    groups.forEach((g,i)=>{if(g.n)centers[i]=g.sum.map(v=>v/g.n);});
  }
  const total=points.reduce((s,p)=>s+p.n,0);
  return groups.map((g,i)=>({hex:'#'+centers[i].map(v=>Math.round(v).toString(16).padStart(2,'0')).join(''),weight:g.n/total})).filter(c=>c.weight>0).sort((a,b)=>b.weight-a.weight);
};
window.studioHistoricPatterns = [
  ['汉五星出东方利中国锦','han-jin-five-stars-brocade-pattern'],
  ['明代太子绵羊锦纹','ming-dynasty-prince-mianyang-brocade-pattern'],
  ['明代蜀香缎散花纹','ming-scattered-floral-shuxiang-satin-pattern'],
  ['北朝方格兽锦纹','northern-dynasties-grid-beast-brocade-pattern'],
  ['清代雨丝锦纹','qing-dynasty-rain-thread-brocade-pattern'],
  ['宋代灯笼锦纹','song-dynasty-lantern-brocade-pattern'],
  ['唐代联珠对鹊锦纹','tang-dynasty-pearl-roundel-paired-magpie-brocade-pattern'],
  ['战国舞人动物纹','warring-states-dancer-animal-pattern'],
  ['战国塔形几何纹','warring-states-tower-geometric-pattern']
].map(([name,file])=>({name,url:'./public/digital-pattern-library/'+file+'.jpg'}));
