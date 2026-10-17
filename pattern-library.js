(() => {
  const filterOptions = {
    subject: ['几何纹', '植物纹', '动物纹', '人物纹', '器物纹', '组合纹'],
    composition: ['矩形式', '方格式', '散点式', '菱形式', '三角式', '灯笼锦式', '八达晕式', '陵阳公样式', '落花流水式'],
    era: ['春秋战国', '秦汉', '魏晋南北朝', '隋唐', '宋元', '明清', '现代'],
    color: ['红', '黄', '蓝', '绿', '紫', '黑']
  };
  const filterControls = [];
  const selectedFilters = { subject: '', composition: '', era: '', color: '' };
  const closeFilters = () => filterControls.forEach(({ trigger, menu }) => {
    trigger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  });
  document.querySelectorAll('.library-filters [data-filter]').forEach(trigger => {
    const key = trigger.dataset.filter;
    const label = trigger.querySelector('span');
    const defaultLabel = label.textContent;
    const wrapper = document.createElement('div');
    wrapper.className = 'library-filter';
    trigger.before(wrapper);
    wrapper.append(trigger);
    trigger.classList.add('filter-trigger');
    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'filter-menu-' + key);
    const caret = document.createElement('img');
    caret.src = './public/icons/icon-filter-caret.svg';
    caret.alt = '';
    trigger.querySelector('b').replaceWith(caret);
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'filter-clear';
    clear.hidden = true;
    clear.setAttribute('aria-label', '清除' + defaultLabel);
    const clearIcon = document.createElement('img');
    clearIcon.src = './public/icons/icon-filter-clear.svg';
    clearIcon.alt = '';
    clear.append(clearIcon);
    const menu = document.createElement('div');
    menu.id = 'filter-menu-' + key;
    menu.className = 'library-filter-menu';
    menu.hidden = true;
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', defaultLabel);
    filterOptions[key].forEach(value => {
      const option = document.createElement('button');
      option.type = 'button';
      option.textContent = value;
      option.setAttribute('role', 'menuitemradio');
      option.setAttribute('aria-checked', 'false');
      option.addEventListener('click', () => {
        selectedFilters[key] = value;
        draw();
        label.textContent = value;
        wrapper.classList.add('has-selection');
        clear.hidden = false;
        menu.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b === option)));
        closeFilters();
        trigger.focus();
      });
      menu.append(option);
    });
    wrapper.append(clear, menu);
    filterControls.push({ trigger, menu });
    trigger.addEventListener('click', () => {
      const wasOpen = !menu.hidden;
      closeFilters();
      if (!wasOpen) {
        menu.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
    clear.addEventListener('click', () => {
      selectedFilters[key] = '';
      draw();
      label.textContent = defaultLabel;
      wrapper.classList.remove('has-selection');
      clear.hidden = true;
      menu.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', 'false'));
      closeFilters();
      trigger.focus();
    });
    wrapper.addEventListener('keydown', event => {
      const options = [...menu.querySelectorAll('button')];
      const index = options.indexOf(document.activeElement);
      if (event.key === 'Escape') { closeFilters(); trigger.focus(); }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        closeFilters();
        menu.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        options[(index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length].focus();
      }
    });
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.library-filter')) closeFilters();
  });
  document.addEventListener('focusin', event => {
    if (!event.target.closest('.library-filter')) closeFilters();
  });
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
  const matchesFilters = item => {
    const metadata = patternMetadata[item[0]];
    return Object.entries(selectedFilters).every(([key, value]) =>
      !value || (Array.isArray(metadata[key]) ? metadata[key].includes(value) : metadata[key] === value));
  };
  const search = document.querySelector('#pattern-search');
  const form = document.querySelector('.library-search');
  const priceButtons = [...document.querySelectorAll('[data-price]')];
  const categoryButton = document.querySelector('.library-category');
  const categoryMenu = document.querySelector('.library-category-menu');
  let price = 'all';
  const draw = () => {
    const keyword = search.value.trim();
    grid.innerHTML = patterns.filter(matchesFilters).filter((item) => (price === 'all' || (price === 'free') === (item[2] === '免费')) && item[0].includes(keyword)).map((item) => `<article class="pattern-card"><div class="pattern-meta"><span class="pattern-tag ${item[2] === 'AI' ? 'ai' : ''}">${item[2]}</span><span class="pattern-views">${item[3]}<button class="pattern-favorite" type="button" aria-label="收藏 ${item[0]}" aria-pressed="false"><img src="./public/icons/icon-favorite-default.svg" alt="" /></button></span></div><img class="pattern-image" src="${item[1]}" alt="${item[0]}" /><div class="pattern-info"><strong>${item[0]}</strong><span class="pattern-price">￥${item[4]}</span></div><div class="pattern-download-wrap"><button class="pattern-download" type="button" aria-expanded="false">下载</button><div class="pattern-download-menu" hidden role="menu" aria-label="${item[0]} 下载格式"><button type="button" role="menuitem" data-download-format="SVG">下载SVG</button><button type="button" role="menuitem" data-download-format="PNG">下载PNG</button><button type="button" role="menuitem" data-download-format="source">下载源文件</button></div></div></article>`).join('') || '<p class="pattern-empty">没有找到匹配的纹样。</p>';
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
