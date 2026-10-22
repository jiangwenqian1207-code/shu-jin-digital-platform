(() => {
  const $ = (s) => document.querySelector(s);
  const palettes = window.studioHistoricPatterns.map(p=>({...p,colors:null}));
  let selectedPalette = -1, noticeTimer;
  const history = new Set();
  function notify(message) {
    clearTimeout(noticeTimer);
    $('#studio-notice').textContent = message;
    $('#studio-notice').hidden = false;
    noticeTimer = setTimeout(() => { $('#studio-notice').hidden = true; }, 6000);
  }
  function swatch(colors) {
    const span = document.createElement('span');
    span.className = 'swatch';
    colors.forEach(color => { const i = document.createElement('i'); i.style.backgroundColor = color.hex; i.title=color.hex.toUpperCase()+' · '+Math.round(color.weight*100)+'%';span.append(i); });
    return span;
  }
  function renderPalettes(container, indices = palettes.map((_, i) => i)) {
    container.replaceChildren();
    indices.forEach(index => {
      const button = document.createElement('button');
      button.type = 'button';
      const palette=palettes[index];
      button.className='historic-palette';
      button.hidden=container.id==='palette-options' && index>=6 && !classicExpanded;
      button.setAttribute('aria-label', palette.name+' 配色');
      button.setAttribute('aria-pressed', String(index === selectedPalette));
      const image=document.createElement('img');image.src=palette.url;image.alt=palette.name;image.loading='lazy';button.append(image);
      if(palette.colors)button.append(swatch(palette.colors));
      const name=document.createElement('small');name.textContent=palette.name;button.append(name);
      button.disabled=!palette.colors;
      if(!palette.colors){const state=document.createElement('small');state.textContent=palette.error?'取色失败，请刷新重试':'正在提取五色…';button.append(state);}
      button.addEventListener('click', () => {
        selectedPalette = index;
        history.add(index);
        renderPalettes($('#palette-options'));
        if ($('#options-dialog').open && $('#options-title').textContent==='经典色彩体系') renderPalettes($('#options-content'));
        $('#palette-history').classList.add('palette-options');
        renderPalettes($('#palette-history'), [...history]);
        document.dispatchEvent(new CustomEvent('studio:classic-palette',{detail:{colors:palette.colors.map((c,i)=>({...c,name:palette.name+' · 取色 '+(i+1)}))}}));
      });
      container.append(button);
    });
  }
  let classicExpanded=false;
  renderPalettes($('#palette-options'));
  Promise.all(palettes.map(async palette=>{
    try{palette.colors=await window.extractStudioColors(palette.url);if(palette.colors.length!==5)throw new Error('不足五色');}
    catch{palette.colors=null;palette.error=true;}
  })).then(()=>{renderPalettes($('#palette-options'));if($('#options-dialog').open&&$('#options-title').textContent==='经典色彩体系')renderPalettes($('#options-content'));});
  function selectComposition(value) {
    document.querySelectorAll('[data-composition]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.composition === value)));
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-composition]');
    if (b) selectComposition(b.dataset.composition);
  });
  document.querySelectorAll('[data-palette-tab]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-palette-tab]').forEach(b => {
      b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', String(b === button));
    });
    ['palette-options','custom-colors','palette-history'].forEach((id, i) => {
      $('#' + id).hidden = ['classic','custom','history'][i] !== button.dataset.paletteTab;
    });
    $('#all-palettes').hidden = button.dataset.paletteTab !== 'classic';
  }));
  function setStep(step) {
    document.querySelectorAll('[data-step]').forEach(b => {
      b.classList.toggle('selected', b.dataset.step === step); b.setAttribute('aria-pressed', String(b.dataset.step === step));
    });
    ['create','edit','export'].forEach(id => { $('#' + id + '-panel').hidden = id !== step; });
  }
  document.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => setStep(b.dataset.step)));
  document.querySelectorAll('[data-back-create]').forEach(b => b.addEventListener('click', () => setStep('create')));
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    ['single','repeat','product'].forEach(id => { $('#' + id + '-view').hidden = id !== button.dataset.view; });
  }));
  document.querySelectorAll('[data-repeat]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-repeat]').forEach(b => {
      b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', String(b === button));
    });
    $('.repeat-sample').classList.toggle('two-way', button.dataset.repeat === 'two');
  }));
  $('#use-prompt').addEventListener('click', () => {
    setStep('create');
    $('#prompt').value = $('#example-text').textContent;
    $('#prompt').focus();
    notify('已填入示例提示词，你可以继续修改。');
  });
  $('#create-panel').addEventListener('submit', e => {
    e.preventDefault();
    if (!$('#prompt').value.trim()) { $('#prompt').focus(); notify('请先描述你想要的纹样，或点击右侧「提示词」使用示例。'); return; }
    notify('当前为界面预览，AI 生成服务尚未接入。你的创作描述已保留。');
  });
  const dialog = $('#options-dialog');
  $('#close-options').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog && (e.offsetX < 0 || e.offsetY < 0 || e.offsetX > dialog.clientWidth || e.offsetY > dialog.clientHeight)) dialog.close(); });
  $('#all-compositions').addEventListener('click', () => {
    $('#options-title').textContent = '构图方式';
    const content = $('#options-content');
    content.className = '';
    content.replaceChildren($('.composition-options').cloneNode(true));
    dialog.showModal();
  });
  $('#all-palettes').addEventListener('click', () => {
    classicExpanded=!classicExpanded;
    $('#all-palettes').textContent=classicExpanded?'收起':'查看全部';
    $('#all-palettes').setAttribute('aria-expanded',String(classicExpanded));
    renderPalettes($('#palette-options'));
  });
  $('.icon-button').addEventListener('click', () => { setStep('create'); $('#prompt').focus(); });
})();
