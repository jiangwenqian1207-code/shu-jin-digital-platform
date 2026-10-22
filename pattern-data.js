(()=>{
  const patterns = [
    ['战国 塔形纹锦','./public/digital-pattern-library/warring-states-tower-geometric-pattern.jpg','免费','[1.2K]','0'],
    ['战国 龙凤舞人纹锦','./public/digital-pattern-library/warring-states-dancer-animal-pattern.jpg','免费','[0.9K]','0'],
    ['汉 五星出东方利中国','./public/digital-pattern-library/han-jin-five-stars-brocade-pattern.jpg','免费','[5.9K]','0'],
    ['明 太子绵羊锦纹','./public/digital-pattern-library/ming-dynasty-prince-mianyang-brocade-pattern.jpg','免费','[5.2K]','0'],
    ['清 雨丝锦纹','./public/digital-pattern-library/qing-dynasty-rain-thread-brocade-pattern.jpg','免费','[2.4K]','0'],
    ['蜂巢花格纹','./public/ai-pattern-generation/ai-bee-floral-lattice-pattern.png','AI','[3.8K]','1.2'],
    ['明 散花蜀香缎纹','./public/digital-pattern-library/ming-scattered-floral-shuxiang-satin-pattern.jpg','免费','[4.4K]','0'],
    ['宋 灯笼锦纹','./public/digital-pattern-library/song-dynasty-lantern-brocade-pattern.jpg','免费','[2.1K]','0'],
    ['雏菊卷草藤纹','./public/ai-pattern-generation/ai-daisy-scroll-vine-pattern.png','AI','[2.8K]','0.8'],
    ['蓝地折枝花纹','./public/ai-pattern-generation/ai-blue-ground-floral-branch-pattern.png','AI','[1.6K]','1.5'],
    ['几何点阵纹','./public/ai-pattern-generation/ai-geometric-dot-lattice-pattern.png','AI','[4.6K]','0.6'],
    ['藤花垂饰纹','./public/ai-pattern-generation/ai-wisteria-pendant-pattern.png','AI','[4.2K]','0.7'],
    ['宫灯流苏纹','./public/ai-pattern-generation/ai-palace-lantern-tassel-pattern (1).png','AI','[3.0K]','0.5'],
    ['唐 联珠对鹊锦纹','./public/digital-pattern-library/tang-dynasty-pearl-roundel-paired-magpie-brocade-pattern.jpg','免费','[1.7K]','0'],
    ['北朝 方格兽锦纹','./public/digital-pattern-library/northern-dynasties-grid-beast-brocade-pattern.jpg','免费','[1.9K]','0']
  ];
  // New local artwork: prices and view counts are not yet assigned.
  const additions = [
    ['宫灯流苏纹·二','ai-palace-lantern-tassel-pattern (2).png','器物纹','灯笼锦式','绿'],
    ['熊猫卷草纹','ai-Panda & Scroll Motif.png','动物纹','散点式','蓝'],
    ['藤花垂饰纹·二','ai-wisteria-pendant-pattern-02.png','植物纹','散点式','紫'],
    ['藤花垂饰纹·三','ai-wisteria-pendant-pattern-03.png','植物纹','散点式','紫'],
    ['莫兰迪几何花卉·一','geometric-floral-morandi-01.png','植物纹','方格式','绿'],
    ['莫兰迪几何花卉·二','geometric-floral-morandi-02.png','植物纹','方格式','蓝'],
    ['柔彩几何花卉·一','geometric-floral-pastel-01.png','植物纹','方格式','红'],
    ['柔彩几何花卉·二','geometric-floral-pastel-02.png','植物纹','方格式','紫'],
    ['花鸟马赛克·一','mosaic-floral-bird-01.png','动物纹','方格式','蓝'],
    ['花鸟马赛克·二','mosaic-floral-bird-02.png','动物纹','方格式','绿']
  ];
  additions.forEach(([name,file]) => patterns.push([name,'./public/ai-pattern-generation/'+encodeURIComponent(file),'AI','新上架','待定']));

  // Curated against the local artwork images. Subjects are inclusive;
  // color describes the dominant palette, not every small accent.
  const patternMetadata = {
    '战国 塔形纹锦': { subject: ['几何纹'], composition: ['矩形式'], era: '春秋战国', color: '黑' },
    '战国 龙凤舞人纹锦': { subject: ['动物纹', '人物纹', '几何纹', '组合纹'], composition: ['菱形式'], era: '春秋战国', color: '红' },
    '汉 五星出东方利中国': { subject: ['动物纹', '组合纹'], composition: ['散点式'], era: '秦汉', color: '蓝' },
    '明 太子绵羊锦纹': { subject: ['人物纹', '动物纹', '植物纹', '器物纹', '组合纹'], composition: ['散点式'], era: '明清', color: '黑' },
    '清 雨丝锦纹': { subject: ['几何纹'], composition: ['矩形式'], era: '明清', color: '红' },
    '蜂巢花格纹': { subject: ['植物纹', '动物纹', '几何纹', '组合纹'], composition: ['菱形式'], era: '现代', color: '绿' },
    '明 散花蜀香缎纹': { subject: ['植物纹'], composition: ['散点式'], era: '明清', color: '黑' },
    '宋 灯笼锦纹': { subject: ['器物纹', '植物纹', '动物纹', '几何纹', '组合纹'], composition: ['灯笼锦式'], era: '宋元', color: '红' },
    '雏菊卷草藤纹': { subject: ['植物纹'], composition: ['散点式'], era: '现代', color: '绿' },
    '蓝地折枝花纹': { subject: ['植物纹'], composition: ['散点式'], era: '现代', color: '蓝' },
    '几何点阵纹': { subject: ['几何纹'], composition: ['菱形式'], era: '现代', color: '蓝' },
    '藤花垂饰纹': { subject: ['植物纹'], composition: ['散点式'], era: '现代', color: '蓝' },
    '宫灯流苏纹': { subject: ['器物纹', '植物纹', '组合纹'], composition: ['灯笼锦式'], era: '现代', color: '绿' },
    '唐 联珠对鹊锦纹': { subject: ['动物纹', '植物纹', '几何纹', '组合纹'], composition: ['陵阳公样式'], era: '隋唐', color: '黄' },
    '北朝 方格兽锦纹': { subject: ['动物纹', '几何纹', '组合纹'], composition: ['方格式'], era: '魏晋南北朝', color: '黄' }
  };
  additions.forEach(([name,,subject,composition,color]) => {
    patternMetadata[name] = {subject:[subject,'组合纹'],composition:[composition],era:'现代',color};
  });

  window.patternCatalog = patterns.map((p,i)=>({id: String(i+1),name:p[0],image:p[1],kind:p[2]==='免费'?'historic':'ai',views:p[3],price:p[4],...patternMetadata[p[0]]}));
})();
