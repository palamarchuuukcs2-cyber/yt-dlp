const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('console',m=>console.log('console',m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+path.resolve('film.html'));await p.evaluate(()=>window.ready);
const ts=process.argv.slice(2).map(Number);fs.mkdirSync('stills',{recursive:true});
for(const t of ts){await p.evaluate(t=>render(t),t);await p.screenshot({path:`stills/${t}.png`});}
await b.close()})();
