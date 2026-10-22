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
  const patterns = window.patternCatalog.map(p=>[p.name,p.image,p.kind==='historic'?'免费':'AI',p.views,p.price]);
  const patternMetadata = Object.fromEntries(window.patternCatalog.map(p=>[p.name,p]));
  const grid = document.querySelector('#pattern-grid');
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
  const pageSize = 15;
  let currentPage = 1;
  let visibleEnd = pageSize;
  let filteredPatterns = [];
  const pagination = document.querySelector('.library-pagination');
  const more = document.querySelector('#pattern-show-more');
  const updateNavigation = () => {
    const pages = Math.ceil(filteredPatterns.length / pageSize);
    pagination.innerHTML = Array.from({length:pages}, (_,i) => `<button type="button" data-page="${i+1}" class="${currentPage===i+1?'active':''}" ${currentPage===i+1?'aria-current="page"':''}>${i+1}</button>`).join('') + (pages ? `<button type="button" data-page="${currentPage+1}" aria-label="下一页" ${currentPage>=pages?'disabled':''}><img src="./public/icons/Polygon 10.svg" alt=""></button>` : '');
    more.hidden = visibleEnd >= filteredPatterns.length;
  };
  const draw = (options = {}) => {
    if (!options.preservePage) { currentPage = 1; visibleEnd = pageSize; }
    const keyword = search.value.trim();
    filteredPatterns = patterns.filter(matchesFilters).filter((item) => (price === 'all' || (price === 'free' ? item[2] === '免费' : item[4] !== '待定' && item[2] !== '免费')) && item[0].includes(keyword));
    grid.innerHTML = filteredPatterns.slice((currentPage - 1) * pageSize, visibleEnd).map((item) => `<article class="pattern-card"><div class="pattern-meta"><span class="pattern-tag ${item[2] === 'AI' ? 'ai' : ''}">${item[2]}</span><span class="pattern-views">${item[3]}<button class="pattern-favorite" type="button" aria-label="收藏 ${item[0]}" aria-pressed="false"><img src="./public/icons/icon-favorite-default.svg" alt="" /></button></span></div><img class="pattern-image" src="${item[1]}" alt="${item[0]}" /><div class="pattern-info"><strong>${item[0]}</strong><span class="pattern-price">${item[4] === '待定' ? '待定' : '￥' + item[4]}</span></div><div class="pattern-download-wrap"><button class="pattern-download" type="button" aria-expanded="false">下载</button><div class="pattern-download-menu" hidden role="menu" aria-label="${item[0]} 下载格式"><button type="button" role="menuitem" data-download-format="SVG">下载SVG</button><button type="button" role="menuitem" data-download-format="PNG">下载PNG</button><button type="button" role="menuitem" data-download-format="source">下载源文件</button></div></div></article>`).join('') || '<p class="pattern-empty">没有找到匹配的纹样。</p>';
    updateNavigation();
    grid.querySelectorAll('.pattern-card').forEach((card,i) => {
      const item = filteredPatterns[(currentPage-1)*pageSize+i];
      const record = patternMetadata[item[0]];
      const link = document.createElement('a');
      link.className = 'pattern-detail-link';
      link.href = './pattern-detail.html?id='+record.id;
      link.setAttribute('aria-label','查看'+record.name+'详情');
      card.append(link);
    });
  };
  draw();
  more.addEventListener('click', () => {
    const previousCards = [...grid.children];
    const previousCount = previousCards.length;
    visibleEnd += pageSize;
    draw({preservePage:true});
    // Retain existing cards and their interaction state when appending.
    [...grid.children].slice(0,previousCount).forEach((card,i) => card.replaceWith(previousCards[i]));
  });
  pagination.addEventListener('click', event => {
    const button = event.target.closest('[data-page]');
    if (!button || button.disabled) return;
    currentPage = Number(button.dataset.page);
    visibleEnd = currentPage * pageSize;
    draw({preservePage:true});
    grid.scrollIntoView({behavior:'smooth',block:'start'});
  });
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
