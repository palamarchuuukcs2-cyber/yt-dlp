import json, re, subprocess, numpy as np, wave
SR=48000; LEAD=0.25; GAP=0.08; TAIL=0.7
lines=open('vo/lines.txt',encoding='utf-8').read().strip().split('\n')
def dur(f): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
def rd(f):
    w=wave.open(f);a=np.frombuffer(w.readframes(w.getnframes()),'<i2').astype(np.float32)/32768
    if w.getnchannels()==2:a=a.reshape(-1,2).mean(1)
    return a
t=LEAD; out=np.zeros(int(SR*LEAD)); L=[]; words=[]
for i,ln in enumerate(lines,1):
    a=rd(f'vo/t{i}.wav'); d=len(a)/SR
    L.append({'t0':t,'t1':t+d,'text':ln})
    ws=[w for w in ln.split() if re.search(r'\w',w)]
    wt=[len(re.findall('[аеёиоуыэюяАЕЁИОУЫЭЮЯ]',w))+0.7+(0.9 if re.search(r'[,:—?.]$',w) else 0) for w in ws]
    # dash tokens are separate words in text; they're skipped (no \w), add pause to previous
    toks=ln.split();k=0
    for j,tk in enumerate(toks):
        if not re.search(r'\w',tk) and k>0: wt[k-1]+=0.9
        elif re.search(r'\w',tk): k+=1
    s=sum(wt);c=t
    for w,x in zip(ws,wt):
        dd=d*x/s; words.append({'w':re.sub(r'[^\w-]','',w).lower(),'t0':round(c,3),'t1':round(c+dd,3),'line':i}); c+=dd
    out=np.concatenate([out,a,np.zeros(int(SR*GAP))]); t+=d+GAP
out=np.concatenate([out,np.zeros(int(SR*TAIL))]); total=len(out)/SR
w=wave.open('vo.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(out,-1,1)*32767).astype('<i2').tobytes());w.close()
def at(line,stem):
    for x in words:
        if x['line']==line and x['w'].startswith(stem): return x['t0']
    raise SystemExit('no '+stem)
scenes=[{'img':f'px{i:02d}','t0':0 if i==1 else L[i-1]['t0']-0.05} for i in range(1,13)]
for i,s in enumerate(scenes): s['t1']=scenes[i+1]['t0'] if i<11 else total
stickers=[{'k':'angel','t':at(2,'ангел')},{'k':'money','t':at(3,'стоил')},{'k':'medal','t':at(10,'наградил')},{'k':'mug','t':at(11,'бесплатно')}]
nums=[{'txt':'120 м','t':at(1,'метров')},{'txt':'1829','t':at(2,'девят')},{'txt':'6 недель','t':at(9,'шесть')}]
json.dump({'total':total,'scenes':scenes,'words':words,'stickers':stickers,'nums':nums},open('timeline.json','w'),ensure_ascii=False,indent=0)
open('timeline.js','w').write('window.TLDATA='+open('timeline.json').read()+';')
print('total',round(total,2),'words',len(words))
