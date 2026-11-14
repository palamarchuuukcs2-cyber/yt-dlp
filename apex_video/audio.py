import numpy as np, json, wave
SR=48000; DUR=55.0; N=int(SR*DUR); rng=np.random.default_rng(7)
t=np.arange(N)/SR
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR); y=np.empty_like(x); s=0.0
    # vectorised-ish one-pole via scipy-free loop in chunks
    from itertools import accumulate
    y=np.array(list(accumulate(x*(1-a),lambda p,v:p*a+v)))
    return y
def saw(f,tt): return 2*((tt*f)%1)-1
BPM=96; beat=60/BPM; bar=4*beat
mus=np.zeros(N); 
chords=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]  # Am F C G
mf=lambda m:440*2**((m-69)/12)
pad=np.zeros(N)
for ci in range(int(DUR/(2*bar))+1):
    a=int(ci*2*bar*SR); b=min(N,int((ci+1)*2*bar*SR));
    if a>=N: break
    tt=t[a:b]-t[a]; env=np.minimum(1,tt/1.2)*np.minimum(1,(t[b-1]-t[a]-tt+0.05)/0.6)
    ch=chords[ci%4]; seg=np.zeros(b-a)
    for m in ch:
        for d in (-0.08,0.08): seg+=saw(mf(m-12)*2**(d/12),tt)
    seg+=0.8*np.sin(2*np.pi*mf(ch[0]-24)*tt)*4  # sub
    pad[a:b]+=seg*env
pad=lp(pad,900)*0.05
# kick
kick=np.zeros(N); kt=np.arange(int(.35*SR))/SR
ks=np.sin(2*np.pi*(45*kt+60*(1-np.exp(-kt*30))/30*1))*np.exp(-kt*9)
k=7.2
while k<DUR-1.5:
    if not(47.4<k<49.0):
        i=int(k*SR); kick[i:i+len(ks)]+=ks[:N-i]
    k+=beat
hat=np.zeros(N); hs=rng.standard_normal(int(.05*SR))*np.exp(-np.arange(int(.05*SR))/SR*90); hs=hs-lp(hs,6000)
h=18.6
while h<DUR-1.5:
    if not(47.4<h<49.0):
        i=int(h*SR+beat/2*SR); 
        if i+len(hs)<N: hat[i:i+len(hs)]+=hs*0.35
    h+=beat/2
# riser before outro
ri=np.zeros(N); a,b=int(46.6*SR),int(49.0*SR); rt=np.arange(b-a)/SR
nz=rng.standard_normal(b-a); ri[a:b]=(nz-lp(nz,2000))*(rt/rt[-1])**2*0.25
mus=pad+kick*0.55+hat+ri
# fade in/out
mus*=np.minimum(1,t/1.0)*np.minimum(1,(DUR-t)/2.5)
# sfx
sfx=np.zeros(N)
def add(x,at,g):
    i=int(at*SR); 
    if i<0:x=x[-i:];i=0
    n=min(len(x),N-i); sfx[i:i+n]+=x[:n]*g
def env(d,dec): tt=np.arange(int(d*SR))/SR; return tt,np.exp(-tt*dec)
for e in json.load(open('events.json')):
    ty,g,at=e['type'],e['g'],e['t']
    if ty=='whoosh':
        d=.5; n=rng.standard_normal(int(d*SR)); tt=np.arange(len(n))/SR
        w=np.sin(np.pi*tt/d)**2; x=(lp(n,2500)-lp(n,300))*w; add(x*1.2,at-.1,g*.6)
    elif ty=='hit':
        tt,en=env(.6,6); add(np.sin(2*np.pi*(55*tt+40*(1-np.exp(-tt*20))/20))*en,at,g*.6)
    elif ty=='boom':
        tt,en=env(2.5,1.6); add(np.sin(2*np.pi*(40*tt+80*(1-np.exp(-tt*10))/10))*en,at,g*.9)
        n=rng.standard_normal(len(tt)); add(lp(n,300)*en*.5,at,g)
    elif ty=='tick':
        tt,en=env(.06,80); add(np.sin(2*np.pi*2400*tt)*en,at,g*.25)
    elif ty=='key':
        tt,en=env(.03,200); n=rng.standard_normal(len(tt)); add((n-lp(n,3000))*en,at+rng.uniform(-.01,.01),g*.18)
    elif ty=='click':
        tt,en=env(.05,120); add(np.sin(2*np.pi*1800*tt)*en,at,g*.4)
    elif ty=='pop':
        tt,en=env(.12,35); add(np.sin(2*np.pi*(500*tt+600*tt))*en,at,g*.25)
    elif ty=='ding':
        tt,en=env(1.2,4); add((np.sin(2*np.pi*1318*tt)+.5*np.sin(2*np.pi*1975*tt))*en,at,g*.18)
    elif ty=='error':
        tt,en=env(.35,9); add(np.sign(np.sin(2*np.pi*140*tt))*en,at,g*.12)
    elif ty=='swell':
        d=1.6; tt=np.arange(int(d*SR))/SR; w=np.sin(np.pi*tt/d)**2
        add(sum(np.sin(2*np.pi*mf(m)*tt) for m in (69,72,76))*w,at,g*.06)
mix=mus+sfx
st=np.stack([mix*(1+.15*np.sin(t*.7)),mix*(1-.15*np.sin(t*.7))],1)
st/=np.max(np.abs(st))*1.05
with wave.open('mix_raw.wav','wb') as f:
    f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((st*32767).astype('<i2').tobytes())
print('ok')
