(() => {
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
  const grid = document.querySelector('#pattern-grid');
  const search = document.querySelector('#pattern-search');
  const form = document.querySelector('.library-search');
  const priceButtons = [...document.querySelectorAll('[data-price]')];
  let price = 'all';
  const draw = () => {
    const keyword = search.value.trim();
    grid.innerHTML = patterns.filter((item) => (price === 'all' || (price === 'free') === (item[2] === '免费')) && item[0].includes(keyword)).map((item) => `<article class="pattern-card"><div class="pattern-meta"><span class="pattern-tag ${item[2] === 'AI' ? 'ai' : ''}">${item[2]}</span><span class="pattern-views">${item[3]}<button class="pattern-favorite" type="button" aria-label="收藏 ${item[0]}" aria-pressed="false"><img src="./public/icons/icon-favorite-default.svg" alt="" /></button></span></div><img class="pattern-image" src="${item[1]}" alt="${item[0]}" /><div class="pattern-info"><strong>${item[0]}</strong><span class="pattern-price">￥${item[4]}</span></div><button class="pattern-download" type="button">下载</button></article>`).join('') || '<p class="pattern-empty">没有找到匹配的纹样。</p>';
  };
  draw();
  form.addEventListener('submit', (event) => { event.preventDefault(); draw(); });
  search.addEventListener('input', draw);
  priceButtons.forEach((button) => button.addEventListener('click', () => { price = button.dataset.price; priceButtons.forEach((item) => item.classList.toggle('active', item === button)); draw(); }));
  grid.addEventListener('click', (event) => {
    const favorite = event.target.closest('.pattern-favorite');
    if (!favorite) return;
    const active = !favorite.classList.contains('active');
    favorite.classList.toggle('active', active);
    favorite.setAttribute('aria-pressed', String(active));
    favorite.querySelector('img').src = active
      ? './public/icons/icon-favorite-active.svg'
      : './public/icons/icon-favorite-default.svg';
  });
  const headerSearchButton = document.querySelector('.library-search-button, .library-header .icon-button');
  headerSearchButton?.addEventListener('click', () => search.focus());
})();
