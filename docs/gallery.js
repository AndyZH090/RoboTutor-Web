(() => {
  "use strict";
  const catalog = window.ROBOTUTOR_FILMS, lab = window.ROBOTUTOR_FRAME_LAB;
  if (!catalog || !lab || lab.version !== 1) return;
  const L = lab.layout, root = document.querySelector("#cards");
  const families = ["coverage","earlier","handback"], roles = ["real","factual","constructed"];
  const titles = {peg:"Peg insertion",cable:"Cable clipping"};
  const names = {coverage:"Correction augmentation", earlier:"Earlier correction", handback:"Human–policy handback"};
  const descriptions = {
    coverage:"The two action sequences share the same start and command endpoint. Compare how far their paths open up in the middle and whether the image predictions also come back together.",
    earlier:"A is the shared start, B is the recorded takeover at frame 6, and C is the local destination. Compare B with B′: a smaller departure from the A–C line leaves less to undo on the way back.",
    handback:"The first two human actions are unchanged. Follow the release at frame 2: how abruptly does each trajectory turn as the policy takes over?"
  };
  const captions = ["Recorded intervention","World model · recorded actions","World model · constructed actions"];
  const color = {factual:"#25568c",constructed:"#b04b12"};
  const node=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
  const btn=(label,cls)=>{const n=node("button",cls,label);n.type="button";return n};
  const sv=(tag,at={},txt)=>{const n=document.createElementNS("http://www.w3.org/2000/svg",tag);for(const [k,v] of Object.entries(at))n.setAttribute(k,String(v));if(txt!==undefined)n.textContent=txt;return n};
  const queries=new URLSearchParams(location.search);
  let task=Object.hasOwn(titles,queries.get("task"))?queries.get("task"):"peg", frame=6, timer=0, marks=true;
  const selected={peg:{coverage:"peg_coverage_t71_f39c97e9"},cable:{earlier:"cable_visible013_0e5c159"}};
  if(families.includes(queries.get("family")))selected[task][queries.get("family")]=queries.get("segment");
  const frameTag=i=>"F"+String(i).padStart(2,"0");
  const views=new Map();
  function urlFor(f,id){const u=new URL(location.href);u.search="?task="+task;if(f){u.searchParams.set("family",f);u.searchParams.set("segment",id)}u.hash=f||"gallery";return u}
  function remember(f,id){if(location.protocol!=="file:")history.replaceState(null,"",urlFor(f,id))}
  function sync(){for(const v of views.values())v.draw()}
  function setFrame(i){frame=Math.min(12,Math.max(0,i));sync()}
  function stop(){if(timer)clearInterval(timer);timer=0;sync()}
  function play(){if(timer){stop();return}if(frame===12)setFrame(0);timer=setInterval(()=>{if(frame===12){stop();return}setFrame(frame+1)},240);sync()}
  document.addEventListener("visibilitychange",()=>{if(document.hidden)stop()});

  // Same metric scale for both projections, both action paths and all thirteen times.
  function tcpView(box,item){
    const svg=sv("svg",{viewBox:"0 0 510 228",role:"img","aria-label":"Two registered command paths in XY and XZ, millimetres relative to their common start."});
    const paths=item.tcp, pts=[...paths.factual,...paths.constructed], mid=[], range=[];
    for(let k=0;k<3;k++){const p=pts.map(v=>v[k]),lo=Math.min(...p),hi=Math.max(...p);mid.push((lo+hi)/2);range.push(hi-lo)}
    const size=Math.max(...range,4)*1.18, scale=148/size, live=[];
    const nice=v=>{const d=10**Math.floor(Math.log10(v));return [1,2,5,10].reduce((a,b)=>Math.abs(a-v/d)<Math.abs(b-v/d)?a:b)*d};
    [1,2].forEach((dim,col)=>{
      const cx=122+col*255,cy=112,point=p=>[cx+(p[0]-mid[0])*scale,cy-(p[dim]-mid[dim])*scale];
      const pp=(q)=>point(q).map(x=>x.toFixed(2)).join(",");
      svg.append(sv("rect",{x:cx-90,y:27,width:180,height:170,rx:5,fill:"#fbfcfa",stroke:"#dae3db"}));
      for(let i=-1;i<=1;i++){svg.append(sv("line",{x1:cx-90,x2:cx+90,y1:cy+i*38,y2:cy+i*38,stroke:"#e6ebe7"}),sv("line",{x1:cx+i*38,x2:cx+i*38,y1:27,y2:197,stroke:"#e6ebe7"}))}
      svg.append(sv("text",{x:cx,y:18,"text-anchor":"middle",class:"plane-name"},dim===1?"XY · top":"XZ · side"));
      if(item.family==="earlier"){svg.append(sv("polyline",{points:pp(paths.factual[0])+" "+pp(paths.factual[12]),fill:"none",stroke:"#64716b","stroke-dasharray":"3 4"}))}
      for(const role of ["factual","constructed"]){
        const ar=paths[role], line=sv("polyline",{points:ar.map(pp).join(" "),fill:"none",stroke:color[role],"stroke-width":2.6,"stroke-linejoin":"round","stroke-linecap":"round"});
        if(role==="factual")line.setAttribute("stroke-dasharray","5 3");
        svg.append(line);
        ar.forEach(v=>{const [x,y]=point(v);svg.append(sv("circle",{cx:x,cy:y,r:1.9,fill:color[role]}))});
        if(item.event!==null){const [x,y]=point(ar[item.event]);svg.append(sv("rect",{x:x-3.3,y:y-3.3,width:6.6,height:6.6,stroke:color[role],fill:"white","stroke-width":1.6}))}
      }
      if(item.family==="earlier"){
        const landmarks=[["A",paths.factual[0],-6,13,"end","#465951"],["C",paths.factual[12],6,-7,"start","#465951"],["B",paths.factual[6],-6,-8,"end",color.factual],["B′",paths.constructed[6],6,14,"start",color.constructed]];
        for(const [label,v,dx,dy,anchor,ink] of landmarks){const [x,y]=point(v);svg.append(sv("text",{x:x+dx,y:y+dy,"text-anchor":anchor,fill:ink,stroke:"white","stroke-width":2,"paint-order":"stroke","font-size":13,"font-weight":700},label))}
      }
      const curr=[];
      for(const role of ["factual","constructed"]){
        const dot=sv("circle",{r:role==="factual"?6.7:4.1,stroke:color[role],fill:role==="factual"?"white":color[role],"stroke-width":2.4});
        svg.append(dot);curr.push([dot,role]);
      }
      const length=nice(size/4),bar=length*scale,barx=cx-88;
      svg.append(sv("path",{d:"M"+barx+" 207v4h"+bar+"v-4",fill:"none",stroke:"#465951","stroke-width":1.5}),sv("text",{x:barx+bar+6,y:215,class:"axis-note"},+length.toPrecision(3)+" mm"));
      live.push(i=>{for(const [dot,role] of curr){const [x,y]=point(paths[role][i]);dot.setAttribute("cx",x);dot.setAttribute("cy",y)}});
    });
    box.append(svg);return i=>{for(const f of live)f(i);svg.dataset.frame=String(i)};
  }
  function createCard(f,records){
    const card=node("article","card");card.id=f;
    card.append(node("p","kicker",titles[task]+" / practice family"),node("h3","",names[f]),node("p","desc",descriptions[f]));
    const tools=node("div","tools"),label=node("label","","Recorded segment"),select=node("select");select.id="choice-"+f;label.htmlFor=select.id;
    records.forEach((r,i)=>{const o=node("option","",String(i+1).padStart(2,"0")+" / "+String(records.length).padStart(2,"0")+" · "+r.label);o.value=r.id;select.append(o)});
    select.selectedIndex=Math.max(0,records.findIndex(r=>r.id===selected[task][f]));
    tools.append(label,select);card.append(tools);const content=node("div","practice-example");card.append(content);
    const update=(push)=>{
      const r=records[select.selectedIndex],item=lab.cases[r.id];if(!item||item.task!==task||item.family!==f)throw Error("Unmatched source: "+r.id);
      selected[task][f]=r.id;if(push){stop();remember(f,r.id)}
      content.replaceChildren();card.dataset.case=r.id;card.dataset.ready="loading";
      const sensors=node("div","frame-grid"),canv=[];
      for(const [k,role] of roles.entries()){
        const fig=node("figure","pane "+role),cp=node("figcaption","pane-title",captions[k]),c=node("canvas","sensor");
        c.width=L.frameWidth;c.height=L.frameHeight;c.setAttribute("role","img");c.setAttribute("aria-label",captions[k]+", wrist and fixed-camera views in full");
        fig.append(cp,c);sensors.append(fig);canv.push(c);
      }
      const plot=node("figure","pane motion"),pcap=node("figcaption","pane-title","TCP · action-path comparison"),pt=node("div","tcp-drawing");
      const key=node("div","legend");key.append(node("span","path-key original","Recorded actions"),node("span","path-key proposed","Constructed actions"));
      plot.append(pcap,pt,key);sensors.append(plot);content.append(sensors);const setPlot=tcpView(pt,item);
      const controls=node("div","frame-controls"),b=btn("Play frames","play"),range=node("input","scrubber"),clock=node("output","frame-label");
      range.type="range";range.min=0;range.max=12;range.step=1;range.setAttribute("aria-label","Synchronized frame for all practice families");
      const markLabel=node("label","mark-control"),toggle=node("input");toggle.type="checkbox";toggle.checked=marks;markLabel.append(toggle,document.createTextNode(" Image marker"));
      controls.append(b,range,clock,markLabel);content.append(controls);
      const eventLine=node("p","frame-event");content.append(eventLine);
      const seq=node("section","sequence"),head=node("div","sequence-header"),h=node("h4","","Frame-by-frame comparison"),open=node("a","","Open full resolution");
      open.href=r.strip;open.target="_blank";open.rel="noopener";head.append(h,open);seq.append(head);
      seq.append(node("p","sequence-help","Top: recorded · Middle: model / recorded actions · Bottom: model / constructed actions. Select a column to inspect that instant."));
      const rail=node("div","sequence-scroll"),inner=node("div","sheet"),im=node("img","sequence-image");
      im.alt="Unmarked contact sheet: recorded, original-action prediction, constructed-action prediction. Thirteen aligned instants from left to right.";
      im.width=L.width;im.height=L.height;inner.append(im);
      const hit=[];
      for(let i=0;i<=12;i++){
        const col=btn("","sheet-column");col.setAttribute("aria-label","Inspect frame "+i+" of "+names[f]);col.style.left=100*L.x[i]/L.width+"%";col.style.width=100*L.frameWidth/L.width+"%";
        col.addEventListener("click",()=>{stop();setFrame(i)});inner.append(col);hit.push(col);
      }
      rail.append(inner);seq.append(rail);content.append(seq);
      const facts=node("div","fact");r.metrics.forEach(t=>facts.append(node("span","",t)));content.append(facts,node("p","finding",r.note));
      const errors=node("p","load-error");errors.hidden=true;errors.setAttribute("role","alert");content.append(errors);
      let ready=false;
      function draw(){
        const i=frame;clock.value=frameTag(i)+" / F12";range.value=i;range.setAttribute("aria-valuetext","Frame "+i+" of 12");setPlot(i);toggle.checked=marks;
        b.textContent=timer?"Pause":"Play frames";b.setAttribute("aria-pressed",String(Boolean(timer)));hit.forEach((c,j)=>c.setAttribute("aria-pressed",String(j===i)));
        eventLine.textContent=f==="earlier"?(i===0?"A · shared start":i<6?"Before the human takeover":i===6?"B / B′ · recorded takeover vs. earlier correction":i===12?"C · local destination":"After the recorded takeover"):f==="handback"?(i<2?"Human-controlled prefix":i===2?"Handback · shared human prefix ends":"Policy continuation"):(i===0?"Shared start":i===12?"Shared command endpoint":"Compare the two interior paths");
        if(!ready)return;
        canv.forEach((c,row)=>{
          const ctx=c.getContext("2d");ctx.drawImage(im,L.x[i],L.y[row],L.frameWidth,L.frameHeight,0,0,c.width,c.height);c.dataset.frame=i;
          const marker=item.markers[roles[row]][i];if(!marks||!marker)return;
          ctx.beginPath();ctx.arc(L.frameWidth/2+marker[0],marker[1],7,0,2*Math.PI);
          ctx.strokeStyle="#15252b";ctx.lineWidth=3.5;ctx.stroke();ctx.strokeStyle="#ffed77";ctx.lineWidth=1.6;ctx.stroke();
        });
      }
      views.set(f,{draw});
      im.onload=()=>{if(card.dataset.case!==r.id||!content.contains(im))return;if(im.naturalWidth!==L.width||im.naturalHeight!==L.height){im.onerror();return}ready=true;card.dataset.ready="yes";draw()};
      im.onerror=()=>{if(!content.contains(im))return;ready=false;card.dataset.ready="error";errors.hidden=false;errors.textContent="The source frames could not be loaded. Reopen this segment or reload the page."};
      im.src=r.strip;b.onclick=play;
      // stop() redraws all sliders, so capture the user's value before stopping.
      range.oninput=(ev)=>{const v=Number(ev.currentTarget.value);stop();setFrame(v)};
      toggle.onchange=()=>{marks=toggle.checked;sync()};draw();
    };
    select.onchange=()=>update(true);update(false);return card;
  }
  function show(){
    stop();views.clear();root.replaceChildren();
    families.forEach(f=>root.append(createCard(f,catalog[task][f])));
    for(const n of document.querySelectorAll("[data-task]"))n.setAttribute("aria-pressed",String(n.dataset.task===task));
    document.querySelector("#count").textContent=families.reduce((n,f)=>n+catalog[task][f].length,0)+" matched segments · "+titles[task];sync();
  }
  for(const b of document.querySelectorAll("[data-task]"))b.onclick=()=>{if(b.dataset.task!==task){task=b.dataset.task;remember();show()}};
  const peek=catalog.peg.earlier[0];document.querySelector("#peek-link").href="?task=peg&family=earlier&segment="+encodeURIComponent(peek.id)+"#earlier";
  document.querySelector("#peek-note").append(" "+peek.note);show();
  if(families.includes(location.hash.slice(1)))requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:"instant"}));
})();
