import numpy as np, json, wave
from itertools import accumulate
SR=48000; TL=json.load(open('timeline.json')); D=TL['total']; N=int(SR*D); t=np.arange(N)/SR; rng=np.random.default_rng(3)
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR); return np.array(list(accumulate(x*(1-a),lambda p,v:p*a+v)))
mf=lambda m:440*2**((m-69)/12)
# soft music-box / strings bed in D minor, 80 bpm
beat=60/80; mus=np.zeros(N)
chords=[[50,53,57],[46,50,53],[48,52,55],[45,49,52]]
for ci in range(int(D/(4*beat))+1):
    a=int(ci*4*beat*SR); b=min(N,int((ci+1)*4*beat*SR))
    if a>=N:break
    tt=t[a:b]-t[a]; env=np.minimum(1,tt/.8)*np.minimum(1,(tt[-1]-tt+.05)/.5); seg=np.zeros(b-a)
    for m in chords[ci%4]:
        for d in(-.07,.07): seg+=np.sin(2*np.pi*mf(m)*2**(d/12)*tt)+.3*np.sin(2*np.pi*mf(m)*2*tt)
    seg+=1.5*np.sin(2*np.pi*mf(chords[ci%4][0]-12)*tt)
    mus[a:b]+=seg*env
# plucked arpeggio
for k in range(int(D/(beat/2))):
    at=k*beat/2; m=chords[int(at/(4*beat))%4][k%3]+12+(12 if k%4==3 else 0)
    i=int(at*SR); n=min(int(.8*SR),N-i); tt=np.arange(n)/SR
    mus[i:i+n]+=.5*np.sin(2*np.pi*mf(m)*tt)*np.exp(-tt*5)
mus=mus*0.04*np.minimum(1,t/1.5)*np.minimum(1,(D-t)/1.5)
sfx=np.zeros(N)
def add(x,at,g):
    i=max(0,int(at*SR)); n=min(len(x),N-i); sfx[i:i+n]+=x[:n]*g
WHIP={1,4,7,10}
for i,s in enumerate(TL['scenes']):
    if i==0:continue
    if i in WHIP:
        d=.4; n=rng.standard_normal(int(d*SR)); tt=np.arange(len(n))/SR; add((lp(n,3000)-lp(n,400))*np.sin(np.pi*tt/d)**2,s['t0']-.22,.5)
    else:
        tt=np.arange(int(.3*SR))/SR; add(np.sin(2*np.pi*(60*tt))*np.exp(-tt*14),s['t0'],.35)
for st in TL['stickers']+TL['nums']:
    tt=np.arange(int(.25*SR))/SR; add(np.sin(2*np.pi*(700*tt+900*tt*tt))*np.exp(-tt*18),st['t'],.22)
    tt=np.arange(int(.05*SR))/SR; n=rng.standard_normal(len(tt)); add(n*np.exp(-tt*90),st['t'],.15)
w=wave.open('vo.wav'); vo=np.frombuffer(w.readframes(w.getnframes()),'<i2').astype(float)/32768; vo=np.pad(vo,(0,max(0,N-len(vo))))[:N]
# duck music under voice
env=lp(np.abs(vo),8); duck=1-.45*np.clip(env*12,0,1)
mix=vo*1.0+mus*duck+sfx
mix/=np.max(np.abs(mix))*1.05
w=wave.open('mix_raw.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype('<i2').tobytes());w.close();print('ok')
