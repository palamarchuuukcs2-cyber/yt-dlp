// ================= FEED VERSION: camera scrolls down a vertical track =================
const GAP=1350, MOVE=.62;
const IFL=[['',24,0,'','дня с запуска'],['',13.2,1,'K','подписчиков'],['',2.9,1,'M','просмотров'],['×',217,0,'','просм. к подп.',1]];
const DAX=[['',17,0,'','дней с запуска'],['',10.8,1,'K','подписчиков'],['',2.1,1,'M','просмотров'],['×',192,0,'','просм. к подп.',1]];
// [duration, section tag, draw fn, isSectionTitle]
const BEATS=[
 [3.0,'INTRO',b_hook],[2.6,'INTRO',b_faceless],[2.8,'INTRO',b_phones],
 [2.4,'ШАГ 01 / 04',(c,t)=>b_section(c,t,1,['смотри, что','уже залетает']),1],
 [2.8,'ШАГ 01 / 04',b_terminal],
 [3.0,'ШАГ 01 / 04',(c,t)=>b_stat(c,t,'Iflord','iflord',IFL,'слайды · текст · инфографика')],
 [2.8,'ШАГ 01 / 04',(c,t)=>b_stat(c,t,'Daxter RU','daxter',DAX,'3D-стикмены · на русском')],
 [2.4,'ШАГ 02 / 04',(c,t)=>b_section(c,t,2,['разбираем, почему','залетело']),1],
 [2.8,'ШАГ 02 / 04',b_niche],
 [3.0,'ШАГ 02 / 04',(c,t)=>b_checks(c,t,['что работает'],[['масштаб, сжатый','во время','«950 BCE → 2026»'],['год или карта','на экране','у 4 из 5 каналов']])],
 [2.8,'ШАГ 02 / 04',(c,t)=>b_checks(c,t,['и ещё'],[['один узнаваемый','персонаж','шарик, мульт-король'],['картинка понятна','без звука','2 из 5 — без диктора']])],
 [2.6,'ШАГ 02 / 04',b_fail],
 [2.4,'ШАГ 03 / 04',(c,t)=>b_section(c,t,3,['бери готовый','промпт']),1],
 [3.0,'ШАГ 03 / 04',b_prompt],
 [3.2,'ШАГ 03 / 04',b_tags],
 [2.2,'ШАГ 03 / 04',b_free],
 [2.6,'ШАГ 04 / 04',(c,t)=>b_section(c,t,4,['розыгрыш','AI-подписки']),1],
 [2.6,'ШАГ 04 / 04',b_poll],
 [2.6,'OUTRO',b_logo],[3.4,'OUTRO',b_cta],
];
let acc=0;BEATS.forEach((b,i)=>{b.s=acc;b.y=i*GAP;acc+=b[0]});
const TOTAL=acc; // 55.0
const DR=16;
function beatAt(t){let i=0;while(i<BEATS.length-1&&t>=BEATS[i+1].s)i++;return i}
const eio5=x=>x<.5?16*x**5:1-Math.pow(-2*x+2,5)/2;
function rest(i,t){const b=BEATS[i];return b.y+Math.max(0,t-(b.s+MOVE))*DR}
function camY(t){
  const i=beatAt(t),b=BEATS[i];
  const from=i?rest(i-1,b.s):b.y-GAP*.9, mv=b[3]?.5:MOVE;
  const p=lin(t,b.s,b.s+mv);
  let y=mix(from,b.y,eio5(p));
  const q=lin(t,b.s+mv*.85,b.s+mv+.45);y+=26*Math.sin(Math.PI*q)*(1-q); // overshoot settle
  return y+Math.max(0,t-(b.s+mv))*DR;
}
// ---------- beats (local coords: x 0..1080, y around 0; lt = time since beat start) ----------
const A=.32; // content starts animating while camera settles
function bigNum(c,txt,x,y,size,col){font(c,900,size,'"Inter Display"');c.fillStyle=col;c.textAlign='center';c.fillText(txt,x,y);c.textAlign='left'}
function play2(c,x,y,r=46){c.beginPath();c.arc(x,y,r,0,7);c.fillStyle='rgba(255,255,255,.16)';c.fill();
  c.beginPath();c.moveTo(x-r*.28,y-r*.43);c.lineTo(x+r*.46,y);c.lineTo(x-r*.28,y+r*.43);c.closePath();c.fillStyle='#fff';c.fill()}

function b_hook(c,t){
  words(c,['новый канал собрал'],-360,72,t,.25,{stag:.07});
  const p=eo5(lin(t,.5,2.2));
  c.save();const s=1+.06*Math.sin(Math.min(1,lin(t,2.2,2.5))*Math.PI);c.translate(540,-140);c.scale(s,s);
  c.shadowColor='rgba(229,50,45,.6)';c.shadowBlur=60;bigNum(c,fmt(1200000*p),0,0,176,RED2);c.restore();
  words(c,['просмотров за 24 дня'],-20,64,t,.9,{stag:.06,color:MUTE});
  // growth chart
  card(c,90,60,900,440,{p:lin(t,.4,1.2),r:28},(c,w,h)=>{
    font(c,600,22,MONO);c.fillStyle=DIM;c.fillText('views · @iflord',30,46);
    const q=eo3(lin(t,.9,2.6)),N=60,pts=[];
    for(let k=0;k<=N*q;k++){const x=k/N;pts.push([40+x*(w-80),h-50-(h-120)*Math.pow(x,2.6)*(1+.06*Math.sin(k*1.7))])}
    if(pts.length>1){c.beginPath();c.moveTo(pts[0][0],h-40);pts.forEach(p=>c.lineTo(p[0],p[1]));c.lineTo(pts.at(-1)[0],h-40);c.closePath();
      const g=c.createLinearGradient(0,60,0,h);g.addColorStop(0,'rgba(229,50,45,.35)');g.addColorStop(1,'rgba(229,50,45,0)');c.fillStyle=g;c.fill();
      c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.lineWidth=6;c.strokeStyle=RED2;c.shadowColor=RED;c.shadowBlur=24;c.stroke();c.shadowBlur=0;
      const e=pts.at(-1);c.beginPath();c.arc(e[0],e[1],11,0,7);c.fillStyle='#fff';c.fill()}
  });
}
function b_faceless(c,t){
  words(c,['без лица.','без бюджета.'],-470,100,t,A,{stag:.12});
  card(c,90,-200,900,500,{p:lin(t,A,A+.9),tilt:.04,r:28},(c,w,h)=>{
    const z=1.04+.06*lin(t,0,3);c.save();c.translate(w/2,h/2);c.scale(z,z);c.translate(-w/2,-h/2);cover(c,IMG.iflord,0,0,w,h);c.restore();
    play2(c,w/2,h/2,52)});
  sub(c,'только идея — и нейросети',420,t,1.3,{size:38,color:INK,w:600});
}
function b_phones(c,t){
  words(c,['а ты всё ещё','ищешь, что снимать?'],-480,86,t,A,{stag:.07});
  const cw=410,ch=640,y=-230;
  card(c,90,y+40,cw,ch,{p:lin(t,A+.1,A+1),tilt:-.06,skew:.06},(c,w,h)=>{
    const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#2a2b30');g.addColorStop(1,'#141518');c.fillStyle=g;c.fillRect(0,0,w,h);play2(c,w/2,h*.42);
    font(c,600,26);c.fillStyle=MUTE;c.fillText('твой ролик',34,h-96);font(c,800,60);c.fillStyle='#cfcac4';c.fillText(fmt(312*eo3(lin(t,.6,1.8))),34,h-36)});
  card(c,580,y,cw,ch,{p:lin(t,A+.3,A+1.2),tilt:.06,skew:-.06},(c,w,h)=>{
    cover(c,IMG.daxter,0,0,w,h*.62);const g=c.createLinearGradient(0,h*.3,0,h);g.addColorStop(0,'rgba(20,20,24,0)');g.addColorStop(.45,'#16171b');c.fillStyle=g;c.fillRect(0,0,w,h);play2(c,w/2,h*.3);
    font(c,600,26);c.fillStyle=MUTE;c.fillText('чужой ролик',34,h-96);font(c,800,60);c.fillStyle=RED2;c.fillText(fmt(402000*eo5(lin(t,.8,2.2))),34,h-36);
    if(t>2.2){c.globalAlpha=.5+.5*Math.sin(t*9);rr(c,2,2,w-4,h-4,24);c.lineWidth=5;c.strokeStyle=RED;c.stroke();c.globalAlpha=1}});
}
function b_section(c,t,n,lines){
  const p=eo5(lin(t,.15,1.1));
  c.save();c.globalAlpha=.08*p;c.translate(540,40);const s=1.35-.35*p;c.scale(s,s);bigNum(c,'0'+n,0,180,600,'#fff');c.restore();
  const q=eo3(lin(t,.25,.7));c.save();c.globalAlpha=q;font(c,700,30,MONO);c.letterSpacing='8px';c.fillStyle=RED2;c.textAlign='center';c.fillText(`ШАГ 0${n} / 04`,540+(1-q)*-40,-250);c.restore();
  words(c,lines,-70,112,t,.3,{stag:.08});
  const r=eo5(lin(t,.9,1.6));c.fillStyle=RED;rr(c,540-170*r,190,340*r,8,4);c.fill();
}
function b_terminal(c,t){
  words(c,['нахожу каналы','раньше тренда'],-500,84,t,A,{stag:.07});
  const rows=[['Iflord','24 дн. · слайды',217,.92],['Daxter RU','17 дн. · 3D-стикмены',192,.8],['Fun History','топ 12M · история',94,.45]];
  card(c,60,-260,960,560,{p:lin(t,A,A+.8),tilt:-.03,skew:.02},(c,w,h)=>{
    dots(c,w,'terminal');font(c,500,30,MONO);c.fillStyle='#d8d4ce';
    const cmd='> find new_viral_channels';c.fillText(cmd.slice(0,Math.floor(cl((t-.6)/.6)*cmd.length)),34,124);
    if(t>1.25){c.fillStyle=MUTE;c.fillText('> 3 results · views / subs',34,174)}
    rows.forEach((r,i)=>{const t0=1.35+i*.22,p=eo5(lin(t,t0,t0+.5));if(!p)return;const y=214+i*104,hot=i===0&&t>2.1;
      if(hot){const q=eo3(lin(t,2.1,2.4));c.fillStyle=`rgba(229,50,45,${.24*q})`;c.fillRect(0,y,w*q,92)}
      c.globalAlpha=p;c.beginPath();c.arc(54,y+46,18,0,7);c.fillStyle=hot?RED:'#3a3b41';c.fill();
      font(c,700,32,MONO);c.fillStyle=INK;c.fillText(r[0],92,y+44);font(c,500,21,MONO);c.fillStyle=DIM;c.fillText(r[1],92,y+74);
      c.fillStyle='rgba(255,255,255,.12)';rr(c,470,y+42,290,8,4);c.fill();c.fillStyle=hot?RED2:'#d8d4ce';rr(c,470,y+42,290*r[3]*p,8,4);c.fill();
      font(c,800,44);c.textAlign='right';c.fillStyle=hot?RED2:INK;c.fillText('×'+Math.round(r[2]*p),w-30,y+60);c.textAlign='left';c.globalAlpha=1});
  });
  sub(c,'каждую неделю — новые находки',420,t,1.8,{size:34,color:INK,w:600});
}
function b_stat(c,t,name,img,stats,tag){
  words(c,[name],-490,110,t,A);
  sub(c,tag,-410,t,A+.3,{size:30});
  card(c,90,-360,900,500,{p:lin(t,A,A+.8),tilt:.03,r:28},(c,w,h)=>{const z=1.02+.05*lin(t,0,3);c.save();c.translate(w/2,h/2);c.scale(z,z);c.translate(-w/2,-h/2);cover(c,IMG[img],0,0,w,h);c.restore()});
  stats.forEach((s,i)=>{const x=90+(i%2)*460,y=180+Math.floor(i/2)*210,t0=.7+i*.16;
    card(c,x,y,440,190,{p:lin(t,t0,t0+.6),r:24,fill:s[5]?'#2a1414':'#17181c'},(c,w,h)=>{
      if(s[5]){c.strokeStyle=RED;c.lineWidth=4;rr(c,2,2,w-4,h-4,22);c.stroke()}
      const v=s[1]*eo5(lin(t,t0+.1,t0+1.2));font(c,900,80,'"Inter Display"');c.fillStyle=s[5]?RED2:INK;c.fillText(s[0]+v.toFixed(s[2])+s[3],30,100);
      font(c,600,26);c.fillStyle=MUTE;c.fillText(s[4],32,150)})});
}
function b_niche(c,t){
  words(c,['ниша: история','в анимации'],-500,84,t,A,{stag:.07});
  const hh=740;card(c,165,-300,750,hh,{p:lin(t,A,A+.8),tilt:-.03,r:24},(c,w,h)=>{
    // slow scroll inside the image (like reading the post)
    const s=w/IMG.hist_table.width,ih=IMG.hist_table.height*s,off=(ih-h)*eio(lin(t,.8,2.8));c.drawImage(IMG.hist_table,0,-off,w,ih)});
  sub(c,'5 каналов · 10 роликов · топ 12M',490,t,1.2,{size:32,color:INK,w:600});
}
function b_checks(c,t,title,items){
  words(c,title,-480,96,t,A);
  items.forEach((it,i)=>{const t0=A+.25+i*.55,y=-300+i*330;
    card(c,60,y,960,290,{p:lin(t,t0,t0+.6),r:28},(c,w,h)=>{
      const q=lin(t,t0+.45,t0+.8);if(q>0){c.fillStyle=`rgba(229,50,45,${.14*eo3(q)})`;c.fillRect(0,0,w*eo3(q),h)}
      c.save();c.translate(50,85);c.scale(1.7,1.7);check(c,0,0,q);c.restore();
      font(c,800,52);c.fillStyle=INK;c.fillText(it[0],160,110);c.fillText(it[1],160,172);
      font(c,500,28);c.fillStyle=MUTE;c.fillText(it[2],162,232)})});
}
function b_fail(c,t){
  words(c,['а вот это —','не работает'],-490,96,t,A,{stag:.08,color:'#ff8a80'});
  card(c,60,-240,960,600,{p:lin(t,A,A+.7),r:28,fill:'#1d1213'},(c,w,h)=>{
    c.strokeStyle='rgba(229,50,45,.6)';c.lineWidth=3;rr(c,1.5,1.5,w-3,h-3,27);c.stroke();
    font(c,700,26,MONO);c.fillStyle=RED2;c.fillText('✕ НЕ РАБОТАЕТ',40,64);
    font(c,800,50);c.fillStyle=INK;const s='«история за 1 минуту»';c.fillText(s,40,160);
    const sw=c.measureText(s).width;c.fillStyle=RED2;c.fillRect(40,142,sw*eo3(lin(t,1,1.4)),6);
    const q=eo5(lin(t,1.1,1.8));font(c,900,150,'"Inter Display"');c.fillStyle=RED2;c.fillText((3+9*q).toFixed(0)+'K',40,360);
    font(c,600,30);c.fillStyle=MUTE;c.fillText('просмотров — максимум',44,420);
    font(c,600,30);c.fillStyle='rgba(255,138,128,.85)';c.globalAlpha=eo3(lin(t,1.6,2));c.fillText('shorts-нарезки — в 100 раз меньше',44,520);c.globalAlpha=1;
  });
  if(t>1&&t<1.25){c.save();c.translate(Math.sin(t*120)*8,0);c.restore()}
}
function b_prompt(c,t){
  words(c,['копируй →','запускай'],-500,96,t,A,{stag:.08});
  const lines=['кадр: стикмен на крыше, ночь, дождь','стиль: 3D, без лица, тёплый свет','сюжет: что, если ты бессмертен?','хук: пуля в первые 3 секунды'];
  const click=2.15;
  card(c,60,-300,960,620,{p:lin(t,A,A+.7),tilt:.03,skew:-.02},(c,w,h)=>{
    dots(c,w,'what_if.prompt');font(c,500,31,MONO);let tt=.55;
    lines.forEach((ln,i)=>{const d=ln.length*.011;const n=Math.floor(cl((t-tt)/d)*ln.length);tt+=d+.05;
      const k=ln.split(':')[0],sh=ln.slice(0,n);c.fillStyle=RED2;c.fillText(sh.slice(0,k.length+1),34,135+i*66);
      c.fillStyle='#e6e1da';c.fillText(sh.slice(k.length+1),34+c.measureText(k+':').width,135+i*66)});
    const done=t>click,pop=done?eback(lin(t,click,click+.35)):1;
    c.save();c.translate(34+150,500);c.scale(pop,pop);const bw=done?340:280;rr(c,-150,-48,bw,96,18);c.fillStyle=done?RED:'#f2efea';c.fill();
    font(c,800,34);c.fillStyle=done?'#fff':'#111';c.textAlign='center';c.fillText(done?'скопировано ✓':'скопировать',-150+bw/2,12);c.restore();
  });
  const cp=eio(lin(t,1.3,2.05));if(t>1.2){cursor(c,mix(900,230,cp),mix(560,215,cp),t>click-.06&&t<click+.14?1:0)}
}
function b_tags(c,t){
  words(c,['учу работать с'],-470,96,t,A);
  const tg=[['Claude','объясняю с нуля',1],['Codex','пишем код',1],['VibeCoding','софт без опыта'],['боты','под ключ']];
  tg.forEach((g,i)=>{const x=60+(i%2)*490,y=-330+Math.floor(i/2)*300,t0=A+.2+i*.28;
    const p=lin(t,t0,t0+.5);if(p<=0)return;const e=eback(p);
    c.save();c.translate(x+235,y+130);c.scale(e,e);c.translate(-235,-130);c.globalAlpha=cl(p*2);
    rr(c,0,0,470,260,36);c.fillStyle=g[2]?'rgba(229,50,45,.16)':'#17181c';c.fill();c.lineWidth=3;c.strokeStyle=g[2]?RED:'rgba(255,255,255,.12)';c.stroke();
    font(c,900,64,'"Inter Display"');c.fillStyle=INK;c.fillText(g[0],36,120);font(c,600,30);c.fillStyle=MUTE;c.fillText(g[1],38,180);c.restore()});
  sub(c,'пишу софт · делаю ботов · учу вас',380,t,1.6,{size:34,color:INK,w:600});
}
function b_free(c,t){
  words(c,['и всё это —'],-250,92,t,.2);
  const p=lin(t,.55,1);if(p>0){const e=eback(p);
    c.save();c.translate(540,40);c.scale(e,e);
    const hw=eo3(lin(t,.7,1.1));c.save();c.transform(1,0,-.18,1,0,0);c.fillStyle=RED;c.fillRect(-470,-120,940*hw,170);c.restore();
    bigNum(c,'БЕСПЛАТНО',0,10,150,'#fff');c.restore()}
  sub(c,'для любого желающего',230,t,1.1,{size:40,color:INK,w:600});
}
function b_poll(c,t){
  const opts=[['Да, хочу участвовать',94,31],['Сначала узнать условия',6,2],['Пока слежу за каналом',0,0]];
  card(c,60,-520,960,820,{p:lin(t,A,A+.7),tilt:-.03,skew:.02},(c,w,h)=>{
    c.fillStyle=RED;c.fillRect(30,40,6,90);font(c,700,28);c.fillStyle=RED2;c.fillText('РОЗЫГРЫШ',56,66);
    font(c,500,26);c.fillStyle=DIM;c.fillText('месяц AI-подписки — за мой счёт',56,108);
    font(c,800,44);c.fillStyle=INK;c.fillText('Хотите участвовать в розыгрыше',30,205);c.fillText('месячной AI-подписки?',30,260);
    font(c,500,26);c.fillStyle=DIM;c.fillText('Анонимный опрос',30,306);
    opts.forEach((o,i)=>{const y=370+i*128,p=eo5(lin(t,.6+i*.15,1.8+i*.15));
      font(c,800,38);c.fillStyle=i?MUTE:INK;c.textAlign='right';c.fillText(Math.round(o[1]*p)+'%',130,y+40);c.textAlign='left';
      font(c,600,34);c.fillStyle=INK;c.fillText(o[0],160,y+40);font(c,600,28);c.fillStyle=MUTE;c.textAlign='right';c.fillText(Math.round(o[2]*p),w-30,y+40);c.textAlign='left';
      c.fillStyle='rgba(255,255,255,.08)';rr(c,160,y+68,w-190,12,6);c.fill();c.fillStyle=i?'#8a8580':RED;rr(c,160,y+68,Math.max(12,(w-190)*o[1]/100*p),12,6);c.fill()});
    font(c,600,30);c.fillStyle=MUTE;c.textAlign='center';c.fillText(Math.round(33*eo5(lin(t,.6,1.8)))+' голоса',w/2,h-40);c.textAlign='left';
  });
  sub(c,'условия и дата — в канале',420,t,1.6,{size:36,color:INK,w:700});
}
function b_logo(c,t){
  for(let i=0;i<3;i++){if(t<.4)break;const p=((t-.4)*.5+i/3)%1;c.beginPath();c.arc(540,-280,170+p*330,0,7);c.lineWidth=3;c.strokeStyle=`rgba(229,50,45,${.5*(1-p)})`;c.stroke()}
  const p=lin(t,.15,.9);if(p>0){const e=eback(p);c.save();c.globalAlpha=cl(p*2);c.translate(540,-280);c.scale(e,e);c.translate(-540,280);logo(c,540,-280,160,.6+.4*Math.sin(t*3));c.restore()}
  const a=eo3(lin(t,.7,1.2));c.save();c.globalAlpha=a;font(c,900,84,'"Inter Display"');c.fillStyle=INK;c.textAlign='center';c.fillText('Apex Analytics',540,20+(1-a)*20);c.restore();
  ['разборы вирусных каналов','готовые промпты для видео','Claude, Codex и вайбкодинг'].forEach((s,i)=>{const q=eo3(lin(t,1+i*.2,1.5+i*.2));if(!q)return;
    c.save();c.globalAlpha=q;font(c,600,38);c.fillStyle=MUTE;c.textAlign='center';c.fillText(s,540+(1-q)*40,140+i*66);c.restore()});
}
function b_cta(c,t){
  words(c,['подписывайся'],-330,110,t,A);
  const p=lin(t,.5,1);if(p>0){const e=eback(p),press=t>1.35&&t<1.55?.94:1;
    c.save();c.translate(540,-110);c.scale(e*press,e*press);
    const pulse=(t*.8)%1;if(t>1.5){rr(c,-410-30*pulse,-75-30*pulse,820+60*pulse,150+60*pulse,(75+30*pulse));c.lineWidth=4;c.strokeStyle=`rgba(229,50,45,${.7*(1-pulse)})`;c.stroke()}
    c.shadowColor='rgba(229,50,45,.6)';c.shadowBlur=50;rr(c,-410,-75,820,150,75);c.fillStyle=RED;c.fill();c.shadowBlur=0;
    font(c,800,46);c.fillStyle='#fff';c.textAlign='center';c.fillText('Apex Analytics · Telegram',0,16);c.restore()}
  if(t>.9&&t<2.2){const q=eio(lin(t,.9,1.4));cursor(c,mix(860,560,q),mix(300,-100,q),t>1.35&&t<1.55?1:0)}
  const q=eo3(lin(t,1.5,2));if(q){c.save();c.globalAlpha=q;font(c,700,44);c.fillStyle=INK;c.textAlign='center';c.fillText('ссылка в описании',540,170);
    font(c,700,90);c.fillStyle=RED2;c.fillText('↓',540,300+Math.abs(Math.sin(t*4))*30);c.restore()}
}

// ---------- background: parallax grid + track ----------
function bg2(c,t,cam,hue){
  c.fillStyle='#0b0b0d';c.fillRect(0,0,W,H);
  const gx=W/2+Math.sin(t*.3)*160,gy=420+Math.cos(t*.23)*120;
  let g=c.createRadialGradient(gx,gy,0,gx,gy,1150);g.addColorStop(0,hue);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,W,H);
  // parallax dot grid (moves at 0.45 speed)
  const off=(cam*.45)%120;c.fillStyle='rgba(255,255,255,.07)';
  for(let y=-off;y<H+120;y+=120)for(let x=60;x<W;x+=120)c.fillRect(x-2,y-2,4,4);
  g=c.createRadialGradient(W/2,H/2,520,W/2,H/2,1250);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.78)');c.fillStyle=g;c.fillRect(0,0,W,H);
}
function track(c,cam){
  const sy=y=>y-cam+H/2;
  const y0=sy(BEATS[0].y-GAP),y1=sy(BEATS.at(-1).y);
  c.save();c.setLineDash([6,14]);c.lineWidth=3;c.strokeStyle='rgba(255,255,255,.16)';c.beginPath();c.moveTo(W/2,Math.max(-10,y0));c.lineTo(W/2,Math.min(H+10,y1));c.stroke();c.setLineDash([]);
  // red progress to the screen centre
  const g=c.createLinearGradient(0,H/2-900,0,H/2);g.addColorStop(0,'rgba(229,50,45,0)');g.addColorStop(1,'rgba(229,50,45,.9)');
  c.strokeStyle=g;c.lineWidth=4;c.beginPath();c.moveTo(W/2,Math.max(-10,y0));c.lineTo(W/2,H/2);c.stroke();
  BEATS.forEach((b,i)=>{const y=sy(b.y-GAP/2);if(y<-60||y>H+60)return;const on=cam>=b.y-GAP/2;
    c.beginPath();c.arc(W/2,y,on?13:9,0,7);c.fillStyle=on?RED:'#2a2b30';c.fill();c.lineWidth=3;c.strokeStyle=on?'rgba(255,255,255,.8)':'rgba(255,255,255,.25)';c.stroke();
    font(c,600,20,MONO);c.fillStyle=on?'rgba(255,255,255,.7)':DIM;c.fillText(String(i+1).padStart(2,'0'),W/2+26,y+7)});
  c.restore();
}
const HUES={'INTRO':'rgba(70,52,40,.55)','ШАГ 01 / 04':'rgba(60,48,42,.55)','ШАГ 02 / 04':'rgba(52,46,52,.6)','ШАГ 03 / 04':'rgba(66,46,40,.55)','ШАГ 04 / 04':'rgba(74,40,38,.6)','OUTRO':'rgba(84,34,30,.62)'};
function hud2(c,t,bi){
  const tag=BEATS[bi][1];c.save();font(c,600,20,MONO);c.fillStyle='rgba(255,255,255,.45)';
  const sec=Object.keys(HUES).indexOf(tag);
  c.textAlign='left';c.fillText(`APEX // MOTION_${String(sec).padStart(2,'0')}`,46,70);
  const s=Math.floor(t),f=Math.floor((t-s)*60);c.textAlign='right';c.fillText(`00:${String(s).padStart(2,'0')}:${String(f).padStart(2,'0')}`,W-46,70);
  c.textAlign='left';c.fillText(tag,46,1792);c.textAlign='right';c.fillText(`КАДР ${String(bi+1).padStart(2,'0')} / ${BEATS.length}`,W-46,1792);
  c.fillStyle='rgba(255,255,255,.12)';c.fillRect(46,1812,W-92,3);c.fillStyle=tag==='OUTRO'?RED:'rgba(255,255,255,.7)';c.fillRect(46,1812,(W-92)*t/TOTAL,3);
  for(let i=0;i<=120;i++){const x=46+(W-92)*i/120;c.fillStyle='rgba(255,255,255,.18)';c.fillRect(x,1838,2,i%10?8:16)}
  c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=3;
  [[30,30,1,1],[W-30,30,-1,1],[30,H-30,1,-1],[W-30,H-30,-1,-1]].forEach(([x,y,dx,dy])=>{c.beginPath();c.moveTo(x,y+dy*34);c.lineTo(x,y);c.lineTo(x+dx*34,y);c.stroke()});
  c.restore();
}
const M=document.createElement('canvas');M.width=W;M.height=H;const MC=M.getContext('2d');
function drawWorld(c,t,cam){
  c.clearRect(0,0,W,H);
  track(c,cam);
  BEATS.forEach((b,i)=>{const sy=b.y-cam+H/2;if(Math.abs(sy-H/2)>1700)return;
    const d=(sy-H/2)/H;c.save();c.translate(540,sy);const s=1-Math.min(.14,Math.abs(d)*.16);c.scale(s,s);c.transform(1,d*.09,0,1,0,0);
    c.globalAlpha=cl(1-Math.max(0,Math.abs(d)-.22)*1.3);c.translate(-540,0);b[2](c,t-b.s);c.restore()});
}
function render2(t){
  const bi=beatAt(t),b=BEATS[bi],cam=camY(t);
  const v=(camY(t+1/120)-camY(t-1/120))*60/60; // px per frame @60
  bg2(X,t,cam,HUES[b[1]]);
  const n=Math.min(7,Math.ceil(Math.abs(v)/10));
  if(n>1){MC.clearRect(0,0,W,H);for(let k=0;k<n;k++){const dy=(k/(n-1)-.5)*v*1.2;drawWorld(S,t,cam+dy);MC.globalAlpha=1/(k+1);MC.drawImage(L,0,0)}MC.globalAlpha=1}
  else{drawWorld(S,t,cam);MC.clearRect(0,0,W,H);MC.drawImage(L,0,0)}
  const z=1-Math.min(.07,Math.abs(v)*.0011)+(b[3]?.05*(1-eo3(lin(t,b.s+.45,b.s+1.1)))*(t>b.s+.45?1:0):0);
  X.save();X.translate(W/2,H/2);X.rotate(cl(v*.00012,-.012,.012));X.scale(z,z);X.translate(-W/2,-H/2);X.drawImage(M,0,0);X.restore();
  if(b[3]&&t>b.s+.45&&t<b.s+.6){X.fillStyle=`rgba(255,255,255,${.08*(1-(t-b.s-.45)/.15)})`;X.fillRect(0,0,W,H)}
  if(t>TOTAL-.5){X.fillStyle=`rgba(0,0,0,${lin(t,TOTAL-.5,TOTAL)})`;X.fillRect(0,0,W,H)}
  hud2(X,t,bi);
  X.save();X.globalAlpha=.07;X.globalCompositeOperation='overlay';X.drawImage(grains[Math.floor(t*24)%6],0,0,W,H);X.restore();
}
window.render=render2;window.TOTAL=TOTAL;
// ---------- sfx ----------
EVENTS.length=0;
const E=(i,lt,ty,g=1)=>ev(BEATS[i].s+lt,ty,g);
BEATS.forEach((b,i)=>{E(i,-.12,'whoosh',i?1:.7);if(b[3]){E(i,.45,'hit',.9)}else E(i,.5,'tick',.5)});
E(0,.5,'swell',.6);E(0,2.2,'ding');E(1,.4,'pop',.6);E(2,2.2,'ding',.7);
for(let k=0;k<14;k++)E(4,.6+k*.045,'key',.45);[1.35,1.57,1.79].forEach(x=>E(4,x,'tick'));E(4,2.1,'ding',.7);
[5,6].forEach(i=>[.7,.86,1.02,1.18].forEach(x=>E(i,x,'pop',.5)));
[9,10].forEach(i=>[0,1].forEach(k=>E(i,A+.25+k*.55+.45,'click',.8)));
E(11,1,'error',1.2);E(11,1.1,'hit',.5);
for(let k=0;k<45;k++)E(13,.55+k*.03,'key',.35);E(13,2.15,'click');E(13,2.2,'ding',.8);
[0,1,2,3].forEach(k=>E(14,A+.2+k*.28,'pop',.7));
E(15,.55,'boom',.6);E(17,.6,'swell',.5);E(17,1.9,'ding');E(18,.15,'boom');E(19,1.4,'click');E(19,1.5,'ding',.8);
window.ready=window.ready.then(()=>{render2(0);return true});
