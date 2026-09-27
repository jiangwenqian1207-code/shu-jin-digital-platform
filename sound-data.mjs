export const description='作品以蜀锦纹样为视觉母体，将传统纹饰转化为由粒子构成的动态数字结构，并通过声音实时驱动其运动。音乐的频率、节奏与强弱被映射为粒子的呼吸、起伏、扩散与重组，使静态纹样在声音中不断被唤醒、解构与重塑，在听觉与视觉的共振之间探索蜀锦纹样新的数字感知方式。';
export const patterns=[
 {name:'汉晋 · 五星出东方锦纹',url:'./public/digital-pattern-library/han-jin-five-stars-brocade-pattern.jpg',note:'瑞兽、云气与文字交织，声音沿着纹样的轮廓缓缓流动。'},
 {name:'AI · 紫藤垂饰纹样',url:'./public/ai-pattern-generation/ai-wisteria-pendant-pattern.png',note:'紫藤与垂饰构成连续花形，细密粒子随旋律轻轻舒展。'},
 {name:'AI · 熊猫卷草纹样',url:'./public/ai-pattern-generation/ai-Panda & Scroll Motif.png',note:'熊猫与金色卷草环绕相生，层层曲线在声音中产生共振。'},
 {name:'明 · 散花蜀香缎纹',url:'./public/digital-pattern-library/ming-scattered-floral-shuxiang-satin-pattern.jpg',note:'浅金花朵散落于深色底面，花形在强弱变化中起伏与回归。'},
 {name:'北朝 · 方格兽锦纹',url:'./public/digital-pattern-library/northern-dynasties-grid-beast-brocade-pattern.jpg',note:'方格与动物保持清晰秩序，声波为平面织构带来空间层次。'}
];
export function measureBands(frequency,wave,sampleRate){
 const step=sampleRate/(frequency.length*2);
 const band=(lo,hi)=>{let sum=0,n=0;for(let i=Math.max(1,Math.ceil(lo/step));i<Math.min(frequency.length,Math.ceil(hi/step));i++){sum+=(frequency[i]/255)**2;n++;}return Math.sqrt(sum/Math.max(1,n));};
 let rms=0;for(const v of wave)rms+=v*v;
 return [band(35,250),band(250,2500),band(2500,12000),Math.min(1,Math.sqrt(rms/wave.length)*3)];
}
export function smoothBands(current,target,dt){for(let i=0;i<4;i++)current[i]+=(target[i]-current[i])*(1-Math.exp(-Math.min(.1,dt)*(target[i]>current[i]?8:3)));return current;}
export function transitionAt(elapsed){const p=Math.min(1,Math.max(0,elapsed/1.2));return {mix:p,loose:Math.sin(Math.PI*p)**2,done:p===1};}
export const timecode=s=>{s=Math.floor(Math.max(0,s||0));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;};
