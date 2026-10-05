const $=id=>document.getElementById(id);
const S={role:'p',risk:0.25,stage:1};
const STAGES=[{n:'Before filing',e:'🌱',f:1,y:2.5},{n:'After discovery',e:'🔍',f:0.5,y:1},{n:'Eve of trial',e:'🔔',f:0.15,y:0.3}];
const $$=(q)=>document.querySelectorAll(q);
const m=n=>{const s=n<0?'-':'';return s+'$'+Math.round(Math.abs(n)).toLocaleString('en-US')};
const num=id=>Math.max(0,parseFloat($(id).value)||0);
function calc(st){
  const offer=num('offer'),D=num('dmg'),cost=num('cost'),p=num('p')/100,c=num('col')/100,k=S.risk;
  const sg=STAGES[st],cr=cost*sg.f,disc=1/Math.pow(1.06,sg.y);
  let win,lose,sd,settle;
  if(S.role==='p'){const g=D*c*disc;win=g-cr;lose=-cr;sd=g*Math.sqrt(p*(1-p));settle=offer;}
  else{const g=D*disc;win=-g-cr;lose=-cr;sd=g*Math.sqrt(p*(1-p));settle=-offer;}
  // 'win' = plaintiff wins branch from the user's side (plaintiff gains; defendant pays)
  const good=S.role==='p'?win:lose, bad=S.role==='p'?lose:win;
  const pg=S.role==='p'?p:1-p;
  const ev=pg*good+(1-pg)*bad, rp=k*sd, trial=ev-rp;
  return {good,bad,pg,ev,rp,trial,settle,diff:settle-trial,cr,disc};
}
function call(r){
  const scale=Math.max(Math.abs(r.settle),Math.abs(r.trial),1000),t=0.08*scale;
  return r.diff>t?'s':r.diff<-t?'t':'x';
}
var render=function(){
  $('pv').textContent=num('p')+'%';$('cv').textContent=num('col')+'%';
  $('colwrap').style.display=S.role==='p'?'block':'none';
  $('plab').textContent=S.role==='p'?'Chance you win':'Chance the plaintiff wins';
  const r=calc(S.stage),v=call(r),pl=S.role==='p';
  // verdict
  const H={s:['Take the deal 🤝','The offer beats your risk-adjusted trial value by '+m(Math.abs(r.diff))+'. A bird in the hand wins here.','🤝'],
  t:['Fight it out ⚔️','Trial is worth about '+m(Math.abs(r.diff))+' more to you than the offer, even after costs and nerves.','⚔️'],
  x:['Toss-up 🪙','The two paths are within a few percent of each other. Non-money factors (stress, privacy, precedent) should break the tie.','🪙']}[v];
  $('vh').textContent=H[0];$('vp').textContent=H[1];$('mascot').textContent=H[2];
  // tree
  const sBest=v==='s',tBest=v==='t',pct=Math.round(r.pg*100);
  const gl=pl?'Win':'Plaintiff loses',bl=pl?'Lose':'Plaintiff wins';
  $('tree').innerHTML=`
  <path class="line ${sBest?'best':''}" d="M84 170 C170 170 190 70 300 70"/>
  <path class="line ${tBest?'best':''}" d="M84 190 C170 190 190 250 262 250"/>
  <path class="line" d="M284 238 C340 200 380 150 460 150"/>
  <path class="line" d="M284 262 C340 290 380 290 460 290"/>
  <rect class="node" x="40" y="160" width="46" height="46" rx="8"/>
  <text x="63" y="190" text-anchor="middle" font-size="22">?</text>
  <circle class="node" cx="262" cy="250" r="24"/><text x="262" y="256" text-anchor="middle" font-size="18">🎲</text>
  <text class="lbl" x="150" y="96" transform="rotate(-16 150 96)">settle</text>
  <text class="lbl" x="130" y="236" transform="rotate(12 130 236)">go to trial</text>
  <text class="lbl" x="330" y="185" transform="rotate(-24 330 185)">${gl} ${pct}%</text>
  <text class="lbl" x="330" y="296">${bl} ${100-pct}%</text>
  <g class="${sBest?'boxbest':''}"><rect class="box ${sBest?'boxbest':''}" x="300" y="38" width="380" height="64" rx="16"/>
  <text class="big" x="318" y="66">${sBest?'👑 ':''}Settle: ${m(r.settle)}</text><text class="lbl" x="318" y="88">${pl?'cash in hand, case over':'what you pay, case over'}</text></g>
  <rect class="box" x="460" y="118" width="220" height="64" rx="16"/>
  <text class="big" x="476" y="146">${m(r.good)}</text><text class="lbl" x="476" y="168">${pl?'win, net of future fees':'plaintiff loses, fees only'}</text>
  <rect class="box" x="460" y="258" width="220" height="64" rx="16"/>
  <text class="big" x="476" y="286">${m(r.bad)}</text><text class="lbl" x="476" y="308">${pl?'lose, fees only':'plaintiff wins, damages + fees'}</text>
  <rect class="box ${tBest?'boxbest':''}" x="300" y="206" width="0" height="0"/>
  <text class="lbl" x="150" y="334" style="font-weight:700">${tBest?'👑 ':''}Trial, risk-adjusted: ${m(r.trial)}</text>`;
  // stages
  $('stages').innerHTML=STAGES.map((s,i)=>{const q=calc(i),w=call(q);
    return `<button class="stg" data-i="${i}" aria-pressed="${i===S.stage}"><div class="t">${s.e} ${s.n}</div><div class="v">Trial worth ${m(q.trial)}</div><span class="chip ${w==='t'?'t':w==='x'?'x':''}">${w==='s'?'Settle':w==='t'?'Try it':'Toss-up'}</span></button>`}).join('');
  $$('.stg').forEach(b=>b.onclick=()=>{S.stage=+b.dataset.i;render()});
  // walkaway
  const wa=pl?r.trial:-r.trial;
  $('walk').innerHTML=`<h2>Your walk-away number</h2><p>${pl?'Say yes to any offer of at least':'Pay up to'} <b>${m(Math.max(wa,0))}</b> ${pl?'at this stage.':'before trial looks cheaper.'}</p>
  <p>Raw average outcome of trial: ${m(r.ev)}. Risk nerves shave off ${m(r.rp)}. Waiting costs value too: money later is worth about ${Math.round(r.disc*100)}% of money now.</p>
  <p>Tip: slide the odds up and down. If the verdict flips with a 10-point swing, the case is closer than it feels.</p>`;
};
$$('#role button').forEach(b=>b.onclick=()=>{S.role=b.dataset.v;$$('#role button').forEach(x=>x.setAttribute('aria-pressed',x===b));render()});
$$('#risk button').forEach(b=>b.onclick=()=>{S.risk=parseFloat(b.dataset.v);$$('#risk button').forEach(x=>x.setAttribute('aria-pressed',x===b));render()});
['offer','dmg','cost','p','col'].forEach(id=>$(id).addEventListener('input',()=>render()));

// ---- URL state: every scenario is a shareable link ----
const IDS=['offer','dmg','cost','p','col'];
function save(){
  const q=new URLSearchParams();
  IDS.forEach(id=>q.set(id,$(id).value));
  q.set('role',S.role);q.set('risk',S.risk);q.set('stage',S.stage);
  history.replaceState(null,'','#'+q.toString());
}
function load(){
  const q=new URLSearchParams(location.hash.slice(1));
  IDS.forEach(id=>{if(q.has(id))$(id).value=q.get(id)});
  if(q.has('role'))S.role=q.get('role')==='d'?'d':'p';
  if(q.has('risk'))S.risk=parseFloat(q.get('risk'))||0;
  if(q.has('stage'))S.stage=Math.min(2,Math.max(0,+q.get('stage')||0));
  $$('#role button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.v===S.role));
  $$('#risk button').forEach(x=>x.setAttribute('aria-pressed',parseFloat(x.dataset.v)===S.risk));
}
const _render=render;render=function(){_render();save()};
$('share').onclick=async()=>{
  save();
  try{await navigator.clipboard.writeText(location.href);$('share').textContent='Link copied ✔'}
  catch(e){$('share').textContent='Copy the address bar'}
  setTimeout(()=>$('share').textContent='Copy share link 🔗',2200);
};
$('print').onclick=()=>window.print();
load();render();
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
