/* Local-only publication prototype. No server authentication, payment or public upload. */
(() => {
  const loggedIn=()=>sessionStorage.getItem('shu-jin-demo-logged-in')==='true';
  const dbPromise=new Promise((resolve,reject)=>{
    const req=indexedDB.open('shu-jin-publications',1);
    req.onupgradeneeded=()=>req.result.createObjectStore('works',{keyPath:'id'});
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
  });
  // Defer storage errors until an action can display them.
  dbPromise.catch(()=>{});
  async function records(work){
    const db=await dbPromise;
    return new Promise((resolve,reject)=>{
      const tx=db.transaction('works',work?'readwrite':'readonly'),store=tx.objectStore('works');
      const req=work?store.put(work):store.getAll();
      tx.oncomplete=()=>resolve(req.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
    });
  }
  const personalLabels={view:'仅供欣赏，不授权使用',free:'个人非商用免费使用',paid:'个人使用需付费授权'};
  const commercialLabels={no:'禁止商业使用',contact:'商用须联系作者协商',free:'允许免费商业使用（遵守附加条件）'};
  let pending=null, snapshot=null, objectURL='', focusReturn=null, busy=false;
  const dialog=document.createElement('dialog');dialog.className='publication-dialog';dialog.setAttribute('aria-labelledby','publication-title');
  dialog.innerHTML=`<header><div><small>CREATOR / LICENSE</small><h2 id="publication-title">上传到素材纹样库</h2></div><button type="button" data-pub-close aria-label="关闭上传窗口">×</button></header>
    <p class="publication-note">前端演示：登录为演示账号 CoNo。作品与授权仅保存在当前浏览器，尚未公开发布，不会收款或签发真实授权。</p>
    <form id="publication-form"><div class="publication-overview"><img id="publication-image" alt="本次上传的纹样快照"><div><b id="publication-mode"></b><p id="publication-source"></p><p>PNG · 1000 × 1000 px</p></div></div>
    <fieldset><legend>01 作品信息</legend><label>作者（当前演示账号）<input value="CoNo" readonly name="author"></label><label>纹样名称<input name="name" required maxlength="60" placeholder="为你的纹样命名"></label><label>纹样介绍与设计说明<textarea name="description" required maxlength="2000" rows="3" placeholder="说明题材、设计理念、基础纹样与创作过程"></textarea></label><label>素材来源 / 创作工具<input name="origin" required maxlength="300" placeholder="请如实填写参考素材及使用的 AI 或设计工具"></label></fieldset>
    <fieldset><legend>02 个人使用授权</legend><label>使用方式<select name="personal"><option value="view">仅供欣赏，别人不可使用</option><option value="free">个人非商用免费使用</option><option value="paid">个人使用需付费授权</option></select></label><label id="publication-price-row" hidden>个人授权价格（人民币）<input name="price" type="number" min="0.01" max="10000" step="0.01" placeholder="例如 5.00"></label></fieldset>
    <fieldset><legend>03 商用授权</legend><label>商业使用<select name="commercial"><option value="no">不允许商用</option><option value="contact">商用需联系作者协商授权</option><option value="free">允许免费商用，须遵守附加条件</option></select></label><label id="publication-terms-row" hidden>商业授权条件<textarea name="terms" maxlength="2000" rows="3" placeholder="例如面料生产、生产数量、使用期限或品牌范围；协商完成前不得使用"></textarea></label><label id="publication-contact-row" hidden>授权联系方式<input name="contact" maxlength="200" placeholder="邮箱或业务联系方式（请勿填写敏感信息）"></label></fieldset>
    <fieldset><legend>04 使用范围与限制</legend><div class="publication-checks"><label><input name="credit" type="checkbox" checked>使用时必须署名</label><label><input name="modify" type="checkbox">允许修改与二次创作</label><label><input name="fabric" type="checkbox">允许用于面料 / 实物生产</label><label><input name="mass" type="checkbox">允许批量生产</label></div><p class="publication-note">上述范围以所选个人 / 商用授权为前提；需付费或协商时，须先取得授权。始终禁止转售、转授权或单独分发源文件。</p></fieldset>
    <section class="publication-summary"><h3>授权摘要</h3><p id="publication-summary"></p></section>
    <label class="publication-confirm"><input name="rights" type="checkbox" required>我确认已如实填写来源，并拥有作品及所用素材的发布与授权权利。示例素材不可冒充原创；该勾选不等于平台完成版权审核。</label>
    <p id="publication-feedback" role="status"></p><footer><button type="button" data-pub-close>取消</button><button class="publication-primary" type="submit">确认上传（本地演示）</button></footer></form>
    <section id="publication-success" hidden><h3>已保存到本地素材纹样库</h3><p>作品图像、作者信息和授权设置已一并保存。清除浏览器数据会删除这些记录；其他用户目前无法访问。</p><a href="./digital-pattern-library.html">返回数字纹样库 →</a></section>`;
  const scrollBody=document.createElement('div');
  scrollBody.className='publication-scroll-body';
  scrollBody.append(...Array.from(dialog.children).slice(1));
  dialog.append(scrollBody);
  document.body.append(dialog);
  const form=dialog.querySelector('form'), field=n=>form.elements.namedItem(n), feedback=dialog.querySelector('#publication-feedback');
  function update(){
    const paid=field('personal').value==='paid',commercial=field('commercial').value!=='no';
    const contact=paid||field('commercial').value==='contact';
    dialog.querySelector('#publication-price-row').hidden=!paid;field('price').required=paid;field('price').disabled=!paid;
    dialog.querySelector('#publication-terms-row').hidden=!commercial;field('terms').required=commercial;field('terms').disabled=!commercial;
    dialog.querySelector('#publication-contact-row').hidden=!contact;field('contact').required=contact;field('contact').disabled=!contact;
    const viewOnly=field('personal').value==='view'&&!commercial;
    ['modify','fabric','mass'].forEach(n=>{field(n).disabled=viewOnly;if(viewOnly)field(n).checked=false;});
    field('mass').disabled=viewOnly||!field('fabric').checked;if(field('mass').disabled)field('mass').checked=false;
    dialog.querySelector('#publication-summary').textContent=[personalLabels[field('personal').value]+(paid&&field('price').value?`（¥${field('price').value}，需另行完成授权）`:''),commercialLabels[field('commercial').value],field('credit').checked?'须署名':'不强制署名',field('modify').checked?'授权范围内可修改':'不可修改',field('fabric').checked?'授权范围内可用于面料生产':'未授权面料生产',field('mass').checked?'授权范围内可批量生产':'未授权批量生产','禁止转售源文件'].join('；')+'。';
  }
  form.addEventListener('input',update);form.addEventListener('change',update);
  function open(data){
    if(!loggedIn())return;
    snapshot=data;focusReturn=document.activeElement;form.reset();form.hidden=false;
    dialog.querySelector('#publication-success').hidden=true;feedback.textContent='';
    if(objectURL)URL.revokeObjectURL(objectURL);objectURL=URL.createObjectURL(data.blob);
    dialog.querySelector('#publication-image').src=objectURL;
    dialog.querySelector('#publication-mode').textContent=data.mode+' · '+data.composition;
    dialog.querySelector('#publication-source').textContent='当前来源：'+data.source;
    update();dialog.showModal();field('name').focus({preventScroll:true});scrollBody.scrollTop=0;
  }
  dialog.querySelectorAll('[data-pub-close]').forEach(b=>b.onclick=()=>{if(!busy)dialog.close();});
  dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
  dialog.addEventListener('close',()=>{if(objectURL){URL.revokeObjectURL(objectURL);objectURL='';}snapshot=null;focusReturn?.focus();});
  document.addEventListener('studio:publish-request',e=>{
    if(!e.detail?.blob)return;
    if(loggedIn()){open(e.detail);return;}
    pending=e.detail;
    const notice=document.querySelector('#flat-status');if(notice)notice.textContent='上传到素材纹样库需要先登录，登录后继续填写作品和授权信息。';
    document.querySelector('[data-show-login]')?.click();
  });
  const login=document.querySelector('.login-dialog:not(.register-dialog)');
  if(login)new MutationObserver(()=>{if(login.hidden&&!loggedIn())pending=null;}).observe(login,{attributes:true,attributeFilter:['hidden']});
  document.addEventListener('studio:auth-change',e=>{
    if(e.detail.loggedIn&&pending){const data=pending;pending=null;setTimeout(()=>open(data),0);}
    if(!e.detail.loggedIn){pending=null;if(dialog.open)dialog.close();}
    renderLocal();
  });
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(busy)return;
    if(!loggedIn()){feedback.textContent='登录状态已失效，请重新登录后上传。';return;}
    if(!snapshot||!form.reportValidity())return;
    for(const n of ['name','description','origin'])if(!field(n).value.trim()){field(n).focus();feedback.textContent='请完整填写作品名称、介绍和素材来源。';return;}
    if((field('terms').required&&!field('terms').value.trim())||(field('contact').required&&!field('contact').value.trim())){feedback.textContent='请填写有效的授权条件及联系方式。';return;}
    const button=form.querySelector('[type="submit"]');busy=true;button.disabled=true;feedback.textContent='正在保存作品与授权…';
    const work={id:crypto.randomUUID(),author:'CoNo',createdAt:new Date().toISOString(),name:field('name').value.trim(),description:field('description').value.trim(),origin:field('origin').value.trim(),...snapshot,license:{personal:field('personal').value,price:field('personal').value==='paid'?Number(field('price').value):null,commercial:field('commercial').value,terms:field('terms').disabled?'':field('terms').value.trim(),contact:field('contact').disabled?'':field('contact').value.trim(),credit:field('credit').checked,modify:field('modify').checked,fabric:field('fabric').checked,mass:field('mass').checked,summary:dialog.querySelector('#publication-summary').textContent}};
    try{await records(work);form.hidden=true;dialog.querySelector('#publication-success').hidden=false;}
    catch{feedback.textContent='保存失败：浏览器存储不可用或空间不足。请导出 PNG 备份后重试。';}
    finally{busy=false;button.disabled=false;}
  });
  let listURLs=[];
  async function renderLocal(){
    if(!document.querySelector('#pattern-grid'))return;
    let section=document.querySelector('#my-local-patterns');
    if(!section){section=document.createElement('section');section.id='my-local-patterns';section.className='local-publications';document.querySelector('main').append(section);}
    listURLs.forEach(url=>URL.revokeObjectURL(url));listURLs=[];section.replaceChildren();
    const title=document.createElement('h2');title.textContent='我的本地作品';section.append(title);
    const note=document.createElement('p');note.textContent=loggedIn()?'仅当前浏览器可见 · 演示账号 CoNo · 未公开发布，收费与商用授权尚未生效':'登录后查看本浏览器保存的作品与授权设置。';section.append(note);
    if(!loggedIn())return;
    try{
      const works=await records();if(!loggedIn())return;
      if(!works.length){const empty=document.createElement('p');empty.textContent='暂无本地作品。可在 AI 创作空间编辑后上传。';section.append(empty);return;}
      const grid=document.createElement('div');grid.className='local-publication-grid';section.append(grid);
      works.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).forEach(work=>{
        const card=document.createElement('article'),img=document.createElement('img'),h=document.createElement('h3'),author=document.createElement('p'),details=document.createElement('details'),summary=document.createElement('summary');
        const url=URL.createObjectURL(work.blob);listURLs.push(url);img.src=url;img.alt=work.name;h.textContent=work.name;author.textContent='CoNo · '+new Date(work.createdAt).toLocaleDateString('zh-CN');summary.textContent='查看作品与授权';details.append(summary);
        [work.description,'来源：'+work.origin,work.license.summary,work.license.terms?'商用条件：'+work.license.terms:'',work.license.contact?'授权联系：'+work.license.contact:''].filter(Boolean).forEach(text=>{const p=document.createElement('p');p.textContent=text;details.append(p);});
        card.append(img,h,author,details);grid.append(card);
      });
    }catch{const p=document.createElement('p');p.textContent='无法读取本地作品，请检查浏览器存储权限。';section.append(p);}
  }
  renderLocal();
})();
