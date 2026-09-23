// Descriptions discuss the supplied artwork, rather than asserting undocumented provenance.
export const patterns = [
  {
    file: 'han-jin-five-stars-brocade-pattern.jpg',
    name: '汉晋 · 五星出东方锦纹', english: 'Five Stars Brocade · Han–Jin',
    description: '深蓝底色之上，瑞兽、飞鸟、云气与文字彼此穿插，朱红、米白和草绿沿着连续的纹路展开。图案以反复排列形成绵延的节奏，让文字与形象共同成为织物的叙事。在这里，原本完整的色面被拆解为横纵丝线；手指捏合，细线逐次交会，文字与瑞兽重新显现，松开后又退回尚未织成的状态。'
  },
  {
    file: 'ming-dynasty-prince-mianyang-brocade-pattern.jpg',
    name: '明 · 王子绵羊锦纹', english: 'Prince & Sheep Brocade · Ming',
    description: '深褐色的底面承托着骑羊人物，花枝、鸟笼与折枝花卉散布其间。朱红衣袍、青绿饰带和米白绵羊在重复的构图中相互呼应，形成轻盈而富于故事感的纹样。经纬伸展时，人物轮廓与花枝被一段段接续起来，仿佛叙事正在织机上慢慢成形；手指松开，图像沿横纵方向退散，留下色彩交错的细线。'
  },
  {
    file: 'song-dynasty-lantern-brocade-pattern.jpg',
    name: '宋 · 灯笼锦纹', english: 'Lantern Brocade · Song',
    description: '灯笼形象被安置在圆形与方形的装饰框内，菱格、小花和卷曲的线条填满其间。鲜明的红、黄绿与紫色彼此映衬，构成层层展开的秩序，也让节庆般的明快气息停留在纹样之中。随着手势收拢，纵线与横线依次交织，边框、流苏和花朵渐渐连成完整画面；放开手指，整齐的结构便再次显露其经纬骨架。'
  },
  {
    file: 'ming-scattered-floral-shuxiang-satin-pattern.jpg',
    name: '明 · 散花蜀香缎纹', english: 'Scattered Floral Satin · Ming',
    description: '浅金与乳白色的花朵散落在近黑的底色上，团花、细瓣与环状装饰错落相间。疏密有致的留白让每一簇花形都保持独立，又在连续排列中产生柔和的呼应。作品将这些花形转译为细密的经纬：捏合手指，花瓣从交错的丝线中缓缓浮现；松开时，色面向线端收回，繁盛的花丛变成有节律的织造痕迹。'
  },
  {
    file: 'northern-dynasties-grid-beast-brocade-pattern.jpg',
    name: '北朝 · 方格兽锦纹', english: 'Gridded Animal Brocade · Northern Dynasties',
    description: '层叠的横竖边带将画面分成方格，格中各自安置姿态鲜明的动物形象。浅黄、草绿、靛蓝与粉白交替铺陈，让规整的框架与活泼的轮廓形成对照。方格自身的纵横秩序，在这件数字作品里进一步转化为真实可见的经纬运动：丝线相遇，动物与边带随之完整；丝线退去，稳定的图案也重新打开呼吸的空隙。'
  }
];

export class Typewriter {
  constructor(write, schedule = (fn,ms) => setTimeout(fn,ms), cancel = id => clearTimeout(id)) {
    this.write = write; this.schedule = schedule; this.cancel = cancel; this.timer = null; this.generation = 0;
  }
  stop() { this.generation++; this.cancel(this.timer); this.timer = null; }
  start(text) {
    this.stop(); this.write('');
    const generation = this.generation;
    const chars = Array.from(text); let index = 0;
    const tick = () => {
      if (generation !== this.generation) return;
      this.write(chars.slice(0, ++index).join(''));
      if (index < chars.length) this.timer = this.schedule(tick, /[，；。]/.test(chars[index - 1]) ? 230 : 48);
      else this.timer = null;
    };
    this.timer = this.schedule(tick, 360);
  }
}
