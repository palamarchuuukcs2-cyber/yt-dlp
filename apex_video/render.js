const {chromium}=require('playwright');const path=require('path');const fs=require('fs');const {spawn}=require('child_process');
const FPS=+process.argv[2]||60,DUR=54;
(async()=>{const b=await chromium.launch({args:['--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+path.resolve('film.html'));await p.evaluate(()=>window.ready);
fs.writeFileSync('events.json',JSON.stringify(await p.evaluate(()=>EVENTS)));
const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p','video.mp4'],{stdio:['pipe','inherit','inherit']});
const N=FPS*DUR,t0=Date.now();
for(let i=0;i<N;i++){const d=await p.evaluate(t=>{render(t);return document.getElementById('c').toDataURL('image/jpeg',.94).slice(23)},i/FPS);
 if(!ff.stdin.write(Buffer.from(d,'base64')))await new Promise(r=>ff.stdin.once('drain',r));
 if(i%600===0)console.log(i,((Date.now()-t0)/1000).toFixed(0)+'s');}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done',(Date.now()-t0)/1000)})();
