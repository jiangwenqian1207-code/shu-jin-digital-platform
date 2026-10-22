(() => {
  const catalog = window.patternCatalog;
  const pattern = catalog.find(p => p.id === new URLSearchParams(location.search).get('id'));
  const root = document.querySelector('#detail');
  if (!pattern) { root.innerHTML='<a class="back-link" href="./digital-pattern-library.html">← 返回数字纹样库</a><h1>未找到此纹样</h1><p>请从纹样库中选择一个纹样查看。</p>'; return; }
  const p = pattern, historical = p.kind === 'historic';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = (key,fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const save = (key,value) => { try { localStorage.setItem(key,JSON.stringify(value)); } catch { notify('浏览器存储不可用，本次操作仅在当前页面保留。'); } };
  let timer;
  function notify(message) { const status=document.querySelector('#detail-status');status.textContent=message;clearTimeout(timer);timer=setTimeout(()=>status.textContent='',5000); }
  const heading = (title,label) => `<div class="section-heading"><h2>${title}</h2><span>${label}</span></div>`;
  const facts = entries => `<dl class="facts">${entries.map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;
  const price = p.price === '0' ? '免费' : p.price === '待定' ? '价格待定' : '￥'+p.price;
  const format = /\.png$/i.test(p.image) ? 'PNG' : 'JPG';
  document.title = p.name+'｜锦官织境';
  root.innerHTML = `<a class="back-link" href="./digital-pattern-library.html">← 返回数字纹样库</a>
    <div class="detail-hero"><div><div class="preview-stage" id="preview"><img src="${p.image}" alt="${esc(p.name)}"></div><div class="preview-tools"><button data-preview="single" aria-pressed="true">单元纹样</button><button data-preview="tile" aria-pressed="false">连续平铺</button><button id="zoom">放大查看 ↗</button></div><p class="note">以当前纹样图作为平铺单元，接缝仅供预览。${historical?'原锦实物参照图尚未提供。':''}</p></div>
    <div><p class="archive-label">SHU BROCADE / PATTERN ARCHIVE · ${p.id.padStart(3,'0')}</p><div class="tags"><span>${historical?'历史蜀锦纹样':'AI 生成纹样'}</span><span>${p.era}</span><span>${p.composition.join(' / ')}</span></div><h1>${esc(p.name)}</h1><p class="summary">${historical?'从纹样中阅读织造与装饰的秩序。以数字图像为起点，观察题材、构图与色彩之间的关系。':'以传统装饰语言为灵感，探索纹样在当代设计中的新表达。查看配色与平铺效果，为下一次创作寻找起点。'}</p>
    ${facts([[historical?'图像来源':'创作者','本地纹样素材 / '+(historical?'馆藏出处待核实':'作者待补充')],[historical?'历史时期':'创作时间',historical?p.era+'（沿用素材标注）':'待作者补充'],['浏览量',p.views+'（样例数据）'],['可用资源',format+' 位图'],['版权状态','权利人及商用范围待确认']])}<div class="price-line">${price}</div><div class="detail-actions"><button id="favorite" aria-pressed="false">♡ 收藏纹样</button><a class="resource-link solid" href="#resources">查看下载资源 ↓</a></div></div></div>
    <nav class="section-nav" aria-label="详情章节"><a href="#introduction">纹样介绍</a><a href="#analysis">纹样解析</a><a href="#rights">版权与使用授权</a><a href="#resources">下载资源</a><a href="#discussion">用户讨论</a></nav>
    <section id="introduction" class="archive-section">${heading('纹样介绍',historical?'CULTURAL ARCHIVE':'CREATION NOTES')}<div class="intro-grid"><div>${facts(historical?[['纹样名称',p.name],['所属朝代',p.era],['原始蜀锦来源','本地历史纹样图，原件对应关系待核实'],['馆藏 / 资料出处','待提供馆藏编号及文献'],['纹样题材',p.subject.join('、')],['构图形式',p.composition.join('、')]]:[['创作者昵称','待作者补充'],['创作时间','待补充'],['基础蜀锦纹样','尚未记录具体基础纹样'],['构图方式',p.composition.join('、')],['AI 生成方式 / 工具','本地 AI 素材，模型与提示词待补充'],['色彩方案','见下方图像取色分析']])}</div><div><h3>${historical?'纹样特点与观察':'设计理念与创作说明'}</h3><p>${historical?'本档案按现有素材标签归入'+p.era+'，题材包含'+p.subject.join('、')+'。可结合下方平铺和色彩提取结果，观察重复单元的节奏、主体与背景的关系。':'创作说明示例：以'+p.subject.join('、')+'为视觉线索，通过'+p.composition.join('、')+'组织重复节奏，尝试将装饰图像转化为可延展的设计表面。此段为展示文案，不代表作者实际创作过程。'}</p><h3>${historical?'历史文化背景与文化寓意':'纹样特点与应用建议'}</h3><p>${historical?'社会生活、审美、宗教与贸易等因素的具体影响，以及纹样寓意，需要结合原件年代、出土地和可靠文献核实。本原型保留这些档案字段，暂不编造史实或馆藏信息。':'可通过单元与连续平铺对比观察节奏及接缝，并结合实际制品尺寸调节纹样密度。生成工具、基础纹样与具体设计过程可由作者后续完善。'}</p><h3>使用场景</h3><p>设计研究、配色参考与数字展示；用于服装、丝巾、家居面料或文创包装前，需确认授权与生产工艺适配。</p></div></div></section>
    <section id="analysis" class="archive-section">${heading('纹样解析','COLOR ANALYSIS')}<div class="analysis-grid"><div><h3>色彩构成</h3><div id="colors" class="color-list" role="status">正在提取主要色彩…</div><p class="note">由当前图像自动提取 5 色；比例为像素估算，主辅角色按面积分配，并非原织物染料测量值。</p></div></div></section>
    <section id="rights" class="archive-section">${heading('版权与使用授权','RIGHTS & PERMISSIONS')}<div class="license-panel"><h3>使用前，请先确认授权范围</h3><p class="note">版权所有者：待权利人确认。历史题材不等同于该数字图像可自由使用；AI 标记也不代表可商用。以下为待确认的授权清单，不构成授权声明。</p><div class="license-grid">${['个人使用','二次创作','商业使用','署名要求','修改图案','面料生产','批量生产','额外商业授权','转售源文件'].map(x=>`<div class="license-item">${x}<span>○ ${x==='转售源文件'?'未获明确授权前请勿转售':'需权利人确认'}</span></div>`).join('')}</div><button class="solid" id="apply-license">申请商业授权 ↗</button></div></section>
    <section id="resources" class="archive-section">${heading('下载资源','RESOURCE FILES')}<p class="note">仅提供已存在的本地位图预览。源文件未上传；收费资源暂不支持购买。下载预览不代表获得使用授权。</p><div class="table-scroll"><table class="resources"><thead><tr><th>格式</th><th>文件大小</th><th>透明背景</th><th>矢量文件</th><th>操作</th></tr></thead><tbody>${['AI','PSD','SVG','PNG','JPG'].map(f=>`<tr><td>${f}</td><td ${f===format?'id="file-size"':''}>${f===format?'读取中…':'—'}</td><td>${f===format?(f==='JPG'?'不支持':'未检测'):'—'}</td><td>${f===format?'否':'未提供'}</td><td>${f===format?'<button id="download-preview">下载预览 · '+price+'</button>':'<button disabled>暂未提供</button>'}</td></tr>`).join('')}</tbody></table></div><p id="download-status" class="note" role="status"></p></section>
    <section id="discussion" class="archive-section">${heading('用户讨论','COMMUNITY')}<form class="comment-form" id="comment-form"><label for="comment-text" class="note">分享你的看法</label><textarea id="comment-text" required maxlength="1000" placeholder="分享你对这个纹样的看法、使用经验或创作想法……"></textarea><button class="solid" type="submit">发布评论（本地）</button></form><div id="comments"></div></section>
    <section class="archive-section">${heading('相关纹样','CONTINUE EXPLORING')}<div id="related" class="related-grid"></div></section>`;
  document.querySelector('.header-actions .icon-button')?.addEventListener('click',()=>location.href='./digital-pattern-library.html');
  const stage = document.querySelector('#preview');
  document.querySelectorAll('[data-preview]').forEach(button=>button.addEventListener('click',()=>{
    const tiled = button.dataset.preview==='tile';
    stage.classList.toggle('tiled',tiled);
    stage.style.backgroundImage = tiled ? `url("${p.image}")` : 'none';
    document.querySelectorAll('[data-preview]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  }));
  const zoom = document.querySelector('#zoom-dialog');
  zoom.querySelector('img').src=p.image;
  document.querySelector('#zoom').onclick=()=>zoom.showModal();
  document.querySelectorAll('dialog [data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
  const favorite = document.querySelector('#favorite'), favoriteKey='pattern-favorite-'+p.id;
  let liked=read(favoriteKey,false);
  const syncFavorite=()=>{favorite.setAttribute('aria-pressed',String(liked));favorite.textContent=liked?'♥ 已收藏':'♡ 收藏纹样';};
  syncFavorite();favorite.onclick=()=>{liked=!liked;save(favoriteKey,liked);syncFavorite();};
  const license=document.querySelector('#license-dialog');
  document.querySelector('#apply-license').onclick=()=>license.showModal();
  document.querySelector('#license-form').onsubmit=event=>{event.preventDefault();document.querySelector('#license-status').textContent='申请表已完成演示提交，未发送给作者。商用前仍需取得实际授权。';};
  window.extractStudioColors(p.image).then(colors=>{document.querySelector('#colors').innerHTML=colors.map((c,i)=>`<div><i style="background:${c.hex}"></i><p>${i===0?'主色':i<3?'辅助色':'点缀色'}<br>${c.hex.toUpperCase()}<br>${Math.round(c.weight*100)}%</p></div>`).join('');}).catch(()=>{document.querySelector('#colors').textContent='暂时无法提取色彩，请刷新重试。';});
  fetch(p.image).then(r=>{if(!r.ok)throw Error();return r.blob();}).then(blob=>{document.querySelector('#file-size').textContent=(blob.size/1024/1024).toFixed(2)+' MB';}).catch(()=>{document.querySelector('#file-size').textContent='读取失败';});
  document.querySelector('#download-preview').onclick=()=>{
    if(p.price!=='0') {document.querySelector('#download-status').textContent='演示状态：'+price+'。支付与授权尚未接入，暂不提供收费资源下载。';return;}
    const a=document.createElement('a');a.href=p.image;a.download=p.name+'.'+format.toLowerCase();a.click();
    document.querySelector('#download-status').textContent='已请求下载本地预览图。使用权仍需另行确认。';
  };
  const commentKey='pattern-comments-v1-'+p.id;
  let comments=read(commentKey,null);
  if(!Array.isArray(comments)) comments=[{name:'织物观察者（示例）',date:'示例讨论',text:historical?'希望后续能补充原锦的馆藏出处和局部细节，便于对比图像与真实织物。':'想看看这组配色在丝巾上的效果，缩小纹样密度后可能会有不同的节奏。',likes:2,liked:false,replies:[]},{name:'经纬之间（示例）',date:'示例讨论',text:'建议生产前先做小样，检查连续拼接的接缝与色差。',likes:1,liked:false,replies:[]}];
  const commentList=document.querySelector('#comments');
  function renderComments(){commentList.innerHTML=comments.map((c,i)=>`<article class="comment" data-comment="${i}"><div class="comment-head"><span class="avatar" aria-hidden="true">${esc(c.name.slice(0,1))}</span><strong>${esc(c.name)}</strong><time>${esc(c.date)}</time></div><p>${esc(c.text)}</p><button data-action="like" aria-pressed="${!!c.liked}">赞 ${Number(c.likes)||0}</button><button data-action="reply">回复</button><button data-action="report">举报</button>${(c.replies||[]).map(r=>`<div class="reply">我 · ${esc(r)}</div>`).join('')}<form class="reply-form" hidden><input required maxlength="500" aria-label="回复内容" placeholder="写下回复…"><button type="submit">回复（本地）</button></form></article>`).join('');}
  const persist=()=>{save(commentKey,comments);renderComments();};
  renderComments();
  document.querySelector('#comment-form').onsubmit=e=>{e.preventDefault();const input=document.querySelector('#comment-text'),text=input.value.trim();if(!text){input.focus();return;}comments.unshift({name:'我',date:new Date().toLocaleString('zh-CN'),text,likes:0,liked:false,replies:[]});input.value='';persist();notify('评论已保存在当前浏览器。');};
  commentList.onclick=e=>{const b=e.target.closest('[data-action]');if(!b)return;const card=b.closest('[data-comment]'),c=comments[Number(card.dataset.comment)];if(b.dataset.action==='like'){c.liked=!c.liked;c.likes+=c.liked?1:-1;persist();}if(b.dataset.action==='reply'){const f=card.querySelector('form');f.hidden=!f.hidden;if(!f.hidden)f.querySelector('input').focus();}if(b.dataset.action==='report')notify('演示举报：尚未接入审核服务，未发送举报。');};
  commentList.onsubmit=e=>{e.preventDefault();const c=comments[Number(e.target.closest('[data-comment]').dataset.comment)],text=e.target.querySelector('input').value.trim();if(!text)return;c.replies.push(text);persist();notify('回复已保存在当前浏览器。');};
  const score=q=>(q.era===p.era?2:0)+(q.color===p.color?1:0)+q.subject.filter(x=>p.subject.includes(x)).length+q.composition.filter(x=>p.composition.includes(x)).length;
  document.querySelector('#related').innerHTML=catalog.filter(q=>q.id!==p.id).sort((a,b)=>score(b)-score(a)).slice(0,4).map(q=>`<a class="related-card" href="./pattern-detail.html?id=${q.id}"><img loading="lazy" src="${q.image}" alt="${esc(q.name)}"><h3>${esc(q.name)}</h3><small>${q.era} · ${q.composition.join(' / ')}</small></a>`).join('');
})();
