(() => {
  'use strict';
  const data=window.ROBOTUTOR_FILMS, root=document.getElementById('cards'), params=new URLSearchParams(location.search);
  if(!data||!root)return;
  const fns=['coverage','earlier','handback'], tasks={peg:'Peg insertion',cable:'Cable clipping'};
  const text={
    coverage:['Correction augmentation','Follow the same local start and destination, but take a different path in between. The two command traces should open up mid-window, then meet at frame 12.'],
    earlier:['Earlier correction','At A, six actions remain before the recorded takeover B. In the new branch B′ is closer to the A–C line, so there is less lateral motion to undo after takeover. C is the end of this window, not a task-success label.'],
    handback:['Human–policy handback','Keep the last two human actions identical. At frame 2, hand control back to the policy with a gentler velocity change, without stopping the continuation.']
  };
  let task=Object.hasOwn(tasks,params.get('task'))?params.get('task'):'peg';
  const state={peg:{coverage:'peg_coverage_t71_f39c97e9'},cable:{earlier:'cable_visible013_0e5c159'}}; if(fns.includes(params.get('family')))state[task][params.get('family')]=params.get('segment');
  const peek=data.peg.earlier[0];if(peek){const anchor=document.getElementById('peek-link');anchor.href='?task=peg&family=earlier&segment='+encodeURIComponent(peek.id)+'#earlier';document.getElementById('peek-note').append(' '+peek.note);}
  const el=(tag,cl,content)=>{const n=document.createElement(tag);if(cl)n.className=cl;if(content!=null)n.textContent=content;return n};
  function asset(a,label,download=false){const n=el('a','',label);n.href=a;if(download)n.download='';else{n.target='_blank';n.rel='noopener'}return n;}
  function block(f,rows){
    const card=el('article','card');card.id=f;
    card.append(el('p','kicker','Practice / '+tasks[task]),el('h3','',text[f][0]),el('p','desc',text[f][1]));
    if(!rows.length){card.append(el('p','caption','No visually confirmed examples for this task and family.'));return card}
    const tools=el('div','tools'),lab=el('label','','Recorded segment'),select=el('select');select.id='choice-'+f;lab.htmlFor=select.id;
    const prev=el('button','step','←'),next=el('button','step','→');prev.setAttribute('aria-label','Previous segment');next.setAttribute('aria-label','Next segment');
    rows.forEach((r,i)=>{const o=el('option','',String(i+1).padStart(2,'0')+' / '+String(rows.length).padStart(2,'0')+' · '+r.label);o.value=r.id;select.append(o)});
    const idx=rows.findIndex(r=>r.id===state[task][f]);select.selectedIndex=Math.max(0,idx);
    tools.append(lab,prev,select,next);card.append(tools);
    const content=el('div');card.append(content);
    function update(push=false){
      content.querySelector('video')?.pause();content.replaceChildren();const i=select.selectedIndex,r=rows[i];state[task][f]=r.id;
      if(push){const u=new URL(location.href);u.searchParams.set('task',task);u.searchParams.set('family',f);u.searchParams.set('segment',r.id);u.hash=f;history.replaceState(null,'',u)}
      prev.disabled=i===0;next.disabled=i===rows.length-1;
      const vid=el('video');vid.controls=true;vid.playsInline=true;vid.preload='none';vid.poster=r.poster;vid.src=r.movie;vid.setAttribute('aria-label',tasks[task]+' · '+text[f][0]+' · '+r.label);
      const fig=el('figure','player');fig.append(vid);content.append(fig);
      const facts=el('div','fact');r.metrics.forEach(t=>facts.append(el('span','',t)));content.append(facts);
      content.append(el('p','finding',r.note));
      const links=el('div','media-links');links.append(asset(r.movie,'Download standalone MP4',true),asset(r.strip,'Open full-resolution frame strip'));content.append(links);
      const strip=el('details','strip'),summary=el('summary','','Compare individual frames · 3 rows × 13 instants'),scroll=el('div','scroll');
      const im=el('img');im.alt='Real recording, original-action prediction, and constructed-action prediction; each column shows the same frame';im.loading='eager';
      scroll.append(im);strip.append(summary,scroll);strip.addEventListener('toggle',()=>{if(strip.open&&!im.hasAttribute('src'))im.src=r.strip});content.append(strip);
    }
    select.onchange=()=>update(true);prev.onclick=()=>{select.selectedIndex--;update(true)};next.onclick=()=>{select.selectedIndex++;update(true)};update();return card;
  }
  function show(){root.querySelectorAll('video').forEach(v=>v.pause());root.replaceChildren();const d=data[task];fns.forEach(f=>root.append(block(f,d[f])));
    document.querySelectorAll('[data-task]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.task===task)));document.getElementById('count').textContent=fns.reduce((n,f)=>n+d[f].length,0)+' matched video comparisons · '+tasks[task];}
  document.querySelectorAll('[data-task]').forEach(b=>b.onclick=()=>{if(task===b.dataset.task)return;task=b.dataset.task;const u=new URL(location.href);u.search='?task='+task;u.hash='gallery';history.replaceState(null,'',u);show()});show();
  if(fns.includes(location.hash.slice(1)))requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant'}));
})();
