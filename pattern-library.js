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
  const categoryButton = document.querySelector('.library-category');
  const categoryMenu = document.querySelector('.library-category-menu');
  let price = 'all';
  const draw = () => {
    const keyword = search.value.trim();
    grid.innerHTML = patterns.filter((item) => (price === 'all' || (price === 'free') === (item[2] === '免费')) && item[0].includes(keyword)).map((item) => `<article class="pattern-card"><div class="pattern-meta"><span class="pattern-tag ${item[2] === 'AI' ? 'ai' : ''}">${item[2]}</span><span class="pattern-views">${item[3]}<button class="pattern-favorite" type="button" aria-label="收藏 ${item[0]}" aria-pressed="false"><img src="./public/icons/icon-favorite-default.svg" alt="" /></button></span></div><img class="pattern-image" src="${item[1]}" alt="${item[0]}" /><div class="pattern-info"><strong>${item[0]}</strong><span class="pattern-price">￥${item[4]}</span></div><div class="pattern-download-wrap"><button class="pattern-download" type="button" aria-expanded="false">下载</button><div class="pattern-download-menu" hidden role="menu" aria-label="${item[0]} 下载格式"><button type="button" role="menuitem" data-download-format="SVG">下载SVG</button><button type="button" role="menuitem" data-download-format="PNG">下载PNG</button><button type="button" role="menuitem" data-download-format="source">下载源文件</button></div></div></article>`).join('') || '<p class="pattern-empty">没有找到匹配的纹样。</p>';
  };
  draw();
  form.addEventListener('submit', (event) => { event.preventDefault(); draw(); });
  search.addEventListener('input', draw);
  const selectPrice = (nextPrice) => {
    price = nextPrice;
    priceButtons.forEach((item) => item.classList.toggle('active', item.dataset.price === nextPrice));
    categoryMenu?.querySelectorAll('[data-category-price]').forEach((item) => item.classList.toggle('active', item.dataset.categoryPrice === nextPrice));
    if (categoryButton) {
      const labels = { all: '所有纹样', paid: '付费纹样', free: '免费纹样' };
      categoryButton.childNodes[0].nodeValue = `${labels[nextPrice]} `;
    }
    draw();
  };
  priceButtons.forEach((button) => button.addEventListener('click', () => selectPrice(button.dataset.price)));
  const closeCategoryMenu = () => {
    if (!categoryMenu || !categoryButton) return;
    categoryMenu.hidden = true;
    categoryButton.setAttribute('aria-expanded', 'false');
  };
  categoryButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = categoryButton.getAttribute('aria-expanded') === 'true';
    categoryMenu.hidden = isOpen;
    categoryButton.setAttribute('aria-expanded', String(!isOpen));
  });
  categoryMenu?.querySelectorAll('[data-category-price]').forEach((item) => item.addEventListener('click', () => {
    selectPrice(item.dataset.categoryPrice);
    closeCategoryMenu();
  }));
  document.addEventListener('click', (event) => { if (!event.target.closest('.library-category-wrap')) closeCategoryMenu(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeCategoryMenu(); });
  const closeDownloadMenus = () => {
    grid.querySelectorAll('.pattern-download-menu').forEach((menu) => { menu.hidden = true; });
    grid.querySelectorAll('.pattern-download').forEach((button) => { button.setAttribute('aria-expanded', 'false'); });
    grid.querySelectorAll('.pattern-card.is-download-open').forEach((card) => card.classList.remove('is-download-open'));
  };
  grid.addEventListener('click', (event) => {
    const download = event.target.closest('.pattern-download');
    if (download) {
      const card = download.closest('.pattern-card');
      const menu = card?.querySelector('.pattern-download-menu');
      const isOpen = download.getAttribute('aria-expanded') === 'true';
      closeDownloadMenus();
      if (!isOpen && menu) {
        menu.hidden = false;
        download.setAttribute('aria-expanded', 'true');
        card.classList.add('is-download-open');
      }
      return;
    }
    const downloadOption = event.target.closest('[data-download-format]');
    if (downloadOption) {
      closeDownloadMenus();
      return;
    }
    const favorite = event.target.closest('.pattern-favorite');
    if (!favorite) return;
    const active = !favorite.classList.contains('active');
    favorite.classList.toggle('active', active);
    favorite.setAttribute('aria-pressed', String(active));
    favorite.querySelector('img').src = active
      ? './public/icons/icon-favorite-active.svg'
      : './public/icons/icon-favorite-default.svg';
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.pattern-download-wrap')) closeDownloadMenus();
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeDownloadMenus(); });
  const headerSearchButton = document.querySelector('.library-search-button, .library-header .icon-button');
  headerSearchButton?.addEventListener('click', () => search.focus());
})();
