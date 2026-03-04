
'use strict';

/* ═══════════════════════════════════════════════════
   AUDIO ENGINE - Layered synth with spatial panning & ambient loops
   ═══════════════════════════════════════════════════ */
const AC=window.AudioContext||window.webkitAudioContext;let ac,masterGain,reverbNode;
function ia(){if(!ac){ac=new AC();masterGain=ac.createGain();masterGain.gain.value=gameSettings.masterVol||0.6;masterGain.connect(ac.destination);createReverb();startMusic()}
else if(masterGain){masterGain.gain.value=gameSettings.masterVol||0.6}}
function createReverb(){reverbNode=ac.createConvolver();const len=ac.sampleRate*1.2,buf=ac.createBuffer(2,len,ac.sampleRate);
for(let ch=0;ch<2;ch++){const d=buf.getChannelData(ch);for(let i=0;i<len;i++){d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.2)}}
reverbNode.buffer=buf;const wet=ac.createGain();wet.gain.value=0.18;reverbNode.connect(wet);wet.connect(masterGain)}
function sfx(t,vol,sx){ia();if(!ac)return;
// v7.0 Haptic feedback on mobile for key events
if(isMobile){if(t==='hurt')haptic(40);else if(t==='kill'||t==='crit')haptic(15);else if(t==='dash')haptic(25)}
const n=ac.currentTime,g=ac.createGain(),o=ac.createOscillator(),dry=ac.createGain();
dry.gain.value=1;o.connect(dry);dry.connect(g);
// Spatial panning
let dest=masterGain;
if(sx!==undefined&&ac.createStereoPanner){const pan=ac.createStereoPanner();pan.pan.value=Math.max(-1,Math.min(1,(sx-P.x)/300));g.connect(pan);pan.connect(masterGain);dest=null}else{g.connect(masterGain)}
if(dest)g.connect(dest);
if(reverbNode){const send=ac.createGain();send.gain.value=0.25;dry.connect(send);send.connect(reverbNode)}
const S={hit:[300,80,.05,'square',.06],kill:[220,40,.065,'sawtooth',.15],hurt:[100,30,.08,'square',.12],atk:[500,150,.035,'triangle',.05],
lvl:[400,1200,.05,'sine',.22],door:[250,500,.03,'triangle',.1],stair:[300,1000,.04,'sine',.3],xp:[600,1200,.02,'sine',.06],
coin:[900,1300,.018,'sine',.04],dash:[400,100,.035,'square',.07],chest:[500,900,.04,'sine',.15],buy:[600,1000,.03,'sine',.1],
bow:[600,200,.03,'sawtooth',.06],crit:[700,200,.05,'sawtooth',.08],ability:[200,600,.055,'sine',.25],
streak:[500,1500,.04,'sine',.22],combo:[800,1600,.02,'sine',.05],trap:[150,50,.06,'square',.07],
smash:[200,50,.06,'square',.09],elite:[600,300,.035,'sine',.1],slowmo:[100,300,.03,'sine',.25],
boss_intro:[80,400,.055,'sine',.5],warn:[200,400,.025,'sine',.08],parry:[800,400,.04,'triangle',.08],
charge:[100,800,.03,'sine',.4],special:[300,900,.045,'sawtooth',.2],shield:[500,300,.025,'sine',.06],
poison:[200,150,.03,'square',.05],freeze:[800,1200,.03,'sine',.1],bleed:[300,100,.04,'square',.05],
secret:[400,1000,.035,'sine',.3],mimic:[200,600,.05,'square',.15],
forge:[120,400,.06,'sawtooth',.3],lore:[500,800,.03,'sine',.2],classup:[300,1200,.04,'sine',.3],
ghost:[200,500,.02,'sine',.25],synergy:[400,1600,.045,'sine',.35],
shatter:[900,200,.07,'square',.08],toxic_exp:[150,500,.06,'sawtooth',.12],
relic:[300,1200,.05,'sine',.4],wave:[250,600,.04,'sine',.2],
combo_finish:[400,800,.04,'triangle',.1],multikill:[600,1400,.04,'sine',.2],
// v6 new SFX
stagger:[900,200,.07,'square',.08],swarmer_buzz:[1200,800,.015,'sawtooth',.03],
shaman_chant:[180,350,.025,'sine',.3],knight_charge:[80,200,.05,'square',.15],
event_ambient:[300,600,.02,'sine',.35],boss_phase:[120,600,.06,'sine',.4],
arena_hazard:[250,150,.03,'square',.08],reflect:[1000,500,.03,'triangle',.06],
fortify:[200,800,.04,'sine',.25],revive:[300,1200,.05,'sine',.45],
// v6.0 new SFX
execute:[60,30,.07,'square',.1],perfect_dodge:[600,1200,.03,'triangle',.1],
temporal:[200,800,.04,'sine',.3],combo_boom:[100,400,.06,'sawtooth',.2],
mimic_roar:[100,300,.05,'square',.12],boss_death:[80,600,.06,'sine',.6]};
const s=S[t];if(!s)return;const v=vol||1;
// v6.0 Combo pitch scaling — hits rise in pitch with combo
const comboPitch=t==='hit'||t==='crit'?1+Math.min(0.5,cmb*0.02):1;
const pitchVar=(0.95+Math.random()*0.1)*comboPitch;
o.type=s[3];o.frequency.setValueAtTime(s[0]*pitchVar,n);o.frequency.exponentialRampToValueAtTime(Math.max(20,s[1]*pitchVar),n+s[4]);
g.gain.setValueAtTime(s[2]*v,n);g.gain.exponentialRampToValueAtTime(.001,n+s[4]+.02);o.start(n);o.stop(n+s[4]+.04)}

// Layered SFX for critical sounds (2-3 oscillators)
function sfxL(t,sx){ia();if(!ac)return;const n=ac.currentTime;
const defs={hit:[[300,80,.04,'square',.06],[180,60,.03,'sine',.04]],
kill:[[220,40,.05,'sawtooth',.15],[800,1400,.025,'sine',.08]],
crit:[[700,200,.045,'sawtooth',.08],[1200,600,.03,'triangle',.06],[400,100,.025,'square',.04]],
boss_atk:[[100,50,.05,'sine',.15],[300,100,.035,'sawtooth',.1]]};
const layers=defs[t];if(!layers){sfx(t,1,sx);return}
for(const s of layers){const g=ac.createGain(),o=ac.createOscillator();o.connect(g);
if(sx!==undefined&&ac.createStereoPanner){const pan=ac.createStereoPanner();pan.pan.value=Math.max(-1,Math.min(1,(sx-P.x)/300));g.connect(pan);pan.connect(masterGain)}else g.connect(masterGain);
const pv=0.95+Math.random()*0.1;o.type=s[3];o.frequency.setValueAtTime(s[0]*pv,n);o.frequency.exponentialRampToValueAtTime(Math.max(20,s[1]*pv),n+s[4]);
g.gain.setValueAtTime(s[2],n);g.gain.exponentialRampToValueAtTime(.001,n+s[4]+.02);o.start(n);o.stop(n+s[4]+.04)}}

/* ═══════════════════════════════════════════════════
   PROCEDURAL MUSIC ENGINE v2.0 — Dynamic layered composition
   Chord progressions + arpeggiator + bass + synthesized drums
   ═══════════════════════════════════════════════════ */
const MUS={bpm:80,step:0,bar:0,nextT:0,schedId:null,intensity:0,tgtInt:0,biome:0,isBoss:false,active:false,
padOscs:[],padGains:[],subOsc:null,subGain:null,layerG:{},
// Biome music configs: root(Hz), BPM, pad waveform, chord progression (semitone offsets from root), arp step pattern, arp octave multiplier
configs:[
{root:110,bpm:75,pw:'sine',prg:[[0,3,7],[5,8,12],[3,7,10],[7,10,14]],arp:[0,4,8,12],ao:2},// Crypt: A aeolian, slow, haunting
{root:110,bpm:88,pw:'triangle',prg:[[0,3,7],[2,5,9],[5,8,12],[7,10,14]],arp:[0,2,4,6,8,10,12,14],ao:2},// Fungal: A dorian, organic
{root:98,bpm:105,pw:'sawtooth',prg:[[0,3,7],[1,4,8],[5,8,12],[7,10,13]],arp:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],ao:1},// Infernal: G phrygian, aggressive
{root:116.5,bpm:78,pw:'sine',prg:[[0,4,7],[2,6,9],[4,7,11],[7,11,14]],arp:[0,4,8,12],ao:3},// Frozen: Bb lydian, crystalline
{root:92.5,bpm:92,pw:'sine',prg:[[0,3,6],[1,5,8],[3,6,10],[5,8,12]],arp:[0,2,6,8,12,14],ao:2}],// Void: Ab locrian, alien
// Boss chord modifiers per biome — darker, more dissonant variants
bossChords:[
[[0,3,6],[5,8,11],[3,6,10],[6,10,13]],// Crypt boss: diminished feel
[[0,3,6],[1,4,8],[5,8,11],[7,10,13]],// Fungal boss
[[0,1,7],[1,4,7],[5,8,11],[6,10,13]],// Infernal boss
[[0,3,7],[1,4,8],[3,6,10],[7,10,13]],// Frozen boss
[[0,1,6],[1,5,6],[3,6,8],[5,6,10]]],// Void boss: maximally dissonant
// Drum patterns (16 steps): K=kick S=snare H=hihat O=open-hat T=tom .=rest
drums:{
explore:'................',
alert:  'H...H...H...H...',
combat: 'K..HK.SHK..HK.SH',
boss:   'K.KHS.SHK.KHK.SO',
intense:'KKSHK.SHKKSHKTSH'}};
function _nf(root,semi){return root*Math.pow(2,semi/12)}
function startMusic(){if(MUS.active||!ac)return;MUS.active=true;
['pad','arp','bass','drum'].forEach(k=>{const g=ac.createGain();g.gain.value=0;g.connect(masterGain);MUS.layerG[k]=g});
// 3-voice chord pad with gentle detune for richness
for(let i=0;i<3;i++){const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=110;
o.detune.value=(i-1)*6;// slight detune for chorus effect
g.gain.value=0.018;o.connect(g);g.connect(MUS.layerG.pad);o.start();MUS.padOscs.push(o);MUS.padGains.push(g)}
// Sub bass oscillator
const sub=ac.createOscillator(),sg=ac.createGain();sub.type='sine';sub.frequency.value=55;sg.gain.value=0.04;
sub.connect(sg);sg.connect(MUS.layerG.bass);sub.start();MUS.subOsc=sub;MUS.subGain=sg;
// LFO for pad vibrato
const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=0.1;lg.gain.value=3;lfo.connect(lg);
lg.connect(MUS.padOscs[0].frequency);lfo.start();
MUS.nextT=ac.currentTime+0.1;MUS.schedId=setInterval(_musSched,25)}
function _musSched(){if(!ac||audioMuted)return;
while(MUS.nextT<ac.currentTime+0.12){_musStep(MUS.step,MUS.nextT);MUS.nextT+=60/MUS.bpm/4;
MUS.step=(MUS.step+1)%16;if(MUS.step===0)MUS.bar=(MUS.bar+1)%4}
MUS.intensity+=(MUS.tgtInt-MUS.intensity)*0.015;
const n=ac.currentTime,v=MUS.intensity;
MUS.layerG.pad.gain.linearRampToValueAtTime(.12+v*.06,n+.15);
MUS.layerG.arp.gain.linearRampToValueAtTime(v>.15?.05+v*.05:0,n+.15);
MUS.layerG.bass.gain.linearRampToValueAtTime(v>.3?.06+v*.06:0,n+.15);
MUS.layerG.drum.gain.linearRampToValueAtTime(v>.45?.03+(v-.45)*.1:0,n+.15)}
function _musStep(step,t){const cfg=MUS.configs[MUS.biome],prg=MUS.isBoss?MUS.bossChords[MUS.biome]:cfg.prg;
const ch=prg[MUS.bar%prg.length],r=cfg.root,v=MUS.intensity;
// Pad: smoothly update chord on each bar
if(step===0){for(let i=0;i<3;i++){MUS.padOscs[i].frequency.linearRampToValueAtTime(_nf(r*0.5,ch[i]),t+0.4);MUS.padOscs[i].type=cfg.pw}
if(MUS.subOsc)MUS.subOsc.frequency.linearRampToValueAtTime(_nf(r*0.5,ch[0]),t+0.2)}
// Arpeggiator: density scales with intensity
const aS=v>0.7?[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]:v>0.4?[0,2,4,6,8,10,12,14]:v>0.15?cfg.arp:[];
if(aS.includes(step)){const ni=step%ch.length,freq=_nf(r*cfg.ao,ch[ni]);
_musNote(freq,'triangle',.025+v*.015,t,60/MUS.bpm/4*.7,MUS.layerG.arp)}
// Bass: rhythmic hits on beats, more subdivisions at high intensity
if(v>0.3&&(step===0||step===8||(v>0.7&&step%4===0))){
_musNote(_nf(r*0.5,ch[0]),'sine',.05+v*.03,t,60/MUS.bpm/2*.8,MUS.layerG.bass)}
// Walking bass fill on high intensity
if(v>0.8&&(step===6||step===14)){const walkNote=ch[Math.floor(Math.random()*ch.length)];
_musNote(_nf(r*0.5,walkNote),'sine',.03,t,60/MUS.bpm/4*.6,MUS.layerG.bass)}
// Drums
const pat=v>0.85?MUS.drums.intense:v>0.6?MUS.drums.boss:v>0.45?MUS.drums.combat:v>0.25?MUS.drums.alert:MUS.drums.explore;
const dc=pat[step];if(dc==='K')_musKick(t);else if(dc==='S')_musSnare(t);else if(dc==='H')_musHH(t,false);
else if(dc==='O')_musHH(t,true);else if(dc==='T')_musTom(t)}
function _musNote(f,type,vol,t,dur,dest){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;
g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(dest||masterGain);
if(reverbNode){const s=ac.createGain();s.gain.value=.12;g.connect(s);s.connect(reverbNode)}
o.start(t);o.stop(t+dur+.05)}
function _musKick(t){const o=ac.createOscillator(),g=ac.createGain();
o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(30,t+.12);
g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);
o.connect(g);g.connect(MUS.layerG.drum);o.start(t);o.stop(t+.25)}
function _musSnare(t){const len=Math.floor(ac.sampleRate*.12),buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);
for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.5);
const src=ac.createBufferSource();src.buffer=buf;const g=ac.createGain();
g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.001,t+.1);
const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=3000;bp.Q.value=.8;
src.connect(bp);bp.connect(g);g.connect(MUS.layerG.drum);src.start(t);
const o=ac.createOscillator(),og=ac.createGain();o.frequency.setValueAtTime(180,t);o.frequency.exponentialRampToValueAtTime(80,t+.04);
og.gain.setValueAtTime(.04,t);og.gain.exponentialRampToValueAtTime(.001,t+.05);o.connect(og);og.connect(MUS.layerG.drum);o.start(t);o.stop(t+.08)}
function _musHH(t,open){const len=Math.floor(ac.sampleRate*(open?.08:.04)),buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);
for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,open?2:5);
const src=ac.createBufferSource();src.buffer=buf;const g=ac.createGain();
g.gain.setValueAtTime(open?.035:.025,t);g.gain.exponentialRampToValueAtTime(.001,t+(open?.07:.04));
const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=7000;
src.connect(hp);hp.connect(g);g.connect(MUS.layerG.drum);src.start(t)}
function _musTom(t){const o=ac.createOscillator(),g=ac.createGain();
o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(100,t+.1);
g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+.15);
o.connect(g);g.connect(MUS.layerG.drum);o.start(t);o.stop(t+.2)}
// Musical stingers for key moments
function musStinger(type){if(!ac)return;const n=ac.currentTime;
const S={lvlUp:[[400,'triangle'],[500,'triangle'],[630,'triangle'],[800,'sine']],
bossIntro:[[80,'sine'],[100,'sine'],[120,'sine'],[80,'sine']],
death:[[400,'sine'],[300,'sine'],[200,'sine'],[100,'sine']],
victory:[[400,'triangle'],[500,'triangle'],[630,'triangle'],[800,'triangle'],[1000,'sine']],
floorUp:[[300,'triangle'],[400,'triangle'],[500,'triangle']]};
const s=S[type];if(!s)return;
s.forEach(([f,w],i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=w;o.frequency.value=f;
g.gain.setValueAtTime(.07,n+i*.1);g.gain.exponentialRampToValueAtTime(.001,n+i*.1+.3);
o.connect(g);g.connect(masterGain);if(reverbNode){const rs=ac.createGain();rs.gain.value=.2;g.connect(rs);rs.connect(reverbNode)}
o.start(n+i*.1);o.stop(n+i*.1+.4)})}
function setMood(idx){MUS.biome=idx%MUS.configs.length;MUS.bpm=MUS.configs[MUS.biome].bpm;updateAmbientAudio(idx)}
// v10.0 Boss Audio Signatures — unique drone + stinger per boss
const BOSS_AUDIO=[
{drone:95,type:'sine',lfoSpd:0.2,lfoAmt:15,stinger:[[80,'sine'],[95,'sine'],[120,'sine'],[95,'sine']]},// Whisper King: undulating whisper
{drone:70,type:'triangle',lfoSpd:0.4,lfoAmt:20,stinger:[[90,'triangle'],[110,'triangle'],[130,'triangle'],[160,'triangle']]},// Mycelium Titan: organic pulse
{drone:45,type:'sawtooth',lfoSpd:0.6,lfoAmt:10,stinger:[[100,'sawtooth'],[150,'sawtooth'],[200,'sawtooth'],[300,'sawtooth']]},// Inferno Warden: rumbling aggression
{drone:220,type:'sine',lfoSpd:0.15,lfoAmt:40,stinger:[[330,'sine'],[440,'sine'],[550,'sine'],[660,'sine']]},// Frost Sovereign: crystalline shimmer
{drone:55,type:'square',lfoSpd:0.3,lfoAmt:25,stinger:[[60,'square'],[80,'sine'],[100,'square'],[60,'sine']]},// Void Herald: digital unease
{drone:30,type:'sine',lfoSpd:0.08,lfoAmt:8,stinger:[[30,'sine'],[40,'sine'],[50,'sine'],[200,'sine']]}// Void Heart: subsonic dread
];
let bossDroneNodes=[];
function startBossDrone(idx){stopBossDrone();if(!ac)return;const ba=BOSS_AUDIO[idx]||BOSS_AUDIO[0];const t=ac.currentTime;
const o=ac.createOscillator(),g=ac.createGain(),lfo=ac.createOscillator(),lg=ac.createGain();
o.type=ba.type;o.frequency.value=ba.drone;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.025,t+1.5);
lfo.type='sine';lfo.frequency.value=ba.lfoSpd;lg.gain.value=ba.lfoAmt;lfo.connect(lg);lg.connect(o.frequency);
o.connect(g);g.connect(masterGain);lfo.start();o.start();bossDroneNodes=[o,lfo,g]}
function stopBossDrone(){if(!ac||!bossDroneNodes.length)return;const t=ac.currentTime;
try{bossDroneNodes[2].gain.linearRampToValueAtTime(0,t+0.5)}catch(e){}
setTimeout(()=>{bossDroneNodes.forEach(n=>{try{n.stop()}catch(e){}});bossDroneNodes=[]},600)}
function musStingerCustom(notes){if(!ac)return;const n=ac.currentTime;
notes.forEach(([f,w],i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=w;o.frequency.value=f;
g.gain.setValueAtTime(.07,n+i*.12);g.gain.exponentialRampToValueAtTime(.001,n+i*.12+.35);
o.connect(g);g.connect(masterGain);if(reverbNode){const rs=ac.createGain();rs.gain.value=.25;g.connect(rs);rs.connect(reverbNode)}
o.start(n+i*.12);o.stop(n+i*.12+.4)})}
function setBossMusic(on,bossIdx){
if(on){MUS.tgtInt=0.85;MUS.isBoss=true;MUS.bpm=MUS.configs[MUS.biome].bpm*1.15;
const ba=BOSS_AUDIO[bossIdx]||BOSS_AUDIO[0];musStingerCustom(ba.stinger);startBossDrone(bossIdx)}
else{MUS.tgtInt=0;MUS.isBoss=false;MUS.bpm=MUS.configs[MUS.biome].bpm;stopBossDrone()}}
// Environmental ambient audio per biome
let envAmbNodes=[],envAmbGains=[],envAmbInterval=null,curEnvBiome=-1;
function updateAmbientAudio(bioIdx){if(!ac||bioIdx===curEnvBiome)return;curEnvBiome=bioIdx;stopEnvAmbient();
if(bioIdx===0){// Crypt: water drips
envAmbInterval=setInterval(()=>{if(!ac||audioMuted)return;const o=ac.createOscillator(),g=ac.createGain();const t=ac.currentTime;
o.type='sine';o.frequency.setValueAtTime(1800+Math.random()*600,t);o.frequency.exponentialRampToValueAtTime(800,t+0.06);
g.gain.setValueAtTime(0.02,t);g.gain.exponentialRampToValueAtTime(.001,t+0.1);
o.connect(g);g.connect(masterGain);o.start(t);o.stop(t+0.12)},1200+Math.random()*3000)}
else if(bioIdx===1){// Fungal: bubble pops
envAmbInterval=setInterval(()=>{if(!ac||audioMuted)return;const o=ac.createOscillator(),g=ac.createGain();const t=ac.currentTime;
o.type='sine';o.frequency.setValueAtTime(400+Math.random()*200,t);o.frequency.exponentialRampToValueAtTime(200,t+0.03);
g.gain.setValueAtTime(0.015,t);g.gain.exponentialRampToValueAtTime(.001,t+0.05);
o.connect(g);g.connect(masterGain);o.start(t);o.stop(t+0.08)},800+Math.random()*2500)}
else if(bioIdx===2){// Infernal: crackling fire noise
const buf=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate);const d=buf.getChannelData(0);
for(let i=0;i<d.length;i++){const t=i/ac.sampleRate;d[i]=(Math.random()*2-1)*0.006*(0.5+Math.random()*0.5)*Math.abs(Math.sin(t*12))}
const src=ac.createBufferSource();src.buffer=buf;src.loop=true;const g=ac.createGain();g.gain.value=0.05;
const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=2000;
src.connect(hp);hp.connect(g);g.connect(masterGain);src.start();envAmbNodes.push(src);envAmbGains.push(g)}
else if(bioIdx===3){// Frozen: wind howl
const buf=ac.createBuffer(1,ac.sampleRate*4,ac.sampleRate);const d=buf.getChannelData(0);
for(let i=0;i<d.length;i++){const t=i/ac.sampleRate;d[i]=(Math.random()*2-1)*0.01*Math.sin(t*0.4)*Math.sin(t*0.15)}
const src=ac.createBufferSource();src.buffer=buf;src.loop=true;const g=ac.createGain();g.gain.value=0.04;
const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=400;bp.Q.value=1.5;
const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=0.12;lg.gain.value=150;lfo.connect(lg);lg.connect(bp.frequency);lfo.start();
src.connect(bp);bp.connect(g);g.connect(masterGain);src.start();envAmbNodes.push(src,lfo);envAmbGains.push(g)}
else if(bioIdx===4){// Void: binaural buzz
const o1=ac.createOscillator(),o2=ac.createOscillator(),g=ac.createGain();o1.type='sine';o1.frequency.value=113;o2.type='sine';o2.frequency.value=117;
g.gain.value=0.01;o1.connect(g);o2.connect(g);g.connect(masterGain);o1.start();o2.start();envAmbNodes.push(o1,o2);envAmbGains.push(g)}}
function stopEnvAmbient(){if(envAmbInterval){clearInterval(envAmbInterval);envAmbInterval=null}
const n=ac?ac.currentTime:0;envAmbGains.forEach(g=>{try{g.gain.linearRampToValueAtTime(0,n+0.5)}catch(e){}});
setTimeout(()=>{envAmbNodes.forEach(nd=>{try{nd.stop()}catch(e){}});envAmbNodes=[];envAmbGains=[]},800);curEnvBiome=-1}
let audioMuted=false;
function toggleAudio(){audioMuted=!audioMuted;
if(ac&&masterGain)masterGain.gain.linearRampToValueAtTime(audioMuted?0:0.6,ac.currentTime+0.1);
document.getElementById('audio-toggle').textContent=audioMuted?'SFX: OFF':'SFX: ON'}
function playRoomFanfare(){if(!ac)return;const n=ac.currentTime;
[400,500,630,800].forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();
o.connect(g);g.connect(masterGain);o.frequency.value=f;o.type='triangle';
g.gain.setValueAtTime(0.08,n+i*0.08);g.gain.exponentialRampToValueAtTime(.001,n+i*0.08+0.25);
o.start(n+i*0.08);o.stop(n+i*0.08+0.3)})}

// Dynamic music intensity — driven by game state
let musicIntensity=0,targetIntensity=0;
function setCombatIntensity(){if(!MUS.active)return;
const enemyF=Math.min(1,ents.length/6);const hpF=P.hp<P.mhp*0.3?0.3:0;
const comboF=Math.min(0.3,cmb*0.03);const bossF=ents.some(e=>e.type==='boss')?0.5:ents.some(e=>e.isMini)?0.3:0;
MUS.tgtInt=Math.min(1,enemyF+hpF+comboF+bossF);musicIntensity=MUS.intensity;targetIntensity=MUS.tgtInt}

/* ═══════════════════════════════════════════════════
   CANVAS & CORE CONSTANTS
   ═══════════════════════════════════════════════════ */
const gc=document.getElementById('gc'),ct=gc.getContext('2d');
const lc=document.getElementById('lightC'),lt=lc.getContext('2d');
const crtCanvas=document.getElementById('crtC'),crt=crtCanvas.getContext('2d');
const mmc=document.getElementById('minimap-c'),mmt=mmc.getContext('2d');
const titleBg=document.getElementById('title-bg'),titleCtx=titleBg.getContext('2d');
// v10 Bloom offscreen canvas at half resolution
const bloomC=document.createElement('canvas'),bloomCtx=bloomC.getContext('2d');
let W,H;function rsz(){W=gc.width=lc.width=crtCanvas.width=innerWidth;H=gc.height=lc.height=crtCanvas.height=innerHeight;titleBg.width=W;titleBg.height=H;
bloomC.width=Math.floor(W/2);bloomC.height=Math.floor(H/2);
const cbg=document.getElementById('class-bg');if(cbg){cbg.width=W;cbg.height=H}try{if(typeof layoutVBtns==='function')layoutVBtns()}catch(e){}}rsz();addEventListener('resize',rsz);

const TS=48,RW=17,RH=13,RPX=RW*TS,RPY=RH*TS;
const DC=[7,8,9],DR=[5,6,7];

/* ═══════════════════════════════════════════════════
   BIOME DEFINITIONS - 5 unique biomes with environmental FX
   ═══════════════════════════════════════════════════ */
const BIO=[
{name:'CRYPT OF WHISPERS',fl:'#100e18',w1:'#2a2640',w2:'#332e4a',ac:'rgba(180,140,255,',fg:'rgba(20,15,35,',i:0,
 decor:['skull','candle','crack','rune'],torchCol:'#c8a0ff',fogDensity:.18,lightAmb:[85,70,110],
 wallDetail:'moss',floorDetail:'bone',tint:[40,20,60],envPart:{col:'rgba(180,160,255,0.15)',vy:-.08,vxRange:.15,shape:'circle'},hazard:null},
{name:'FUNGAL CAVERNS',fl:'#0e1210',w1:'#1e3328',w2:'#2a4438',ac:'rgba(100,220,140,',fg:'rgba(10,25,18,',i:1,
 decor:['mushroom','puddle','vine','crystal'],torchCol:'#44ff88',fogDensity:.2,lightAmb:[65,95,72],
 wallDetail:'mushroom',floorDetail:'spore',tint:[15,40,20],envPart:{col:'rgba(100,255,140,0.12)',vy:-.15,vxRange:.25,shape:'circle'},hazard:{type:'spore',chance:0.05,status:'poison',dur:40}},
{name:'INFERNAL DEPTHS',fl:'#181008',w1:'#3a2218',w2:'#4a2e22',ac:'rgba(255,140,60,',fg:'rgba(30,15,8,',i:2,
 decor:['ember','crack','lava','bone'],torchCol:'#ff8844',fogDensity:.15,lightAmb:[105,75,55],
 wallDetail:'ember',floorDetail:'scorch',tint:[50,25,10],envPart:{col:'rgba(255,140,50,0.2)',vy:-.35,vxRange:.1,shape:'rect'},hazard:{type:'lava',chance:0.04,dmg:0.5,tickRate:20}},
{name:'FROZEN ABYSS',fl:'#0a0e18',w1:'#1a2240',w2:'#253355',ac:'rgba(100,160,255,',fg:'rgba(8,12,25,',i:3,
 decor:['icicle','frost','crystal','crack'],torchCol:'#88ccff',fogDensity:.14,lightAmb:[68,78,110],
 wallDetail:'frost',floorDetail:'ice',tint:[15,25,50],envPart:{col:'rgba(200,220,255,0.15)',vy:.12,vxRange:.2,shape:'diamond'},hazard:{type:'ice',chance:0.08,friction:0.4}},
{name:'VOID NEXUS',fl:'#080810',w1:'#1a1a30',w2:'#222244',ac:'rgba(200,100,255,',fg:'rgba(8,8,20,',i:4,
 decor:['rune','portal','crack','void'],torchCol:'#cc66ff',fogDensity:.22,lightAmb:[75,58,95],
 wallDetail:'glitch',floorDetail:'voidrune',tint:[30,15,50],envPart:{col:'rgba(200,100,255,0.18)',vy:0,vxRange:.05,shape:'circle'},hazard:{type:'gravity',chance:0.03,pull:0.3,radius:80}}];

/* ═══════════════════════════════════════════════════
   TILE TEXTURE CACHE — v8.0 offscreen rendered tile variants
   ═══════════════════════════════════════════════════ */
let tileCache={};
function buildTileCache(biIdx){tileCache={};const b=BIO[biIdx];
for(let v=0;v<8;v++){// 8 wall variants
const wc=document.createElement('canvas');wc.width=TS;wc.height=TS;renderWallTile(wc.getContext('2d'),b,v,biIdx);tileCache[`w${v}`]=wc}
for(let v=0;v<4;v++){// 4 floor variants
const fc=document.createElement('canvas');fc.width=TS;fc.height=TS;renderFloorTile(fc.getContext('2d'),b,v,biIdx);tileCache[`f${v}`]=fc}}

function renderWallTile(c,b,v,bi){
// Base gradient for depth
const g=c.createLinearGradient(0,0,TS,TS);g.addColorStop(0,lightenColor(b.w2,15));g.addColorStop(1,darkenColor(b.w1,10));
c.fillStyle=g;c.fillRect(0,0,TS,TS);
// Inner face
const ig=c.createLinearGradient(2,2,TS-2,TS-2);ig.addColorStop(0,lightenColor(b.w2,8));ig.addColorStop(1,b.w2);
c.fillStyle=ig;c.fillRect(2,2,TS-4,TS-4);
// Brick pattern (running bond)
c.fillStyle='rgba(0,0,0,0.18)';
const brickH=v%2===0?12:10;const offsetRow=v%3;
for(let by=0;by<TS;by+=brickH){const isOdd=((by/brickH|0)+offsetRow)%2;
c.fillRect(0,by,TS,1.5);// horizontal mortar
const brickW=v<4?TS/2:TS/3;const xOff=isOdd?brickW/2:0;
for(let bx=xOff;bx<TS;bx+=brickW)c.fillRect(bx,by,1.5,brickH)}
// Surface texture noise
for(let i=0;i<20;i++){const nx=Math.random()*TS,ny=Math.random()*TS;
c.fillStyle=Math.random()>.5?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.06)';
c.fillRect(nx,ny,1+Math.random()*1.5,1+Math.random()*1.5)}
// Top-left highlight (light source simulation)
c.fillStyle='rgba(255,255,255,0.05)';c.fillRect(2,2,TS-4,2);c.fillRect(2,2,2,TS-4);
// Bottom-right shadow
c.fillStyle='rgba(0,0,0,0.08)';c.fillRect(2,TS-4,TS-4,2);c.fillRect(TS-4,2,2,TS-4);
// Biome wall overlays (VISIBLE alpha)
const seed=v*73;
if(bi===0){// Crypt: moss patches + cracks
if(v<4){c.fillStyle='rgba(50,130,50,0.25)';const mx=(seed%12)+2,my=TS-8-(seed%6);
c.fillRect(mx,my,6+v*2,5);c.fillRect(mx+1,my-2,4,2)}// moss
if(v>4){c.strokeStyle='rgba(0,0,0,0.12)';c.lineWidth=1;c.beginPath();
c.moveTo(8+v*3,4);c.lineTo(12+v*2,20);c.lineTo(10+v*4,38);c.stroke()}}// crack
else if(bi===1){// Fungal: mushrooms + vines
if(v<3){c.fillStyle='rgba(120,80,200,0.3)';c.beginPath();c.arc(10+v*12,TS-5,4+v,Math.PI,0);c.fill();
c.fillStyle='rgba(80,60,140,0.25)';c.fillRect(10+v*12-1,TS-5,2,5)}// mushroom
if(v>=3&&v<6){c.strokeStyle='rgba(80,200,100,0.2)';c.lineWidth=1.5;c.beginPath();
c.moveTo(2,v*5);c.quadraticCurveTo(15,v*4+10,8,v*5+18);c.stroke()}}// vine
else if(bi===2){// Infernal: glowing cracks
c.strokeStyle='rgba(255,120,30,0.2)';c.lineWidth=1;c.beginPath();
c.moveTo(4+v*4,2);c.lineTo(8+v*3,TS/2);c.lineTo(4+v*5,TS-4);c.stroke();
c.strokeStyle='rgba(255,200,50,0.1)';c.lineWidth=3;c.beginPath();
c.moveTo(4+v*4,2);c.lineTo(8+v*3,TS/2);c.stroke()}
else if(bi===3){// Frozen: ice crystals + frost
if(v<4){c.fillStyle='rgba(150,220,255,0.2)';c.beginPath();
const cx=10+v*8,cy=6+v*4;c.moveTo(cx,cy-6);c.lineTo(cx+3,cy);c.lineTo(cx,cy+6);c.lineTo(cx-3,cy);c.closePath();c.fill()}
c.fillStyle='rgba(200,230,255,0.06)';c.fillRect(0,0,TS,TS)}// frost glaze
else if(bi===4){// Void: purple veins
c.strokeStyle='rgba(180,60,255,0.15)';c.lineWidth=1.5;c.beginPath();
c.moveTo(v*5,0);c.bezierCurveTo(TS/2,TS/3,TS/3,TS*2/3,TS-v*4,TS);c.stroke();
c.strokeStyle='rgba(180,60,255,0.08)';c.lineWidth=3;c.beginPath();
c.moveTo(v*5,0);c.bezierCurveTo(TS/2,TS/3,TS/3,TS*2/3,TS-v*4,TS);c.stroke()}}

function renderFloorTile(c,b,v,bi){
c.fillStyle=b.fl;c.fillRect(0,0,TS,TS);
// Flagstone bevel effect
c.fillStyle='rgba(255,255,255,0.06)';c.fillRect(1,1,TS-2,1.5);c.fillRect(1,1,1.5,TS-2);// highlight top/left
c.fillStyle='rgba(0,0,0,0.07)';c.fillRect(1,TS-2.5,TS-2,1.5);c.fillRect(TS-2.5,1,1.5,TS-2);// shadow bottom/right
// Grid line
c.strokeStyle='rgba(255,255,255,0.025)';c.lineWidth=0.5;c.strokeRect(0.5,0.5,TS-1,TS-1);
// Floor texture marks
const seed=v*37;
for(let i=0;i<4;i++){const fx=(seed+i*17)%40+4,fy=(seed+i*23)%36+6;
c.fillStyle=`rgba(255,255,255,${0.015+Math.random()*0.015})`;
if(i%2===0)c.fillRect(fx,fy,2,2);
else{c.beginPath();c.arc(fx,fy,1.5,0,Math.PI*2);c.fill()}}
// Biome floor detail (VISIBLE alpha)
if(bi===0&&v===0){c.strokeStyle='rgba(180,160,200,0.06)';c.lineWidth=1;c.beginPath();c.moveTo(8,12);c.lineTo(36,38);c.stroke();
c.beginPath();c.moveTo(12,10);c.lineTo(34,36);c.stroke()}// bones
else if(bi===1&&v<2){c.fillStyle='rgba(100,200,100,0.05)';for(let s=0;s<3;s++){c.beginPath();c.arc(12+s*12,20+s*5,2,0,Math.PI*2);c.fill()}}// spores
else if(bi===2&&v===0){c.fillStyle='rgba(80,30,10,0.04)';c.beginPath();c.arc(TS/2,TS/2,8,0,Math.PI*2);c.fill()}// scorch
else if(bi===3&&v<2){c.fillStyle='rgba(180,220,255,0.04)';c.fillRect(4,4,TS-8,TS-8);
c.fillStyle='rgba(255,255,255,0.03)';c.fillRect(8,6,TS/3,1)}// ice reflection
else if(bi===4&&v===0){c.strokeStyle='rgba(160,80,255,0.04)';c.lineWidth=0.5;c.beginPath();c.arc(TS/2,TS/2,6,0,Math.PI*2);c.stroke();
c.beginPath();c.moveTo(TS/2-6,TS/2);c.lineTo(TS/2+6,TS/2);c.moveTo(TS/2,TS/2-6);c.lineTo(TS/2,TS/2+6);c.stroke()}}// runes

function lightenColor(hex,pct){// lighten a hex or CSS color by pct%
const m=hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i);if(!m)return hex;
return'#'+[1,2,3].map(i=>Math.min(255,parseInt(m[i],16)+Math.floor(255*pct/100)).toString(16).padStart(2,'0')).join('')}
function darkenColor(hex,pct){const m=hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i);if(!m)return hex;
return'#'+[1,2,3].map(i=>Math.max(0,parseInt(m[i],16)-Math.floor(255*pct/100)).toString(16).padStart(2,'0')).join('')}

/* ═══════════════════════════════════════════════════
   WEAPON SYSTEM - 18 weapons with specials
   ═══════════════════════════════════════════════════ */
const WPN=[
{name:'RUSTY SWORD',t:'m',d:1,r:36,s:16,c:'#aaa',desc:'Basic blade',tier:0,sp:'none'},
{name:'IRON SWORD',t:'m',d:2,r:38,s:14,c:'#ccd0dd',desc:'Reliable steel',tier:1,sp:'thrust'},
{name:'BROAD AXE',t:'m',d:4,r:32,s:22,c:'#cc8844',desc:'Slow but devastating',tier:1,sp:'cleave'},
{name:'RAPIER',t:'m',d:1.8,r:46,s:8,c:'#88ccff',desc:'Lightning fast',tier:1,sp:'flurry'},
{name:'TWIN DAGGERS',t:'m',d:1.5,r:28,s:6,c:'#44ddaa',desc:'Double strike',tier:1,sp:'backstab',hits:2},
{name:'FLAME SWORD',t:'m',d:3,r:40,s:13,c:'#ff6633',desc:'Burns enemies',tier:2,sp:'fireball',burn:1},
{name:'VOIDBLADE',t:'m',d:5,r:44,s:12,c:'#bb66ff',desc:'Void-touched edge',tier:2,sp:'voidslash'},
{name:'FROST MACE',t:'m',d:3.5,r:34,s:18,c:'#66ccff',desc:'Freezes on hit',tier:2,sp:'glacial',freeze:1},
{name:'POISON FANG',t:'m',d:2.5,r:30,s:10,c:'#66ff44',desc:'Venomous strikes',tier:2,sp:'toxicburst',poison:1},
{name:'SHORT BOW',t:'r',d:1.5,r:200,s:22,c:'#aa8855',desc:'Basic ranged',tier:1,ps:5,sp:'multishot'},
{name:'LONGBOW',t:'r',d:3,r:280,s:28,c:'#ccaa66',desc:'Powerful shots',tier:2,ps:6,sp:'pierceshot'},
{name:'FIRE STAFF',t:'r',d:2.8,r:180,s:20,c:'#ff4422',desc:'Launches fireballs',tier:2,ps:4,burn:1,sp:'meteor'},
{name:'ICE WAND',t:'r',d:2,r:160,s:16,c:'#44ccff',desc:'Freezing bolts',tier:2,ps:4.5,freeze:1,sp:'blizzard'},
{name:'CRYSTAL DAGGER',t:'m',d:3,r:28,s:7,c:'#44ffcc',desc:'Shatters on crit',tier:2,sp:'shatter'},
{name:'DEATH SCYTHE',t:'m',d:7,r:54,s:20,c:'#ff44aa',desc:'Reaps souls',tier:3,sp:'soulreap'},
{name:'VOID CANNON',t:'r',d:6,r:320,s:32,c:'#aa44ff',desc:'Devastating blasts',tier:3,ps:7,sp:'voidbeam'},
{name:'BLOODTHIRSTER',t:'m',d:5.5,r:42,s:14,c:'#ff2244',desc:'Heals on kill',tier:3,sp:'bloodstorm',vamp:1},
{name:'CELESTIAL BLADE',t:'m',d:8,r:48,s:16,c:'#ffffaa',desc:'Holy damage',tier:3,sp:'divineblast'}];

/* v6.0 Weapon Mastery — weapons gain power from kills */
function getWeaponMastery(wName){if(!wName)return 0;return weaponMastery[wName]||0}
function addWeaponMasteryXP(wName){if(!wName)return;weaponMastery[wName]=(weaponMastery[wName]||0)+1;
const lv=getWeaponMasteryLevel(wName);const prev=getWeaponMasteryLevel2(wName,weaponMastery[wName]-1);
if(lv>prev){ft(P.x,P.y-35,`${wName} ★${lv}`,'#ffcc00',1);sfx('lvl');flash('#ffcc00',.06)}}
function getWeaponMasteryLevel(wName){const xp=weaponMastery[wName]||0;return xp>=30?3:xp>=15?2:xp>=5?1:0}
function getWeaponMasteryLevel2(wName,xp){return xp>=30?3:xp>=15?2:xp>=5?1:0}
function getWeaponMasteryDmgMult(wName){const lv=getWeaponMasteryLevel(wName);return 1+lv*0.1}

/* ═══════════════════════════════════════════════════
   v8.0 WEAPON EVOLUTION SYSTEM — weapons transform at kill thresholds
   ═══════════════════════════════════════════════════ */
let weaponKillCount=0,weaponEvoStage=0;
const WEAPON_EVOLUTIONS={
'IRON SWORD':[
[{kills:15,name:'FLAME SWORD',d:3,r:40,s:13,c:'#ff6633',desc:'Burns on hit',sp:'fireball',burn:1,msg:'THE BLADE IGNITES',col:'#ff6633',passive:null},
{kills:15,name:'FROST BLADE',d:2.8,r:42,s:12,c:'#88ccff',desc:'Slows enemies',sp:'icewave',freeze:1,msg:'THE BLADE FREEZES',col:'#88ccff',passive:null}],
{kills:35,name:'PHOENIX BLADE',d:5.5,r:44,s:12,c:'#ff4400',desc:'Rise from ashes',sp:'fireball',burn:1,msg:'REBORN IN FLAME',col:'#ff4400',passive:'phoenix'}],
'BROAD AXE':[
[{kills:12,name:'WAR CLEAVER',d:5.5,r:34,s:20,c:'#cc6622',desc:'Crushing blows',sp:'cleave',msg:'THE AXE HUNGERS',col:'#cc6622',passive:null},
{kills:12,name:'THUNDER AXE',d:4.5,r:36,s:18,c:'#ffdd44',desc:'Chain lightning',sp:'cleave',msg:'THUNDER CALLS',col:'#ffdd44',passive:'chainlightning'}],
{kills:30,name:'WORLDSPLITTER',d:8,r:36,s:20,c:'#ff8800',desc:'Splits the earth',sp:'cleave',msg:'THE WORLD CRACKS',col:'#ff8800',passive:'groundslam'}],
'RAPIER':[
[{kills:18,name:'WIND RAPIER',d:2.5,r:48,s:7,c:'#66ddff',desc:'Swift as wind',sp:'flurry',msg:'THE AIR SHARPENS',col:'#66ddff',passive:null},
{kills:18,name:'VENOM RAPIER',d:2.8,r:44,s:8,c:'#66ff44',desc:'Poison stacks',sp:'flurry',poison:1,msg:'VENOM FLOWS',col:'#66ff44',passive:null}],
{kills:40,name:'TEMPEST NEEDLE',d:4,r:52,s:6,c:'#4488ff',desc:'Lightning strikes',sp:'flurry',msg:'STORM UNLEASHED',col:'#4488ff',passive:'chainlightning'}],
'TWIN DAGGERS':[
[{kills:20,name:'SHADOW FANGS',d:2.5,r:30,s:5,c:'#8844cc',desc:'Shadow strikes',sp:'backstab',hits:2,msg:'SHADOWS EMBRACE',col:'#8844cc',passive:null},
{kills:20,name:'PLAGUE FANGS',d:2.2,r:32,s:5,c:'#88ff44',desc:'Poison spreads',sp:'backstab',hits:2,poison:1,msg:'PLAGUE SPREADS',col:'#88ff44',passive:null}],
{kills:45,name:'VOID FANGS',d:4,r:32,s:5,c:'#aa22ff',desc:'Phase through death',sp:'backstab',hits:2,msg:'VOID CONSUMES',col:'#aa22ff',passive:'phaseshift'}],
'SHORT BOW':[
[{kills:15,name:'HUNTER BOW',d:2.5,r:240,s:18,c:'#88aa44',desc:'Multi-shot',ps:5.5,sp:'multishot',msg:'THE HUNT BEGINS',col:'#88aa44',passive:null},
{kills:15,name:'SNIPER BOW',d:4,r:350,s:24,c:'#aaddff',desc:'Pierce + range',ps:6.5,sp:'powershot',msg:'ONE SHOT. ONE KILL.',col:'#aaddff',passive:null}],
{kills:35,name:'STARFALL BOW',d:4.5,r:300,s:16,c:'#ffaa22',desc:'Stars rain down',ps:6,sp:'multishot',msg:'STARS DESCEND',col:'#ffaa22',passive:'homing'}],
'BONE STAFF':[
[{kills:18,name:'LICH STAFF',d:3.5,r:200,s:16,c:'#c8a0ff',desc:'Summon bone on kill',ps:3.5,sp:'deathbolt',msg:'DEATH OBEYS',col:'#c8a0ff',passive:null},
{kills:18,name:'DEATH STAFF',d:4,r:180,s:18,c:'#ff3366',desc:'Execute threshold +15%',ps:3,sp:'deathbolt',msg:'REAP THE WEAK',col:'#ff3366',passive:null}]],
'CRYSTAL WAND':[
[{kills:16,name:'PRISM WAND',d:2,r:220,s:14,c:'#ff88ff',desc:'Attacks split 3 ways',ps:4,sp:'prism',msg:'LIGHT REFRACTS',col:'#ff88ff',passive:null},
{kills:16,name:'VOID WAND',d:3.5,r:200,s:16,c:'#8844ff',desc:'Pulls enemies in',ps:3.5,sp:'voidpull',msg:'GRAVITY BENDS',col:'#8844ff',passive:null}]],
'WAR HAMMER':[
[{kills:14,name:'THUNDER HAMMER',d:5,r:32,s:22,c:'#ffdd44',desc:'Lightning on hit',sp:'groundslam',msg:'THUNDER STRIKES',col:'#ffdd44',passive:'chainlightning'},
{kills:14,name:'SEISMIC HAMMER',d:5.5,r:34,s:24,c:'#aa8855',desc:'Ground slam every 5th',sp:'groundslam',msg:'THE EARTH QUAKES',col:'#aa8855',passive:'groundslam'}]]};

function checkWeaponEvolution(){if(!P.w)return;const evos=WEAPON_EVOLUTIONS[P.w.baseName||P.w.name];if(!evos)return;
if(weaponEvoStage>=evos.length)return;const evo=evos[weaponEvoStage];
// v10.0 Branching evolution: if evo is array of 2, present choice
if(Array.isArray(evo)){if(weaponKillCount>=evo[0].kills)showEvoChoice(evo)}
else{if(weaponKillCount>=evo.kills)evolveWeapon(evo)}}
// v10.0 Weapon evolution choice UI
function showEvoChoice(options){if(gSt!=='playing')return;gSt='event';
const ov=document.getElementById('event-overlay');ov.style.display='flex';
let html='<div style="color:#ffcc00;font-size:14px;letter-spacing:3px;margin-bottom:8px">WEAPON EVOLUTION</div>';
html+='<div style="color:#aaa;font-size:9px;margin-bottom:12px">Choose your path:</div><div style="display:flex;gap:16px">';
options.forEach((opt,idx)=>{html+=`<div onclick="pickEvo(${idx})" style="cursor:pointer;border:1px solid ${opt.col};padding:10px 16px;border-radius:4px;background:rgba(0,0,0,0.7);text-align:center;min-width:120px;transition:all .2s" onmouseenter="this.style.background='rgba(${opt.col.includes('ff66')?'255,102,51':'100,140,255'},0.15)'" onmouseleave="this.style.background='rgba(0,0,0,0.7)'">
<div style="color:${opt.col};font-size:12px;font-family:Silkscreen;letter-spacing:2px">${opt.name}</div>
<div style="color:#888;font-size:8px;margin:4px 0">${opt.desc}</div>
<div style="color:${opt.col};font-size:8px">DMG: ${opt.d} | SPD: ${opt.s}</div></div>`});
html+='</div>';ov.innerHTML=html;window._evoOptions=options}
function pickEvo(idx){const opt=window._evoOptions[idx];evolveWeapon(opt);
document.getElementById('event-overlay').style.display='none';gSt='playing'}

function evolveWeapon(evo){const baseName=P.w.baseName||P.w.name;
P.w={name:evo.name,t:P.w.t,d:evo.d+(P.forgeDmg||0),r:evo.r,s:evo.s,c:evo.col,desc:evo.desc,tier:Math.min(3,P.w.tier+1),
sp:evo.sp||P.w.sp,baseName:baseName,evolved:true,evoPassive:evo.passive};
if(evo.burn)P.w.burn=evo.burn;if(evo.freeze)P.w.freeze=evo.freeze;if(evo.hits)P.w.hits=evo.hits;if(evo.ps)P.w.ps=evo.ps;
weaponEvoStage++;equipWeaponTags();
// v8.0 SPECTACULAR evolution effects
slMo=0.02;camZoom=1.1;camZoomT=40;shk=20;chromAb=10;flash(evo.col,0.4);tryWhisper('weaponEvo');
emitRing(P.x,P.y,40,evo.col,6,30,3.5);emit(P.x,P.y,30,'#ffffff',5,24,3,'star');
addShockwave(P.x,P.y,100,evo.col,16);addShockwave(P.x,P.y,60,'#ffffff',12);
for(let s=0;s<25;s++){const a=Math.random()*Math.PI*2,spd=2+Math.random()*5;
parts.push({x:P.x,y:P.y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd-1.5,life:30+Math.random()*30,ml:60,color:Math.random()>.4?evo.col:'#ffffff',size:3+Math.random()*3,shape:'star',grav:0.04})}
addDynLight(P.x,P.y,200,evo.col,2.5,0,30);
msg(evo.msg,2000);ft(P.x,P.y-40,evo.msg,evo.col,2);sfx('lvl');sfx('synergy')}

/* ═══════════════════════════════════════════════════
   ENEMY MODIFIER SYSTEM
   ═══════════════════════════════════════════════════ */
const EMODS=[
{n:'SWIFT',c:'#00ccff',sym:'⚡',a:e=>{e.spd*=1.7;e.atkSpd*=.7},vfx:'lightning'},
{n:'ARMORED',c:'#aaaacc',sym:'🛡',a:e=>{e.mhp=Math.ceil(e.mhp*2.2);e.hp=e.mhp;e.armor=Math.max(e.armor||0,2)},vfx:'shield'},
{n:'SPLITTING',c:'#44ff88',sym:'✦',a:e=>{e.splits=1},vfx:'ghost'},
{n:'VAMPIRIC',c:'#ff4466',sym:'♥',a:e=>{e.vamp=1},vfx:'drain'},
{n:'BERSERKER',c:'#ff8800',sym:'⚔',a:e=>{e.dmg*=1.6;e.spd*=1.4},vfx:'flame'},
{n:'POISONOUS',c:'#66ff44',sym:'☠',a:e=>{e.poisonous=1},vfx:'mist'},
{n:'SHIELDED',c:'#44ddff',sym:'◉',a:e=>{e.shield=Math.ceil(e.mhp*.4)},vfx:'hex'},
{n:'TELEPORTER',c:'#cc44ff',sym:'⊕',a:e=>{e.teleports=1;e.telCd=0},vfx:'glitch'}];

// v10.0 Champion Aura system — elite+ tier with unique auras
const CHAMPION_AURAS=[
{n:'WARCRY',c:'#ff8800',sym:'📯',desc:'Buffs nearby allies +30% speed',
 tick:(e)=>{if(fr%60===0)for(const a of ents){if(a!==e&&a.hp>0&&Math.hypot(a.x-e.x,a.y-e.y)<100){a.spd*=1.3;setTimeout(()=>{if(a.hp>0)a.spd/=1.3},2000)}}}},
{n:'DEATH NOVA',c:'#cc44ff',sym:'💀',desc:'Explodes on death',
 onDeath:(e)=>{for(const en of ents){const d=Math.hypot(en.x-e.x,en.y-e.y);if(d<70&&en!==e){en.hp-=3;en.fl=8}}
 if(Math.hypot(P.x-e.x,P.y-e.y)<70)bossHurtP(3,20);
 emitRing(e.x,e.y,30,'#cc44ff',5,24,3);addShockwave(e.x,e.y,70,'#cc44ff',14);sfx('boss_death')}},
{n:'REGEN',c:'#44ff88',sym:'♻',desc:'Regenerates 2% HP/sec',
 tick:(e)=>{if(fr%30===0&&e.hp<e.mhp){e.hp=Math.min(e.mhp,e.hp+e.mhp*0.02);
 if(fr%60===0)emit(e.x,e.y,2,'#44ff88',1,8,1)}}},
{n:'REFLECTOR',c:'#aaeeff',sym:'◇',desc:'Reflects 30% projectile damage',
 onHit:(e)=>{if(Math.random()<0.3){const ra=Math.random()*Math.PI*2;
 projs.push({x:e.x,y:e.y,vx:Math.cos(ra)*3,vy:Math.sin(ra)*3,dmg:1+P.bd*0.3,life:40,color:'#aaeeff',size:3,enemy:1})}}}
];

/* ═══════════════════════════════════════════════════
   ACCESSORY SYSTEM
   ═══════════════════════════════════════════════════ */
const ACCESSORIES=[
{name:'ECHO AMULET',desc:'Every 5th attack fires a ghost copy',tier:1,f:p=>{p.echoAmulet=true;p.echoCount=0}},
{name:'VAMPIRIC FANG',desc:'Kills below 30% HP heal 2',tier:1,f:p=>{p.vampFang=true}},
{name:'BLINK SHARD',desc:'Dash teleports instead of sliding',tier:1,f:p=>{p.blinkDash=true;p.dMax*=.85}},
{name:'LIFE GEM',desc:'+3 Max HP',tier:1,f:p=>{p.mhp+=3;p.hp+=3}},
{name:'THORN CROWN',desc:'Taking damage fires 8 projectiles',tier:2,f:p=>{p.thornCrown=true;p.thornCd=0}},
{name:'GRAVITY LENS',desc:'Pickups magnetize to you on kills',tier:2,f:p=>{p.gravLens=true}},
{name:'BERSERKER BAND',desc:'+5% atk speed per combo (max +50%)',tier:2,f:p=>{p.berserkBand=true}},
{name:'SOUL MIRROR',desc:'20% chance to dodge + reflect attacks',tier:2,f:p=>{p.soulMirror=true}},
{name:'CHRONO LOOP',desc:'Rewind 5 seconds on death (once/floor)',tier:3,f:p=>{p.chronoLoop=true;p.chronoUsed=false;p.chronoSnaps=[]}},
{name:'CHAOS GEM',desc:'Random status on hit, random buff/room',tier:3,f:p=>{p.chaosGem=true;p.chaosRoomBuff=null}}];

/* ═══════════════════════════════════════════════════
   RELIC SYSTEM - Rare powerful items
   ═══════════════════════════════════════════════════ */
const RELICS=[
{name:'VOID EYE',desc:'See all rooms on minimap, +15% crit',icon:'◉',color:'#cc66ff',
 f:p=>{p.cc+=0.15;p.relicVision=true}},
{name:'BLOOD CROWN',desc:'Kills heal 2 HP, max HP -3',icon:'♛',color:'#ff2244',
 f:p=>{p.mhp-=3;p.hp=Math.min(p.hp,p.mhp);p.bloodCrown=true}},
{name:'TIME SHARD',desc:'Enemies 25% slower, dash CD -50%',icon:'◈',color:'#00ccff',
 f:p=>{p.dMax*=0.5;p.timeShard=true}},
{name:'EMBER HEART',desc:'All attacks burn, +2 damage',icon:'♦',color:'#ff6633',
 f:p=>{p.burnChance=1.0;p.bd+=2}},
{name:'PHANTOM CLOAK',desc:'Negate every 8th hit, 2x dash distance',icon:'◇',color:'#88aacc',
 f:p=>{p.phantomCloak=true;p.hitCounter=0}},
{name:'GOLDEN IDOL',desc:'2x gold, shop prices -30%',icon:'★',color:'#ffcc00',
 f:p=>{p.goldMult*=2;p.shopDiscount=0.7}},
{name:'SOUL LANTERN',desc:'See HP through fog, +25% XP',icon:'◎',color:'#88ddff',
 f:p=>{p.soulLantern=true;p.xpMult=1.25}},
{name:'CHAOS SEED',desc:'Random weapon each floor',icon:'✧',color:'#ff88cc',
 f:p=>{p.chaosSeed=true}},
{name:'IRON WILL',desc:'No knockback, +2 armor, -15% spd',icon:'▣',color:'#88aacc',
 f:p=>{p.ironWill=true;p.arm+=2;p.spd*=0.85}},
{name:'MIRROR SHIELD',desc:'25% reflect enemy projectiles',icon:'◈',color:'#aaeeff',
 f:p=>{p.mirrorShield=true}}];

/* ═══════════════════════════════════════════════════
   CLASS DEFINITIONS
   ═══════════════════════════════════════════════════ */
const CLASSES={
voidwalker:{name:'VOIDWALKER',icon:'◈',color:'#c8a0ff',hp:10,bd:0,spd:2.8,cc:.05,
  ab:'voidpulse',abName:'Void Pulse',abDesc:'Damages and slows all nearby enemies',
  passive:'Kills restore 1 HP',passiveKey:'killsHeal',
  desc:'Balanced warrior attuned to void energies'},
pyromancer:{name:'PYROMANCER',icon:'◆',color:'#ff6633',hp:7,bd:2,spd:2.5,cc:.08,
  ab:'inferno',abName:'Inferno',abDesc:'Massive fire explosion, burns all nearby',
  passive:'20% chance attacks inflict burn',passiveKey:'burnChance',
  desc:'Glass cannon who commands living flame'},
shadowblade:{name:'SHADOWBLADE',icon:'◇',color:'#44ddaa',hp:8,bd:1,spd:3.4,cc:.15,
  ab:'shadowstep',abName:'Shadow Step',abDesc:'Teleport behind nearest enemy, 3x damage',
  passive:'Dash CD -30%, dash damages enemies',passiveKey:'dashDmg',
  desc:'Swift assassin who strikes from shadows'},
warden:{name:'WARDEN',icon:'◆',color:'#06d6a0',hp:14,bd:1,spd:2.2,cc:.03,
  ab:'fortify',abName:'Fortify',abDesc:'Shield barrier reflects projectiles, +15 shield',
  passive:'Parry deals 4x damage and stuns',passiveKey:'shieldBash',
  desc:'Unbreakable guardian who endures all'},
chronomancer:{name:'CHRONOMANCER',icon:'◉',color:'#00ccff',hp:8,bd:1,spd:2.6,cc:.10,
  ab:'temporal_rift',abName:'Temporal Rift',abDesc:'Rewind enemies to past positions, damage based on distance',
  passive:'Every 5th hit slows all nearby enemies',passiveKey:'timeDilation',
  desc:'Time mage who bends reality itself'}
};

// v10.0 Class secondary passives — unlock at level 5 and 10
const CLASS_PASSIVES={
voidwalker:[
{lvl:5,desc:'Void Mark: Void Pulse marks enemies, marked take +25% dmg',key:'voidMark',f:()=>{P.voidMark=true}},
{lvl:10,desc:'Desperation: Below 25% HP, ability charges 3x faster',key:'voidDesperation',f:()=>{P.voidDesperation=true}}],
pyromancer:[
{lvl:5,desc:'Combustion: Burning enemies explode on death for AOE',key:'combustion',f:()=>{P.combustion=true}},
{lvl:10,desc:'Phoenix Blood: Fire damage heals you for 15%',key:'phoenixBlood',f:()=>{P.phoenixBlood=true}}],
shadowblade:[
{lvl:5,desc:'Backstab: 2x damage to enemies facing away from you',key:'backstab',f:()=>{P.backstab=true}},
{lvl:10,desc:'Kill Dash: Kills during dash reset dash cooldown',key:'killDash',f:()=>{P.killDash=true}}],
warden:[
{lvl:5,desc:'Aegis: Shield regenerates 2x faster',key:'aegis',f:()=>{P.aegis=true;P.shieldRegen=(P.shieldRegen||1)*2}},
{lvl:10,desc:'Shield Nova: When shield breaks, stun all nearby enemies',key:'shieldNova',f:()=>{P.shieldNova=true}}],
chronomancer:[
{lvl:5,desc:'Time Vulnerable: Slowed enemies take +25% damage',key:'timeVulnerable',f:()=>{P.timeVulnerable=true}},
{lvl:10,desc:'Chrono Freeze: Using ability freezes all enemies for 1.5s',key:'chronoFreeze',f:()=>{P.chronoFreeze=true}}]
};

/* ═══════════════════════════════════════════════════
   BOSS LORE - Named bosses per biome
   ═══════════════════════════════════════════════════ */
const BOSS_LORE=[
{name:'WHISPER KING',title:'The Lost Counselor',desc:'Ruler of the lost voices. Each soul claimed adds to his chorus.',color:'#c8a0ff',
 attacks:['ghost_wave','soul_drain'],
 taunt:'Another voice for my chorus. How generous of the surface.',
 deathLine:'The voices... they are going quiet... I can hear my own thoughts again... thank you...'},
{name:'MYCELIUM TITAN',title:'The Garden\'s Dream',desc:'Born from centuries of decay, a living fungal network given terrible purpose.',color:'#44ff88',
 attacks:['toxic_zone','spore_burst'],
 taunt:'Grow... spread... everything is more beautiful when it is connected.',
 deathLine:'The roots are letting go... I remember sunlight... I remember flowers that did not scream...'},
{name:'INFERNO WARDEN',title:'The Seal-Breaker',desc:'Guardian of eternal flames, forged from a dying star\'s last breath.',color:'#ff6633',
 attacks:['flame_pillar','meteor_rain'],
 taunt:'I forged the chains that held this darkness. Now I AM the chains.',
 deathLine:'The seal... I tried to fix it... every day for three hundred years... it was never enough...'},
{name:'FROST SOVEREIGN',title:'The Bargainer',desc:'Last monarch of a frozen empire, entombed in living ice for eternity.',color:'#88ccff',
 attacks:['ice_wall','blizzard_ring'],
 taunt:'I made them immortal. Every single one. Is that not what a good queen does?',
 deathLine:'My people... they are thawing... let them rest...'},
{name:'VOID HERALD',title:'The First Sin',desc:'Envoy of nothingness. Where it walks, reality unravels into silence.',color:'#cc66ff',
 attacks:['reality_tear','void_beam'],
 taunt:'The Sovereign stirs. Every soul that falls feeds its awakening. Including yours.',
 deathLine:'I opened the door... three hundred years ago... I just wanted to understand...'},
{name:'VOID HEART',title:'The Wound Itself',desc:'The source of all corruption. The beating heart of the abyss. End it, and the void dies with it.',color:'#ffffff',
 attacks:['reality_collapse','singularity'],
 taunt:'I AM the wound. I AM the darkness between stars. You cannot kill what was never alive.',
 deathLine:'...'}];

// v10.0 Boss damage helper — respects armor, shield, parry, defensive perks
function bossHurtP(rawDmg,invF){if(P.inv>0)return;
if(P.parryWindow>0){const isPerfect=P.parryWindow>6;sfx('parry');P.parryCount=(P.parryCount||0)+1;tryWhisper('parry3',P.parryCount);P.parryWindow=0;P.parryCD=P.dMax||20;
const pCol=isPerfect?'#ffcc00':'#ffffff';ft(P.x,P.y-18,isPerfect?'PERFECT PARRY!':'PARRY!',pCol,isPerfect?1.5:1);emit(P.x,P.y,isPerfect?15:8,pCol,2,12,1.5);addShockwave(P.x,P.y,isPerfect?70:40,pCol,isPerfect?14:10);
if(isPerfect){slMo=0.3;hitSt=Math.max(hitSt,10);chromAb=6;flash('#ffcc00',.15);P.comboStep=2;P.comboTimer=25}return}
let dmg=Math.max(0.5,rawDmg-(P.arm||0));
if(P.shield>0){const ab=Math.min(P.shield,dmg);P.shield-=ab;dmg-=ab;P.shieldRegenT=60;
if(P.shield<=0&&P.shieldNova){for(const en of ents){const sd=Math.hypot(en.x-P.x,en.y-P.y);if(sd<80){en.frozen=40;en.fl=8}}
emitRing(P.x,P.y,20,'#06d6a0',4,16,2);addShockwave(P.x,P.y,80,'#06d6a0',12)}}
if(dmg>0){P.hp-=dmg;P.dmgTaken+=dmg;ft(P.x,P.y-14,`-${Math.ceil(dmg)}`,'#ff3366')}
P.inv=invF||15;sfx('hurt');shk=Math.min(8,rawDmg*1.5);
if(P.overcharge)abCh=Math.min(abMax,abCh+abMax*0.15);
if(P.thornCrown&&(P.thornCd||0)<=0){P.thornCd=30;
for(let ti=0;ti<8;ti++){const ta=Math.PI*2*ti/8;projs.push({x:P.x,y:P.y,vx:Math.cos(ta)*4,vy:Math.sin(ta)*4,dmg:2+P.bd,life:40,color:'#ff4466',size:3,enemy:0})}}
if(P.hp<=0)die();else if(P.hp<P.mhp*0.2)tryWhisper('lowHP')}

/* ═══════════════════════════════════════════════════
   BOSS BEHAVIORS — v7.0 Unique mechanics per boss
   ═══════════════════════════════════════════════════ */
// v10.0 Boss Phase Dialogue — 3 mid-fight lines per boss
const BOSS_PHASE_DIALOGUE={
0:{p75:"You dare strike the king of whispers? I have consumed a thousand minds...",
p50:"The voices grow louder. Can you hear them? They're screaming YOUR name.",
p25:"No... the chorus... they're abandoning me. Fine. I'll devour you MYSELF."},
1:{p75:"Your blows mean nothing. The mycelium network cannot be severed.",
p50:"Interesting... you've reached deeper than any surface dweller. The spores will remember you.",
p25:"The network... fracturing. If I fall, a thousand colonies die with me. Was this worth it?"},
2:{p75:"The flames acknowledge your strength. But strength alone won't save you here.",
p50:"You fight well. The last warden fell to complacency, not weakness. I will not make that mistake.",
p25:"The eternal flame... flickering. If it dies, the frozen ones below will wake. Do you understand what you're doing?"},
3:{p75:"Ice does not yield. It endures. As I have endured for ten thousand years.",
p50:"You melt what took millennia to build. Each crack releases something that should stay buried.",
p25:"Please... if you destroy me... promise me the ice will hold. Promise me they'll stay asleep."},
4:{p75:"Reality bends around me. Your attacks pass through dimensions I've forgotten.",
p50:"The tears in reality... they're spreading. Even I cannot control them now.",
p25:"We are both trapped in this collapsing space. Neither of us may leave whole."},
5:{p75:"You face the heart of the void itself. Everything you've fought was merely my dreaming.",
p50:"I feel my chains weakening. The guardians you slew... they were holding ME in place.",
p25:"FOOL. You've freed me. When I fully wake, your world becomes my shadow."}};
// v10.0 Narrative Whispers — "The Void Speaks"
const VOID_WHISPERS={firstKill:{t:"The void notices you.",c:1},
kills50:{t:"The walls remember your violence.",c:50},
kills100:{t:"A hundred souls. The abyss grows fat on your offerings.",c:100},
firstBoss:{t:"One chain broken. The abyss trembles.",c:1},
lowHP:{t:"The darkness closes in. It can taste your fear.",c:1},
deepFloor:{t:"You have gone deeper than any in a generation.",c:1},
highCombo:{t:"Magnificent. Even the void pauses to watch.",c:1},
weaponEvo:{t:"Your weapon drinks deep of the darkness. It hungers for more.",c:1},
firstSynergy:{t:"The elements align. The void shudders at your convergence.",c:1},
finalBoss:{t:"The heart of darkness awaits. This is why you descended.",c:1},
noDmgRoom:{t:"Perfection. The void holds its breath.",c:1},
parry3:{t:"You fight like the old guardians. They would be proud.",c:3},
doubleKill:{t:"Two lights extinguished as one. Efficient.",c:1},
corruption50:{t:"Your power feeds the abyss. It is pleased.",c:1},
contractDone:{t:"A bargain honored. The depths remember.",c:1}};
let whispersFired={},whisperQ=null,whisperT=0;
function tryWhisper(key,count){if(whispersFired[key])return;const w=VOID_WHISPERS[key];if(!w)return;
if((count||1)>=w.c){whispersFired[key]=true;whisperQ=w.t;whisperT=180}}
const BOSS_BEHAVIORS={
// 0: WHISPER KING — mirror clones, mind swap, ghost chorus, soul drain beam
0:{update(e,sdt,dist,ang,fr){
const circA=ang+Math.PI/2;
if(dist>120){e.vx+=Math.cos(ang)*e.spd*.08*sdt;e.vy+=Math.sin(ang)*e.spd*.08*sdt}
else if(dist<70){e.vx-=Math.cos(ang)*e.spd*.06*sdt;e.vy-=Math.sin(ang)*e.spd*.06*sdt}
e.vx+=Math.cos(circA)*e.spd*.04*sdt;e.vy+=Math.sin(circA)*e.spd*.04*sdt;
// Mind Swap: reverse player controls
e._mindCd=(e._mindCd||250)-sdt;
if(e._mindCd<=0&&e.phase50){e._mindCd=e.enraged?150:250;
P.mindSwapped=60;flash('#cc44ff',.3);ft(P.x,P.y-30,'MIND TWISTED','#cc44ff',1);sfx('warn');emit(P.x,P.y,12,'#cc44ff',3,20,2)}
// Ghost Chorus: closing ring of projectiles on player
e._chorusCd=(e._chorusCd||180)-sdt;
if(e._chorusCd<=0){e._chorusCd=e.enraged?100:180;const cx=P.x,cy=P.y;
for(let g=0;g<8;g++){const ga=Math.PI*2/8*g,gd=120;
projs.push({x:cx+Math.cos(ga)*gd,y:cy+Math.sin(ga)*gd,vx:-Math.cos(ga)*1.8,vy:-Math.sin(ga)*1.8,dmg:e.dmg*.8,life:80,color:'#c8a0ff',size:5,enemy:1})}
sfx('warn');emit(e.x,e.y,6,'#c8a0ff',2,12,1.5)}
// Soul drain beam
if(e._beamT>0){e._beamT-=sdt;e._beamAng+=(ang-e._beamAng)*0.04*sdt;
for(let bd=0;bd<140;bd+=8){const bx=e.x+Math.cos(e._beamAng)*bd,by=e.y+Math.sin(e._beamAng)*bd;
if(Math.hypot(bx-P.x,by-P.y)<14&&P.inv<=0){bossHurtP(0.15*sdt,4);break}}
if(fr%2===0){const bd2=Math.random()*120;emit(e.x+Math.cos(e._beamAng)*bd2,e.y+Math.sin(e._beamAng)*bd2,1,'#c8a0ff',1,8,1.5)}}
// Phase attacks
e.timer-=sdt;if(e.timer<=0){e.phase=(e.phase+1)%4;e.timer=e.enraged?45:70;
if(e.phase===0){e._beamT=45;e._beamAng=ang;sfx('warn');ft(e.x,e.y-30,'SOUL DRAIN','#c8a0ff',1)}
else if(e.phase===1){const n=e.enraged?14:10;for(let a=0;a<n;a++){const ba=Math.PI*2/n*a;
projs.push({x:e.x,y:e.y,vx:Math.cos(ba)*2.5,vy:Math.sin(ba)*2.5,dmg:e.dmg,life:80,color:'#c8a0ff',size:5,enemy:1})}}
else if(e.phase===2){e.x=P.x-Math.cos(ang)*70;e.y=P.y-Math.sin(ang)*70;
emit(e.x,e.y,12,'#c8a0ff',3,14,2);sfx('temporal')}
else{for(let s=0;s<2;s++){const sa=Math.random()*Math.PI*2;ents.push(mkE('wraith',e.x+Math.cos(sa)*50,e.y+Math.sin(sa)*50))}}}
// Spawn clones at 75% and 25%
if(e.phase75&&!e._clones1){e._clones1=true;
for(let c=0;c<2;c++){const ca=Math.PI*2/2*c;const cl=mkE('boss',e.x+Math.cos(ca)*50,e.y+Math.sin(ca)*50);
cl.hp=1;cl.mhp=1;cl.isClone=true;cl._cloneAlpha=0.3;cl.dmg=1;cl.bossIdx=0;cl.bossName='WHISPER CLONE';ents.push(cl)}
ft(e.x,e.y-20,'MIRROR IMAGES!','#c8a0ff',1);sfx('warn')}
if(e.phase25&&!e._clones2){e._clones2=true;
for(let c=0;c<3;c++){const ca=Math.PI*2/3*c;const cl=mkE('boss',e.x+Math.cos(ca)*60,e.y+Math.sin(ca)*60);
cl.hp=1;cl.mhp=1;cl.isClone=true;cl._cloneAlpha=0.2;cl.dmg=2;cl.bossIdx=0;cl.bossName='WHISPER CLONE';ents.push(cl)}
ft(e.x,e.y-20,'SHADOW CHORUS!','#c8a0ff',1);sfx('warn')}}},
// 1: MYCELIUM TITAN — fungal growth, root grab, spore burst, bloom heal
1:{update(e,sdt,dist,ang,fr){
if(dist>60){e.vx+=Math.cos(ang)*e.spd*.05*sdt;e.vy+=Math.sin(ang)*e.spd*.05*sdt}
// Creeping Mycelium: toxic floor tiles
e._mycCd=(e._mycCd||80)-sdt;
if(e._mycCd<=0){e._mycCd=e.enraged?30:80;
const mx2=Math.floor(e.x/TS),my2=Math.floor(e.y/TS);const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]];
const d=dirs[Math.floor(Math.random()*dirs.length)];const nx=mx2+d[0],ny=my2+d[1];
if(nx>0&&nx<RW-1&&ny>0&&ny<RH-1&&cR.tiles[ny][nx]===0){
e.arenaHazards.push({x:nx*TS+TS/2,y:ny*TS+TS/2,htype:'toxic_pool',life:600,rad:20});emit(nx*TS+TS/2,ny*TS+TS/2,4,'#44ff88',1,10,1)}}
// Root Grab: ground eruption at player
e._rootCd=(e._rootCd||200)-sdt;
if(e._rootCd<=0&&dist<200){e._rootCd=e.enraged?120:200;
e._rootTarg={x:P.x,y:P.y,t:30};emit(P.x,P.y,6,'#44ff88',1,30,1.5);sfx('warn');
parts.push({x:P.x,y:P.y,vx:0,vy:0,life:30,ml:30,color:'rgba(68,255,136,0.15)',size:22,shape:'circle',telegraph:true})}
if(e._rootTarg){e._rootTarg.t-=sdt;if(e._rootTarg.t<=0){const rt=e._rootTarg;
if(Math.hypot(P.x-rt.x,P.y-rt.y)<22&&P.inv<=0){bossHurtP(2,20);P.rooted=60;
ft(P.x,P.y-14,'ROOTED!','#44ff88',1)}
emit(rt.x,rt.y,10,'#44ff88',4,16,2);addShockwave(rt.x,rt.y,40,'#44ff88',12);e._rootTarg=null}}
// Fungal Bloom: heal + armor
if(e._bloomT>0){e._bloomT-=sdt;
if(fr%10===0){e.hp=Math.min(e.mhp,e.hp+e.mhp*0.005);emit(e.x,e.y,2,'#44ff88',1,10,1)}
if(e._bloomT<=0){e.armor=Math.max(1,e.armor-3);e.spd=e._origSpd||e.spd;ft(e.x,e.y-20,'BLOOM ENDED','#44ff88')}}
// Phase attacks
e.timer-=sdt;if(e.timer<=0){e.phase=(e.phase+1)%4;e.timer=e.enraged?50:75;
if(e.phase===0){const n=e.enraged?12:8;for(let a=0;a<n;a++){const ba=Math.PI*2/n*a;
projs.push({x:e.x,y:e.y,vx:Math.cos(ba)*2,vy:Math.sin(ba)*2,dmg:e.dmg*.7,life:90,color:'#66ff44',size:6,enemy:1})}
emit(e.x,e.y,10,'#66ff44',3,16,2)}
else if(e.phase===1){e._bloomT=80;e._origSpd=e._origSpd||e.spd;e.armor+=3;e.spd*=0.3;
ft(e.x,e.y-20,'FUNGAL BLOOM','#44ff88',1);sfx('warn');emit(e.x,e.y,15,'#44ff88',2,30,2)}
else if(e.phase===2){for(let t=-4;t<=4;t++)projs.push({x:e.x,y:e.y,vx:Math.cos(ang+t*.15)*3.5,vy:Math.sin(ang+t*.15)*3.5,dmg:e.dmg,life:60,color:'#44ff88',size:5,enemy:1})}
else{for(let s=0;s<(e.enraged?4:2);s++){const sa=Math.random()*Math.PI*2;
ents.push(mkE('spider',e.x+Math.cos(sa)*40,e.y+Math.sin(sa)*40))}emit(e.x,e.y,8,e.color,3,14,2)}}}},
// 2: INFERNO WARDEN — shrinking lava arena, flame dash chain, meteor barrage
2:{update(e,sdt,dist,ang,fr){
if(dist>40){e.vx+=Math.cos(ang)*e.spd*.09*sdt;e.vy+=Math.sin(ang)*e.spd*.09*sdt}
// Shrinking Arena: convert outer tiles to lava
e._lavaCd=(e._lavaCd||600)-sdt;
if(e._lavaCd<=0){e._lavaCd=e.enraged?400:600;e._lavaRing=(e._lavaRing||0)+1;const ring=e._lavaRing;
for(let ty=0;ty<RH;ty++)for(let tx=0;tx<RW;tx++){
if((tx<ring||tx>=RW-ring||ty<ring||ty>=RH-ring)&&cR.tiles[ty][tx]===0){cR.tiles[ty][tx]=2;
if(Math.random()<0.3)emit(tx*TS+TS/2,ty*TS+TS/2,3,'#ff6633',1,10,1)}}
if(ring<=3){ft(e.x,e.y-30,'ARENA SHRINKS!','#ff6633',1);sfx('warn');addShockwave(e.x,e.y,100,'#ff6633',15)}}
// Flame Dash Chain: 3 rapid dashes leaving fire
e._dashCd=(e._dashCd||180)-sdt;
if(e._dashCd<=0&&dist<200){e._dashCd=e.enraged?100:180;e._dashQueue=3;e._dashTimer=0;
ft(e.x,e.y-20,'FLAME DASH!','#ff6633',1);sfx('warn')}
if(e._dashQueue>0){e._dashTimer-=sdt;if(e._dashTimer<=0){e._dashQueue--;e._dashTimer=12;
const da=Math.atan2(P.y-e.y,P.x-e.x);
for(let ft2=0;ft2<4;ft2++){e.arenaHazards.push({x:e.x-Math.cos(da)*ft2*12,y:e.y-Math.sin(da)*ft2*12,htype:'fire_pillar',life:180,rad:15})}
e.vx=Math.cos(da)*14;e.vy=Math.sin(da)*14;emit(e.x,e.y,8,'#ff6633',4,10,2);shk=4}}
// Eruption under player
if(e._eruptPos){e._eruptPos.t-=sdt;if(e._eruptPos.t<=0){const ep=e._eruptPos;
emit(ep.x,ep.y,20,'#ff6633',6,18,3);addShockwave(ep.x,ep.y,60,'#ff6633',15);shk=10;
if(P.inv<=0&&Math.hypot(P.x-ep.x,P.y-ep.y)<45){bossHurtP(4,20);
const ka=Math.atan2(P.y-ep.y,P.x-ep.x);P.vx+=Math.cos(ka)*8;P.vy+=Math.sin(ka)*8}
e._eruptPos=null}}
// Phase attacks
e.timer-=sdt;if(e.timer<=0){e.phase=(e.phase+1)%4;e.timer=e.enraged?40:65;
if(e.phase===0){const mN=e.enraged?10:6;for(let m=0;m<mN;m++){const mmx=P.x+(Math.random()-.5)*80,mmy=P.y+(Math.random()-.5)*80;
parts.push({x:mmx,y:mmy,vx:0,vy:0,life:m*8+20,ml:m*8+20,color:'rgba(255,60,30,0.15)',size:25,shape:'circle',telegraph:true});
setTimeout(()=>{if(gSt==='playing'){emit(mmx,mmy,12,'#ff6633',4,16,2);addShockwave(mmx,mmy,35,'#ff6633',10);
if(P.inv<=0&&Math.hypot(mmx-P.x,mmy-P.y)<28){bossHurtP(2.5,15)}
e.arenaHazards.push({x:mmx,y:mmy,htype:'fire_pillar',life:240,rad:12})}},m*200+400)}
ft(e.x,e.y-30,'METEOR BARRAGE!','#ff6633',1);sfx('warn')}
else if(e.phase===1){e._eruptPos={x:P.x,y:P.y,t:40};
parts.push({x:P.x,y:P.y,vx:0,vy:0,life:40,ml:40,color:'rgba(255,100,30,0.2)',size:50,shape:'circle',telegraph:true});sfx('warn')}
else if(e.phase===2){const n=e.enraged?16:10;for(let a=0;a<n;a++){const ba=Math.PI*2/n*a;
projs.push({x:e.x,y:e.y,vx:Math.cos(ba)*3,vy:Math.sin(ba)*3,dmg:e.dmg,life:70,color:'#ff6633',size:5,enemy:1})}}
else{e.vx=Math.cos(ang)*12;e.vy=Math.sin(ang)*12;shk=8;emit(e.x,e.y,12,'#ff6633',5,12,2)}}}},
// 3: FROST SOVEREIGN — ice castle walls, blizzard vortex, ABSOLUTE ZERO
3:{update(e,sdt,dist,ang,fr){
if(dist<100){e.vx-=Math.cos(ang)*e.spd*.06*sdt;e.vy-=Math.sin(ang)*e.spd*.06*sdt}
else if(dist>180){e.vx+=Math.cos(ang)*e.spd*.05*sdt;e.vy+=Math.sin(ang)*e.spd*.05*sdt}
// Ice Castle: build L-shaped ice walls near player
e._wallCd=(e._wallCd||150)-sdt;
if(e._wallCd<=0){e._wallCd=e.enraged?80:150;
const wx=Math.floor(P.x/TS),wy=Math.floor(P.y/TS);
const shapes=[[[0,0],[1,0],[0,1]],[[0,0],[-1,0],[0,1]],[[0,0],[0,-1],[1,0]],[[0,0],[0,-1],[-1,0]]];
const sh=shapes[Math.floor(Math.random()*shapes.length)];const ox=(Math.random()*3-1)|0,oy=(Math.random()*3-1)|0;
for(const[dx,dy]of sh){const tx=wx+dx+ox,ty=wy+dy+oy;
if(tx>1&&tx<RW-2&&ty>1&&ty<RH-2&&cR.tiles[ty][tx]===0){cR.tiles[ty][tx]=1;
emit(tx*TS+TS/2,ty*TS+TS/2,4,'#88ccff',2,10,1.5);
setTimeout(()=>{if(cR&&cR.tiles[ty])cR.tiles[ty][tx]=0;},8000)}}sfx('freeze')}
// Blizzard Vortex
e._blizCd=(e._blizCd||250)-sdt;
if(e._blizCd<=0){e._blizCd=e.enraged?150:250;
e.arenaHazards.push({x:P.x,y:P.y,htype:'ice_patch',life:180,rad:60});
ft(P.x,P.y-30,'BLIZZARD!','#88ccff',1);sfx('warn');
for(let ic=0;ic<12;ic++){const ia=Math.PI*2/12*ic;
projs.push({x:P.x+Math.cos(ia)*60,y:P.y+Math.sin(ia)*60,vx:-Math.cos(ia)*1.5+Math.cos(ia+Math.PI/2)*1,vy:-Math.sin(ia)*1.5+Math.sin(ia+Math.PI/2)*1,dmg:e.dmg*.6,life:70,color:'#aaddff',size:4,enemy:1})}}
// ABSOLUTE ZERO — 50% HP, once — the visual centerpiece
if(e.phase50&&!e._azDone){e._azDone=true;e._azT=90;
msg('A B S O L U T E &nbsp; Z E R O',1800);sfx('boss_phase');hitSt=30;slMo=0.01;chromAb=20}
if(e._azT>0){e._azT-=1;
if(e._azT>60){P.vx*=0.8;P.vy*=0.8;for(const p of projs){p.vx*=0.9;p.vy*=0.9}for(const pt of parts){pt.vx*=0.9;pt.vy*=0.9}}
else if(e._azT===60){flash('#ffffff',1);shk=40;chromAb=25;slMo=60;
addShockwave(e.x,e.y,300,'#ffffff',30);addShockwave(e.x,e.y,200,'#88ccff',25);addShockwave(e.x,e.y,100,'#4488ff',20);
for(let sh2=0;sh2<100;sh2++){const sa=Math.random()*Math.PI*2,ss=3+Math.random()*8;
parts.push({x:e.x,y:e.y,vx:Math.cos(sa)*ss,vy:Math.sin(sa)*ss,life:50+Math.random()*40,ml:90,color:['#ffffff','#88ccff','#aaddff','#4488ff'][sh2%4],size:2+Math.random()*4,shape:'rect'})}
for(const en of ents){if(en!==e&&!en.isClone){en.frozen=120;en.fl=20}}
const pd=Math.hypot(P.x-e.x,P.y-e.y);if(pd<150&&P.inv<=0){bossHurtP(3,30)}
sfx('boss_death')}}
// Phase attacks (skip during Absolute Zero)
e.timer-=sdt;if(e.timer<=0&&!(e._azT>0)){e.phase=(e.phase+1)%4;e.timer=e.enraged?45:70;
if(e.phase===0){for(let il=0;il<5;il++){setTimeout(()=>{if(gSt==='playing'&&e.hp>0){
const la=Math.atan2(P.y-e.y,P.x-e.x);projs.push({x:e.x,y:e.y,vx:Math.cos(la)*4.5,vy:Math.sin(la)*4.5,dmg:e.dmg*1.2,life:60,color:'#88ccff',size:7,enemy:1});sfx('shoot')}},il*180)}}
else if(e.phase===1){const n=e.enraged?14:10;for(let a=0;a<n;a++){const ba=Math.PI*2/n*a;
projs.push({x:e.x,y:e.y,vx:Math.cos(ba)*2.5,vy:Math.sin(ba)*2.5,dmg:e.dmg,life:80,color:'#88ccff',size:5,enemy:1})}}
else if(e.phase===2){const ta=Math.random()*Math.PI*2;e.x=RPX/2+Math.cos(ta)*80;e.y=RPY/2+Math.sin(ta)*80;
emit(e.x,e.y,12,'#88ccff',3,14,2);sfx('temporal');
for(let ir=0;ir<8;ir++){const ia=Math.PI*2/8*ir;projs.push({x:e.x,y:e.y,vx:Math.cos(ia)*2,vy:Math.sin(ia)*2,dmg:e.dmg*.7,life:60,color:'#aaddff',size:4,enemy:1})}}
else{for(let s=0;s<(e.enraged?3:2);s++){const sa=Math.random()*Math.PI*2;
ents.push(mkE('mage',e.x+Math.cos(sa)*45,e.y+Math.sin(sa)*45))}emit(e.x,e.y,8,e.color,3,14,2)}}}},
// 4: VOID HERALD — dimensional tears, reality shear beam, void implosion
4:{update(e,sdt,dist,ang,fr){
// Erratic teleportation-based movement
e._telCd=(e._telCd||130)-sdt;
if(e._telCd<=0){e._telCd=e.enraged?80:130;const ta=Math.random()*Math.PI*2,td=60+Math.random()*80;
e.x=Math.max(50,Math.min(RPX-50,P.x+Math.cos(ta)*td));e.y=Math.max(50,Math.min(RPY-50,P.y+Math.sin(ta)*td));
emit(e.x,e.y,10,'#cc66ff',3,14,2)}
// Dimensional Tears: persistent gravity well portals
e._tearCd=(e._tearCd||200)-sdt;
if(e._tearCd<=0&&e.arenaHazards.filter(h=>h.htype==='gravity_well').length<3){e._tearCd=e.enraged?120:200;
const tx=60+Math.random()*(RPX-120),ty=60+Math.random()*(RPY-120);
e.arenaHazards.push({x:tx,y:ty,htype:'gravity_well',life:480,rad:55});
emit(tx,ty,8,'#cc66ff',2,20,2);sfx('warn');ft(tx,ty-20,'TEAR','#cc66ff')}
// Reality Shear: room-spanning beam
if(e._shearT>0){e._shearT-=sdt;
if(e._shearT<=50&&e._shearT>0){const ba=e._shearAng;
for(let bd=-RPX;bd<RPX;bd+=10){const bx=e.x+Math.cos(ba)*bd,by=e.y+Math.sin(ba)*bd;
if(Math.hypot(bx-P.x,by-P.y)<18&&P.inv<=0){bossHurtP(0.2*sdt,4);
if(Math.random()<0.1){P.x=60+Math.random()*(RPX-120);P.y=60+Math.random()*(RPY-120);ft(P.x,P.y-14,'DISPLACED','#cc66ff');chromAb=8}
break}}
if(fr%2===0){const bd2=Math.random()*RPX;emit(e.x+Math.cos(ba)*bd2,e.y+Math.sin(ba)*bd2,1,'#cc66ff',1,6,1.5)}}}
// Void Implosion
if(e._implodePos){e._implodePos.t-=sdt;const ip=e._implodePos;
if(ip.t>20){const pd=Math.hypot(P.x-ip.x,P.y-ip.y);
if(pd<120&&pd>5){const ga=Math.atan2(ip.y-P.y,ip.x-P.x);P.vx+=Math.cos(ga)*0.6;P.vy+=Math.sin(ga)*0.6}
if(fr%3===0){const pa=Math.random()*Math.PI*2;parts.push({x:ip.x+Math.cos(pa)*80,y:ip.y+Math.sin(pa)*80,vx:-Math.cos(pa)*3,vy:-Math.sin(pa)*3,life:20,ml:20,color:'#cc66ff',size:2,shape:'circle'})}}
else if(ip.t<=20&&ip.t>18){emit(ip.x,ip.y,25,'#cc66ff',6,20,3);addShockwave(ip.x,ip.y,100,'#cc66ff',18);addShockwave(ip.x,ip.y,60,'#ffffff',12);
flash('#cc66ff',.3);shk=12;chromAb=6;
for(let vp=0;vp<20;vp++){const va=Math.PI*2/20*vp;projs.push({x:ip.x,y:ip.y,vx:Math.cos(va)*3.5,vy:Math.sin(va)*3.5,dmg:e.dmg*1.2,life:60,color:'#cc66ff',size:5,enemy:1})}}
if(ip.t<=0)e._implodePos=null}
// Spiral projectile queue
if(e._spiralQueue>0&&fr%2===0){e._spiralQueue--;const sa2=Math.PI*2/20*(20-e._spiralQueue)+e.age*.01;
projs.push({x:e.x,y:e.y,vx:Math.cos(sa2)*3,vy:Math.sin(sa2)*3,dmg:e.dmg,life:70,color:'#cc66ff',size:4,enemy:1})}
// Phase attacks
e.timer-=sdt;if(e.timer<=0){e.phase=(e.phase+1)%4;e.timer=e.enraged?40:65;
if(e.phase===0){e._implodePos={x:e.x,y:e.y,t:60};ft(e.x,e.y-30,'VOID IMPLOSION','#cc66ff',1);sfx('warn');addDynLight(e.x,e.y,100,'#cc66ff',2,0.3,0)}
else if(e.phase===1){e._spiralQueue=20;e._spiralAngle=e.age*.01}
else if(e.phase===2){for(let ed=0;ed<4;ed++){const ex2=Math.floor(P.x/TS)+(Math.random()*4-2|0),ey2=Math.floor(P.y/TS)+(Math.random()*4-2|0);
if(ex2>0&&ex2<RW-1&&ey2>0&&ey2<RH-1&&cR.tiles[ey2][ex2]===0){
e.arenaHazards.push({x:ex2*TS+TS/2,y:ey2*TS+TS/2,htype:'ghost_wall',life:300,rad:22});
parts.push({x:ex2*TS+TS/2,y:ey2*TS+TS/2,vx:0,vy:0,life:40,ml:40,color:'rgba(200,100,255,0.15)',size:22,shape:'rect',telegraph:true})}}
ft(P.x,P.y+20,'REALITY FRACTURES','#cc66ff');sfx('warn')}
else{for(let b=-3;b<=3;b++)projs.push({x:e.x,y:e.y,vx:Math.cos(ang+b*.18)*4,vy:Math.sin(ang+b*.18)*4,dmg:e.dmg,life:75,color:'#cc66ff',size:4,enemy:1})}}
// Reality Shear initiation
e._shearCd=(e._shearCd||300)-sdt;
if(e._shearCd<=0){e._shearCd=e.enraged?180:300;e._shearAng=ang;e._shearT=80;
ft(e.x,e.y-30,'REALITY SHEAR','#cc66ff',1);sfx('warn')}}}
,
// 5: VOID HEART — Final Boss. Reality collapse, echo army, singularity
5:{update(e,sdt,dist,ang,fr){
// Phase 1 (100-50%): Reality Collapse — erratic teleport + spiral projectiles + floor destruction
if(!e.phase50){
e._telCd2=(e._telCd2||90)-sdt;
if(e._telCd2<=0){e._telCd2=e.enraged?50:90;const ta2=Math.random()*Math.PI*2,td2=80+Math.random()*60;
e.x=Math.max(60,Math.min(RPX-60,RPX/2+Math.cos(ta2)*td2));e.y=Math.max(60,Math.min(RPY-60,RPY/2+Math.sin(ta2)*td2));
emit(e.x,e.y,12,'#ffffff',3,14,2);sfx('temporal')}
// Destroy random floor tiles
e._collapseCd=(e._collapseCd||120)-sdt;
if(e._collapseCd<=0){e._collapseCd=e.enraged?60:120;
for(let cc=0;cc<3;cc++){const tx2=2+Math.floor(Math.random()*(RW-4)),ty2=2+Math.floor(Math.random()*(RH-4));
if(cR.tiles[ty2][tx2]===0){cR.tiles[ty2][tx2]=1;emit(tx2*TS+TS/2,ty2*TS+TS/2,6,'#ffffff',2,12,1.5);sfx('smash')}}}
e.timer-=sdt;if(e.timer<=0){e.phase=(e.phase+1)%3;e.timer=e.enraged?40:60;
if(e.phase===0){e._spiralN=24;e._spiralBase=e.age*.02}
else if(e.phase===1){for(let n2=0;n2<16;n2++){const ba2=Math.PI*2/16*n2;
projs.push({x:e.x,y:e.y,vx:Math.cos(ba2)*3,vy:Math.sin(ba2)*3,dmg:e.dmg,life:80,color:'#ffffff',size:5,enemy:1})}}
else{const la2=Math.atan2(P.y-e.y,P.x-e.x);for(let b2=-4;b2<=4;b2++)
projs.push({x:e.x,y:e.y,vx:Math.cos(la2+b2*.12)*4.5,vy:Math.sin(la2+b2*.12)*4.5,dmg:e.dmg*1.2,life:60,color:'#ffaaff',size:5,enemy:1})}}
if(e._spiralN>0&&fr%2===0){e._spiralN--;const sa3=e._spiralBase+Math.PI*2/24*(24-e._spiralN);
projs.push({x:e.x,y:e.y,vx:Math.cos(sa3)*2.5,vy:Math.sin(sa3)*2.5,dmg:e.dmg*.8,life:80,color:'#cc88ff',size:4,enemy:1})}}
// Phase 2 (50-25%): Echo Army — summon shadow bosses
if(e.phase50&&!e.phase25){
if(!e._echoSummoned){e._echoSummoned=true;
msg('ECHOES OF THE FALLEN',1600);sfx('boss_phase');flash('#ffffff',.4);shk=20;chromAb=10;
for(let eb=0;eb<3;eb++){const ea2=Math.PI*2/3*eb,ed2=90;
const echo=mkE('boss',RPX/2+Math.cos(ea2)*ed2,RPY/2+Math.sin(ea2)*ed2);
echo.hp=Math.ceil(e.mhp*0.12);echo.mhp=echo.hp;echo.isClone=true;echo._cloneAlpha=0.4;
echo.dmg=Math.ceil(e.dmg*0.6);echo.bossIdx=eb%5;echo.bossName=['WHISPER ECHO','TITAN ECHO','INFERNO ECHO'][eb];
echo.color=['#c8a0ff','#44ff88','#ff6633'][eb];ents.push(echo)}
addShockwave(e.x,e.y,200,'#ffffff',25)}
// Stay in center, pulse damage
e.x+=(RPX/2-e.x)*0.02*sdt;e.y+=(RPY/2-e.y)*0.02*sdt;
e.timer-=sdt;if(e.timer<=0){e.timer=50;const n3=12;
for(let a3=0;a3<n3;a3++){const ba3=Math.PI*2/n3*a3+e.age*.01;
projs.push({x:e.x,y:e.y,vx:Math.cos(ba3)*2,vy:Math.sin(ba3)*2,dmg:e.dmg*.7,life:90,color:'#ffffff',size:4,enemy:1})}}}
// Phase 3 (25-0%): Singularity — black hole pull + orbiting crystals
if(e.phase25){
if(!e._singularityStarted){e._singularityStarted=true;
msg('S I N G U L A R I T Y',2000);sfx('boss_phase');flash('#000000',.5);shk=30;chromAb=20;slMo=0.01;
// Restore floor tiles for final phase
for(let ry2=1;ry2<RH-1;ry2++)for(let rx2=1;rx2<RW-1;rx2++){if(cR.tiles[ry2][rx2]===1){
const isOrig=rx2===0||rx2===RW-1||ry2===0||ry2===RH-1;if(!isOrig)cR.tiles[ry2][rx2]=0}}
e.x=RPX/2;e.y=RPY/2;e.spd=0;
// Create orbiting crystals (must destroy to damage boss in this phase)
e._crystals=[];for(let c2=0;c2<4;c2++){e._crystals.push({angle:Math.PI*2/4*c2,dist:100,hp:Math.ceil(e.mhp*0.04),alive:true})}}
// Black hole pull on player
const pd2=Math.hypot(P.x-e.x,P.y-e.y);
if(pd2>20&&pd2<250){const ga2=Math.atan2(e.y-P.y,e.x-P.x);P.vx+=Math.cos(ga2)*0.4;P.vy+=Math.sin(ga2)*0.4}
// Contact damage
if(pd2<30&&P.inv<=0){P.hp-=1.5;P.dmgTaken+=1.5;P.inv=15;ft(P.x,P.y-14,'-1.5','#ffffff');sfx('hurt');if(P.hp<=0)die()}
// Orbit crystals + check projectile hits on crystals
if(e._crystals){let allDead=true;
for(const cr of e._crystals){if(!cr.alive)continue;allDead=false;
cr.angle+=0.02*sdt;const cx2=e.x+Math.cos(cr.angle)*cr.dist,cy2=e.y+Math.sin(cr.angle)*cr.dist;
if(fr%3===0)emit(cx2,cy2,1,'#ffcc00',0.5,8,2);
// Check player projectile hits on crystal
for(let pi2=projs.length-1;pi2>=0;pi2--){const pr2=projs[pi2];if(pr2.enemy)continue;
if(Math.hypot(pr2.x-cx2,pr2.y-cy2)<18){cr.hp--;projs.splice(pi2,1);sfx('hit');emit(cx2,cy2,4,'#ffcc00',2,10,1.5);
if(cr.hp<=0){cr.alive=false;sfx('smash');addShockwave(cx2,cy2,60,'#ffcc00',15);emit(cx2,cy2,16,'#ffcc00',4,18,2.5);
e.hp-=Math.ceil(e.mhp*0.04);if(e.hp<=0){e.hp=0}}}}}
// Make boss invulnerable while crystals exist
if(!allDead)e._shielded=true;else{e._shielded=false;
// Desperation attacks when crystals gone
e.timer-=sdt;if(e.timer<=0){e.timer=30;
for(let a4=0;a4<20;a4++){const ba4=Math.PI*2/20*a4+e.age*.015;
projs.push({x:e.x,y:e.y,vx:Math.cos(ba4)*3.5,vy:Math.sin(ba4)*3.5,dmg:e.dmg*1.3,life:70,color:'#ffffff',size:5,enemy:1})}}}}
// Ambient particles
if(fr%2===0){const pa2=Math.random()*Math.PI*2;
parts.push({x:e.x+Math.cos(pa2)*40,y:e.y+Math.sin(pa2)*40,vx:-Math.cos(pa2)*1,vy:-Math.sin(pa2)*1,life:15,ml:15,color:'#ffffff',size:1.5,shape:'circle'})}}}
}};

/* ═══════════════════════════════════════════════════
   LORE & STORY DATA
   ═══════════════════════════════════════════════════ */

const LORE_TABLETS=[
{title:'THE FIRST DESCENT',text:'They sent twelve knights into the void. Only silence returned. Then the whispers began, speaking in voices the living recognized.'},
{title:'THE CITADEL\'S SIN',text:'The citadel was built upon a wound in reality. Its founders knew. They built it anyway, hoping to harness what leaked through.'},
{title:'VOID CORRUPTION',text:'The void does not destroy. It transforms. Every creature here was once something else — something that wandered too deep.'},
{title:'THE MERCHANT\'S OATH',text:'I trade in these depths by ancient compact. The void permits my existence so long as I never leave, never rest, never remember.'},
{title:'ECHOES OF POWER',text:'The weapons scattered through these halls were carried by previous delvers. Their power persists, even as their wielders do not.'},
{title:'THE BIOME THEORY',text:'Scholars believe each biome represents a different layer of corrupted reality, each shaped by the dominant will that claimed it.'},
{title:'FROZEN MEMORIES',text:'The Frozen Abyss was once a thriving kingdom. Its queen made a bargain with the void. The frost was the price.'},
{title:'FUNGAL DREAMS',text:'The fungal growths are not plants. They are the dreams of something vast and sleeping beneath the deepest floor.'},
{title:'THE FORGE ETERNAL',text:'Void-touched metal can be reforged endlessly, growing stronger each time. But each tempering costs a piece of the wielder\'s warmth.'},
{title:'THE FINAL FLOOR',text:'No one has reached the bottom. Perhaps there is no bottom. Perhaps the void simply continues, folding in on itself forever.'}];

// v10.0 Connected ghost NPC narrative — biome-indexed, floor-aware
const GHOST_NARRATIVES=[
// Biome 0: Crypt of Whispers (floors 1-3) — foreshadows Whisper King
{speaker:'SIR GAVIN',color:'rgba(180,200,255,0.6)',lines:[
'I was among the first twelve sent down. We thought swords would be enough. We were fools.',
'These were the Citadel\'s grand halls once. Lord Aldric held court here. Now his stolen voices echo endlessly.',
'The Whisper King uses your memories against you. If you hear a familiar voice calling — run.']},
// Biome 1: Fungal Caverns (floors 4-6) — foreshadows Mycelium Titan
{speaker:'THERA\'S APPRENTICE',color:'rgba(100,220,140,0.5)',lines:[
'My master Thera believed the Void could make anything grow. She was right, in the worst way.',
'Every spore carries a fragment of her consciousness. She dreams the fungus into being.',
'She is not evil. She simply cannot stop growing. The Void feeds her hunger endlessly.']},
// Biome 2: Infernal Depths (floors 7-9) — foreshadows Inferno Warden
{speaker:'KAEL\'S DAUGHTER',color:'rgba(255,180,120,0.5)',lines:[
'My father was the forge-master. Every day he reforged the seal. Every day it grew weaker.',
'He knew by the third year it was hopeless. He continued for three hundred more.',
'When the seal broke... the look on his face. Not surprise. Relief. He was so tired of pretending.']},
// Biome 3: Frozen Abyss (floors 10-12) — foreshadows Frost Sovereign
{speaker:'CAPTAIN ELENA',color:'rgba(120,180,255,0.5)',lines:[
'Queen Selara was not evil. She was desperate. Her people were dying of plague.',
'Immortality through ice. They are still alive in there. Aware. Screaming silently for three hundred years.',
'She guards them still. Not because the Void commands it — because she believes she saved them.']},
// Biome 4: Void Nexus (floors 13+) — foreshadows Void Herald / Void Heart
{speaker:'BROTHER KETH',color:'rgba(200,140,255,0.5)',lines:[
'The High Priest heard something in his prayers. Not a god. Something older.',
'He opened the wound believing it was a door to understanding. The Void is not a place you visit.',
'At the very bottom, the wound itself has grown a mind. The Void Sovereign stirs, fed by every soul that falls.']}
];
const GHOST_DIALOGUE_EXTRA=[
'Time has no meaning here. I have been dead for an eternity, or perhaps a moment.',
'The bosses were not always monsters. Remember that, when you face them.',
'If you find a forge, use it wisely. Each tempering binds you deeper to this place.',
'Do not trust the silence between floors. That is when the Void listens.'];

const MERCHANT_LINES=[
'Ah, another brave soul... or foolish one. Same difference down here.',
'Gold flows freely in the depths. Life, less so. Choose your purchases wisely.',
'My wares are pulled from the void itself. Quality guaranteed... mostly.',
'You remind me of someone. Everyone does. I think that is the void\'s humor.',
'Buy something or leave. The void charges me rent, you know.',
'Special deals today! ...They are always special. Everything is special when death lurks nearby.',
'The deeper you go, the better my stock. Incentive to survive, yes?',
'I have been here longer than the walls. Longer than the darkness. I was here first.'];

const DEATH_EPITAPHS=[
'The void claims another soul, adding your echo to its eternal chorus.',
'In the end, the darkness was patient. It always is.',
'Your light gutters and fades, but the depths remember your flame.',
'Another name etched in shadow. Another story left unfinished.',
'The void does not mourn. But perhaps the walls will whisper your name.',
'You fought well. The darkness will carry that memory, at least.',
'Every defeat feeds the void. Every attempt weakens its hold. You were not the last.',
'Rest now, brave delver. The depths will wait for your return.',
'The silence after the last heartbeat is the loudest sound in the void.',
'Your journey ends, but the path remains. Others will follow where you fell.'];
// v9.0 Procedural legend title generator
function genLegendTitle(){const adj1=mxCmb>=25?'Relentless':mxCmb>=15?'Furious':kills>=100?'Bloodthirsty':P.parryCount>=10?'Unyielding':tDmg>=2000?'Devastating':P.dmgTaken<20?'Untouchable':flr>=10?'Abyssal':'Wandering';
const adj2=P.class==='pyromancer'?'Pyromancer':P.class==='shadowblade'?'Shadowblade':P.class==='guardian'?'Guardian':P.class==='stormcaller'?'Stormcaller':P.class==='chronomancer'?'Chronomancer':'Delver';
const title=P.w&&P.w.evolved?`${adj1} ${adj2}, Bearer of ${P.w.name}`:P.relic?`${adj1} ${adj2}, Wielder of the ${P.relic.name}`:`The ${adj1} ${adj2}`;
return title}
// v9.0 Context-aware death epitaphs
function getDeathEpitaph(){if(P._lastDmgSource){const src=P._lastDmgSource;
if(src.includes('BOSS')||src.includes('boss'))return `Fell before ${src}. The depths demanded a greater champion.`;
if(src==='trap')return 'Undone by the dungeon\'s cruel mechanisms. The void needs no monsters to claim the unwary.';
if(src==='lava')return 'Consumed by the infernal depths. The heat takes all who linger.';
if(src==='poison'||src==='toxic')return 'The corruption spread too deep. Even the strongest fall to venom\'s patience.';
if(src==='arena_hazard')return 'Crushed by the arena\'s fury. The boss fight\'s chaos claimed another.';}
return DEATH_EPITAPHS[Math.floor(Math.random()*DEATH_EPITAPHS.length)]}
// v9.0 Class-specific victory epilogues
const VICTORY_EPILOGUES={pyromancer:'The flames you carried into the abyss now burn eternal. Where once the void consumed all light, your fire endures — a beacon for those who dare follow.',
shadowblade:'You moved through the darkness as one born to it, turning the void\'s own shadows against itself. Now you stand in the light, and even it cannot diminish you.',
guardian:'Your shield held against the infinite. Where others fell, you stood firm. The void broke upon your resolve like waves upon stone.',
stormcaller:'Thunder echoed through halls that had known only silence. You brought the storm to the abyss, and the abyss could not weather it.',
chronomancer:'Time itself bent to your will. You walked between seconds, between heartbeats, between life and death — and chose life.',
default:'The void recedes. The darkness that seemed infinite now has an end — and you are standing at it.'};
const DEATH_TIPS=[
'TIP: Hold SPACE to charge a devastating area attack',
'TIP: Press F to parry — reflects damage at 2x power',
'TIP: Collect 3 matching synergy tags for powerful combos',
'TIP: The Void Forge can stack weapon damage infinitely',
'TIP: Burn + Poison on same enemy causes Toxic Burst',
'TIP: Freeze + Hit shatters for massive bonus damage',
'TIP: Boss attacks have telegraph indicators — watch for red flashes',
'TIP: Explore every room — secret rooms hide rare loot'];

/* ═══════════════════════════════════════════════════
   GAME STATE — v5 enhanced
   ═══════════════════════════════════════════════════ */
let gSt='title',fr=0,shk=0,shkAngle=0,shkDecay=0.87,flr=1,kills=0,rmsV=0,gold=0,tGold=0,tDmg=0,runTime=0;
let cX=0,cY=0,bio=BIO[0],trA=0,sfA=0,sfC='',hitSt=0,slMo=0,slR=1;
let cmb=0,cmbT=0,mxCmb=0,cmbM=1,abCh=0,abMax=100;
let ambientParts=[],dynLights=[],decors=[],bloodSplats=[],uiParts=[],vfxLines=[];
let abKeyDown=false;
let chromAb=0;
let hitFreezeX=0,hitFreezeY=0;// v10 impact freeze-frame center point
let dyingT=0,dyingPx=0,dyingPy=0,dyingColor='#c8a0ff',dyingEpitaph='';// v10 death cinematic
let ascendT=0;// v10 victory ascension cinematic
// v10.0 Corruption escalation system
let corruption=0,corruptionThreshold=0;
function addCorruption(amt){corruption=Math.max(0,Math.min(100,corruption+amt));
const newThr=corruption>=100?4:corruption>=75?3:corruption>=50?2:corruption>=25?1:0;
if(newThr>corruptionThreshold){corruptionThreshold=newThr;
const names=['','TAINTED','CORRUPTED','ABYSSAL','VOID CONSUMED'];
const cols=['','#ffaa44','#ff6644','#cc44ff','#ffffff'];
streak(names[newThr],cols[newThr]);flash(cols[newThr],0.15);shk=8;chromAb=4;
msg(`<span style="color:${cols[newThr]}">${names[newThr]}</span><br><span style="font-size:8px">Corruption: ${Math.floor(corruption)}%</span>`,1500)}
corruptionThreshold=newThr}
// v10.0 Floor contracts — risk/reward system
let activeContracts=[],contractsFailed=false;
const CONTRACT_POOL=[
{name:'Bloodless',desc:'Kill all without healing',icon:'🩸',check:()=>!P._contractHealed,reward:'perk',penalty:{hp:-2}},
{name:'Speedrun',desc:'Clear floor in 60s',icon:'⚡',check:()=>P._contractTimer<3600,reward:'gold50',penalty:{espd:0.15}},
{name:'Untouchable',desc:'Take no damage this floor',icon:'💎',check:()=>P._contractDmg===0,reward:'evo',penalty:{hp:-1}},
{name:'Combo King',desc:'Maintain 10+ combo for 20s',icon:'🔥',check:()=>P._contractComboHeld>=1200,reward:'dmg3',penalty:{espd:0.1}},
{name:'Purist',desc:'No ability use this floor',icon:'✋',check:()=>!P._contractAbUsed,reward:'cdHalf',penalty:{hp:-2}},
{name:'Pacifist Start',desc:'First 15s without attacking',icon:'☮',check:()=>P._contractPacifistT>=900,reward:'gold30',penalty:{espd:0.1}}];
// v10.0 Enemy synergy combos — "Danger Pairs"
let enemySynergyCD=0;
const ENEMY_SYNERGIES=[
{pair:['mage','brute'],name:'EMPOWER',range:120,cd:300,act:(a,b)=>{b.dmg*=2;b.spd*=1.5;b._empowered=300;ft(b.x,b.y-20,'EMPOWERED!','#ff6644',1.2);emit(a.x,a.y,8,'#ff6644',3,12,2)}},
{pair:['necromancer','mage'],name:'DARK RITUAL',range:140,cd:360,act:(a,b)=>{b.hp=Math.min(b.mhp,b.hp+b.mhp*0.3);ft(b.x,b.y-20,'HEALED!','#44ff88',1);emit(a.x,a.y,12,'#44ff88',3,16,2)}},
{pair:['assassin','wraith'],name:'PINCER',range:200,cd:240,act:(a,b)=>{const off=40;a.x=P.x+Math.cos(P.dir)*off;a.y=P.y+Math.sin(P.dir)*off;b.x=P.x-Math.cos(P.dir)*off;b.y=P.y-Math.sin(P.dir)*off;emit(a.x,a.y,6,'#8844cc',2,10,1.5);emit(b.x,b.y,6,'#6688aa',2,10,1.5)}},
{pair:['golem','rat'],name:'THROW',range:100,cd:300,act:(a,b)=>{const ta=Math.atan2(P.y-a.y,P.x-a.x);b.vx=Math.cos(ta)*12;b.vy=Math.sin(ta)*12;b.dmg*=2;ft(a.x,a.y-20,'THROW!','#778899',1.2);emit(a.x,a.y,8,'#778899',3,12,2)}},
{pair:['spider','mage'],name:'WEB TRAP',range:130,cd:300,act:(a,b)=>{const ta=Math.atan2(P.y-a.y,P.x-a.x);projs.push({x:a.x,y:a.y,vx:Math.cos(ta)*2,vy:Math.sin(ta)*2,dmg:0,life:80,color:'#aaaaaa',size:8,enemy:1,slow:1});projs.push({x:b.x,y:b.y,vx:Math.cos(ta)*3,vy:Math.sin(ta)*3,dmg:b.dmg,life:60,color:'#ff6644',size:4,enemy:1})}},
{pair:['skel','brute'],name:'FORMATION',range:80,cd:360,act:(a,b)=>{a.arm=(a.arm||0)+2;b.arm=(b.arm||0)+2;a._formation=180;b._formation=180;ft(a.x,a.y-20,'FORMATION!','#aaaacc',1);emit(a.x,a.y,6,'#aaaacc',2,10,1.5)}}];
let roomRevealT=0;
let dialogueActive=false,dialogueCb=null;
let loreActive=false;
// v5 additions
let weaponTrail=[];  // ring buffer for slash trail ribbon
let shockwaves=[];   // expanding ring effects
let multiKillT=0,multiKillN=0; // multi-kill tracking
let waveNum=0,waveMax=0,wavePause=0,waveActive=false; // challenge wave state
let displayHP=8,displayShield=0,hpDrainT=0; // animated HP bar
let camZoom=1,camZoomT=0; // camera zoom effects
let floorTransT=0,floorTransPhase=0; // iris-wipe floor transition
let bestScore=0; // high score from localStorage
let saveData=null; // persistence
// v6.1 juice variables
let blizzardFrostT=0,camPunchX=0,camPunchY=0,lastKillX=0,lastKillY=0,displayGold=0;
// v6.0 new systems
let perfectDodgeT=0,perfectDodgeCount=0,perfectDodgeBuff=0; // perfect dodge system
let weaponMastery={};  // weapon XP tracking per weapon name
let comboFinisherReady=false; // combo finisher system
let comboEdgeGlow=0; // v8.0 combo edge glow intensity
let enemyPositionHistory=[]; // for chronomancer temporal rift
let footstepDecals=[]; // visual: glowing footstep trail
let scorchMarks=[]; // environmental destruction marks
let bossIntroT=0,bossIntroTarget=null; // boss intro cinematic
let executionSlowT=0; // execution camera effect
// v10 Title: sparse stars visible through forest canopy
let titleStars=[];for(let i=0;i<25;i++)titleStars.push({x:Math.random()*1920,y:Math.random()*540,seed:Math.random()*100,sz:0.4+Math.random()*0.8});
// v10 Title: static elements seeded once
let titleTrees=[];for(let i=0;i<10;i++)titleTrees.push({x:Math.random(),h:0.25+Math.random()*0.35,w:0.04+Math.random()*0.06,seed:Math.random()*100,shade:Math.random()*0.08});
let titleFlowers=[];for(let i=0;i<7;i++)titleFlowers.push({xOff:(Math.random()-0.5)*0.35,yOff:Math.random()*0.04,sz:1.5+Math.random()*1.5,seed:Math.random()*100,bright:0.5+Math.random()*0.5});
let titleFireflies=[];for(let i=0;i<10;i++)titleFireflies.push({x:Math.random()*1920,y:Math.random()*1080,vx:0,vy:0,seed:Math.random()*100,phase:Math.random()*Math.PI*2});

const P={x:0,y:0,hw:7,hh:7,hp:0,mhp:8,spd:2.8,bd:0,atkCd:0,inv:0,
xp:0,xpN:10,lvl:1,vx:0,vy:0,dir:0,atkA:0,cc:.05,ls:0,arm:0,prc:0,
dCd:0,dT:0,dsh:false,dMax:42,w:null,pc:1,ab:'none',bT:0,ai:[],
comboStep:0,comboTimer:0,chargeT:0,charging:false,parryT:0,parryWindow:0,parryCD:0,
shield:0,maxShield:0,shieldRegen:0,shieldRegenT:0,
thorns:0,goldMult:1,spCd:0,spMax:90,
acc:null,statuses:[],animState:'idle',animT:0,
totalDmg:0,
class:null,className:'',classIcon:'',classColor:'#c8a0ff',
forgeLevel:0,forgeDmg:0,
perkTags:[],synergies:[],perkNames:[],
killsHeal:false,burnChance:0,dashDmg:false,
echoStrike:false,executioner:false,berserkPerk:false,thornsPerk:0,
goldHeals:false,critDmgMult:1,pierceSynergy:false,
// v5 additions
hitStop:0, // per-entity hit-stop for player
relic:null, // current held relic
phantomCount:0, // Phantom Cloak counter
highestHit:0,bestRoomKills:0,parryCount:0,forgesUsed:0,dmgTaken:0 // run stats
};

let rooms=[],cR=null,cRX=0,cRY=0,ents=[],parts=[],fts=[],projs=[],picks=[],props=[];

/* ═══════════════════════════════════════════════════
   INPUT SYSTEM
   ═══════════════════════════════════════════════════ */
const K={};let mD=false,aR=false,iR=false,tA=false,tAA=false,tSX=0,tSY=0,tMX=0,tMY=0,lTT=0,mouseX=0,mouseY=0;
// v7.0 Mobile polish
const isMobile='ontouchstart'in window||navigator.maxTouchPoints>0;
const vBtns={atk:{x:0,y:0,r:28,active:false,label:'ATK',color:'#ff6666'},
dash:{x:0,y:0,r:22,active:false,label:'DSH',color:'#48cae4'},
ability:{x:0,y:0,r:22,active:false,label:'ABL',color:'#f77f00'},
interact:{x:0,y:0,r:20,active:false,label:'INT',color:'#44ff66'}};
let joyBaseX=0,joyBaseY=0,joyVisible=false;
function layoutVBtns(){const bx=W-70,by=H-100;
vBtns.atk.x=bx;vBtns.atk.y=by;
vBtns.dash.x=bx-50;vBtns.dash.y=by+10;
vBtns.ability.x=bx+5;vBtns.ability.y=by-55;
vBtns.interact.x=bx-50;vBtns.interact.y=by-45}
function haptic(ms){try{if(navigator.vibrate)navigator.vibrate(ms)}catch(e){}}
function getVBtn(x,y){for(const[k,b]of Object.entries(vBtns)){if(Math.hypot(x-b.x,y-b.y)<b.r+8)return k}return null}
mouseX=innerWidth/2;mouseY=innerHeight/2;
document.addEventListener('keydown',e=>{K[e.code]=1;
if(e.code==='KeyE'){
  if(dialogueActive){closeDialogue();e.preventDefault();return}
  if(loreActive){closeLore();e.preventDefault();return}
  iR=1}
if(e.code==='Tab'){e.preventDefault();
if(gSt==='playing')toggleControls();
else if(gSt==='controls'){toggleControls();toggleInv()}
else if(gSt==='inventory')toggleInv()}
if(e.code==='KeyM')toggleAudio();
if(e.code==='KeyF'&&gSt==='playing')tryParry();
if(e.code==='KeyR'&&gSt==='playing')useSpecial();
if(e.code==='KeyQ'&&gSt==='playing'&&!abKeyDown){abKeyDown=true;useAb()}
if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault()});
document.addEventListener('keyup',e=>{K[e.code]=0;if(e.code==='Space')P.charging=false;if(e.code==='KeyQ')abKeyDown=false});
gc.addEventListener('mousedown',e=>{mD=1;aR=1;ia();mouseX=e.clientX;mouseY=e.clientY});
gc.addEventListener('mouseup',()=>{mD=0;P.charging=false});
gc.addEventListener('mousemove',e=>{mouseX=e.clientX;mouseY=e.clientY});
gc.addEventListener('touchstart',e=>{e.preventDefault();ia();layoutVBtns();const now=Date.now();
for(const t of e.changedTouches){
if(isMobile&&gSt==='playing'){
const bk=getVBtn(t.clientX,t.clientY);
if(bk==='atk'){tAA=1;aR=1;vBtns.atk.active=true;haptic(15);continue}
if(bk==='dash'){K['ShiftLeft']=1;vBtns.dash.active=true;haptic(20);continue}
if(bk==='ability'){useAb();vBtns.ability.active=true;haptic(15);continue}
if(bk==='interact'){K['KeyE']=1;iR=true;vBtns.interact.active=true;haptic(10);continue}}
if(t.clientX>W*.5){tAA=1;aR=1;if(now-lTT<300)K['ShiftLeft']=1;lTT=now}
else{tA=1;tSX=t.clientX;tSY=t.clientY;joyBaseX=t.clientX;joyBaseY=t.clientY;joyVisible=true;tMX=0;tMY=0}}},{passive:false});
gc.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.touches){
if(t.clientX<=W*.5){tMX=Math.max(-1,Math.min(1,(t.clientX-tSX)/40));tMY=Math.max(-1,Math.min(1,(t.clientY-tSY)/40))}}},{passive:false});
gc.addEventListener('touchend',e=>{
for(const t of e.changedTouches){const bk=getVBtn(t.clientX,t.clientY);
if(bk){vBtns[bk].active=false;if(bk==='dash')K['ShiftLeft']=0;if(bk==='interact'){K['KeyE']=0;iR=false}}}
if(e.touches.length===0){tA=0;tAA=0;tMX=0;tMY=0;K['ShiftLeft']=0;P.charging=false;joyVisible=false;
for(const b of Object.values(vBtns))b.active=false}},{passive:false});

/* ═══════════════════════════════════════════════════
   UTILITY FUNCTIONS — enhanced particles, damage numbers, shockwaves
   ═══════════════════════════════════════════════════ */
// v9.0 Particle density scaling for performance
function emit(x,y,n,col,spd,life,sz,shape,blend){const pn=Math.max(1,Math.ceil(n*(gameSettings.particleDensity||1)));
if(parts.length>600)return;// Hard cap
for(let i=0;i<pn;i++){const a=Math.random()*Math.PI*2,s=Math.random()*spd+.2;
parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life,ml:life,color:col,size:sz||2,shape:shape||'rect',grav:0,blend:blend||'source-over',prevX:x,prevY:y})}}
function emitDir(x,y,n,col,dir,spread,spd,life,sz){const pn=Math.max(1,Math.ceil(n*(gameSettings.particleDensity||1)));
for(let i=0;i<pn;i++){const a=dir+(Math.random()-.5)*spread,s=Math.random()*spd+spd*.3;
parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life,ml:life,color:col,size:sz||2,shape:'rect'})}}
function emitRing(x,y,n,col,spd,life,sz){const pn=Math.max(1,Math.ceil(n*(gameSettings.particleDensity||1)));
for(let i=0;i<pn;i++){const a=Math.PI*2/pn*i,s=spd+Math.random()*.5;
parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life,ml:life,color:col,size:sz||2,shape:'circle'})}}
function emitTrail(x,y,col,sz){parts.push({x,y,vx:0,vy:0,life:12,ml:12,color:col,size:sz||1.5,shape:'circle',grav:0})}

// v5 enhanced floating text: physics-based bounce arc, color-coded, crit zoom
// v7.1: big can be a number > 1 for size multiplier
function ft(x,y,t,c,big){const isBig=typeof big==='number'?big>0:!!big;const szMult=typeof big==='number'&&big>1?big:big?1.5:1;
fts.push({x,y,text:t,color:c,life:65,big:isBig,sizeMult:szMult,
vx:(Math.random()-.5)*1.5,vy:-2.8-Math.random(),
bounces:0,grav:.06,startSize:szMult})}

function popup(t){const el=document.getElementById('item-popup');el.textContent=t;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2200)}
function msg(t,d){const el=document.getElementById('msg');el.innerHTML=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),d||1400)}
function flash(c,a){sfC=c;sfA=a||.2}
function streak(t,c){if(gSt!=='playing')return;const el=document.getElementById('streak-msg');el.textContent=t;el.style.color=c;el.style.textShadow=`0 0 24px ${c},0 0 50px ${c}40`;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),1200);sfx('streak')}
function hideAllOverlays(){const ids=['streak-msg','msg','item-popup'];for(const id of ids){const el=document.getElementById(id);if(el){el.classList.remove('show');clearTimeout(el._t)}}}

function showFloorBanner(){const fb=document.getElementById('floor-banner');
document.getElementById('fb-name').textContent=bio.name;document.getElementById('fb-name').style.color=bio.ac+'0.5)';
document.getElementById('fb-floor').textContent=`FLOOR ${flr}`;document.getElementById('fb-floor').style.color=bio.ac+'0.8)';
document.getElementById('fb-sub').textContent=flr%4===0?'⚠ BOSS FLOOR ⚠':'EXPLORE THE DEPTHS';document.getElementById('fb-sub').style.color=bio.ac+'0.3)';
// v9.0 Biome-specific floor lore
const bioLoreIdx=Math.floor((flr-1)/3)%FLOOR_LORE.length;const floorLoreSet=FLOOR_LORE[bioLoreIdx];
const isBossFloor=flr%4===0;const loreIdx=isBossFloor?floorLoreSet.length-1:Math.min((flr-1)%3,floorLoreSet.length-2);
document.getElementById('fb-lore').textContent=floorLoreSet[loreIdx];
fb.classList.add('show');setTimeout(()=>fb.classList.remove('show'),3200);
// v9.0 Floor transition effect
const transTypes=['void_consume','spore_spread','flame_wipe','ice_shatter','glitch_tear'];
startTransition(transTypes[bio.i]||'void_consume',80,bio.fl)}

function addCmb(){cmb++;cmbT=P.soulHarvest?140:110;cmbM=1+Math.floor(cmb/3)*.25;if(cmb>mxCmb)mxCmb=cmb;if(cmb>1)sfx('combo');
if(cmb===15)tryWhisper('highCombo');
if(cmb%5===0)addCorruption(1);// v10 corruption rises with combos
if(cmb>=10)P._contractComboHeld=(P._contractComboHeld||0)+1;// v10 contract tracking
if(cmb===5)streak('FRENZY','#ffcc00');else if(cmb===10)streak('RAMPAGE','#ff8800');else if(cmb===15)streak('UNSTOPPABLE','#ff4400');else if(cmb===25)streak('GODLIKE','#ff0044');else if(cmb===50)streak('BEYOND GOD','#ffffff');
// v9.0 Enhanced combo visual escalation with dramatic milestone effects
if(cmb===5){emitRing(P.x,P.y,12,'#ffcc00',3,16,2);addShockwave(P.x,P.y,50,'#ffcc00',8);flash('#ffcc00',0.04);
for(let fp=0;fp<6;fp++)parts.push({x:P.x+(Math.random()-.5)*20,y:P.y,vx:(Math.random()-.5)*1.5,vy:-2-Math.random()*2,life:18,ml:18,color:'#ffcc00',size:2+Math.random()*2,shape:'circle',grav:-0.02})}
else if(cmb===10){emitRing(P.x,P.y,18,'#ff8800',4,20,2.5);addShockwave(P.x,P.y,80,'#ff8800',12);camZoom=1.04;camZoomT=15;flash('#ff8800',0.08);chromAb=Math.max(chromAb,2);
addDynLight(P.x,P.y,120,'#ff8800',1.5,0,20);comboEdgeGlow=0.2;
for(let fp=0;fp<12;fp++){const a=Math.PI*2/12*fp;parts.push({x:P.x+Math.cos(a)*20,y:P.y+Math.sin(a)*20,vx:Math.cos(a)*2,vy:Math.sin(a)*2,life:20,ml:20,color:'#ff8800',size:3,shape:'star'})}}
else if(cmb===15){emitRing(P.x,P.y,24,'#ff4400',5,24,3);addShockwave(P.x,P.y,100,'#ff4400',14);addShockwave(P.x,P.y,60,'#ffffff',8);
camZoom=1.06;camZoomT=20;flash('#ff4400',0.1);chromAb=Math.max(chromAb,4);slMo=12;comboEdgeGlow=0.4;
addDynLight(P.x,P.y,160,'#ff4400',2,0,25);
for(let fp=0;fp<16;fp++){const a=Math.random()*Math.PI*2;parts.push({x:P.x,y:P.y,vx:Math.cos(a)*3,vy:Math.sin(a)*3,life:24,ml:24,color:Math.random()>.5?'#ff4400':'#ffcc00',size:3+Math.random()*2,shape:'star'})}}
else if(cmb===25){// GODLIKE — golden pulse + massive shockwaves
emitRing(P.x,P.y,30,'#ff0044',6,28,3.5);addShockwave(P.x,P.y,150,'#ff0044',20);addShockwave(P.x,P.y,100,'#ffcc00',14);addShockwave(P.x,P.y,50,'#ffffff',8);
camZoom=1.08;camZoomT=25;flash('#ffffff',0.15);chromAb=8;slMo=20;shk=15;comboEdgeGlow=0.7;hitSt=5;
addDynLight(P.x,P.y,200,'#ff0044',2.5,0,30);
for(let fp=0;fp<24;fp++){const a=Math.PI*2/24*fp;const spd=3+Math.random()*2;
parts.push({x:P.x,y:P.y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:30,ml:30,color:['#ffffff','#ffcc00','#ff0044','#ff8800'][fp%4],size:3+Math.random()*3,shape:fp%3===0?'star':'circle'})}}
else if(cmb===50){// BEYOND GOD — reality-breaking effects
emitRing(P.x,P.y,40,'#ffffff',8,32,4);addShockwave(P.x,P.y,200,'#ffffff',24);addShockwave(P.x,P.y,140,'#ff0044',18);addShockwave(P.x,P.y,80,'#ffcc00',12);
camZoom=1.12;camZoomT=35;flash('#ffffff',0.25);chromAb=15;slMo=30;shk=25;hitSt=8;comboEdgeGlow=1;
addDynLight(P.x,P.y,300,'#ffffff',3,0,40);
for(let sl=0;sl<16;sl++){const a=Math.PI*2/16*sl;parts.push({x:P.x,y:P.y,vx:Math.cos(a)*1,vy:Math.sin(a)*1,life:20,ml:20,color:'#ffffff',size:40+Math.random()*30,shape:'speedline',slashDir:a,lineW:2})}
for(let fp=0;fp<40;fp++){const a=Math.random()*Math.PI*2;const spd=2+Math.random()*4;
parts.push({x:P.x,y:P.y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:40,ml:40,color:['#ffffff','#ffcc00','#ff0044','#88ccff'][fp%4],size:2+Math.random()*4,shape:fp%4===0?'star':'circle'})}}
else if(cmb>=15&&cmb%5===0){emitRing(P.x,P.y,24,'#ff4400',5,24,3);addShockwave(P.x,P.y,100,'#ff4400',14);camZoom=1.06;camZoomT=20;flash('#ff4400',0.08);chromAb=Math.max(chromAb,3);comboEdgeGlow=Math.min(1,cmb*0.03)}
const cd=document.getElementById('combo-display');if(cmb>1){cd.classList.add('show');
const cc=document.getElementById('combo-count');cc.textContent=cmb;
// v9.0 combo pop bounce on each increment
cc.classList.remove('pop');void cc.offsetWidth;cc.classList.add('pop');
// v6 combo color escalation: yellow → orange → red → white (v9.0: spectrum shift at 30+)
let cCol;if(cmb>=30){const hue=(fr*3+cmb*12)%360;cCol=`hsl(${hue},100%,75%)`}
else{cCol=cmb>=25?'#ffffff':cmb>=15?'#ff2244':cmb>=10?'#ff6600':cmb>=5?'#ff9900':'#ffcc00'}
cc.style.color=cCol;cc.style.textShadow=`0 0 20px ${cCol}99,0 0 40px ${cCol}55`;
cc.style.fontSize=Math.min(60,40+cmb*0.5)+'px';
document.getElementById('combo-mult').textContent=`x${cmbM.toFixed(1)}`;document.getElementById('combo-mult').style.color=cCol}}

// v5 enhanced death burst with irregular blood splats + satellite droplets
function deathBurst(x,y,color){emitRing(x,y,22,color,4.5,28,4);emit(x,y,14,'#fff',5,22,3.5,'circle');emit(x,y,10,color,3.5,24,2.5);
if(bloodSplats.length<80){
const verts=[];const nv=5+Math.floor(Math.random()*4);
for(let i=0;i<nv;i++){const a=Math.PI*2/nv*i;const r=6+Math.random()*6;verts.push({x:Math.cos(a)*r,y:Math.sin(a)*r})}
bloodSplats.push({x,y,verts,r:8+Math.random()*6,color,a:.25+Math.random()*.12});
// satellite droplets
for(let d=0;d<Math.floor(Math.random()*3)+1;d++){
const da=Math.random()*Math.PI*2,dd=8+Math.random()*12;
bloodSplats.push({x:x+Math.cos(da)*dd,y:y+Math.sin(da)*dd,verts:null,r:2+Math.random()*3,color,a:.18+Math.random()*.08})}}
addDynLight(x,y,80,color,1.2,0,8)}

// v5.1 type-specific enemy death effects
function typedDeathBurst(e){const{x,y,color,type}=e;
emit(x,y,10,'#fff',3,14,1.5,'circle');
// v6.1 ice crystal shatter if enemy was frozen
if(e.frozen>0){sfx('smash');addShockwave(x,y,50,'#88ccff',10);shk=Math.min(20,shk+4);
for(let ic=0;ic<16;ic++){const a=Math.PI*2/16*ic;const spd=2+Math.random()*2;
parts.push({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:22+Math.random()*10,ml:32,color:Math.random()>.5?'#88ccff':'#aaddff',size:2+Math.random()*2,shape:'diamond',grav:0.05})}}
if(type==='slime'){for(let i=0;i<8;i++){const a=Math.random()*Math.PI*2,d=Math.random()*20;
emit(x+Math.cos(a)*d,y+Math.sin(a)*d,2,'#44dd66',1,20,2+Math.random()*2,'circle')}addShockwave(x,y,25,'#44dd66',8)}
else if(type==='bat'){emitDir(x,y,12,'#aa44ff',Math.PI*1.5,.8,3,18,1.5);emit(x,y,6,color,2,12,1)}
else if(type==='skel'){emitRing(x,y,8,'#ddd8cc',4,20,3);emit(x,y,6,'#bbb',2,16,2,'rect')}
else if(type==='mage'||type==='necromancer'){flash(color,0.06);emitRing(x,y,16,color,4,16,2);addDynLight(x,y,100,color,1.5,0,10)}
else if(type==='wraith'){for(let i=0;i<12;i++){const a=Math.random()*Math.PI*2;
parts.push({x,y,vx:Math.cos(a)*1,vy:Math.sin(a)*.5-.5,life:35,ml:35,color:'rgba(100,140,180,0.3)',size:3+Math.random()*2,shape:'circle'})}}
else if(type==='golem'){shk=Math.min(25,shk+8);emitRing(x,y,20,'#778899',5,22,3);addShockwave(x,y,60,'#778899',12)}
else if(type==='brute'){emitRing(x,y,18,'#885533',4,20,2.5);shk=Math.min(20,shk+5)}
else if(type==='swarmer'){emit(x,y,4,'#ccaa33',2,8,1);emit(x,y,2,'rgba(255,220,100,0.4)',1.5,10,1,'circle')}
else if(type==='shaman'){emitRing(x,y,12,'#88cc44',3,14,2);emit(x,y,8,'#aaff44',2,16,1.5);addDynLight(x,y,60,'#88cc44',1,0,8)}
else if(type==='knight'){emitRing(x,y,14,'#aabbcc',4,18,2.5);emit(x,y,8,'#ccddee',2.5,14,2,'rect');shk=Math.min(20,shk+4)}
else{deathBurst(x,y,color);return}
addDynLight(x,y,80,color,1.2,0,8);
if(!['wraith','bat','mage','necromancer'].includes(type)&&bloodSplats.length<80){
const verts=[];const nv=5+Math.floor(Math.random()*4);
for(let i=0;i<nv;i++){const a=Math.PI*2/nv*i;const r=6+Math.random()*6;verts.push({x:Math.cos(a)*r,y:Math.sin(a)*r})}
bloodSplats.push({x,y,verts,r:8+Math.random()*6,color,a:.25+Math.random()*.12})}}

function addDynLight(x,y,r,col,intensity,flicker,decay){dynLights.push({x,y,r,col,intensity:intensity||1,flicker:flicker||0,age:0,decay:decay||0})}

function formatTime(s){const m=Math.floor(s/60);const sec=Math.floor(s%60);return`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`}

// v5 shockwave system
function addShockwave(x,y,maxR,color,life){shockwaves.push({x,y,r:0,maxR,color,life,ml:life})}
function tickShockwaves(sdt){for(let i=shockwaves.length-1;i>=0;i--){const s=shockwaves[i];
s.life-=sdt;s.r+=(s.maxR/s.ml)*sdt;if(s.life<=0)shockwaves.splice(i,1)}}

// v5 weapon trail buffer (ring buffer for slash ribbon)
function addTrailPoint(x,y,angle,color){weaponTrail.push({x,y,angle,color,life:8});if(weaponTrail.length>12)weaponTrail.shift()}
function tickTrail(sdt){for(let i=weaponTrail.length-1;i>=0;i--){weaponTrail[i].life-=sdt;if(weaponTrail[i].life<=0)weaponTrail.splice(i,1)}}

/* ═══════════════════════════════════════════════════
   ANIMATION FRAME SYSTEM — entity animation states
   ═══════════════════════════════════════════════════ */
function animTick(e,sdt){if(!e.animState)e.animState='idle';
e.animFrame=(e.animFrame||0);e.animTimer=(e.animTimer||0)+sdt;
const rates={idle:12,walk:6,attack:4,die:5,spawn:5};
const rate=rates[e.animState]||8;
if(e.animTimer>=rate){e.animTimer-=rate;e.animFrame++;
if(e.animState==='die'&&e.animFrame>=6){e._dead=true;return}
if(e.animState==='spawn'&&e.animFrame>=8){e.animState='idle';e.animFrame=0;e.spawnDone=true}}}

/* ═══════════════════════════════════════════════════
   localStorage PERSISTENCE
   ═══════════════════════════════════════════════════ */
function defaultSave(){return{highScores:[],classMastery:{},totalRuns:0,bestFloor:0,lastClass:'',
voidRank:0,runStreak:0,bestStreak:0,achievements:[],startingGold:0,
runHistory:[],unlocks:{},dailyBest:{},voidEssence:0,metaUpgrades:{}}}
function loadSave(){try{const d=localStorage.getItem('voidDepths_v5');
saveData=d?JSON.parse(d):defaultSave();bestScore=saveData.highScores.length?saveData.highScores[0].score:0;
const bs=document.getElementById('best-score');if(bs&&bestScore>0)bs.textContent=`BEST: ${bestScore}`;
// v6 title stats
const ts=document.getElementById('title-stats');if(ts){const parts=[];
if(saveData.totalRuns>0)parts.push(`RUNS: ${saveData.totalRuns}`);
if(saveData.lastClass)parts.push(`LAST: ${saveData.lastClass.toUpperCase()}`);
if(saveData.bestFloor)parts.push(`DEEPEST: F${saveData.bestFloor}`);
if(saveData.runStreak>0)parts.push(`STREAK: ${saveData.runStreak}`);
if(saveData.achievements&&saveData.achievements.length)parts.push(`★ ${saveData.achievements.length}`);
ts.textContent=parts.join(' · ')}
// v6.0 Show unlocks on title
checkUnlocks();
const ubEl=document.getElementById('unlock-badges');if(ubEl&&saveData.unlocks){ubEl.innerHTML='';
const ulKeys=Object.keys(saveData.unlocks).filter(k=>saveData.unlocks[k]);
ulKeys.forEach(k=>{const u=UNLOCKS[k];if(u){const b=document.createElement('div');
b.style.cssText='font-family:Silkscreen,monospace;font-size:6px;letter-spacing:1px;color:rgba(100,255,100,0.5);padding:2px 6px;border:1px solid rgba(100,255,100,0.15);border-radius:3px';
b.textContent='✓ '+u.name;b.title=u.desc;ubEl.appendChild(b)}})}
// v6.0 Daily challenge button
const dBtn=document.getElementById('daily-btn');
if(dBtn&&saveData.unlocks&&saveData.unlocks.daily_mode){dBtn.style.display='inline-block';
const dk=getDailyDateStr();const db=saveData.dailyBest&&saveData.dailyBest[dk];
if(db)dBtn.textContent=`☀ DAILY (BEST: ${db})`}
// v7.0 migrate old saves for meta-progression
if(saveData.voidEssence===undefined)saveData.voidEssence=0;
if(!saveData.metaUpgrades)saveData.metaUpgrades={};
renderMetaUI();
}catch(e){saveData=defaultSave()}}
function writeSave(){try{localStorage.setItem('voidDepths_v5',JSON.stringify(saveData))}catch(e){}}

/* ═══════════════════════════════════════════════════
   META-PROGRESSION — Void Essence & Persistent Upgrades
   ═══════════════════════════════════════════════════ */
const META_UPGRADES={
vitality:{name:'VITALITY',icon:'❤',desc:'+1 Starting HP',maxLvl:5,costs:[50,100,200,400,800],effect:(l)=>({hp:l})},
arsenal:{name:'ARSENAL',icon:'⚔',desc:'Start with Tier 1 weapon',maxLvl:1,costs:[150],effect:(l)=>({weapon:l>0})},
fortune:{name:'FORTUNE',icon:'✦',desc:'+10% Gold per level',maxLvl:5,costs:[30,60,120,240,480],effect:(l)=>({goldMult:1+l*0.1})},
resilience:{name:'RESILIENCE',icon:'🛡',desc:'+1 Starting Armor',maxLvl:3,costs:[100,250,500],effect:(l)=>({arm:l})},
attunement:{name:'ATTUNEMENT',icon:'◈',desc:'+25% Ability charge',maxLvl:4,costs:[80,160,320,640],effect:(l)=>({abCharge:l*0.25})},
legacy:{name:'LEGACY',icon:'★',desc:'Start with random perk',maxLvl:1,costs:[500],effect:(l)=>({perk:l>0})},
potency:{name:'POTENCY',icon:'☄',desc:'+3% Crit chance',maxLvl:3,costs:[120,250,500],effect:(l)=>({cc:l*0.03})}
};
let runEssence=0;// Essence earned this run

function getMetaLvl(key){if(!saveData||!saveData.metaUpgrades)return 0;return saveData.metaUpgrades[key]||0}

function buyMetaUpgrade(key){
const up=META_UPGRADES[key];if(!up)return;
const lvl=getMetaLvl(key);if(lvl>=up.maxLvl)return;
const cost=up.costs[lvl];if(!saveData||!saveData.voidEssence||(saveData.voidEssence||0)<cost)return;
saveData.voidEssence-=cost;
if(!saveData.metaUpgrades)saveData.metaUpgrades={};
saveData.metaUpgrades[key]=(saveData.metaUpgrades[key]||0)+1;
writeSave();sfx('classup');renderMetaUI()}

function addEssence(amount){
if(!saveData)loadSave();
if(!saveData.voidEssence)saveData.voidEssence=0;
saveData.voidEssence+=amount;runEssence+=amount;writeSave()}

function renderMetaUI(){
const panel=document.getElementById('meta-panel');
const grid=document.getElementById('meta-grid');
const essEl=document.getElementById('meta-essence');
if(!panel||!grid||!essEl)return;
if(!saveData)loadSave();
const ess=saveData.voidEssence||0;
// Only show panel if player has earned any essence or has upgrades
const hasProgress=ess>0||Object.keys(saveData.metaUpgrades||{}).length>0;
if(!hasProgress){panel.style.display='none';return}
panel.style.display='block';
essEl.textContent=`◈ VOID ESSENCE: ${ess}`;
grid.innerHTML='';
for(const[key,up]of Object.entries(META_UPGRADES)){
const lvl=getMetaLvl(key);const maxed=lvl>=up.maxLvl;
const cost=maxed?0:up.costs[lvl];
const d=document.createElement('div');d.className='meta-up'+(maxed?' maxed':'');
const pct=lvl/up.maxLvl*100;
d.innerHTML=`<div class="mu-icon">${up.icon}</div><div class="mu-name">${up.name}</div>`+
`<div class="mu-lvl">${maxed?'MAX':lvl+'/'+up.maxLvl}</div>`+
(maxed?'':`<div class="mu-cost">${cost} ◈</div>`)+
`<div class="mu-bar"><div class="mu-bar-in" style="width:${pct}%"></div></div>`;
d.title=up.desc+(maxed?'  [MAXED]':`\nCost: ${cost} Essence\nYou have: ${ess}`);
if(!maxed&&ess>=cost){d.style.borderColor='rgba(180,100,255,0.4)';d.style.color='#c8a0ff'}
if(!maxed)d.addEventListener('click',()=>buyMetaUpgrade(key));
grid.appendChild(d)}}

function applyMetaUpgrades(){
// Apply meta-progression bonuses to player after class selection
for(const[key,up]of Object.entries(META_UPGRADES)){
const lvl=getMetaLvl(key);if(lvl<=0)continue;
const fx=up.effect(lvl);
if(fx.hp){P.mhp+=fx.hp;P.hp+=fx.hp}
if(fx.arm)P.arm+=fx.arm;
if(fx.cc)P.cc+=fx.cc;
if(fx.goldMult)P.goldMult=fx.goldMult;
if(fx.abCharge)abCh=Math.min(abMax,abCh+abMax*fx.abCharge);
if(fx.weapon){const t1=WPN.filter(w=>w.tier===1);if(t1.length){P.w={...t1[Math.floor(Math.random()*t1.length)]}}}
if(fx.perk){const avail=PERKS.filter(p=>!P.perkNames.includes(p.n));
if(avail.length){const rp=avail[Math.floor(Math.random()*avail.length)];rp.a();P.perkNames.push(rp.n);P.perkTags.push(rp.tag)}}}}

function addHighScore(score,floor,cls,time){if(!saveData)loadSave();
saveData.highScores.push({score,floor,cls,time,date:new Date().toLocaleDateString()});
saveData.highScores.sort((a,b)=>b.score-a.score);saveData.highScores=saveData.highScores.slice(0,10);
saveData.totalRuns=(saveData.totalRuns||0)+1;
saveData.lastClass=cls||'unknown';saveData.bestFloor=Math.max(saveData.bestFloor||0,floor);
// v6 run streaks: reaching floor 4+ counts as a "good run"
if(floor>=4){saveData.runStreak=(saveData.runStreak||0)+1;saveData.bestStreak=Math.max(saveData.bestStreak||0,saveData.runStreak);
if(saveData.runStreak>=3)triggerAchievement('streak3')}
else{saveData.runStreak=0}
// v6 Void Rank unlock: reaching floor 8+ unlocks next rank
if(floor>=8&&(!saveData.voidRank||saveData.voidRank<3)){
const newRank=Math.min(3,(saveData.voidRank||0)+1);
if(newRank>(saveData.voidRank||0)){saveData.voidRank=newRank;triggerAchievement('void_rank1')}}
// v6 Check all classes played
const allClasses=Object.keys(CLASSES).every(k=>saveData.classMastery[k]&&saveData.classMastery[k].runs>0);
if(allClasses)triggerAchievement('all_classes');
const key=cls||'default';if(!saveData.classMastery[key])saveData.classMastery[key]={runs:0,bestFloor:0};
saveData.classMastery[key].runs++;saveData.classMastery[key].bestFloor=Math.max(saveData.classMastery[key].bestFloor,floor);
writeSave();bestScore=saveData.highScores[0].score}
function getMasteryLevel(key){if(!saveData||!saveData.classMastery[key])return 0;
return Math.min(10,Math.floor(saveData.classMastery[key].runs/3))}
function getMasteryBonus(key){const lv=getMasteryLevel(key);return{dmg:lv*0.01,hp:Math.floor(lv/2)}}
loadSave();

// v6.0 Seeded RNG for daily challenge
let dailyMode=false;let seedRng=null;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function getDailySeed(){const d=new Date();return d.getFullYear()*10000+d.getMonth()*100+d.getDate()}
function getDailyDateStr(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}

// v6.0 Unlock system
const UNLOCKS={
weapon_choice:{name:'STARTING WEAPON',desc:'Choose your starting weapon',req:'Reach floor 3',check:()=>saveData.bestFloor>=3},
perk_pick:{name:'STARTING PERK',desc:'Start with a perk selection',req:'Reach floor 5',check:()=>saveData.bestFloor>=5},
bonus_gold:{name:'BONUS GOLD',desc:'Start with +25 gold',req:'Complete 10 runs',check:()=>saveData.totalRuns>=10},
class_relic:{name:'CLASS RELIC',desc:'Class mastery lv3 grants starting relic',req:'Any class mastery lv3',check:()=>Object.keys(saveData.classMastery).some(k=>getMasteryLevel(k)>=3)},
daily_mode:{name:'DAILY CHALLENGE',desc:'Seeded daily dungeon run',req:'Complete 5 runs',check:()=>saveData.totalRuns>=5}
};
function checkUnlocks(){if(!saveData.unlocks)saveData.unlocks={};let newUnlock=false;
for(const[k,u]of Object.entries(UNLOCKS)){if(!saveData.unlocks[k]&&u.check()){saveData.unlocks[k]=true;newUnlock=true}}
if(newUnlock)writeSave();return newUnlock}

// v6.0 Run history recording
function recordRunHistory(floor,cls,score,time,weapon,kills,combo){
if(!saveData.runHistory)saveData.runHistory=[];
saveData.runHistory.push({floor,cls,score,time,weapon,kills,combo,date:new Date().toLocaleDateString(),daily:dailyMode});
if(saveData.runHistory.length>5)saveData.runHistory=saveData.runHistory.slice(-5);
if(dailyMode){const dk=getDailyDateStr();if(!saveData.dailyBest[dk]||score>saveData.dailyBest[dk])saveData.dailyBest[dk]=score}
writeSave()}

// v5.1 Achievement system
const ACHVS={
first_kill:{text:'FIRST BLOOD',check:()=>kills===1},
combo5:{text:'COMBO MASTER',check:()=>cmb>=5},
combo15:{text:'UNSTOPPABLE FORCE',check:()=>cmb>=15},
floor3:{text:'DEEP DELVER',check:()=>flr>=3},
floor5:{text:'VOID VETERAN',check:()=>flr>=5},
boss_kill:{text:'BOSS SLAYER',check:()=>false},/* triggered via triggerAchievement */
secret:{text:'HIDDEN KNOWLEDGE',check:()=>rmsV>=15},
parry3:{text:'DEFLECTOR',check:()=>P.parryCount>=3},
forge3:{text:'MASTERSMITH',check:()=>P.forgesUsed>=3},
synergy1:{text:'SYNERGIST',check:()=>P.synergies.length>=1}
// v6 additional achievements
,stagger_boss:{text:'STUN LOCK',check:()=>false},/* triggered via triggerAchievement */
floor8:{text:'ABYSS WALKER',check:()=>flr>=8},
combo25:{text:'BEYOND MORTAL',check:()=>cmb>=25},
revive:{text:'SECOND CHANCE',check:()=>false},/* triggered via triggerAchievement */
all_classes:{text:'PATH WALKER',check:()=>{try{return saveData.runHistory&&new Set(saveData.runHistory.map(r=>r.cls)).size>=5}catch(e){return false}}},
void_rank1:{text:'VOID CHALLENGER',check:()=>activeVoidRank>=1},
event_shrine:{text:'ALTAR SEEKER',check:()=>false},/* triggered via triggerAchievement */
streak3:{text:'PERSISTENT',check:()=>saveData&&saveData.runStreak>=3}
};let achvShown={};
function checkAchievements(){for(const[k,a]of Object.entries(ACHVS)){if(!achvShown[k]&&a.check()){achvShown[k]=1;showAchievement(a.text);saveAchievement(k)}}}
function triggerAchievement(key){if(!achvShown[key]&&ACHVS[key]){achvShown[key]=1;showAchievement(ACHVS[key].text);saveAchievement(key)}}
function saveAchievement(key){if(!saveData)loadSave();if(!saveData.achievements)saveData.achievements=[];
if(!saveData.achievements.includes(key)){saveData.achievements.push(key);writeSave()}}
function showAchievement(text){const el=document.getElementById('achv-popup');
el.textContent='★ '+text+' ★';el.classList.add('show');sfx('xp');
clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2500)}

/* ═══════════════════════════════════════════════════
   DIALOGUE SYSTEM
   ═══════════════════════════════════════════════════ */
let dialogueTimeout=null;
function showDialogue(speaker,text,col,cb){
dialogueActive=true;dialogueCb=cb||null;
const box=document.getElementById('dialogue-box');
document.getElementById('dlg-speaker').textContent=speaker;
document.getElementById('dlg-speaker').style.color=col||'#c8a0ff';
document.getElementById('dlg-text').textContent=text;
box.classList.add('show');
if(dialogueTimeout)clearTimeout(dialogueTimeout);
dialogueTimeout=setTimeout(()=>{if(dialogueActive)closeDialogue()},5000)}
function closeDialogue(){dialogueActive=false;
if(dialogueTimeout){clearTimeout(dialogueTimeout);dialogueTimeout=null}
document.getElementById('dialogue-box').classList.remove('show');
if(dialogueCb){const cb=dialogueCb;dialogueCb=null;cb()}}

let loreTimeout=null;
function showLore(title,text){loreActive=true;
document.getElementById('lore-title').textContent=title;
document.getElementById('lore-text').textContent=text;
document.getElementById('lore-popup').classList.add('show');sfx('lore');
if(loreTimeout)clearTimeout(loreTimeout);
loreTimeout=setTimeout(()=>{if(loreActive)closeLore()},12000)}
function closeLore(){loreActive=false;
if(loreTimeout){clearTimeout(loreTimeout);loreTimeout=null}
document.getElementById('lore-popup').classList.remove('show')}

/* ═══════════════════════════════════════════════════
   DYNAMIC LIGHTING SYSTEM
   ═══════════════════════════════════════════════════ */
/* ═══════ 2D RAYCAST SHADOW LIGHTING ═══════ */
function _castLight(wx,wy,radius,nRays){
// Cast rays from world position, return screen-space polygon points
const pts=[];if(!cR)return pts;const step=6;
for(let i=0;i<nRays;i++){const a=Math.PI*2/nRays*i,dx=Math.cos(a),dy=Math.sin(a);
let d=0,hitD=radius;
while(d<radius){d+=step;const tx=Math.floor((wx+dx*d)/TS),ty=Math.floor((wy+dy*d)/TS);
if(tx<0||tx>=RW||ty<0||ty>=RH||cR.tiles[ty][tx]===1){hitD=d-step/2;break}}
pts.push({x:(wx+dx*hitD)-cX,y:(wy+dy*hitD)-cY})}return pts}
function _drawRayLight(wx,wy,sx,sy,radius,col,intensity,nRays){
const pts=_castLight(wx,wy,radius,nRays);if(pts.length<3)return;
lt.save();lt.beginPath();lt.moveTo(pts[0].x,pts[0].y);
for(let i=1;i<pts.length;i++)lt.lineTo(pts[i].x,pts[i].y);
lt.closePath();lt.clip();
const g=lt.createRadialGradient(sx,sy,0,sx,sy,radius);
g.addColorStop(0,`rgba(${col},${intensity})`);g.addColorStop(0.15,`rgba(${col},${intensity*0.8})`);
g.addColorStop(0.4,`rgba(${col},${intensity*0.35})`);g.addColorStop(0.7,`rgba(${col},${intensity*0.1})`);
g.addColorStop(1,'rgba(0,0,0,0)');lt.fillStyle=g;lt.fillRect(sx-radius,sy-radius,radius*2,radius*2);lt.restore()}
function _drawSimpleLight(sx,sy,radius,col,intensity){
const g=lt.createRadialGradient(sx,sy,0,sx,sy,radius);
g.addColorStop(0,`rgba(${col},${intensity})`);g.addColorStop(1,'rgba(0,0,0,0)');
lt.fillStyle=g;lt.fillRect(sx-radius,sy-radius,radius*2,radius*2)}
function drawLighting(){
const amb=bio.lightAmb||[15,12,25];
lt.fillStyle=`rgb(${amb[0]},${amb[1]},${amb[2]})`;lt.fillRect(0,0,W,H);
lt.globalCompositeOperation='lighter';
// Player light — full raycast shadows
const psx=P.x-cX,psy=P.y-cY;const plR=280+Math.sin(fr*.12)*12;
const BIOME_TORCH=['230,210,255','140,240,180','255,160,100','160,210,255','200,140,255'];
const pCol=P.bT>0?'255,100,50':(BIOME_TORCH[bio.i]||'230,210,255');
_drawRayLight(P.x,P.y,psx,psy,plR,pCol,1.0,90);
// Torch lights — raycast shadows (fewer rays for performance)
if(cR){for(const torch of cR.torches){
const tx=torch.x-cX,ty=torch.y-cY;
if(tx<-200||tx>W+200||ty<-200||ty>H+200)continue;
const flk=Math.sin(torch.flicker+fr*.15)*6+Math.cos(torch.flicker*.7+fr*.09)*4;
const tR=160+flk;const col=hexToRgb(bio.torchCol);
_drawRayLight(torch.x,torch.y,tx,ty,tR,col,0.8,48)}}
// Projectile lights — simple radial (fast-moving, small)
for(const p of projs){const px=p.x-cX,py=p.y-cY;
if(px<-100||px>W+100||py<-100||py>H+100)continue;
_drawSimpleLight(px,py,28+p.size*5,hexToRgb(p.color),0.55)}
// Elite/boss entity glow
for(const e of ents){if(!e.elite&&e.type!=='boss'&&!e.fl)continue;
const ex=e.x-cX,ey=e.y-cY;if(ex<-100||ex>W+100||ey<-100||ey>H+100)continue;
const col=hexToRgb(e.elite?e.eCol:e.color);const er=e.type==='boss'?80:40;
_drawSimpleLight(ex,ey,er,col,e.fl>0?0.65:0.3)}
// Dynamic lights (explosions, impacts)
for(let i=dynLights.length-1;i>=0;i--){const dl=dynLights[i];
if(dl.decay){dl.age++;dl.intensity*=0.88;if(dl.age>dl.decay||dl.intensity<0.01){dynLights.splice(i,1);continue}}
const dx=dl.x-cX,dy=dl.y-cY;if(dx<-200||dx>W+200||dy<-200||dy>H+200)continue;
const flk=dl.flicker?Math.sin(fr*.15+dl.x)*dl.flicker*dl.r:0;
_drawSimpleLight(dx,dy,dl.r+flk,hexToRgb(dl.col),dl.intensity*0.7)}
// Stairway glow (when room cleared)
if(cR&&!ents.length){const cx=Math.floor(RW/2),cy=Math.floor(RH/2);
if(cR.tiles[cy]&&cR.tiles[cy][cx]===2){const sx2=cx*TS+TS/2-cX,sy2=cy*TS+TS/2-cY;
const sr=85+Math.sin(fr*.06)*12;
_drawRayLight(cx*TS+TS/2,cy*TS+TS/2,sx2,sy2,sr,hexToRgb(bio.torchCol),0.7,36)}}
// Pickup glow
for(const p of picks){const px=p.x-cX,py=p.y-cY;
if(px<-50||px>W+50||py<-50||py>H+50)continue;
let col='255,200,60',pr=28;
if(p.type==='heal'){col='60,255,100';pr=22}
else if(p.type==='weapon'){col=hexToRgb(p.weapon.c);pr=38}
else if(p.type==='accessory'){col='100,220,220';pr=32}
else if(p.type==='lore'){col='200,170,255';pr=35}
else if(p.type==='relic'){col='255,200,80';pr=45}
_drawSimpleLight(px,py,pr,col,0.45)}
// Ghost NPC light
if(cR&&cR.ghost){const gx=cR.ghost.x-cX,gy=cR.ghost.y-cY;
_drawSimpleLight(gx,gy,60+Math.sin(fr*.04)*8,'180,200,255',0.35)}
lt.globalCompositeOperation='source-over'}

function hexToRgb(hex){if(!hex||hex.startsWith('rgba'))return'200,170,255';
const h=hex.replace('#','');if(h.length===3)return`${parseInt(h[0]+h[0],16)},${parseInt(h[1]+h[1],16)},${parseInt(h[2]+h[2],16)}`;
return`${parseInt(h.substr(0,2),16)},${parseInt(h.substr(2,2),16)},${parseInt(h.substr(4,2),16)}`}

/* ═══════════════════════════════════════════════════
   CRT / POST-PROCESSING — v5 enhanced with barrel distortion + biome grading
   ═══════════════════════════════════════════════════ */
function drawCRT(){
crt.clearRect(0,0,W,H);
if(!gameSettings.crtEnabled)return;
// v10.0 Real bloom: downsample → iterative blur → composite
if(gSt==='playing'||gSt==='dead'||gSt==='victory'){
const bw=bloomC.width,bh=bloomC.height;
bloomCtx.clearRect(0,0,bw,bh);bloomCtx.drawImage(gc,0,0,bw,bh);
// 5-pass iterative box blur at half res via self-draw
bloomCtx.globalCompositeOperation='lighter';
const offsets=[[2,0],[-2,0],[0,2],[0,-2],[1,1]];
for(const[ox,oy]of offsets){bloomCtx.globalAlpha=0.18;bloomCtx.drawImage(bloomC,ox,oy)}
bloomCtx.globalCompositeOperation='source-over';bloomCtx.globalAlpha=1;
// Composite bloom back to CRT at full res
crt.globalCompositeOperation='lighter';crt.globalAlpha=0.25;
crt.drawImage(bloomC,0,0,W,H);crt.globalCompositeOperation='source-over';crt.globalAlpha=1}
// Scanlines with alternating intensity — v7.0 increased CRT on deeper floors
const scanIntensity=flr>=9?0.07:0.05;const scanIntensity2=flr>=9?0.05:0.03;
for(let y=0;y<H;y+=3){crt.fillStyle=y%6<3?`rgba(0,0,0,${scanIntensity})`:`rgba(0,0,0,${scanIntensity2})`;crt.fillRect(0,y,W,1)}
// Simulated barrel distortion: shift edge strips inward
crt.fillStyle='rgba(0,0,0,0.04)';
crt.fillRect(0,0,2,H);crt.fillRect(W-2,0,2,H);
crt.fillRect(0,0,W,1);crt.fillRect(0,H-1,W,1);
// Vignette
const vig=crt.createRadialGradient(W/2,H/2,W*.2,W/2,H/2,W*.65);
vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,0,0,0.1)');
crt.fillStyle=vig;crt.fillRect(0,0,W,H);
// v8.0 combo edge glow
if(comboEdgeGlow>0.01){const eA=comboEdgeGlow*0.15;const eCol=cmb>=25?'255,255,255':cmb>=15?'255,34,68':cmb>=10?'255,102,0':'255,153,0';
const eL=crt.createLinearGradient(0,0,20,0);eL.addColorStop(0,`rgba(${eCol},${eA})`);eL.addColorStop(1,'rgba(0,0,0,0)');crt.fillStyle=eL;crt.fillRect(0,0,20,H);
const eR=crt.createLinearGradient(W,0,W-20,0);eR.addColorStop(0,`rgba(${eCol},${eA})`);eR.addColorStop(1,'rgba(0,0,0,0)');crt.fillStyle=eR;crt.fillRect(W-20,0,20,H);
const eT=crt.createLinearGradient(0,0,0,15);eT.addColorStop(0,`rgba(${eCol},${eA})`);eT.addColorStop(1,'rgba(0,0,0,0)');crt.fillStyle=eT;crt.fillRect(0,0,W,15);
const eB=crt.createLinearGradient(0,H,0,H-15);eB.addColorStop(0,`rgba(${eCol},${eA})`);eB.addColorStop(1,'rgba(0,0,0,0)');crt.fillStyle=eB;crt.fillRect(0,H-15,W,15);
comboEdgeGlow*=0.97}
// Biome color grading
if(bio&&bio.tint){const t=bio.tint;crt.fillStyle=`rgba(${t[0]},${t[1]},${t[2]},0.03)`;crt.fillRect(0,0,W,H)}
// v7.0 Progressive corruption: deeper floors darken + desaturate
if(flr>=13){const corruptAlpha=Math.min(0.06,(flr-12)*0.012);crt.fillStyle=`rgba(15,5,25,${corruptAlpha})`;crt.fillRect(0,0,W,H);
// Subtle screen noise on deep floors
if(fr%3===0){for(let ni=0;ni<5;ni++){const nx=Math.random()*W,ny=Math.random()*H;
crt.fillStyle=`rgba(${Math.random()>0.5?100:20},${Math.random()>0.5?0:20},${Math.random()>0.5?60:40},0.02)`;
crt.fillRect(nx,ny,Math.random()*3+1,Math.random()*3+1)}}}
// v10.0 Chromatic aberration — RGB split on damage
if(chromAb>0.5&&(gSt==='playing'||gSt==='dead')){
const abOff=Math.ceil(chromAb*0.5);crt.save();
crt.globalCompositeOperation='lighter';
// Red channel shifted left
crt.globalAlpha=0.08;crt.fillStyle=`rgba(255,0,0,0.15)`;crt.drawImage(gc,-abOff,0);
// Blue channel shifted right
crt.fillStyle=`rgba(0,0,255,0.15)`;crt.drawImage(gc,abOff,0);
crt.globalCompositeOperation='source-over';crt.globalAlpha=1;crt.restore()}
// v8.0 Death screen crack effect
if(gSt==='dead'){crt.save();crt.strokeStyle='rgba(255,50,80,0.15)';crt.lineWidth=1.5;
const cx=W/2,cy=H/2;const seed=flr*7+kills;
for(let cr=0;cr<5;cr++){crt.beginPath();crt.moveTo(cx,cy);let px=cx,py=cy;const baseA=Math.PI*2/5*cr+(seed%10)*0.1;
for(let seg=0;seg<6;seg++){const a=baseA+(Math.random()-.5)*0.8;const len=20+Math.random()*35;
px+=Math.cos(a)*len;py+=Math.sin(a)*len;crt.lineTo(px,py);
if(seg>1&&Math.random()>.5){crt.stroke();crt.beginPath();crt.moveTo(px,py);const ba=a+(Math.random()>.5?0.5:-0.5);
crt.lineTo(px+Math.cos(ba)*15,py+Math.sin(ba)*15);crt.stroke();crt.beginPath();crt.moveTo(px,py)}}
crt.stroke()}crt.restore()}}

/* ═══════════════════════════════════════════════════
   TITLE SCREEN ANIMATION
   ═══════════════════════════════════════════════════ */
let titleParts=[];
function drawTitle(){
titleCtx.clearRect(0,0,W,H);
const cx=W/2,cy=H/2-20;
// v10.0 Stone Archway Dungeon Entrance in Dark Forest
const breathe=0.5+Math.sin(fr*0.02)*0.5;
const archX=cx,archBaseY=cy+80;// base of arch pillars
const pillarW=28,pillarH=130,archW=90;// half-width of opening
const groundY=archBaseY;

// === A. FOREST BACKGROUND ===
// Sky gradient — dark navy to forest green-black
const skyG=titleCtx.createLinearGradient(0,0,0,H);
skyG.addColorStop(0,'#080e1a');skyG.addColorStop(0.4,'#0a0e18');skyG.addColorStop(0.7,'#0c1610');skyG.addColorStop(1,'#0a120c');
titleCtx.fillStyle=skyG;titleCtx.fillRect(0,0,W,H);
// Moonlight — subtle cool radial from upper-right
const moonG=titleCtx.createRadialGradient(W*0.75,H*0.1,0,W*0.75,H*0.1,W*0.4);
moonG.addColorStop(0,'rgba(180,200,230,0.04)');moonG.addColorStop(1,'rgba(0,0,0,0)');
titleCtx.fillStyle=moonG;titleCtx.fillRect(0,0,W,H);
// Stars through canopy gaps
for(const s of titleStars){const sx=((s.x+fr*0.02)%W+W)%W;const sy=s.y;
const twinkle=0.4+Math.sin(fr*0.025+s.seed*10)*0.35;
titleCtx.globalAlpha=0.15*twinkle;titleCtx.fillStyle='#c8d8ff';
titleCtx.beginPath();titleCtx.arc(sx,sy,s.sz,0,Math.PI*2);titleCtx.fill()}
titleCtx.globalAlpha=1;
// Distant treeline silhouettes — 10 overlapping dark shapes
for(const t of titleTrees){const tx=t.x*W;const th=t.h*H;const tw=t.w*W;
const sway=Math.sin(fr*0.005+t.seed)*2;
titleCtx.fillStyle=`rgba(${12+t.shade*40},${22+t.shade*30},${14+t.shade*20},0.85)`;
titleCtx.beginPath();
titleCtx.moveTo(tx-tw*0.5+sway,H*0.75);
titleCtx.lineTo(tx+sway*0.5,H*0.75-th);
titleCtx.lineTo(tx+tw*0.5+sway,H*0.75);titleCtx.closePath();titleCtx.fill();
// Trunk
titleCtx.fillStyle=`rgba(${18+t.shade*30},${14+t.shade*20},${10+t.shade*15},0.7)`;
titleCtx.fillRect(tx-2+sway*0.3,H*0.75,4,H*0.25)}
// Foreground tree trunks on edges
for(let side=0;side<2;side++){const ftx=side===0?W*0.06:W*0.94;
titleCtx.fillStyle='rgba(14,12,8,0.8)';titleCtx.fillRect(ftx-8,H*0.15,16,H*0.85);
// Branches
titleCtx.strokeStyle='rgba(14,12,8,0.6)';titleCtx.lineWidth=3;
for(let b=0;b<3;b++){const by=H*0.2+b*H*0.15;const dir=side===0?1:-1;
titleCtx.beginPath();titleCtx.moveTo(ftx,by);
titleCtx.quadraticCurveTo(ftx+dir*40,by-10,ftx+dir*60,by-20+Math.sin(fr*0.004+b)*2);titleCtx.stroke()}}

// === B. GROUND ===
// Rocky ground
titleCtx.fillStyle='rgba(22,20,16,0.7)';titleCtx.fillRect(0,groundY-2,W,H-groundY+2);
// Stone path leading to arch
for(let sp=0;sp<8;sp++){const sx=archX+(sp-3.5)*28+(Math.sin(sp*2.3)*6);
const sw=18+Math.sin(sp*1.7)*4;const sh=6+Math.sin(sp*3.1)*2;
titleCtx.fillStyle=`rgba(${38+sp*2},${32+sp*2},${48+sp*2},0.35)`;
titleCtx.fillRect(sx-sw/2,groundY+4+sp*8,sw,sh)}
// Roots from trees
titleCtx.strokeStyle='rgba(30,25,18,0.3)';titleCtx.lineWidth=2;
titleCtx.beginPath();titleCtx.moveTo(W*0.06,groundY+5);titleCtx.quadraticCurveTo(W*0.15,groundY+8,archX-archW-pillarW-20,groundY+3);titleCtx.stroke();

// === C. STONE ARCHWAY STRUCTURE ===
// Dark opening behind arch
titleCtx.fillStyle='rgba(2,1,4,0.9)';
titleCtx.beginPath();titleCtx.moveTo(archX-archW,groundY);titleCtx.lineTo(archX+archW,groundY);
titleCtx.lineTo(archX+archW,archBaseY-pillarH);
titleCtx.arc(archX,archBaseY-pillarH,archW,0,-Math.PI,true);
titleCtx.lineTo(archX-archW,groundY);titleCtx.closePath();titleCtx.fill();

// Stone pillars — stacked blocks with variation
for(let side=0;side<2;side++){const px=side===0?archX-archW-pillarW:archX+archW;
for(let row=0;row<8;row++){const ry=groundY-row*(pillarH/8)-pillarH/8;
const shade=42+Math.sin(row*2.7+side*5)*8;const shadeG=shade-8;const shadeB=shade+12;
titleCtx.fillStyle=`rgba(${shade},${shadeG},${shadeB},0.65)`;
titleCtx.fillRect(px+1,ry+1,pillarW-2,pillarH/8-2);
// Mortar lines
titleCtx.strokeStyle='rgba(25,20,35,0.4)';titleCtx.lineWidth=1;
titleCtx.strokeRect(px+1,ry+1,pillarW-2,pillarH/8-2);
// Moss on some stones
if((row+side*3)%4===0){titleCtx.fillStyle='rgba(35,65,30,0.25)';
titleCtx.fillRect(px+2,ry+2,pillarW*0.6,4)}}}

// Semicircular arch connecting pillars
titleCtx.strokeStyle='rgba(55,48,70,0.7)';titleCtx.lineWidth=pillarW;
titleCtx.beginPath();titleCtx.arc(archX,archBaseY-pillarH,archW+pillarW/2,Math.PI,0,false);titleCtx.stroke();
// Arch stone segments
for(let a=0;a<9;a++){const ang=Math.PI-a*(Math.PI/9);const angN=Math.PI-(a+1)*(Math.PI/9);
const r1=archW+2,r2=archW+pillarW-2;
const shade=48+Math.sin(a*1.9)*10;
titleCtx.fillStyle=`rgba(${shade},${shade-6},${shade+8},0.55)`;
titleCtx.beginPath();
titleCtx.moveTo(archX+Math.cos(ang)*r1,archBaseY-pillarH+Math.sin(ang)*r1);
titleCtx.lineTo(archX+Math.cos(ang)*r2,archBaseY-pillarH+Math.sin(ang)*r2);
titleCtx.lineTo(archX+Math.cos(angN)*r2,archBaseY-pillarH+Math.sin(angN)*r2);
titleCtx.lineTo(archX+Math.cos(angN)*r1,archBaseY-pillarH+Math.sin(angN)*r1);
titleCtx.closePath();titleCtx.fill();
titleCtx.strokeStyle='rgba(25,20,35,0.3)';titleCtx.lineWidth=1;titleCtx.stroke()}
// Keystone — larger center stone at apex
titleCtx.fillStyle='rgba(68,58,82,0.7)';
titleCtx.beginPath();const ksAng=Math.PI/2;const ksW=0.18;
titleCtx.moveTo(archX+Math.cos(ksAng-ksW)*(archW-2),archBaseY-pillarH+Math.sin(ksAng-ksW)*(archW-2));
titleCtx.lineTo(archX+Math.cos(ksAng-ksW)*(archW+pillarW+4),archBaseY-pillarH+Math.sin(ksAng-ksW)*(archW+pillarW+4));
titleCtx.lineTo(archX+Math.cos(ksAng+ksW)*(archW+pillarW+4),archBaseY-pillarH+Math.sin(ksAng+ksW)*(archW+pillarW+4));
titleCtx.lineTo(archX+Math.cos(ksAng+ksW)*(archW-2),archBaseY-pillarH+Math.sin(ksAng+ksW)*(archW-2));
titleCtx.closePath();titleCtx.fill();
titleCtx.strokeStyle='rgba(90,78,105,0.4)';titleCtx.lineWidth=1;titleCtx.stroke();

// === D. STONE STEPS DESCENDING INTO FOG ===
for(let s=0;s<6;s++){const sy=groundY+s*10;const sw=archW*2*(1-s*0.06);
const shade=Math.max(0.05,0.3-s*0.045);
titleCtx.fillStyle=`rgba(50,42,65,${shade})`;
titleCtx.fillRect(archX-sw/2,sy,sw,8);
titleCtx.strokeStyle=`rgba(70,62,88,${shade*0.6})`;titleCtx.lineWidth=1;
titleCtx.beginPath();titleCtx.moveTo(archX-sw/2+2,sy);titleCtx.lineTo(archX+sw/2-2,sy);titleCtx.stroke()}

// === E. FOG RISING FROM DEPTHS ===
for(let f=0;f<4;f++){const fogY=groundY+20+f*12;const fogDrift=Math.sin(fr*0.008+f*2.1)*20;
const fogW=60+f*15;const fogA=0.08-f*0.015+Math.sin(fr*0.01+f)*0.02;
const fogG=titleCtx.createRadialGradient(archX+fogDrift,fogY,0,archX+fogDrift,fogY,fogW);
fogG.addColorStop(0,`rgba(160,180,210,${Math.max(0,fogA)})`);fogG.addColorStop(1,'rgba(0,0,0,0)');
titleCtx.fillStyle=fogG;titleCtx.fillRect(archX-fogW-20,fogY-fogW,fogW*2+40,fogW*2)}
// Fog surge — occasional pulse
const fogSurge=Math.sin(fr*0.006)*0.5+0.5;
const surgeG=titleCtx.createRadialGradient(archX,groundY+10,0,archX,groundY-20,50+fogSurge*30);
surgeG.addColorStop(0,`rgba(180,200,230,${0.04+fogSurge*0.03})`);surgeG.addColorStop(1,'rgba(0,0,0,0)');
titleCtx.fillStyle=surgeG;titleCtx.fillRect(archX-100,groundY-60,200,80);

// === F. IRON DOOR — leaning open against right pillar ===
titleCtx.save();
const doorX=archX+archW*0.3,doorY=groundY-pillarH*0.85;
titleCtx.translate(doorX,groundY);titleCtx.rotate(-0.22);// lean angle
titleCtx.fillStyle='rgba(35,28,22,0.7)';
// Door body with arched top
titleCtx.beginPath();titleCtx.moveTo(-22,0);titleCtx.lineTo(-22,-90);
titleCtx.arc(0,-90,22,Math.PI,0,false);titleCtx.lineTo(22,0);titleCtx.closePath();titleCtx.fill();
// Iron bands
titleCtx.strokeStyle='rgba(50,40,30,0.6)';titleCtx.lineWidth=3;
for(let b=0;b<4;b++){const by=-b*22-10;titleCtx.beginPath();titleCtx.moveTo(-20,by);titleCtx.lineTo(20,by);titleCtx.stroke()}
// Rivets
titleCtx.fillStyle='rgba(60,50,38,0.7)';
for(let r=0;r<6;r++){const rx=(r%2===0?-16:16),ry=-r*16-8;
titleCtx.beginPath();titleCtx.arc(rx,ry,2.5,0,Math.PI*2);titleCtx.fill()}
// Rust patches
titleCtx.fillStyle='rgba(100,55,25,0.15)';
titleCtx.fillRect(-15,-60,12,18);titleCtx.fillRect(5,-30,10,14);
// Broken hinge at top
titleCtx.fillStyle='rgba(45,38,28,0.6)';titleCtx.fillRect(18,-88,8,12);
titleCtx.restore();

// === G. GLOWING RUNES — Elder Futhark on arch ===
const runeChars=['\u16B1','\u16A8','\u16BE','\u16C1','\u16CB','\u16CF','\u16D2','\u16DA','\u16D7','\u16DE'];
titleCtx.font='11px serif';titleCtx.textAlign='center';
// Runes along the arch curve
for(let r=0;r<8;r++){const ang=Math.PI-r*(Math.PI/8)-Math.PI/16;
const runeR=archW+pillarW/2;
const rx=archX+Math.cos(ang)*runeR;const ry=archBaseY-pillarH+Math.sin(ang)*runeR;
const glowPhase=Math.sin(fr*0.03+r*0.8);const runeA=0.2+glowPhase*0.25;
// Glow halo
titleCtx.globalAlpha=runeA*0.3;titleCtx.fillStyle='#4488ff';titleCtx.font='18px serif';
titleCtx.fillText(runeChars[r],rx,ry+4);
// Rune itself
titleCtx.globalAlpha=runeA;titleCtx.fillStyle='#66aaff';titleCtx.font='11px serif';
titleCtx.fillText(runeChars[r],rx,ry+4);
// Cast blue light on nearby stone
const rlG=titleCtx.createRadialGradient(rx,ry,0,rx,ry,14);
rlG.addColorStop(0,`rgba(68,136,255,${runeA*0.06})`);rlG.addColorStop(1,'rgba(0,0,0,0)');
titleCtx.globalAlpha=1;titleCtx.fillStyle=rlG;titleCtx.fillRect(rx-14,ry-14,28,28)}
// Runes down pillar sides
for(let side=0;side<2;side++){for(let pr=0;pr<3;pr++){
const prx=side===0?archX-archW-pillarW/2:archX+archW+pillarW/2;
const pry=groundY-pr*35-25;const gp=Math.sin(fr*0.03+(pr+8+side*3)*0.8);const pa=0.15+gp*0.2;
titleCtx.globalAlpha=pa*0.3;titleCtx.fillStyle='#4488ff';titleCtx.font='16px serif';
titleCtx.fillText(runeChars[8+side],prx,pry);
titleCtx.globalAlpha=pa;titleCtx.fillStyle='#66aaff';titleCtx.font='10px serif';
titleCtx.fillText(runeChars[8+side],prx,pry)}}
titleCtx.globalAlpha=1;

// === H. ORNATE IRON TORCH STANDS ===
const torchPos=[{x:archX-archW-pillarW-35,side:0},{x:archX+archW+pillarW+35,side:1}];
for(const tp of torchPos){const tx=tp.x,tBaseY=groundY;
// Iron stand — ornate pole
titleCtx.strokeStyle='rgba(50,38,28,0.7)';titleCtx.lineWidth=4;
titleCtx.beginPath();titleCtx.moveTo(tx,tBaseY);titleCtx.lineTo(tx,tBaseY-100);titleCtx.stroke();
// Base plate
titleCtx.fillStyle='rgba(45,35,25,0.6)';
titleCtx.beginPath();titleCtx.moveTo(tx-12,tBaseY);titleCtx.lineTo(tx+12,tBaseY);
titleCtx.lineTo(tx+8,tBaseY-6);titleCtx.lineTo(tx-8,tBaseY-6);titleCtx.closePath();titleCtx.fill();
// Decorative spiral at top
titleCtx.strokeStyle='rgba(55,42,30,0.5)';titleCtx.lineWidth=2;
for(let sp=0;sp<8;sp++){const sa=sp*0.8;const sr=3+sp*0.4;
titleCtx.beginPath();titleCtx.arc(tx+Math.cos(sa)*sr,tBaseY-96+Math.sin(sa)*sr,1,0,Math.PI*2);titleCtx.stroke()}
// Torch cup
titleCtx.fillStyle='rgba(60,45,30,0.6)';
titleCtx.beginPath();titleCtx.moveTo(tx-8,tBaseY-96);titleCtx.lineTo(tx-10,tBaseY-104);
titleCtx.lineTo(tx+10,tBaseY-104);titleCtx.lineTo(tx+8,tBaseY-96);titleCtx.closePath();titleCtx.fill();
// Rust spots
titleCtx.fillStyle='rgba(100,58,28,0.2)';titleCtx.fillRect(tx-2,tBaseY-70,5,8);titleCtx.fillRect(tx-3,tBaseY-40,4,6);
// === LARGE ANIMATED FLAMES ===
const ty=tBaseY-108;
const f1=Math.sin(fr*0.12+tp.side*4)*4;const f2=Math.cos(fr*0.17+tp.side*3)*3;
const f3=Math.sin(fr*0.23+tp.side*7)*2;const windGust=Math.sin(fr*0.008+tp.side*5)*3;
// Outer glow — large warm radius
const fOG=titleCtx.createRadialGradient(tx+f2+windGust,ty-10+f1,0,tx,ty-5,50);
fOG.addColorStop(0,'rgba(255,140,30,0.12)');fOG.addColorStop(0.4,'rgba(255,80,15,0.04)');fOG.addColorStop(1,'rgba(0,0,0,0)');
titleCtx.fillStyle=fOG;titleCtx.fillRect(tx-55,ty-60,110,75);
// Main flame body — larger
titleCtx.fillStyle='rgba(255,120,20,0.45)';titleCtx.beginPath();
titleCtx.moveTo(tx-8,ty+8);titleCtx.quadraticCurveTo(tx-10+f2,ty-14,tx+f1*0.4+windGust,ty-32+f1);
titleCtx.quadraticCurveTo(tx+10+f2,ty-14,tx+8,ty+8);titleCtx.closePath();titleCtx.fill();
// Mid flame — orange-yellow
titleCtx.fillStyle='rgba(255,170,40,0.45)';titleCtx.beginPath();
titleCtx.moveTo(tx-5,ty+5);titleCtx.quadraticCurveTo(tx-6+f2*0.7,ty-8,tx+f3+windGust*0.5,ty-22+f1*0.6);
titleCtx.quadraticCurveTo(tx+6+f2*0.7,ty-8,tx+5,ty+5);titleCtx.closePath();titleCtx.fill();
// Inner bright core — yellow-white
titleCtx.fillStyle='rgba(255,230,120,0.55)';titleCtx.beginPath();
titleCtx.moveTo(tx-3,ty+3);titleCtx.quadraticCurveTo(tx-3+f2*0.3,ty-3,tx+f3*0.5,ty-12+f1*0.3);
titleCtx.quadraticCurveTo(tx+3+f2*0.3,ty-3,tx+3,ty+3);titleCtx.closePath();titleCtx.fill();
// Warm light cast on ground and arch stones
const tlG=titleCtx.createRadialGradient(tx,groundY-10,0,tx,groundY-10,80);
tlG.addColorStop(0,'rgba(255,140,40,0.06)');tlG.addColorStop(0.5,'rgba(255,100,20,0.02)');tlG.addColorStop(1,'rgba(0,0,0,0)');
titleCtx.fillStyle=tlG;titleCtx.fillRect(tx-80,groundY-80,160,100);
// Smoke wisps
if(fr%20===tp.side*10){titleParts.push({x:tx+(Math.random()-0.5)*4,y:ty-30,
vx:(Math.random()-0.5)*0.15+windGust*0.05,vy:-0.15-Math.random()*0.2,
life:60+Math.random()*40,ml:100,size:3+Math.random()*4,type:'smoke'})}
// Ember sparks — continuous
if(fr%3===tp.side){titleParts.push({x:tx+(Math.random()-0.5)*8,y:ty-6,
vx:(Math.random()-0.5)*0.6+windGust*0.1,vy:-1-Math.random()*1.5,
life:25+Math.random()*25,ml:50,size:0.6+Math.random()*1.2,
color:Math.random()>0.7?'#ffffcc':Math.random()>0.4?'#ffaa33':'#ff6622',type:'ember'})}}

// === I. GLOWING BLUE FLOWERS ===
for(const fl of titleFlowers){const fx=archX+fl.xOff*W;const fy=groundY+4+fl.yOff*100;
const fPulse=0.5+Math.sin(fr*0.02+fl.seed*6)*0.3;
// Glow
const flG=titleCtx.createRadialGradient(fx,fy,0,fx,fy,12);
flG.addColorStop(0,`rgba(68,136,255,${0.06*fl.bright*fPulse})`);flG.addColorStop(1,'rgba(0,0,0,0)');
titleCtx.fillStyle=flG;titleCtx.fillRect(fx-12,fy-12,24,24);
// Stem
titleCtx.strokeStyle='rgba(40,80,35,0.35)';titleCtx.lineWidth=1;
titleCtx.beginPath();titleCtx.moveTo(fx,fy);titleCtx.lineTo(fx,fy+4);titleCtx.stroke();
// Petals
titleCtx.globalAlpha=0.5*fl.bright*fPulse+0.2;titleCtx.fillStyle='#4488cc';
for(let p=0;p<4;p++){const pa=p*Math.PI/2+fl.seed;
titleCtx.beginPath();titleCtx.arc(fx+Math.cos(pa)*2,fy+Math.sin(pa)*2,fl.sz*0.6,0,Math.PI*2);titleCtx.fill()}
// Center
titleCtx.fillStyle='#66bbff';titleCtx.beginPath();titleCtx.arc(fx,fy,fl.sz*0.4,0,Math.PI*2);titleCtx.fill()}
titleCtx.globalAlpha=1;

// === J. ATMOSPHERIC PARTICLES — fireflies, embers, leaves, fog wisps ===
// Fireflies — random walk with pulsing glow
for(const ff of titleFireflies){ff.vx+=(Math.random()-0.5)*0.06;ff.vy+=(Math.random()-0.5)*0.06;
ff.vx*=0.97;ff.vy*=0.97;ff.x+=ff.vx;ff.y+=ff.vy;
if(ff.x<0)ff.x=W;if(ff.x>W)ff.x=0;if(ff.y<0)ff.y=H*0.7;if(ff.y>H*0.85)ff.y=H*0.3;
const pulse=Math.sin(fr*0.04+ff.phase)*0.5+0.5;
if(pulse>0.3){titleCtx.globalAlpha=pulse*0.4;
const ffG=titleCtx.createRadialGradient(ff.x,ff.y,0,ff.x,ff.y,6);
ffG.addColorStop(0,`rgba(170,255,170,0.4)`);ffG.addColorStop(1,'rgba(0,0,0,0)');
titleCtx.fillStyle=ffG;titleCtx.fillRect(ff.x-6,ff.y-6,12,12);
titleCtx.fillStyle='#aaffaa';titleCtx.beginPath();titleCtx.arc(ff.x,ff.y,1,0,Math.PI*2);titleCtx.fill()}}
titleCtx.globalAlpha=1;
// Falling leaves — occasional
if(fr%90===0){titleParts.push({x:Math.random()*W,y:-5,vx:0.2+Math.random()*0.3,vy:0.3+Math.random()*0.4,
life:200+Math.random()*100,ml:300,size:2+Math.random()*2,rot:Math.random()*Math.PI*2,type:'leaf'})}
// Fog wisps from entrance
if(fr%25===0){titleParts.push({x:archX+(Math.random()-0.5)*archW,y:groundY+5,
vx:(Math.random()-0.5)*0.15,vy:-0.1-Math.random()*0.2,
life:80+Math.random()*60,ml:140,size:8+Math.random()*15,type:'fogwisp'})}
// Update & draw all title particles
for(let i=titleParts.length-1;i>=0;i--){const p=titleParts[i];p.x+=p.vx;p.y+=p.vy;p.life--;
if(p.life<=0||titleParts.length>120){titleParts.splice(i,1);continue}
const pa=p.life/p.ml;
if(p.type==='smoke'){titleCtx.globalAlpha=pa*0.04;titleCtx.fillStyle='#666';
titleCtx.beginPath();titleCtx.arc(p.x,p.y,p.size,0,Math.PI*2);titleCtx.fill()}
else if(p.type==='leaf'){p.rot+=0.02;titleCtx.save();titleCtx.translate(p.x,p.y);titleCtx.rotate(p.rot);
titleCtx.globalAlpha=pa*0.12;titleCtx.fillStyle='#1a2a12';
titleCtx.beginPath();titleCtx.ellipse(0,0,p.size,p.size*0.4,0,0,Math.PI*2);titleCtx.fill();titleCtx.restore()}
else if(p.type==='fogwisp'){titleCtx.globalAlpha=pa*0.06;
const fwG=titleCtx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size);
fwG.addColorStop(0,'rgba(160,180,210,0.3)');fwG.addColorStop(1,'rgba(0,0,0,0)');
titleCtx.fillStyle=fwG;titleCtx.fillRect(p.x-p.size,p.y-p.size,p.size*2,p.size*2)}
else{// ember
titleCtx.globalAlpha=pa*0.6;titleCtx.fillStyle=p.color||'#ffaa33';
// Glow halo
const eGl=titleCtx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*3);
eGl.addColorStop(0,`rgba(255,150,40,${pa*0.08})`);eGl.addColorStop(1,'rgba(0,0,0,0)');
titleCtx.fillStyle=eGl;titleCtx.fillRect(p.x-p.size*3,p.y-p.size*3,p.size*6,p.size*6);
titleCtx.fillStyle=p.color||'#ffaa33';
titleCtx.beginPath();titleCtx.arc(p.x,p.y,p.size*Math.min(1,pa*2),0,Math.PI*2);titleCtx.fill()}}
titleCtx.globalAlpha=1;
// === K. TITLE TEXT GLOW — warm amber + cool blue ===
const h1=document.querySelector('#title-scr h1');
if(h1){const gp=Math.sin(fr*0.03)*6+10;const rGp=Math.sin(fr*0.02)*0.15+0.35;
h1.style.textShadow=`0 0 ${gp}px rgba(255,180,80,${rGp}),0 0 ${gp*1.5}px rgba(68,136,255,${rGp*0.5}),0 0 ${gp*2.5}px rgba(68,136,255,${rGp*0.15}),0 2px 0 rgba(0,0,0,0.3)`}}

/* ═══════════════════════════════════════════════════
   STATUS EFFECTS — v5 with combo reactions
   ═══════════════════════════════════════════════════ */
function applyStatus(target,type,dur){
const existing=target.statuses?.find(s=>s.type===type);
if(existing){existing.dur=Math.max(existing.dur,dur);return}
if(!target.statuses)target.statuses=[];
target.statuses.push({type,dur,tick:0})}
function tickStatuses(e,sdt){if(!e.statuses)return;
for(let i=e.statuses.length-1;i>=0;i--){const s=e.statuses[i];s.dur-=sdt;s.tick-=sdt;
const eMult=P.elemMastery&&e!==P?2:1;
if(s.type==='burn'&&s.tick<=0){s.tick=12;if(e===P&&P.phoenixBlood){e.hp=Math.min(e.mhp,e.hp+.8*.15);ft(e.x,e.y-18,'+HEAL','#44ff66',0.5);emit(e.x,e.y,2,'#44ff66',1,8,1)}else{const burnMult=P.pyroclasm&&e!==P?3:1;e.hp-=.8*eMult*burnMult}emit(e.x,e.y,2,'#ff6633',1,8,1);
// v6.1 rising ember trail
for(let eb=0;eb<2;eb++){parts.push({x:e.x+(Math.random()-0.5)*e.hw,y:e.y+(Math.random()-0.5)*e.hh,vx:(Math.random()-.5)*.3,vy:-.8-Math.random()*.5,life:18+Math.random()*10,ml:28,color:Math.random()>.5?'#ff9944':'#ffcc22',size:.8+Math.random()*.8,shape:'circle',grav:-0.02})}}
if(s.type==='poison'&&s.tick<=0){s.tick=15;e.hp-=.5*eMult;emit(e.x,e.y,1,'#66ff44',.5,8,1);
if(P.toxicAvenger&&e!==P){P.hp=Math.min(P.mhp,P.hp+.3);if(fr%30===0)ft(P.x,P.y-18,'+TOXIC','#66ff44',0.5)}}
if(s.type==='bleed'&&s.tick<=0){s.tick=10;e.hp-=.6*eMult;emit(e.x,e.y,1,'#ff2244',.8,6,1)}
if(s.type==='freeze'){e.frozen=Math.max(e.frozen||0,s.dur)}
if(s.type==='slow'){e.slowMult=.5}
if(s.dur<=0){e.statuses.splice(i,1);
if(s.type==='slow')e.slowMult=1}}}

// v5 Status combo reactions
function checkStatusCombo(e,wasCrit){if(!e.statuses||e.hp<=0)return;
// SHATTER: Freeze + Physical hit = 3x bonus damage, ice fragments
const freezeS=e.statuses.find(s=>s.type==='freeze');
if(freezeS&&freezeS.dur>0){
const shatterDmg=P.permafrost?15:3;e.hp-=shatterDmg;
e.statuses=e.statuses.filter(s=>s.type!=='freeze');e.frozen=0;
emit(e.x,e.y,16,'#88ccff',4,16,2,'circle');emitRing(e.x,e.y,12,'#44aaff',3,12,1.5);
ft(e.x,e.y-22,'SHATTER','#66ddff',1);sfx('shatter',1,e.x);addShockwave(e.x,e.y,50,'#88ccff',12);addDynLight(e.x,e.y,60,'#88ccff',1,0,8)}
// TOXIC EXPLOSION: Burn + Poison = AOE damage radius 60, both consumed
const burnS=e.statuses.find(s=>s.type==='burn');
const poisonS=e.statuses.find(s=>s.type==='poison');
if(burnS&&poisonS){
e.statuses=e.statuses.filter(s=>s.type!=='burn'&&s.type!=='poison');
emit(e.x,e.y,24,'#88ff44',5,20,2.5);emitRing(e.x,e.y,20,'#aaff22',4,18,2);
ft(e.x,e.y-24,'TOXIC BURST','#88ff44',1);sfx('toxic_exp',1,e.x);addShockwave(e.x,e.y,70,'#88ff44',14);addDynLight(e.x,e.y,80,'#88ff44',1.2,0,10);
for(const oe of ents){if(oe!==e&&Math.hypot(oe.x-e.x,oe.y-e.y)<60){oe.hp-=4;oe.fl=6;emit(oe.x,oe.y,5,'#88ff44',2,10,1.5)}}}
// HEMORRHAGE: Bleed + Crit = instant 50% bleed damage, double duration
const bleedS=e.statuses.find(s=>s.type==='bleed');
if(bleedS&&wasCrit){
const hemDmg=e.mhp*0.08;e.hp-=hemDmg;bleedS.dur*=2;
emit(e.x,e.y,10,'#ff2244',3,14,2);ft(e.x,e.y-20,'HEMORRHAGE','#ff2244',1);sfx('bleed',1,e.x)}}

/* ═══════════════════════════════════════════════════
   INVENTORY & PARRY SYSTEMS
   ═══════════════════════════════════════════════════ */
let controlsOpen=false;
function toggleControls(){const el=document.getElementById('controls-overlay');
if(controlsOpen){el.classList.remove('show');controlsOpen=false;if(gSt==='controls')gSt='playing'}
else if(gSt==='playing'){el.classList.add('show');controlsOpen=true;gSt='controls'}}
function toggleInv(){if(gSt==='playing'){gSt='inventory';renderInv();document.getElementById('inv-overlay').classList.add('show')}
else if(gSt==='inventory'){gSt='playing';document.getElementById('inv-overlay').classList.remove('show')}}
function renderInv(){const c=document.getElementById('inv-content');
const wpn=P.w||{name:'FISTS',desc:'Basic punches',d:1,c:'#aaa'};
const acc=P.acc||{name:'NONE',desc:'No accessory'};
const forgeSuffix=P.forgeDmg>0?` +${P.forgeDmg}`:'';
let perksHtml='';if(P.perkNames.length){perksHtml='<div class="inv-perks">';
for(const pn of P.perkNames){const pk=PERKS.find(p=>p.n===pn);const rc=pk?RARITY_COLORS[pk.r]||'#aaa':'#aaa';
perksHtml+=`<span class="perk-tag" style="color:${rc};border-color:${rc}33">${pn}</span>`}
perksHtml+='</div>'}
let synHtml='';if(P.synergies.length){synHtml='<div class="inv-synergies">';
for(const s of P.synergies)synHtml+=`<span class="synergy-tag">★ ${s}</span>`;
synHtml+='</div>'}
const relicHtml=P.relic?`<div class="inv-slot"><div class="inv-slot-label">RELIC</div><div class="inv-slot-name" style="color:#ffcc44">${P.relic.name}</div><div class="inv-slot-desc">${P.relic.desc}</div></div>`:'';
c.innerHTML=`<div class="inv-class" style="color:${P.classColor}">${P.classIcon} ${P.className}</div>
<div class="inv-title">EQUIPMENT</div>
<div class="inv-grid">
<div class="inv-slot"><div class="inv-slot-label">WEAPON</div><div class="inv-slot-name" style="color:${wpn.c}">${wpn.name}${forgeSuffix}</div><div class="inv-slot-desc">${wpn.desc||''} · DMG:${wpn.d}</div></div>
<div class="inv-slot"><div class="inv-slot-label">ACCESSORY</div><div class="inv-slot-name" style="color:#64dfdf">${acc.name}</div><div class="inv-slot-desc">${acc.desc||''}</div></div>
${relicHtml}
</div>
<div class="inv-title" style="font-size:11px;margin-top:8px">STATS</div>
<div class="inv-stats">
<div class="inv-stat"><div class="inv-stat-val">${P.mhp}</div><div class="inv-stat-lbl">MAX HP</div></div>
<div class="inv-stat"><div class="inv-stat-val">${(wD()).toFixed(1)}</div><div class="inv-stat-lbl">DAMAGE</div></div>
<div class="inv-stat"><div class="inv-stat-val">${(P.cc*100).toFixed(0)}%</div><div class="inv-stat-lbl">CRIT</div></div>
<div class="inv-stat"><div class="inv-stat-val">${P.arm}</div><div class="inv-stat-lbl">ARMOR</div></div>
<div class="inv-stat"><div class="inv-stat-val">${(P.spd).toFixed(1)}</div><div class="inv-stat-lbl">SPEED</div></div>
<div class="inv-stat"><div class="inv-stat-val">${P.ls.toFixed(1)}</div><div class="inv-stat-lbl">LIFESTEAL</div></div>
</div>
${synHtml}${perksHtml}
<div style="font-family:Silkscreen,monospace;font-size:7px;color:rgba(255,136,68,0.3);letter-spacing:2px;margin-bottom:10px">FORGE LEVEL: ${P.forgeLevel}</div>
<button class="btn" onclick="toggleInv()">CLOSE</button>`}

function tryParry(){if(P.parryCD>0)return;P.parryWindow=10;P.parryCD=35;sfx('parry',0.3);
emit(P.x+Math.cos(P.dir)*12,P.y+Math.sin(P.dir)*12,6,'#ffffff',1.5,8,1.5)}

function useSpecial(){if(P.spCd>0||!P.w||P.w.sp==='none')return;P.spCd=P.spMax;
const w=P.w;sfx('special');flash(w.c,.08);
if(w.sp==='thrust'){const d=P.dir;P.ai.push({x:P.x,y:P.y,life:14,dir:d});P.vx+=Math.cos(d)*8;P.vy+=Math.sin(d)*8;
for(const e of ents){if(Math.hypot(e.x-P.x,e.y-P.y)<wR()+30){hrtE(e,wD()*2,false,d);emitDir(e.x,e.y,8,w.c,d,.5,3,12,2)}}
shk=6;addShockwave(P.x+Math.cos(d)*40,P.y+Math.sin(d)*40,50,w.c,10);
for(let i=0;i<12;i++){const a=d+Math.PI+(Math.random()-.5)*1;parts.push({x:P.x,y:P.y,vx:Math.cos(a)*(2+Math.random()*2),vy:Math.sin(a)*(2+Math.random()*2),life:10+Math.random()*6,ml:16,color:'rgba(255,255,255,0.5)',size:1,shape:'rect'})}}
else if(w.sp==='cleave'){for(const e of ents){if(Math.hypot(e.x-P.x,e.y-P.y)<wR()+20){hrtE(e,wD()*1.5,false,Math.atan2(e.y-P.y,e.x-P.x))}}
emitRing(P.x,P.y,16,w.c,3,14,2);shk=8;chromAb=Math.max(chromAb,2);addShockwave(P.x,P.y,wR()+30,w.c,12)}
else if(w.sp==='flurry'){P.atkCd=0;for(let i=0;i<5;i++)setTimeout(()=>{if(gSt==='playing'){pAtk();shk=Math.min(8,shk+1.5);chromAb=Math.min(4,chromAb+0.6)}},i*60)}
else if(w.sp==='fireball'||w.sp==='meteor'){const a=P.dir;const isMeteor=w.sp==='meteor';
for(let i=0;i<(isMeteor?5:1);i++){const sa=a+(isMeteor?(i-2)*.3:0);
projs.push({x:P.x,y:P.y,vx:Math.cos(sa)*5,vy:Math.sin(sa)*5,dmg:wD()*2,life:80,color:'#ff6633',size:6,enemy:0,burn:1,explode:1})}
if(isMeteor){shk=12;chromAb=Math.max(chromAb,4);slMo=Math.max(slMo,10);camZoom=1.06;camZoomT=12;addShockwave(P.x,P.y,100,'#ff6633',16);
for(let i=0;i<20;i++)parts.push({x:P.x+(Math.random()-.5)*160,y:P.y-120-Math.random()*60,vx:(Math.random()-.5)*2,vy:3+Math.random()*3,life:25+Math.random()*15,ml:40,color:Math.random()>.5?'#ff6633':'#ffaa33',size:2+Math.random()*2,shape:'circle',grav:0.12})}
else{shk=6;addShockwave(P.x,P.y,40,'#ff6633',8)}}
else if(w.sp==='voidslash'){const a=P.dir;for(let i=0;i<8;i++){const sa=a+Math.PI*2/8*i;
projs.push({x:P.x,y:P.y,vx:Math.cos(sa)*4,vy:Math.sin(sa)*4,dmg:wD()*1.2,life:50,color:'#bb66ff',size:4,enemy:0})}
shk=6;chromAb=Math.max(chromAb,2);addShockwave(P.x,P.y,80,'#bb66ff',12);
// v7.1 Voidslash: screen-spanning purple line
vfxLines.push({x:P.x,y:P.y,angle:a,life:14,ml:14,color:'#bb66ff',width:3});
const vLen=Math.max(W,H);for(let vi=0;vi<40;vi++){const vd=(vi-20)*vLen/20;
parts.push({x:P.x+Math.cos(a)*vd,y:P.y+Math.sin(a)*vd,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)-.3,life:12+Math.random()*8,ml:20,color:Math.random()>.3?'#bb66ff':'#dd99ff',size:2+Math.random()*3,shape:'circle'})}}
else if(w.sp==='glacial'){for(const e of ents){if(Math.hypot(e.x-P.x,e.y-P.y)<120){applyStatus(e,'freeze',60);emit(e.x,e.y,6,'#66ccff',2,12,1.5)}}
emit(P.x,P.y,20,'#66ccff',4,18,2);shk=6;flash('#88ccff',.08);addShockwave(P.x,P.y,120,'#88ccff',14);
for(let i=0;i<16;i++){const a=Math.PI*2/16*i;parts.push({x:P.x,y:P.y,vx:Math.cos(a)*(3+Math.random()*2),vy:Math.sin(a)*(3+Math.random()*2),life:16,ml:16,color:Math.random()>.3?'#88ccff':'#aaeeff',size:2+Math.random()*2,shape:'diamond',grav:0.06})}}
else if(w.sp==='backstab'){const ox=P.x,oy=P.y;P.inv=8;const nearest=ents.reduce((n,e)=>Math.hypot(e.x-P.x,e.y-P.y)<150&&(!n||Math.hypot(e.x-P.x,e.y-P.y)<Math.hypot(n.x-P.x,n.y-P.y))?e:n,null);
if(nearest){P.x=nearest.x-Math.cos(nearest.dir)*20;P.y=nearest.y-Math.sin(nearest.dir)*20;hrtE(nearest,wD()*3,true,P.dir);emit(P.x,P.y,10,'#44ddaa',3,12,2);
P.ai.push({x:ox,y:oy,life:18,dir:P.dir});flash('#44ddaa',.08);chromAb=Math.max(chromAb,2);addShockwave(P.x,P.y,40,'#44ddaa',8)}}
else if(w.sp==='toxicburst'){for(const e of ents){if(Math.hypot(e.x-P.x,e.y-P.y)<100){applyStatus(e,'poison',90);emit(e.x,e.y,4,'#66ff44',1.5,10,1.5)}}
emit(P.x,P.y,18,'#66ff44',4,16,2);shk=5;flash('#66ff44',.06);addShockwave(P.x,P.y,100,'#66ff44',14);
for(let i=0;i<30;i++)parts.push({x:P.x+(Math.random()-.5)*40,y:P.y+(Math.random()-.5)*40,vx:(Math.random()-.5)*.8,vy:-.3-Math.random()*.6,life:30+Math.random()*15,ml:45,color:Math.random()>.4?'#66ff44':'#88ff66',size:1.5+Math.random()*2,shape:'circle',grav:-0.01})}
else if(w.sp==='multishot'){for(let i=0;i<7;i++){const a=P.dir+(i-3)*.18;projs.push({x:P.x,y:P.y,vx:Math.cos(a)*5.5,vy:Math.sin(a)*5.5,dmg:wD(),life:55,color:w.c,size:3,enemy:0})}
shk=4;addShockwave(P.x,P.y,30,w.c,8)}
else if(w.sp==='pierceshot'){projs.push({x:P.x,y:P.y,vx:Math.cos(P.dir)*7,vy:Math.sin(P.dir)*7,dmg:wD()*3,life:80,color:'#ffcc44',size:5,enemy:0,pierce:5});
shk=5;camZoom=1.03;camZoomT=6;addShockwave(P.x,P.y,25,'#ffcc44',6)}
else if(w.sp==='blizzard'){for(let i=0;i<12;i++){const a=Math.random()*Math.PI*2,d=40+Math.random()*80;
projs.push({x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2,dmg:wD()*.8,life:40,color:'#88ccff',size:4,enemy:0,freeze:1})}
shk=4;flash('#88ccff',.06);blizzardFrostT=60}
else if(w.sp==='shatter'){emitRing(P.x,P.y,24,'#44ffcc',5,16,2);for(const e of ents){if(Math.hypot(e.x-P.x,e.y-P.y)<100){hrtE(e,wD()*2,true,Math.atan2(e.y-P.y,e.x-P.x))}}
shk=10;chromAb=Math.max(chromAb,4);slMo=Math.max(slMo,8);
for(let i=0;i<20;i++){const a=Math.random()*Math.PI*2;parts.push({x:P.x,y:P.y,vx:Math.cos(a)*(3+Math.random()*3),vy:Math.sin(a)*(3+Math.random()*3),life:14,ml:14,color:Math.random()>.4?'#44ffcc':'#88ffdd',size:2+Math.random()*2,shape:'diamond',grav:0.08})}}
else if(w.sp==='soulreap'){for(const e of ents){const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<130){hrtE(e,wD()*1.8,false,Math.atan2(e.y-P.y,e.x-P.x));P.hp=Math.min(P.mhp,P.hp+2);
for(let s=0;s<4;s++){const sa=Math.atan2(P.y-e.y,P.x-e.x);parts.push({x:e.x,y:e.y,vx:Math.cos(sa)*3+Math.random(),vy:Math.sin(sa)*3+Math.random(),life:20,ml:20,color:'#ff88cc',size:1.5,shape:'circle'})}}}
emit(P.x,P.y,25,'#ff44aa',5,20,2.5);shk=8;chromAb=Math.max(chromAb,3);camZoom=1.04;camZoomT=10;addShockwave(P.x,P.y,80,'#ff44aa',14)}
else if(w.sp==='voidbeam'){for(let i=0;i<40;i++){const d=i*8;projs.push({x:P.x+Math.cos(P.dir)*d,y:P.y+Math.sin(P.dir)*d,vx:0,vy:0,dmg:wD()*.5,life:15,color:'#aa44ff',size:6,enemy:0})}
chromAb=Math.max(chromAb,5);shk=8;flash('#aa44ff',.15);addShockwave(P.x,P.y,60,'#aa44ff',10);slMo=Math.max(slMo,8);
for(let i=0;i<20;i++)parts.push({x:P.x+Math.cos(P.dir)*i*16,y:P.y+Math.sin(P.dir)*i*16,vx:(Math.random()-.5),vy:(Math.random()-.5),life:18,ml:18,color:'#dd88ff',size:3+Math.random()*2,shape:'circle'})}
else if(w.sp==='bloodstorm'){for(const e of ents){if(Math.hypot(e.x-P.x,e.y-P.y)<120){applyStatus(e,'bleed',80);hrtE(e,wD(),false,Math.atan2(e.y-P.y,e.x-P.x))}}
emit(P.x,P.y,22,'#ff2244',4,18,2);shk=10;chromAb=Math.max(chromAb,3);flash('#ff2244',.1);addShockwave(P.x,P.y,120,'#ff2244',16);
for(let i=0;i<30;i++){const a=Math.PI*2/30*i+fr*.1;const d=20+i*3;parts.push({x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d,vx:Math.cos(a+Math.PI/2)*2,vy:Math.sin(a+Math.PI/2)*2,life:20,ml:20,color:'#ff2244',size:2,shape:'circle'})}
// v7.1 Bloodstorm: red tornado spiral around player
for(let ti=0;ti<3;ti++){for(let si=0;si<16;si++){const sa=Math.PI*2/16*si+ti*Math.PI*2/3;const sr=15+si*5;const sv=2+si*0.3;
parts.push({x:P.x+Math.cos(sa)*sr,y:P.y+Math.sin(sa)*sr,vx:Math.cos(sa+Math.PI/2)*sv,vy:Math.sin(sa+Math.PI/2)*sv-1.5,
life:18+Math.random()*12,ml:30,color:Math.random()>.4?'#ff2244':'#cc1133',size:1.5+Math.random()*2,shape:'circle',grav:-0.05})}}}
else if(w.sp==='divineblast'){emitRing(P.x,P.y,30,'#ffffaa',6,24,3);
for(let i=0;i<40;i++){const a=Math.random()*Math.PI*2;parts.push({x:P.x,y:P.y,vx:Math.cos(a)*(2+Math.random()*4),vy:Math.sin(a)*(2+Math.random()*4),life:16+Math.random()*10,ml:26,color:'#ffffaa',size:2+Math.random()*2,shape:'star'})}
for(const e of ents){const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<160){hrtE(e,wD()*2.5,false,Math.atan2(e.y-P.y,e.x-P.x));e.fl=15}}
shk=15;chromAb=Math.max(chromAb,5);slMo=Math.max(slMo,15);camZoom=1.08;camZoomT=15;flash('#ffffaa',.2);
addShockwave(P.x,P.y,80,'#ffffff',12);addShockwave(P.x,P.y,160,'#ffffaa',20);addDynLight(P.x,P.y,200,'#ffffaa',2,0,20);
// v7.1 Divineblast: golden light pillar from above
for(let pi=0;pi<30;pi++){const px=P.x+(Math.random()-.5)*20;parts.push({x:px,y:P.y-150-Math.random()*100,vx:(Math.random()-.5)*.3,vy:4+Math.random()*3,
life:20+Math.random()*10,ml:30,color:Math.random()>.3?'#ffffaa':'#ffdd66',size:2+Math.random()*3,shape:'star',grav:0.1})}
for(let pi=0;pi<12;pi++){parts.push({x:P.x+(Math.random()-.5)*6,y:P.y-pi*20,vx:(Math.random()-.5)*.2,vy:-0.5,
life:14+Math.random()*8,ml:22,color:'#ffffff',size:1+Math.random(),shape:'circle'})}}}

/* ═══════════════════════════════════════════════════
   ROOM & DUNGEON GENERATION — v5 with mini-bosses, challenge waves
   ═══════════════════════════════════════════════════ */
function gR(gx,gy){return rooms.find(r=>r.gx===gx&&r.gy===gy)||null}
function genDungeon(){
// v6.0 Daily challenge: override Math.random during dungeon gen for deterministic layouts
const _origRand=Math.random;if(dailyMode&&seedRng){Math.random=seedRng}
rooms=[];bio=BIO[Math.floor((flr-1)/3)%BIO.length];setMood(bio.i);ambientParts=[];dynLights=[];decors=[];bloodSplats=[];
buildTileCache(bio.i);
const GW=8,GH=8,grid=Array.from({length:GH},()=>Array(GW).fill(null));
const sx=4,sy=4;grid[sy][sx]={type:'start'};const q=[{x:sx,y:sy}];let count=1;const target=Math.min(24,8+flr*2);
while(q.length&&count<target){const idx=Math.floor(Math.random()*q.length);const{x,y}=q[idx];
const dirs=[[0,-1],[0,1],[-1,0],[1,0]].sort(()=>Math.random()-.5);let exp=0;
for(const[dx,dy]of dirs){const nx=x+dx,ny=y+dy;if(nx<0||nx>=GW||ny<0||ny>=GH||grid[ny][nx])continue;
let adj=0;for(const[ax,ay]of[[0,-1],[0,1],[-1,0],[1,0]]){const cx=nx+ax,cy=ny+ay;if(cx>=0&&cx<GW&&cy>=0&&cy<GH&&grid[cy][cx])adj++}
if(adj>1)continue;grid[ny][nx]={type:'normal'};count++;q.push({x:nx,y:ny});exp=1;if(count>=target||Math.random()<.35)break}
if(!exp)q.splice(idx,1)}
let mxD=0,stP=null;const norms=[];
for(let gy=0;gy<GH;gy++)for(let gx=0;gx<GW;gx++){if(grid[gy][gx]&&!(gx===sx&&gy===sy)){const d=Math.abs(gx-sx)+Math.abs(gy-sy);if(d>mxD){mxD=d;stP={x:gx,y:gy}}norms.push({x:gx,y:gy})}}
if(stP)grid[stP.y][stP.x].type=flr%4===0?'boss':'stairs';
const sh=norms.filter(p=>!(stP&&p.x===stP.x&&p.y===stP.y)).sort(()=>Math.random()-.5);
let tc=0,sc=0,cc=0,lc2=0,mb=0;
for(const p of sh){if(tc<2&&Math.random()<.4){grid[p.y][p.x].type='treasure';tc++}
else if(sc<1&&Math.random()<.22){grid[p.y][p.x].type='shop';sc++}
else if(cc<1&&flr>2&&Math.random()<.15){grid[p.y][p.x].type='challenge';cc++}
else if(lc2<1&&flr>1&&Math.random()<.12){grid[p.y][p.x].type='lore';lc2++}
else if(mb<1&&flr>1&&flr%2===0&&Math.random()<.18){grid[p.y][p.x].type='miniboss';mb++}
else if(flr>1&&Math.random()<.08){grid[p.y][p.x].type='secret'}
// v7.0 New room types
else if(flr>2&&Math.random()<.10){grid[p.y][p.x].type='gauntlet'}
else if(flr>3&&Math.random()<.08){grid[p.y][p.x].type='pit'}
else if(flr>1&&Math.random()<.10){grid[p.y][p.x].type='horde'}
else if(flr>2&&Math.random()<.06){grid[p.y][p.x].type='shrine'}
else if(Math.random()<.15){grid[p.y][p.x].hasEvent=true}}
for(let gy=0;gy<GH;gy++)for(let gx=0;gx<GW;gx++){const c=grid[gy][gx];if(!c)continue;
const doors={n:gy>0&&!!grid[gy-1][gx],s:gy<GH-1&&!!grid[gy+1][gx],w:gx>0&&!!grid[gy][gx-1],e:gx<GW-1&&!!grid[gy][gx+1]};
const tiles=bTiles(doors,c.type);
rooms.push({gx,gy,type:c.type,doors,tiles,cleared:['start','shop','secret','lore','shrine'].includes(c.type),visited:c.type==='start',
eDefs:['start','shop','treasure','secret','lore','shrine','horde'].includes(c.type)?[]:genED(c.type,tiles),
chests:c.type==='treasure'?genChests():c.type==='secret'?[{x:RPX/2,y:RPY/2,op:0}]:c.type==='shrine'?[{x:RPX/2,y:RPY/2,op:0,shrineReward:true}]:[],
sItems:c.type==='shop'?genSI():[],sNPC:c.type==='shop'?{x:RPX/2,y:RPY/2-TS}:null,
ghost:c.type==='lore'?{x:RPX/2,y:RPY/2,spoke:false}:null,
loreTablet:c.type==='secret'||c.type==='lore'||(c.type==='normal'&&Math.random()<.06)?
  LORE_TABLETS[Math.floor(Math.random()*LORE_TABLETS.length)]:null,
merchantSpoken:false,
roomEvent:c.hasEvent?{...ROOM_EVENTS[Math.floor(Math.random()*ROOM_EVENTS.length)],used:false,x:RPX/2,y:RPY/2}:null,
traps:['normal','challenge','gauntlet'].includes(c.type)&&(flr>2||c.type==='challenge'||c.type==='gauntlet')&&Math.random()<.35?genTraps(c.type==='challenge'||c.type==='gauntlet'):[],
barrels:['normal','treasure'].includes(c.type)?genBarrels(tiles):[],
torches:genTorches(tiles,doors),
roomDecor:genRoomDecor(tiles),
// v7.0 New room type data
hordeWave:c.type==='horde'?{wave:0,maxWave:3,active:false,pause:0}:null,
shrinePuzzle:c.type==='shrine'?{crystals:[
{x:TS*2.5,y:TS*2.5,color:'#ff6644',active:false,order:0},
{x:RPX-TS*2.5,y:TS*2.5,color:'#44ff66',active:false,order:1},
{x:TS*2.5,y:RPY-TS*2.5,color:'#4466ff',active:false,order:2},
{x:RPX-TS*2.5,y:RPY-TS*2.5,color:'#ffcc00',active:false,order:3}],
sequence:[0,1,2,3].sort(()=>Math.random()-.5),currentStep:0,showT:120,timer:0,failed:false,solved:false}:null})}
cRX=sx;cRY=sy;cR=gR(sx,sy);P.x=RPX/2;P.y=RPY/2;ents=[];projs=[];picks=[];props=[];
// v6.0 Restore Math.random after seeded dungeon gen
if(dailyMode)Math.random=_origRand;
loadRoom()}

function genChests(){const n=1+Math.floor(Math.random()*2);const ch=[];
for(let i=0;i<n;i++){ch.push({x:RPX/2-40+Math.random()*80,y:RPY/2-20+Math.random()*40,op:0,mimic:flr>2&&Math.random()<0.1})}return ch}

function genTorches(tiles,doors){const torches=[];
const add=(tx,ty)=>{if(tx>=1&&tx<RW-1&&ty>=1&&ty<RH-1&&tiles[ty][tx]===0)torches.push({x:tx*TS+TS/2,y:ty*TS+TS/2,flicker:Math.random()*100})};
add(1,1);add(RW-2,1);add(1,RH-2);add(RW-2,RH-2);
if(doors.n){add(DC[0]-1,1);add(DC[DC.length-1]+1,1)}
if(doors.s){add(DC[0]-1,RH-2);add(DC[DC.length-1]+1,RH-2)}
if(doors.w){add(1,DR[0]-1);add(1,DR[DR.length-1]+1)}
if(doors.e){add(RW-2,DR[0]-1);add(RW-2,DR[DR.length-1]+1)}
return torches}

function genRoomDecor(tiles){const decor=[];
for(let ty=1;ty<RH-1;ty++){for(let tx=1;tx<RW-1;tx++){
if(tiles[ty][tx]===0&&Math.random()<.04){
const type=bio.decor[Math.floor(Math.random()*bio.decor.length)];
decor.push({x:tx*TS+TS/2,y:ty*TS+TS/2,type,rot:Math.random()*Math.PI*2,scale:.5+Math.random()*.5})}}}
return decor}

function bTiles(doors,type){const t=Array.from({length:RH},()=>Array(RW).fill(0));
for(let x=0;x<RW;x++){t[0][x]=1;t[RH-1][x]=1}for(let y=0;y<RH;y++){t[y][0]=1;t[y][RW-1]=1}
if(doors.n)for(const c of DC)t[0][c]=0;if(doors.s)for(const c of DC)t[RH-1][c]=0;
if(doors.w)for(const r of DR)t[r][0]=0;if(doors.e)for(const r of DR)t[r][RW-1]=0;
const cx=Math.floor(RW/2),cy=Math.floor(RH/2);
const ok=(x,y)=>x>1&&x<RW-2&&y>1&&y<RH-2&&!(Math.abs(x-cx)<=2&&Math.abs(y-cy)<=2);
// v7.0 Enhanced room generation: cellular automata caves for Fungal/Void, themed templates
if(['normal','challenge','miniboss'].includes(type)){
const biIdx=bio?bio.i:0;const useCave=(biIdx===1||biIdx===4)&&Math.random()<0.5;// Fungal or Void
if(useCave){// Cellular automata cave generation
for(let y=2;y<RH-2;y++)for(let x=2;x<RW-2;x++){if(ok(x,y)&&Math.random()<0.42)t[y][x]=1}
for(let iter=0;iter<3;iter++){const nt=t.map(r=>[...r]);
for(let y=2;y<RH-2;y++)for(let x=2;x<RW-2;x++){if(!ok(x,y))continue;
let walls=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(dx===0&&dy===0)continue;if(t[y+dy]&&t[y+dy][x+dx]===1)walls++}
nt[y][x]=walls>=5?1:walls<=2?0:t[y][x]}
for(let y=2;y<RH-2;y++)for(let x=2;x<RW-2;x++)t[y][x]=nt[y][x]}
// Ensure center is clear
for(let y=cy-2;y<=cy+2;y++)for(let x=cx-2;x<=cx+2;x++)if(y>0&&y<RH-1&&x>0&&x<RW-1)t[y][x]=0;
// Ensure paths to doors
for(const dc of DC){for(let y=1;y<=3;y++)if(t[y])t[y][dc]=0;for(let y=RH-4;y<RH-1;y++)if(t[y])t[y][dc]=0}
for(const dr of DR){if(t[dr])t[dr][1]=0;if(t[dr])t[dr][RW-2]=0}
// Flood-fill connectivity: carve paths from each door to center if blocked
const _ff=(sx2,sy2)=>{const vis=Array.from({length:RH},()=>Array(RW).fill(false));const stk=[[sx2,sy2]];
while(stk.length){const[fx,fy]=stk.pop();if(fx<0||fx>=RW||fy<0||fy>=RH||vis[fy][fx])continue;vis[fy][fx]=true;
if(t[fy][fx]!==0&&t[fy][fx]!==2&&t[fy][fx]!==3)continue;
if(Math.abs(fx-cx)<=2&&Math.abs(fy-cy)<=2)return true;
stk.push([fx+1,fy],[fx-1,fy],[fx,fy+1],[fx,fy-1])}return false};
const _carve=(sx2,sy2)=>{let px2=sx2,py2=sy2;while(px2!==cx||py2!==cy){
if(px2<cx)px2++;else if(px2>cx)px2--;if(py2<cy)py2++;else if(py2>cy)py2--;
if(py2>0&&py2<RH-1&&px2>0&&px2<RW-1&&t[py2][px2]===1)t[py2][px2]=0}};
if(doors.n&&!_ff(DC[1],1))_carve(DC[1],1);
if(doors.s&&!_ff(DC[1],RH-2))_carve(DC[1],RH-2);
if(doors.w&&!_ff(1,DR[1]))_carve(1,DR[1]);
if(doors.e&&!_ff(RW-2,DR[1]))_carve(RW-2,DR[1])}
else{const p=Math.floor(Math.random()*14);
if(p===0){[[2,2],[2,RW-3],[RH-3,2],[RH-3,RW-3]].forEach(([r,c])=>{if(ok(c,r))t[r][c]=1})}
else if(p===1){for(let x=3;x<RW-3;x++)if(x!==cx&&ok(x,cy))t[cy][x]=1}
else if(p===2){for(let y=2;y<RH-2;y++)if(y!==cy&&ok(cx,y))t[y][cx]=1}
else if(p===3){for(let x=3;x<cx-1;x++)if(ok(x,3))t[3][x]=1;for(let y=3;y<cy-1;y++)if(ok(3,y))t[y][3]=1;
for(let x=cx+2;x<RW-3;x++)if(ok(x,RH-4))t[RH-4][x]=1;for(let y=cy+2;y<RH-3;y++)if(ok(RW-4,y))t[y][RW-4]=1}
else if(p===4){for(let i=0;i<8;i++){const bx=2+Math.floor(Math.random()*(RW-4)),by=2+Math.floor(Math.random()*(RH-4));if(ok(bx,by))t[by][bx]=1}}
else if(p===5){for(let x=4;x<RW-4;x+=3)for(let y=3;y<RH-3;y+=3)if(ok(x,y))t[y][x]=1}
else if(p===6){for(let x=3;x<cx;x++)if(ok(x,3))t[3][x]=1;for(let y=3;y<cy;y++)if(ok(cx,y))t[y][cx]=1}
else if(p===7){for(let i=0;i<4;i++){const dx=cx+[3,0,-3,0][i],dy=cy+[0,3,0,-3][i];if(ok(dx,dy))t[dy][dx]=1}}
// v7.0 Themed room templates
else if(p===8){// Library: rows of bookshelves with narrow aisles
for(let x=3;x<RW-3;x+=2)for(let y=2;y<RH-2;y++){if(y!==cy&&ok(x,y))t[y][x]=1}}
else if(p===9){// Cathedral: tall pillars in symmetrical pattern
const pillars=[[3,3],[3,RH-4],[RW-4,3],[RW-4,RH-4],[cx-3,cy],[cx+3,cy],[cx,cy-3],[cx,cy+3]];
pillars.forEach(([px,py])=>{if(ok(px,py))t[py][px]=1;if(ok(px+1,py))t[py][px+1]=1})}
else if(p===10){// Prison: cells along walls with central corridor
for(let x=2;x<RW-2;x+=3){if(ok(x,2))t[2][x]=1;if(ok(x,RH-3))t[RH-3][x]=1}
for(let y=2;y<cy-1;y++)for(let x=2;x<RW-2;x+=3){if(ok(x,y))t[y][x]=1}
for(let y=cy+2;y<RH-2;y++)for(let x=2;x<RW-2;x+=3){if(ok(x,y))t[y][x]=1}}
else if(p===11){// Chasm: narrow bridges over void
for(let y=2;y<RH-2;y++)for(let x=2;x<RW-2;x++){
if(ok(x,y)&&Math.abs(y-cy)>1&&Math.abs(x-cx)>1)t[y][x]=3}
// Bridges
for(let x=2;x<RW-2;x++){t[cy][x]=0;t[cy-1][x]=0;t[cy+1][x]=0}
for(let y=2;y<RH-2;y++){t[y][cx]=0;t[y][cx-1]=0;t[y][cx+1]=0}}
else if(p===12){// Diamond: walls form a diamond ring
for(let y=2;y<RH-2;y++)for(let x=2;x<RW-2;x++){
const md=Math.abs(x-cx)+Math.abs(y-cy);if(md===4&&ok(x,y))t[y][x]=1}}
else if(p===13){// Maze fragments: partial maze walls
for(let x=3;x<RW-3;x+=4){for(let y=2;y<cy-1;y++)if(ok(x,y))t[y][x]=1}
for(let x=5;x<RW-3;x+=4){for(let y=cy+2;y<RH-2;y++)if(ok(x,y))t[y][x]=1}}}}
// v7.0 Symmetrical boss arenas
if(['stairs','boss'].includes(type)){t[cy][cx]=2;
if(type==='boss'){// Mirror layout across both axes
for(let y=2;y<cy;y++)for(let x=2;x<cx;x++){
if(Math.random()<0.15&&ok(x,y)){t[y][x]=1;const mx=RW-1-x,my=RH-1-y;
if(ok(mx,y))t[y][mx]=1;if(ok(x,my))t[my][x]=1;if(ok(mx,my))t[my][mx]=1}}}}
if(type==='challenge'){for(let i=0;i<4;i++){const bx=3+Math.floor(Math.random()*(RW-6)),by=3+Math.floor(Math.random()*(RH-6));if(ok(bx,by))t[by][bx]=1}}
// v7.0 New room type layouts
if(type==='gauntlet'){// Narrow corridor 17x5 with alcoves
for(let y=0;y<RH;y++)for(let x=0;x<RW;x++){if(y<4||y>RH-5)t[y][x]=1}
// Carve alcoves
for(let ax=0;ax<3;ax++){const asx=3+ax*5;if(asx<RW-2){t[4][asx]=0;t[4][asx+1]=0;t[3][asx]=0;t[3][asx+1]=0;
t[RH-5][asx+2]=0;t[RH-5][asx+3]=0;t[RH-4][asx+2]=0;t[RH-4][asx+3]=0}}}
if(type==='pit'){// Central platform with 4 bridges over void
for(let y=1;y<RH-1;y++)for(let x=1;x<RW-1;x++){
const inCenter=Math.abs(x-cx)<=3&&Math.abs(y-cy)<=2;
const onBridgeH=Math.abs(y-cy)<=1&&(x>=1&&x<=cx-3||x>=cx+4&&x<RW-1);
const onBridgeV=Math.abs(x-cx)<=1&&(y>=1&&y<=cy-2||y>=cy+3&&y<RH-1);
if(!inCenter&&!onBridgeH&&!onBridgeV&&t[y][x]===0)t[y][x]=3}} // 3=hazard tiles as pit
if(type==='horde'){// Open circular arena with pillar ring
const radius=Math.min(cx-1,cy-1)-1;
for(let y=1;y<RH-1;y++)for(let x=1;x<RW-1;x++){
const dx2=x-cx,dy2=y-cy;const d2=Math.sqrt(dx2*dx2+dy2*dy2);
if(d2>radius)t[y][x]=1}
// Pillar ring at 70% radius
for(let a=0;a<8;a++){const pa=Math.PI*2/8*a;const px2=Math.round(cx+Math.cos(pa)*(radius*0.65));const py2=Math.round(cy+Math.sin(pa)*(radius*0.65));
if(px2>1&&px2<RW-2&&py2>1&&py2<RH-2)t[py2][px2]=1}}
if(type==='shrine'){// Symmetrical room with central altar
t[cy][cx]=1;t[cy][cx+1]=1;t[cy+1][cx]=1;t[cy+1][cx+1]=1;// Altar block
// Diamond torch pillars
for(const[dx2,dy2]of[[3,0],[-3,0],[0,3],[0,-3]]){const px2=cx+dx2,py2=cy+dy2;if(ok(px2,py2))t[py2][px2]=1}}
// v5.1 biome hazard tiles
if(bio.hazard&&!['start','shop'].includes(type)){for(let hy=2;hy<RH-2;hy++)for(let hx=2;hx<RW-2;hx++){
if(t[hy][hx]===0&&Math.random()<bio.hazard.chance&&!(Math.abs(hx-cx)<=2&&Math.abs(hy-cy)<=2))t[hy][hx]=3}}
return t}

function genTraps(isChallenge){const tr=[];const n=isChallenge?5+Math.floor(Math.random()*4):2+Math.floor(Math.random()*3);
for(let i=0;i<n;i++){const types=['spike','fire','arrow'][Math.floor(Math.random()*3)];
tr.push({tx:2+Math.floor(Math.random()*(RW-4)),ty:2+Math.floor(Math.random()*(RH-4)),timer:Math.random()*100,on:0,cd:60+Math.random()*40,type:types})}return tr}
function genBarrels(tiles){const b=[];for(let i=0;i<Math.floor(Math.random()*5);i++){let bx,by,tries=0;
do{bx=2+Math.floor(Math.random()*(RW-4));by=2+Math.floor(Math.random()*(RH-4));tries++}while(tries<20&&(tiles[by][bx]!==0||Math.abs(bx-Math.floor(RW/2))<=1&&Math.abs(by-Math.floor(RH/2))<=1));
if(tries<20){const r=Math.random();const pType=r<.2?'explosive':r<.32?'toxic':r<.42?'ice':'normal';
b.push({x:bx*TS+TS/2,y:by*TS+TS/2,hp:pType==='ice'?2:3,type:pType})}}return b}

function genED(type,tiles){const isBoss=type==='boss';const isChal=type==='challenge';const isMini=type==='miniboss';
const n=isBoss?1:isMini?1:isChal?Math.min(12,4+flr):Math.min(10,2+Math.floor(flr*.8)+Math.floor(Math.random()*3));const l=[];
for(let i=0;i<n;i++){let et;if(isBoss)et='boss';
else if(isMini){const pool=['slime_king','skel_champ','shadow_lord','fire_elder'];et=pool[Math.floor(Math.random()*pool.length)]}
else{const pool=flr<3?['slime','slime','bat','rat','swarmer']:flr<5?['slime','bat','skel','bat','spider','swarmer','swarmer']:
flr<8?['bat','skel','mage','skel','brute','spider','wraith','swarmer','shaman']:flr<12?['skel','mage','brute','mage','assassin','wraith','golem','shaman','knight','stalker','revenant']:
['mage','brute','assassin','wraith','golem','necromancer','knight','shaman','stalker','revenant'];et=pool[Math.floor(Math.random()*pool.length)]}
let ex,ey,tries=0,valid=false;do{ex=TS*2+Math.random()*(RPX-TS*4);ey=TS*2+Math.random()*(RPY-TS*4);tries++;
const tx=Math.floor(ex/TS),ty=Math.floor(ey/TS);
valid=tx>=1&&tx<RW-1&&ty>=1&&ty<RH-1&&tiles[ty]&&tiles[ty][tx]===0&&
 tiles[ty][tx-1]!==1&&tiles[ty][tx+1]!==1&&
 (tiles[ty-1]?tiles[ty-1][tx]!==1:true)&&(tiles[ty+1]?tiles[ty+1][tx]!==1:true)&&
 !(Math.abs(ex-RPX/2)<TS*3&&Math.abs(ey-RPY/2)<TS*3)
}while(tries<50&&!valid);
if(!valid){ex=RPX/2+(Math.random()-.5)*TS*3;ey=RPY/2+(Math.random()-.5)*TS*3}
const isElite=!isBoss&&!isMini&&(isChal?(Math.random()<.3):(flr>2&&Math.random()<.08+flr*.02));
l.push({et,x:ex,y:ey,elite:isElite})}return l}

function genSI(){const items=[
{name:'HEAL POTION',desc:'Restore 3 HP',cost:12+flr*3,type:'heal',val:3},
{name:'MAX HP UP',desc:'+2 Max HP',cost:22+flr*5,type:'maxhp',val:2},
{name:'SHIELD POTION',desc:'+3 Shield',cost:18+flr*3,type:'shield',val:3}];
const tier=flr<4?1:flr<8?2:3;const w=WPN.filter(w=>w.tier===tier);
if(w.length)items.push({...w[Math.floor(Math.random()*w.length)],cost:18+flr*10,type:'weapon'});
const a=ACCESSORIES.filter(a=>a.tier<=tier);
if(a.length&&Math.random()<.5)items.push({...a[Math.floor(Math.random()*a.length)],cost:25+flr*8,type:'accessory'});
return items}

function loadRoom(){ents=[];projs=[];picks=[];props=[...cR.barrels.map(b=>({...b}))];
dynLights=[];bloodSplats=[];waveActive=false;waveNum=0;
// v9.0 Remove previous room modifier and roll new one
if(curRoomMod&&curRoomMod.remove)curRoomMod.remove();curRoomMod=null;
if(!cR.cleared&&flr>=2){const mod=rollRoomMod();if(mod){curRoomMod=mod;
setTimeout(()=>{if(curRoomMod){curRoomMod.apply();
msg(`${mod.icon} ${mod.name}<br><span style="font-size:8px;color:${mod.color}">${mod.desc}</span>`,1500);
sfx('event_ambient')}},400)}}
// v7.0 Chaos Gem: random buff each room
if(P.chaosGem){const chaosBufNames=['spd','bd','cc','arm'];const cbKey=chaosBufNames[Math.floor(Math.random()*chaosBufNames.length)];
if(P.chaosRoomBuff){P[P.chaosRoomBuff.key]-=P.chaosRoomBuff.val}
const cbVal=cbKey==='spd'?0.3:cbKey==='bd'?1:cbKey==='cc'?0.05:1;P[cbKey]+=cbVal;P.chaosRoomBuff={key:cbKey,val:cbVal};
ft(P.x,P.y-20,`CHAOS: +${cbKey.toUpperCase()}`,'#ff88cc')}
// v7.0 Chrono Loop: reset snapshots each room and mark unused
if(P.chronoLoop){P.chronoSnaps=[];P.chronoUsed=false}
if(!cR.cleared){for(let di=0;di<cR.eDefs.length;di++){const d=cR.eDefs[di];const e=mkE(d.et,d.x,d.y);
// v5 spawn animation: stagger timing
e.animState='spawn';e.animFrame=0;e.animTimer=0;e.spawnDelay=di*8;e.spawnDone=false;e.alpha=0;
// Void Fountain event buff: enemies +20% HP
if(P.eventBuff==='voidFountain'){e.hp=Math.ceil(e.hp*1.2);e.mhp=Math.ceil(e.mhp*1.2)}
if(d.elite&&d.et!=='boss'&&!d.et.startsWith('slime_king')&&!d.et.startsWith('skel_champ')&&!d.et.startsWith('shadow_lord')&&!d.et.startsWith('fire_elder')){
const mod=EMODS[Math.floor(Math.random()*EMODS.length)];mod.a(e);e.elite=1;e.eName=mod.n;e.eCol=mod.c;e.eSym=mod.sym;e.eVfx=mod.vfx;e.xp*=2.5;e.gold*=2;
// v10.0 Champion tier — floor 6+, rare, 2 mods + aura
if(flr>=6&&Math.random()<0.03+flr*0.008){const mod2=EMODS[Math.floor(Math.random()*EMODS.length)];if(mod2.n!==mod.n)mod2.a(e);
const aura=CHAMPION_AURAS[Math.floor(Math.random()*CHAMPION_AURAS.length)];
e.champion=1;e.champAura=aura;e.eName=`${aura.sym} ${aura.n} ${mod.n}`;e.eCol=aura.c;e.xp*=1.5;e.gold*=1.5;
e.mhp=Math.ceil(e.mhp*1.5);e.hp=e.mhp}}
ents.push(e)}}
// v10.0 Squad tactics: assign roles based on enemy composition
if(ents.length>=3){const SQUAD_ROLES={brute:'anchor',golem:'anchor',skel:'anchor',knight:'anchor',
assassin:'flanker',bat:'flanker',wraith:'flanker',stalker:'flanker',
mage:'support',necromancer:'support',fire_elder:'support',shaman:'support',
rat:'rusher',slime:'rusher',spider:'rusher',swarmer:'rusher'};
for(const e of ents){e.squadRole=SQUAD_ROLES[e.type]||'rusher'}
// Ensure at least 1 flanker if no natural flankers
const hasFlank=ents.some(e2=>e2.squadRole==='flanker');
if(!hasFlank&&ents.length>=4){const rush=ents.filter(e2=>e2.squadRole==='rusher');if(rush.length>=2)rush[0].squadRole='flanker'}}
// Lore tablet pickup
if(cR.loreTablet&&!cR._loreSpawned){cR._loreSpawned=true;
picks.push({x:RPX/2+(Math.random()-.5)*80,y:RPY/2+(Math.random()-.5)*60,type:'lore',tablet:cR.loreTablet,life:9999})}
// v9.0 Boss intro with full cinematic
if(cR.type==='boss'&&ents.length){const bIdx2=flr>=20?5:Math.floor((flr/4-1)%5);
const bl=BOSS_LORE[Math.max(0,bIdx2)];
for(const e of ents)e.inv=200; // boss invulnerable during intro
playBossIntro(Math.max(0,bIdx2));
// Dramatic particles after cinematic ends
setTimeout(()=>{if(gSt==='playing'&&ents.length){
msg(`⚠ ${bl.name} ⚠<br><span style="font-size:7px;color:${bl.color}60">${bl.title||''}</span><br><span style="font-size:8px;color:rgba(255,180,200,0.4)">${bl.desc}</span>`,2500);
if(bl.taunt)setTimeout(()=>{if(gSt==='playing')showDialogue(bl.name,bl.taunt,bl.color)},3500);
sfx('boss_intro');shk=15;flash('#ff2255',.25);chromAb=5;slMo=Math.max(slMo,40);
camZoom=1.1;camZoomT=60;
for(let i=0;i<50;i++){const a=Math.random()*Math.PI*2;const d=20+Math.random()*60;
parts.push({x:ents[0].x+Math.cos(a)*d,y:ents[0].y+Math.sin(a)*d,vx:Math.cos(a)*1.5,vy:Math.sin(a)*1.5-1,life:40+Math.random()*20,ml:60,color:bl.color,size:2+Math.random()*3,shape:Math.random()>.5?'star':'circle',grav:0.05})}
addShockwave(ents[0].x,ents[0].y,200,bl.color,30);addShockwave(ents[0].x,ents[0].y,100,'#ffffff',20);
addDynLight(ents[0].x,ents[0].y,250,bl.color,2,0,30)}},3200)}
// v5 challenge waves
if(cR.type==='challenge'&&!cR.cleared){waveActive=true;waveNum=1;waveMax=3;wavePause=60;
msg('CHALLENGE ROOM — WAVE 1/3',1000);flash('#ff8800',.1);sfx('wave')}
// Mini-boss intro
if(cR.type==='miniboss'&&ents.length){const mb=ents[0];
msg(`⚔ ${mb.bossName||mb.type.toUpperCase()} ⚔`,1500);sfx('boss_intro');shk=8;flash(mb.color,.12);chromAb=3}
if(cR.type==='secret'){msg('SECRET ROOM',1200);sfx('secret');triggerAchievement('secret')}
if(cR.type==='lore'){msg('ANCIENT CHAMBER',1200);sfx('ghost')}
// Ghost NPC interaction zone
if(cR.ghost&&!cR.ghost.spoke){setTimeout(()=>{
if(cR.ghost&&!cR.ghost.spoke){cR.ghost.spoke=true;
const _bioIdx=Math.floor((flr-1)/3)%GHOST_NARRATIVES.length;
const _gn=GHOST_NARRATIVES[_bioIdx];const _lineIdx=(flr-1)%3;
const _gLine=_gn.lines[Math.min(_lineIdx,_gn.lines.length-1)]||GHOST_DIALOGUE_EXTRA[Math.floor(Math.random()*GHOST_DIALOGUE_EXTRA.length)];
showDialogue(_gn.speaker,_gLine,_gn.color)}},600)}}

/* ═══════════════════════════════════════════════════
   ENTITY FACTORY - 12 enemy types + boss + 4 mini-bosses
   ═══════════════════════════════════════════════════ */
function mkE(type,x,y){if(type!=='boss')recordEnemy(type); // v9.0 codex tracking
const b={x,y,vx:0,vy:0,inv:0,atkCd:0,dir:0,age:0,fl:0,burnT:0,frozen:0,telG:0,_uid:Math.random()*99999|0,
statuses:[],armor:0,shield:0,slowMult:1,state:'idle',stateT:0,animT:0,
// v5 additions
hitStop:0,stretchDir:0,stretchT:0,animState:'idle',animFrame:0,animTimer:0,spawnDone:true,alpha:1};const f=flr;
let ent;
switch(type){
case'rat':ent={...b,type,hw:5,hh:5,hp:1+f,mhp:1+f,spd:2.5,dmg:1,atkSpd:20,color:'#997766',xp:2,gold:1+~~(Math.random()*2)};break;
case'slime':ent={...b,type,hw:9,hh:9,hp:3+f,mhp:3+f,spd:1,dmg:1,atkSpd:35,color:'#44dd66',xp:3,gold:2+~~(Math.random()*3)};break;
case'bat':ent={...b,type,hw:6,hh:6,hp:2+f,mhp:2+f,spd:2.3,dmg:1,atkSpd:26,color:'#aa44ff',xp:4,gold:3+~~(Math.random()*3)};break;
case'spider':ent={...b,type,hw:7,hh:6,hp:3+f,mhp:3+f,spd:2,dmg:1,atkSpd:22,color:'#664444',xp:5,gold:3+~~(Math.random()*3),webCd:0};break;
case'skel':ent={...b,type,hw:7,hh:9,hp:5+f*2,mhp:5+f*2,spd:1.3,dmg:2,atkSpd:28,color:'#ddd8cc',xp:6,gold:4+~~(Math.random()*4),armor:1};break;
case'mage':ent={...b,type,hw:6,hh:7,hp:3+f,mhp:3+f,spd:.7,dmg:2,atkSpd:45,color:'#ff6644',xp:8,gold:6+~~(Math.random()*5),pCd:45};break;
case'brute':ent={...b,type,hw:12,hh:12,hp:10+f*3,mhp:10+f*3,spd:.55,dmg:3,atkSpd:38,color:'#885533',xp:10,gold:8+~~(Math.random()*5),armor:2};break;
case'assassin':ent={...b,type,hw:6,hh:6,hp:3+f,mhp:3+f,spd:3.2,dmg:2,atkSpd:18,color:'#445566',xp:10,gold:7+~~(Math.random()*5),dCd:0};break;
case'wraith':ent={...b,type,hw:8,hh:8,hp:4+f*2,mhp:4+f*2,spd:1.5,dmg:2,atkSpd:30,color:'#6688aa',xp:12,gold:8+~~(Math.random()*5),phaseT:0};break;
case'golem':ent={...b,type,hw:14,hh:14,hp:15+f*4,mhp:15+f*4,spd:.4,dmg:4,atkSpd:50,color:'#778899',xp:15,gold:12+~~(Math.random()*8),armor:3,smashCd:0};break;
case'necromancer':ent={...b,type,hw:7,hh:8,hp:5+f*2,mhp:5+f*2,spd:.6,dmg:2,atkSpd:55,color:'#664488',xp:18,gold:15+~~(Math.random()*8),summonCd:0,pCd:40};break;
// v6 New enemies
case'swarmer':ent={...b,type,hw:4,hh:4,hp:1+f,mhp:1+f,spd:3.0,dmg:.5,atkSpd:14,color:'#ccaa33',xp:2,gold:1+~~(Math.random()*2),buzzOff:Math.random()*Math.PI*2};break;
case'shaman':ent={...b,type,hw:7,hh:8,hp:4+f*2,mhp:4+f*2,spd:.5,dmg:1,atkSpd:60,color:'#88cc44',xp:14,gold:10+~~(Math.random()*6),healCd:0,buffCd:0};break;
case'knight':ent={...b,type,hw:10,hh:11,hp:8+f*3,mhp:8+f*3,spd:1.0,dmg:3,atkSpd:30,color:'#aabbcc',xp:12,gold:8+~~(Math.random()*6),armor:2,chargeCd:0,blocking:false,blockDir:0};break;
// v5 Mini-bosses (3x HP, 1.5x size, unique ability)
case'slime_king':ent={...b,type,hw:16,hh:16,hp:(3+f)*3,mhp:(3+f)*3,spd:.8,dmg:2,atkSpd:30,color:'#22cc44',xp:30,gold:30+~~(Math.random()*15),bossName:'SLIME KING',isMini:true};break;
case'skel_champ':ent={...b,type,hw:12,hh:14,hp:(5+f*2)*3,mhp:(5+f*2)*3,spd:1.1,dmg:3,atkSpd:24,color:'#eee8cc',xp:35,gold:35+~~(Math.random()*15),armor:3,bossName:'SKELETON CHAMPION',isMini:true,blockT:0};break;
case'shadow_lord':ent={...b,type,hw:10,hh:10,hp:(3+f)*3,mhp:(3+f)*3,spd:2.8,dmg:3,atkSpd:16,color:'#334455',xp:35,gold:35+~~(Math.random()*15),bossName:'SHADOW ASSASSIN',isMini:true,invisT:0};break;
case'fire_elder':ent={...b,type,hw:10,hh:12,hp:(3+f)*3,mhp:(3+f)*3,spd:.5,dmg:3,atkSpd:40,color:'#ff5522',xp:40,gold:40+~~(Math.random()*15),bossName:'FIRE MAGE ELDER',isMini:true,pCd:30};break;
case'mimic':ent={...b,type,hw:12,hh:12,hp:8+f*3,mhp:8+f*3,spd:2.2,dmg:3,atkSpd:16,color:'#ffaa22',xp:25,gold:25+~~(Math.random()*15),mimicSurprise:true};break;
case'stalker':ent={...b,type,hw:7,hh:7,hp:4+f*2,mhp:4+f*2,spd:2.5,dmg:2.5,atkSpd:20,color:'#443366',xp:16,gold:12+~~(Math.random()*8),stalkerAlpha:0.05,stalkerCd:0};break;
// v7.0 Revenant - ghostly player mirror
case'revenant':ent={...b,type,hw:8,hh:8,hp:6+f*2,mhp:6+f*2,spd:2.8,dmg:2,atkSpd:22,color:'#44cc66',xp:20,gold:15+~~(Math.random()*8),
ghostPhase:true,solidWindow:0,solidCd:120,posHistory:[],posIdx:0};break;
case'boss':{const bIdx=flr>=20?5:Math.floor((flr/4-1)%5);const bl=BOSS_LORE[Math.max(0,bIdx)];
const isFinal=flr>=20;const bossHp=isFinal?120+f*25:40+f*22;
ent={...b,type,hw:isFinal?28:22,hh:isFinal?28:22,hp:bossHp,mhp:bossHp,spd:isFinal?1.0:1.2+f*0.04,dmg:isFinal?4+Math.floor(f*0.4):3+Math.floor(f*0.5),atkSpd:Math.max(10,16-Math.floor(f*0.2)),color:bl.color,
xp:isFinal?200:80,gold:isFinal?100+f*20:55+f*14,phase:0,timer:80,enraged:0,bossName:bl.name,armor:isFinal?2:1,
isFinalBoss:isFinal,
// v5 HP threshold transitions
phase75:false,phase50:false,phase25:false,bossIdx:Math.max(0,bIdx),arenaHazards:[],
// v6 stagger system
staggerDmg:0,staggerThresh:bossHp*0.15,staggerTimer:0,staggered:false,staggerCd:0,
bossTimer:0,enrageTimer:5400,hazardCd:120};break;}
default:ent={...b,type};break;}
// v10.0 Enemy damage scaling with floor
if(ent.type!=='boss'){ent.dmg+=Math.floor(f*0.3)}
// v6 Apply Void Rank difficulty modifier
if(activeVoidRank>0){const vr=VOID_RANKS[activeVoidRank];
ent.hp=Math.ceil(ent.hp*vr.hpMult);ent.mhp=Math.ceil(ent.mhp*vr.hpMult);ent.dmg*=vr.dmgMult;
if(ent.type==='boss')ent.staggerThresh=Math.ceil(ent.mhp*0.15)}
return ent}

function tAt(px,py){const tx=Math.floor(px/TS),ty=Math.floor(py/TS);if(tx<0||tx>=RW||ty<0||ty>=RH)return 0;return cR.tiles[ty][tx]}
function blk(px,py,hw,hh){return tAt(px-hw,py-hh)===1||tAt(px+hw,py-hh)===1||tAt(px-hw,py+hh)===1||tAt(px+hw,py+hh)===1}
function dLock(){return!cR.cleared&&ents.length>0}
function blkF(px,py,hw,hh){if(blk(px,py,hw,hh))return 1;if(!dLock())return 0;
for(const[cx,cy]of[[px-hw,py-hh],[px+hw,py-hh],[px-hw,py+hh],[px+hw,py+hh]]){if(cx<0||cx>=RPX||cy<0||cy>=RPY)return 1}return 0}

function chkTr(){if(dLock())return;let d=null,nx,ny;
if(P.y<-2&&cR.doors.n){d='n';nx=RPX/2;ny=RPY-TS*1.5}else if(P.y>RPY+2&&cR.doors.s){d='s';nx=RPX/2;ny=TS*1.5}
else if(P.x<-2&&cR.doors.w){d='w';nx=RPX-TS*1.5;ny=RPY/2}else if(P.x>RPX+2&&cR.doors.e){d='e';nx=TS*1.5;ny=RPY/2}
if(!d)return;const dx=d==='e'?1:d==='w'?-1:0,dy=d==='s'?1:d==='n'?-1:0;
const nr=gR(cRX+dx,cRY+dy);if(!nr)return;cRX+=dx;cRY+=dy;cR=nr;
if(!cR.visited){cR.visited=1;rmsV++;roomRevealT=45}P.x=nx;P.y=ny;P.vx=0;P.vy=0;loadRoom();P.inv=15;sfx('door')}

function chkInt(){if(!iR)return;iR=0;const cx=Math.floor(RW/2),cy=Math.floor(RH/2);
if(cR.tiles[cy][cx]===2&&!ents.length){const sx=cx*TS+TS/2,sy=cy*TS+TS/2;
if(Math.abs(P.x-sx)<TS*1.5&&Math.abs(P.y-sy)<TS*1.5){
if(flr>=20){victory();return}
floorTransT=80;floorTransPhase=0;sfx('stair');musStinger('floorUp');return}}
for(const ch of cR.chests){if(!ch.op&&Math.abs(P.x-ch.x)<TS&&Math.abs(P.y-ch.y)<TS){
if(ch.mimic){ch.op=1;sfx('mimic');flash('#ffaa22',.15);shk=12;chromAb=3;
const me=mkE('mimic',ch.x,ch.y);me.animState='spawn';me.animFrame=0;me.spawnDelay=0;me.spawnDone=true;me.alpha=1;ents.push(me);
msg('IT\'S A MIMIC!',800);emit(ch.x,ch.y,20,'#ffaa22',4,16,2.5);continue}
ch.op=1;sfx('chest');emit(ch.x,ch.y,16,'#ffcc44',3,20,1.5,'circle');addDynLight(ch.x,ch.y,100,'#ffcc44',1,0,12);
const roll=Math.random();
if(roll<.25){const tier=flr<4?1:flr<8?2:3;const pool=WPN.filter(w=>w.tier===tier);if(pool.length)picks.push({x:ch.x,y:ch.y-8,type:'weapon',weapon:{...pool[~~(Math.random()*pool.length)]},life:600,vy:-1})}
else if(roll<.45){const tier=flr<4?1:flr<8?2:3;const pool=ACCESSORIES.filter(a=>a.tier<=tier);if(pool.length)picks.push({x:ch.x,y:ch.y-8,type:'accessory',acc:{...pool[~~(Math.random()*pool.length)]},life:600,vy:-1})}
else if(roll<.7){const amt=12+~~(Math.random()*flr*6);for(let i=0;i<Math.min(~~(amt/4),8);i++)picks.push({x:ch.x+(Math.random()-.5)*20,y:ch.y+(Math.random()-.5)*20,type:'gold',val:Math.ceil(amt/6),life:400,vy:-(Math.random()+.5),vx:(Math.random()-.5)*2})}
else picks.push({x:ch.x,y:ch.y,type:'heal',val:2+~~(Math.random()*2),life:400,vy:-1})}}
if(cR.sNPC&&Math.abs(P.x-cR.sNPC.x)<TS*2&&Math.abs(P.y-cR.sNPC.y)<TS*2)openShop();
// Room events
if(cR.roomEvent&&!cR.roomEvent.used&&Math.abs(P.x-cR.roomEvent.x)<TS*1.5&&Math.abs(P.y-cR.roomEvent.y)<TS*1.5){openEvent(cR.roomEvent);sfx('lore')}}

/* ═══════════════════════════════════════════════════
   SHOP & FORGE SYSTEMS
   ═══════════════════════════════════════════════════ */
function openShop(){gSt='shop';rShop();document.getElementById('shop-overlay').classList.add('show');
showHint('firstShop','Press E to trade with merchants');
if(!cR.merchantSpoken){cR.merchantSpoken=true;
showDialogue('MERCHANT',MERCHANT_LINES[Math.floor(Math.random()*MERCHANT_LINES.length)],'#ffcc44')}}
function closeShop(){gSt='playing';document.getElementById('shop-overlay').classList.remove('show')}
function rShop(){const relicMult=P.relic&&P.relic.name==='GOLDEN IDOL'?0.5:1;
document.getElementById('shop-gold-display').textContent=`◆ ${gold} GOLD`;
const c=document.getElementById('shop-items');c.innerHTML='';
for(const item of cR.sItems){const cost=Math.floor(item.cost*relicMult);const can=gold>=cost;const d=document.createElement('div');d.className='shop-item'+(can?'':' cant');
d.innerHTML=`<div class="si-name">${item.name}</div><div class="si-desc">${item.desc||''}</div><div class="si-cost">◆ ${cost}</div>`;
if(can)d.addEventListener('click',()=>{gold-=cost;sfx('buy');
if(item.type==='heal'){P.hp=Math.min(P.mhp,P.hp+item.val);ft(P.x,P.y-14,`+${item.val}`,'#44ff66')}
else if(item.type==='maxhp'){P.mhp+=item.val;P.hp=Math.min(P.mhp,P.hp+item.val)}
else if(item.type==='shield'){P.maxShield+=item.val;P.shield=Math.min(P.maxShield,P.shield+item.val)}
else if(item.type==='weapon'){P.w={...item};weaponKillCount=0;weaponEvoStage=0;equipWeaponTags();popup(`Equipped ${item.name}`)}
else if(item.type==='accessory'){P.acc={...item};item.f(P);popup(`Equipped ${item.name}`)}
cR.sItems=cR.sItems.filter(i=>i!==item);rShop()});c.appendChild(d)}}

function openForge(){gSt='forge';document.getElementById('shop-overlay').classList.remove('show');
rForge();document.getElementById('forge-overlay').classList.add('show')}
function closeForge(){gSt='shop';document.getElementById('forge-overlay').classList.remove('show');
rShop();document.getElementById('shop-overlay').classList.add('show')}
function rForge(){
document.getElementById('forge-gold-display').textContent=`◆ ${gold} GOLD`;
document.getElementById('forge-level-display').textContent=`FORGE LEVEL: ${P.forgeLevel}`;
const c=document.getElementById('forge-items');c.innerHTML='';
const fl=P.forgeLevel;
const forges=[
{name:'SHARPEN',desc:'+1 Weapon Damage',cost:20+fl*15,f:()=>{P.forgeDmg++;if(P.w)P.w.d++}},
{name:'REINFORCE',desc:'+1 Armor, +2 Max HP',cost:25+fl*18,f:()=>{P.arm++;P.mhp+=2;P.hp=Math.min(P.mhp,P.hp+2)}},
{name:'VOID INFUSE',desc:'+8% Crit, +0.2 Lifesteal',cost:30+fl*20,f:()=>{P.cc+=.08;P.ls+=.2}},
{name:'SOUL BIND',desc:'+15 Shield, Shield Regen',cost:28+fl*16,f:()=>{P.maxShield+=15;P.shield+=15;P.shieldRegen=1}},
{name:'CHAOS TEMPER',desc:'Random powerful buff',cost:35+fl*22,f:()=>{
  const r=Math.floor(Math.random()*5);
  if(r===0){P.bd+=3;ft(P.x,P.y-20,'+3 DMG','#ff8844',1)}
  else if(r===1){P.mhp+=8;P.hp=Math.min(P.mhp,P.hp+8);ft(P.x,P.y-20,'+8 HP','#44ff66',1)}
  else if(r===2){P.cc+=.2;ft(P.x,P.y-20,'+20% CRIT','#ffcc00',1)}
  else if(r===3){P.spd*=1.3;ft(P.x,P.y-20,'+30% SPD','#00ccff',1)}
  else{P.ls+=1;ft(P.x,P.y-20,'+1 LIFESTEAL','#ff4466',1)}}}];
for(const item of forges){const can=gold>=item.cost;const d=document.createElement('div');
d.className='forge-item'+(can?'':' cant');
d.innerHTML=`<div class="fi-name">${item.name}</div><div class="fi-desc">${item.desc}</div><div class="fi-cost">◆ ${item.cost}</div>`;
if(can)d.addEventListener('click',()=>{gold-=item.cost;item.f();P.forgeLevel++;P.forgesUsed++;sfx('forge');
flash('#ff8844',.12);chromAb=3;emit(P.x,P.y,20,'#ff8844',4,18,2.5);emitRing(P.x,P.y,16,'#ffaa44',3,14,2);
addDynLight(P.x,P.y,150,'#ff8844',1.5,0,15);rForge()});
c.appendChild(d)}}

// v5 Relic system
function showRelicChoice(newRelic){if(!P.relic){applyRelic(newRelic);return}
gSt='relicChoice';const cont=document.getElementById('relic-cards');cont.innerHTML='';
for(const rel of [P.relic,newRelic]){const d=document.createElement('div');d.className='relic-card';
d.innerHTML=`<div class="relic-icon">${rel.icon}</div><div class="relic-name">${rel.name}</div><div class="relic-desc">${rel.desc}</div>`;
d.addEventListener('click',()=>{if(rel===newRelic)applyRelic(newRelic);
gSt='playing';document.getElementById('relic-overlay').style.display='none'});cont.appendChild(d)}
document.getElementById('relic-overlay').style.display='flex'}
function applyRelic(rel){P.relic=rel;sfx('relic');flash('#ffcc44',.1);
document.getElementById('relic-hud').textContent=`${rel.icon} ${rel.name}`;
popup(`RELIC: ${rel.name}`);
// Apply passive effects
if(rel.name==='VOID EYE')P.cc+=0.15;
if(rel.name==='BLOOD CROWN'){P.mhp=Math.max(1,P.mhp-3);P.hp=Math.min(P.hp,P.mhp)}
if(rel.name==='TIME SHARD'){P.dMax*=0.5;for(const e of ents)e.spd*=0.75}
if(rel.name==='EMBER HEART')P.bd+=2;
if(rel.name==='GOLDEN IDOL')P.goldMult*=3;
if(rel.name==='SOUL LANTERN'){P.soulLantern=true;P.xpMult=(P.xpMult||1)*1.25}
if(rel.name==='IRON WILL'){P.ironWill=true;P.arm+=2;P.spd*=0.85}
if(rel.name==='MIRROR SHIELD')P.mirrorShield=true;
if(rel.name==='CHAOS SEED')P.chaosSeed=true}

/* ═══════════════════════════════════════════════════
   PERK / LEVEL UP / SYNERGY SYSTEM
   ═══════════════════════════════════════════════════ */
const PERKS=[
{n:'VITALITY',d:'+3 Max HP, full heal',f:()=>{P.mhp+=3;P.hp=P.mhp},cat:'survival',r:'common',tags:['hp']},
{n:'STRENGTH',d:'+1.5 Base damage',f:()=>{P.bd+=1.5},cat:'combat',r:'common',tags:['dmg']},
{n:'SWIFTNESS',d:'+15% Movement',f:()=>{P.spd*=1.15},cat:'survival',r:'common',tags:['speed']},
{n:'CRITICAL',d:'+10% Crit chance',f:()=>{P.cc+=.1},cat:'combat',r:'common',tags:['crit']},
{n:'VAMPIRISM',d:'+0.3 Lifesteal',f:()=>{P.ls+=.3},cat:'combat',r:'uncommon',tags:['lifesteal']},
{n:'ARMOR',d:'-1 Damage taken',f:()=>{P.arm+=1},cat:'survival',r:'common',tags:['armor']},
{n:'PIERCING',d:'Hit through enemies',f:()=>{P.prc+=1},cat:'combat',r:'uncommon',tags:['dmg']},
{n:'MULTI-SHOT',d:'+1 Projectile',f:()=>{P.pc++},cat:'combat',r:'uncommon',tags:['dmg']},
{n:'SHIELD UP',d:'+4 Max Shield',f:()=>{P.maxShield+=4;P.shield+=4},cat:'survival',r:'common',tags:['shield']},
{n:'QUICK DASH',d:'-30% Dash cooldown',f:()=>{P.dMax*=.7},cat:'survival',r:'uncommon',tags:['dash','speed']},
{n:'GOLD RUSH',d:'+50% Gold find',f:()=>{P.goldMult=(P.goldMult||1)*1.5},cat:'survival',r:'common',tags:['gold']},
{n:'SHOCKWAVE',d:'Q: Blast all nearby',f:()=>{P.ab='shockwave'},cat:'arcane',r:'rare',tags:['arcane']},
{n:'TIME STOP',d:'Q: Freeze enemies',f:()=>{P.ab='timestop'},cat:'arcane',r:'rare',tags:['arcane']},
{n:'BERSERK',d:'Q: 2x damage boost',f:()=>{P.ab='berserk'},cat:'arcane',r:'rare',tags:['arcane']},
{n:'DRAIN',d:'Q: Steal HP from all',f:()=>{P.ab='drain'},cat:'arcane',r:'rare',tags:['arcane']},
{n:'CHAOS ORB',d:'Q: Random projectiles',f:()=>{P.ab='chaos'},cat:'arcane',r:'rare',tags:['arcane']},
{n:'BERSERKER',d:'+50% dmg below 30% HP',f:()=>{P.berserkPerk=true},cat:'combat',r:'uncommon',tags:['dmg','berserk']},
{n:'EXECUTIONER',d:'3x dmg to low HP enemies',f:()=>{P.executioner=true},cat:'combat',r:'rare',tags:['dmg','execute']},
{n:'ECHO STRIKE',d:'20% chance to repeat attack',f:()=>{P.echoStrike=true},cat:'combat',r:'rare',tags:['dmg','crit']},
{n:'THORNS',d:'Reflect 3 damage when hit',f:()=>{P.thornsPerk+=3;P.thorns+=3},cat:'survival',r:'uncommon',tags:['armor']},
{n:'RICOCHET',d:'Projectiles bounce off walls',f:()=>{P.ricochet=true},cat:'combat',r:'rare',tags:['dmg']},
{n:'SOUL HARVEST',d:'Kills extend combo +30',f:()=>{P.soulHarvest=true},cat:'combat',r:'uncommon',tags:['combo']},
{n:'SECOND WIND',d:'Revive once at 30% HP',f:()=>{P.secondWind=true},cat:'survival',r:'rare',tags:['hp','survival']},
{n:'ELEMENTAL MASTERY',d:'Status ticks deal 2x',f:()=>{P.elemMastery=true},cat:'combat',r:'rare',tags:['dmg','burn']},
{n:'MOMENTUM',d:'+3% speed per combo hit',f:()=>{P.momentum=true},cat:'combat',r:'uncommon',tags:['speed','combo']},
{n:'GLASS HEART',d:'+3 damage, -3 Max HP',f:()=>{P.bd+=3;P.mhp=Math.max(1,P.mhp-3);P.hp=Math.min(P.hp,P.mhp)},cat:'combat',r:'uncommon',tags:['dmg']},
{n:'MAGNETISM',d:'Triple pickup radius',f:()=>{P.magnetism=true},cat:'survival',r:'common',tags:['gold']},
{n:'OVERCHARGE',d:'Taking damage charges ability',f:()=>{P.overcharge=true},cat:'arcane',r:'uncommon',tags:['arcane']},
// v10.0 Expanded perk pool
{n:'IRON WILL',d:'+2 HP each floor, less knockback',f:()=>{P.ironWill=true},cat:'survival',r:'common',tags:['hp','armor']},
{n:'LUCKY STRIKE',d:'10% chance double gold',f:()=>{P.luckyGold=true},cat:'survival',r:'common',tags:['gold','crit']},
{n:'PHANTOM STEP',d:'Dash leaves damaging afterimage',f:()=>{P.phantomStep=true},cat:'combat',r:'uncommon',tags:['dash','dmg']},
{n:'CHAIN LIGHTNING',d:'Attacks chain to 1 nearby enemy',f:()=>{P.chainLightning=true},cat:'combat',r:'uncommon',tags:['dmg','arcane']},
{n:'BLOODLETTER',d:'Crits cause bleed: 3/s for 3s',f:()=>{P.bloodletter=true},cat:'combat',r:'uncommon',tags:['crit','dmg']},
{n:'SCAVENGER',d:'+50% pickup range, items glow',f:()=>{P.scavenger=true},cat:'survival',r:'common',tags:['gold','speed']},
{n:'MIRROR IMAGE',d:'25% decoy on hit, draws aggro',f:()=>{P.mirrorImage=true},cat:'survival',r:'rare',tags:['armor','survival']},
{n:'VOID SIPHON',d:'Kills restore 1% max HP',f:()=>{P.voidSiphon=true},cat:'survival',r:'rare',tags:['lifesteal','hp']},
{n:'BERSERK PROTOCOL',d:'Below 30%: +40% atk spd',f:()=>{P.berserkProtocol=true},cat:'combat',r:'rare',tags:['berserk','speed']},
{n:'COMBUSTION',d:'Burning enemies explode on death',f:()=>{P.combustion=true},cat:'combat',r:'rare',tags:['burn','dmg']},
{n:'KILL DASH',d:'Kills during dash reset dash CD',f:()=>{P.killDash=true},cat:'combat',r:'uncommon',tags:['dash','combo']}];

const RARITY_COLORS={common:'#aaaaaa',uncommon:'#44cc88',rare:'#aa66ff',legendary:'#ffcc00'};

/* ═══════════════════════════════════════════════════
   SYNERGY SYSTEM
   ═══════════════════════════════════════════════════ */
const SYNERGIES=[
{name:'GLASS CANNON',req:['dmg','crit','execute'],desc:'All attacks pierce',f:()=>{P.prc+=3;P.pierceSynergy=true}},
{name:'FORTRESS',req:['hp','armor','shield'],desc:'+5 Max Shield',f:()=>{P.maxShield+=5;P.shield+=5}},
{name:'PREDATOR',req:['speed','crit','dash'],desc:'+30% Crit damage',f:()=>{P.critDmgMult+=0.3}},
{name:'VOID TOUCHED',req:['lifesteal','dmg','berserk'],desc:'Lifesteal doubled',f:()=>{P.ls*=2}},
{name:'GOLDEN AGE',req:['gold','speed','hp'],desc:'Gold heals 1 HP per 20',f:()=>{P.goldHeals=true}},
{name:'ELEMENTAL STORM',req:['burn','crit','arcane'],desc:'Attacks apply random status',f:()=>{P.elemStorm=true}},
{name:'UNDYING',req:['hp','lifesteal','survival'],desc:'Auto-revive at 50% HP once',f:()=>{P.undying=true}},
{name:'WINDRUNNER',req:['speed','dash','combo'],desc:'+25% permanent speed',f:()=>{P.spd*=1.25}},
{name:'WARLORD',req:['dmg','execute','berserk'],desc:'Kills extend berserk +30f',f:()=>{P.warlord=true}},
// v10.0 Weapon-perk synergies
{name:'PYROCLASM',req:['burn','dmg','arcane'],desc:'Burn dmg +200%',f:()=>{P.pyroclasm=true}},
{name:'PERMAFROST',req:['freeze','armor','hp'],desc:'Frozen enemies shatter for 5x',f:()=>{P.permafrost=true}},
{name:'BLADE DANCER',req:['dash','crit','combo'],desc:'Every 3rd dash deals AOE dmg',f:()=>{P.bladeDancer=true}},
{name:'TOXIC AVENGER',req:['poison','lifesteal','survival'],desc:'Poison heals you too',f:()=>{P.toxicAvenger=true}},
{name:'VOID REAPER',req:['void','execute','crit'],desc:'Execute threshold +10%',f:()=>{P.voidReaper=true}}];
// v10.0 Weapon tag mapping — weapons contribute to synergy system
const WPN_TAGS={
'FLAME SWORD':['burn','dmg'],'FIRE STAFF':['burn','arcane'],'PHOENIX BLADE':['burn','dmg','survival'],
'FROST MACE':['freeze','armor'],'ICE WAND':['freeze','arcane'],'POISON FANG':['poison','dmg'],
'VOIDBLADE':['void','dmg'],'VOID CANNON':['void','arcane'],'DEATH SCYTHE':['execute','crit'],
'BLOODTHIRSTER':['lifesteal','dmg'],'CELESTIAL BLADE':['arcane','dmg'],
'TWIN DAGGERS':['dash','crit'],'RAPIER':['speed','crit'],'BROAD AXE':['dmg','execute'],
'CRYSTAL DAGGER':['crit','arcane'],'LONGBOW':['crit','speed'],'SHORT BOW':['speed'],
'IRON SWORD':['dmg'],'RUSTY SWORD':[],'WAR CLEAVER':['dmg','execute'],'WORLDSPLITTER':['dmg','execute','arcane'],
'SHADOW FANG':['dash','crit','void'],'STORM CALLER':['arcane','speed'],'SOUL DRINKER':['lifesteal','void']};
function equipWeaponTags(){if(!P.w)return;const tags=WPN_TAGS[P.w.name]||[];
// Remove old weapon tags, add new ones
if(P._wpnTags){for(const t of P._wpnTags){const idx=P.perkTags.indexOf(t);if(idx>-1)P.perkTags.splice(idx,1)}}
P._wpnTags=[...tags];for(const t of tags){if(!P.perkTags.includes(t))P.perkTags.push(t)}
checkSynergies()}

/* ═══════════════════════════════════════════════════
   ROOM EVENTS SYSTEM — v6 shrines, altars, encounters
   ═══════════════════════════════════════════════════ */
const ROOM_EVENTS=[
{name:'BLOOD SHRINE',desc:'A crimson altar pulses with dark energy. Sacrifice your vitality for power.',color:'#ff3366',icon:'♦',
 opts:[{label:'SACRIFICE 3 HP (+2 DMG)',f:()=>{if(P.hp>3){P.hp-=3;P.bd+=2;ft(P.x,P.y-20,'+2 DMG','#ff3366',1);flash('#ff3366',.12);sfx('forge');emit(P.x,P.y,16,'#ff3366',3,16,2)}else{ft(P.x,P.y-14,'NOT ENOUGH HP','#ff3366')}}},{label:'LEAVE',f:()=>{}}]},
{name:'VOID FOUNTAIN',desc:'Iridescent waters shimmer with restorative energy. But the void always takes a price.',color:'#aa66ff',icon:'◈',
 opts:[{label:'DRINK (FULL HEAL, enemies +20% HP)',f:()=>{P.hp=P.mhp;P.eventBuff='voidFountain';ft(P.x,P.y-20,'HEALED','#44ff66',1);flash('#aa66ff',.1);sfx('ability');emit(P.x,P.y,20,'#aa66ff',3,18,2)}},{label:'LEAVE',f:()=>{}}]},
{name:'CURSED CHEST',desc:'A chest wreathed in shadow. Great power, but at a permanent cost.',color:'#ff8800',icon:'✦',
 opts:[{label:'OPEN (-2 MAX HP, tier+1 weapon)',f:()=>{P.mhp=Math.max(1,P.mhp-2);P.hp=Math.min(P.hp,P.mhp);
const tier=Math.min(3,(flr<4?2:flr<8?3:3));const pool=WPN.filter(w=>w.tier>=tier);
if(pool.length){P.w={...pool[Math.floor(Math.random()*pool.length)]};if(P.forgeDmg>0)P.w.d+=P.forgeDmg;equipWeaponTags();popup(`Cursed: ${P.w.name}`)}
flash('#ff8800',.15);sfx('chest');emit(P.x,P.y,18,'#ff8800',3,16,2)}},{label:'LEAVE',f:()=>{}}]},
{name:'SOUL WELL',desc:'A well of concentrated souls. Trade experience for instant power.',color:'#c8a0ff',icon:'◉',
 opts:[{label:'TRADE 30 XP (RANDOM PERK)',f:()=>{if(P.xp>=30){P.xp-=30;
const av=PERKS.filter(p=>{if(p.n==='BERSERKER'&&P.berserkPerk)return 0;if(p.n==='EXECUTIONER'&&P.executioner)return 0;if(p.n==='ECHO STRIKE'&&P.echoStrike)return 0;if(p.r==='rare'&&['SHOCKWAVE','TIME STOP','BERSERK','DRAIN','CHAOS ORB'].includes(p.n))return 0;return 1});
if(av.length){const pk=av[Math.floor(Math.random()*av.length)];pk.f();P.perkNames.push(pk.n);if(pk.tags)for(const t of pk.tags)if(!P.perkTags.includes(t))P.perkTags.push(t);checkSynergies();
ft(P.x,P.y-20,pk.n,'#c8a0ff',1);flash('#c8a0ff',.1);sfx('lvl')}}else{ft(P.x,P.y-14,'NOT ENOUGH XP','#c8a0ff')}}},{label:'LEAVE',f:()=>{}}]},
{name:'ANCIENT ALTAR',desc:'Three glowing runes hover above the altar. Choose wisely.',color:'#ffcc44',icon:'★',
 opts:[{label:'+4 MAX HP',f:()=>{P.mhp+=4;P.hp=Math.min(P.mhp,P.hp+4);ft(P.x,P.y-20,'+4 HP','#44ff66',1);sfx('lvl');flash('#44ff66',.08)}},
{label:'+15% CRIT',f:()=>{P.cc+=.15;ft(P.x,P.y-20,'+15% CRIT','#ffcc00',1);sfx('lvl');flash('#ffcc00',.08)}},
{label:'+1.5 DMG +0.3 LS',f:()=>{P.bd+=1.5;P.ls+=.3;ft(P.x,P.y-20,'+DMG +LS','#ff6644',1);sfx('lvl');flash('#ff6644',.08)}}]},
{name:'GAMBLING GOBLIN',desc:'"Step right up! Double or nothing, friend!"',color:'#ffaa00',icon:'◆',
 opts:[{label:'BET 20 GOLD',f:()=>{if(gold>=20){gold-=20;if(Math.random()<.45){gold+=40;tGold+=20;ft(P.x,P.y-20,'+40 GOLD','#ffcc44',1);sfx('coin');flash('#ffcc44',.08)}else{ft(P.x,P.y-20,'LOST!','#ff3366');sfx('hurt');flash('#ff3366',.06)}}else{ft(P.x,P.y-14,'NOT ENOUGH','#ffaa00')}}},{label:'LEAVE',f:()=>{}}]},
{name:'HEALING SPRING',desc:'Crystal-clear water bubbles from the floor. Its touch mends wounds.',color:'#44ff88',icon:'◎',
 opts:[{label:'REST (+5 HP)',f:()=>{P.hp=Math.min(P.mhp,P.hp+5);ft(P.x,P.y-20,'+5 HP','#44ff88',1);sfx('xp');flash('#44ff88',.06);emit(P.x,P.y,14,'#44ff88',2,16,2)}},{label:'LEAVE',f:()=>{}}]},
{name:'MIRROR SHARD',desc:'A fragment of a void mirror. Touch it and face your shadow.',color:'#8888ff',icon:'◇',
 opts:[{label:'TOUCH (FIGHT SHADOW, +SYNERGY TAG)',f:()=>{
const tags=['dmg','crit','speed','hp','armor','lifesteal','dash','arcane','combo','burn','execute','berserk','survival','gold','shield'];
const newTag=tags[Math.floor(Math.random()*tags.length)];
if(!P.perkTags.includes(newTag))P.perkTags.push(newTag);
ft(P.x,P.y-20,`+${newTag.toUpperCase()}`,'#8888ff',1);sfx('secret');flash('#8888ff',.1);checkSynergies();
// Spawn shadow enemies
for(let si=0;si<2+Math.floor(flr/3);si++){const sa=Math.random()*Math.PI*2,sd=60+Math.random()*40;
const se=mkE('wraith',P.x+Math.cos(sa)*sd,P.y+Math.sin(sa)*sd);se.color='#4444aa';ents.push(se)}
emit(P.x,P.y,20,'#8888ff',4,20,3)}},{label:'LEAVE',f:()=>{}}]},
// v10.0 Risk/reward encounters
{name:'VOID BOUNTY',desc:'A pulsing rift offers challenge. Choose your risk — greater danger yields greater reward.',color:'#ff4488',icon:'⚔',
 opts:[{label:'EASY (3 enemies, 20 gold)',f:()=>{for(let i=0;i<3;i++){const a=Math.random()*Math.PI*2,d=60+Math.random()*30;
 ents.push(mkE('rat',P.x+Math.cos(a)*d,P.y+Math.sin(a)*d))}
 gold+=20;tGold+=20;ft(P.x,P.y-20,'+20 GOLD','#ffcc44',1);sfx('coin')}},
{label:'HARD (6 elites, 60 gold + perk)',f:()=>{for(let i=0;i<6;i++){const a=Math.random()*Math.PI*2,d=60+Math.random()*40;
 const se=mkE('brute',P.x+Math.cos(a)*d,P.y+Math.sin(a)*d);
 const mod=EMODS[Math.floor(Math.random()*EMODS.length)];mod.a(se);se.elite=true;se.eCol=mod.c;se.eName=mod.n;ents.push(se)}
 gold+=60;tGold+=60;ft(P.x,P.y-20,'+60 GOLD','#ffcc44',1);sfx('coin');flash('#ff4488',.1)}},
{label:'INSANE (10 elites + champion, 120 gold + 2 perks)',f:()=>{for(let i=0;i<10;i++){const a=Math.random()*Math.PI*2,d=60+Math.random()*50;
 const type=['brute','knight','wraith'][Math.floor(Math.random()*3)];
 const se=mkE(type,P.x+Math.cos(a)*d,P.y+Math.sin(a)*d);
 const mod=EMODS[Math.floor(Math.random()*EMODS.length)];mod.a(se);se.elite=true;se.eCol=mod.c;se.eName=mod.n;
 if(i===0){se.champion=true;se.champAura=CHAMPION_AURAS[Math.floor(Math.random()*CHAMPION_AURAS.length)];
 se.hp=Math.ceil(se.hp*1.5);se.mhp=se.hp;se.xp*=3;se.gold*=3}
 ents.push(se)}
 gold+=120;tGold+=120;ft(P.x,P.y-20,'+120 GOLD','#ffcc44',1);sfx('coin');flash('#ff4488',.2);shk=8}},
{label:'LEAVE',f:()=>{}}]},
{name:'VOID CRUCIBLE',desc:'An ancient forge burns with void fire. Sacrifice your weapon to reforge it stronger.',color:'#ff6600',icon:'⚒',
 opts:[{label:'REFORGE WEAPON (+2 DMG, random element)',f:()=>{if(P.w){P.w.d+=2;
 const elems=[{k:'burn',v:1,n:'FIRE',c:'#ff6633'},{k:'freeze',v:1,n:'ICE',c:'#66ccff'},{k:'poison',v:1,n:'POISON',c:'#66ff44'}];
 const el=elems[Math.floor(Math.random()*elems.length)];P.w[el.k]=el.v;
 ft(P.x,P.y-20,`+2 DMG +${el.n}`,el.c,1);flash(el.c,.12);sfx('forge');emit(P.x,P.y,16,el.c,3,16,2);equipWeaponTags();
 popup(`Reforged: ${P.w.name} [+${el.n}]`)}else{ft(P.x,P.y-14,'NO WEAPON','#ff6600')}}},
{label:'SACRIFICE WEAPON (tier+2 new weapon)',f:()=>{if(P.w){const tier=Math.min(3,P.w.tier+2);
 const pool=WPN.filter(w=>w.tier>=tier);if(pool.length){P.w={...pool[Math.floor(Math.random()*pool.length)]};
 if(P.forgeDmg>0)P.w.d+=P.forgeDmg;weaponKillCount=0;weaponEvoStage=0;equipWeaponTags();
 ft(P.x,P.y-20,P.w.name,'#ff6600',1);flash('#ff6600',.15);sfx('forge');shk=6;emit(P.x,P.y,20,'#ff6600',4,20,3);
 popup(`Crucible: ${P.w.name}`)}}else{ft(P.x,P.y-14,'NO WEAPON','#ff6600')}}},
{label:'LEAVE',f:()=>{}}]}];

let activeEvent=null;
function openEvent(evt){activeEvent=evt;gSt='event';sfx('event_ambient');
const el=document.getElementById('event-overlay');el.style.display='flex';
document.getElementById('event-title').textContent=`${evt.icon} ${evt.name} ${evt.icon}`;
document.getElementById('event-title').style.color=evt.color;
document.getElementById('event-title').style.textShadow=`0 0 20px ${evt.color}40`;
document.getElementById('event-desc').textContent=evt.desc;
const opts=document.getElementById('event-opts');opts.innerHTML='';
for(const opt of evt.opts){const d=document.createElement('div');d.className='btn';d.style.fontSize='9px';d.style.padding='10px 20px';d.textContent=opt.label;
d.addEventListener('click',()=>{try{opt.f()}catch(e){console.error('Event option error:',e)}closeEvent()});opts.appendChild(d)}}
function closeEvent(){gSt='playing';document.getElementById('event-overlay').style.display='none';activeEvent=null;
if(cR&&cR.roomEvent)cR.roomEvent.used=true;triggerAchievement('event_shrine')}

function checkSynergies(){
for(const syn of SYNERGIES){if(P.synergies.includes(syn.name))continue;
const has=syn.req.every(tag=>P.perkTags.includes(tag));
if(has){P.synergies.push(syn.name);syn.f();tryWhisper('firstSynergy');
// v10 Synergy activation cinematic
hitSt=Math.max(hitSt,30);slMo=0.01;camZoom=1.12;camZoomT=45;
streak(`SYNERGY: ${syn.name}`,'#ffcc00');sfx('synergy');flash('#ffcc00',.3);chromAb=8;shk=15;
addDynLight(P.x,P.y,250,'#ffcc00',2.5,0,30);
addShockwave(P.x,P.y,120,'#ffcc00',16);addShockwave(P.x,P.y,80,'#ffffff',12);addShockwave(P.x,P.y,40,'#ffcc00',8);
emitRing(P.x,P.y,30,'#ffcc00',5,30,3);emit(P.x,P.y,20,'#ffffff',4,25,2.5,'star','lighter');
// Golden pillar particles
for(let gp=0;gp<15;gp++){parts.push({x:P.x+(Math.random()-0.5)*10,y:P.y+10,vx:(Math.random()-0.5)*0.5,vy:-2-Math.random()*3,
life:40+Math.random()*30,ml:70,color:'#ffdd44',size:2+Math.random()*2,shape:'circle',grav:-0.03,blend:'lighter'})}
// Synergy tag labels float up
for(let ti=0;ti<syn.req.length;ti++){ft(P.x+(ti-1)*30,P.y-30-ti*12,syn.req[ti].toUpperCase(),'#ffcc00',1)}
msg(`<span style="color:#ffcc00;font-size:16px;letter-spacing:4px">${syn.name}</span><br><span style="font-size:9px;color:#ffddaa">${syn.desc||''}</span>`,2000);
// Ascending chord stinger
if(typeof aCtx!=='undefined'&&aCtx){const now=aCtx.currentTime;const notes=[261,329,392,523,659];
for(let ni=0;ni<notes.length;ni++){const o=aCtx.createOscillator(),g=aCtx.createGain();o.type='sine';o.frequency.value=notes[ni];
g.gain.setValueAtTime(0.06,now+ni*0.08);g.gain.exponentialRampToValueAtTime(0.001,now+ni*0.08+0.8);
o.connect(g);g.connect(aCtx.destination);o.start(now+ni*0.08);o.stop(now+ni*0.08+0.8)}}
P._synergyGlow=true}}}

function wouldCompleteSynergy(tags){
for(const syn of SYNERGIES){if(P.synergies.includes(syn.name))continue;
const combined=[...P.perkTags,...tags];
const has=syn.req.every(tag=>combined.includes(tag));
const hadBefore=syn.req.every(tag=>P.perkTags.includes(tag));
if(has&&!hadBefore)return syn.name}
return null}

function lvlUp(){sfx('lvl');gSt='levelup';flash('#aa66ff',.18);chromAb=3;shk=8;addDynLight(P.x,P.y,200,'#aa66ff',1.5,0,20);
// v10.0 Class passive unlocks at level 5 and 10
if(P.class&&CLASS_PASSIVES[P.class]){for(const cp of CLASS_PASSIVES[P.class]){
if(P.lvl===cp.lvl&&!P[cp.key]){cp.f();
msg(`NEW PASSIVE<br><span style="font-size:8px;color:${P.classColor||'#c8a0ff'}">${cp.desc}</span>`,3000);
ft(P.x,P.y-30,'PASSIVE UNLOCKED!',P.classColor||'#aa66ff',1.2);
emitRing(P.x,P.y,40,P.classColor||'#aa66ff',6,28,3.5);addShockwave(P.x,P.y,100,P.classColor||'#aa66ff',16)}}}
// v8.0 Pre-show canvas burst
emitRing(P.x,P.y,30,'#aa66ff',5,24,3);emit(P.x,P.y,20,'#ffffff',4,18,2.5,'star');addShockwave(P.x,P.y,80,'#c8a0ff',12);
// v6.1 Level number pop animation
const lvlEl=document.getElementById('h-lvl');if(lvlEl){lvlEl.style.transition='transform 0.2s cubic-bezier(0.34,1.56,0.64,1)';lvlEl.style.transform='scale(1.8)';lvlEl.style.color='#aa66ff';lvlEl.style.textShadow='0 0 10px rgba(170,102,255,0.6)';setTimeout(()=>{lvlEl.style.transform='scale(1)';lvlEl.style.color='';lvlEl.style.textShadow=''},300)}
const av=PERKS.filter(p=>{
  if(['SHOCKWAVE','TIME STOP','BERSERK','DRAIN','CHAOS ORB'].includes(p.n)&&P.ab!=='none'&&
     !['voidpulse','inferno','shadowstep'].includes(P.ab))return 0;
  if(['SHOCKWAVE','TIME STOP','BERSERK','DRAIN','CHAOS ORB'].includes(p.n)&&P.class)return 0;
  if(p.n==='BERSERKER'&&P.berserkPerk)return 0;
  if(p.n==='EXECUTIONER'&&P.executioner)return 0;
  if(p.n==='ECHO STRIKE'&&P.echoStrike)return 0;
  if(p.n==='THORNS'&&P.thornsPerk>=6)return 0;
  return 1});
const pool=av.sort(()=>Math.random()-.5).slice(0,3);const opts=document.getElementById('lu-opts');opts.innerHTML='';
document.getElementById('lu-subtitle').textContent=`${P.classIcon} ${P.className} · LEVEL ${P.lvl}  ⚔${Math.floor(P.bd+(P.w?P.w.d:0))} ♥${Math.floor(P.hp)}/${P.mhp} ⚡${P.spd.toFixed(1)}`;
for(const pk of pool){const d=document.createElement('div');d.className='lu-opt';
const rc=RARITY_COLORS[pk.r]||'#aaa';
const synName=wouldCompleteSynergy(pk.tags||[]);
const synHint=synName?`<div class="synergy-hint">★ Completes: ${synName}</div>`:'';
d.innerHTML=`<div class="rarity-indicator" style="background:${rc}"></div><div class="lo-name">${pk.n}</div><div class="lo-desc">${pk.d}</div>${synHint}`;
d.addEventListener('click',()=>{pk.f();
  P.perkNames.push(pk.n);
  if(pk.tags)for(const t of pk.tags)if(!P.perkTags.includes(t))P.perkTags.push(t);
  checkSynergies();
  // v8.0 Selection explosion in rarity color
  const selCol=rc||'#c8a0ff';flash(selCol,.08);chromAb=4;shk=6;
  emitRing(P.x,P.y,16,selCol,4,18,2.5);addShockwave(P.x,P.y,60,selCol,10);
  gSt='playing';document.getElementById('lvl-up').classList.remove('show');sfx('xp')});
opts.appendChild(d)}document.getElementById('lvl-up').classList.add('show')}

/* ═══════════════════════════════════════════════════
   ABILITIES - Class abilities + perk abilities
   ═══════════════════════════════════════════════════ */
// v10.0 Ability damage scaling — scales with base dmg + 50% weapon dmg + mastery
function abilityDmg(base){let d=base+P.bd+(P.w?P.w.d*0.5:0);
if(P.bT>0)d*=1.3;const mB=getMasteryBonus(P.class||'default');d*=(1+(mB.dmg||0));return d}

function useAb(){if(abCh<abMax||P.ab==='none')return;abCh=0;sfx('ability');flash('#ff8800',.12);shk=10;chromAb=3;
addDynLight(P.x,P.y,160,'#ff8800',1.2,0,15);
// v10.0 Chrono Freeze: using ability freezes all enemies
if(P.chronoFreeze){for(const e of ents){if(e.animState!=='die'){e.frozen=Math.max(e.frozen||0,45);emit(e.x,e.y,3,'#00ccff',1,8,1)}}
ft(P.x,P.y-30,'CHRONO FREEZE','#00ccff',1);addShockwave(P.x,P.y,120,'#00ccff',14)}
if(P.ab==='shockwave'){const ad=abilityDmg(6);for(const e of ents){const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<140){const a=Math.atan2(e.y-P.y,e.x-P.x);hrtE(e,ad,false,a);e.vx+=Math.cos(a)*14;e.vy+=Math.sin(a)*14;emit(e.x,e.y,8,'#ff8800',3,14,2)}}emitRing(P.x,P.y,30,'#ff8800',5,22,2.5);addShockwave(P.x,P.y,140,'#ff8800',18)}
else if(P.ab==='timestop'){for(const e of ents){applyStatus(e,'freeze',100);emit(e.x,e.y,5,'#00ccff',1,12,1.5)}emitRing(P.x,P.y,24,'#00ccff',4,18,2);addShockwave(P.x,P.y,120,'#00ccff',16)}
else if(P.ab==='berserk'){P.bT=200;emit(P.x,P.y,24,'#ff3300',4,16,2)}
else if(P.ab==='drain'){const ad=abilityDmg(3);for(const e of ents){const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<120){hrtE(e,ad,false,Math.atan2(e.y-P.y,e.x-P.x));P.hp=Math.min(P.mhp,P.hp+ad*0.2);emit(e.x,e.y,3,'#44ff66',2,10,1)}}emitRing(P.x,P.y,18,'#44ff66',3,16,2)}
else if(P.ab==='chaos'){const ad=abilityDmg(3);for(let i=0;i<16;i++){const a=Math.random()*Math.PI*2;
projs.push({x:P.x,y:P.y,vx:Math.cos(a)*(3+Math.random()*3),vy:Math.sin(a)*(3+Math.random()*3),
dmg:ad,life:60+Math.random()*40,color:['#ff4444','#44ff44','#4444ff','#ffff44','#ff44ff'][~~(Math.random()*5)],size:3+Math.random()*3,enemy:0})}emitRing(P.x,P.y,20,'#ffffff',5,18,2)}
// Class abilities
else if(P.ab==='voidpulse'){const ad=abilityDmg(5);for(const e of ents){const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<130){
const a=Math.atan2(e.y-P.y,e.x-P.x);hrtE(e,ad,false,a);e.vx+=Math.cos(a)*8;e.vy+=Math.sin(a)*8;
applyStatus(e,'slow',80);if(P.voidMark){e._voidMarked=180;emit(e.x,e.y,4,'#bb66ff',2,10,1.5);ft(e.x,e.y-22,'MARKED','#c8a0ff')}
emit(e.x,e.y,6,'#c8a0ff',2,12,1.5)}}
emitRing(P.x,P.y,28,'#c8a0ff',5,20,2.5);flash('#c8a0ff',.1);addShockwave(P.x,P.y,130,'#c8a0ff',16)}
else if(P.ab==='inferno'){const ad=abilityDmg(8);for(const e of ents){const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<150){
const a=Math.atan2(e.y-P.y,e.x-P.x);hrtE(e,ad,false,a);e.vx+=Math.cos(a)*10;e.vy+=Math.sin(a)*10;
applyStatus(e,'burn',80);emit(e.x,e.y,10,'#ff6633',3,16,2)}}
emitRing(P.x,P.y,32,'#ff6633',6,24,3);emit(P.x,P.y,30,'#ff3300',5,20,2);flash('#ff4400',.15);shk=14;addShockwave(P.x,P.y,150,'#ff6633',20)}
else if(P.ab==='shadowstep'){P.inv=15;
const nearest=ents.reduce((n,e)=>Math.hypot(e.x-P.x,e.y-P.y)<200&&(!n||Math.hypot(e.x-P.x,e.y-P.y)<Math.hypot(n.x-P.x,n.y-P.y))?e:n,null);
if(nearest){emit(P.x,P.y,12,'#44ddaa',3,14,2);
P.x=nearest.x-Math.cos(nearest.dir)*22;P.y=nearest.y-Math.sin(nearest.dir)*22;
hrtE(nearest,abilityDmg(wD()*2),true,Math.atan2(nearest.y-P.y,nearest.x-P.x));
emit(P.x,P.y,14,'#44ddaa',4,16,2.5);flash('#44ddaa',.08)}}
// Chronomancer: Temporal Rift
else if(P.ab==='temporal_rift'){
const positions=enemyPositionHistory;
for(const e of ents){if(e.animState==='die')continue;
const past=positions.find(p=>p.id===e._uid);
if(past){const dist=Math.hypot(e.x-past.x,e.y-past.y);const dmg=Math.max(abilityDmg(3),dist*0.15+abilityDmg(2));
// Teleport enemy back
const ox=e.x,oy=e.y;e.x=past.x;e.y=past.y;
hrtE(e,dmg,false,Math.atan2(oy-e.y,ox-e.x));
// Time warp visual: trail from current to past position
for(let t=0;t<8;t++){const frac=t/8;
parts.push({x:ox+(past.x-ox)*frac,y:oy+(past.y-oy)*frac,vx:(Math.random()-.5),vy:(Math.random()-.5),life:18,ml:18,color:'#00ccff',size:2+Math.random()*2,shape:'circle'})}
emit(e.x,e.y,10,'#00ccff',3,14,2);addDynLight(e.x,e.y,60,'#00ccff',1,0,8)}
else{hrtE(e,abilityDmg(3),false,Math.atan2(e.y-P.y,e.x-P.x));emit(e.x,e.y,6,'#00ccff',2,10,1.5)}}
emitRing(P.x,P.y,24,'#00ccff',5,20,2.5);flash('#00ccff',.12);shk=10;chromAb=4;
addShockwave(P.x,P.y,160,'#00ccff',18);addDynLight(P.x,P.y,180,'#00ccff',1.5,0,18);
// Clock visual: spinning particles
for(let c=0;c<24;c++){const a=Math.PI*2/24*c;const d=30+Math.sin(c*3)*10;
parts.push({x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d,vx:Math.cos(a+Math.PI/2)*2,vy:Math.sin(a+Math.PI/2)*2,life:22,ml:22,color:c%2?'#00ccff':'#88eeff',size:2,shape:'circle'})}
slMo=Math.max(slMo,25);camZoom=1.06;camZoomT=15}
// Warden: Fortify
else if(P.ab==='fortify'){const fortAmt=15+Math.floor(P.arm*2)+(P.lvl||1);P.shield=Math.min(P.maxShield+fortAmt,P.shield+fortAmt);P.maxShield=Math.max(P.maxShield,P.shield);P.fortifyT=300;P.inv=20;
emitRing(P.x,P.y,28,'#06d6a0',5,24,3);emit(P.x,P.y,24,'#06d6a0',4,20,2.5);flash('#06d6a0',.12);sfx('fortify');
addShockwave(P.x,P.y,140,'#06d6a0',18);addDynLight(P.x,P.y,180,'#06d6a0',1.5,0,20);
for(const e of ents){const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<100){const a=Math.atan2(e.y-P.y,e.x-P.x);e.vx+=Math.cos(a)*8;e.vy+=Math.sin(a)*8;e.fl=6}}}}

/* ═══════════════════════════════════════════════════
   CLASS SELECTION — v5 with mastery levels
   ═══════════════════════════════════════════════════ */
// v6 Void Rank difficulty modifier system
let activeVoidRank=0;
const VOID_RANKS=[
{name:'NORMAL',desc:'Standard difficulty',hpMult:1,dmgMult:1,shopMod:0,extraPhase:false,color:'#aaaaaa'},
{name:'VOID RANK I',desc:'Enemies +25% HP',hpMult:1.25,dmgMult:1,shopMod:0,extraPhase:false,color:'#ff8844'},
{name:'VOID RANK II',desc:'Enemies +50% HP, -1 shop item',hpMult:1.5,dmgMult:1.15,shopMod:-1,extraPhase:false,color:'#ff4466'},
{name:'VOID RANK III',desc:'Enemies +100% HP, boss extra phase',hpMult:2.0,dmgMult:1.3,shopMod:-1,extraPhase:true,color:'#ff0044'}];
function toggleVoidRank(){if(!saveData)loadSave();const maxRank=saveData.voidRank||0;
activeVoidRank=(activeVoidRank+1)%(maxRank+1);updateVoidRankDisplay()}
function updateVoidRankDisplay(){const el=document.getElementById('void-rank-toggle');if(!el)return;
if(!saveData||!saveData.voidRank){el.style.display='none';return}
el.style.display='block';const vr=VOID_RANKS[activeVoidRank];
el.textContent=`${vr.name} — ${vr.desc} [CLICK TO CHANGE]`;el.style.color=vr.color+'88'}

function initClassSelect(){
updateVoidRankDisplay();
const cont=document.getElementById('class-cards');cont.innerHTML='';
for(const[key,cls]of Object.entries(CLASSES)){const d=document.createElement('div');d.className='class-card';
const mLv=getMasteryLevel(key);const mBonus=getMasteryBonus(key);
const masteryHtml=mLv>0?`<div class="cc-mastery">MASTERY ${mLv} · +${(mBonus.dmg*100).toFixed(0)}% DMG${mBonus.hp>0?` +${mBonus.hp} HP`:''}</div>`:'';
d.innerHTML=`<div class="cc-glow" style="background:${cls.color}"></div>
<div class="cc-icon" style="color:${cls.color}">${cls.icon}</div>
<div class="cc-name" style="color:${cls.color}">${cls.name}</div>
<div class="cc-desc">${cls.desc}</div>
<div class="cc-stats">HP: ${cls.hp+mBonus.hp} · DMG: +${cls.bd} · SPD: ${cls.spd}<br>CRIT: ${(cls.cc*100).toFixed(0)}%</div>
<div class="cc-ability" style="color:${cls.color}">Q: ${cls.abName}</div>
<div class="cc-passive">${cls.passive}</div>
${masteryHtml}`;
d.addEventListener('mouseenter',()=>{d.style.borderColor=cls.color+'88';d.style.boxShadow=`0 0 30px ${cls.color}22`});
d.addEventListener('mouseleave',()=>{d.style.borderColor='';d.style.boxShadow=''});
d.addEventListener('click',()=>selectClass(key));
cont.appendChild(d)}}

function selectClass(key){const cls=CLASSES[key];if(!cls)return;
sfx('classup');flash(cls.color,.1);
const mBonus=getMasteryBonus(key);
P.class=key;P.className=cls.name;P.classIcon=cls.icon;P.classColor=cls.color;
P.mhp=cls.hp+mBonus.hp;P.hp=P.mhp;P.bd=cls.bd;P.spd=cls.spd;P.cc=cls.cc;
// Mastery damage bonus applied multiplicatively in wD()
P.ab=cls.ab;abCh=abMax;
if(cls.passiveKey==='killsHeal')P.killsHeal=true;
if(cls.passiveKey==='burnChance')P.burnChance=0.2;
if(cls.passiveKey==='dashDmg'){P.dashDmg=true;P.dMax*=0.7}
if(cls.passiveKey==='shieldBash'){P.shieldBash=true;P.maxShield+=5;P.shield=5;P.shieldRegen=1;P.arm+=1}
if(cls.passiveKey==='timeDilation'){P.timeDilation=true;P.timeDilationCount=0}
// v7.0 Apply meta-progression upgrades
applyMetaUpgrades();
// v9.0 Apply active curses
curseScoreMult=activeCurses.reduce((m,c)=>m*c.scoreMult,1);
for(const curse of activeCurses)curse.apply(P);
displayHP=P.hp;
document.getElementById('class-scr').classList.add('off');
document.getElementById('class-hud').innerHTML=`<span style="color:${cls.color}">${cls.icon} ${cls.name}</span>`;
gSt='playing';
document.getElementById('hud').style.display='flex';document.getElementById('minimap-c').style.display='block';
genDungeon();showFloorBanner()}

/* ═══════════════════════════════════════════════════
   v10.0 INTRO CINEMATIC — story sequence before class select
   ═══════════════════════════════════════════════════ */
const INTRO_SEQUENCE=[
{type:'pause',duration:60},
{type:'heading',text:'THE CITADEL OF DAWN',duration:160},
{type:'text',text:'For three hundred years, the Citadel stood as humanity\'s last beacon — a fortress built upon a wound in reality itself.',duration:200},
{type:'text',text:'Its founders knew what slept beneath the stone. They built not to seal the wound, but to harness its power.',duration:200},
{type:'text',text:'They called it the Void — a realm of living darkness that hungered for the world above.',duration:200},
{type:'pause',duration:50},
{type:'heading',text:'THE BREAKING',duration:160},
{type:'text',text:'On the night of the Red Eclipse, the seal shattered. The Void erupted upward, swallowing the Citadel\'s lower halls in seconds.',duration:220},
{type:'text',text:'Five guardians were consumed — twisted into wardens of the abyss, each bound to a layer of corrupted reality.',duration:220},
{type:'text',text:'The Counselor became the Whisper King. The Botanist became the Mycelium Titan. The Forge-Master became the Inferno Warden.',duration:240},
{type:'text',text:'The Queen became the Frost Sovereign. And the High Priest — who first opened the wound — became the Void Herald.',duration:240},
{type:'pause',duration:50},
{type:'heading',text:'THE DESCENT',duration:160},
{type:'text',text:'The survivors sent their champions into the depths. Knights. Mages. Rogues. Healers. Rangers. None returned.',duration:220},
{type:'text',text:'Their ghosts now wander the halls, whispering warnings to those who follow.',duration:200},
{type:'text',text:'At the bottom, the wound itself has grown a mind. The Void Sovereign stirs, fed by every soul that falls.',duration:220},
{type:'pause',duration:40},
{type:'heading',text:'YOU ARE THE LAST.',duration:140},
{type:'text',text:'There will be no more after you.',duration:160},
{type:'pause',duration:60},
{type:'heading',text:'DESCEND.',duration:100,final:true}];

let introStep=0,introTimer=0,introCtx=null;
const INTRO_PARTS=[];

function beginIntro(){
gSt='intro';introStep=0;introTimer=0;INTRO_PARTS.length=0;hideAllOverlays();
document.getElementById('title-scr').classList.add('off');
document.getElementById('intro-scr').classList.remove('off');
const c=document.getElementById('intro-bg');c.width=W;c.height=H;
introCtx=c.getContext('2d');introCtx.clearRect(0,0,W,H);
document.getElementById('intro-text').innerHTML='';
sfx('ghost');advanceIntro()}

function advanceIntro(){
if(introStep>=INTRO_SEQUENCE.length){finishIntro();return}
const step=INTRO_SEQUENCE[introStep];introTimer=step.duration;
const cont=document.getElementById('intro-text');
if(step.type==='heading'||step.type==='text'){
const el=document.createElement('div');
el.className='intro-line '+(step.type==='heading'?'intro-heading':'intro-body');
el.textContent=step.text;cont.appendChild(el);
requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('visible')));
// Keep only last ~8 visible lines, fade older ones
const lines=cont.querySelectorAll('.intro-line');
if(lines.length>8){for(let li=0;li<lines.length-8;li++){lines[li].style.opacity='0';lines[li].style.maxHeight='0';lines[li].style.margin='0';lines[li].style.transition='opacity 0.8s,max-height 0.5s 0.3s,margin 0.5s 0.3s'}}}
if(step.final){setTimeout(()=>{if(gSt==='intro')finishIntro()},step.duration*16.67)}}

function skipIntro(){if(gSt==='intro')finishIntro()}

function finishIntro(){
if(gSt!=='intro')return;
const scr=document.getElementById('intro-scr');
scr.style.transition='opacity 0.8s';scr.style.opacity='0';
setTimeout(()=>{scr.classList.add('off');scr.style.opacity='';scr.style.transition='';
document.getElementById('intro-text').innerHTML='';begin()},900)}

function drawIntro(){
if(!introCtx)return;
introCtx.fillStyle='rgba(4,4,8,0.04)';introCtx.fillRect(0,0,W,H);
const progress=introStep/INTRO_SEQUENCE.length;
// Warm fireplace glow at bottom-center, grows with story
const glowR=80+progress*60;
const glow=introCtx.createRadialGradient(W/2,H*0.92,0,W/2,H*0.85,glowR);
glow.addColorStop(0,`rgba(255,${Math.floor(100+progress*60)},${Math.floor(20+progress*30)},0.03)`);
glow.addColorStop(0.5,`rgba(255,80,10,0.008)`);glow.addColorStop(1,'rgba(0,0,0,0)');
introCtx.fillStyle=glow;introCtx.fillRect(0,0,W,H);
// v10 Ember/firecamp sparks rising
// Regular embers — 2-3 per frame, warm colors, upward drift with wander
if(fr%1===0){const count=2+Math.floor(Math.random()*2);
for(let e=0;e<count;e++){const isHot=Math.random()>0.85;const isPop=Math.random()>0.9;
INTRO_PARTS.push({x:W/2+(Math.random()-0.5)*W*0.4,y:H+3+Math.random()*5,
vx:(Math.random()-0.5)*0.3,vy:isPop?-1.5-Math.random()*1:-0.3-Math.random()*0.5,
life:isPop?30+Math.random()*20:100+Math.random()*80,ml:isPop?50:180,
size:isHot?0.8+Math.random():1+Math.random()*3,
color:isHot?'#ffffcc':Math.random()>0.5?'#ff6622':'#ffaa33',
wander:Math.random()*100,flickerSpd:0.05+Math.random()*0.08})}}
for(let i=INTRO_PARTS.length-1;i>=0;i--){const p=INTRO_PARTS[i];
// Sinusoidal horizontal wander
p.x+=p.vx+Math.sin(p.life*0.05+p.wander)*0.3;
p.y+=p.vy;p.vy*=0.998;p.life--;
if(p.life<=0||INTRO_PARTS.length>200){INTRO_PARTS.splice(i,1);continue}
const pa=p.life/p.ml;const flicker=0.5+Math.sin(p.life*p.flickerSpd)*0.4;
// Glow halo
introCtx.globalAlpha=pa*0.08*flicker;
const eg=introCtx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*4);
eg.addColorStop(0,'rgba(255,140,30,0.4)');eg.addColorStop(1,'rgba(0,0,0,0)');
introCtx.fillStyle=eg;introCtx.fillRect(p.x-p.size*4,p.y-p.size*4,p.size*8,p.size*8);
// Ember body — elongated along velocity
introCtx.globalAlpha=pa*0.35*flicker;introCtx.fillStyle=p.color;
introCtx.save();introCtx.translate(p.x,p.y);
const angle=Math.atan2(p.vy,p.vx+Math.sin(p.life*0.05+p.wander)*0.3);
introCtx.rotate(angle);
introCtx.beginPath();introCtx.ellipse(0,0,p.size*1.3,p.size*0.6,0,0,Math.PI*2);introCtx.fill();
introCtx.restore()}
introCtx.globalAlpha=1}

/* ═══════════════════════════════════════════════════
   GAME LIFECYCLE — v5 with high scores, run stats
   ═══════════════════════════════════════════════════ */
function begin(){ia();flr=1;kills=0;rmsV=1;fr=0;gold=0;tGold=0;tDmg=0;runTime=0;cmb=0;cmbT=0;mxCmb=0;abCh=0;hitSt=0;slMo=0;abKeyDown=false;chromAb=0;runEssence=0;
multiKillT=0;multiKillN=0;waveActive=false;waveNum=0;camZoom=1;camZoomT=0;floorTransT=0;floorTransPhase=0;displayHP=8;displayShield=0;hpDrainT=0;
weaponTrail=[];shockwaves=[];achvShown={};vfxLines=[];uiParts=[];weaponKillCount=0;weaponEvoStage=0;
Object.assign(P,{hp:8,mhp:8,spd:2.8,bd:0,atkCd:0,inv:0,xp:0,xpN:10,lvl:1,vx:0,vy:0,dir:0,atkA:0,cc:.05,ls:0,arm:0,prc:0,
dCd:0,dT:0,dsh:false,w:WPN[0],dMax:42,pc:1,ab:'none',bT:0,ai:[],comboStep:0,comboTimer:0,chargeT:0,charging:false,
parryT:0,parryWindow:0,parryCD:0,shield:0,maxShield:0,shieldRegen:0,shieldRegenT:0,thorns:0,goldMult:1,spCd:0,spMax:90,
acc:null,statuses:[],totalDmg:0,hitStop:0,
class:null,className:'',classIcon:'',classColor:'#c8a0ff',forgeLevel:0,forgeDmg:0,
perkTags:[],synergies:[],perkNames:[],
killsHeal:false,burnChance:0,dashDmg:false,
echoStrike:false,executioner:false,berserkPerk:false,thornsPerk:0,
goldHeals:false,critDmgMult:1,pierceSynergy:false,
relic:null,phantomCount:0,
highestHit:0,bestRoomKills:0,parryCount:0,forgesUsed:0,dmgTaken:0,
// v6 additions
fortifyT:0,shieldBash:false,
timeDilation:false,timeDilationCount:0,perfectDodgeT:0,weaponKills:0,
ricochet:false,soulHarvest:false,secondWind:false,elemMastery:false,momentum:false,magnetism:false,overcharge:false,
elemStorm:false,undying:false,warlord:false,
soulLantern:false,chaosSeed:false,ironWill:false,mirrorShield:false,
xpMult:1,revived:false,phoenixUsed:false,eventBuff:null,
// v7.0 new accessory + visual properties
stretchDir:0,stretchT:0,flashWhite:0,dmgIndicator:null,mindSwapped:0,rooted:0,
echoAmulet:false,echoCount:0,vampFang:false,blinkDash:false,
thornCrown:false,thornCd:0,gravLens:false,berserkBand:false,
soulMirror:false,chronoLoop:false,chronoUsed:false,chronoSnaps:[],
chaosGem:false,chaosRoomBuff:null});
parts=[];fts=[];projs=[];picks=[];props=[];trA=0;bloodSplats=[];dynLights=[];
perfectDodgeT=0;perfectDodgeCount=0;perfectDodgeBuff=0;weaponMastery={};comboFinisherReady=false;whispersFired={};whisperQ='';whisperT=0;
corruption=0;corruptionThreshold=0;activeContracts=[];contractsFailed=false;enemySynergyCD=0;
enemyPositionHistory=[];footstepDecals=[];scorchMarks=[];bossIntroT=0;bossIntroTarget=null;executionSlowT=0;
weatherParts=[];ambientParts=[];
// v6 meta-progression: run streak gold bonus
if(saveData&&saveData.runStreak>0)gold=Math.min(50,saveData.runStreak*5);
// v6.0 unlock bonus: bonus gold
if(saveData&&saveData.unlocks&&saveData.unlocks.bonus_gold)gold+=25;
document.getElementById('title-scr').classList.add('off');document.getElementById('death-scr').classList.add('off');document.getElementById('victory-scr').classList.add('off');document.getElementById('intro-scr').classList.add('off');
document.getElementById('combo-display').classList.remove('show');
document.getElementById('relic-hud').textContent='';
gSt='classSelect';initClassSelect();
// v9.0 Show curse panel + render curse toggles
document.getElementById('curse-panel').style.display='block';renderCursePanel();
document.getElementById('class-scr').classList.remove('off')}

function calcRating(){
let score=flr*100+kills*10+mxCmb*15+Math.floor(tDmg)+tGold;
if(runTime>0)score+=Math.floor(Math.max(0,1000-runTime*2));
score=Math.floor(score*curseScoreMult); // v9.0 curse score multiplier
return{score,grade:score>=3000?'S':score>=2000?'A':score>=1200?'B':score>=600?'C':'D',
color:score>=3000?'#ffcc00':score>=2000?'#44ff66':score>=1200?'#44ccff':score>=600?'#c8a0ff':'#ff6666'}}

function die(){
// v7.0 Chrono Loop: rewind on death — v9.0 enhanced visual rewind
if(P.chronoLoop&&!P.chronoUsed&&P.chronoSnaps.length>0){P.chronoUsed=true;
const deathX=P.x,deathY=P.y;
const snap=P.chronoSnaps[P.chronoSnaps.length-1];P.x=snap.x;P.y=snap.y;P.hp=Math.max(snap.hp,3);P.shield=snap.shield;P.inv=60;
emitRing(P.x,P.y,30,'#00ccff',5,30,3);flash('#00ccff',.3);shk=15;chromAb=8;slMo=25;hitSt=15;
addShockwave(deathX,deathY,100,'#00ccff',16);addShockwave(P.x,P.y,80,'#00ffff',12);
msg('TIME REWIND!',1200);sfx('revive');addDynLight(P.x,P.y,200,'#00ccff',2,0,25);
// Rewind trail from death position to snap position
const rwDist=Math.hypot(P.x-deathX,P.y-deathY);const rwAng=Math.atan2(P.y-deathY,P.x-deathX);
for(let tp=0;tp<30;tp++){const t=tp/30;const rx=deathX+Math.cos(rwAng)*rwDist*t,ry=deathY+Math.sin(rwAng)*rwDist*t;
parts.push({x:rx+(Math.random()-.5)*10,y:ry+(Math.random()-.5)*10,vx:(Math.random()-.5)*1,vy:-1-Math.random(),
life:15+tp*.5,ml:30,color:Math.random()>.3?'#00ccff':'#88eeff',size:2+Math.random()*2,shape:'circle',grav:-0.02})}
// Clock-like particles spinning inward
for(let cp=0;cp<12;cp++){const ca=Math.PI*2/12*cp;
parts.push({x:P.x+Math.cos(ca)*40,y:P.y+Math.sin(ca)*40,vx:Math.cos(ca+Math.PI)*3,vy:Math.sin(ca+Math.PI)*3,
life:20,ml:20,color:'#00ffff',size:3,shape:'diamond'})}
P.chronoSnaps=[];return}
// v8.0 Phoenix Blade passive: revive from ashes
if(P.w&&P.w.evoPassive==='phoenix'&&!P.phoenixUsed){P.phoenixUsed=true;P.hp=Math.ceil(P.mhp*0.4);P.inv=90;
emitRing(P.x,P.y,40,'#ff4400',7,40,4);emit(P.x,P.y,30,'#ff6633',5,30,3,'star');flash('#ff4400',.4);shk=20;chromAb=8;
msg('PHOENIX RISES!',1500);sfx('revive');addDynLight(P.x,P.y,250,'#ff4400',3,0,30);addShockwave(P.x,P.y,120,'#ff4400',18);
for(let fp=0;fp<30;fp++){const fa=Math.random()*Math.PI*2;parts.push({x:P.x,y:P.y+10,vx:Math.cos(fa)*3,vy:-2-Math.random()*4,life:40+Math.random()*30,ml:70,color:Math.random()>.5?'#ff4400':'#ff8833',size:2.5+Math.random()*2,shape:'star',grav:-0.03})}return}
// Second Wind perk OR Undying synergy: revive once
if((P.secondWind||P.undying)&&!P.revived){P.revived=true;P.hp=Math.ceil(P.mhp*(P.undying?0.5:0.3));P.inv=60;
emitRing(P.x,P.y,30,P.undying?'#ffcc00':'#44ff66',5,30,3);flash(P.undying?'#ffcc00':'#44ff66',.2);shk=12;chromAb=5;
msg(P.undying?'UNDYING!':'SECOND WIND!',1200);sfx('revive');addDynLight(P.x,P.y,200,P.undying?'#ffcc00':'#44ff66',2,0,20);triggerAchievement('revive');return}
gSt='dying';setBossMusic(false);hideAllOverlays();dyingT=0;dyingPx=P.x;dyingPy=P.y;dyingColor=P.classColor||'#c8a0ff';
emitRing(P.x,P.y,32,'#ff3366',5,45,3);emit(P.x,P.y,24,'#c8a0ff',6,40,2,'circle');emit(P.x,P.y,40,'#fff',4.5,28,2);
addDynLight(P.x,P.y,250,'#ff3366',2,0,40);chromAb=6;
shk=35;shkAngle=Math.random()*Math.PI*2;flash('#ff0000',.45);hitSt=30;slMo=0.001;camZoom=1.3;camZoomT=200;
// Requiem stinger: 5-note descending
if(ac){const n=ac.currentTime;[400,350,280,220,150].forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();
o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0.06,n+i*0.25);g.gain.exponentialRampToValueAtTime(.001,n+i*0.25+0.6);
o.connect(g);g.connect(masterGain);o.start(n+i*0.25);o.stop(n+i*0.25+0.7)})}
// Death epitaphs
const EPITAPHS=['The void claims another.','Your light fades into shadow.','The darkness grows stronger.',
'Another soul lost to the depths.','Silence. The abyss is patient.','The void remembers your name.'];
dyingEpitaph=EPITAPHS[Math.floor(Math.random()*EPITAPHS.length)];
setTimeout(()=>{gSt='dead';slMo=1;camZoom=1;const rating=calcRating();
// v5 high score + run stats
const isNew=!saveData.highScores.length||rating.score>saveData.highScores[0].score;
addHighScore(rating.score,flr,P.className,formatTime(runTime));
recordRunHistory(flr,P.className,rating.score,formatTime(runTime),P.w?P.w.n:'FISTS',kills,mxCmb);
checkUnlocks();
document.getElementById('d-floor').textContent=flr;document.getElementById('d-kills').textContent=kills;
document.getElementById('d-lvl').textContent=P.lvl;document.getElementById('d-combo').textContent=mxCmb;
document.getElementById('d-gold').textContent=tGold;document.getElementById('d-dmg').textContent=Math.floor(tDmg);
document.getElementById('d-rooms').textContent=rmsV;document.getElementById('d-time').textContent=formatTime(runTime);
// v6.1 extra stats
const kpm=runTime>0?Math.floor(kills/(runTime/60)):0;
document.getElementById('d-kpm').textContent=kpm;
document.getElementById('d-weapon').textContent=P.w?P.w.n:'FISTS';
// v6.1 staggered stat reveal animations
const dStats=document.querySelectorAll('#death-scr .ds-stat');
dStats.forEach((s,i)=>{s.style.animationDelay=`${0.4+i*0.1}s`});
document.getElementById('d-epitaph').textContent=getDeathEpitaph();
// v9.0 Legend title + Cause of death
document.getElementById('d-legend').textContent=genLegendTitle();
{const cause=P._lastDmgSource;let causeText='';
if(cause==='trap')causeText='CAUSE OF DEATH: TRAP';
else if(cause==='lava')causeText='CAUSE OF DEATH: LAVA';
else if(cause==='projectile')causeText='CAUSE OF DEATH: ENEMY PROJECTILE';
else if(cause==='arena_hazard')causeText='CAUSE OF DEATH: ARENA HAZARD';
else if(cause)causeText=`SLAIN BY: ${cause}`;
else causeText='CONSUMED BY THE VOID';
document.getElementById('d-cause').textContent=causeText}
document.getElementById('d-rating').textContent=rating.grade;
document.getElementById('d-rating').style.color=rating.color;
// v5.1 encouragement tip + run highlights
const prevBest=saveData.highScores.length>1?saveData.highScores[1].floor:0;
let encouragement='';
if(flr>prevBest&&prevBest>0)encouragement='★ NEW PERSONAL BEST FLOOR! ★';
else if(flr===prevBest&&prevBest>0)encouragement='MATCHED YOUR BEST — PUSH FURTHER!';
else encouragement=DEATH_TIPS[Math.floor(Math.random()*DEATH_TIPS.length)];
document.getElementById('d-tip').textContent=encouragement;
// v6.0 Enhanced death screen highlights
const hl=[];
if(P.highestHit>15)hl.push(`⚔ Best Hit: ${P.highestHit}`);
if(P.parryCount>0)hl.push(`🛡 Parries: ${P.parryCount}`);
if(mxCmb>8)hl.push(`🔥 Peak Combo: ${mxCmb}x`);
if(P.forgesUsed>0)hl.push(`⚒ Forges: ${P.forgesUsed}`);
if(P.dmgTaken>0)hl.push(`💔 Damage Taken: ${Math.floor(P.dmgTaken)}`);
if(P.revived)hl.push(`✨ Revived!`);
if(P.relic)hl.push(`◆ ${P.relic.name}`);
if(P.synergies.length)hl.push(`★ ${P.synergies.length} Synergies`);
const dps=runTime>0?Math.floor(tDmg/(runTime/60)):0;
if(dps>0)hl.push(`⚡ ${dps} DPS`);
if(activeVoidRank>0)hl.push(`☠ ${VOID_RANKS[activeVoidRank].name}`);
if(saveData&&saveData.runStreak>1)hl.push(`🔥 Streak: ${saveData.runStreak}`);
// v6.0 Weapon mastery display
if(P.w){const wlv=getWeaponMasteryLevel(P.w.name);if(wlv>0)hl.push(`⚔ ${P.w.name} ★${wlv}`)}
// v6.0 Best moment highlight
let bestMoment='';
if(P.highestHit>20)bestMoment=`Your mightiest blow dealt ${P.highestHit} damage!`;
else if(mxCmb>12)bestMoment=`Achieved a devastating ${mxCmb}x combo!`;
else if(P.parryCount>5)bestMoment=`Deflected ${P.parryCount} attacks with masterful timing!`;
if(bestMoment)hl.push(`\n✦ ${bestMoment}`);
document.getElementById('d-highlights').innerHTML=hl.join(' · ');
// v6.0 Run history timeline
const rhEl=document.getElementById('d-runhistory');
if(rhEl&&saveData.runHistory&&saveData.runHistory.length>1){
const hist=saveData.runHistory.slice(-5);
let tl='<div style="font-family:Silkscreen,monospace;font-size:7px;letter-spacing:2px;color:rgba(200,160,255,0.3);margin:4px 0 2px">RECENT RUNS</div>';
tl+='<div style="display:flex;gap:3px;justify-content:center;align-items:flex-end;margin-bottom:4px">';
hist.forEach((r,i)=>{const isCurrent=i===hist.length-1;const h=Math.max(12,Math.min(40,r.floor*6));
const c=isCurrent?'#ff3366':r.floor>=5?'#44ff66':r.floor>=3?'#44ccff':'rgba(200,160,255,0.4)';
tl+=`<div style="text-align:center;opacity:${isCurrent?1:0.6}"><div style="font-family:Silkscreen,monospace;font-size:6px;color:${c}">${r.cls?r.cls.slice(0,3).toUpperCase():'???'}</div><div style="width:18px;height:${h}px;background:${c};border-radius:2px;margin:2px auto"></div><div style="font-family:Silkscreen,monospace;font-size:7px;color:${c}">F${r.floor}</div></div>`});
tl+='</div>';
const prevBestFloor=Math.max(...hist.slice(0,-1).map(r=>r.floor));
if(flr>=prevBestFloor&&prevBestFloor>0&&hist.length>1)tl+='<div style="font-family:Silkscreen,monospace;font-size:7px;color:#ffcc00;letter-spacing:2px">★ MATCHED OR BEAT YOUR RECENT BEST ★</div>';
else if(flr===prevBestFloor-1)tl+='<div style="font-family:Silkscreen,monospace;font-size:7px;color:rgba(255,180,100,0.5);letter-spacing:1px">SO CLOSE... JUST 1 MORE FLOOR!</div>';
rhEl.innerHTML=tl}
// v6.0 Daily challenge label
if(dailyMode){const dLbl=document.createElement('div');dLbl.style.cssText='font-family:Silkscreen,monospace;font-size:8px;letter-spacing:3px;color:#ffcc00;margin-bottom:4px';
dLbl.textContent='☀ DAILY CHALLENGE ☀';document.getElementById('death-scr').insertBefore(dLbl,document.getElementById('death-scr').firstChild.nextSibling)}
// New high score flash
const nhEl=document.getElementById('d-newhigh');nhEl.style.display=isNew?'block':'none';if(isNew)nhEl.classList.add('active');else nhEl.classList.remove('active');
// High score board
const scEl=document.getElementById('d-scores');scEl.innerHTML='';
for(let i=0;i<Math.min(5,saveData.highScores.length);i++){const hs=saveData.highScores[i];
scEl.innerHTML+=`<div class="score-entry"><span>#${i+1}</span><span>${hs.cls||'?'}</span><span>F${hs.floor}</span><span>${hs.score}</span></div>`}
// v6.0 Unlock notification
const newUl=checkUnlocks();
if(newUl){const ulEl=document.createElement('div');ulEl.style.cssText='font-family:Silkscreen,monospace;font-size:8px;letter-spacing:2px;color:#44ff66;margin:4px 0;animation:statReveal .6s ease-out 1.5s both';
ulEl.textContent='★ NEW UNLOCK AVAILABLE ★';document.getElementById('d-scores').after(ulEl)}
// v7.0 Meta-progression: floor bonus essence
const floorEss=flr*5;addEssence(floorEss);
const deEl=document.getElementById('d-essence');if(deEl){deEl.style.display='block';deEl.textContent=`◈ +${runEssence} VOID ESSENCE (TOTAL: ${saveData.voidEssence||0})`}
document.getElementById('death-scr').classList.remove('off');document.getElementById('hud').style.display='none';
document.getElementById('minimap-c').style.display='none';document.getElementById('combo-display').classList.remove('show')},4000)}

function victory(){
gSt='ascending';setBossMusic(false);hideAllOverlays();ascendT=0;
// Epic victory effects
emitRing(P.x,P.y,50,'#ffcc00',8,60,4);emit(P.x,P.y,60,'#ffffff',6,50,3,'star');
for(let v=0;v<80;v++){const va=Math.random()*Math.PI*2,vs=2+Math.random()*5;
parts.push({x:P.x,y:P.y,vx:Math.cos(va)*vs,vy:Math.sin(va)*vs,life:60+Math.random()*40,ml:100,
color:['#ffcc00','#ffffff','#ff8844','#44ff66'][v%4],size:2+Math.random()*3,shape:'star',grav:0.02})}
addShockwave(P.x,P.y,300,'#ffcc00',40);addShockwave(P.x,P.y,200,'#ffffff',30);
flash('#ffffff',1);shk=40;chromAb=15;hitSt=60;
// Triumphant ascending stinger: 8-note major chord
if(ac){const n=ac.currentTime;[261,330,392,523,659,784,1047,1318].forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();
o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0.06,n+i*0.12);g.gain.exponentialRampToValueAtTime(.001,n+i*0.12+0.5);
o.connect(g);g.connect(masterGain);o.start(n+i*0.12);o.stop(n+i*0.12+0.6)})}
setTimeout(()=>{gSt='victory';const rating=calcRating();rating.score+=2000;// Victory bonus
const vGrade=rating.score>=5000?'S+':rating.score>=4000?'S':rating.score>=3000?'A':rating.score>=2000?'B':'C';
const vColor=vGrade==='S+'?'#ffffff':rating.color;
addHighScore(rating.score,flr,P.className,formatTime(runTime));
recordRunHistory(flr,P.className,rating.score,formatTime(runTime),P.w?P.w.name:'FISTS',kills,mxCmb);
// v8.0 Animated stat counters — numbers count up from 0
const vStats=[['v-floor',flr],['v-kills',kills],['v-lvl',P.lvl],['v-combo',mxCmb],['v-gold',tGold],['v-dmg',Math.floor(tDmg)]];
const kpm=runTime>0?Math.floor(kills/(runTime/60)):0;
vStats.push(['v-kpm',kpm]);
document.getElementById('v-time').textContent=formatTime(runTime);
document.getElementById('v-class').textContent=P.className;
document.getElementById('v-weapon').textContent=P.w?P.w.name:'FISTS';
for(const[elId,target]of vStats){const el=document.getElementById(elId);if(!el)continue;el.textContent='0';
const dur=1200;const start=performance.now();
(function animCounter(){const now=performance.now();const p=Math.min(1,(now-start)/dur);
const eased=1-Math.pow(1-p,3);el.textContent=Math.floor(eased*target);
if(p<1)requestAnimationFrame(animCounter);else el.textContent=target})()}
document.getElementById('v-rating').textContent=vGrade;
document.getElementById('v-rating').style.color=vColor;
// v9.0 Legend title + class-specific epilogue
document.getElementById('v-legend').textContent=genLegendTitle();
document.getElementById('v-epilogue').textContent=VICTORY_EPILOGUES[P.class]||VICTORY_EPILOGUES.default;
const vhl=[];
if(P.highestHit>15)vhl.push(`Best Hit: ${P.highestHit}`);
if(mxCmb>5)vhl.push(`Peak Combo: ${mxCmb}x`);
if(P.parryCount>0)vhl.push(`Parries: ${P.parryCount}`);
if(P.relic)vhl.push(`Relic: ${P.relic.name}`);
if(P.synergies.length)vhl.push(`${P.synergies.length} Synergies`);
document.getElementById('v-highlights').textContent=vhl.join(' · ');
// v7.0 Meta-progression: victory bonus essence
const victEss=100+flr*5;addEssence(victEss);
const veEl=document.getElementById('v-essence');if(veEl){veEl.style.display='block';veEl.textContent=`◈ +${runEssence} VOID ESSENCE (TOTAL: ${saveData.voidEssence||0})`}
document.getElementById('victory-scr').classList.remove('off');
document.getElementById('hud').style.display='none';
document.getElementById('minimap-c').style.display='none';
document.getElementById('combo-display').classList.remove('show')},7000)}

function wD(){let d=(P.w?P.w.d:1)+P.bd;if(P.bT>0)d*=2;if(P.berserkPerk&&P.hp<P.mhp*.3)d*=1.5;
if(perfectDodgeBuff>0)d*=1.5;
if(P.w)d*=getWeaponMasteryDmgMult(P.w.name);
// Mastery bonus
const mBonus=getMasteryBonus(P.class||'default');d*=(1+mBonus.dmg);
// Ember Heart relic: all attacks +burn handled in combat
return d}
function wR(){return P.w?P.w.r:30}function wS(){let s=P.w?P.w.s:16;if(P.bT>0)s*=.55;if(P.berserkBand)s*=Math.max(0.5,1-cmb*0.05);if(P.berserkProtocol&&P.hp<P.mhp*0.3)s*=0.6;return s}

// v5 challenge wave spawning
function spawnWave(waveN){const n=waveN===1?3+Math.floor(Math.random()*2):waveN===2?5+Math.floor(Math.random()*2):7+Math.floor(Math.random()*2);
const pool=flr<5?['slime','bat','skel','rat','spider','swarmer']:flr<10?['skel','mage','brute','spider','wraith','assassin','shaman','swarmer']:['mage','brute','assassin','wraith','golem','necromancer','knight','shaman'];
for(let i=0;i<n;i++){let ex=TS*2+Math.random()*(RPX-TS*4),ey=TS*2+Math.random()*(RPY-TS*4);
const et=pool[Math.floor(Math.random()*pool.length)];
const e=mkE(et,ex,ey);e.animState='spawn';e.animFrame=0;e.spawnDelay=i*6;e.spawnDone=false;e.alpha=0;
const isElite=waveN>=2&&i<(waveN===2?1:2)&&Math.random()<.5;
if(isElite){const mod=EMODS[Math.floor(Math.random()*EMODS.length)];mod.a(e);e.elite=1;e.eName=mod.n;e.eCol=mod.c;e.eSym=mod.sym;e.eVfx=mod.vfx;e.xp*=2.5;e.gold*=2}
ents.push(e)}
const wb=document.getElementById('wave-banner');wb.textContent=`WAVE ${waveN}/${waveMax}`;wb.classList.add('show');
setTimeout(()=>wb.classList.remove('show'),1500);sfx('wave')}

/* ═══════════════════════════════════════════════════
   PLAYER ATTACK - v5 enhanced combo + slash trail ribbon
   ═══════════════════════════════════════════════════ */
// v10.0 Skill Chain system — action sequences grant bonus effects
function getSkillChain(){
if(P.dCd>0&&P.dCd>((P.dMax||18)-12))return{name:'LUNGE',mult:1.5,color:'#44ddaa'};
if((P.parryCD||0)>0&&P.parryCD>((P.dMax||18)-15))return{name:'RIPOSTE',mult:3.0,crit:true,color:'#ffffff'};
if(abCh<12&&abCh>0)return{name:'EMPOWERED',mult:1.3,color:'#ff8800'};
return null}

function pAtk(){P.atkCd=wS();P.atkA=9;aR=0;const w=P.w||{t:'m'};
P.comboStep=(P.comboTimer>0?(P.comboStep+1)%3:0);P.comboTimer=25;
const cStep=P.comboStep;let dmgMult=[1,1.1,1.4][cStep];
// v10.0 Combo finisher branching — directional 3rd hit
let finisherType='slam';// default: standing still
if(cStep===2){let fmx=0,fmy=0;if(K['ArrowLeft']||K['KeyA'])fmx=-1;if(K['ArrowRight']||K['KeyD'])fmx=1;
if(K['ArrowUp']||K['KeyW'])fmy=-1;if(K['ArrowDown']||K['KeyS'])fmy=1;if(tA){fmx=tMX;fmy=tMY}
const flen=Math.sqrt(fmx*fmx+fmy*fmy);
if(flen>0.3){const moveA=Math.atan2(fmy,fmx);let relA=moveA-P.dir;while(relA>Math.PI)relA-=Math.PI*2;while(relA<-Math.PI)relA+=Math.PI*2;
if(Math.abs(relA)<Math.PI/3)finisherType='thrust';// moving forward
else if(Math.abs(relA)>Math.PI*2/3)finisherType='retreat';// moving backward
else finisherType='sweep'}// moving sideways
if(finisherType==='thrust'){dmgMult=2;ft(P.x,P.y-24,'THRUST!','#ff8844',1.2)}
else if(finisherType==='sweep'){dmgMult=0.8;ft(P.x,P.y-24,'SWEEP!','#44ccff',1.2)}
else if(finisherType==='retreat'){dmgMult=1.2;P.inv=Math.max(P.inv,15);const bx=-Math.cos(P.dir)*40,by=-Math.sin(P.dir)*40;
P.x+=bx;P.y+=by;ft(P.x,P.y-24,'RETREAT!','#88ff88',1.2)}
else{dmgMult=1.5;ft(P.x,P.y-24,'SLAM!','#ffcc00',1.2)}}
// v10.0 Skill chain bonus
const chain=getSkillChain();
if(chain){dmgMult*=chain.mult;ft(P.x,P.y-28,chain.name,chain.color,1);
emit(P.x,P.y,8,chain.color,2,14,2);addShockwave(P.x,P.y,40,chain.color,8);sfx('combo_finish')}
// v7.0 Mobile auto-aim: face nearest enemy when attacking via touch
if(isMobile&&tAA){let nearD=wR()*2.5,nearE=null;
for(const e of ents){if(e.animState==='die'||!e.spawnDone&&e.animState==='spawn')continue;
const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<nearD){nearD=d;nearE=e}}
if(nearE){P.dir=Math.atan2(nearE.y-P.y,nearE.x-P.x);mouseX=nearE.x-cX;mouseY=nearE.y-cY}
haptic(15)}

if(w.t==='r'){sfx('bow');for(let i=0;i<P.pc;i++){const sp=P.pc>1?(i-(P.pc-1)/2)*.15:0;
const aimX=mouseX+cX,aimY=mouseY+cY;const aimA=Math.atan2(aimY-P.y,aimX-P.x);P.dir=aimA;
const a=aimA+sp;
projs.push({x:P.x+Math.cos(a)*10,y:P.y+Math.sin(a)*10,vx:Math.cos(a)*(w.ps||4.5),vy:Math.sin(a)*(w.ps||4.5),
dmg:wD()*dmgMult,life:65,color:w.c||'#ffcc44',size:3,enemy:0,burn:w.burn,freeze:w.freeze,poison:w.poison})}}
else{// v5.1 weapon-type-specific SFX
const wn=w.name||'';
if(wn.includes('AXE')||wn.includes('MACE'))sfx(cStep===2?'smash':'atk',1,P.x);
else if(wn.includes('DAGGER')||wn.includes('RAPIER'))sfx(cStep===2?'combo_finish':'dash',0.7,P.x);
else if(wn.includes('SCYTHE'))sfx(cStep===2?'crit':'kill',0.8,P.x);
else if(wn.includes('FLAME')||wn.includes('FIRE'))sfx(cStep===2?'crit':'atk',1,P.x);
else if(wn.includes('VOID')||wn.includes('CELESTIAL'))sfx(cStep===2?'special':'atk',0.9,P.x);
else sfx(cStep===2?'crit':'atk',1,P.x);
// v5 combo finisher (3rd hit): shockwave + wider trail + distinct sound
if(cStep===2){sfx('combo_finish');
if(finisherType==='thrust'){addShockwave(P.x+Math.cos(P.dir)*30,P.y+Math.sin(P.dir)*30,40,w.c||'#ff8844',12);shk=Math.min(shk+6,20);camZoom=1.04;camZoomT=8;
emitDir(P.x,P.y,10,w.c||'#ff8844',P.dir,0.3,3,16,3)}
else if(finisherType==='sweep'){addShockwave(P.x,P.y,80,w.c||'#44ccff',14);shk=Math.min(shk+5,18);camZoom=1.03;camZoomT=6;
emitRing(P.x,P.y,15,w.c||'#44ccff',3,20,2)}
else if(finisherType==='slam'){addShockwave(P.x,P.y,70,w.c||'#ffcc00',12);addShockwave(P.x,P.y,40,'#ffffff',8);shk=Math.min(shk+7,20);camZoom=1.05;camZoomT=8;
emit(P.x,P.y,12,w.c||'#ffcc00',3,14,2)}
else{addShockwave(P.x,P.y,60,w.c||'#c8a0ff',10);shk=Math.min(shk+4,15);camZoom=1.02;camZoomT=6}}
const sorted=[...ents].sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y));
let hN=0;const hits=w.hits||1;
// v10 Finisher hit detection: different range/cone per type
const finRange=cStep===2?(finisherType==='thrust'?wR()*1.5:finisherType==='sweep'?wR()*1.1:finisherType==='slam'?wR()*1.3:wR()):wR();
const finMaxHits=cStep===2&&(finisherType==='sweep'||finisherType==='slam')?99:P.prc;
for(let h=0;h<hits;h++){for(const e of sorted){if(e.animState==='spawn'&&!e.spawnDone)continue;
const eDist=Math.hypot(e.x-P.x,e.y-P.y);
if(eDist<finRange+Math.max(e.hw,e.hh)){
// Thrust: narrow cone check
if(cStep===2&&finisherType==='thrust'){const eA=Math.atan2(e.y-P.y,e.x-P.x);let dA=eA-P.dir;while(dA>Math.PI)dA-=Math.PI*2;while(dA<-Math.PI)dA+=Math.PI*2;
if(Math.abs(dA)>Math.PI/6)continue}// skip if outside narrow cone
P.dir=Math.atan2(e.y-P.y,e.x-P.x);let dmg=wD()*dmgMult;
// Thrust: heavy knockback
if(cStep===2&&finisherType==='thrust'){const kb=12;e.vx=(e.vx||0)+Math.cos(P.dir)*kb;e.vy=(e.vy||0)+Math.sin(P.dir)*kb}
if(P.executioner&&e.hp<e.mhp*.2)dmg*=3;
const crit=Math.random()<P.cc;if(crit){dmg=Math.floor(dmg*(2.2+P.critDmgMult-1));sfx('crit');
if(P.bloodletter)applyStatus(e,'bleed',180)}// v10 bloodletter: crits cause bleed
hrtE(e,dmg,crit,P.dir);
if(P.chainLightning&&ents.length>1){const near=ents.find(oe=>oe!==e&&oe.animState!=='die'&&Math.hypot(oe.x-e.x,oe.y-e.y)<80);
if(near){hrtE(near,dmg*0.3,false,Math.atan2(near.y-e.y,near.x-e.x));emit(e.x,e.y,3,'#ffdd44',2,8,1.5)}}// v10 chain lightning
// Slam: brief stun + weapon element
if(cStep===2&&finisherType==='slam'){e.frozen=Math.max(e.frozen||0,20);if(w.burn)applyStatus(e,'burn',60);if(w.freeze)applyStatus(e,'freeze',60);if(w.poison)applyStatus(e,'poison',60)}
if(w.burn||P.relic&&P.relic.name==='EMBER HEART')applyStatus(e,'burn',50);if(w.freeze)applyStatus(e,'freeze',40);if(w.poison)applyStatus(e,'poison',60);
if(P.burnChance>0&&Math.random()<P.burnChance)applyStatus(e,'burn',50);
if(P.elemStorm){const statuses=['burn','freeze','poison','bleed'];applyStatus(e,statuses[Math.floor(Math.random()*statuses.length)],50)}
if(P.echoStrike&&Math.random()<0.2&&e.hp>0){setTimeout(()=>{if(e.hp>0&&gSt==='playing'){hrtE(e,dmg*0.5,false,P.dir);emit(e.x,e.y,4,'#88ccff',2,10,1.5)}},120)}
hN++;if(hN>finMaxHits&&h===0)break}}}
// v6.0 Chronomancer time dilation passive
if(P.timeDilation&&hN>0){P.timeDilationCount=(P.timeDilationCount||0)+hN;
if(P.timeDilationCount>=5){P.timeDilationCount=0;
for(const e2 of ents){if(Math.hypot(e2.x-P.x,e2.y-P.y)<120){applyStatus(e2,'slow',40);emit(e2.x,e2.y,3,'#00ccff',1,8,1)}}
emit(P.x,P.y,8,'#00ccff',2,12,1.5);sfx('freeze',0.5)}}
for(let i=props.length-1;i>=0;i--){const pr=props[i];if(Math.hypot(pr.x-P.x,pr.y-P.y)<wR()+16){pr.hp-=wD();if(pr.hp<=0){sfx('smash');
emit(pr.x,pr.y,12,'#aa8855',2.5,14,1.5);
if(pr.type==='explosive'){emit(pr.x,pr.y,20,'#ff6633',4,18,2.5);shk=8;addDynLight(pr.x,pr.y,120,'#ff6633',1.5,0,10);
if(scorchMarks.length<40)scorchMarks.push({x:pr.x,y:pr.y,r:12+Math.random()*8,color:'rgba(30,15,5,0.8)',a:0.3});
for(const e of ents){if(Math.hypot(e.x-pr.x,e.y-pr.y)<TS*2){hrtE(e,5,false,Math.atan2(e.y-pr.y,e.x-pr.x))}}}
else if(pr.type==='toxic'){// v6.1 toxic barrel — poison cloud
emit(pr.x,pr.y,24,'#66ff44',3,22,2.5);addShockwave(pr.x,pr.y,50,'#66ff44',10);shk=5;
addDynLight(pr.x,pr.y,100,'#66ff44',1.2,0,12);
for(let tp=0;tp<20;tp++){const ta=Math.random()*Math.PI*2,td=Math.random()*30;
parts.push({x:pr.x+Math.cos(ta)*td,y:pr.y+Math.sin(ta)*td,vx:(Math.random()-.5)*.4,vy:-.3-Math.random()*.3,life:40+Math.random()*20,ml:60,color:'rgba(102,255,68,0.4)',size:3+Math.random()*3,shape:'circle',grav:-0.01})}
for(const e of ents){if(Math.hypot(e.x-pr.x,e.y-pr.y)<TS*2.5){applyStatus(e,'poison',80);ft(e.x,e.y-14,'POISONED','#66ff44')}}}
else if(pr.type==='ice'){// v6.1 ice crystal — freeze burst
for(let ic=0;ic<16;ic++){const ia=Math.PI*2/16*ic;
parts.push({x:pr.x,y:pr.y,vx:Math.cos(ia)*2.5,vy:Math.sin(ia)*2.5,life:20+Math.random()*8,ml:28,color:Math.random()>.5?'#88ccff':'#aaddff',size:2+Math.random()*2,shape:'diamond',grav:0.04})}
addShockwave(pr.x,pr.y,45,'#88ccff',10);shk=4;flash('#88ccff',.06);
addDynLight(pr.x,pr.y,80,'#88ccff',1,0,10);sfx('freeze');
for(const e of ents){if(Math.hypot(e.x-pr.x,e.y-pr.y)<TS*2){e.frozen=Math.max(e.frozen||0,60);ft(e.x,e.y-14,'FROZEN','#88ccff')}}}
else{if(Math.random()<.4)picks.push({x:pr.x,y:pr.y,type:'gold',val:3+~~(Math.random()*6),life:350,vy:-1,vx:(Math.random()-.5)*2});
if(Math.random()<.12&&P.hp<P.mhp)picks.push({x:pr.x,y:pr.y,type:'heal',val:1,life:350,vy:-1})}
props.splice(i,1)}}}
// v9.0 Weapon-type-specific attack visuals
const arcSize=[.8,.9,1.2][cStep];const wn2=w.name||'';
if(wn2.includes('AXE')||wn2.includes('MACE')||wn2.includes('HAMMER')){// Heavy slam — wide arc + ground crack on finisher
const heavyArc=arcSize*1.4;for(let i=0;i<7;i++){const a=P.dir-heavyArc+heavyArc*2*(i/6);const d=wR()*.5+i*4;
addTrailPoint(P.x+Math.cos(a)*d,P.y+Math.sin(a)*d,a,w.c||'#cc8844')}
if(cStep===2){const ix=P.x+Math.cos(P.dir)*wR()*.7,iy=P.y+Math.sin(P.dir)*wR()*.7;
for(let cr=0;cr<5;cr++){const ca=P.dir+(Math.random()-.5)*1.2;
parts.push({x:ix,y:iy,vx:Math.cos(ca)*0.3,vy:Math.sin(ca)*0.3,life:18,ml:18,color:'#aa8866',size:10+Math.random()*15,shape:'slash',slashDir:ca,lineW:1.5})}
emit(ix,iy,8,'#ddaa66',3,12,2)}}
else if(wn2.includes('DAGGER')||wn2.includes('RAPIER')||wn2.includes('KNIFE')){// Rapid stabs + speed lines
const stabDir=cStep%2===0?P.dir+0.15:P.dir-0.15;
for(let i=0;i<4;i++){const d=wR()*(.3+i*.2);addTrailPoint(P.x+Math.cos(stabDir)*d,P.y+Math.sin(stabDir)*d,stabDir,w.c||'#ffffff')}
for(let sl=0;sl<3;sl++){const sa=P.dir+Math.PI+(Math.random()-.5)*.4;
parts.push({x:P.x+Math.cos(sa)*5,y:P.y+Math.sin(sa)*5,vx:Math.cos(sa)*2,vy:Math.sin(sa)*2,life:5,ml:5,color:'#ffffff',size:12+Math.random()*8,shape:'speedline',slashDir:sa,lineW:1})}}
else if(wn2.includes('SCYTHE')){// Wide sweep with afterglow
const scyArc=arcSize*1.6;for(let i=0;i<9;i++){const a=P.dir-scyArc+scyArc*2*(i/8);const d=wR()*.4+i*3.5;
addTrailPoint(P.x+Math.cos(a)*d,P.y+Math.sin(a)*d,a,w.c||'#ff44aa')}
for(let i=0;i<5;i++){const a=P.dir-scyArc+scyArc*2*(i/4);const d=wR()*.7;
emit(P.x+Math.cos(a)*d,P.y+Math.sin(a)*d,1,w.c||'#ff44aa',1.5,14,2,'circle')}}
else if(wn2.includes('FLAME')||wn2.includes('FIRE')||wn2.includes('EMBER')){// Fire sweep
for(let i=0;i<6;i++){const a=P.dir-arcSize+arcSize*2*(i/5);const d=wR()*.5+i*3;
addTrailPoint(P.x+Math.cos(a)*d,P.y+Math.sin(a)*d,a,'#ff6633')}
for(let f=0;f<5;f++){const a=P.dir+(Math.random()-.5)*arcSize*2;const d=wR()*(.3+Math.random()*.5);
parts.push({x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d,vx:Math.cos(a)+Math.random(),vy:-1.5-Math.random()*2,
life:14,ml:14,color:Math.random()>.5?'#ff6633':'#ffaa22',size:2+Math.random()*2,shape:'circle',grav:-0.02})}}
else if(wn2.includes('VOID')||wn2.includes('CELESTIAL')){// Void energy arc
for(let i=0;i<6;i++){const a=P.dir-arcSize+arcSize*2*(i/5);const d=wR()*.5+i*3;
addTrailPoint(P.x+Math.cos(a)*d,P.y+Math.sin(a)*d,a,'#bb66ff')}
if(cStep===2)emitRing(P.x+Math.cos(P.dir)*wR()*.5,P.y+Math.sin(P.dir)*wR()*.5,8,'#bb66ff',2,12,1.5)}
else{// Default slash trail
for(let i=0;i<5;i++){const a=P.dir-arcSize+arcSize*2*(i/4);const d=wR()*.6+i*3;
addTrailPoint(P.x+Math.cos(a)*d,P.y+Math.sin(a)*d,a,w.c||'rgba(200,170,255,0.6)')}}
const swingColors=[w.c||'rgba(200,170,255,0.6)',w.c||'rgba(200,170,255,0.4)'];
for(let i=0;i<7;i++){const a=P.dir+(Math.random()-.5)*(cStep===2?1.6:1),d=wR()*(.4+Math.random()*.6);
emit(P.x+Math.cos(a)*d,P.y+Math.sin(a)*d,1,swingColors[i%2],1.2,9,1.5+cStep*.3)}}
// v7.0 Echo Amulet: every 5th attack fires ghost copy (v9.0: 60-frame cooldown cap)
if(P.echoAmulet){P.echoCount++;if(!P.echoCd)P.echoCd=0;
if(P.echoCount%5===0&&fr-P.echoCd>=60){P.echoCd=fr;
const ga=P.dir;projs.push({x:P.x+Math.cos(ga)*10,y:P.y+Math.sin(ga)*10,vx:Math.cos(ga)*3.5,vy:Math.sin(ga)*3.5,
dmg:wD()*0.5,life:50,color:'rgba(180,160,255,0.6)',size:4,enemy:0,pierce:1});
emit(P.x,P.y,6,'#c8a0ff',2,10,1.5);ft(P.x,P.y-20,'ECHO','#c8a0ff')}}
// v7.0 Chaos Gem: random status on attack hit — v9.0 visual indicator
if(P.chaosGem&&w.t==='m'){for(const e of ents){if(e.animState!=='die'&&Math.hypot(e.x-P.x,e.y-P.y)<wR()+Math.max(e.hw,e.hh)){
const chaosStatuses=['burn','freeze','poison','bleed','slow'];
const chaosColors={'burn':'#ff6633','freeze':'#88ccff','poison':'#66ff44','bleed':'#ff3366','slow':'#aa88cc'};
if(Math.random()<0.25){const cs=chaosStatuses[Math.floor(Math.random()*chaosStatuses.length)];
applyStatus(e,cs,50);P._chaosAuraColor=chaosColors[cs];P._chaosAuraT=20}break}}}}

/* ═══════════════════════════════════════════════════
   HURT / KILL — v5 per-entity hit-stop, multi-kill, status combos
   ═══════════════════════════════════════════════════ */
function hrtE(e,dmg,crit,dir){
if(e.animState==='spawn'&&!e.spawnDone)return;
// Void Heart final boss: invulnerable while crystals exist in phase 3
if(e._shielded){ft(e.x,e.y-20,'SHIELDED','#88aacc');sfx('shield');emit(e.x,e.y,4,'#88aacc',1.5,8,1.5);return}
// v6 Stagger bonus: 1.5x damage to staggered bosses
if(e.type==='boss'&&e.staggered)dmg*=1.5;
// v10.0 Class passives: damage modifiers
if(P.voidMark&&e._voidMarked){dmg*=1.25;emit(e.x,e.y,3,'#c8a0ff',1.5,8,1)}
if(P.backstab){const behindAngle=Math.atan2(P.y-e.y,P.x-e.x);const eDirNorm=((e.dir||0)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
const behindNorm=(behindAngle%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
if(Math.abs(eDirNorm-behindNorm)<Math.PI*0.4){dmg*=2;ft(e.x,e.y-26,'BACKSTAB','#44ddaa',1);emit(e.x,e.y,6,'#44ddaa',2,10,1.5)}}
if(P.timeVulnerable&&(e.frozen>0||e.slow>0)){dmg*=1.25;emit(e.x,e.y,3,'#00ccff',1,6,1)}
// v6.0 Execution: enemies below 15% HP take 5x damage (voidReaper: +10%)
const execThresh=P.voidReaper?0.25:0.15;
if(e.hp>0&&e.hp<e.mhp*execThresh&&e.type!=='boss'){dmg*=5;crit=true;
ft(e.x,e.y-28,'EXECUTE','#ff2244',1);sfx('crit');flash('#ff2244',.06);chromAb=Math.max(chromAb,3);
executionSlowT=8;abCh=Math.min(abMax,abCh+10)}
// Knight frontal block: halve damage from the front
if(e.type==='knight'&&e.blocking){const angleDiff=Math.abs(((dir-e.blockDir+Math.PI*3)%(Math.PI*2))-Math.PI);
if(angleDiff>Math.PI*0.5){dmg*=0.3;ft(e.x,e.y-14,'BLOCKED','#aabbcc');emit(e.x,e.y,4,'#ffffff',1.5,8,1.5);sfx('shield')}}
if(e.shield>0){const absorbed=Math.min(e.shield,dmg);e.shield-=absorbed;dmg-=absorbed;
emit(e.x,e.y,4,'#44ddff',2,10,1.5);if(dmg<=0){ft(e.x,e.y-14,'SHIELD','#44ddff');sfx('shield');return}}
dmg=Math.max(.5,dmg-(e.armor||0));
// v10.0 Champion REFLECTOR: reflect projectile on hit
if(e.champion&&e.champAura&&e.champAura.onHit)e.champAura.onHit(e);
e.hp-=dmg;e.inv=5;e.fl=7;const kb=crit?8:4.5;e.vx+=Math.cos(dir)*kb;e.vy+=Math.sin(dir)*kb;
// v6.1 damage-scaled hit freeze + directional camera punch
// v8.0 CRANKED hit feedback
const hitMag=Math.min(10,Math.floor(dmg/2.5));
e.hitStop=crit?Math.max(7,hitMag+3):Math.max(4,hitMag+1);P.hitStop=crit?Math.max(5,hitMag+2):Math.max(3,hitMag);
const punchMag=crit?10:5;camPunchX+=Math.cos(dir)*punchMag;camPunchY+=Math.sin(dir)*punchMag;
e.stretchDir=dir;e.stretchT=crit?8:5;
// Bigger particles with glow
emit(e.x,e.y,crit?18:10,crit?'#ffcc00':e.color,4,20,crit?5:3);
// Screen flash on ALL hits
flash(crit?'#ffcc00':'#ffffff',crit?0.08:0.03);
// Impact shockwave on every hit
addShockwave(e.x,e.y,20+dmg*2,crit?'#ffcc00':'#fff',6);
// v8 directional hit sparks — bigger
for(let sp=0;sp<(crit?8:4);sp++){const sa=dir+(Math.random()-.5)*.8;const sSpd=2.5+Math.random()*3.5;
parts.push({x:e.x,y:e.y,vx:Math.cos(sa)*sSpd,vy:Math.sin(sa)*sSpd,life:10+Math.random()*8,ml:18,color:crit?'#ffee44':'#ffffff',size:crit?4:2.5,shape:crit?(Math.random()>0.3?'star':'circle'):(Math.random()>0.5?'circle':'rect')})}
// v8 VFX slash line on crits
if(crit){const slLen=20+dmg*2;const slA=dir+Math.PI/2;
parts.push({x:e.x-Math.cos(slA)*slLen/2,y:e.y-Math.sin(slA)*slLen/2,vx:Math.cos(dir)*0.5,vy:Math.sin(dir)*0.5,life:6,ml:6,color:'#ffffff',size:slLen,shape:'slash',slashDir:slA})}
// v6 screen warp on big hits (8+ damage) — lowered threshold
if(dmg>=8){chromAb=Math.max(chromAb,dmg*0.4);shk=Math.max(shk,dmg*1.8);if(typeof camZoom!=='undefined')camZoom=1+dmg*0.004}
// v5.1 weapon-type-specific hit effects
const wn=P.w?.name||'';
if(wn.includes('AXE')||wn.includes('MACE')){shk=Math.min(25,dmg*1.6+(crit?8:0));addShockwave(e.x,e.y,30,'#cc8844',6)}
else if(wn.includes('DAGGER')||wn.includes('RAPIER')){for(let s=0;s<3;s++){const sa=dir+(Math.random()-.5)*.6;emitDir(e.x,e.y,2,'#ffffff',sa,.2,4,6,1)}}
else if(wn.includes('SCYTHE')){emit(e.x,e.y,3,'#ff44aa',2,16,1.5,'circle')}
else if(wn.includes('VOID')){emitRing(e.x,e.y,6,'#bb66ff',2,10,1)}
// v9.0 Manga-style directional speed lines on ALL hits
const slN=crit?8:4;for(let sl=0;sl<slN;sl++){const slA=dir+(Math.random()-.5)*(crit?.6:.4);
parts.push({x:e.x+Math.cos(slA)*8,y:e.y+Math.sin(slA)*8,vx:Math.cos(slA)*3,vy:Math.sin(slA)*3,
life:crit?8:5,ml:crit?8:5,color:crit?'#ffee88':'#ffffff',size:15+Math.random()*20,shape:'speedline',slashDir:slA,lineW:crit?2:1.2})}
// v9.0 CRITICAL! text with cross-slash
if(crit&&dmg>=3){ft(e.x,e.y-30,'CRITICAL!','#ffcc00',1.8);
const xLen=25+dmg*2;parts.push({x:e.x,y:e.y,vx:0,vy:0,life:8,ml:8,color:'#ffee44',size:xLen,shape:'slash',slashDir:dir+Math.PI/4,lineW:3});
parts.push({x:e.x,y:e.y,vx:0,vy:0,life:8,ml:8,color:'#ffee44',size:xLen,shape:'slash',slashDir:dir-Math.PI/4,lineW:3})}
// v9.0 Elemental hit sparks for status weapons
if(P.w){if(P.w.burn||P.burnChance>0){for(let f=0;f<3;f++)parts.push({x:e.x+(Math.random()-.5)*10,y:e.y,
vx:(Math.random()-.5)*1.5,vy:-1.5-Math.random()*2,life:12+Math.random()*8,ml:20,
color:Math.random()>.5?'#ff6633':'#ffaa22',size:2+Math.random()*2,shape:'circle',grav:-0.03})}
if(P.w.freeze){for(let ic=0;ic<4;ic++){const ia=Math.random()*Math.PI*2;
parts.push({x:e.x+Math.cos(ia)*8,y:e.y+Math.sin(ia)*8,vx:Math.cos(ia)*1.5,vy:Math.sin(ia)*1.5,
life:12,ml:12,color:'#88ccff',size:2+Math.random()*2,shape:'diamond',grav:0.04})}}
if(P.w.poison){emit(e.x,e.y,crit?4:2,'#66ff44',1.5,12,1.5,'circle')}}
// v8.0 Ground slam passive (Worldsplitter)
if(P.w&&P.w.evoPassive==='groundslam'&&crit){addShockwave(e.x,e.y,60,'#ff8800',10);
for(const oe of ents){if(oe!==e&&oe.animState!=='die'&&Math.hypot(oe.x-e.x,oe.y-e.y)<60){hrtE(oe,P.bd*0.3,false,Math.atan2(oe.y-e.y,oe.x-e.x))}}}
// v5 enhanced damage numbers: color-coded — v7.1 scaled with damage
const dmgCol=crit?'#ffcc00':'#fff';
const dmgBig=dmg>=5?Math.min(2.4,1+(dmg*0.12)):crit?1:0;
ft(e.x,e.y-16,crit?`${Math.floor(dmg)}!`:`${Math.floor(dmg)}`,dmgCol,dmgBig||crit);
if(crit){flash('#ffcc00',.04);addDynLight(e.x,e.y,60,'#ffcc00',0.8,0,5);chromAb=Math.max(chromAb,1.5)}
// v5 scaled screen shake
shk=Math.min(25,dmg*1.2+(crit?5:0));shkAngle=dir;
sfxL('hit',e.x);
tDmg+=dmg;P.totalDmg+=dmg;P.highestHit=Math.max(P.highestHit,Math.floor(dmg));
if(e.vamp&&e.hp>0){e.hp=Math.min(e.mhp,e.hp+dmg*.3);emit(e.x,e.y,3,'#ff4466',1,10,1)}
// v6 boss stagger accumulation
if(e.type==='boss'&&!e.staggered&&e.staggerCd<=0){e.staggerDmg+=dmg;e.staggerTimer=180;
if(e.staggerDmg>=e.staggerThresh){e.staggered=true;e.staggerDmg=0;e.frozen=60;e.staggerCd=300;
flash('#ffffff',.2);shk=15;chromAb=5;addShockwave(e.x,e.y,100,'#ffffff',16);
emit(e.x,e.y,24,'#ffffff',5,24,3);ft(e.x,e.y-30,'STAGGERED!','#ffffff',1);sfx('shatter');
msg('BOSS STAGGERED!',800);triggerAchievement('stagger_boss')}}
// v5 status combo check
checkStatusCombo(e,crit);
// Blood Crown relic: kills heal 2 HP (checked in killE)
}

function killE(e,i){const isLast=ents.length===1;
// v10.0 Champion aura death trigger
if(e.champion&&e.champAura&&e.champAura.onDeath)e.champAura.onDeath(e);
// v10.0 Combustion: burning enemies explode on death
if(P.combustion&&e.burn>0){const cR=50;addShockwave(e.x,e.y,cR,'#ff6633',12);emit(e.x,e.y,16,'#ff4400',4,16,2.5);
ft(e.x,e.y-20,'COMBUSTION','#ff6633',1);sfx('smash');
for(const oe of ents){if(oe!==e&&oe.animState!=='die'&&Math.hypot(oe.x-e.x,oe.y-e.y)<cR){
hrtE(oe,P.bd*0.6+3,false,Math.atan2(oe.y-e.y,oe.x-e.x));applyStatus(oe,'burn',50)}}}
// v10.0 Kill Dash: kills during dash reset dash CD
if(P.killDash&&P.dashing){P.dCd=0;ft(P.x,P.y-26,'KILL DASH','#44ddaa',1);emit(P.x,P.y,6,'#44ddaa',2,10,1.5)}
// v5 death animation instead of instant removal
e.animState='die';e.animFrame=0;e.animTimer=0;
typedDeathBurst(e);sfxL('kill',e.x);kills++;addCmb();
// v10 Corruption: rises on kills, especially elite/overkill
addCorruption(e.elite?3:e.isMini?2:0.5);if(e.hp<-e.mhp*0.3)addCorruption(1);
// v10 perk effects on kill
if(P.voidSiphon){const healAmt=Math.ceil(P.mhp*0.01);P.hp=Math.min(P.mhp,P.hp+healAmt)}
if(P.luckyGold&&Math.random()<0.1){gold+=e.gold;ft(e.x,e.y-8,'DOUBLE GOLD!','#ffcc00')}
// v10 Narrative whisper triggers
if(kills===1)tryWhisper('firstKill');tryWhisper('kills50',kills);tryWhisper('kills100',kills);
if(e.type==='boss'){tryWhisper('firstBoss');if(flr>=16)tryWhisper('finalBoss')}
// v9.0 codex tracking
if(e.type==='boss')recordBossKill(e.bossName||'UNKNOWN');else recordEnemyKill(e.type);
// v8.0 Weapon evolution kill tracking
weaponKillCount++;checkWeaponEvolution();
// v8.0 Evolved weapon passive abilities on kill
if(P.w&&P.w.evoPassive){const ep=P.w.evoPassive;
if(ep==='chainlightning'){// Chain lightning: damage 2 nearest enemies
const nearby=ents.filter(oe=>oe!==e&&oe.animState!=='die'&&Math.hypot(oe.x-e.x,oe.y-e.y)<120).slice(0,2);
for(const ne of nearby){hrtE(ne,P.bd*0.5,false,Math.atan2(ne.y-e.y,ne.x-e.x));
ct&&parts.push({x:e.x,y:e.y,vx:(ne.x-e.x)*0.1,vy:(ne.y-e.y)*0.1,life:6,ml:6,color:'#4488ff',size:2,shape:'circle'});
emit(ne.x,ne.y,4,'#4488ff',2,10,1.5)}}
else if(ep==='phaseshift'){P.inv=Math.max(P.inv,30);P.alpha=0.3;setTimeout(()=>{P.alpha=1},500);emit(P.x,P.y,8,'#aa22ff',2,15,2,'circle')}
else if(ep==='homing'){/* Homing handled in projectile update */}}
// v7.0 Meta-progression: earn Void Essence from kills
{const essAmt=e.type==='boss'?15:e.isMini?8:e.elite?3:1;addEssence(essAmt)}
// v6.0 Combo Finisher: spectacular effects at combo thresholds
if(cmb>=10&&cmb%10===0){comboFinisherReady=true;
const tier=cmb>=30?3:cmb>=20?2:1;const finCol=tier>=3?'#ffffff':tier>=2?'#ff4400':'#ffcc00';
// AOE damage at tier 2+
if(tier>=2){for(const oe of ents){if(oe!==e&&oe.animState!=='die'&&Math.hypot(oe.x-e.x,oe.y-e.y)<(tier>=3?120:80)){
hrtE(oe,3+P.bd*tier,false,Math.atan2(oe.y-e.y,oe.x-e.x));emit(oe.x,oe.y,6,finCol,2,12,1.5)}}}
// Heal at tier 3
if(tier>=3){P.hp=Math.min(P.mhp,P.hp+2);P.inv=Math.max(P.inv,45);ft(P.x,P.y-30,'+2 HP','#44ff66',1)}
// Visual explosion
emitRing(e.x,e.y,32,finCol,6,28,3);addShockwave(e.x,e.y,150,finCol,22);addShockwave(e.x,e.y,80,'#ffffff',14);
for(let s=0;s<40;s++){const a=Math.random()*Math.PI*2;const spd=3+Math.random()*5;
parts.push({x:e.x,y:e.y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd-2,life:25+Math.random()*15,ml:40,color:Math.random()>.3?finCol:'#ffffff',size:2+Math.random()*3,shape:Math.random()>.5?'star':'circle',grav:0.08})}
streak(`COMBO FINISHER x${cmb}`,finCol);sfx('synergy');flash(finCol,.2);shk=20;chromAb=6;slMo=Math.max(slMo,30);camZoom=1.08;camZoomT=20;
addDynLight(e.x,e.y,200,finCol,2,0,25)}
// v6.1 overkill detection
const overkillRatio=Math.abs(e.hp)/e.mhp;
if(overkillRatio>0.5){emit(e.x,e.y,30,'#ffffff',6,22,3);addShockwave(e.x,e.y,80,e.color,14);
shk=Math.min(20,shk+6);chromAb=Math.min(5,chromAb+2);ft(e.x,e.y-28,'OVERKILL','#ffffff',1);
if(overkillRatio>1.5){ft(e.x,e.y-38,'OBLITERATED','#ff4444',1);flash('#ffffff',.08);addShockwave(e.x,e.y,120,'#ffffff',18)}}
// v7.0 Enhanced elite kill explosion
if(e.elite){addShockwave(e.x,e.y,100,e.eCol,16);addShockwave(e.x,e.y,60,'#ffffff',10);
emitRing(e.x,e.y,24,e.eCol,5,20,3);flash(e.eCol,.08);shk=Math.min(18,shk+8);chromAb=Math.min(4,chromAb+2);
addDynLight(e.x,e.y,120,e.eCol,1.5,0,15);ft(e.x,e.y-32,'ELITE SLAIN',e.eCol,1);
// v7.0 extra elite particles
for(let ep=0;ep<20;ep++){const ea=Math.random()*Math.PI*2,espd=1.5+Math.random()*4;
parts.push({x:e.x,y:e.y,vx:Math.cos(ea)*espd,vy:Math.sin(ea)*espd-1,life:25+Math.random()*20,ml:45,color:Math.random()>.5?e.eCol:'#ffffff',size:1.5+Math.random()*2.5,shape:Math.random()>.6?'star':'circle',grav:0.05})}
camZoom=Math.max(camZoom,1.03);camZoomT=Math.max(camZoomT,8)}
// v7.0 Enhanced mini-boss death
if(e.isMini){
for(let mp=0;mp<40;mp++){const ma=Math.random()*Math.PI*2,mspd=2+Math.random()*5;
parts.push({x:e.x,y:e.y,vx:Math.cos(ma)*mspd,vy:Math.sin(ma)*mspd-1.5,life:35+Math.random()*25,ml:60,color:Math.random()>.4?e.color:'#ffffff',size:2+Math.random()*3,shape:Math.random()>.5?'star':'circle',grav:0.06})}
addShockwave(e.x,e.y,120,e.color,20);addShockwave(e.x,e.y,70,'#ffffff',14);
camZoom=1.06;camZoomT=18;chromAb=4;shk=Math.min(22,shk+10);
addDynLight(e.x,e.y,180,e.color,2,0,25);
// Body shatters into fragments
for(let bf=0;bf<12;bf++){const fa=Math.PI*2/12*bf,fspd=1.5+Math.random()*3;
parts.push({x:e.x+Math.cos(fa)*e.hw,y:e.y+Math.sin(fa)*e.hh,vx:Math.cos(fa)*fspd,vy:Math.sin(fa)*fspd-1,life:40+Math.random()*20,ml:60,color:e.color,size:3+Math.random()*3,shape:'rect',grav:0.1})}
ft(e.x,e.y-32,'MINI-BOSS SLAIN','#ffcc00',1)}
// v6.1 kill chain tracking
if(multiKillN>=1){const dx=e.x-lastKillX,dy=e.y-lastKillY;const chainDist=Math.hypot(dx,dy);
if(chainDist>10&&chainDist<300)for(let c=0;c<6;c++){const t=c/6;
parts.push({x:lastKillX+dx*t,y:lastKillY+dy*t,vx:(Math.random()-.5)*1.5,vy:(Math.random()-.5)*1.5-1,life:12,ml:12,color:'#ffcc44',size:1.5,shape:'circle'})}}
lastKillX=e.x;lastKillY=e.y;
// v5 multi-kill tracking with v6.1 visual escalation
multiKillT=20;multiKillN++;
if(multiKillN===2){streak('DOUBLE KILL','#ff8800');sfx('multikill');slMo=Math.max(slMo,12);addShockwave(P.x,P.y,60,'#ff8800',10);chromAb=Math.min(4,chromAb+1.5)}
else if(multiKillN===3){streak('TRIPLE KILL','#ff4400');sfx('multikill');slMo=Math.max(slMo,18);addShockwave(P.x,P.y,90,'#ff4400',14);chromAb=Math.min(5,chromAb+2);camZoom=1.04;camZoomT=10}
else if(multiKillN>=4){streak('MULTI KILL x'+multiKillN,'#ff0044');sfx('multikill');slMo=Math.max(slMo,22);addShockwave(P.x,P.y,120,'#ff0044',18);chromAb=Math.min(6,chromAb+3);camZoom=1.06;camZoomT=14;flash('#ff0044',.08)}
// v7.0 Kill cascade escalation
if(multiKillN>=10){ft(P.x,P.y-40,'GODLIKE!','#ff00ff',2);flash('#ff00ff',.3);chromAb=8;slMo=20;
for(let gp=0;gp<30;gp++){parts.push({x:Math.random()*RPX,y:0,vx:(Math.random()-.5)*2,vy:1+Math.random()*3,life:90,ml:90,color:P.classColor,size:2+Math.random()*2,shape:'star'})}}
else if(multiKillN>=8){ft(P.x,P.y-40,'ANNIHILATION!','#ff4444',1.8);flash('#ff4444',.25);addShockwave(P.x,P.y,120,'#ff4444',20);camZoom=1.06;camZoomT=15;chromAb=5}
else if(multiKillN>=5){ft(P.x,P.y-40,'MASSACRE!','#ffaa00',1.5);flash('#ffaa00',.2);slMo=15}
const roomKillsBefore=kills;
const xpG=Math.floor(e.xp*cmbM*(P.xpMult||1));P.xp+=xpG;if(P.ls>0)P.hp=Math.min(P.mhp,P.hp+P.ls);
if(P.w)addWeaponMasteryXP(P.w.name);
// v6.1 XP bar flash on gain
if(xpG>0){const xpEl=document.getElementById('xp-bar');if(xpEl){xpEl.style.boxShadow='0 0 12px rgba(123,47,247,0.8),0 0 24px rgba(196,113,245,0.4)';setTimeout(()=>{xpEl.style.boxShadow=''},200)}}
if(P.killsHeal)P.hp=Math.min(P.mhp,P.hp+1);
if(P.warlord&&P.bT>0)P.bT=Math.min(300,P.bT+30);
// Blood Crown relic
if(P.relic&&P.relic.name==='BLOOD CROWN')P.hp=Math.min(P.mhp,P.hp+2);
// Phantom Cloak relic counter
if(P.relic&&P.relic.name==='PHANTOM CLOAK')P.phantomCount++;
// v7.0 Vampiric Fang: kills below 30% HP heal 2
if(P.vampFang&&P.hp<P.mhp*0.3){P.hp=Math.min(P.mhp,P.hp+2);ft(P.x,P.y-20,'+2','#ff3366');emit(P.x,P.y,6,'#ff3366',2,12,1.5)}
// v7.0 Gravity Lens: pickups magnetize on kill
if(P.gravLens){for(const pk of picks){const pa=Math.atan2(P.y-pk.y,P.x-pk.x);pk.vx+=Math.cos(pa)*3;pk.vy+=Math.sin(pa)*3}}
abCh=Math.min(abMax,abCh+15+(e.elite?20:0)+(e.isMini?30:0));
if(e.splits&&e.type!=='boss'){for(let s=0;s<2;s++){const ne=mkE(e.type,e.x+(Math.random()-.5)*24,e.y+(Math.random()-.5)*24);
ne.hp=~~(ne.mhp*.35);ne.mhp=ne.hp;ne.hw*=.65;ne.hh*=.65;ne.xp=~~(ne.xp*.4);ne.gold=~~(ne.gold*.4);ents.push(ne)}}
if(e.gold>0){const ga=Math.floor(e.gold*cmbM*(P.goldMult||1));const n=Math.min(8,Math.ceil(ga/4));
for(let j=0;j<n;j++)picks.push({x:e.x+(Math.random()-.5)*20,y:e.y+(Math.random()-.5)*20,type:'gold',val:Math.ceil(ga/n),life:380,vy:-(Math.random()+.5),vx:(Math.random()-.5)*2.5})}
if(Math.random()<.05+(e.elite?.12:0)){const tier=flr<4?1:flr<8?2:3;const pool=WPN.filter(w=>w.tier===tier);
if(pool.length)picks.push({x:e.x,y:e.y,type:'weapon',weapon:{...pool[~~(Math.random()*pool.length)]},life:550,vy:-1})}
if(Math.random()<.03+(e.elite?.05:0)){const tier=flr<4?1:flr<8?2:3;const pool=ACCESSORIES.filter(a=>a.tier<=tier);
if(pool.length)picks.push({x:e.x,y:e.y,type:'accessory',acc:{...pool[~~(Math.random()*pool.length)]},life:550,vy:-1})}
if(Math.random()<.1&&P.hp<P.mhp)picks.push({x:e.x,y:e.y,type:'heal',val:1+~~(Math.random()*2),life:380,vy:-1});
// v5 Boss/mini-boss relic drop
if(e.type==='boss'||e.isMini){const relicPool=RELICS.filter(r=>!P.relic||r.name!==P.relic.name);
if(relicPool.length&&(e.type==='boss'||(e.isMini&&Math.random()<.4))){
const rel={...relicPool[Math.floor(Math.random()*relicPool.length)]};
picks.push({x:e.x,y:e.y,type:'relic',relic:rel,life:800,vy:-1})}}
if(isLast||e.type==='boss'||e.isMini){slMo=e.type==='boss'?55:e.isMini?35:25;sfx('slowmo');
// v5 room-clear zoom
camZoom=1.02;camZoomT=15;
if(e.type==='boss'&&!e.isClone){triggerAchievement('boss_kill');setBossMusic(false);
// v8.0 EXTREME boss death cinematic
hitSt=80;slMo=0.01;camZoom=1.15;camZoomT=120;chromAb=20;shk=50;
// BOSS SLAIN floating text at 2.5x size in gold
ft(e.x,e.y-40,'BOSS SLAIN','#ffcc00',2.5);
// 3 timed particle cascades with increasing radius
for(let cascade=0;cascade<3;cascade++){setTimeout(()=>{if(gSt==='playing'||gSt==='victory'){
const cn=80+cascade*60;for(let bp=0;bp<cn;bp++){const ba=Math.random()*Math.PI*2,bspd=2+Math.random()*(6+cascade*3);
parts.push({x:e.x,y:e.y,vx:Math.cos(ba)*bspd,vy:Math.sin(ba)*bspd,life:60+Math.random()*60,ml:120,
color:['#ffffff','#ffcc00',e.color,'#ff6644'][bp%4],size:2.5+Math.random()*4.5,shape:bp%4===0?'star':'circle',grav:0.02})}
addShockwave(e.x,e.y,80+cascade*60,cascade===0?'#ffffff':cascade===1?'#ffcc00':e.color,18+cascade*6)}},cascade*200)}
// Full white flash then boss color flash
flash('#ffffff',.5);setTimeout(()=>{flash(e.color,.3);sfx('boss_death')},200);
setTimeout(()=>{flash('#ffcc00',.15)},400);
// Soul particles rising — more dramatic
for(let sp=0;sp<50;sp++){parts.push({x:e.x+(Math.random()-.5)*60,y:e.y,vx:(Math.random()-.5)*1.5,vy:-2-Math.random()*4,life:120+Math.random()*80,ml:200,color:Math.random()>.3?'rgba(255,255,255,0.7)':'#ffcc00',size:2+Math.random()*3,shape:'circle',grav:-0.03})}
// Gold rain from top
for(let gr=0;gr<20;gr++){setTimeout(()=>{if(gSt==='playing'){const gx=40+Math.random()*(RPX-80);picks.push({x:gx,y:20,vx:(Math.random()-.5)*2,vy:1+Math.random()*2,type:'gold',val:5+Math.floor(Math.random()*10),life:400,landed:false})}},300+gr*80)}
// Room lighting flare
addDynLight(e.x,e.y,300,'#ffffff',3,0,120);addDynLight(e.x,e.y,200,e.color,2,0,80);
// Boss death line + victory message
const bDL=BOSS_LORE[e.bossIdx];
if(bDL&&bDL.deathLine){setTimeout(()=>{if(gSt==='playing')showDialogue(bDL.name,bDL.deathLine,bDL.color)},1200);
setTimeout(()=>{if(gSt==='playing')msg('BOSS DEFEATED!',1500)},4000)}
else{setTimeout(()=>{if(gSt==='playing')msg('BOSS DEFEATED!',1500)},1200)}}}else hitSt=e.elite?7:3;
while(P.xp>=P.xpN){P.xp-=P.xpN;P.xpN=~~(P.xpN*1.25)+4;P.lvl++;lvlUp()}
ents.splice(i,1)}

/* ═══════════════════════════════════════════════════
   3-RAY STEERING — v5 wall-avoidance for enemy AI
   ═══════════════════════════════════════════════════ */
function rayHitsWall(x,y,angle,dist){
for(let d=0;d<dist;d+=TS/2){const px=x+Math.cos(angle)*d,py=y+Math.sin(angle)*d;
const tx=Math.floor(px/TS),ty=Math.floor(py/TS);
if(tx<0||tx>=RW||ty<0||ty>=RH||cR.tiles[ty][tx]===1)return d}
return dist}
function steer(e,tx,ty){
const ang=Math.atan2(ty-e.y,tx-e.x);
const fwd=rayHitsWall(e.x,e.y,ang,TS*3);
const left=rayHitsWall(e.x,e.y,ang-0.5,TS*3);
const right=rayHitsWall(e.x,e.y,ang+0.5,TS*3);
let bestAng=ang;
if(fwd<TS*1.5){bestAng=left>right?ang-0.6:ang+0.6}
else if(fwd<TS*2.5){const avoid=left>right?-0.25:0.25;bestAng=ang+avoid}
return bestAng}
// v10.0 Squad-adjusted steering target
function squadTarget(e){const dist=Math.hypot(P.x-e.x,P.y-e.y);if(!e.squadRole||e.type==='boss')return{x:P.x,y:P.y};
const pAng=Math.atan2(P.y-e.y,P.x-e.x);
if(e.squadRole==='flanker'){// Circle to player's side/back, rush when player is attacking
const flankOff=(e.age%2===0?1:-1)*Math.PI/2.5;const flankD=P.atkA>0?0:50;
return{x:P.x+Math.cos(pAng+Math.PI+flankOff)*flankD,y:P.y+Math.sin(pAng+Math.PI+flankOff)*flankD}}
if(e.squadRole==='anchor'){// Advance slowly, don't retreat
return{x:P.x,y:P.y}}
if(e.squadRole==='support'){// Stay behind anchors, keep distance
const anchors=ents.filter(a=>a.squadRole==='anchor'&&a.hp>0);
if(anchors.length>0&&dist<120){const anch=anchors[0];return{x:anch.x-Math.cos(pAng)*40,y:anch.y-Math.sin(pAng)*40}}
if(dist<100)return{x:e.x-Math.cos(pAng)*20,y:e.y-Math.sin(pAng)*20};return{x:P.x,y:P.y}}
if(e.squadRole==='rusher'){// Rush when player HP low or engaged
if(P.hp<P.mhp*0.4||P.atkA>0)return{x:P.x,y:P.y};// beeline
return{x:P.x+Math.cos(pAng+Math.PI)*30,y:P.y+Math.sin(pAng+Math.PI)*30}}// circle a bit first
return{x:P.x,y:P.y}}

/* ═══════════════════════════════════════════════════
   MAIN UPDATE LOOP — v5 enhanced
   ═══════════════════════════════════════════════════ */
function update(dt){if(gSt!=='playing')return;
// v9.0 Boss intro cinematic blocks gameplay
if(bossIntroActive){updateBossIntro(dt);return}
// v9.0 Update weather + FPS
updateWeather(dt);updateFPS();updateHint();
// v9.0 Tutorial hints
if(ents.length>0&&!tutorialHints.firstEnemy)showHint('firstEnemy','SPACE or CLICK to attack | F to parry');
if(P.hp<P.mhp*0.4&&P.hp>0&&!tutorialHints.firstLowHP)showHint('firstLowHP','Find green pickups to heal!');
// v5: per-entity hit-stop replaces global for normal combat. Keep global for boss kill/death only.
if(hitSt>0){hitSt-=dt;return}
// v5.1 iris-wipe floor transition
if(floorTransT>0){floorTransT-=dt;
if(floorTransPhase===0&&floorTransT<40){floorTransPhase=1;flr++;
// Chaos Seed relic: random weapon each floor
if(P.chaosSeed){const tier=flr<4?1:flr<8?2:3;const pool=WPN.filter(w=>w.tier<=tier+1);if(pool.length){P.w={...pool[Math.floor(Math.random()*pool.length)]};if(P.forgeDmg>0)P.w.d+=P.forgeDmg;equipWeaponTags();popup(`Chaos: ${P.w.name}`)}}
genDungeon();showFloorBanner();if(flr>=10)tryWhisper('deepFloor');
// v10 Iron Will: +2 HP per floor
if(P.ironWill){P.mhp+=2;P.hp=Math.min(P.mhp,P.hp+2);ft(P.x,P.y-20,'+2 HP','#44ff66')}
// v10 Contract tracking reset per floor
P._contractDmg=0;P._contractHealed=false;P._contractAbUsed=false;P._contractTimer=0;P._contractComboHeld=0;P._contractPacifistT=0}
if(floorTransT<=0){floorTransT=0;floorTransPhase=0}return}
if(loreActive)return;
const _dlgBlock=dialogueActive;
slR=slMo>0?.25:1;if(slMo>0)slMo-=dt;const sdt=dt*slR;fr++;runTime+=dt/60;
// v10 Whisper timer tick
if(whisperT>0)whisperT--;
// v6 Chronomancer: record enemy positions every 120 frames (2 seconds at 60fps)
if(P.timeDilation&&fr%120===0){enemyPositionHistory=ents.filter(e=>e.animState!=='die').map(e=>({id:e._uid||0,x:e.x,y:e.y}))}
// v7.0 Chrono Loop: save snapshot every 5 seconds
if(P.chronoLoop&&!P.chronoUsed&&fr%300===0){P.chronoSnaps.push({x:P.x,y:P.y,hp:P.hp,shield:P.shield});if(P.chronoSnaps.length>3)P.chronoSnaps.shift()}
if(P.bT>0)P.bT-=sdt;if(P.parryWindow>0)P.parryWindow-=sdt;if(P.parryCD>0)P.parryCD-=sdt;if(P.spCd>0)P.spCd-=sdt;if(P.thornCd>0)P.thornCd-=sdt;if(P.fortifyT>0){P.fortifyT-=sdt;if(fr%6===0)emit(P.x+(Math.random()-.5)*20,P.y+(Math.random()-.5)*20,1,'rgba(6,214,160,0.3)',0.5,10,1.5,'circle')}
if(P.comboTimer>0)P.comboTimer-=sdt;else P.comboStep=0;
if(P.hitStop>0){P.hitStop-=sdt}
if(P.shieldRegen&&P.shield<P.maxShield){P.shieldRegenT-=sdt;if(P.shieldRegenT<=0){P.shield=Math.min(P.maxShield,P.shield+.5);P.shieldRegenT=30}}
// v6 Passive ability recharge (slow baseline + faster from kills)
{let abRate=0.12;if(P.voidDesperation&&P.hp<P.mhp*0.25)abRate*=3;
if(P.ab!=='none'&&abCh<abMax)abCh=Math.min(abMax,abCh+abRate*sdt)}
tickStatuses(P,sdt);tickTrail(sdt);tickShockwaves(sdt);
if(chromAb>0)chromAb*=0.92;if(chromAb<0.05)chromAb=0;
if(perfectDodgeBuff>0){perfectDodgeBuff-=sdt;if(perfectDodgeBuff<=0){perfectDodgeCount=0}}
if(executionSlowT>0)executionSlowT-=sdt;
// v5 multi-kill timer
if(multiKillT>0){multiKillT-=sdt}else{multiKillN=0}
// v10.0 Dynamic camera zoom — context-aware
if(camZoomT>0){camZoomT-=sdt}else{
// Target zoom based on combat context
const liveEnts=ents.filter(e=>e.animState!=='die');const nE=liveEnts.length;
let targetZoom=1;
if(bossEnt)targetZoom=0.92;// boss fight: wider view
else if(nE>=6)targetZoom=0.94;// many enemies: zoom out
else if(nE<=1&&nE>0)targetZoom=1.03;// 1v1: zoom in slightly
camZoom+=(targetZoom-camZoom)*0.03}

let mx=0,my=0;if(K['ArrowLeft']||K['KeyA'])mx=-1;if(K['ArrowRight']||K['KeyD'])mx=1;
if(K['ArrowUp']||K['KeyW'])my=-1;if(K['ArrowDown']||K['KeyS'])my=1;
if(tA){mx=tMX;my=tMY}
// v7.0 Boss mechanics: Mind Swap reverses controls, Root stops movement
if(P.mindSwapped>0){P.mindSwapped-=sdt;mx=-mx;my=-my;if(fr%8===0)emit(P.x,P.y,1,'#cc44ff',1,8,1)}
if(P.rooted>0){P.rooted-=sdt;mx=0;my=0;if(fr%6===0)emit(P.x+Math.random()*10-5,P.y+P.hh,1,'#44ff88',0.5,12,1)}
const len=Math.sqrt(mx*mx+my*my);if(len>.1){mx/=len;my/=len;P.dir=Math.atan2(my,mx)}
if(K['Space']&&P.atkCd<=0&&!P.charging){P.charging=true;P.chargeT=0}
if(P.charging){P.chargeT+=sdt;const cp=Math.min(1,P.chargeT/40);
// v5.1 escalating charge particles
if(fr%(Math.max(1,4-Math.floor(cp*3)))===0){const n=1+Math.floor(cp*3);const cc=P.w?.c||'#c8a0ff';
for(let ci=0;ci<n;ci++){const ca=Math.random()*Math.PI*2,cd=15+cp*10;
parts.push({x:P.x+Math.cos(ca)*cd,y:P.y+Math.sin(ca)*cd,vx:Math.cos(ca+Math.PI)*1.5*cp,vy:Math.sin(ca+Math.PI)*1.5*cp,
life:8+cp*6,ml:14,color:cc,size:1+cp*1.5,shape:'circle'})}}
if(cp>0.5)shk=Math.max(shk,cp*2);
if(P.chargeT>30&&fr%10<5)flash(P.w?.c||'#c8a0ff',0.02)}

if(P.dCd>0)P.dCd-=sdt;
const relicDashMult=P.relic&&P.relic.name==='PHANTOM CLOAK'?2:1;
if((K['ShiftLeft']||K['ShiftRight'])&&P.dCd<=0&&!P.dsh&&len>.1){P.dsh=1;P.dT=9*relicDashMult;P.dCd=P.dMax;P.inv=11;sfx('dash');
// v10.0 Blade Dancer: every 3rd dash deals AOE
if(P.bladeDancer){P._dashCount=(P._dashCount||0)+1;if(P._dashCount%3===0){
for(const e of ents){if(e.animState!=='die'&&Math.hypot(e.x-P.x,e.y-P.y)<80){
hrtE(e,P.bd*1.5,false,Math.atan2(e.y-P.y,e.x-P.x))}}
addShockwave(P.x,P.y,80,'#ffcc00',12);ft(P.x,P.y-26,'BLADE DANCE','#ffcc00',1);emit(P.x,P.y,12,'#ffcc00',3,16,2)}}
// v7.0 Blink Shard: teleport to endpoint instead of sliding
if(P.blinkDash){const blinkDist=P.spd*2.8*9*relicDashMult;const bx=P.x+mx*blinkDist,by=P.y+my*blinkDist;
emit(P.x,P.y,12,'#cc88ff',3,14,2);addShockwave(P.x,P.y,30,'#cc88ff',6);
const nbx=Math.max(P.hw+4,Math.min(RPX-P.hw-4,bx)),nby=Math.max(P.hh+4,Math.min(RPY-P.hh-4,by));
if(!blkF(nbx,nby,P.hw,P.hh)){P.x=nbx;P.y=nby}else if(!blkF(nbx,P.y,P.hw,P.hh)){P.x=nbx}else if(!blkF(P.x,nby,P.hw,P.hh)){P.y=nby}
emit(P.x,P.y,12,'#cc88ff',3,14,2);addShockwave(P.x,P.y,30,'#cc88ff',6);P.dT=1}
// v6 Perfect dodge detection: check if enemies were about to hit
let wasPerfect=false;for(const e of ents){if(e.atkCd>0&&e.atkCd<9&&Math.hypot(e.x-P.x,e.y-P.y)<e.hw+P.hw+30){wasPerfect=true;break}}
if(!wasPerfect){for(const p of projs){if(p.enemy&&Math.hypot(p.x-P.x,p.y-P.y)<40){wasPerfect=true;break}}}
if(wasPerfect){perfectDodgeT=180;perfectDodgeCount++;perfectDodgeBuff=180;
streak(`PERFECT DODGE${perfectDodgeCount>1?' x'+perfectDodgeCount:''}`,'#cc88ff');sfx('parry');
flash('#cc88ff',.08);chromAb=Math.max(chromAb,3);slMo=Math.max(slMo,12);
addShockwave(P.x,P.y,50,'#cc88ff',8);emit(P.x,P.y,16,'#cc88ff',3,14,2)}
// v7.0 Dash burst particles
emit(P.x,P.y,14,P.classColor,4,12,2);
addShockwave(P.x,P.y,25,P.classColor,8);
if(scorchMarks.length<60)scorchMarks.push({x:P.x,y:P.y+P.hh,r:4,color:'rgba(200,180,255,0.15)',a:0.15});
// v5 dust puffs on dash
const biomeCol=bio.envPart?bio.envPart.col:bio.ac+'0.3)';
for(let dp=0;dp<6;dp++){const da=Math.random()*Math.PI*2;parts.push({x:P.x+Math.cos(da)*4,y:P.y+P.hh,vx:Math.cos(da)*.8,vy:-.2+Math.random()*.3,life:14,ml:14,color:biomeCol,size:1.5+Math.random(),shape:'circle',grav:0})}
if(P.dashDmg){for(const e of ents){if(Math.hypot(e.x-P.x,e.y-P.y)<60){hrtE(e,wD()*0.5,false,Math.atan2(e.y-P.y,e.x-P.x));emit(e.x,e.y,4,'#44ddaa',2,10,1.5)}}}
// v10 Phantom Step: dash leaves damaging afterimage
if(P.phantomStep){const imgX=P.x-mx*30,imgY=P.y-my*30;
setTimeout(()=>{if(gSt==='playing'){for(const e of ents){if(e.animState!=='die'&&Math.hypot(e.x-imgX,e.y-imgY)<40){hrtE(e,wD()*0.4,false,Math.atan2(e.y-imgY,e.x-imgX))}}
emit(imgX,imgY,8,P.classColor,2,12,1.5)}},200)}}
if(P.dsh){P.dT-=sdt;if(P.dT<=0)P.dsh=0}
// Player movement (skip during per-entity hit-stop)
// v6.1 dust puffs on direction change
const _pvx=mx,_pvy=my;
if(P.hitStop<=0){
const slowMult=P.statuses?.find(s=>s.type==='slow')?0.5:1;
const momentumMult=P.momentum?Math.min(1.5,1+cmb*0.03):1;
const sm=P.dsh?2.8:1,spd=P.spd*sdt*sm*slowMult*momentumMult;
const nx=P.x+mx*spd+P.vx*sdt,ny=P.y+my*spd+P.vy*sdt;
if(!blkF(nx,P.y,P.hw,P.hh))P.x=nx;else P.vx=0;if(!blkF(P.x,ny,P.hw,P.hh))P.y=ny;else P.vy=0}
// v6.1 dust puffs on sudden direction change
if(!P.dsh&&len>.3){if(!P._pdx)P._pdx=mx;if(!P._pdy)P._pdy=my;
const dotP=P._pdx*mx+P._pdy*my;if(dotP<-0.3&&fr%3===0){for(let dp=0;dp<3;dp++){const da=Math.random()*Math.PI*2;
parts.push({x:P.x+Math.cos(da)*3,y:P.y+P.hh-2,vx:Math.cos(da)*.5,vy:-.4-Math.random()*.3,life:12,ml:12,color:'rgba(180,170,160,0.3)',size:1+Math.random(),shape:'circle',grav:0})}}
P._pdx=mx;P._pdy=my}
// v5.1 biome hazard effects
const ptx=Math.floor(P.x/TS),pty=Math.floor(P.y/TS);
if(ptx>=0&&ptx<RW&&pty>=0&&pty<RH&&cR.tiles[pty][ptx]===3&&bio.hazard){const hz=bio.hazard;
if(hz.type==='spore'&&P.inv<=0&&fr%30===0){applyStatus(P,'poison',hz.dur);emit(P.x,P.y,3,'#66ff44',1,10,1)}
if(hz.type==='lava'&&P.inv<=0){if(!P._lavaTick)P._lavaTick=0;P._lavaTick-=sdt;
if(P._lavaTick<=0){P._lavaTick=hz.tickRate;P.hp-=hz.dmg;P.dmgTaken+=hz.dmg;P._lastDmgSource='lava';ft(P.x,P.y-14,`-${hz.dmg}`,'#ff6633');emit(P.x,P.y,4,'#ff4400',1.5,8,1.5);sfx('hurt');if(P.hp<=0){die();return}}}
if(hz.type==='ice'){P.vx*=1.02;P.vy*=1.02}
}
// v5.1 gravity wells (void biome)
if(bio.hazard&&bio.hazard.type==='gravity'){for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
const gx=ptx+dx,gy=pty+dy;if(gx>=0&&gx<RW&&gy>=0&&gy<RH&&cR.tiles[gy][gx]===3){
const gdist=Math.hypot(P.x-gx*TS-TS/2,P.y-gy*TS-TS/2);
if(gdist<bio.hazard.radius&&gdist>5){const ga=Math.atan2(gy*TS+TS/2-P.y,gx*TS+TS/2-P.x);
P.vx+=Math.cos(ga)*bio.hazard.pull*sdt/gdist*20;P.vy+=Math.sin(ga)*bio.hazard.pull*sdt/gdist*20}}}}
P.vx*=.78;P.vy*=.78;if(P.inv>0)P.inv-=sdt;if(P.atkA>0)P.atkA-=sdt;
// v6.1 enhanced afterimages — more triggers, speed-proportional density, glow data
const aiSpd=Math.sqrt(P.vx*P.vx+P.vy*P.vy)+len*P.spd;
const aiRate=Math.max(1,3-Math.floor(aiSpd*2));
if((P.dsh||P.inv>0)&&fr%aiRate===0)P.ai.push({x:P.x,y:P.y,life:14,dir:P.dir});
if(P.class==='shadowblade'&&!P.dsh&&P.inv<=0&&fr%Math.max(2,4-Math.floor(aiSpd))===0&&len>.1)P.ai.push({x:P.x,y:P.y,life:10,dir:P.dir});
// Afterimages during weapon special activation (first 10 frames)
if(P.spCd>P.spMax-10&&fr%2===0)P.ai.push({x:P.x,y:P.y,life:12,dir:P.dir});
// Afterimages during combo finisher (step 2)
if(P.comboStep===2&&P.atkA>0&&fr%2===0)P.ai.push({x:P.x,y:P.y,life:10,dir:P.dir});
for(let i=P.ai.length-1;i>=0;i--){P.ai[i].life-=sdt;if(P.ai[i].life<=0)P.ai.splice(i,1)}
if(P.atkCd>0)P.atkCd-=sdt;
if(!_dlgBlock&&!P.charging&&(K['Space']||mD||aR||tAA)&&P.atkCd<=0)pAtk();
if(P.charging&&!K['Space']&&!mD){P.charging=false;if(P.chargeT>30){
const cDmg=wD()*(1.5+Math.min(P.chargeT/60,2));sfx('charge');flash(P.w?.c||'#c8a0ff',.08);
for(const e of ents){if(Math.hypot(e.x-P.x,e.y-P.y)<wR()+20){hrtE(e,cDmg,true,Math.atan2(e.y-P.y,e.x-P.x))}}
emitRing(P.x,P.y,16,P.w?.c||'#c8a0ff',4,16,2.5);addShockwave(P.x,P.y,wR()+20,P.w?.c||'#c8a0ff',12);camZoom=1.03;camZoomT=8;P.atkCd=wS()*1.5}else{pAtk()}P.chargeT=0}
if(cmbT>0)cmbT-=sdt;else if(cmb>0){cmb=0;cmbM=1;document.getElementById('combo-display').classList.remove('show')}

// Traps
for(const trap of cR.traps){trap.timer-=sdt;if(trap.timer<=0){trap.on=!trap.on;trap.timer=trap.cd;if(trap.on)sfx('trap')}
if(trap.on){const tx=trap.tx*TS+TS/2,ty=trap.ty*TS+TS/2;
if(P.inv<=0&&Math.abs(P.x-tx)<TS*.4&&Math.abs(P.y-ty)<TS*.4){
// Phantom Cloak relic: negate every 8th hit
if(P.relic&&P.relic.name==='PHANTOM CLOAK'&&P.phantomCount>=8){P.phantomCount=0;P.inv=20;ft(P.x,P.y-14,'PHASED','#88ccff');emit(P.x,P.y,8,'#88ccff',2,10,1.5);continue}
let raw=Math.max(1,(trap.type==='fire'?3:2)-P.arm);
if(P.shield>0){const abs=Math.min(P.shield,raw);P.shield-=abs;raw-=abs}
if(raw>0){P.hp-=raw;P.dmgTaken+=raw;ft(P.x,P.y-14,`-${raw}`,'#ff3366');P._lastDmgSource='trap'}
P.inv=28;shk=4;emit(P.x,P.y,8,'#ff3366',2,12,1.5);sfx('hurt');flash('#ff0000',.08);chromAb=2;if(P.hp<=0){die();return}}
for(const e of ents){if(Math.abs(e.x-tx)<TS*.4&&Math.abs(e.y-ty)<TS*.4&&e.inv<=0){e.hp-=1;e.inv=20;emit(e.x,e.y,3,'#ff3366',1,8,1)}}
if(fr%4===0)emit(tx+(Math.random()-.5)*TS*.3,ty+(Math.random()-.5)*TS*.3,1,trap.type==='fire'?'#ff6633':'#ff4466',.5,8,1.5)}}

// v5 Biome environmental particles
if(fr%4===0&&bio.envPart){const ep=bio.envPart;
const ax=cX+Math.random()*W,ay=cY+Math.random()*H;
const vxR=ep.vxRange||0;
ambientParts.push({x:ax,y:ay,vy:ep.vy||-.12,vx:(Math.random()-.5)*vxR,life:90+Math.random()*50,ml:140,
size:.8+Math.random()*.8,col:ep.col,shape:ep.shape||'circle'})}
for(let i=ambientParts.length-1;i>=0;i--){const a=ambientParts[i];a.y+=a.vy*sdt;a.x+=(a.vx||0)*sdt;
if(a.shape==='spiral'){a.x+=Math.sin(a.life*.1)*0.3*sdt}
a.life-=sdt;if(a.life<=0)ambientParts.splice(i,1)}

// Pyromancer trailing flame particles
if(P.class==='pyromancer'&&fr%3===0&&len>.1){
emit(P.x+(Math.random()-.5)*6,P.y+P.hh,1,'#ff6633',.5,12,1.5,'circle')}

// ═══ ENTITY AI — v5 with 3-ray steering, attack telegraphs, flanking ═══
for(let i=ents.length-1;i>=0;i--){const e=ents[i];e.age+=sdt;e.animT+=sdt;if(e.inv>0)e.inv-=sdt;if(e.fl>0)e.fl-=sdt;
// v10.0 Champion aura tick
if(e.champion&&e.champAura&&e.champAura.tick&&e.animState!=='die')e.champAura.tick(e);
// v10.0 Void Mark decay
if(e._voidMarked>0){e._voidMarked-=sdt;if(e._voidMarked<=0)delete e._voidMarked;
else if(fr%6===0)emit(e.x,e.y,1,'#bb66ff',0.5,6,1)}
// v5 hit-stop: skip movement when entity in hit-stop
if(e.hitStop>0){e.hitStop-=sdt;continue}
if(e.stretchT>0)e.stretchT-=sdt;
// v5 spawn animation
if(e.spawnDelay>0){e.spawnDelay-=sdt;continue}
if(e.animState==='spawn'&&!e.spawnDone){animTick(e,sdt);e.alpha=Math.min(1,e.alpha+0.08*sdt);continue}
// v5 death animation
if(e.animState==='die'){animTick(e,sdt);if(e._dead){ents.splice(i,1)}continue}
// v9.0 Environmental kill check
if(checkEnvironmentalDmg(e,sdt)){if(e.hp<=0){
// v9.0 Volatile room mod: explode on death
if(P._volatileRoom){emit(e.x,e.y,16,'#ffaa00',5,16,3);addShockwave(e.x,e.y,50,'#ffaa00',12);sfx('smash');
for(const e2 of ents){if(e2!==e&&Math.hypot(e2.x-e.x,e2.y-e.y)<50){e2.hp-=3;ft(e2.x,e2.y-14,'-3','#ffaa00')}}}
ents.splice(i,1);continue}}
// Time Shard relic: enemies 25% slower
const relicSlow=P.relic&&P.relic.name==='TIME SHARD'?0.75:1;
tickStatuses(e,sdt);if(e.frozen>0){e.frozen-=sdt;continue}
const corruptSpd=corruption>=75?1.2:corruption>=50?1.1:corruption>=25?1.05:1;// v10 corruption enemy speed bonus
const sMult=(e.slowMult||1)*relicSlow*corruptSpd;
const dx=P.x-e.x,dy=P.y-e.y,dist=Math.hypot(dx,dy),ang=Math.atan2(dy,dx);e.dir=ang;

// v6 Boss stagger + enrage timers
if(e.type==='boss'){
if(e.staggerTimer>0){e.staggerTimer-=sdt}else{e.staggerDmg=0}
if(e.staggerCd>0)e.staggerCd-=sdt;
if(e.staggered&&e.frozen<=0){e.staggered=false}
if(e.enrageTimer>0){e.enrageTimer-=sdt;if(e.enrageTimer<=0&&!e.enraged){e.enraged=1;e.spd*=1.6;e.atkSpd*=.55;
emit(e.x,e.y,30,'#ff0044',6,28,3);addShockwave(e.x,e.y,180,'#ff0044',28);flash('#ff0000',.25);chromAb=6;shk=20;msg('BOSS ENRAGED!',900)}}
e.bossTimer=(e.bossTimer||0)+sdt;
// v6 Arena hazards — spawn biome-specific hazards during boss fights
if(!e.hazardCd)e.hazardCd=0;e.hazardCd-=sdt;
const hazardInterval=e.enraged?120:200;
if(e.hazardCd<=0&&e.arenaHazards.length<8){e.hazardCd=hazardInterval;
const bIdx=e.bossIdx||0;const hx=40+Math.random()*(RPX-80),hy=40+Math.random()*(RPY-80);
const htypes=['ghost_wall','toxic_pool','fire_pillar','ice_patch','gravity_well'];
const ht=htypes[Math.min(bIdx,4)];
e.arenaHazards.push({x:hx,y:hy,htype:ht,life:360,rad:ht==='gravity_well'?50:ht==='toxic_pool'?20:ht==='ice_patch'?18:0});
emit(hx,hy,6,bio.ac+'0.6)',2,12,1.5)}
// Update arena hazards + apply damage
for(let hi=e.arenaHazards.length-1;hi>=0;hi--){const ah=e.arenaHazards[hi];ah.life-=sdt;
if(ah.life<=0){e.arenaHazards.splice(hi,1);continue}
const pd=Math.hypot(P.x-ah.x,P.y-ah.y);
if(ah.htype==='ghost_wall'&&pd<18&&P.inv<=0){bossHurtP(1,20)}
else if(ah.htype==='toxic_pool'&&pd<(ah.rad||18)){if(!P.statuses)P.statuses=[];if(!P.statuses.find(s=>s.type==='poison'))P.statuses.push({type:'poison',dur:60,tick:0,src:'arena'})}
else if(ah.htype==='fire_pillar'){const fpDist=pd;if(fpDist<20&&P.inv<=0){bossHurtP(1.5,25)}}
else if(ah.htype==='ice_patch'&&pd<(ah.rad||16)){P.vx*=0.85;P.vy*=0.85}
else if(ah.htype==='gravity_well'&&pd<(ah.rad||50)&&pd>5){const ga=Math.atan2(ah.y-P.y,ah.x-P.x);P.vx+=Math.cos(ga)*0.4;P.vy+=Math.sin(ga)*0.4}}
// v6 Enhanced boss HP-threshold phase transitions — v7.1 HP bar shatter particles
if(!e.phase75&&e.hp<e.mhp*0.75){e.phase75=true;e.inv=30;
emit(e.x,e.y,20,e.color,4,20,2.5);addShockwave(e.x,e.y,120,e.color,20);addShockwave(e.x,e.y,60,'#ffffff',12);
flash(e.color,.2);chromAb=6;shk=8;slMo=20;msg('BOSS PHASE 2',800);projs.length=0;sfx('boss_phase');
hitFreezeX=e.x;hitFreezeY=e.y;hitSt=Math.max(hitSt,8);
// v10 Boss phase dialogue at 75%
const bpd75=BOSS_PHASE_DIALOGUE[e.bossIdx];if(bpd75)setTimeout(()=>{if(bossEnt)showDialogue(bpd75.p75,e.color)},600);
for(let pp=0;pp<12;pp++){const pa=Math.PI*2/12*pp;emit(e.x+Math.cos(pa)*40,e.y+Math.sin(pa)*40,4,e.color,2,10,1.5)}
const bw75=Math.min(360,W*.55),bx75=(W-bw75)/2;for(let sp=0;sp<10;sp++)uiParts.push({x:bx75+bw75*0.75,y:58,vx:(Math.random()-.5)*4,vy:-2-Math.random()*3,life:25+Math.random()*15,ml:40,color:e.color,size:2+Math.random()*2})}
if(!e.phase50&&e.hp<e.mhp*0.50){e.phase50=true;e.inv=30;e.hw=Math.floor(e.hw*1.15);e.hh=Math.floor(e.hh*1.15);
emit(e.x,e.y,25,e.color,5,24,3);addShockwave(e.x,e.y,150,e.color,24);addShockwave(e.x,e.y,80,'#ff4444',16);
flash('#ffffff',.35);chromAb=8;shk=18;slMo=25;msg('BOSS GROWING STRONGER',900);projs.length=0;sfx('boss_phase');
hitFreezeX=e.x;hitFreezeY=e.y;hitSt=Math.max(hitSt,12);
const bpd50=BOSS_PHASE_DIALOGUE[e.bossIdx];if(bpd50)setTimeout(()=>{if(bossEnt)showDialogue(bpd50.p50,e.color)},600);
addDynLight(e.x,e.y,150,e.color,1.2,0.15,0);for(let pp=0;pp<16;pp++){const pa=Math.PI*2/16*pp;emit(e.x+Math.cos(pa)*50,e.y+Math.sin(pa)*50,5,e.color,3,14,2)}
const bw50=Math.min(360,W*.55),bx50=(W-bw50)/2;for(let sp=0;sp<14;sp++)uiParts.push({x:bx50+bw50*0.5,y:58,vx:(Math.random()-.5)*5,vy:-2-Math.random()*4,life:30+Math.random()*15,ml:45,color:'#ff4444',size:2+Math.random()*3})}
if(!e.phase25&&e.hp<e.mhp*0.25){e.phase25=true;e.enraged=1;e.spd*=1.6;e.atkSpd*=.55;e.inv=30;
emit(e.x,e.y,30,'#ff0044',6,28,3);addShockwave(e.x,e.y,180,'#ff0044',28);addShockwave(e.x,e.y,100,'#ffff00',20);addShockwave(e.x,e.y,50,'#ffffff',10);
flash('#ff0000',.4);chromAb=12;shk=25;slMo=35;msg('BOSS ENRAGED!',900);projs.length=0;
hitFreezeX=e.x;hitFreezeY=e.y;hitSt=Math.max(hitSt,15);
const bpd25=BOSS_PHASE_DIALOGUE[e.bossIdx];if(bpd25)setTimeout(()=>{if(bossEnt)showDialogue(bpd25.p25,e.color)},600);
addDynLight(e.x,e.y,200,'#ff0044',1.5,0.2,0);for(let pp=0;pp<20;pp++){const pa=Math.PI*2/20*pp;emit(e.x+Math.cos(pa)*60,e.y+Math.sin(pa)*60,6,'#ff0044',3,18,2.5)}
const bw25=Math.min(360,W*.55),bx25=(W-bw25)/2;for(let sp=0;sp<18;sp++)uiParts.push({x:bx25+bw25*0.25,y:58,vx:(Math.random()-.5)*6,vy:-3-Math.random()*4,life:30+Math.random()*20,ml:50,color:'#ff0044',size:3+Math.random()*3})}}

// Attack telegraph
if(e.type!=='mage'&&e.type!=='necromancer'&&dist<(e.hw+P.hw+28)&&e.atkCd<9&&e.atkCd>0)e.telG=Math.min(1,e.telG+.15*sdt);else e.telG=Math.max(0,e.telG-.25*sdt);

// v5: Use 3-ray steering for all chase enemies instead of direct pursuit
// v10 Squad tactics: get adjusted target for squad role
const sqT=squadTarget(e);
switch(e.type){
case'rat':{const sa=steer(e,sqT.x,sqT.y);if(dist>20){e.vx+=Math.cos(sa)*e.spd*.12*sdt*sMult;e.vy+=Math.sin(sa)*e.spd*.12*sdt*sMult}}break;
case'slime':{const sa=steer(e,sqT.x,sqT.y);if(dist>24){e.vx+=Math.cos(sa)*e.spd*.1*sdt*sMult;e.vy+=Math.sin(sa)*e.spd*.1*sdt*sMult}}break;
case'bat':e.vx+=Math.cos(ang)*e.spd*.06*sdt*sMult+Math.sin(e.age*.08)*.35*sdt;e.vy+=Math.sin(ang)*e.spd*.06*sdt*sMult+Math.cos(e.age*.08)*.35*sdt;break;
case'spider':{const sa=steer(e,sqT.x,sqT.y);if(dist>28){e.vx+=Math.cos(sa)*e.spd*.08*sdt*sMult;e.vy+=Math.sin(sa)*e.spd*.08*sdt*sMult}
if(!e.webCd)e.webCd=0;e.webCd-=sdt;if(e.webCd<=0&&dist<150){e.webCd=60;
projs.push({x:e.x,y:e.y,vx:Math.cos(ang)*2,vy:Math.sin(ang)*2,dmg:0,life:50,color:'#aaaaaa',size:5,enemy:1,slow:1})}}break;
case'skel':{const sa=steer(e,sqT.x,sqT.y);if(dist>30){e.vx+=Math.cos(sa)*e.spd*.07*sdt*sMult;e.vy+=Math.sin(sa)*e.spd*.07*sdt*sMult}}break;
case'mage':if(dist<100){e.vx-=Math.cos(ang)*e.spd*.06*sdt*sMult;e.vy-=Math.sin(ang)*e.spd*.06*sdt*sMult}
else if(dist>190){e.vx+=Math.cos(ang)*e.spd*.04*sdt*sMult;e.vy+=Math.sin(ang)*e.spd*.04*sdt*sMult}
e.pCd-=sdt;if(e.pCd<10&&e.pCd>0)e.telG=Math.min(1,e.telG+.12*sdt);
if(e.pCd<=0){e.pCd=e.atkSpd;e.telG=0;projs.push({x:e.x,y:e.y,vx:Math.cos(ang)*2.8,vy:Math.sin(ang)*2.8,dmg:e.dmg,life:100,color:'#ff6644',size:4,enemy:1});sfx('warn')}break;
case'brute':{const sa=steer(e,sqT.x,sqT.y);if(dist>20){e.vx+=Math.cos(sa)*e.spd*(dist<80?.16:.06)*sdt*sMult;e.vy+=Math.sin(sa)*e.spd*(dist<80?.16:.06)*sdt*sMult}}break;
case'assassin':if(!e.dCd)e.dCd=0;e.dCd-=sdt;
if(e.dCd<=0&&dist<130&&dist>30){e.vx=Math.cos(ang)*8;e.vy=Math.sin(ang)*8;e.dCd=40;emit(e.x,e.y,6,e.color,2.5,12,1.5)}
else if(dist>40){const sa=steer(e,sqT.x,sqT.y);e.vx+=Math.cos(sa)*e.spd*.04*sdt*sMult;e.vy+=Math.sin(sa)*e.spd*.04*sdt*sMult}break;
case'wraith':e.phaseT-=sdt;if(e.phaseT<=0&&dist<120){e.phaseT=80;
e.x=P.x+Math.cos(Math.random()*Math.PI*2)*60;e.y=P.y+Math.sin(Math.random()*Math.PI*2)*60;emit(e.x,e.y,8,'#6688aa',2,12,1.5)}
if(dist>40){e.vx+=Math.cos(ang)*e.spd*.05*sdt*sMult;e.vy+=Math.sin(ang)*e.spd*.05*sdt*sMult}break;
case'golem':{const sa=steer(e,sqT.x,sqT.y);if(dist>25){e.vx+=Math.cos(sa)*e.spd*(dist<60?.12:.05)*sdt*sMult;e.vy+=Math.sin(sa)*e.spd*(dist<60?.12:.05)*sdt*sMult}
if(!e.smashCd)e.smashCd=0;e.smashCd-=sdt;if(e.smashCd<=0&&dist<50){e.smashCd=60;shk=6;
for(const oe of [P,...ents.filter(ee=>ee!==e)]){if(Math.hypot(oe.x-e.x,oe.y-e.y)<60){
if(oe===P&&P.inv<=0){const raw=Math.max(1,e.dmg+1-P.arm);P.hp-=raw;P.dmgTaken+=raw;P.inv=25;ft(P.x,P.y-14,`-${raw}`,'#ff3366');sfx('hurt')}}}
emit(e.x,e.y,16,'#778899',3,14,2);sfx('smash');addShockwave(e.x,e.y,60,'#778899',10)}}break;
case'necromancer':if(dist<120){e.vx-=Math.cos(ang)*e.spd*.05*sdt*sMult;e.vy-=Math.sin(ang)*e.spd*.05*sdt*sMult}
else if(dist>200){e.vx+=Math.cos(ang)*e.spd*.03*sdt*sMult;e.vy+=Math.sin(ang)*e.spd*.03*sdt*sMult}
e.pCd-=sdt;if(e.pCd<=0){e.pCd=e.atkSpd;projs.push({x:e.x,y:e.y,vx:Math.cos(ang)*2,vy:Math.sin(ang)*2,dmg:e.dmg,life:80,color:'#9944cc',size:4,enemy:1});sfx('warn')}
if(!e.summonCd)e.summonCd=0;e.summonCd-=sdt;if(e.summonCd<=0&&ents.length<10){e.summonCd=100;
const sa=Math.random()*Math.PI*2;ents.push(mkE('skel',e.x+Math.cos(sa)*40,e.y+Math.sin(sa)*40));emit(e.x,e.y,8,'#664488',3,14,2)}break;
// v6 new enemy AI
case'swarmer':{e.buzzOff=(e.buzzOff||0)+sdt*0.15;
const sa=steer(e,P.x,P.y);const buzz=Math.sin(e.buzzOff)*0.8;
e.vx+=Math.cos(sa+buzz)*e.spd*.1*sdt*sMult;e.vy+=Math.sin(sa+buzz)*e.spd*.1*sdt*sMult;
if(fr%10===0)emit(e.x+(Math.random()-.5)*4,e.y+(Math.random()-.5)*4,1,'rgba(200,170,50,0.2)',.3,6,0.5);
if(fr%40===0)sfxL('swarmer_buzz',e.x)}break;
case'shaman':{// Stay behind other enemies, heal and buff
const allies=ents.filter(oe=>oe!==e&&oe.type!=='shaman'&&oe.hp>0);
if(dist<120){e.vx-=Math.cos(ang)*e.spd*.06*sdt*sMult;e.vy-=Math.sin(ang)*e.spd*.06*sdt*sMult}
else if(dist>200&&allies.length){const a0=allies[0];const sa=steer(e,a0.x,a0.y);e.vx+=Math.cos(sa)*e.spd*.04*sdt*sMult;e.vy+=Math.sin(sa)*e.spd*.04*sdt*sMult}
if(!e.healCd)e.healCd=0;e.healCd-=sdt;if(e.healCd<=0&&allies.length){e.healCd=80;
const hurt=allies.filter(a=>a.hp<a.mhp).sort((a,b)=>(a.hp/a.mhp)-(b.hp/b.mhp));
const target=hurt.length?hurt[0]:allies[0];target.hp=Math.min(target.mhp,target.hp+target.mhp*0.2);
emit(target.x,target.y,6,'#88cc44',2,12,2);ft(target.x,target.y-14,'HEAL','#88cc44');sfx('shaman_chant',1,e.x)}
if(!e.buffCd)e.buffCd=0;e.buffCd-=sdt;if(e.buffCd<=0&&allies.length){e.buffCd=120;
for(const a of allies){if(Math.hypot(a.x-e.x,a.y-e.y)<100){a.spd*=1.2;emit(a.x,a.y,3,'#aaff44',1,10,1);
setTimeout(()=>{if(a.hp>0)a.spd/=1.2},2000)}}
emit(e.x,e.y,10,'#aaff44',2,16,2)}}break;
case'knight':{e.blockDir=ang;
if(!e.chargeCd)e.chargeCd=0;e.chargeCd-=sdt;
if(e.chargeCd<=0&&dist<200&&dist>60){e.chargeCd=70;e.vx=Math.cos(ang)*10;e.vy=Math.sin(ang)*10;
e.blocking=false;emit(e.x,e.y,8,'#aabbcc',3,12,2);sfx('knight_charge',1,e.x)}
else if(dist>25){const sa=steer(e,P.x,P.y);e.vx+=Math.cos(sa)*e.spd*(dist<50?.12:.06)*sdt*sMult;e.vy+=Math.sin(sa)*e.spd*(dist<50?.12:.06)*sdt*sMult}
e.blocking=dist>30&&e.chargeCd>20}break;
// v5 Mini-bosses
case'slime_king':{const sa=steer(e,P.x,P.y);if(dist>20){e.vx+=Math.cos(sa)*e.spd*.08*sdt*sMult;e.vy+=Math.sin(sa)*e.spd*.08*sdt*sMult}}break;
case'skel_champ':{const sa=steer(e,P.x,P.y);if(dist>20){e.vx+=Math.cos(sa)*e.spd*.07*sdt*sMult;e.vy+=Math.sin(sa)*e.spd*.07*sdt*sMult}
if(!e.blockT)e.blockT=0;e.blockT-=sdt;if(e.blockT<=0&&dist<40){e.blockT=30;e.armor=6;setTimeout(()=>{if(e.hp>0)e.armor=3},1000)}}break;
case'shadow_lord':if(!e.invisT)e.invisT=0;e.invisT-=sdt;
if(e.invisT<=0&&dist<150){e.invisT=80;e.alpha=0.1;setTimeout(()=>{if(e.hp>0)e.alpha=1},1500)}
if(dist>30){const sa=steer(e,P.x,P.y);e.vx+=Math.cos(sa)*e.spd*.05*sdt*sMult;e.vy+=Math.sin(sa)*e.spd*.05*sdt*sMult}break;
case'fire_elder':if(dist<100){e.vx-=Math.cos(ang)*e.spd*.06*sdt*sMult;e.vy-=Math.sin(ang)*e.spd*.06*sdt*sMult}
e.pCd-=sdt;if(e.pCd<=0){e.pCd=e.atkSpd;
for(let sp=-1;sp<=1;sp++){const sa=ang+sp*0.3;projs.push({x:e.x,y:e.y,vx:Math.cos(sa)*3,vy:Math.sin(sa)*3,dmg:e.dmg,life:80,color:'#ff5522',size:5,enemy:1,burn:1})}sfx('warn')}break;
case'mimic':{const sa=steer(e,P.x,P.y);if(dist>15){e.vx+=Math.cos(sa)*e.spd*.12*sdt*sMult;e.vy+=Math.sin(sa)*e.spd*.12*sdt*sMult}
// Chomping visual
if(dist<30&&fr%8<4){e.hw=12+Math.sin(e.age*.5)*3;e.hh=12-Math.sin(e.age*.5)*2}}break;
case'stalker':{// Invisible except when attacking
if(!e.stalkerCd)e.stalkerCd=0;e.stalkerCd-=sdt;
const sa=steer(e,P.x,P.y);if(dist>20){e.vx+=Math.cos(sa)*e.spd*.08*sdt*sMult;e.vy+=Math.sin(sa)*e.spd*.08*sdt*sMult}
if(dist<40&&e.stalkerCd<=0){e.stalkerAlpha=1;e.stalkerCd=60;e.vx+=Math.cos(ang)*6;e.vy+=Math.sin(ang)*6;sfx('dash',0.5,e.x)}
else{e.stalkerAlpha=Math.max(0.05,e.stalkerAlpha-0.03*sdt)}
if(fr%6===0&&e.stalkerAlpha<0.3)emit(e.x,e.y,1,'rgba(100,50,150,0.15)',.3,12,1,'circle')}break;
case'revenant':{// v7.0 Ghostly player mirror - follows player with 60-frame delay
// Record player position history
if(!e.posHistory.length){for(let ph=0;ph<120;ph++)e.posHistory.push({x:P.x,y:P.y})}
if(fr%2===0){e.posHistory[e.posIdx]={x:P.x,y:P.y};e.posIdx=(e.posIdx+1)%120}
// Follow player's past position (60 frames ago)
const pastIdx=(e.posIdx+60)%120;const past=e.posHistory[pastIdx];
const pda=Math.atan2(past.y-e.y,past.x-e.x);const pdd=Math.hypot(past.x-e.x,past.y-e.y);
if(pdd>8){e.vx+=Math.cos(pda)*e.spd*.1*sdt*sMult;e.vy+=Math.sin(pda)*e.spd*.1*sdt*sMult}
// Solid window cycle: vulnerable for 30 frames every 120
e.solidCd-=sdt;if(e.solidCd<=0){e.solidCd=120;e.solidWindow=30;e.ghostPhase=false;
emit(e.x,e.y,8,'#44cc66',2,14,1.5);sfx('warn')}
if(e.solidWindow>0){e.solidWindow-=sdt;if(e.solidWindow<=0){e.ghostPhase=true}}
// Ghost phase: immune to damage
if(e.ghostPhase){e.inv=2}
// Shimmer trail
if(fr%4===0)parts.push({x:e.x+(Math.random()-.5)*6,y:e.y+(Math.random()-.5)*6,vx:0,vy:-0.3,life:20,ml:20,color:'rgba(68,204,102,0.25)',size:2,shape:'circle'})}break;
case'boss':{// v7.0 BOSS_BEHAVIORS dispatch — each boss has unique AI
const bIdx=e.bossIdx||0;const bb=BOSS_BEHAVIORS[bIdx];
if(bb&&!e.isClone){bb.update(e,sdt,dist,ang,fr)}
else{// Clone or fallback: simple chase + radial shots
e.timer-=sdt;{const sa2=steer(e,P.x,P.y);if(dist>50){e.vx+=Math.cos(sa2)*e.spd*.07*sdt*sMult;e.vy+=Math.sin(sa2)*e.spd*.07*sdt*sMult}}
if(e.timer<=0){e.phase=(e.phase+1)%3;e.timer=40;
if(e.phase===0){e.vx=Math.cos(ang)*8;e.vy=Math.sin(ang)*8}
else{const n=8;for(let a=0;a<n;a++){const ba=Math.PI*2/n*a;projs.push({x:e.x,y:e.y,vx:Math.cos(ba)*2.5,vy:Math.sin(ba)*2.5,dmg:e.dmg,life:60,color:e.color,size:4,enemy:1})}}}}
}
break}

e.vx*=.86;e.vy*=.86;
// v5 enhanced separation with flanking
for(const o of ents){if(o===e)continue;const sep=Math.hypot(e.x-o.x,e.y-o.y);const minD=e.hw+o.hw+15;
if(sep<minD&&sep>0){const sa=Math.atan2(e.y-o.y,e.x-o.x),push=(minD-sep)*.12;e.vx+=Math.cos(sa)*push;e.vy+=Math.sin(sa)*push}}
const enx=e.x+e.vx*sdt,eny=e.y+e.vy*sdt;
if(enx>e.hw+2&&enx<RPX-e.hw-2&&!blk(enx,e.y,e.hw,e.hh))e.x=enx;
if(eny>e.hh+2&&eny<RPY-e.hh-2&&!blk(e.x,eny,e.hw,e.hh))e.y=eny;
// v6.1 torch knockback interaction — enemies burn when knocked into torches
const eSpd=Math.sqrt(e.vx*e.vx+e.vy*e.vy);
if(eSpd>1.5&&cR.torches){for(const torch of cR.torches){const td=Math.hypot(e.x-torch.x,e.y-torch.y);
if(td<18){applyStatus(e,'burn',60);ft(e.x,e.y-16,'IGNITE!','#ff6633',1);emit(e.x,e.y,12,'#ff6633',3,14,2);
addShockwave(e.x,e.y,30,'#ff6633',8);sfx('burn');const ba=Math.atan2(e.y-torch.y,e.x-torch.x);
e.vx+=Math.cos(ba)*4;e.vy+=Math.sin(ba)*4;break}}}
e.atkCd-=sdt;
if(e.type!=='mage'&&e.type!=='necromancer'&&e.type!=='fire_elder'&&dist<(e.hw+P.hw+5)&&P.inv<=0&&e.atkCd<=0){
if(P.parryWindow>0){const isPerfect=P.parryWindow>6;// Perfect parry: within first 4 frames
sfx('parry');P.parryCount++;tryWhisper('parry3',P.parryCount);
const parryDmg=P.shieldBash?wD()*4:isPerfect?e.dmg*0.5:0;
if(parryDmg>0){e.hp-=parryDmg;ft(e.x,e.y-16,`${Math.floor(parryDmg)}!`,isPerfect?'#ffcc00':'#06d6a0',1);e.frozen=isPerfect?40:30;emit(e.x,e.y,10,isPerfect?'#ffcc00':'#06d6a0',3,14,2)}
e.fl=12;e.frozen=Math.max(e.frozen||0,isPerfect?40:20);e.vx+=Math.cos(ang+Math.PI)*(P.shieldBash?14:isPerfect?12:10);e.vy+=Math.sin(ang+Math.PI)*(P.shieldBash?14:isPerfect?12:10);e.atkCd=e.atkSpd*2;
const pCol=isPerfect?'#ffcc00':P.shieldBash?'#06d6a0':'#ffffff';
emit(P.x,P.y,isPerfect?20:15,pCol,3,12,2);emitRing(P.x,P.y,isPerfect?18:12,pCol,isPerfect?5:4,10,2);flash(pCol,isPerfect?.15:.1);shk=isPerfect?12:P.shieldBash?10:6;chromAb=isPerfect?6:P.shieldBash?4:3;addDynLight(P.x,P.y,isPerfect?150:100,pCol,1,0,isPerfect?12:8);
if(isPerfect){addShockwave(P.x,P.y,80,'#ffcc00',14);slMo=0.3;hitSt=Math.max(hitSt,10);hitFreezeX=P.x;hitFreezeY=P.y;
ft(P.x,P.y-20,'PERFECT PARRY!','#ffcc00',1.5);P.comboStep=2;P.comboTimer=25;comboFinisherReady=true;sfx('crit')}
else ft(P.x,P.y-20,P.shieldBash?'SHIELD BASH!':'PARRY!',pCol,1);
P.parryWindow=0;P.atkCd=0;
// v6.1 parry spark fountain
for(let sp=0;sp<(isPerfect?20:12);sp++){const sa=ang+Math.PI+(Math.random()-.5)*1.5;const spd=2+Math.random()*(isPerfect?4:3);
parts.push({x:P.x,y:P.y,vx:Math.cos(sa)*spd,vy:Math.sin(sa)*spd-1,life:16+Math.random()*8,ml:24,color:Math.random()>.3?pCol:'#ffcc44',size:1+Math.random()*1.5,shape:'rect',grav:0.08})}
if((P.shieldBash||isPerfect)&&e.hp<=0&&e.animState!=='die')killE(e,i);continue}
// Phantom Cloak relic: negate every 8th hit
if(P.relic&&P.relic.name==='PHANTOM CLOAK'&&P.phantomCount>=8){P.phantomCount=0;P.inv=20;ft(P.x,P.y-14,'PHASED','#88ccff');emit(P.x,P.y,8,'#88ccff',2,10,1.5);e.atkCd=e.atkSpd;continue}
// v7.0 Soul Mirror: 20% dodge + reflect
if(P.soulMirror&&Math.random()<0.2){P.inv=15;ft(P.x,P.y-14,'MIRRORED','#aaeeff',1);emit(P.x,P.y,12,'#aaeeff',3,12,2);
addShockwave(P.x,P.y,40,'#aaeeff',8);e.hp-=e.dmg*1.5;e.fl=10;e.atkCd=e.atkSpd;sfx('reflect');continue}
let raw=Math.max(1,e.dmg-P.arm);
if(P.thorns){e.hp-=P.thorns;emit(e.x,e.y,4,'#ff8844',2,8,1.5)}
if(e.poisonous)applyStatus(P,'poison',60);
if(P.shield>0){const abs=Math.min(P.shield,raw);P.shield-=abs;raw-=abs;sfx('shield');P.shieldRegenT=60}
if(raw>0){P.hp-=raw;P.dmgTaken+=raw;ft(P.x,P.y-14,`-${raw}`,'#ff3366',1);
P._lastDmgSource=e.type==='boss'?(e.bossName||BOSS_LORE[e.bossIdx]?.name||'BOSS'):e.name||e.type.toUpperCase()}
P.inv=24;e.atkCd=e.atkSpd;shk=7;shkAngle=ang+Math.PI;chromAb=2;
if(P.ironWill){P.vx+=Math.cos(ang+Math.PI)*1;P.vy+=Math.sin(ang+Math.PI)*1}else{P.vx+=Math.cos(ang+Math.PI)*5.5;P.vy+=Math.sin(ang+Math.PI)*5.5}
if(P.overcharge)abCh=Math.min(abMax,abCh+abMax*0.15);
emit(P.x,P.y,14,'#ff3366',3,16,2);sfx('hurt');flash('#ff0000',.1);addCorruption(-3);// v10 corruption drops when hit
P._contractDmg=(P._contractDmg||0)+raw;// v10 contract tracking
// v7.0 Enhanced player hurt feedback
const hitAngle=ang;P.stretchDir=hitAngle;P.stretchT=12;P.flashWhite=3;P.dmgIndicator={angle:hitAngle,life:20};
emitDir(P.x,P.y,8,'#ff3366',hitAngle,1.2,3,15,2);
// v7.0 Thorn Crown: fire 8 projectiles on damage
if(P.thornCrown&&P.thornCd<=0){P.thornCd=60;for(let t=0;t<8;t++){const ta=Math.PI*2/8*t;
projs.push({x:P.x,y:P.y,vx:Math.cos(ta)*4,vy:Math.sin(ta)*4,dmg:wD()*.6,life:40,color:'#ff6644',size:3,enemy:0})}
emit(P.x,P.y,10,'#ff6644',3,14,2);addShockwave(P.x,P.y,35,'#ff6644',8)}
if(P.hp<=0){die();return}}
if(e.hp<=0&&e.animState!=='die')killE(e,i)}

// v10.0 Enemy synergy combos — check every ~60 frames
if(enemySynergyCD>0)enemySynergyCD-=sdt;
if(enemySynergyCD<=0&&ents.length>=2){enemySynergyCD=60;
for(const syn of ENEMY_SYNERGIES){const a=ents.find(e=>e.type===syn.pair[0]&&e.animState!=='die'&&e.hp>0&&!(e._synCd>0));
const b=ents.find(e=>e.type===syn.pair[1]&&e.animState!=='die'&&e.hp>0&&e!==a);
if(a&&b&&Math.hypot(a.x-b.x,a.y-b.y)<syn.range){a._synCd=syn.cd;syn.act(a,b);
streak(syn.name,a.color||'#ff4444');sfx('warn');break}}}
// Projectiles with velocity-streak trails
for(let i=projs.length-1;i>=0;i--){const p=projs[i];
// v8.0 Homing arrow passive (Starfall Bow)
if(!p.enemy&&P.w&&P.w.evoPassive==='homing'&&ents.length){let nearest=null,nd=200;
for(const en of ents){if(en.animState==='die')continue;const d=Math.hypot(en.x-p.x,en.y-p.y);if(d<nd){nd=d;nearest=en}}
if(nearest){const ha=Math.atan2(nearest.y-p.y,nearest.x-p.x);const spd=Math.hypot(p.vx,p.vy);const curA=Math.atan2(p.vy,p.vx);
const diff=((ha-curA+Math.PI*3)%(Math.PI*2))-Math.PI;const turn=Math.sign(diff)*Math.min(Math.abs(diff),0.08);
p.vx=Math.cos(curA+turn)*spd;p.vy=Math.sin(curA+turn)*spd}}
p.x+=p.vx*sdt;p.y+=p.vy*sdt;p.life-=sdt;
if(fr%2===0)emitTrail(p.x,p.y,p.color,p.size*.35);
const tx=Math.floor(p.x/TS),ty=Math.floor(p.y/TS);
const hitWall=tx>=0&&tx<RW&&ty>=0&&ty<RH&&cR.tiles[ty][tx]===1;
if(p.life<=0||hitWall){
// Ricochet: bounce player projectiles off walls
if(hitWall&&!p.enemy&&P.ricochet&&!p.bounced){p.bounced=true;
const ptx2=Math.floor((p.x-p.vx)/TS),pty2=Math.floor((p.y-p.vy)/TS);
if(ptx2!==tx)p.vx*=-1;if(pty2!==ty)p.vy*=-1;p.life=Math.max(p.life,30);emit(p.x,p.y,4,p.color,2,8,1.5);continue}
if(p.explode){emit(p.x,p.y,18,'#ff6633',3.5,16,2.5);shk=5;addDynLight(p.x,p.y,100,'#ff6633',1.2,0,8);addShockwave(p.x,p.y,60,'#ff6633',10);
for(const e of ents){if(Math.hypot(e.x-p.x,e.y-p.y)<TS){hrtE(e,p.dmg,false,Math.atan2(e.y-p.y,e.x-p.x))}}}
else emit(p.x,p.y,4,p.color,1.5,8,1);projs.splice(i,1);continue}
if(p.enemy&&P.inv<=0&&Math.hypot(p.x-P.x,p.y-P.y)<P.hw+p.size){
// Mirror Shield relic: 25% reflect
if(P.mirrorShield&&Math.random()<0.25){p.enemy=0;p.vx*=-1.5;p.vy*=-1.5;p.dmg*=1.5;emit(P.x,P.y,6,'#aaeeff',2,8,1.5);sfx('reflect');ft(P.x,P.y-14,'REFLECT','#aaeeff');continue}
// Fortify active: reflect all projectiles
if(P.fortifyT>0){p.enemy=0;p.vx*=-2;p.vy*=-2;p.dmg*=2;emit(P.x,P.y,8,'#06d6a0',2,10,2);sfx('shield');continue}
if(P.parryWindow>0){sfx('parry');P.parryCount++;emit(P.x,P.y,12,'#ffffff',3,10,2);flash('#ffffff',.08);chromAb=2;p.enemy=0;p.vx*=-1.5;p.vy*=-1.5;p.dmg*=2;P.parryWindow=0;continue}
// Phantom Cloak check
if(P.relic&&P.relic.name==='PHANTOM CLOAK'&&P.phantomCount>=8){P.phantomCount=0;P.inv=20;ft(P.x,P.y-14,'PHASED','#88ccff');projs.splice(i,1);continue}
// v7.0 Soul Mirror: 20% dodge + reflect projectile
if(P.soulMirror&&Math.random()<0.2){P.inv=15;ft(P.x,P.y-14,'MIRRORED','#aaeeff',1);emit(P.x,P.y,12,'#aaeeff',3,12,2);
p.enemy=0;p.vx*=-1.5;p.vy*=-1.5;p.dmg*=1.5;sfx('reflect');continue}
let raw=Math.max(1,p.dmg-P.arm);
if(p.slow)applyStatus(P,'slow',50);
if(P.shield>0){const abs=Math.min(P.shield,raw);P.shield-=abs;raw-=abs;P.shieldRegenT=60}
if(raw>0){P.hp-=raw;P.dmgTaken+=raw;ft(P.x,P.y-14,`-${raw}`,'#ff3366');P._lastDmgSource='projectile'}
P.inv=20;shk=4;chromAb=1.5;emit(P.x,P.y,8,'#ff3366',2,10,1.5);sfx('hurt');flash('#ff0000',.08);
// v7.0 Enhanced projectile hurt feedback
{const projHitAngle=Math.atan2(P.y-p.y,P.x-p.x);P.stretchDir=projHitAngle;P.stretchT=12;P.flashWhite=3;P.dmgIndicator={angle:projHitAngle,life:20};
emitDir(P.x,P.y,8,'#ff3366',projHitAngle,1.2,3,15,2)}
// v7.0 Thorn Crown: fire 8 projectiles on projectile damage
if(P.thornCrown&&P.thornCd<=0){P.thornCd=60;for(let t=0;t<8;t++){const ta=Math.PI*2/8*t;
projs.push({x:P.x,y:P.y,vx:Math.cos(ta)*4,vy:Math.sin(ta)*4,dmg:wD()*.6,life:40,color:'#ff6644',size:3,enemy:0})}
emit(P.x,P.y,10,'#ff6644',3,14,2)}
projs.splice(i,1);if(P.hp<=0){die();return}}
if(!p.enemy){let hit=false;for(let j=ents.length-1;j>=0;j--){const e=ents[j];if(e.animState==='spawn'&&!e.spawnDone)continue;
if(Math.hypot(p.x-e.x,p.y-e.y)<e.hw+p.size+2){
let dmg=p.dmg;const crit=Math.random()<P.cc;if(crit){dmg=Math.floor(dmg*(2.2+P.critDmgMult-1));sfx('crit')}
hrtE(e,dmg,crit,Math.atan2(e.y-P.y,e.x-P.x));
if(p.burn)applyStatus(e,'burn',50);if(p.freeze)applyStatus(e,'freeze',40);if(p.poison)applyStatus(e,'poison',60);
if(e.hp<=0&&e.animState!=='die')killE(e,j);emit(p.x,p.y,3,p.color,1.2,8,1);
if(p.pierce){p.pierce--;p.dmg*=.8}else{hit=true}break}}if(hit)projs.splice(i,1)}}

// Pickups
for(let i=picks.length-1;i>=0;i--){const p=picks[i];p.life-=sdt;if(p.vy){p.y+=p.vy*sdt;p.vy*=.95}if(p.vx){p.x+=p.vx*sdt;p.vx*=.91}
if(p.life<=0){picks.splice(i,1);continue}const dist=Math.hypot(P.x-p.x,P.y-p.y);
const magR=P.magnetism?300:100;if(p.type==='gold'&&dist<magR){const a=Math.atan2(P.y-p.y,P.x-p.x);p.vx=(p.vx||0)+Math.cos(a)*(P.magnetism?.8:.4);p.vy=(p.vy||0)+Math.sin(a)*(P.magnetism?.8:.4)}
if(dist<18||(p.type==='lore'&&dist<30)||(p.type==='relic'&&dist<25)){
  if(p.type==='gold'){gold+=p.val;tGold+=p.val;sfx('coin');
    if(P.goldHeals&&gold%20<p.val){P.hp=Math.min(P.mhp,P.hp+1);ft(P.x,P.y-20,'+1','#44ff66')}}
  else if(p.type==='heal'){P.hp=Math.min(P.mhp,P.hp+p.val);sfx('xp');ft(P.x,P.y-14,`+${p.val}`,'#44ff66')}
  else if(p.type==='weapon'){const oldDmg=P.w?P.w.d:1;const newDmg=p.weapon.d;const upgrade=newDmg>oldDmg;P.w={...p.weapon};if(P.forgeDmg>0)P.w.d+=P.forgeDmg;
// v8.0 Reset weapon evolution on new weapon pickup
weaponKillCount=0;weaponEvoStage=0;equipWeaponTags();
sfx('chest');popup(`${upgrade?'▲ ':''}${p.weapon.name} [DMG:${p.weapon.d}]`);if(upgrade){flash('#ffcc44',.06);emit(P.x,P.y,14,'#ffcc44',2.5,16,1.5)}}
  else if(p.type==='accessory'){P.acc={...p.acc};p.acc.f(P);sfx('chest');popup(`Equipped: ${p.acc.name}`);flash('#64dfdf',.06)}
  else if(p.type==='lore'&&p.tablet){showLore(p.tablet.title,p.tablet.text)}
  else if(p.type==='relic'&&p.relic){showRelicChoice(p.relic)}
  picks.splice(i,1)}}

for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx*sdt;p.y+=p.vy*sdt;p.vx*=.93;p.vy*=.93;if(p.grav)p.vy+=p.grav*sdt;p.life-=sdt;if(p.life<=0)parts.splice(i,1)}
// v5 enhanced floating text: gravity bounce
for(let i=fts.length-1;i>=0;i--){const f=fts[i];f.vy+=f.grav*sdt;f.y+=f.vy*sdt;f.x+=f.vx*sdt;f.vx*=.92;
// Bounce off baseline
if(f.vy>0&&f.bounces<2){f.vy*=-0.5;f.bounces++}
f.life-=sdt;if(f.life<=0)fts.splice(i,1)}

// v5 Challenge wave management
if(waveActive&&ents.length===0&&!cR.cleared){
if(waveNum<waveMax){wavePause-=sdt;if(wavePause<=0){waveNum++;spawnWave(waveNum);wavePause=60}}
else{waveActive=false;cR.cleared=1;cR.eDefs=[];playRoomFanfare();
const bonus=15+flr*5;gold+=bonus;tGold+=bonus;
msg('CHALLENGE COMPLETE!',1200);ft(P.x,P.y-30,`+${bonus}◆`,'#ffcc44',1);flash('#ff8800',.1);
// Guaranteed drop
const tier=flr<4?1:flr<8?2:3;const pool=WPN.filter(w=>w.tier>=tier);
if(pool.length)picks.push({x:RPX/2,y:RPY/2,type:'weapon',weapon:{...pool[~~(Math.random()*pool.length)]},life:600,vy:-1})}}

// v7.0 Horde Arena wave management
if(cR.hordeWave&&!cR.cleared){const hw=cR.hordeWave;
if(!hw.active&&ents.length===0){hw.pause-=sdt;
if(hw.pause<=0){hw.wave++;hw.active=true;hw.pause=90;
if(hw.wave<=hw.maxWave){const hn=3+hw.wave*2+flr;const hpool=flr<5?['slime','bat','skel','swarmer']:['skel','mage','brute','assassin','swarmer','knight'];
for(let wi=0;wi<hn;wi++){const het=hpool[~~(Math.random()*hpool.length)];const hwa=Math.random()*Math.PI*2;
ents.push(mkE(het,RPX/2+Math.cos(hwa)*(RPX/3),RPY/2+Math.sin(hwa)*(RPY/3)))}
msg(`WAVE ${hw.wave}/${hw.maxWave}`,800);addShockwave(RPX/2,RPY/2,80,bio.ac,15);sfx('wave');flash(bio.ac,.12)}
else{cR.cleared=1;cR.eDefs=[];playRoomFanfare();const hb=20+flr*8;gold+=hb;tGold+=hb;
msg('HORDE VANQUISHED!',1200);ft(P.x,P.y-30,`+${hb}◆`,'#ffcc44',1.5);flash('#ffcc44',.2);shk=10;
picks.push({x:RPX/2,y:RPY/2-20,type:'heal',val:3,life:600,vy:-1});
const ht2=flr<4?1:flr<8?2:3;const hwp=WPN.filter(w=>w.tier>=ht2);
if(hwp.length)picks.push({x:RPX/2,y:RPY/2+20,type:'weapon',weapon:{...hwp[~~(Math.random()*hwp.length)]},life:600,vy:-1})}}}
else if(hw.active&&ents.length===0){hw.active=false;
if(hw.wave<hw.maxWave){picks.push({x:RPX/2+(Math.random()-.5)*40,y:RPY/2,type:'heal',val:2,life:300,vy:-0.5});msg('PREPARE YOURSELF...',600)}}}

// v7.0 Shrine puzzle logic
if(cR.shrinePuzzle&&!cR.shrinePuzzle.solved&&!cR.shrinePuzzle.failed){const sp=cR.shrinePuzzle;
if(sp.showT>0){sp.showT-=sdt;const shIdx=Math.floor((120-sp.showT)/30);
for(let sci=0;sci<4;sci++){if(sci===shIdx&&fr%30===0){const scc=sp.crystals[sp.sequence[sci]];emit(scc.x,scc.y,4,scc.color,1.5,10,1);sfx('coin')}}}
else if(sp.timer>0){sp.timer-=sdt;if(sp.timer<=0){sp.failed=true;msg('PUZZLE FAILED!',800);sfx('hurt');flash('#ff0000',.2);
for(let sei=0;sei<4+flr;sei++){const sea=Math.random()*Math.PI*2;ents.push(mkE(flr<5?'skel':'mage',RPX/2+Math.cos(sea)*60,RPY/2+Math.sin(sea)*60))}}}
if(K['KeyE']&&sp.showT<=0){for(let sci=0;sci<4;sci++){const scc=sp.crystals[sci];
if(!scc.active&&Math.abs(P.x-scc.x)<TS*1.5&&Math.abs(P.y-scc.y)<TS*1.5){
if(sp.sequence[sp.currentStep]===sci){scc.active=true;sp.currentStep++;sfx('coin');emit(scc.x,scc.y,8,scc.color,2,12,1.5);
addDynLight(scc.x,scc.y,60,scc.color,1,0,10);if(sp.timer===0)sp.timer=300;
if(sp.currentStep>=4){sp.solved=true;cR.cleared=true;msg('SHRINE ACTIVATED!',1200);sfx('synergy');flash('#ffcc44',.3);shk=8;chromAb=4;
addShockwave(RPX/2,RPY/2,100,'#ffcc44',20);for(const sch of cR.chests)sch.shrineReward=true}}
else{sp.failed=true;msg('WRONG ORDER!',600);sfx('hurt');flash('#ff0000',.15);
for(let sei=0;sei<3+flr;sei++){const sea=Math.random()*Math.PI*2;ents.push(mkE(flr<5?'skel':'mage',RPX/2+Math.cos(sea)*60,RPY/2+Math.sin(sea)*60))}}
K['KeyE']=false;break}}}}

if(!cR.cleared&&ents.length===0&&!waveActive&&!(cR.hordeWave&&cR.hordeWave.wave<=cR.hordeWave.maxWave)){cR.cleared=1;cR.eDefs=[];playRoomFanfare();
const bonus=6+flr*3;gold+=bonus;tGold+=bonus;
P.bestRoomKills=Math.max(P.bestRoomKills,kills);
// v6.0 enhanced room clear celebration
slMo=Math.max(slMo,22);sfx('slowmo');camZoom=1.05;camZoomT=25;
// Fireworks-style star burst
for(let burst=0;burst<3;burst++){setTimeout(()=>{if(gSt!=='playing')return;
const bx=P.x+(Math.random()-.5)*80,by=P.y+(Math.random()-.5)*60;
for(let i=0;i<20;i++){const a=Math.random()*Math.PI*2;const spd=3+Math.random()*4;
parts.push({x:bx,y:by,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd-3,life:25+Math.random()*20,ml:45,
color:['#ffcc44','#ff6644','#44ff66','#4488ff','#ff44aa'][Math.floor(Math.random()*5)],size:2+Math.random()*2.5,shape:'star',grav:0.1})}
addShockwave(bx,by,40,bio.torchCol,8);sfx('coin')},burst*150)}
// Spiral gold pickup
const rcx=RPX/2,rcy=RPY/2;for(let i=0;i<Math.min(8,Math.ceil(bonus/3));i++){const sa=Math.PI*2/8*i;const sd=20+i*8;
picks.push({x:rcx+Math.cos(sa)*sd,y:rcy+Math.sin(sa)*sd,type:'gold',val:Math.ceil(bonus/8),life:450,vy:-(1+Math.random()),vx:Math.cos(sa)*1.5})}
addShockwave(P.x,P.y,120,bio.torchCol,20);addShockwave(P.x,P.y,60,'#ffcc44',12);flash(bio.torchCol,.1);chromAb=Math.min(4,chromAb+2);
addDynLight(P.x,P.y,180,bio.torchCol,1.5,0,20);
// Golden vignette
flash('#ffcc44',.06);
msg('ROOM CLEARED',900);ft(P.x,P.y-30,`+${bonus}◆`,'#ffcc44',1)}
if(fr%4===0&&!P.dsh)parts.push({x:P.x+(Math.random()-.5)*4,y:P.y+P.hh+2,vx:0,vy:-.15,life:12,ml:12,color:bio.ac+'0.15)',size:1,shape:'circle'});
// v6.0 Footstep decals
if(fr%8===0&&len>.3&&!P.dsh&&footstepDecals.length<60){footstepDecals.push({x:P.x,y:P.y+P.hh,color:P.classColor,life:3})}
if(P.bT>0&&fr%2===0)emit(P.x+(Math.random()-.5)*14,P.y+(Math.random()-.5)*14,1,'#ff3300',.8,8,1.5);
chkTr();if(!_dlgBlock)chkInt();
if(trA>0)trA=Math.max(0,trA-.022*sdt);if(sfA>0)sfA=Math.max(0,sfA-.012*sdt);if(shk>0){shk*=shkDecay;if(shk<.15)shk=0}

// v5 HUD update with animated bars
const targetHP=P.hp/P.mhp;displayHP+=(targetHP-displayHP)*0.12;
if(targetHP<displayHP-0.01){hpDrainT=20;
// v6.1 HP bar shake on damage
const hpEl=document.querySelector('.hud-l');if(hpEl&&!hpEl.classList.contains('hp-shake')){hpEl.classList.add('hp-shake');setTimeout(()=>hpEl.classList.remove('hp-shake'),300)}}
else if(hpDrainT>0)hpDrainT-=sdt;
document.getElementById('hp-bar').style.width=`${displayHP*100}%`;
const drainEl=document.getElementById('hp-drain');
if(drainEl){drainEl.style.width=hpDrainT>0?`${(displayHP-targetHP)*100}%`:'0%';drainEl.style.left=`${targetHP*100}%`}
document.getElementById('shield-bar').style.width=`${P.maxShield>0?(P.shield/P.maxShield)*100:0}%`;
const xpPct=(P.xp/P.xpN)*100;const xpBarEl=document.getElementById('xp-bar');xpBarEl.style.width=`${xpPct}%`;
// v9.0 XP bar glow when near full
if(xpPct>=85){xpBarEl.style.boxShadow=`0 0 12px rgba(196,113,245,${0.3+Math.sin(fr*0.1)*0.2}),0 0 24px rgba(123,47,247,${0.2+Math.sin(fr*0.1)*0.15})`}else{xpBarEl.style.boxShadow=''}
document.getElementById('dash-bar').style.width=`${Math.max(0,(1-P.dCd/P.dMax)*100)}%`;
document.getElementById('ability-bar').style.width=`${(abCh/abMax)*100}%`;
document.getElementById('h-floor').textContent=flr;document.getElementById('h-lvl').textContent=P.lvl;
const kEl=document.getElementById('h-kills');if(parseInt(kEl.textContent)!==kills){kEl.textContent=kills;kEl.style.transform='scale(1.3)';kEl.style.color='#ff8888';setTimeout(()=>{kEl.style.transform='scale(1)';kEl.style.color='#c8a0ff'},150)};
// v6.1 gold counter roll-up
const gEl=document.getElementById('h-gold');
if(displayGold!==gold){const gDiff=gold-displayGold;displayGold+=Math.sign(gDiff)*Math.max(1,Math.ceil(Math.abs(gDiff)*.2));
if(Math.abs(displayGold-gold)<2)displayGold=gold;gEl.textContent=displayGold;gEl.style.color='#ffee44';
// v9.0 gold counter scale bounce on gain
gEl.style.transform=`scale(${1+Math.min(0.3,Math.abs(gDiff)*0.01)})`;gEl.style.textShadow='0 0 8px rgba(255,238,68,0.5)'}else{gEl.style.color='#ffcc44';gEl.style.transform='scale(1)';gEl.style.textShadow='none'}
document.getElementById('h-time').textContent=formatTime(runTime);
// v6.1 ability charge glow
const abBar=document.getElementById('ability-bar');
if(abCh>=abMax){abBar.style.boxShadow=`0 0 12px rgba(247,127,0,${.4+Math.sin(fr*.08)*.3})`}else{abBar.style.boxShadow='none'}
// v6.1 weapon special ready pulse
const forgeSuffix=P.forgeDmg>0?` +${P.forgeDmg}`:'';
const wMastery=P.w?getWeaponMasteryLevel(P.w.name):0;const wMasteryStr=wMastery>0?` ${'★'.repeat(wMastery)}`:'';
// v8.0 Weapon evolution progress indicator
let evoProgress='';
if(P.w){const evos=WEAPON_EVOLUTIONS[P.w.baseName||P.w.name];
if(evos&&weaponEvoStage<evos.length){const nextEvo=evos[weaponEvoStage];evoProgress=` [${weaponKillCount}/${nextEvo.kills}]`}}
const wName=(P.w?P.w.name:'FISTS')+forgeSuffix+wMasteryStr+evoProgress+(P.ab!=='none'?` · Q:${P.ab.toUpperCase()}`:'')+(P.w&&P.w.sp!=='none'?` · R:${P.w.sp.toUpperCase()}`:'');
const wdEl=document.getElementById('weapon-display');wdEl.textContent=wName;
if(P.w&&P.w.sp!=='none'&&P.spCd<=0){wdEl.style.color=`rgba(255,204,68,${.6+Math.sin(fr*.1)*.3})`;wdEl.style.textShadow=`0 0 8px rgba(255,200,60,${.3+Math.sin(fr*.1)*.2})`}
else{wdEl.style.color='rgba(255,204,68,0.6)';wdEl.style.textShadow='none'};
// v5.1 dynamic music intensity + achievements
if(fr%8===0)setCombatIntensity();
if(fr%30===0)checkAchievements()}

/* ═══════════════════════════════════════════════════
   v9.0 PARALLAX DEPTH LAYERS — distant background beneath dungeon
   ═══════════════════════════════════════════════════ */
function drawParallax(c,cx,cy){
const bIdx=bio.i;const t=fr*0.01;
// Layer 1: Deep void — slow scrolling dark shapes
c.save();const p1x=cx*0.05,p1y=cy*0.05;
const voidG=c.createRadialGradient(W/2-p1x,H/2-p1y,0,W/2-p1x,H/2-p1y,W*0.6);
voidG.addColorStop(0,`rgba(${bio.tint[0]+15},${bio.tint[1]+15},${bio.tint[2]+15},0.08)`);
voidG.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=voidG;c.fillRect(cx-20,cy-20,W+40,H+40);
// Distant structures per biome
c.globalAlpha=0.04;
const struct=[[// Crypt: distant pillars
()=>{for(let i=0;i<5;i++){const sx=((i*220+30)%(W+200))-p1x*2,sy=H*0.3+Math.sin(t+i*1.5)*30-p1y*2;
c.fillStyle='rgba(80,60,120,1)';c.fillRect(cx+sx,cy+sy,8,120+i*20)}}],
[// Fungal: bioluminescent orbs
()=>{for(let i=0;i<8;i++){const ox=((i*170+50)%(W+160))-p1x*3,oy=((i*130+80)%(H+120))-p1y*3;
const pulse=Math.sin(t*2+i*0.8)*0.5+0.5;c.fillStyle=`rgba(80,255,120,${pulse*0.8})`;c.shadowBlur=20;c.shadowColor='rgba(80,255,120,0.3)';
c.beginPath();c.arc(cx+ox,cy+oy,4+pulse*6,0,Math.PI*2);c.fill();c.shadowBlur=0}}],
[// Infernal: distant lava rivers
()=>{c.strokeStyle='rgba(255,100,30,0.8)';c.lineWidth=3+Math.sin(t)*1.5;c.beginPath();
const lx=cx-p1x*2;for(let x=0;x<W+60;x+=8){const ly=cy+H*0.7+Math.sin(x*0.008+t*0.5)*40-p1y*2;
x===0?c.moveTo(lx+x,ly):c.lineTo(lx+x,ly)}c.stroke();
c.strokeStyle='rgba(255,200,50,0.4)';c.lineWidth=1;c.stroke()}],
[// Frozen: distant ice formations
()=>{for(let i=0;i<6;i++){const ix=((i*190+40)%(W+180))-p1x*2,iy=H*0.6+i*15-p1y*2;
c.fillStyle='rgba(120,180,255,0.6)';c.beginPath();c.moveTo(cx+ix,cy+iy);c.lineTo(cx+ix+6,cy+iy-50-i*10);c.lineTo(cx+ix+12,cy+iy);c.fill()}}],
[// Void: warping geometric shapes
()=>{for(let i=0;i<4;i++){const vx=W/2+Math.cos(t*0.3+i*Math.PI/2)*200-p1x*4,vy=H/2+Math.sin(t*0.4+i*Math.PI/2)*150-p1y*4;
c.save();c.translate(cx+vx,cy+vy);c.rotate(t*0.2+i);c.strokeStyle='rgba(180,80,255,0.6)';c.lineWidth=1;c.strokeRect(-15,-15,30,30);
c.strokeRect(-10,-10,20,20);c.restore()}}]];
if(struct[bIdx])struct[bIdx][0]();
c.globalAlpha=1;
// Layer 2: Mid-depth fog wisps
const p2x=cx*0.12,p2y=cy*0.12;c.globalAlpha=0.025;
for(let w=0;w<3;w++){const wx=((w*300+fr*0.3)%(W+400))-200-p2x,wy=H*0.2+w*H*0.25+Math.sin(t*0.5+w*2)*50-p2y;
const fg=c.createRadialGradient(cx+wx,cy+wy,0,cx+wx,cy+wy,80+w*30);
fg.addColorStop(0,`rgba(${bio.tint[0]*3},${bio.tint[1]*3},${bio.tint[2]*3},0.6)`);
fg.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=fg;c.fillRect(cx+wx-120,cy+wy-120,240,240)}
c.globalAlpha=1;c.restore()}

/* ═══════════════════════════════════════════════════
   v9.0 DYNAMIC WEATHER SYSTEM — full-screen biome weather effects
   ═══════════════════════════════════════════════════ */
let weatherParts=[];const WEATHER_MAX=120;
function updateWeather(sdt){const bIdx=bio.i;
// Spawn weather particles
if(bIdx===0&&fr%6===0&&weatherParts.length<WEATHER_MAX){// Crypt: floating dust motes
for(let i=0;i<2;i++)weatherParts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.15,
life:200+Math.random()*200,ml:400,size:1+Math.random()*1.5,color:'rgba(200,180,160,0.15)',type:'dust'})}
if(bIdx===1&&fr%3===0&&weatherParts.length<WEATHER_MAX){// Fungal: bioluminescent rain
weatherParts.push({x:Math.random()*W,y:-10,vx:(Math.random()-.5)*.3+.2,vy:1.5+Math.random()*2,
life:120+Math.random()*60,ml:180,size:1+Math.random(),color:`rgba(${80+Math.random()*40},${200+Math.random()*55},${100+Math.random()*55},0.2)`,type:'rain'})}
if(bIdx===2&&fr%2===0&&weatherParts.length<WEATHER_MAX){// Infernal: rising embers
for(let i=0;i<2;i++)weatherParts.push({x:Math.random()*W,y:H+10,vx:(Math.random()-.5)*1.2,vy:-1-Math.random()*2.5,
life:100+Math.random()*80,ml:180,size:.8+Math.random()*2.5,color:Math.random()>.4?'rgba(255,120,40,0.25)':'rgba(255,200,60,0.2)',type:'ember'})}
if(bIdx===3&&fr%2===0&&weatherParts.length<WEATHER_MAX){// Frozen: heavy snowfall
for(let i=0;i<3;i++){const windGust=Math.sin(fr*0.008)*1.5;
weatherParts.push({x:Math.random()*W,y:-10,vx:windGust+(Math.random()-.5)*.8,vy:.6+Math.random()*1.5,
life:200+Math.random()*150,ml:350,size:1+Math.random()*3,color:`rgba(${210+Math.random()*45},${220+Math.random()*35},255,${0.1+Math.random()*0.15})`,type:'snow'})}}
if(bIdx===4&&fr%4===0&&weatherParts.length<WEATHER_MAX){// Void: reality fragments
weatherParts.push({x:Math.random()*W,y:Math.random()*H,vx:0,vy:0,
life:30+Math.random()*40,ml:70,size:2+Math.random()*8,color:'rgba(180,80,255,0.08)',type:'glitch',
gx:Math.random()*W,gy:Math.random()*H})}
// Update
for(let i=weatherParts.length-1;i>=0;i--){const p=weatherParts[i];p.x+=p.vx;p.y+=p.vy;p.life--;
if(p.type==='dust'){p.vx+=Math.sin(fr*0.02+p.x*0.01)*0.01;p.vy+=Math.cos(fr*0.015+p.y*0.01)*0.01}
if(p.type==='snow'){p.vx+=Math.sin(fr*0.01+i)*0.02}
if(p.life<=0||p.x<-20||p.x>W+20||p.y<-20||p.y>H+20)weatherParts.splice(i,1)}}
function drawWeather(c){if(!weatherParts.length)return;
for(const p of weatherParts){const a=Math.min(1,p.life/p.ml)*Math.min(1,(p.ml-p.life)/20);
c.globalAlpha=a;c.fillStyle=p.color;
if(p.type==='rain'){c.strokeStyle=p.color;c.lineWidth=1;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-p.vx*3,p.y-p.vy*3);c.stroke()}
else if(p.type==='glitch'){c.fillRect(p.gx,p.gy,p.size,2);c.fillRect(p.gx+Math.random()*10-5,p.gy+3,p.size*0.6,1)}
else if(p.type==='snow'){c.beginPath();c.arc(p.x,p.y,p.size,0,Math.PI*2);c.fill();
if(p.size>2){c.globalAlpha=a*0.3;c.beginPath();c.arc(p.x,p.y,p.size*2,0,Math.PI*2);c.fill()}}
else{c.beginPath();c.arc(p.x,p.y,p.size,0,Math.PI*2);c.fill()}}
c.globalAlpha=1;
// Frozen: frost creeping on screen edges
if(bio.i===3){const frostA=0.06+Math.sin(fr*0.02)*0.02;
c.fillStyle=`rgba(180,220,255,${frostA})`;
const edgeW=12+Math.sin(fr*0.03)*4;
// Top frost edge with icicle shapes
for(let x=0;x<W;x+=15){const ih=edgeW+Math.sin(x*0.1+fr*0.02)*6;
c.beginPath();c.moveTo(x,0);c.lineTo(x+8,0);c.lineTo(x+4,ih);c.fill()}
// Bottom frost
for(let x=0;x<W;x+=18){const ih=edgeW*0.7+Math.sin(x*0.08)*4;
c.beginPath();c.moveTo(x,H);c.lineTo(x+6,H);c.lineTo(x+3,H-ih);c.fill()}}
// Void: screen tear lines
if(bio.i===4&&fr%30<2){c.fillStyle='rgba(180,80,255,0.06)';const ty=Math.random()*H;
c.fillRect(0,ty,W,1+Math.random()*3);c.fillRect(Math.random()*W*0.3,ty-2,W*0.4,1)}}

/* ═══════════════════════════════════════════════════
   v9.0 BOSS INTRODUCTION CINEMATIC
   ═══════════════════════════════════════════════════ */
let bossIntroActive=false,bossIntroIdx=0,bossIntroPhase=0;
function playBossIntro(idx){bossIntroActive=true;bossIntroT=0;bossIntroIdx=idx;bossIntroPhase=0;
MUS.tgtInt=0.2;sfx('boss_intro');ia()}
function updateBossIntro(dt){if(!bossIntroActive)return false;bossIntroT+=dt;
if(bossIntroT>180){// Intro complete — start fight
bossIntroActive=false;bossIntroPhase=0;setBossMusic(true,bossIntroIdx);return false}
if(bossIntroT>10&&bossIntroPhase===0){bossIntroPhase=1;// Darken + boss-specific emergence audio
const ba=BOSS_AUDIO[bossIntroIdx]||BOSS_AUDIO[0];
if(ac){const n=ac.currentTime;for(let i=0;i<3;i++){const o=ac.createOscillator(),g=ac.createGain();
o.type=ba.type;o.frequency.value=ba.drone+i*15;g.gain.setValueAtTime(0.04,n+i*0.3);g.gain.exponentialRampToValueAtTime(0.001,n+i*0.3+1);
o.connect(g);g.connect(masterGain);o.start(n+i*0.3);o.stop(n+i*0.3+1.2)}}
// Biome-themed emergence particles
const bl2=BOSS_LORE[bossIntroIdx]||BOSS_LORE[0];
for(let bp=0;bp<30;bp++){const ba2=Math.random()*Math.PI*2,spd=1+Math.random()*3;
parts.push({x:W/2+Math.cos(ba2)*20,y:H*0.55+Math.sin(ba2)*20,vx:Math.cos(ba2)*spd,vy:Math.sin(ba2)*spd-1,
life:40+Math.random()*40,ml:80,color:bl2.color,size:1.5+Math.random()*3,shape:'circle',grav:-0.02,blend:'lighter'})}}
if(bossIntroT>50&&bossIntroPhase===1){bossIntroPhase=2;// Name reveal with boss-specific stinger
const ba=BOSS_AUDIO[bossIntroIdx]||BOSS_AUDIO[0];musStingerCustom(ba.stinger);shk=8}
if(bossIntroT>120&&bossIntroPhase===2){bossIntroPhase=3;// Ready
flash(BOSS_LORE[bossIntroIdx]?.color||'#ff4444',0.15);shk=15;chromAb=8;
addShockwave(W/2,H/2,200,BOSS_LORE[bossIntroIdx]?.color||'#ff4444',20)}
return true}
function drawBossIntro(c){if(!bossIntroActive)return;
const bl=BOSS_LORE[bossIntroIdx]||BOSS_LORE[0];const prog=bossIntroT/180;
// Darken overlay
const darkA=Math.min(0.85,bossIntroT/40*0.85);c.fillStyle=`rgba(4,4,12,${darkA})`;c.fillRect(0,0,W,H);
// Phase 1: Boss silhouette rises
if(bossIntroPhase>=1){const silA=Math.min(1,(bossIntroT-10)/40);const riseY=H*0.55+Math.max(0,(1-silA)*80);
c.save();c.translate(W/2,riseY);
// Dramatic aura rings
const auraR=60+Math.sin(bossIntroT*0.08)*15;for(let r=3;r>=0;r--){
c.globalAlpha=silA*0.08*(4-r);c.fillStyle=bl.color;c.beginPath();c.arc(0,0,auraR+r*25,0,Math.PI*2);c.fill()}
// Boss body silhouette
c.globalAlpha=silA*0.9;c.fillStyle=darkenColor(bl.color,40);
c.beginPath();c.ellipse(0,0,28,34,0,0,Math.PI*2);c.fill();
// Crown/horns
c.fillStyle=bl.color;c.beginPath();c.moveTo(-18,-28);c.lineTo(-12,-42);c.lineTo(-6,-30);c.fill();
c.beginPath();c.moveTo(18,-28);c.lineTo(12,-42);c.lineTo(6,-30);c.fill();
// Eye
const eyeGlow=Math.sin(bossIntroT*0.1)*0.3+0.7;c.fillStyle=bl.color;c.shadowColor=bl.color;c.shadowBlur=20*eyeGlow;
c.beginPath();c.ellipse(0,-8,4,6*eyeGlow,0,0,Math.PI*2);c.fill();c.shadowBlur=0;
c.restore()}
// Phase 2: Name typewriter
if(bossIntroPhase>=2){const nameT=Math.min(1,(bossIntroT-50)/30);const name=bl.name;
const visLen=Math.floor(name.length*nameT);const visName=name.substring(0,visLen);
c.globalAlpha=1;c.fillStyle=bl.color;c.shadowColor=bl.color;c.shadowBlur=30;
c.font='24px Silkscreen';c.textAlign='center';c.textBaseline='middle';c.fillText(visName,W/2,H*0.28);c.shadowBlur=0;
// Subtitle
if(nameT>=1){const descA=Math.min(1,(bossIntroT-80)/20);c.globalAlpha=descA*0.5;
c.font='10px Cinzel';c.fillStyle='rgba(200,180,255,0.6)';c.fillText(bl.desc.substring(0,Math.floor(bl.desc.length*descA)),W/2,H*0.34)}}
// Phase 3: Flash + ready
if(bossIntroPhase>=3){const readyA=Math.sin((bossIntroT-120)*0.1)*0.3+0.7;
c.globalAlpha=readyA;c.fillStyle='rgba(255,255,255,0.6)';c.font='10px Silkscreen';c.textAlign='center';
c.fillText('PREPARE YOURSELF',W/2,H*0.75)}
c.globalAlpha=1}

/* ═══════════════════════════════════════════════════
   v9.0 SCREEN TRANSITIONS — dramatic floor/death/victory transitions
   ═══════════════════════════════════════════════════ */
let transEffect=null;
function startTransition(type,duration,color){transEffect={type,t:0,dur:duration||80,color:color||'#06060c',phase:0}}
function drawTransitionEffect(c){if(!transEffect)return;const te=transEffect;const prog=te.t/te.dur;
if(te.type==='void_consume'){// Void tendrils consume screen
const n=12;for(let i=0;i<n;i++){const angle=Math.PI*2/n*i;const len=prog<0.5?prog*2*Math.max(W,H)*0.8:Math.max(W,H)*0.8;
const cx2=W/2,cy2=H/2;c.fillStyle=te.color;c.globalAlpha=0.12;
c.beginPath();c.moveTo(cx2,cy2);
for(let d=0;d<len;d+=10){const wobble=Math.sin(d*0.05+i*2+fr*0.1)*20;
c.lineTo(cx2+Math.cos(angle)*d+Math.cos(angle+Math.PI/2)*wobble,cy2+Math.sin(angle)*d+Math.sin(angle+Math.PI/2)*wobble)}
c.lineTo(cx2+Math.cos(angle+0.15)*len,cy2+Math.sin(angle+0.15)*len);c.closePath();c.fill()}
if(prog>0.4){c.globalAlpha=Math.min(1,(prog-0.4)/0.2);c.fillStyle=te.color;c.fillRect(0,0,W,H)}
if(prog>0.6){c.globalAlpha=1-(prog-0.6)/0.4;c.fillStyle=te.color;c.fillRect(0,0,W,H)}}
else if(te.type==='shatter'){// Screen cracks then shatters
if(prog<0.5){c.strokeStyle='rgba(255,255,255,0.3)';c.lineWidth=2;
const cracks=6;for(let i=0;i<cracks;i++){const sa=Math.PI*2/cracks*i+0.3;const sl=prog*2*Math.max(W,H)*0.4;
c.beginPath();c.moveTo(W/2,H/2);let cx2=W/2,cy2=H/2;
for(let s=0;s<sl;s+=20){cx2+=Math.cos(sa+Math.sin(s*0.1)*0.3)*20;cy2+=Math.sin(sa+Math.sin(s*0.1)*0.3)*20;c.lineTo(cx2,cy2)}c.stroke()}}
else{const shatterProg=(prog-0.5)*2;c.globalAlpha=shatterProg;c.fillStyle=te.color;c.fillRect(0,0,W,H)}}
else if(te.type==='drain'){// Color drains downward
const drainH=H*prog*1.2;c.fillStyle=te.color;c.globalAlpha=0.8;c.fillRect(0,0,W,Math.min(H,drainH));
if(prog>0.8){c.globalAlpha=(prog-0.8)/0.2;c.fillRect(0,0,W,H)}}
else if(te.type==='golden_flood'){// Golden light floods upward
const floodH=H*(1-prog)*1.2;c.fillStyle='rgba(255,200,60,0.15)';c.globalAlpha=Math.min(1,prog*2);
c.fillRect(0,Math.max(0,floodH),W,H-floodH);
if(prog>0.5){c.fillStyle=te.color;c.globalAlpha=(prog-0.5)*2;c.fillRect(0,0,W,H)}}
// v10.0 Biome-specific transitions
else if(te.type==='spore_spread'){// Fungal: green circles expand
const n=8;for(let i=0;i<n;i++){const cx2=W*(0.1+0.8*((i*137+23)%100)/100),cy2=H*(0.1+0.8*((i*211+47)%100)/100);
const r=prog*Math.max(W,H)*0.3*(1+i*0.1);c.fillStyle='rgba(60,180,80,0.1)';c.beginPath();c.arc(cx2,cy2,r,0,Math.PI*2);c.fill()}
if(prog>0.5){c.globalAlpha=Math.min(1,(prog-0.5)*2.5);c.fillStyle=te.color;c.fillRect(0,0,W,H)}
if(prog>0.7){c.globalAlpha=1-(prog-0.7)/0.3;c.fillStyle=te.color;c.fillRect(0,0,W,H)}}
else if(te.type==='flame_wipe'){// Infernal: fire sweeps bottom to top
const wipeY=H*(1-prog*1.3);c.fillStyle='rgba(255,80,20,0.15)';
for(let x=0;x<W;x+=6){const h=20+Math.sin(x*0.1+fr*0.2)*10;c.fillRect(x,wipeY-h,6,h)}
if(prog>0.4){c.globalAlpha=Math.min(1,(prog-0.4)*2);c.fillStyle=te.color;c.fillRect(0,0,W,H)}
if(prog>0.7){c.globalAlpha=1-(prog-0.7)/0.3;c.fillStyle=te.color;c.fillRect(0,0,W,H)}}
else if(te.type==='ice_shatter'){// Frozen: cracks from center then white flash
if(prog<0.5){c.strokeStyle='rgba(180,220,255,0.5)';c.lineWidth=2;
for(let i=0;i<8;i++){const sa=Math.PI*2/8*i;const sl=prog*2*Math.max(W,H)*0.5;
c.beginPath();let lx=W/2,ly=H/2;
for(let s=0;s<sl;s+=15){lx+=Math.cos(sa+Math.sin(s*0.08+i)*0.4)*15;ly+=Math.sin(sa+Math.sin(s*0.08+i)*0.4)*15;c.lineTo(lx,ly)}c.stroke()}}
if(prog>0.4){c.globalAlpha=Math.min(1,(prog-0.4)*3);c.fillStyle='rgba(200,230,255,0.9)';c.fillRect(0,0,W,H)}
if(prog>0.7){c.globalAlpha=1-(prog-0.7)/0.3;c.fillStyle=te.color;c.fillRect(0,0,W,H)}}
else if(te.type==='glitch_tear'){// Void: horizontal scanlines with offsets
if(prog<0.6){for(let y=0;y<H;y+=4){if(Math.random()<prog*0.4){const off=(Math.random()-.5)*prog*40;
c.globalAlpha=0.1+prog*0.2;c.drawImage(gc,0,y,W,4,off,y,W,4)}}}
if(prog>0.3){c.globalAlpha=Math.min(1,(prog-0.3)*2);c.fillStyle=te.color;c.fillRect(0,0,W,H)}
if(prog>0.7){c.globalAlpha=1-(prog-0.7)/0.3;c.fillStyle=te.color;c.fillRect(0,0,W,H)}}
c.globalAlpha=1;te.t++;if(te.t>=te.dur)transEffect=null}

/* ═══════════════════════════════════════════════════
   v9.0 ROOM MODIFIER SYSTEM — random room-level challenges
   ═══════════════════════════════════════════════════ */
const ROOM_MODS=[
{name:'DARKNESS',icon:'●',color:'#8888aa',desc:'Light radius halved',
apply:()=>{P._savedLR=P.lightRadius||280;P.lightRadius=140},remove:()=>{P.lightRadius=P._savedLR||280}},
{name:'SWARM',icon:'◆',color:'#ff8844',desc:'2x enemies, half HP',
apply:()=>{for(const e of ents){e.hp=Math.ceil(e.hp*0.5);e.mhp=Math.ceil(e.mhp*0.5)}},remove:()=>{}},
{name:'CURSED',icon:'☠',color:'#aa44ff',desc:'No healing',
apply:()=>{P._cursedRoom=true},remove:()=>{P._cursedRoom=false}},
{name:'GOLDEN',icon:'★',color:'#ffcc00',desc:'3x gold drops',
apply:()=>{P._goldenRoom=true},remove:()=>{P._goldenRoom=false}},
{name:'BURNING',icon:'◆',color:'#ff4422',desc:'Floor catches fire',
apply:()=>{cR._burnTimer=0;cR._burnTiles=[]},remove:()=>{}},
{name:'ECHO',icon:'◎',color:'#88ccff',desc:'Attacks echo',
apply:()=>{P._echoRoom=true},remove:()=>{P._echoRoom=false}},
{name:'VOLATILE',icon:'⚡',color:'#ffaa00',desc:'Enemies explode on death',
apply:()=>{P._volatileRoom=true},remove:()=>{P._volatileRoom=false}}];
let curRoomMod=null;
function rollRoomMod(){if(cR.type==='boss'||cR.type==='shop'||cR.type==='start'||cR.type==='lore')return null;
if(Math.random()>0.25+flr*0.02)return null;// ~25-45% chance scaling with floor
return ROOM_MODS[Math.floor(Math.random()*ROOM_MODS.length)]}

/* ═══════════════════════════════════════════════════
   v9.0 ENVIRONMENTAL KILL SYSTEM
   ═══════════════════════════════════════════════════ */
function checkEnvironmentalDmg(e,sdt){
if(!e||e.type==='boss')return;
// Wall collision damage at high velocity
const spd=Math.hypot(e.vx,e.vy);
if(spd>6){const ntx=Math.floor((e.x+e.vx*2)/TS),nty=Math.floor((e.y+e.vy*2)/TS);
if(ntx>=0&&ntx<RW&&nty>=0&&nty<RH&&cR.tiles[nty][ntx]===1){
const wallDmg=Math.floor(spd*0.8)+2;e.hp-=wallDmg;e.vx*=-0.5;e.vy*=-0.5;
// v10.0 Wall slam: stun + shockwave
e.frozen=Math.max(e.frozen||0,20);
ft(e.x,e.y-14,'WALL SLAM!','#ffaa44',1);emit(e.x,e.y,8,'#ffaa44',3,14,2);addShockwave(e.x,e.y,30,'#ffaa44',8);sfx('smash');shk=5;
if(e.hp<=0){ft(e.x,e.y-28,'WALL KILL!','#ffcc00',1.2);
const bonusXP=Math.ceil(e.xp*0.5);P.xp+=bonusXP;kills++;tKills++;addCmb();sfx('kill');typedDeathBurst(e);
const bonusGold=Math.ceil(e.gold*0.5);picks.push({x:e.x,y:e.y,type:'gold',val:bonusGold,life:300,vy:-1.5,vx:(Math.random()-.5)*2});
e.hp=0;e.animState='die';e.animFrame=0;return true}}}
// Lava tile damage
const etx=Math.floor(e.x/TS),ety=Math.floor(e.y/TS);
if(etx>=0&&etx<RW&&ety>=0&&ety<RH&&cR.tiles[ety][etx]===3&&bio.hazard){
if(bio.hazard.type==='lava'&&fr%30===0){e.hp-=3;applyStatus(e,'burn',60);ft(e.x,e.y-14,'LAVA!','#ff6633',0.8);emit(e.x,e.y,4,'#ff4400',2,10,1.5);
if(e.hp<=0){ft(e.x,e.y-28,'LAVA KILL!','#ff6633',1.2);kills++;tKills++;addCmb();sfx('kill');typedDeathBurst(e);
e.hp=0;e.animState='die';e.animFrame=0;return true}}
// v10.0 Spore tile: poison enemies knocked into it
if(bio.hazard.type==='spore'&&fr%30===0){applyStatus(e,'poison',60);ft(e.x,e.y-14,'SPORE!','#66ff44',0.6);emit(e.x,e.y,3,'#66ff44',1,8,1)}}
// Trap damage to enemies
for(const trap of cR.traps){if(!trap.on)continue;const tx2=trap.tx*TS+TS/2,ty2=trap.ty*TS+TS/2;
if(Math.abs(e.x-tx2)<TS*.4&&Math.abs(e.y-ty2)<TS*.4&&fr%20===0){
e.hp-=2;ft(e.x,e.y-14,'-2','#ff6688');if(e.hp<=0){ft(e.x,e.y-28,'TRAP KILL!','#ff4488',1.2);
kills++;tKills++;addCmb();sfx('kill');typedDeathBurst(e);e.hp=0;e.animState='die';e.animFrame=0;return true}}}
return false}

/* ═══════════════════════════════════════════════════
   v9.0 SETTINGS SYSTEM
   ═══════════════════════════════════════════════════ */
let gameSettings={shakeIntensity:1,crtEnabled:true,particleDensity:1,showFPS:false,
masterVol:0.6,sfxVol:1,musicVol:1};
function loadSettings(){try{const s=localStorage.getItem('vd_settings');if(s)gameSettings={...gameSettings,...JSON.parse(s)}}catch(e){}}
function saveSettings(){try{localStorage.setItem('vd_settings',JSON.stringify(gameSettings))}catch(e){}}
loadSettings();
function openSettings(){document.getElementById('settings-overlay').style.display='flex';
document.getElementById('s-master').value=gameSettings.masterVol*100;
document.getElementById('s-sfx').value=gameSettings.sfxVol*100;
document.getElementById('s-music').value=gameSettings.musicVol*100;
document.getElementById('s-shake').value=gameSettings.shakeIntensity;
document.getElementById('s-crt').checked=gameSettings.crtEnabled;
document.getElementById('s-parts').value=gameSettings.particleDensity>=0.8?'1':gameSettings.particleDensity>=0.4?'0.6':'0.25';
document.getElementById('s-fps').checked=gameSettings.showFPS}
function closeSettings(){document.getElementById('settings-overlay').style.display='none';saveSettings()}

/* ═══════════════════════════════════════════════════
   v9.0 FPS COUNTER
   ═══════════════════════════════════════════════════ */
let fpsFrames=0,fpsLast=performance.now(),fpsDisplay=60,fpsLow=60;
function updateFPS(){fpsFrames++;const now=performance.now();if(now-fpsLast>=500){fpsDisplay=Math.round(fpsFrames*1000/(now-fpsLast));fpsLow=Math.min(fpsLow,fpsDisplay);fpsFrames=0;fpsLast=now;
// Auto LOD: reduce particles if FPS drops
if(fpsDisplay<40)gameSettings.particleDensity=Math.max(0.25,gameSettings.particleDensity-0.1);
else if(fpsDisplay>55&&gameSettings.particleDensity<1)gameSettings.particleDensity=Math.min(1,gameSettings.particleDensity+0.05)}}

/* ═══════════════════════════════════════════════════
   v9.0 CHALLENGE CURSE SYSTEM — Hades-style difficulty modifiers
   ═══════════════════════════════════════════════════ */
const CURSES=[
{name:'FRAGILE',desc:'-30% Max HP',icon:'♥',color:'#ff4466',scoreMult:1.15,apply:p=>{p.mhp=Math.ceil(p.mhp*0.7);p.hp=Math.min(p.hp,p.mhp)}},
{name:'RELENTLESS',desc:'No enemy knockback',icon:'⚔',color:'#ff8844',scoreMult:1.10,apply:p=>{p._noKnockback=true}},
{name:'SCARCITY',desc:'No health drops',icon:'✦',color:'#aa44ff',scoreMult:1.20,apply:p=>{p._noHealDrops=true}},
{name:'HASTE',desc:'Everything 20% faster',icon:'⚡',color:'#44ccff',scoreMult:1.15,apply:p=>{p._hasteWorld=true}},
{name:'GLASS',desc:'+50% damage dealt & taken',icon:'◇',color:'#ffcc00',scoreMult:1.25,apply:p=>{p.bd*=1.5;p._glassCurse=true}},
{name:'FAMINE',desc:'No shop healing',icon:'☠',color:'#66ff44',scoreMult:1.10,apply:p=>{p._famineCurse=true}}];
let activeCurses=[],curseScoreMult=1;
// v9.0 Curse selection UI
function renderCursePanel(){const grid=document.getElementById('curse-grid');if(!grid)return;grid.innerHTML='';
CURSES.forEach((c,i)=>{const isActive=activeCurses.includes(c);
const btn=document.createElement('div');
btn.style.cssText=`font-family:Silkscreen,monospace;font-size:7px;padding:4px 8px;border:1px solid ${isActive?c.color:'rgba(180,140,255,0.15)'};
border-radius:3px;cursor:pointer;color:${isActive?c.color:'rgba(200,180,255,0.3)'};background:${isActive?'rgba(255,100,100,0.1)':'rgba(10,10,20,0.5)'};
letter-spacing:1px;transition:all .2s;user-select:none`;
btn.textContent=`${c.icon} ${c.name} +${Math.round((c.scoreMult-1)*100)}%`;
btn.title=c.desc;
btn.onclick=()=>{if(activeCurses.includes(c))activeCurses=activeCurses.filter(ac=>ac!==c);else activeCurses.push(c);
curseScoreMult=activeCurses.reduce((m,ac)=>m*ac.scoreMult,1);renderCursePanel()};
grid.appendChild(btn)});
const multEl=document.getElementById('curse-mult');
if(multEl)multEl.textContent=activeCurses.length?`SCORE: x${curseScoreMult.toFixed(2)}`:''}
// v9.0 Codex/Bestiary system
let codexData={enemies:{},weapons:{},bosses:{},biomes:{}};
function loadCodex(){try{const s=localStorage.getItem('vd_codex');if(s)codexData={...codexData,...JSON.parse(s)}}catch(e){}}
function saveCodex(){try{localStorage.setItem('vd_codex',JSON.stringify(codexData))}catch(e){}}
loadCodex();
function recordEnemy(type){if(!codexData.enemies[type])codexData.enemies[type]={seen:0,killed:0};codexData.enemies[type].seen++;saveCodex()}
function recordEnemyKill(type){if(!codexData.enemies[type])codexData.enemies[type]={seen:0,killed:0};codexData.enemies[type].killed++;saveCodex()}
function recordWeapon(name){if(!codexData.weapons[name])codexData.weapons[name]=1;saveCodex()}
function recordBossKill(name){if(!codexData.bosses[name])codexData.bosses[name]=0;codexData.bosses[name]++;saveCodex()}
function recordBiome(idx){codexData.biomes[idx]=true;saveCodex()}
function openCodex(){const overlay=document.getElementById('codex-overlay');if(!overlay)return;overlay.style.display='flex';
const content=document.getElementById('codex-content');
const ENEMY_INFO={rat:{name:'RAT',desc:'Vermin that infest the upper halls.'},slime:{name:'SLIME',desc:'Gelatinous mass that divides when cornered.'},
bat:{name:'BAT',desc:'Swift flyers of the dark corridors.'},spider:{name:'SPIDER',desc:'Web-spinners that trap the unwary.'},
skel:{name:'SKELETON',desc:'Animated bones of fallen warriors.'},mage:{name:'MAGE',desc:'Caster that hurls fire from a distance.'},
brute:{name:'BRUTE',desc:'Massive, armored, and slow but devastating.'},assassin:{name:'ASSASSIN',desc:'Lightning-fast dashes through the shadows.'},
wraith:{name:'WRAITH',desc:'Ethereal beings that phase through walls.'},golem:{name:'GOLEM',desc:'Constructed from stone, shakes the earth.'},
necromancer:{name:'NECROMANCER',desc:'Raises the dead to fight for them.'},swarmer:{name:'SWARMER',desc:'Tiny but relentless in numbers.'},
shaman:{name:'SHAMAN',desc:'Heals and empowers allied monsters.'},knight:{name:'KNIGHT',desc:'Armored warrior with shield blocks.'},
stalker:{name:'STALKER',desc:'Nearly invisible predator.'},revenant:{name:'REVENANT',desc:'Ghostly mirror of the player.'},
mimic:{name:'MIMIC',desc:'Chest that bites back.'}};
let html='<div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center">';
// Enemies
html+='<div style="flex:1;min-width:200px"><div style="font-family:Silkscreen,monospace;font-size:10px;color:#c8a0ff;letter-spacing:3px;margin-bottom:8px">BESTIARY</div>';
for(const[type,info]of Object.entries(ENEMY_INFO)){const data=codexData.enemies[type];
const discovered=data&&data.seen>0;
html+=`<div style="padding:4px 8px;margin:2px 0;border:1px solid rgba(180,140,255,${discovered?0.15:0.05});border-radius:2px;background:rgba(10,10,20,0.5)">`;
html+=`<span style="font-family:Silkscreen,monospace;font-size:7px;color:${discovered?'rgba(200,180,255,0.5)':'rgba(100,80,120,0.3)'};letter-spacing:1px">${discovered?info.name:'???'}</span>`;
if(discovered)html+=`<span style="font-family:'JetBrains Mono',monospace;font-size:6px;color:rgba(200,180,255,0.25);margin-left:8px">Killed: ${data.killed||0}</span>`;
html+='</div>'}
html+='</div>';
// Bosses
html+='<div style="flex:1;min-width:200px"><div style="font-family:Silkscreen,monospace;font-size:10px;color:#ffcc00;letter-spacing:3px;margin-bottom:8px">BOSSES</div>';
for(const bl of BOSS_LORE){const defeated=codexData.bosses[bl.name]>0;
html+=`<div style="padding:4px 8px;margin:2px 0;border:1px solid ${defeated?bl.color+'33':'rgba(100,80,120,0.08)'};border-radius:2px;background:rgba(10,10,20,0.5)">`;
html+=`<span style="font-family:Silkscreen,monospace;font-size:7px;color:${defeated?bl.color:'rgba(100,80,120,0.3)'};letter-spacing:1px">${defeated?bl.name:'??? ??? ???'}</span>`;
if(defeated)html+=`<div style="font-family:Cinzel,serif;font-size:7px;color:rgba(200,180,255,0.3);font-style:italic;margin-top:2px">${bl.desc}</div>`;
html+='</div>'}
html+='</div>';
// Completion
const totalEnemies=Object.keys(ENEMY_INFO).length;const discoveredEnemies=Object.values(codexData.enemies).filter(e=>e.seen>0).length;
const totalBosses=BOSS_LORE.length;const defeatedBosses=Object.values(codexData.bosses).filter(v=>v>0).length;
const pct=Math.round((discoveredEnemies+defeatedBosses)/(totalEnemies+totalBosses)*100);
html+='</div>';
html+=`<div style="font-family:Silkscreen,monospace;font-size:8px;color:rgba(200,180,255,0.3);letter-spacing:2px;margin-top:12px">COMPLETION: ${pct}% (${discoveredEnemies}/${totalEnemies} enemies, ${defeatedBosses}/${totalBosses} bosses)</div>`;
content.innerHTML=html}
function closeCodex(){document.getElementById('codex-overlay').style.display='none'}
// v9.0 Onboarding tutorial hint system
let tutorialHints={firstEnemy:false,firstChest:false,firstLowHP:false,firstShop:false,firstBoss:false};
function loadTutorial(){try{const s=localStorage.getItem('vd_tutorial');if(s)tutorialHints={...tutorialHints,...JSON.parse(s)}}catch(e){}}
function saveTutorial(){try{localStorage.setItem('vd_tutorial',JSON.stringify(tutorialHints))}catch(e){}}
loadTutorial();
let activeHint=null,hintTimer=0;
function showHint(key,text){if(tutorialHints[key]||activeHint)return;tutorialHints[key]=true;saveTutorial();
activeHint={text,life:180};hintTimer=180}
function updateHint(){if(activeHint){activeHint.life--;if(activeHint.life<=0)activeHint=null}}
function drawHint(c){if(!activeHint)return;const a=Math.min(1,activeHint.life/20,1-(180-activeHint.life)/160);
c.save();c.globalAlpha=a*0.7;c.fillStyle='rgba(10,10,20,0.8)';const tw=c.measureText?200:200;
c.fillRect(W/2-tw/2-10,H-60,tw+20,30);c.globalAlpha=a;
c.font='8px Silkscreen';c.fillStyle='#c8a0ff';c.textAlign='center';
c.fillText(activeHint.text,W/2,H-42);c.restore()}

/* ═══════════════════════════════════════════════════
   v9.0 FLOOR LORE NARRATION
   ═══════════════════════════════════════════════════ */
const FLOOR_LORE=[
['The Citadel\'s grand halls have become a tomb of whispers...','Echoes of Lord Aldric\'s court still linger in the stone...','The chorus grows louder. The Whisper King knows you are here...','The Whisper King awaits in his throne of stolen voices...'],
['The royal gardens have spread far beyond their walls...','Spores drift like memories of a botanist\'s dream...','The mycelium pulses. Thera\'s consciousness pervades everything...','At the heart of the growth, something massive breathes...'],
['The great forge still burns, though its master is long changed...','Fragments of the broken seal litter the corridors...','The heat intensifies. Three hundred years of guilt fuel these flames...','The Forge-Master tends his eternal flame. It hungers...'],
['Ice-locked faces stare from the walls — the queen\'s subjects, preserved forever...','Frozen tears mark the path to the Sovereign\'s throne...','Queen Selara\'s lullaby echoes through the frost...','The Frost Sovereign sits upon her throne of regret...'],
['Reality thins like parchment. The Void bleeds through...','The High Priest\'s runes still glow, holding open the wound...','The boundary between worlds has almost dissolved...','The Void Herald guards the final threshold...']];

/* ═══════════════════════════════════════════════════
   RENDERING ENGINE — v5 procedural entities, textured tiles, enhanced effects
   ═══════════════════════════════════════════════════ */
function draw(){ct.save();
const leadX=P.vx*10,leadY=P.vy*10;
const tcx=P.x+leadX-W/2,tcy=P.y+leadY-H/2;
cX+=(tcx-cX)*.08;cY+=(tcy-cY)*.08;
cX=Math.max(-TS*2,Math.min(RPX-W+TS*2,cX));cY=Math.max(-TS*2,Math.min(RPY-H+TS*2,cY));
if(RPX<W)cX=(RPX-W)/2;if(RPY<H)cY=(RPY-H)/2;
// v5 camera zoom
if(camZoom!==1){const cx=W/2,cy=H/2;ct.translate(cx,cy);ct.scale(camZoom,camZoom);ct.translate(-cx,-cy)}
if(shk>0){const si=gameSettings.shakeIntensity||1;const sa=shkAngle||Math.random()*Math.PI*2;
const shkX=(Math.cos(sa+fr)*(shk*.6)+Math.sin(fr*2.5)*(shk*.2))*si;
const shkY=(Math.sin(sa+fr*1.3)*(shk*.6)+Math.cos(fr*2.5)*(shk*.2))*si;
ct.translate(shkX,shkY);
// v10 Rotational shake on heavy hits
if(shk>10){const rotAmt=Math.sin(fr*3)*(shk-10)*0.0008*si;ct.translate(W/2,H/2);ct.rotate(rotAmt);ct.translate(-W/2,-H/2)}}
// v6.1 directional camera punch
if(camPunchX!==0||camPunchY!==0){ct.translate(camPunchX,camPunchY);camPunchX*=.8;camPunchY*=.8;if(Math.abs(camPunchX)<.1)camPunchX=0;if(Math.abs(camPunchY)<.1)camPunchY=0}
ct.translate(-cX,-cY);ct.fillStyle=bio.fl;ct.fillRect(cX-60,cY-60,W+120,H+120);
if(!cR){ct.restore();return}

// ═══ v9.0 PARALLAX DEPTH LAYERS — biome atmospheric background ═══
drawParallax(ct,cX,cY);

// ═══ TILES — v8.0 cached procedural textures + wall-edge shadows ═══
for(let ty=0;ty<RH;ty++)for(let tx=0;tx<RW;tx++){const tile=cR.tiles[ty][tx],px=tx*TS,py=ty*TS;
if(px+TS<cX-10||px>cX+W+10||py+TS<cY-10||py>cY+H+10)continue;
if(tile===1){
// v8 cached wall tile
const wv=(tx*73+ty*37+flr)%8;
if(tileCache['w'+wv])ct.drawImage(tileCache['w'+wv],px,py);
else{ct.fillStyle=bio.w1;ct.fillRect(px,py,TS,TS);ct.fillStyle=bio.w2;ct.fillRect(px+2,py+2,TS-4,TS-4)}
// Animated biome overlays at raised alpha
const wd=bio.wallDetail;const hash=(tx*73+ty*37+flr)%17;
if(wd==='ember'&&hash<5){ct.fillStyle=`rgba(255,100,30,${0.18+Math.sin(fr*.1+tx*2+ty)*0.08})`;ct.shadowBlur=4;ct.shadowColor='rgba(255,80,20,0.5)';ct.fillRect(px+4+hash*4,py+4+Math.sin(fr*.08+tx)*3,4,4);ct.shadowBlur=0}
else if(wd==='glitch'&&hash<4&&fr%16<8){ct.fillStyle=`rgba(180,60,255,${0.12+Math.sin(fr*.15)*0.05})`;ct.fillRect(px,py+hash*5,TS,2);ct.fillRect(px+hash*3,py,2,TS)}}
else if(tile===0||tile===2||tile===3){
// v8 cached floor tile
const fv=(tx*7+ty*13+flr)%4;
if(tileCache['f'+fv])ct.drawImage(tileCache['f'+fv],px,py);
else{ct.fillStyle=bio.fl;ct.fillRect(px,py,TS,TS)}
// v9.0 Pseudo-3D wall depth faces + enhanced ambient occlusion
const wAbove=ty>0&&cR.tiles[ty-1][tx]===1,wLeft=tx>0&&cR.tiles[ty][tx-1]===1;
const wRight=tx<RW-1&&cR.tiles[ty][tx+1]===1,wBelow=ty<RH-1&&cR.tiles[ty+1][tx]===1;
if(wAbove){// Bottom face of wall above — visible 3D depth strip
const dh=10;const dg=ct.createLinearGradient(px,py,px,py+dh);
dg.addColorStop(0,darkenColor(bio.w1,35));dg.addColorStop(0.4,darkenColor(bio.w1,25));dg.addColorStop(1,'rgba(0,0,0,0)');
ct.fillStyle=dg;ct.fillRect(px,py,TS,dh);
// Brick texture on depth face
ct.fillStyle='rgba(0,0,0,0.1)';for(let bx=0;bx<TS;bx+=TS/3)ct.fillRect(px+bx,py,1,dh-2);
// Highlight line at wall-floor junction
ct.fillStyle='rgba(255,255,255,0.03)';ct.fillRect(px,py,TS,1)}
if(wLeft){// Right face of wall to left — side depth strip
const dw=8;const dg=ct.createLinearGradient(px,py,px+dw,py);
dg.addColorStop(0,darkenColor(bio.w1,40));dg.addColorStop(0.5,darkenColor(bio.w1,28));dg.addColorStop(1,'rgba(0,0,0,0)');
ct.fillStyle=dg;ct.fillRect(px,py,dw,TS);
ct.fillStyle='rgba(0,0,0,0.08)';for(let by=0;by<TS;by+=12)ct.fillRect(px,py+by,dw-2,1)}
// Corner ambient occlusion — darker where 2+ walls meet
if(wAbove&&wLeft){const cg=ct.createRadialGradient(px,py,0,px,py,14);
cg.addColorStop(0,darkenColor(bio.w1,45));cg.addColorStop(1,'rgba(0,0,0,0)');ct.fillStyle=cg;ct.fillRect(px,py,14,14)}
else if(wAbove&&!wLeft&&tx>0&&cR.tiles[ty-1][tx-1]!==1){// Soft corner shadow
ct.fillStyle='rgba(0,0,0,0.06)';ct.beginPath();ct.moveTo(px,py);ct.lineTo(px+8,py);ct.lineTo(px,py+8);ct.fill()}
if(wAbove&&wRight){const cg=ct.createRadialGradient(px+TS,py,0,px+TS,py,14);
cg.addColorStop(0,'rgba(0,0,0,0.15)');cg.addColorStop(1,'rgba(0,0,0,0)');ct.fillStyle=cg;ct.fillRect(px+TS-14,py,14,14)}
// Bottom wall edge highlight (wall below current floor)
if(wBelow){ct.fillStyle='rgba(0,0,0,0.06)';ct.fillRect(px,py+TS-4,TS,4)}
// Exit tile overlay
if(tile===2&&!ents.length){const pulse=Math.sin(fr*.05)*.3+.7;ct.fillStyle=bio.ac+(pulse*.25)+')';ct.fillRect(px+4,py+4,TS-8,TS-8);
ct.fillStyle=bio.ac+pulse+')';ct.font='bold 22px Silkscreen';ct.textAlign='center';ct.textBaseline='middle';ct.fillText('▼',px+TS/2,py+TS/2);
ct.shadowColor=bio.torchCol;ct.shadowBlur=18;ct.fillStyle=bio.ac+'0.4)';ct.beginPath();ct.arc(px+TS/2,py+TS/2,5,0,Math.PI*2);ct.fill();ct.shadowBlur=0}
// v5.1 biome hazard tiles
if(tile===3){const hz=bio.hazard;if(hz){
if(hz.type==='spore'){ct.fillStyle='rgba(100,200,100,0.1)';ct.beginPath();ct.arc(px+TS/2,py+TS/2,TS/2.5,0,Math.PI*2);ct.fill();
if(fr%12===0)emit(px+TS/2+(Math.random()-.5)*TS*.4,py+TS/2,1,'rgba(100,255,100,0.2)',.3,18,1.5,'circle')}
else if(hz.type==='lava'){const lp=Math.sin(fr*.04+tx*3+ty*7)*.15+.15;ct.fillStyle=`rgba(255,80,20,${lp})`;ct.fillRect(px+3,py+3,TS-6,TS-6);
ct.shadowBlur=6;ct.shadowColor='rgba(255,100,30,0.3)';ct.fillStyle=`rgba(255,200,50,${0.06+Math.sin(fr*.1)*0.03})`;ct.beginPath();ct.arc(px+TS/2,py+TS/2,TS/3+Math.sin(fr*.1)*3,0,Math.PI*2);ct.fill();ct.shadowBlur=0}
else if(hz.type==='ice'){ct.fillStyle='rgba(100,200,255,0.08)';ct.fillRect(px,py,TS,TS);ct.fillStyle='rgba(255,255,255,0.04)';ct.fillRect(px+6,py+4,TS/3,1.5)}
else if(hz.type==='gravity'){ct.strokeStyle='rgba(200,100,255,0.08)';ct.lineWidth=1;ct.beginPath();ct.arc(px+TS/2,py+TS/2,TS/3+Math.sin(fr*.06)*4,0,Math.PI*2);ct.stroke()}}}
// Animated floor overlays at raised alpha
const fd=bio.floorDetail;const fh=(tx*7+ty*13+flr)%17;
if(fd==='spores'&&fh===4){ct.fillStyle=`rgba(100,255,100,${0.04+Math.sin(fr*.05+tx)*0.02})`;ct.beginPath();ct.arc(px+TS/2+3,py+TS/2,2.5,0,Math.PI*2);ct.fill()}
else if(fd==='scorch'&&fh<3){ct.fillStyle=`rgba(255,60,20,${0.03+Math.sin(fr*.06+ty)*0.015})`;ct.beginPath();ct.arc(px+TS/2,py+TS/2,5+fh*2,0,Math.PI*2);ct.fill()}
else if(fd==='runes'&&fh===1){ct.strokeStyle=`rgba(160,80,255,${0.04+Math.sin(fr*.04+tx+ty)*0.02})`;ct.lineWidth=.8;ct.beginPath();ct.arc(px+TS/2,py+TS/2,5,0,Math.PI*2);ct.stroke()}}
// v7.0 Progressive world corruption
if(flr>=5&&Math.random()<0.002*flr){ct.fillStyle='rgba(80,40,40,0.15)';ct.fillRect(px+Math.random()*TS,py+Math.random()*TS,2,2)}
if(flr>=9&&tile===1&&Math.random()<0.005){ct.fillStyle='rgba(20,15,25,0.3)';ct.fillRect(px+2,py+2,TS-4,TS-4)}}

// v6 Entity floor reflections — subtle stretched shadows (v9.0 viewport culling)
const _margin=60;
for(const e of ents){if(e.x<cX-_margin||e.x>cX+W+_margin||e.y<cY-_margin||e.y>cY+H+_margin)continue;
if(e.animState==='spawn'&&!e.spawnDone)continue;if(e.animState==='die')continue;
ct.save();ct.translate(e.x,e.y+e.hh+4);ct.scale(1,-0.3);ct.globalAlpha=0.04;ct.fillStyle=e.color;
ct.beginPath();ct.ellipse(0,0,e.hw*0.9,e.hh*0.6,0,0,Math.PI*2);ct.fill();ct.restore()}

// v6.0 Footstep decals
for(let fi=footstepDecals.length-1;fi>=0;fi--){const fd=footstepDecals[fi];fd.life-=0.016;
if(fd.life<=0){footstepDecals.splice(fi,1);continue}
ct.globalAlpha=fd.life*0.15;ct.fillStyle=fd.color;ct.beginPath();ct.arc(fd.x,fd.y,2,0,Math.PI*2);ct.fill()}
ct.globalAlpha=1;
// v6.0 Scorch marks
for(let si=scorchMarks.length-1;si>=0;si--){const sm=scorchMarks[si];sm.a=Math.max(0,sm.a-0.0003);if(sm.a<=0.005){scorchMarks.splice(si,1);continue}ct.globalAlpha=sm.a;ct.fillStyle=sm.color;ct.beginPath();ct.arc(sm.x,sm.y,sm.r,0,Math.PI*2);ct.fill()}
ct.globalAlpha=1;
// v5 Blood splats with irregular polygon shapes
for(let bi=bloodSplats.length-1;bi>=0;bi--){const bs=bloodSplats[bi];bs.a=Math.max(0,bs.a-0.0005);if(bs.a<=0.005){bloodSplats.splice(bi,1);continue}ct.globalAlpha=bs.a;ct.fillStyle=bs.color;
if(bs.verts){ct.beginPath();ct.moveTo(bs.x+bs.verts[0].x,bs.y+bs.verts[0].y);
for(let v=1;v<bs.verts.length;v++)ct.lineTo(bs.x+bs.verts[v].x,bs.y+bs.verts[v].y);ct.closePath();ct.fill()}
else{ct.beginPath();ct.arc(bs.x,bs.y,bs.r,0,Math.PI*2);ct.fill()}}ct.globalAlpha=1;

// v5 Room decorations — enhanced alpha and detail
for(const d of cR.roomDecor){
if(d.x<cX-30||d.x>cX+W+30||d.y<cY-30||d.y>cY+H+30)continue;
ct.save();ct.translate(d.x,d.y);ct.rotate(d.rot);ct.globalAlpha=.35;
ct.fillStyle=bio.ac+'0.4)';
if(d.type==='skull'){ct.beginPath();ct.arc(0,-2,5*d.scale,0,Math.PI*2);ct.fill();ct.fillRect(-3*d.scale,2,6*d.scale,4*d.scale);
ct.fillStyle='rgba(0,0,0,0.15)';ct.fillRect(-2*d.scale,-3*d.scale,1.5*d.scale,1.5*d.scale);ct.fillRect(0.5*d.scale,-3*d.scale,1.5*d.scale,1.5*d.scale)}
else if(d.type==='mushroom'){ct.fillStyle=bio.ac+'0.35)';ct.beginPath();ct.arc(0,-3*d.scale,5*d.scale,Math.PI,0);ct.fill();ct.fillRect(-1,0,2,5*d.scale);
ct.strokeStyle=bio.ac+'0.15)';ct.lineWidth=.5;for(let g=0;g<3;g++){ct.beginPath();ct.arc(0,-3*d.scale,3+g*1.2,Math.PI+.3,-.3);ct.stroke()}}
else if(d.type==='crack'){ct.strokeStyle=bio.ac+'0.25)';ct.lineWidth=1;ct.beginPath();ct.moveTo(-5*d.scale,-3*d.scale);ct.lineTo(0,0);ct.lineTo(4*d.scale,5*d.scale);ct.lineTo(2*d.scale,3*d.scale);ct.moveTo(0,0);ct.lineTo(-2*d.scale,4*d.scale);ct.stroke()}
else if(d.type==='rune'){ct.strokeStyle=bio.ac+'0.3)';ct.lineWidth=1;ct.beginPath();ct.arc(0,0,6*d.scale,0,Math.PI*2);ct.stroke();
const pulse=Math.sin(fr*.03+d.x)*.1+.2;ct.globalAlpha=pulse;ct.beginPath();ct.arc(0,0,3*d.scale,0,Math.PI*2);ct.fill();
ct.globalAlpha=.35;ct.beginPath();ct.moveTo(0,-6*d.scale);ct.lineTo(0,6*d.scale);ct.moveTo(-6*d.scale,0);ct.lineTo(6*d.scale,0);ct.stroke()}
else if(d.type==='candle'){ct.fillStyle='#554422';ct.globalAlpha=.4;ct.fillRect(-1,0,2,6*d.scale);
const fl=Math.sin(fr*.15+d.x)*1.5;ct.fillStyle=`rgba(255,200,80,${0.3+Math.sin(fr*.2+d.x)*.1})`;
ct.beginPath();ct.ellipse(0,-2+fl*.3,2,3+fl,0,0,Math.PI*2);ct.fill()}
else if(d.type==='crystal'){ct.fillStyle=bio.ac+'0.3)';ct.beginPath();ct.moveTo(0,-7*d.scale);ct.lineTo(3*d.scale,0);ct.lineTo(0,5*d.scale);ct.lineTo(-3*d.scale,0);ct.closePath();ct.fill();
ct.fillStyle='rgba(255,255,255,0.08)';ct.beginPath();ct.moveTo(0,-7*d.scale);ct.lineTo(3*d.scale,0);ct.lineTo(0,-2*d.scale);ct.fill()}
else if(d.type==='icicle'){const ig=ct.createLinearGradient(0,-8*d.scale,0,4*d.scale);ig.addColorStop(0,'rgba(180,220,255,0.3)');ig.addColorStop(1,'rgba(100,180,255,0.05)');
ct.fillStyle=ig;ct.beginPath();ct.moveTo(-2*d.scale,-8*d.scale);ct.lineTo(2*d.scale,-8*d.scale);ct.lineTo(0,4*d.scale);ct.fill()}
else{ct.beginPath();ct.arc(0,0,3*d.scale,0,Math.PI*2);ct.fill()}
ct.globalAlpha=1;ct.restore()}

// Torches
for(const torch of cR.torches){
if(torch.x<cX-30||torch.x>cX+W+30||torch.y<cY-30||torch.y>cY+H+30)continue;
const flk=Math.sin(torch.flicker+fr*.15)*3+Math.cos(torch.flicker+fr*.09)*2;
ct.fillStyle=bio.torchCol;ct.shadowColor=bio.torchCol;ct.shadowBlur=12+flk;
ct.beginPath();ct.arc(torch.x,torch.y-4,2.5+Math.sin(fr*.2+torch.flicker)*.8,0,Math.PI*2);ct.fill();
ct.fillStyle='rgba(255,200,100,0.6)';ct.beginPath();ct.arc(torch.x,torch.y-6-flk*.3,1.5,0,Math.PI*2);ct.fill();
ct.shadowBlur=0;ct.fillStyle=bio.w1;ct.fillRect(torch.x-1.5,torch.y-2,3,8)}

// v5 Biome ambient particles
for(const a of ambientParts){const col=a.col||bio.ac+'0.4)';ct.globalAlpha=(a.life/a.ml)*.08;ct.fillStyle=col;
if(a.shape==='diamond'){ct.save();ct.translate(a.x,a.y);ct.rotate(Math.PI/4);ct.fillRect(-a.size/2,-a.size/2,a.size,a.size);ct.restore()}
else{ct.beginPath();ct.arc(a.x,a.y,a.size,0,Math.PI*2);ct.fill()}}ct.globalAlpha=1;

// Traps
for(const trap of cR.traps){const px=trap.tx*TS,py=trap.ty*TS;
if(trap.on){const col=trap.type==='fire'?'rgba(255,100,30,':'rgba(255,60,80,';
ct.fillStyle=col+'0.12)';ct.fillRect(px+3,py+3,TS-6,TS-6);ct.fillStyle=col+'0.4)';
if(trap.type==='spike'){for(let sx=0;sx<3;sx++)for(let sy=0;sy<3;sy++){const spx=px+10+sx*10,spy=py+10+sy*10;ct.beginPath();ct.moveTo(spx,spy-5);ct.lineTo(spx+3,spy+3);ct.lineTo(spx-3,spy+3);ct.closePath();ct.fill()}}
else if(trap.type==='fire'){ct.fillStyle='rgba(255,140,30,0.3)';ct.beginPath();ct.arc(px+TS/2,py+TS/2,TS*.3+Math.sin(fr*.3)*3,0,Math.PI*2);ct.fill()}
else{ct.strokeStyle=col+'0.35)';ct.lineWidth=2;ct.beginPath();ct.moveTo(px+TS/2,py+3);ct.lineTo(px+TS/2,py+TS-3);ct.stroke()}}
else{ct.fillStyle='rgba(255,60,80,0.03)';ct.fillRect(px+4,py+4,TS-8,TS-8)}}

// Door indicators
if(dLock()){ct.fillStyle='rgba(255,50,80,0.05)';if(cR.doors.n)for(const c of DC)ct.fillRect(c*TS,0,TS,TS);if(cR.doors.s)for(const c of DC)ct.fillRect(c*TS,(RH-1)*TS,TS,TS);
if(cR.doors.w)for(const r of DR)ct.fillRect(0,r*TS,TS,TS);if(cR.doors.e)for(const r of DR)ct.fillRect((RW-1)*TS,r*TS,TS,TS)}
else{ct.fillStyle=bio.ac+'0.14)';ct.font='14px Silkscreen';ct.textAlign='center';ct.textBaseline='middle';
if(cR.doors.n)ct.fillText('▲',DC[1]*TS+TS/2,TS/2);if(cR.doors.s)ct.fillText('▼',DC[1]*TS+TS/2,(RH-1)*TS+TS/2);
if(cR.doors.w)ct.fillText('◀',TS/2,DR[1]*TS+TS/2);if(cR.doors.e)ct.fillText('▶',(RW-1)*TS+TS/2,DR[1]*TS+TS/2)}

// Props (barrels)
for(const pr of props){ct.save();ct.translate(pr.x,pr.y);
if(pr.type==='explosive'){ct.fillStyle='#8B2020';ct.fillRect(-9,-9,18,18);ct.fillStyle='#AA3030';ct.fillRect(-7,-7,14,14);ct.fillStyle='#ff4422';ct.font='8px Silkscreen';ct.textAlign='center';ct.fillText('!',0,3)}
else if(pr.type==='toxic'){ct.fillStyle='#2B5520';ct.fillRect(-9,-9,18,18);ct.fillStyle='#3B7530';ct.fillRect(-7,-7,14,14);ct.fillStyle='#66ff44';ct.shadowColor='#66ff44';ct.shadowBlur=4+Math.sin(fr*.1)*2;ct.font='8px Silkscreen';ct.textAlign='center';ct.fillText('☠',0,3);ct.shadowBlur=0}
else if(pr.type==='ice'){// Diamond-shaped ice crystal
ct.fillStyle='#446688';ct.shadowColor='#88ccff';ct.shadowBlur=6+Math.sin(fr*.08)*3;
ct.beginPath();ct.moveTo(0,-10);ct.lineTo(8,0);ct.lineTo(0,10);ct.lineTo(-8,0);ct.closePath();ct.fill();
ct.fillStyle='rgba(136,204,255,0.3)';ct.beginPath();ct.moveTo(0,-10);ct.lineTo(8,0);ct.lineTo(0,-3);ct.closePath();ct.fill();ct.shadowBlur=0}
else{ct.fillStyle='#7B5B14';ct.fillRect(-9,-9,18,18);ct.fillStyle='#9B7520';ct.fillRect(-7,-7,14,14);ct.fillStyle='#5B4510';ct.fillRect(-9,-1,18,2)}
ct.restore()}

// Chests
for(const ch of cR.chests){if(ch.op){ct.fillStyle='#221a0e';ct.fillRect(ch.x-11,ch.y-7,22,14);ct.fillStyle='#332a18';ct.fillRect(ch.x-9,ch.y-5,18,10)}
else{ct.fillStyle='#ffcc44';ct.shadowColor='#ffcc44';ct.shadowBlur=8+Math.sin(fr*.06)*3;ct.fillRect(ch.x-11,ch.y-9,22,18);ct.fillStyle='#bb8822';ct.fillRect(ch.x-9,ch.y-1,18,2);ct.fillStyle='#ffffff';ct.globalAlpha=.3;ct.fillRect(ch.x-8,ch.y-7,5,3);ct.globalAlpha=1;ct.shadowBlur=0;
if(Math.abs(P.x-ch.x)<TS*1.5&&Math.abs(P.y-ch.y)<TS*1.5){ct.fillStyle='rgba(255,255,255,0.3)';ct.font='7px Silkscreen';ct.textAlign='center';ct.fillText('[E]',ch.x,ch.y-20)}}}

// Ghost NPC
if(cR.ghost){const g=cR.ghost;const bob=Math.sin(fr*.03)*4;
ct.globalAlpha=0.25+Math.sin(fr*.04)*.08;ct.fillStyle='rgba(180,200,255,0.5)';
ct.beginPath();ct.arc(g.x,g.y-6+bob,10,0,Math.PI*2);ct.fill();
ct.beginPath();ct.moveTo(g.x-10,g.y-2+bob);ct.quadraticCurveTo(g.x-8,g.y+12+bob+Math.sin(fr*.05)*3,g.x,g.y+10+bob);
ct.quadraticCurveTo(g.x+8,g.y+12+bob+Math.cos(fr*.05)*3,g.x+10,g.y-2+bob);ct.fill();
ct.fillStyle='#ffffff';ct.fillRect(g.x-3,g.y-8+bob,2,2);ct.fillRect(g.x+2,g.y-8+bob,2,2);
ct.globalAlpha=1}

// Shop NPC
if(cR.sNPC){const n=cR.sNPC;ct.fillStyle='#ffcc44';ct.shadowColor='#ffcc44';ct.shadowBlur=10;ct.beginPath();ct.arc(n.x,n.y,11,0,Math.PI*2);ct.fill();
ct.fillStyle='#aa7722';ct.shadowBlur=0;ct.beginPath();ct.arc(n.x,n.y,5.5,0,Math.PI*2);ct.fill();
ct.fillStyle='#ffcc44';ct.fillRect(n.x-2,n.y-16,4,6);
ct.fillStyle='rgba(255,200,60,0.3)';ct.font='7px Silkscreen';ct.textAlign='center';ct.fillText('SHOP [E]',n.x,n.y-22)}
// Room event interactable
if(cR.roomEvent&&!cR.roomEvent.used){const ev=cR.roomEvent;const bob=Math.sin(fr*.06)*3;const pulse=Math.sin(fr*.04)*.3+.7;
ct.save();ct.translate(ev.x,ev.y+bob);
// Glow aura
ct.fillStyle=ev.color;ct.globalAlpha=pulse*0.06;ct.beginPath();ct.arc(0,0,24+Math.sin(fr*.08)*4,0,Math.PI*2);ct.fill();
ct.globalAlpha=pulse*0.12;ct.beginPath();ct.arc(0,0,16,0,Math.PI*2);ct.fill();
// Icon
ct.globalAlpha=pulse*0.8;ct.shadowColor=ev.color;ct.shadowBlur=15+Math.sin(fr*.1)*5;ct.fillStyle=ev.color;ct.font='16px Silkscreen';ct.textAlign='center';ct.textBaseline='middle';ct.fillText(ev.icon,0,0);
ct.shadowBlur=0;ct.globalAlpha=1;
// Interact prompt
if(Math.abs(P.x-ev.x)<TS*2&&Math.abs(P.y-ev.y)<TS*2){ct.fillStyle='rgba(255,255,255,0.35)';ct.font='7px Silkscreen';ct.fillText('[E] '+ev.name,0,-22)}
ct.restore()}

// v7.0 Shrine crystals rendering
if(cR.shrinePuzzle){const sp=cR.shrinePuzzle;
for(let sci=0;sci<4;sci++){const scc=sp.crystals[sci];const scb=Math.sin(fr*.06+sci)*3;
ct.save();ct.translate(scc.x,scc.y+scb);
if(scc.active){// Activated crystal + beam to center
ct.fillStyle=scc.color;ct.globalAlpha=0.8;ct.shadowColor=scc.color;ct.shadowBlur=15;
ct.beginPath();ct.moveTo(0,-8);ct.lineTo(-5,4);ct.lineTo(5,4);ct.closePath();ct.fill();
ct.globalAlpha=0.3;ct.strokeStyle=scc.color;ct.lineWidth=2;ct.beginPath();ct.moveTo(0,0);ct.lineTo(RPX/2-scc.x,RPY/2-scc.y);ct.stroke()}
else{// Inactive crystal
const isShowing=sp.showT>0&&sp.sequence[Math.floor((120-sp.showT)/30)]===sci;
ct.fillStyle=isShowing?'#ffffff':scc.color;ct.globalAlpha=isShowing?0.9:0.4+Math.sin(fr*.04)*.15;
ct.shadowColor=scc.color;ct.shadowBlur=isShowing?20:8;
ct.beginPath();ct.moveTo(0,-8);ct.lineTo(-5,4);ct.lineTo(5,4);ct.closePath();ct.fill();
if(Math.abs(P.x-scc.x)<TS*2&&Math.abs(P.y-scc.y)<TS*2&&sp.showT<=0&&!sp.solved&&!sp.failed){
ct.globalAlpha=0.5;ct.fillStyle='#fff';ct.font='7px Silkscreen';ct.textAlign='center';ct.fillText('[E]',0,-14)}}
ct.shadowBlur=0;ct.globalAlpha=1;ct.restore()}}

// Pickups
for(const p of picks){ct.globalAlpha=Math.min(1,p.life/25);const bob=Math.sin(fr*.08+p.x)*2;
if(p.type==='gold'){ct.fillStyle='#ffcc44';ct.shadowColor='#ffcc44';ct.shadowBlur=6;ct.beginPath();ct.arc(p.x,p.y+bob,3.5,0,Math.PI*2);ct.fill()}
else if(p.type==='heal'){ct.fillStyle='#44ff66';ct.shadowColor='#44ff66';ct.shadowBlur=6;ct.fillRect(p.x-2,p.y-5+bob,4,10);ct.fillRect(p.x-5,p.y-2+bob,10,4)}
else if(p.type==='weapon'){ct.fillStyle=p.weapon.c;ct.shadowColor=p.weapon.c;ct.shadowBlur=14;ct.save();ct.translate(p.x,p.y+bob);ct.rotate(Math.sin(fr*.04)*.3);ct.fillRect(-2,-9,4,18);ct.fillRect(-6,-1,12,3);ct.restore();ct.shadowBlur=0;ct.fillStyle='rgba(255,255,255,0.35)';ct.font='6px Silkscreen';ct.textAlign='center';ct.fillText(p.weapon.name,p.x,p.y-16)}
else if(p.type==='accessory'){ct.fillStyle='#64dfdf';ct.shadowColor='#64dfdf';ct.shadowBlur=12;ct.beginPath();ct.arc(p.x,p.y+bob,5,0,Math.PI*2);ct.fill();ct.fillStyle='#ffffff';ct.globalAlpha*=.5;ct.beginPath();ct.arc(p.x-1,p.y-1+bob,2,0,Math.PI*2);ct.fill();ct.globalAlpha=Math.min(1,p.life/25);ct.shadowBlur=0;ct.fillStyle='rgba(255,255,255,0.35)';ct.font='6px Silkscreen';ct.textAlign='center';ct.fillText(p.acc.name,p.x,p.y-14)}
else if(p.type==='lore'){ct.fillStyle='#c8a0ff';ct.shadowColor='#c8a0ff';ct.shadowBlur=16+Math.sin(fr*.06)*4;
ct.save();ct.translate(p.x,p.y+bob);ct.rotate(Math.sin(fr*.02)*.1);
ct.fillRect(-5,-7,10,14);ct.fillStyle='rgba(255,255,255,0.3)';ct.fillRect(-3,-5,6,2);ct.fillRect(-3,-1,6,1);ct.fillRect(-3,2,4,1);
ct.restore();ct.shadowBlur=0;ct.fillStyle='rgba(200,160,255,0.35)';ct.font='6px Silkscreen';ct.textAlign='center';ct.fillText('LORE',p.x,p.y-16)}
else if(p.type==='relic'){ct.fillStyle='#ffcc44';ct.shadowColor='#ffcc44';ct.shadowBlur=20+Math.sin(fr*.06)*6;
ct.save();ct.translate(p.x,p.y+bob);ct.rotate(Math.sin(fr*.03)*.15);
ct.beginPath();ct.moveTo(0,-8);ct.lineTo(6,0);ct.lineTo(0,8);ct.lineTo(-6,0);ct.closePath();ct.fill();
ct.fillStyle='rgba(255,255,255,0.4)';ct.beginPath();ct.arc(0,0,3,0,Math.PI*2);ct.fill();
ct.restore();ct.shadowBlur=0;ct.fillStyle='rgba(255,200,80,0.5)';ct.font='6px Silkscreen';ct.textAlign='center';ct.fillText(p.relic?p.relic.name:'RELIC',p.x,p.y-18)}}
ct.globalAlpha=1;ct.shadowBlur=0;

// v5 Projectiles with velocity-streak trails + glow core
for(const p of projs){
// Velocity streak trail
const spd=Math.hypot(p.vx,p.vy);if(spd>0.5){
const ta=Math.atan2(-p.vy,-p.vx);const tl=Math.min(p.size*3,spd*3);
const tg=ct.createLinearGradient(p.x,p.y,p.x+Math.cos(ta)*tl,p.y+Math.sin(ta)*tl);
tg.addColorStop(0,p.color);tg.addColorStop(1,'rgba(0,0,0,0)');
ct.strokeStyle=tg;ct.lineWidth=p.size*.6;ct.beginPath();ct.moveTo(p.x,p.y);ct.lineTo(p.x+Math.cos(ta)*tl,p.y+Math.sin(ta)*tl);ct.stroke()}
ct.fillStyle=p.color;ct.shadowColor=p.color;ct.shadowBlur=p.size+6;ct.beginPath();ct.arc(p.x,p.y,p.size,0,Math.PI*2);ct.fill();
ct.fillStyle='rgba(255,255,255,0.4)';ct.beginPath();ct.arc(p.x,p.y,p.size*.35,0,Math.PI*2);ct.fill()}ct.shadowBlur=0;

// v5 Shockwave rings
for(const sw of shockwaves){ct.globalAlpha=(sw.life/sw.ml)*0.4;
ct.strokeStyle=sw.color;ct.lineWidth=2+sw.life/sw.ml*3;ct.beginPath();ct.arc(sw.x,sw.y,sw.r,0,Math.PI*2);ct.stroke()}ct.globalAlpha=1;

// v5 Weapon slash trail ribbon
if(weaponTrail.length>1){ct.globalAlpha=0.5;
for(let ti=1;ti<weaponTrail.length;ti++){const t0=weaponTrail[ti-1],t1=weaponTrail[ti];
const a=t1.life/8;ct.strokeStyle=t1.color;ct.lineWidth=3*a;ct.globalAlpha=a*0.5;
ct.beginPath();ct.moveTo(t0.x,t0.y);ct.quadraticCurveTo((t0.x+t1.x)/2+(Math.random()-.5)*4,(t0.y+t1.y)/2+(Math.random()-.5)*4,t1.x,t1.y);ct.stroke()}ct.globalAlpha=1}

// ═══ ENTITIES — v5 procedural sprites with eyes, limbs, animation (v9.0 viewport culling) ═══
for(const e of ents){
if(e.x<cX-_margin||e.x>cX+W+_margin||e.y<cY-_margin||e.y>cY+H+_margin)continue;
if(e.animState==='spawn'&&!e.spawnDone){
// Spawn portal animation
ct.save();ct.translate(e.x,e.y);ct.globalAlpha=0.3+e.alpha*0.3;
ct.fillStyle='rgba(60,20,80,0.4)';ct.beginPath();ct.ellipse(0,e.hh+2,e.hw+4,4,0,0,Math.PI*2);ct.fill();
ct.fillStyle=e.color;ct.globalAlpha=e.alpha;
ct.beginPath();ct.arc(0,0,e.hw*(e.alpha),0,Math.PI*2);ct.fill();
// Upward particles during spawn
if(fr%3===0)emit(e.x+(Math.random()-.5)*e.hw,e.y+e.hh,1,'rgba(160,100,255,0.4)',1,12,1,'circle');
ct.restore();continue}
// v8.0 SHATTERING death animation — fragments + flash + slowmo
if(e.animState==='die'){ct.save();ct.translate(e.x,e.y);
const dp=Math.min(1,e.animFrame/12);
// Phase 1 (0-0.25): freeze + flash white
if(dp<0.25){const wp=dp/0.25;ct.globalAlpha=1;
ct.fillStyle=`rgba(255,255,255,${0.5*(1-wp)})`;ct.fillRect(-e.hw-4,-e.hh-4,e.hw*2+8,e.hh*2+8);
ct.fillStyle=e.color;ct.beginPath();ct.arc(0,0,e.hw,0,Math.PI*2);ct.fill();
if(e.animFrame===1){slMo=Math.max(slMo,5)}}
// Phase 2 (0.25-0.7): fragment into 6 pieces flying outward
else if(dp<0.7){const fp=(dp-0.25)/0.45;
for(let fi=0;fi<6;fi++){const fa=Math.PI*2/6*fi+(e.x%3)*0.5;const fd=fp*e.hw*3;const frot=fp*Math.PI*3*(fi%2?1:-1);
ct.save();ct.translate(Math.cos(fa)*fd,Math.sin(fa)*fd);ct.rotate(frot);ct.globalAlpha=1-fp*0.8;
ct.fillStyle=e.color;ct.beginPath();ct.moveTo(0,-e.hw*0.4);ct.lineTo(e.hw*0.3,e.hw*0.2);ct.lineTo(-e.hw*0.3,e.hw*0.2);ct.fill();ct.restore()}
if(fp<0.15)emit(e.x,e.y,4,e.color,4,14,3)}
// Phase 3 (0.7-1.0): final burst + fade
else{const bp=(dp-0.7)/0.3;ct.globalAlpha=0;
if(e.animFrame===Math.floor(12*0.7)){emit(e.x,e.y,12,e.color,5,18,3.5);emit(e.x,e.y,8,'#ffffff',4,14,2.5,'star');
addShockwave(e.x,e.y,40+e.hw*2,e.color,10);const pDir=Math.atan2(e.y-P.y,e.x-P.x);camPunchX+=Math.cos(pDir)*4;camPunchY+=Math.sin(pDir)*4}}
ct.restore();continue}

ct.save();ct.translate(e.x,e.y);
// v6 idle breathing — subtle bob and scale pulse
const breathe=Math.sin(e.age*0.06+e.x*0.1)*0.015;ct.scale(1+breathe,1-breathe);ct.translate(0,Math.sin(e.age*0.04)*0.8);
// v5 knockback stretch visual
if(e.stretchT>0){const st=e.stretchT/(e.stretchT+4);ct.rotate(e.stretchDir);ct.scale(1+st*0.08,1-st*0.04);ct.rotate(-e.stretchDir)}
ct.globalAlpha=e.alpha!==undefined?e.alpha:1;
ct.fillStyle='rgba(0,0,0,0.2)';ct.beginPath();ct.ellipse(0,e.hh+3,e.hw*.9,3.5,0,0,Math.PI*2);ct.fill();
if(e.telG>0){ct.fillStyle=`rgba(255,80,80,${e.telG*.08})`;ct.beginPath();ct.arc(0,0,e.hw+14,0,Math.PI*2);ct.fill();
ct.strokeStyle=`rgba(255,80,80,${e.telG*.2})`;ct.lineWidth=1.5;ct.setLineDash([3,3]);ct.beginPath();ct.arc(0,0,e.hw+14+Math.sin(fr*.25)*4,0,Math.PI*2);ct.stroke();ct.setLineDash([])}
if(e.elite){ct.strokeStyle=e.eCol;ct.lineWidth=1.5;ct.shadowColor=e.eCol;ct.shadowBlur=12;ct.beginPath();ct.arc(0,0,e.hw+6+Math.sin(e.age*.12)*2,0,Math.PI*2);ct.stroke();ct.shadowBlur=0;
// v5 Elite affix visuals
if(e.eVfx==='lightning'&&fr%6<3){ct.strokeStyle=e.eCol;ct.lineWidth=1;ct.beginPath();const la=Math.random()*Math.PI*2;ct.moveTo(0,0);ct.lineTo(Math.cos(la)*(e.hw+10),Math.sin(la)*(e.hw+10));ct.stroke()}
if(e.eVfx==='flame'&&fr%4===0)emit(e.x+(Math.random()-.5)*e.hw,e.y+(Math.random()-.5)*e.hh,1,'#ff6633',.5,8,1,'circle');
if(e.eVfx==='poison_mist'){ct.fillStyle='rgba(100,255,60,0.04)';ct.beginPath();ct.arc(0,0,e.hw+8+Math.sin(fr*.1)*3,0,Math.PI*2);ct.fill()}
if(e.eVfx==='ghost'&&fr%8<4){ct.globalAlpha=0.15;ct.fillStyle=e.eCol;ct.beginPath();ct.arc(6,3,e.hw*.7,0,Math.PI*2);ct.fill();ct.globalAlpha=e.alpha||1}
if(e.eVfx==='glitch'&&fr%10<2){ct.fillStyle=e.eCol;ct.fillRect(-e.hw,Math.random()*e.hh*2-e.hh,e.hw*2,2)}
if(e.eVfx==='shield_icon'){ct.strokeStyle='rgba(100,200,255,0.3)';ct.lineWidth=2;ct.beginPath();ct.arc(0,-e.hh-6,5,Math.PI,0);ct.lineTo(0,-e.hh-1);ct.closePath();ct.stroke()}}
if(e.frozen>0){ct.fillStyle='rgba(0,180,255,0.1)';ct.beginPath();ct.arc(0,0,e.hw+6,0,Math.PI*2);ct.fill();ct.strokeStyle='rgba(100,200,255,0.18)';ct.lineWidth=1;ct.beginPath();ct.arc(0,0,e.hw+6,0,Math.PI*2);ct.stroke()}
const fl=e.fl>0;const baseCol=e.elite?e.eCol:e.color;ct.shadowColor=baseCol;ct.shadowBlur=7;
// v8.0 Radial gradient body fill for 3D volume
if(!fl){const grd=ct.createRadialGradient(-e.hw*0.3,-e.hh*0.3,0,0,0,Math.max(e.hw,e.hh)*1.4);
grd.addColorStop(0,lightenColor(baseCol,30));grd.addColorStop(0.6,baseCol);grd.addColorStop(1,darkenColor(baseCol,30));ct.fillStyle=grd}else ct.fillStyle='#fff';
// v8.0 Eye helper: sclera + iris + pupil (makes every entity feel alive)
const drawEye=(ox,oy,irisCol,r)=>{r=r||2.5;ct.fillStyle='#e8e8e8';ct.beginPath();ct.arc(ox,oy,r,0,Math.PI*2);ct.fill();
ct.fillStyle=fl?'#ccc':irisCol||'#882222';ct.beginPath();ct.arc(ox+ex*r*0.35,oy+ey*r*0.35,r*0.6,0,Math.PI*2);ct.fill();
ct.fillStyle='#111';ct.beginPath();ct.arc(ox+ex*r*0.5,oy+ey*r*0.5,r*0.28,0,Math.PI*2);ct.fill()};
// v8.0 Body outline helper
const outlineBody=(shape)=>{ct.strokeStyle=darkenColor(baseCol,40);ct.lineWidth=1.5;ct.globalAlpha=(fl?0.15:0.3)*(e.alpha||1);ct.stroke();ct.globalAlpha=e.alpha!==undefined?e.alpha:1};
// Eyes track player
const eyeAng=Math.atan2(P.y-e.y,P.x-e.x);const ex=Math.cos(eyeAng),ey=Math.sin(eyeAng);

// ═══ v8.0 ENHANCED PROCEDURAL ENTITY RENDERING ═══
if(e.type==='rat'){const run=Math.sin(e.age*.3)*2;
ct.beginPath();ct.ellipse(0,run*.3,e.hw+1,e.hh*.7,0,0,Math.PI*2);ct.fill();
// 4 alternating legs
for(let l=0;l<4;l++){const lx=(l<2?-1:1)*(e.hw*.7),ly=(l%2===0?-1:1)*2+Math.sin(e.age*.3+l*1.5)*2;
ct.fillRect(lx-1,ly,2,3)}
// Pointed nose + tail
ct.fillStyle=fl?'#fff':'#887766';const na=Math.cos(e.dir)*7,nb=Math.sin(e.dir)*7;ct.beginPath();ct.arc(na,nb,1.5,0,Math.PI*2);ct.fill();
ct.strokeStyle=fl?'#fff':'#776655';ct.lineWidth=1;ct.beginPath();ct.moveTo(-Math.cos(e.dir)*e.hw,-Math.sin(e.dir)*e.hh);const ta2=e.dir+Math.PI+Math.sin(e.age*.2)*.3;ct.quadraticCurveTo(Math.cos(ta2)*12,Math.sin(ta2)*12,Math.cos(ta2)*8,Math.sin(ta2)*8);ct.stroke();
// v8.0 Proper rat eyes
drawEye(-2+ex*2,-2+ey*2,'#ff3333',1.5);drawEye(1+ex*2,-2+ey*2,'#ff3333',1.5)}
else if(e.type==='slime'){const sq=1+Math.sin(e.age*.1)*.18;
// v8.0 Vertical gradient body
const slGrd=ct.createLinearGradient(0,-e.hh,0,e.hh);slGrd.addColorStop(0,fl?'#fff':lightenColor(baseCol,25));slGrd.addColorStop(0.7,fl?'#fff':baseCol);slGrd.addColorStop(1,fl?'#fff':darkenColor(baseCol,35));ct.fillStyle=slGrd;
ct.beginPath();ct.ellipse(0,2,e.hw*sq,e.hh/sq,0,0,Math.PI*2);ct.fill();outlineBody();
// Internal bubbles
for(let b=0;b<3;b++){const bx=Math.sin(e.age*0.04+b*2.1)*(e.hw*0.4);const by=Math.cos(e.age*0.03+b*1.7)*(e.hh*0.25)+1;
ct.fillStyle=`rgba(255,255,255,${0.08+Math.sin(e.age*0.05+b)*0.04})`;ct.beginPath();ct.arc(bx,by,2+Math.sin(e.age*0.06+b)*0.5,0,Math.PI*2);ct.fill()}
// Dripping bottom
ct.fillStyle=fl?'#fff':darkenColor(baseCol,15);for(let d=0;d<2;d++){const dx=-e.hw*0.3+d*e.hw*0.6;const dLen=3+Math.sin(e.age*0.08+d*1.5)*2;
ct.beginPath();ct.moveTo(dx-2,e.hh/sq-1);ct.lineTo(dx,e.hh/sq+dLen);ct.lineTo(dx+2,e.hh/sq-1);ct.fill()}
// Surface shine arc
ct.fillStyle='rgba(255,255,255,0.22)';ct.beginPath();ct.ellipse(-3,-4,4,2.5,-.3,0,Math.PI);ct.fill();
if(fr%8===0)emit(e.x+(Math.random()-.5)*e.hw,e.y-e.hh*.5,1,'rgba(100,255,120,0.3)',.3,15,1.5,'circle');
// v8.0 Proper eyes
drawEye(-3+ex*1.5,-1+ey*1.5,'#225533',2.5);drawEye(2+ex*1.5,-1+ey*1.5,'#225533',2.5)}
else if(e.type==='bat'){const wf=Math.sin(e.age*.25)*6;ct.beginPath();ct.arc(0,0,e.hw,0,Math.PI*2);ct.fill();
// Bezier membrane wings with bone fingers
ct.beginPath();ct.moveTo(-e.hw,0);ct.bezierCurveTo(-e.hw-3,wf-4,-e.hw-8,wf-2,-e.hw-10,wf);ct.bezierCurveTo(-e.hw-6,wf+3,-e.hw-2,2,-e.hw,1);ct.fill();
ct.beginPath();ct.moveTo(e.hw,0);ct.bezierCurveTo(e.hw+3,wf-4,e.hw+8,wf-2,e.hw+10,wf);ct.bezierCurveTo(e.hw+6,wf+3,e.hw+2,2,e.hw,1);ct.fill();
// Wing bone lines
ct.strokeStyle=fl?'#fff':'rgba(0,0,0,0.15)';ct.lineWidth=.5;ct.beginPath();ct.moveTo(-e.hw,0);ct.lineTo(-e.hw-8,wf);ct.moveTo(e.hw,0);ct.lineTo(e.hw+8,wf);ct.stroke();
// v8.0 Proper bat eyes
drawEye(-2+ex*2,-2+ey*1.5,'#ffcc00',1.8);drawEye(1+ex*2,-2+ey*1.5,'#ffcc00',1.8)}
else if(e.type==='spider'){ct.beginPath();ct.ellipse(0,0,e.hw,e.hh,0,0,Math.PI*2);ct.fill();
// 8 legs (4 per side, alternating walk)
ct.strokeStyle=fl?'#fff':e.elite?e.eCol:e.color;ct.lineWidth=1.2;
for(let l=0;l<8;l++){const side=l<4?-1:1;const idx=l%4;const la=Math.PI/5*(idx+1)-Math.PI/2;const walk=Math.sin(e.age*.2+l*0.8)*3;
const jx=side*(e.hw*.6),jy=idx*3-4.5;const lx=jx+side*(5+Math.abs(walk)),ly=jy+4+walk*.5;
ct.beginPath();ct.moveTo(jx,jy);ct.quadraticCurveTo(jx+side*3,jy+2,lx,ly);ct.stroke()}
// Fangs
ct.fillStyle=fl?'#fff':'#ff4444';ct.fillRect(-2,e.hh-1,1.5,3);ct.fillRect(1,e.hh-1,1.5,3);
// Multiple eyes (6)
ct.fillStyle='#ff0000';for(let ei=0;ei<6;ei++){const exi=-3+ei*1.2+ex*1.5,eyi=-2+ey*1.5+(ei%2)*1;ct.fillRect(exi,eyi,1,1)}}
else if(e.type==='skel'){// v8.0 Trapezoid body (narrow waist, wide shoulders)
ct.beginPath();ct.moveTo(-e.hw-2,-e.hh);ct.lineTo(e.hw+2,-e.hh);ct.lineTo(e.hw,-1);ct.lineTo(e.hw-2,e.hh);ct.lineTo(-e.hw+2,e.hh);ct.lineTo(-e.hw,-1);ct.closePath();ct.fill();outlineBody();
// Skull — rounded top
ct.fillStyle=fl?'#fff':'#ccc8bb';ct.beginPath();ct.arc(0,-e.hh+4,e.hw-1,Math.PI,0);ct.lineTo(e.hw-1,-e.hh+6);ct.lineTo(-e.hw+1,-e.hh+6);ct.fill();
// Jaw
ct.fillStyle=fl?'#fff':'#aaa89a';ct.fillRect(-3,-e.hh+6.5,6,2.5);
// Hollow eye sockets with dim glow
ct.fillStyle='#111';ct.beginPath();ct.arc(-2.5+ex*0.5,-e.hh+3+ey*0.3,2,0,Math.PI*2);ct.fill();
ct.beginPath();ct.arc(2.5+ex*0.5,-e.hh+3+ey*0.3,2,0,Math.PI*2);ct.fill();
ct.fillStyle=fl?'#fff':'rgba(255,60,40,0.5)';ct.beginPath();ct.arc(-2.5+ex,-e.hh+3+ey*0.5,0.8,0,Math.PI*2);ct.fill();
ct.beginPath();ct.arc(2.5+ex,-e.hh+3+ey*0.5,0.8,0,Math.PI*2);ct.fill();
// Bone joint circles at shoulders
ct.fillStyle=fl?'#fff':'#bbb8a8';ct.beginPath();ct.arc(-e.hw+1,-e.hh+1,2,0,Math.PI*2);ct.fill();
ct.beginPath();ct.arc(e.hw-1,-e.hh+1,2,0,Math.PI*2);ct.fill();
// Rib lines — visible
ct.strokeStyle='rgba(0,0,0,0.15)';ct.lineWidth=.8;for(let r=0;r<3;r++){ct.beginPath();ct.moveTo(-e.hw+3,1+r*3.5);ct.lineTo(e.hw-3,1+r*3.5);ct.stroke()}
// Arm with visible weapon line
ct.fillStyle=fl?'#fff':'#aaa8a0';const sDir=Math.cos(e.dir)>0?1:-1;ct.fillRect(sDir*(e.hw-1),-3,sDir*5,2);ct.fillStyle='#999';ct.fillRect(sDir*(e.hw+3),-6,sDir*2,10)}
else if(e.type==='mage'){// v8.0 Enhanced mage with robe folds and face under hood
// Body circle with gradient
ct.beginPath();ct.arc(0,0,e.hw,0,Math.PI*2);ct.fill();outlineBody();
// Hooded robe with gradient
const robeGrd=ct.createLinearGradient(0,-e.hh-3,0,e.hh+2);robeGrd.addColorStop(0,fl?'#fff':darkenColor('#cc4433',20));robeGrd.addColorStop(1,fl?'#fff':'#cc4433');ct.fillStyle=robeGrd;
ct.beginPath();ct.moveTo(0,-e.hh-3);ct.lineTo(e.hw+2,e.hh+2);ct.lineTo(-e.hw-2,e.hh+2);ct.closePath();ct.fill();
// Robe fold lines
ct.strokeStyle='rgba(0,0,0,0.12)';ct.lineWidth=0.8;
ct.beginPath();ct.moveTo(-2,-e.hh+4);ct.lineTo(-e.hw*0.3,e.hh);ct.stroke();
ct.beginPath();ct.moveTo(2,-e.hh+4);ct.lineTo(e.hw*0.3,e.hh);ct.stroke();
// Rune markings on robe
ct.strokeStyle='rgba(255,170,50,0.2)';ct.lineWidth=0.5;ct.beginPath();ct.arc(0,e.hh*0.3,3,0,Math.PI*2);ct.stroke();
// Face under hood — two glowing eyes
ct.fillStyle='rgba(0,0,0,0.5)';ct.beginPath();ct.arc(0,-e.hh+4,e.hw*0.6,0,Math.PI*2);ct.fill();
drawEye(-2.5+ex*1.5,-e.hh+4+ey,'#ffaa33',2);drawEye(2.5+ex*1.5,-e.hh+4+ey,'#ffaa33',2);
// Staff
ct.strokeStyle='#aa7744';ct.lineWidth=2;ct.beginPath();ct.moveTo(e.hw+2,-e.hh);ct.lineTo(e.hw+2,e.hh+4);ct.stroke();
ct.fillStyle='#ffaa33';ct.beginPath();ct.arc(e.hw+2,-e.hh,2.5,0,Math.PI*2);ct.fill();
// Orbiting spell orb with trail arc
ct.fillStyle=fl?'#fff':'#ffaa33';ct.shadowColor='#ffaa33';ct.shadowBlur=10;const ox=Math.cos(e.age*.08)*13,oy=Math.sin(e.age*.08)*13;ct.beginPath();ct.arc(ox,oy,4+Math.sin(fr*.15),0,Math.PI*2);ct.fill();
// Trail arc
ct.strokeStyle='rgba(255,170,50,0.15)';ct.lineWidth=1;ct.beginPath();ct.arc(0,0,13,e.age*.08-0.8,e.age*.08);ct.stroke();
if(fr%3===0)emitTrail(e.x+ox,e.y+oy,'rgba(255,170,50,0.3)',1.5)}
else if(e.type==='brute'){// v8.0 Wider-at-top trapezoid body with muscle definition
ct.beginPath();ct.moveTo(-e.hw-3,-e.hh);ct.lineTo(e.hw+3,-e.hh);ct.lineTo(e.hw,e.hh);ct.lineTo(-e.hw,e.hh);ct.closePath();ct.fill();outlineBody();
// Muscle definition curves
ct.strokeStyle='rgba(0,0,0,0.08)';ct.lineWidth=1;ct.beginPath();ct.arc(-e.hw*0.4,0,e.hh*0.5,0,Math.PI);ct.stroke();
ct.beginPath();ct.arc(e.hw*0.4,0,e.hh*0.5,0,Math.PI);ct.stroke();
// Shoulder pauldrons
ct.fillStyle=fl?'#fff':darkenColor(baseCol,20);ct.fillRect(-e.hw-5,-e.hh+2,6,e.hh);ct.fillRect(e.hw-1,-e.hh+2,6,e.hh);
// Animated fists — bob during attack
const fistBob=Math.sin(e.age*.25)*2;
ct.fillStyle=fl?'#fff':lightenColor(baseCol,10);ct.beginPath();ct.arc(-e.hw-3,e.hh-2+fistBob,3.5,0,Math.PI*2);ct.fill();ct.beginPath();ct.arc(e.hw+3,e.hh-2-fistBob,3.5,0,Math.PI*2);ct.fill();
// Scar with glow during attack
const scarGlow=e.atkCd<20?0.4:0.15;ct.strokeStyle=`rgba(200,50,50,${scarGlow})`;ct.lineWidth=1.5;ct.beginPath();ct.moveTo(-4,-e.hh+5);ct.lineTo(5,-e.hh+9);ct.stroke();
if(scarGlow>0.2){ct.shadowBlur=6;ct.shadowColor='rgba(200,50,50,0.5)';ct.stroke();ct.shadowBlur=7}
// v8.0 Proper eyes
drawEye(-3.5+ex,-e.hh+4+ey,'#882222',3);drawEye(2.5+ex,-e.hh+4+ey,'#882222',3)}
else if(e.type==='assassin'){ct.globalAlpha=(e.alpha||1)*(.6+Math.sin(e.age*.18)*.15);
ct.beginPath();ct.moveTo(0,-e.hh-2);ct.lineTo(e.hw+2,e.hh);ct.lineTo(-e.hw-2,e.hh);ct.closePath();ct.fill();
// Dagger
ct.fillStyle='#aabbcc';ct.fillRect(e.hw-1,-2,8,1.5);
// Shadow wisps
if(fr%5===0)emit(e.x+(Math.random()-.5)*e.hw,e.y+e.hh,1,'rgba(40,60,80,0.3)',.3,12,1);
ct.globalAlpha=e.alpha||1;drawEye(-1+ex*2,-e.hh+2+ey*1.5,'#ff4444',2)}
else if(e.type==='wraith'){ct.globalAlpha=(e.alpha||1)*(.5+Math.sin(e.age*.1)*.2);ct.beginPath();ct.arc(0,-2,e.hw,0,Math.PI*2);ct.fill();
ct.fillStyle=fl?'#fff':'#99bbdd';ct.beginPath();ct.moveTo(-e.hw,2);ct.quadraticCurveTo(-e.hw+2,e.hh+4+Math.sin(e.age*.15)*3,0,e.hh+2);ct.quadraticCurveTo(e.hw-2,e.hh+4+Math.cos(e.age*.15)*3,e.hw,2);ct.fill();
// v8.0 Eerie proper floating eyes
ct.globalAlpha=e.alpha||1;drawEye(-3+ex*2,-4+ey*1.5,'#aaddff',2.5);drawEye(1+ex*2,-4+ey*1.5,'#aaddff',2.5)}
else if(e.type==='golem'){ct.fillRect(-e.hw,-e.hh,e.hw*2,e.hh*2);ct.fillStyle=fl?'#fff':'#556677';ct.fillRect(-e.hw+2,-e.hh+2,e.hw*2-4,e.hh*2-4);
// Crack lines
ct.strokeStyle='rgba(0,0,0,0.12)';ct.lineWidth=1;ct.beginPath();ct.moveTo(-e.hw+4,-e.hh+4);ct.lineTo(2,e.hh-6);ct.moveTo(e.hw-4,-e.hh+6);ct.lineTo(-1,e.hh-4);ct.stroke();
// Glowing core
ct.fillStyle='#ffaa44';ct.shadowColor='#ffaa44';ct.shadowBlur=8+Math.sin(fr*.1)*3;ct.beginPath();ct.arc(0,0,4,0,Math.PI*2);ct.fill();
drawEye(-3+ex*2,-e.hh+4+ey*2,'#ffaa44',2.5);drawEye(2+ex*2,-e.hh+4+ey*2,'#ffaa44',2.5)}
else if(e.type==='swarmer'){// Tiny buzzing insect
const bz=Math.sin(e.age*.4)*2;ct.beginPath();ct.ellipse(0,0,e.hw+1,e.hh,0,0,Math.PI*2);ct.fill();
// Wings
const wf=Math.sin(e.age*.5)*4;ct.fillStyle=fl?'#fff':'rgba(255,220,100,0.3)';
ct.beginPath();ct.ellipse(-3,wf-2,3,1.5,0,0,Math.PI*2);ct.fill();
ct.beginPath();ct.ellipse(3,wf-2,3,1.5,0,0,Math.PI*2);ct.fill();
ct.fillStyle='#000';ct.fillRect(-1+ex,-1+ey,1,1);ct.fillRect(1+ex,-1+ey,1,1)}
else if(e.type==='shaman'){// Hooded healer with totem
ct.beginPath();ct.arc(0,-2,e.hw,0,Math.PI*2);ct.fill();
ct.fillStyle=fl?'#fff':'#668833';ct.beginPath();ct.moveTo(0,-e.hh-4);ct.lineTo(e.hw+2,e.hh+2);ct.lineTo(-e.hw-2,e.hh+2);ct.closePath();ct.fill();
// Totem staff
ct.strokeStyle='#776644';ct.lineWidth=2;ct.beginPath();ct.moveTo(e.hw+3,-e.hh);ct.lineTo(e.hw+3,e.hh+3);ct.stroke();
// Healing glow
if(e.healCd<20){const glow=Math.sin(fr*.15)*.1+.15;ct.fillStyle=`rgba(136,204,68,${glow})`;ct.beginPath();ct.arc(0,0,e.hw+10,0,Math.PI*2);ct.fill()}
drawEye(-2+ex,-e.hh+3+ey,'#44ff44',2);drawEye(1+ex,-e.hh+3+ey,'#44ff44',2)}
else if(e.type==='knight'){// Armored figure with shield
ct.fillRect(-e.hw,-e.hh,e.hw*2,e.hh*2);
ct.fillStyle=fl?'#fff':'#8899aa';ct.fillRect(-e.hw+1,-e.hh+1,e.hw*2-2,e.hh*2-2);
// Shield (front-facing)
const sd=Math.cos(e.dir)>0?1:-1;ct.fillStyle=fl?'#fff':'#667788';ct.fillRect(sd*(e.hw-2),-e.hh+3,sd*6,e.hh*1.5);
ct.strokeStyle='rgba(255,255,255,0.15)';ct.lineWidth=1;ct.strokeRect(sd*(e.hw-2),-e.hh+3,sd*6,e.hh*1.5);
// Helmet visor
ct.fillStyle='#223344';ct.fillRect(-3+ex,-e.hh+3+ey,6,3);
// Sword
ct.fillStyle='#ccddee';ct.fillRect(-sd*(e.hw-1),-3,-sd*7,2);
// Blocking indicator
if(e.blocking){ct.strokeStyle='rgba(170,187,204,0.3)';ct.lineWidth=2;ct.beginPath();ct.arc(sd*e.hw,0,8,e.dir-.8,e.dir+.8);ct.stroke()}}
else if(e.type==='necromancer'){ct.beginPath();ct.arc(0,-2,e.hw,0,Math.PI*2);ct.fill();
// Hooded robe
ct.fillStyle=fl?'#fff':'#442266';ct.beginPath();ct.moveTo(-e.hw-2,0);ct.lineTo(0,e.hh+4);ct.lineTo(e.hw+2,0);ct.fill();
// Staff with green glow
ct.strokeStyle='#665544';ct.lineWidth=1.5;ct.beginPath();ct.moveTo(-e.hw-3,-e.hh);ct.lineTo(-e.hw-3,e.hh+4);ct.stroke();
// Floating skull orbs
ct.fillStyle='#cc44ff';ct.shadowColor='#cc44ff';ct.shadowBlur=6;
for(let s=0;s<3;s++){const sa=Math.PI*2/3*s+e.age*.06;const sd=e.hw+8;
ct.beginPath();ct.arc(Math.cos(sa)*sd,Math.sin(sa)*sd,2+Math.sin(fr*.12+s)*1,0,Math.PI*2);ct.fill()}}
else if(e.type==='boss'){
const bCol=e.color;const bRgb=hexToRgb(bCol);
// v6 Stagger visual — boss flashes yellow/white and shakes when staggered
if(e.staggered){ct.save();ct.translate(Math.sin(fr*1.2)*3,Math.cos(fr*1.5)*3);
ct.strokeStyle=fr%4<2?'#ffee44':'#ffffff';ct.lineWidth=3;ct.shadowColor='#ffee44';ct.shadowBlur=25;
ct.beginPath();ct.arc(0,0,e.hw+12,0,Math.PI*2);ct.stroke();
for(let sp=0;sp<8;sp++){const sa=Math.PI*2/8*sp+fr*.15;ct.fillStyle=fr%3<2?'#ffee44':'#ffffaa';
ct.beginPath();ct.arc(Math.cos(sa)*(e.hw+16),Math.sin(sa)*(e.hw+16),2,0,Math.PI*2);ct.fill()}ct.restore()}
// v8.0 3 concentric glow rings (not 1)
for(let ring=0;ring<3;ring++){const rOff=ring*6;const rAlpha=0.5-ring*0.15;
ct.strokeStyle=`rgba(${bRgb},${rAlpha})`;ct.lineWidth=2-ring*0.5;ct.shadowColor=bCol;ct.shadowBlur=20+Math.sin(fr*.06+ring)*8;
ct.beginPath();ct.arc(0,0,e.hw+8+rOff+Math.sin(fr*.04+ring*0.7)*3,0,Math.PI*2);ct.stroke()}
// v8.0 Rotating rune circle with symbols
ct.save();ct.rotate(e.age*.02);ct.strokeStyle=`rgba(${bRgb},0.2)`;ct.lineWidth=1;ct.setLineDash([4,4]);
ct.beginPath();ct.arc(0,0,e.hw+20,0,Math.PI*2);ct.stroke();ct.setLineDash([]);
// Rune symbols on outer ring
ct.fillStyle=`rgba(${bRgb},0.25)`;ct.font='6px Silkscreen';ct.textAlign='center';ct.textBaseline='middle';
const runes=['◆','◈','⬥','✦','⬢','⊛'];for(let ri=0;ri<6;ri++){const ra=Math.PI*2/6*ri;
ct.fillText(runes[ri],Math.cos(ra)*(e.hw+20),Math.sin(ra)*(e.hw+20))}ct.restore();
if(e.telG>0){ct.strokeStyle=`rgba(255,50,80,${e.telG*.25})`;ct.lineWidth=2.5;ct.setLineDash([4,4]);ct.beginPath();ct.arc(0,0,e.hw+12+Math.sin(fr*.25)*5,0,Math.PI*2);ct.stroke();ct.setLineDash([])}
// v8.0 Animated bezier tentacles (4-6)
ct.strokeStyle=`rgba(${bRgb},0.35)`;ct.lineWidth=2;
for(let t=0;t<(e.enraged?6:4);t++){const ta=Math.PI*2/(e.enraged?6:4)*t+e.age*0.015;const tLen=e.hw+12+Math.sin(e.age*0.05+t)*5;
ct.beginPath();ct.moveTo(Math.cos(ta)*e.hw*0.8,Math.sin(ta)*e.hw*0.8);
ct.bezierCurveTo(Math.cos(ta+0.3)*tLen*0.6,Math.sin(ta+0.3)*tLen*0.6,Math.cos(ta-0.2)*tLen*0.9,Math.sin(ta-0.2)*tLen*0.9,
Math.cos(ta+Math.sin(e.age*0.04+t)*0.5)*tLen,Math.sin(ta+Math.sin(e.age*0.04+t)*0.5)*tLen);ct.stroke()}
ct.shadowBlur=7;ct.fillStyle=fl?'#fff':bCol;
ct.beginPath();ct.arc(0,0,e.hw,0,Math.PI*2);ct.fill();
// Crown/horns
ct.fillStyle=fl?'#fff':lightenColor(bCol,15);for(let h=-1;h<=1;h+=2){ct.beginPath();ct.moveTo(h*e.hw*.5,-e.hw);ct.lineTo(h*e.hw*.7,-e.hw-10);ct.lineTo(h*e.hw*.3,-e.hw+2);ct.fill()}
// v8.0 Larger slit-pupil eye
ct.fillStyle='rgba(0,0,0,0.3)';ct.beginPath();ct.arc(0,0,e.hw*.6,0,Math.PI*2);ct.fill();
const irisCol=fl?'#fff':e.enraged?'#ff0033':'#ff6688';const eyeR=e.hw*.28+Math.sin(fr*.08)*3;
ct.fillStyle=irisCol;ct.shadowColor=irisCol;ct.shadowBlur=8;ct.beginPath();ct.arc(ex*3.5,ey*3.5,eyeR,0,Math.PI*2);ct.fill();
// Slit pupil (vertical ellipse)
ct.fillStyle='#000';ct.beginPath();ct.ellipse(ex*5.5,ey*5.5,eyeR*0.15,eyeR*0.55,Math.atan2(ey,ex),0,Math.PI*2);ct.fill();
ct.shadowBlur=7;
// v8.0 Phase-dependent cracks + particle leak below 50%/25%
const hpPct=e.hp/e.mhp;
if(hpPct<0.5){ct.strokeStyle=`rgba(255,80,60,${0.2+(0.5-hpPct)*0.4})`;ct.lineWidth=1;
for(let cr=0;cr<(hpPct<0.25?4:2);cr++){const ca=Math.PI*2/4*cr+0.3;ct.beginPath();ct.moveTo(Math.cos(ca)*e.hw*0.3,Math.sin(ca)*e.hw*0.3);
ct.lineTo(Math.cos(ca+0.1)*e.hw*0.9,Math.sin(ca+0.15)*e.hw*0.9);ct.stroke()}
if(fr%4===0)emit(e.x+(Math.random()-.5)*e.hw,e.y+(Math.random()-.5)*e.hw,1,hpPct<0.25?'#ff4444':'#ff8866',1.5,12,2,'circle')}
// Orbiting particles — more when enraged
for(let o=0;o<(e.enraged?8:6);o++){const oa=Math.PI*2/(e.enraged?8:6)*o+e.age*.04;const od=e.hw+8+Math.sin(e.age*.08+o)*3;
ct.fillStyle=e.enraged?'rgba(255,0,50,0.5)':`rgba(${bRgb},0.4)`;
ct.beginPath();ct.arc(Math.cos(oa)*od,Math.sin(oa)*od,2.5,0,Math.PI*2);ct.fill()}
// Aura trail
if(fr%3===0)emitTrail(e.x+Math.cos(e.age*.04)*e.hw,e.y+Math.sin(e.age*.04)*e.hw,`rgba(${bRgb},0.2)`,2);
ct.shadowBlur=0;
ct.fillStyle='rgba(0,0,0,0.45)';ct.fillRect(-e.hw,-e.hh-13,e.hw*2,7);ct.fillStyle=e.enraged?'#ff0033':bCol;ct.fillRect(-e.hw,-e.hh-13,e.hw*2*(e.hp/e.mhp),7);
// Phase markers
if(e.phase50){ct.fillStyle='rgba(255,255,255,0.15)';ct.fillRect(-e.hw+e.hw*2*0.5,-e.hh-13,1,7)}
if(e.phase25){ct.fillStyle='rgba(255,80,80,0.2)';ct.fillRect(-e.hw+e.hw*2*0.25,-e.hh-13,1,7)}
// v7.0 Boss-specific visual effects
if(e.isClone){ct.globalAlpha=e._cloneAlpha||0.3}
// Soul Drain beam (Whisper King)
if(e._beamT>0){ct.save();ct.rotate(e._beamAng);ct.globalAlpha=e._beamT/45*0.7;
const grd=ct.createLinearGradient(0,0,140,0);grd.addColorStop(0,'#c8a0ff');grd.addColorStop(1,'rgba(200,160,255,0)');
ct.fillStyle=grd;ct.fillRect(0,-4,140,8);ct.strokeStyle='#ffffff';ct.lineWidth=1;ct.globalAlpha=e._beamT/45*0.4;
ct.beginPath();ct.moveTo(0,-6);ct.lineTo(140,-2);ct.moveTo(0,6);ct.lineTo(140,2);ct.stroke();ct.restore()}
// Reality Shear beam (Void Herald)
if(e._shearT>0&&e._shearT<=50){ct.save();ct.rotate(e._shearAng);
ct.globalAlpha=Math.min(1,e._shearT/20)*0.8;const shGrd=ct.createLinearGradient(-RPX,0,RPX,0);
shGrd.addColorStop(0,'rgba(200,100,255,0)');shGrd.addColorStop(0.4,'#cc66ff');shGrd.addColorStop(0.6,'#cc66ff');shGrd.addColorStop(1,'rgba(200,100,255,0)');
ct.fillStyle=shGrd;ct.fillRect(-RPX,-6,RPX*2,12);ct.strokeStyle='#ffffff';ct.lineWidth=1;ct.globalAlpha*=0.5;
ct.setLineDash([8,4]);ct.beginPath();ct.moveTo(-RPX,-8);ct.lineTo(RPX,-8);ct.moveTo(-RPX,8);ct.lineTo(RPX,8);ct.stroke();ct.setLineDash([]);ct.restore()}
else if(e._shearT>50){ct.save();ct.rotate(e._shearAng);ct.globalAlpha=0.3;ct.strokeStyle='#cc66ff';ct.lineWidth=1;
ct.setLineDash([6,6]);ct.beginPath();ct.moveTo(-RPX,0);ct.lineTo(RPX,0);ct.stroke();ct.setLineDash([]);ct.restore()}
// Fungal Bloom glow (Mycelium Titan)
if(e._bloomT>0){ct.globalAlpha=0.3+Math.sin(fr*.15)*0.1;ct.strokeStyle='#44ff88';ct.lineWidth=3;
ct.beginPath();ct.arc(0,0,e.hw+12+Math.sin(fr*.1)*4,0,Math.PI*2);ct.stroke();ct.globalAlpha=1}
// Absolute Zero frozen screen overlay (Frost Sovereign)
if(e._azT>0&&e._azT>60){ct.save();ct.setTransform(1,0,0,1,0,0);ct.globalAlpha=0.15+(90-e._azT)/90*0.3;
ct.fillStyle='#88ccff';ct.fillRect(0,0,W,H);ct.globalAlpha=0.4;ct.filter='saturate(0.2)';ct.restore()}}
else if(e.type==='mimic'){// Chest that attacks
ct.fillStyle=fl?'#fff':'#ffaa22';
const chomp=Math.sin(e.age*.5)*3;
ct.fillRect(-e.hw,-e.hh+chomp,e.hw*2,e.hh*2-chomp);
// Teeth
ct.fillStyle=fl?'#fff':'#ffffff';for(let t=0;t<5;t++){ct.fillRect(-e.hw+t*5+1,-e.hh+chomp-2,3,4)}
// v8.0 Proper eyes
drawEye(-4+ex*2,-e.hh+5+ey,'#ff0000',2.5);drawEye(3+ex*2,-e.hh+5+ey,'#ff0000',2.5);
// Gold color bottom
ct.fillStyle='rgba(255,200,50,0.3)';ct.fillRect(-e.hw+2,2,e.hw*2-4,e.hh-4)}
else if(e.type==='stalker'){ct.globalAlpha=(e.stalkerAlpha||0.05)*(e.alpha||1);
ct.fillStyle=fl?'#fff':'#443366';ct.beginPath();ct.arc(0,0,e.hw,0,Math.PI*2);ct.fill();
// Shimmer effect
if(e.stalkerAlpha<0.3){ct.strokeStyle='rgba(100,50,150,0.15)';ct.lineWidth=1;ct.setLineDash([2,4]);ct.beginPath();ct.arc(0,0,e.hw+3,0,Math.PI*2);ct.stroke();ct.setLineDash([])}
drawEye(-2+ex*2,-2+ey*2,'#ff44ff',2);drawEye(1+ex*2,-2+ey*2,'#ff44ff',2);ct.globalAlpha=e.alpha||1}
// v7.0 Revenant - ghostly player mirror
else if(e.type==='revenant'){const revAlpha=e.ghostPhase?0.25:0.8;ct.globalAlpha=revAlpha*(e.alpha||1);
ct.fillStyle=fl?'#fff':e.solidWindow>0?'#66ff88':'#44cc66';
// Draw as player silhouette shape
ct.beginPath();ct.moveTo(0,-e.hh);ct.lineTo(-e.hw,e.hh*.6);ct.lineTo(-e.hw*.4,e.hh);ct.lineTo(e.hw*.4,e.hh);ct.lineTo(e.hw,e.hh*.6);ct.closePath();ct.fill();
// Eyes
ct.fillStyle=e.solidWindow>0?'#ffffff':'#88ffaa';ct.fillRect(-3,-2,2,3);ct.fillRect(1,-2,2,3);
// Solid window indicator
if(e.solidWindow>0){ct.strokeStyle='#ffffff';ct.lineWidth=2;ct.beginPath();ct.arc(0,0,e.hw+4,0,Math.PI*2);ct.stroke()}
// Ghost trail effect
if(e.ghostPhase){ct.strokeStyle='rgba(68,204,102,0.1)';ct.lineWidth=1;ct.setLineDash([3,5]);
ct.beginPath();ct.arc(0,0,e.hw+6+Math.sin(fr*.1)*3,0,Math.PI*2);ct.stroke();ct.setLineDash([])}
ct.globalAlpha=e.alpha||1}
// Mini-boss types
else if(e.isMini){
ct.beginPath();ct.arc(0,0,e.hw,0,Math.PI*2);ct.fill();
ct.fillStyle=fl?'#fff':'rgba(0,0,0,0.2)';ct.beginPath();ct.arc(ex*2,ey*2,e.hw*.3,0,Math.PI*2);ct.fill();
ct.fillStyle='#fff';ct.fillRect(-2+ex*3,-2+ey*2,3,3);
// Mini-boss HP bar
ct.fillStyle='rgba(0,0,0,0.5)';ct.fillRect(-e.hw,-e.hh-10,e.hw*2,5);ct.fillStyle=e.color;ct.fillRect(-e.hw,-e.hh-10,e.hw*2*(e.hp/e.mhp),5);
ct.fillStyle='rgba(255,255,255,0.4)';ct.font='5px Silkscreen';ct.textAlign='center';ct.fillText(e.bossName||'MINI-BOSS',0,-e.hh-14)}

ct.shadowBlur=0;
// HP bar for non-boss entities
if(e.type!=='boss'&&!e.isMini&&e.hp<e.mhp){ct.fillStyle='rgba(0,0,0,0.4)';ct.fillRect(-e.hw,-e.hh-7,e.hw*2,4);
ct.fillStyle=e.elite?e.eCol:e.color;ct.fillRect(-e.hw,-e.hh-7,e.hw*2*(e.hp/e.mhp),4)}
if(e.elite){ct.fillStyle=e.eCol;ct.font='6px Silkscreen';ct.textAlign='center';ct.globalAlpha=.55;ct.fillText(`${e.eSym||'★'} ${e.eName}`,0,-e.hh-11);ct.globalAlpha=1}
if(e.statuses){for(const s of e.statuses){if(s.type==='burn')ct.fillStyle=`rgba(255,100,30,${.08+Math.sin(fr*.25)*.04})`;
else if(s.type==='poison')ct.fillStyle=`rgba(100,255,60,${.06+Math.sin(fr*.2)*.03})`;
else if(s.type==='bleed')ct.fillStyle=`rgba(255,30,60,${.06+Math.sin(fr*.3)*.03})`;
else continue;ct.beginPath();ct.arc(0,0,e.hw+4,0,Math.PI*2);ct.fill()}}
ct.restore()}ct.shadowBlur=0;

// v6.1 Player afterimages — enhanced with glow + shadowBlur
for(const ai of P.ai){ct.globalAlpha=ai.life/14*.35;
ct.globalCompositeOperation='screen';
ct.shadowColor=P.classColor;ct.shadowBlur=6;
ct.fillStyle=`rgba(${hexToRgb(P.classColor)},0.5)`;
if(P.class==='pyromancer'){ct.beginPath();ct.arc(ai.x,ai.y,P.hw+1,0,Math.PI*2);ct.fill()}
else if(P.class==='voidwalker'){ct.save();ct.translate(ai.x,ai.y);ct.rotate(Math.PI/4);ct.fillRect(-P.hw-1,-P.hh-1,(P.hw+1)*2,(P.hh+1)*2);ct.restore()}
else if(P.class==='warden'){ct.save();ct.translate(ai.x,ai.y);const s=P.hw+2;ct.beginPath();for(let i=0;i<6;i++){const a=Math.PI/3*i-Math.PI/6;ct.lineTo(Math.cos(a)*s,Math.sin(a)*s)}ct.closePath();ct.fill();ct.restore()}
else if(P.class==='chronomancer'){ct.beginPath();ct.arc(ai.x,ai.y,P.hw+1,0,Math.PI*2);ct.fill();
ct.strokeStyle=`rgba(0,204,255,${ai.life/14*0.3})`;ct.lineWidth=1;ct.beginPath();ct.arc(ai.x,ai.y,P.hw+5,0,Math.PI*2);ct.stroke()}
else if(P.class==='shadowblade'){ct.beginPath();ct.moveTo(ai.x,ai.y-P.hh-2);ct.lineTo(ai.x+P.hw+2,ai.y+P.hh);ct.lineTo(ai.x-P.hw-2,ai.y+P.hh);ct.closePath();ct.fill();
// Shadow flicker on afterimages
ct.strokeStyle=`rgba(68,221,170,${ai.life/14*0.3})`;ct.lineWidth=1;ct.stroke()}
else{ct.beginPath();ct.moveTo(ai.x,ai.y-P.hh-2);ct.lineTo(ai.x+P.hw+2,ai.y+P.hh);ct.lineTo(ai.x-P.hw-2,ai.y+P.hh);ct.closePath();ct.fill()}}
ct.shadowBlur=0;ct.globalAlpha=1;ct.globalCompositeOperation='source-over';

// ═══ PLAYER ═══
if(gSt!=='dead'){const pa=P.inv>0?.25+Math.sin(fr*.5)*.3:1;ct.globalAlpha=pa;ct.save();ct.translate(P.x,P.y);
if(P.charging&&P.chargeT>10){const cp=Math.min(1,P.chargeT/40);const cc=P.w?P.w.c:'#c8a0ff';
// v5.1 pulsing charge ring
ct.strokeStyle=cc;ct.lineWidth=1+cp*2;ct.globalAlpha=pa*cp*(0.3+Math.sin(fr*0.2)*0.15);
ct.beginPath();ct.arc(0,0,18+cp*8+Math.sin(fr*.15)*3,0,Math.PI*2);ct.stroke();
ct.lineWidth=2+cp*2;ct.globalAlpha=pa*cp*.6;ct.beginPath();ct.arc(0,0,14+cp*4,0,Math.PI*2*cp);ct.stroke();
if(cp>=1){ct.globalAlpha=pa*0.15*(0.5+Math.sin(fr*0.3)*0.5);ct.fillStyle=cc;ct.beginPath();ct.arc(0,0,22,0,Math.PI*2);ct.fill()}
ct.globalAlpha=pa}
if(P.dsh){ct.fillStyle=bio.ac+'0.08)';ct.beginPath();ct.arc(0,0,22,0,Math.PI*2);ct.fill();
// v6.1 speed lines during dash
ct.strokeStyle='rgba(255,255,255,0.06)';ct.lineWidth=1;
for(let sl=0;sl<12;sl++){const a=P.dir+Math.PI+(Math.random()-.5)*1.2;const d=60+Math.random()*100;
ct.beginPath();ct.moveTo(Math.cos(a)*d,Math.sin(a)*d);ct.lineTo(Math.cos(a)*(d+30+Math.random()*40),Math.sin(a)*(d+30+Math.random()*40));ct.stroke()}}
if(P.bT>0){ct.strokeStyle='rgba(255,50,0,0.2)';ct.lineWidth=2;ct.beginPath();ct.arc(0,0,16+Math.sin(fr*.12)*3,0,Math.PI*2);ct.stroke()}
ct.fillStyle='rgba(0,0,0,0.2)';ct.beginPath();ct.ellipse(0,P.hh+3,P.hw+1.5,3.5,0,0,Math.PI*2);ct.fill();
if(P.shield>0){ct.strokeStyle='rgba(100,220,210,0.18)';ct.lineWidth=2;ct.beginPath();ct.arc(0,0,P.hw+8,0,Math.PI*2);ct.stroke()}
// v9.0 Chaos Gem aura indicator
if(P._chaosAuraT>0){ct.globalAlpha=P._chaosAuraT/20*0.4;ct.strokeStyle=P._chaosAuraColor||'#ff88cc';ct.lineWidth=2;
ct.shadowColor=P._chaosAuraColor||'#ff88cc';ct.shadowBlur=12;ct.beginPath();ct.arc(0,0,P.hw+10+Math.sin(fr*.2)*3,0,Math.PI*2);ct.stroke();
ct.shadowBlur=0;ct.globalAlpha=1;P._chaosAuraT--}
if(P.parryWindow>0){ct.strokeStyle='rgba(255,255,255,0.45)';ct.lineWidth=3;const pa2=P.parryWindow/10;ct.beginPath();ct.arc(Math.cos(P.dir)*12,Math.sin(P.dir)*12,10*pa2,P.dir-.8,P.dir+.8);ct.stroke()}

// v7.0 Stretch deformation on hurt
const _wasStretched=P.stretchT>0;
if(_wasStretched){const sr=P.stretchT/12;ct.save();ct.scale(1+sr*0.3*Math.cos(P.stretchDir),1+sr*0.3*Math.sin(P.stretchDir));P.stretchT=Math.max(0,P.stretchT-1)}
// v7.0 Damage direction indicator
if(P.dmgIndicator&&P.dmgIndicator.life>0){const di=P.dmgIndicator;ct.save();ct.globalAlpha=di.life/20*0.6;ct.strokeStyle='#ff3366';ct.lineWidth=2;
const da=di.angle+Math.PI;ct.beginPath();ct.arc(0,0,P.hw+14,da-0.5,da+0.5);ct.stroke();ct.restore();di.life--}
const pColor=P.bT>0?'#ff6644':P.classColor;
// v7.0 White sprite flash on hurt
ct.fillStyle=P.flashWhite>0?'#ffffff':pColor;if(P.flashWhite>0)P.flashWhite--;
ct.shadowColor=pColor;ct.shadowBlur=P.dsh?18:10;
if(P.class==='voidwalker'){ct.save();ct.rotate(Math.PI/4);ct.fillRect(-P.hw-1,-P.hh-1,(P.hw+1)*2,(P.hh+1)*2);ct.restore();
// v10.0 Rotating void rune marks
for(let r=0;r<3;r++){const ra=fr*0.04+r*Math.PI*2/3;const rd=P.hw+8+Math.sin(fr*0.06+r)*2;
ct.save();ct.globalAlpha=0.4+Math.sin(fr*0.08+r)*0.2;ct.strokeStyle='#c8a0ff';ct.lineWidth=1.5;
ct.beginPath();ct.arc(Math.cos(ra)*rd,Math.sin(ra)*rd,3,0,Math.PI*2);ct.stroke();ct.restore()}
if(fr%3===0)emitTrail(P.x+(Math.random()-.5)*8,P.y+(Math.random()-.5)*8,'rgba(200,160,255,0.3)',1)}
else if(P.class==='pyromancer'){ct.beginPath();ct.arc(0,0,P.hw+2,0,Math.PI*2);ct.fill();
ct.fillStyle='rgba(255,200,100,0.3)';ct.beginPath();ct.arc(0,-2,P.hw-2+Math.sin(fr*.2)*2,0,Math.PI*2);ct.fill();
// v10.0 Heat shimmer distortion ring
ct.save();ct.globalAlpha=0.15+Math.sin(fr*0.1)*0.05;ct.strokeStyle='#ff6633';ct.lineWidth=1;
ct.beginPath();ct.arc(0,0,P.hw+6+Math.sin(fr*0.15)*3,0,Math.PI*2);ct.stroke();ct.restore();
if(fr%5===0){const fa=Math.random()*Math.PI*2;emitTrail(P.x+Math.cos(fa)*6,P.y+Math.sin(fa)*6,'rgba(255,140,50,0.25)',0.8)}}
else if(P.class==='warden'){// Hexagonal shield shape
const s=P.hw+2;ct.beginPath();for(let i=0;i<6;i++){const a=Math.PI/3*i-Math.PI/6;ct.lineTo(Math.cos(a)*s,Math.sin(a)*s)}ct.closePath();ct.fill();
if(P.fortifyT>0){ct.strokeStyle='rgba(6,214,160,0.4)';ct.lineWidth=2+Math.sin(fr*.15);ct.beginPath();for(let i=0;i<6;i++){const a=Math.PI/3*i-Math.PI/6;ct.lineTo(Math.cos(a)*(s+6),Math.sin(a)*(s+6))}ct.closePath();ct.stroke()}
if(P.shield>0){const shieldPct=P.shield/Math.max(1,P.maxShield);ct.save();ct.globalAlpha=0.15+shieldPct*0.3;ct.strokeStyle='#06d6a0';ct.lineWidth=1+shieldPct*2;
ct.beginPath();for(let i=0;i<6;i++){const a=Math.PI/3*i-Math.PI/6;ct.lineTo(Math.cos(a)*(s+4+shieldPct*4),Math.sin(a)*(s+4+shieldPct*4))}ct.closePath();ct.stroke();ct.restore();
if(fr%3===0)emitTrail(P.x+(Math.random()-.5)*8,P.y+(Math.random()-.5)*8,'rgba(6,214,160,0.25)',1)}}
else if(P.class==='chronomancer'){ct.beginPath();ct.arc(0,0,P.hw+2,0,Math.PI*2);ct.fill();
// Clock hands
ct.strokeStyle='rgba(255,255,255,0.5)';ct.lineWidth=1.5;const ca1=fr*0.05,ca2=fr*0.008;
ct.beginPath();ct.moveTo(0,0);ct.lineTo(Math.cos(ca1)*(P.hw-2),Math.sin(ca1)*(P.hw-2));ct.stroke();
ct.beginPath();ct.moveTo(0,0);ct.lineTo(Math.cos(ca2)*(P.hw),Math.sin(ca2)*(P.hw));ct.stroke();
// Time particles
if(fr%4===0)emitTrail(P.x+(Math.random()-.5)*10,P.y+(Math.random()-.5)*10,'rgba(0,204,255,0.3)',1)}
else if(P.class==='shadowblade'){// v10.0 Shadowblade: flickering triangle with shadow aura
ct.save();ct.globalAlpha=(ct.globalAlpha||1)*(0.85+Math.sin(fr*0.4)*0.15);
ct.beginPath();ct.moveTo(0,-P.hh-3);ct.lineTo(P.hw+3,P.hh);ct.lineTo(-P.hw-3,P.hh);ct.closePath();ct.fill();ct.restore();
// Shadow aura flicker
if(fr%4===0){const sa=Math.random()*Math.PI*2;
emitTrail(P.x+Math.cos(sa)*(P.hw+4),P.y+Math.sin(sa)*(P.hh+4),'rgba(68,221,170,0.2)',0.6)}}
else{ct.beginPath();ct.moveTo(0,-P.hh-3);ct.lineTo(P.hw+3,P.hh);ct.lineTo(-P.hw-3,P.hh);ct.closePath();ct.fill()}
if(_wasStretched)ct.restore(); // v7.0 close stretch transform
ct.shadowBlur=0;
ct.fillStyle='#fff';const pex=Math.cos(P.dir)*3.5,pey=Math.sin(P.dir)*3.5;ct.fillRect(-3+pex,-2+pey,2,2.5);ct.fillRect(2+pex,-2+pey,2,2.5);
// v5 enhanced weapon attack arc + slash trail
if(P.w&&P.atkA>0){const wa=P.atkA/9;ct.strokeStyle=P.w.c;
// v5.1 weapon-type trail widths
const wn=P.w.name||'';let arcW=2.5+P.comboStep;
if(wn.includes('AXE')||wn.includes('MACE'))arcW=4+P.comboStep*1.5;
else if(wn.includes('DAGGER')||wn.includes('RAPIER'))arcW=1.5;
else if(wn.includes('SCYTHE'))arcW=3+P.comboStep;
ct.lineWidth=arcW;ct.globalAlpha=wa*.7;
const cStep=P.comboStep;const arcSize=[.8,.9,1.2][cStep];
if(P.w.t==='m'){ct.beginPath();ct.arc(0,0,wR(),P.dir-arcSize,P.dir+arcSize);ct.stroke();
// v8.0 Evolved weapon secondary arc overlay
if(P.w.evolved){ct.save();ct.globalCompositeOperation='screen';ct.strokeStyle=P.w.c;ct.lineWidth=arcW+2;ct.globalAlpha=wa*0.3;
ct.beginPath();ct.arc(0,0,wR()+3,P.dir-arcSize*0.9,P.dir+arcSize*0.9);ct.stroke();ct.restore();ct.globalAlpha=wa*.7}
// Combo finisher extra glow
if(cStep===2){ct.lineWidth=4;ct.globalAlpha=wa*.3;ct.beginPath();ct.arc(0,0,wR()+4,P.dir-arcSize*.8,P.dir+arcSize*.8);ct.stroke()}}
else{ct.beginPath();ct.moveTo(Math.cos(P.dir)*8,Math.sin(P.dir)*8);ct.lineTo(Math.cos(P.dir)*24,Math.sin(P.dir)*24);ct.stroke();}}
ct.restore();ct.globalAlpha=1}

// v10.0 Particles — batch by blend mode, motion trails, additive glow
// Draw source-over particles first, then lighter (additive) on top
const partsByBlend=[[],[]];for(const p of parts){if(p.x<cX-20||p.x>cX+W+20||p.y<cY-20||p.y>cY+H+20)continue;
(p.blend==='lighter'?partsByBlend[1]:partsByBlend[0]).push(p)}
for(let bi=0;bi<2;bi++){if(partsByBlend[bi].length===0)continue;
ct.globalCompositeOperation=bi===0?'source-over':'lighter';
for(const p of partsByBlend[bi]){
ct.globalAlpha=p.life/p.ml;ct.fillStyle=p.color;const sz=p.size*(p.life/p.ml);
// Particle glow for size > 3
if(sz>3&&!p.telegraph){ct.shadowBlur=sz*1.5;ct.shadowColor=p.color}
if(p.telegraph){// v6 danger zone telegraph
ct.strokeStyle='rgba(255,60,30,'+Math.min(0.35,0.15+0.2*(1-p.life/p.ml))+')';ct.lineWidth=1.5;ct.setLineDash([3,3]);
ct.beginPath();ct.arc(p.x,p.y,p.size*(0.5+0.5*(1-p.life/p.ml)),0,Math.PI*2);ct.stroke();ct.setLineDash([]);
ct.fillStyle='rgba(255,60,30,'+(0.04+0.06*(1-p.life/p.ml))+')';ct.beginPath();ct.arc(p.x,p.y,p.size*(0.5+0.5*(1-p.life/p.ml)),0,Math.PI*2);ct.fill()}
else if(p.shape==='slash'){// v8 crit slash line
ct.save();ct.translate(p.x,p.y);ct.rotate(p.slashDir||0);ct.strokeStyle=p.color;ct.lineWidth=p.lineW||2.5;ct.globalAlpha=p.life/p.ml*0.8;
ct.beginPath();ct.moveTo(-sz/2,0);ct.lineTo(sz/2,0);ct.stroke();ct.restore()}
else if(p.shape==='speedline'){// v9.0 manga-style impact speed line
ct.save();ct.translate(p.x,p.y);ct.rotate(p.slashDir||0);
const slAlpha=p.life/p.ml;ct.strokeStyle=p.color;ct.lineWidth=Math.max(.5,(p.lineW||1.5)*slAlpha);ct.globalAlpha=slAlpha*.7;
ct.beginPath();ct.moveTo(0,0);ct.lineTo(sz,0);ct.stroke();
if(p.lineW>=1.5){ct.strokeStyle='#fff';ct.lineWidth=Math.max(.3,(p.lineW||1)*.4*slAlpha);ct.globalAlpha=slAlpha*.3;ct.beginPath();ct.moveTo(sz*.2,0);ct.lineTo(sz*.8,0);ct.stroke()}
ct.restore()}
else if(p.shape==='star'){// v6 star-shaped crit particles
ct.save();ct.translate(p.x,p.y);ct.rotate(fr*0.15+p.x);ct.beginPath();
for(let si=0;si<5;si++){const a=Math.PI*2/5*si-Math.PI/2;ct.lineTo(Math.cos(a)*sz/2,Math.sin(a)*sz/2);
const ia=a+Math.PI/5;ct.lineTo(Math.cos(ia)*sz/4,Math.sin(ia)*sz/4)}ct.closePath();ct.fill();ct.restore()}
else if(p.shape==='circle'){ct.beginPath();ct.arc(p.x,p.y,sz/2,0,Math.PI*2);ct.fill()}
else{ct.fillRect(p.x-sz/2,p.y-sz/2,sz,sz)}
ct.shadowBlur=0;
// v10 Motion trail for particles with prevX/prevY
if(p.blend==='lighter'&&p.prevX!==undefined){const ta=p.life/p.ml*0.15;
ct.globalAlpha=ta;ct.strokeStyle=p.color;ct.lineWidth=Math.max(0.5,sz*0.5);
ct.beginPath();ct.moveTo(p.prevX,p.prevY);ct.lineTo(p.x,p.y);ct.stroke()}
p.prevX=p.x;p.prevY=p.y}}ct.globalCompositeOperation='source-over';ct.globalAlpha=1;
// v7.1 VFX lines (voidslash etc.)
for(let vl=vfxLines.length-1;vl>=0;vl--){const ln=vfxLines[vl];ln.life--;if(ln.life<=0){vfxLines.splice(vl,1);continue}
const la=ln.life/ln.ml;ct.save();ct.globalAlpha=la*0.6;ct.strokeStyle=ln.color;ct.lineWidth=ln.width*la;ct.shadowColor=ln.color;ct.shadowBlur=12*la;
const ext=Math.max(W,H);ct.beginPath();ct.moveTo(ln.x-Math.cos(ln.angle)*ext,ln.y-Math.sin(ln.angle)*ext);
ct.lineTo(ln.x+Math.cos(ln.angle)*ext,ln.y+Math.sin(ln.angle)*ext);ct.stroke();ct.shadowBlur=0;ct.restore()}

// v5 Enhanced floating text: bounce, outline, crit zoom — v7.1 size scaling
for(const f of fts){const t=f.life/65;ct.globalAlpha=Math.min(1,f.life/15);
const sm=f.sizeMult||f.startSize||1;const baseSize=f.big?14:10;
const scale=f.big?sm+(0.5*(1-Math.min(1,(65-f.life)/10))):1;
const sz=Math.floor(baseSize*scale);ct.font=`bold ${sz}px Silkscreen`;ct.textAlign='center';
// v10.0 Type-based damage number styling
const isCrit=f.text.includes('!')||f.text==='CRITICAL!';
const isHeal=f.color==='#44ff66'||f.text.includes('+');
// Dark outline for readability
ct.fillStyle='rgba(0,0,0,0.6)';for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){if(ox||oy)ct.fillText(f.text,f.x+ox,f.y+oy)}
// Gold glow outline for crits
if(isCrit&&f.big){ct.strokeStyle='#ffcc00';ct.lineWidth=2;ct.strokeText(f.text,f.x,f.y)}
ct.fillStyle=f.color;ct.fillText(f.text,f.x,f.y);
// Wavy effect for DOT text
if(f.text.includes('BURN')||f.text.includes('POISON')){const wave=Math.sin(fr*0.3+f.x)*2;ct.fillText(f.text,f.x+wave,f.y)}}ct.globalAlpha=1;
ct.restore();

// ═══ POST-PROCESSING ═══
const fogG=ct.createRadialGradient(W/2,H/2,W*.38,W/2,H/2,W*.78);fogG.addColorStop(0,'transparent');fogG.addColorStop(1,bio.fg+(bio.fogDensity||.18)+')');ct.fillStyle=fogG;ct.fillRect(0,0,W,H);
if(slMo>0){ct.fillStyle='rgba(200,170,255,0.03)';ct.fillRect(0,0,W,H)}
if(trA>0){ct.fillStyle=`rgba(0,0,0,${trA})`;ct.fillRect(0,0,W,H)}
// v10.0 Biome-themed floor transition
if(floorTransT>0){const maxR=Math.max(W,H)*0.8;
const r=floorTransPhase===0?maxR*(1-floorTransT/80):maxR*(floorTransT/40);
const bIdx=bio.i;const tp=floorTransPhase===0?(80-floorTransT)/80:1-(floorTransT/40);
ct.save();
if(bIdx===0){// Crypt: stone door slam
const doorW=W/2*tp;ct.fillStyle='#1a1520';ct.fillRect(0,0,doorW,H);ct.fillRect(W-doorW,0,doorW,H);
if(tp>0.4){const crack=1-tp;ct.fillStyle=`rgba(200,160,255,${crack*0.3})`;ct.fillRect(W/2-2,0,4,H)}}
else if(bIdx===1){// Fungal: mycelial tendrils
ct.fillStyle='#0a1a10';for(let t=0;t<8;t++){const ta=Math.PI*2/8*t;const tl=tp*maxR;
ct.beginPath();ct.moveTo(W/2,H/2);let cx2=W/2,cy2=H/2;
for(let d=0;d<tl;d+=8){cx2+=Math.cos(ta+Math.sin(d*0.05+t)*0.3)*8;cy2+=Math.sin(ta+Math.sin(d*0.05+t)*0.3)*8;
ct.lineTo(cx2,cy2)}ct.lineTo(cx2+15,cy2+15);ct.lineTo(cx2-15,cy2+15);ct.closePath();ct.fill()}}
else if(bIdx===2){// Infernal: burn from edges
const grad=ct.createRadialGradient(W/2,H/2,maxR*(1-tp),W/2,H/2,maxR);
grad.addColorStop(0,'rgba(6,6,12,0)');grad.addColorStop(0.5,`rgba(255,60,20,${tp*0.3})`);grad.addColorStop(1,`rgba(6,6,12,${tp})`);ct.fillStyle=grad;ct.fillRect(0,0,W,H)}
else if(bIdx===3){// Frozen: ice crystallization
ct.fillStyle=`rgba(136,204,255,${tp*0.6})`;const n=16;for(let i=0;i<n;i++){const ia=Math.PI*2/n*i;const il=tp*maxR;
ct.beginPath();ct.moveTo(W/2,H/2);ct.lineTo(W/2+Math.cos(ia)*il,H/2+Math.sin(ia)*il);
ct.lineTo(W/2+Math.cos(ia+0.1)*il*0.9,H/2+Math.sin(ia+0.1)*il*0.9);ct.closePath();ct.fill()}}
else if(bIdx===4){// Void: glitch displacement
for(let s=0;s<6;s++){const sy=Math.random()*H;const sh=2+Math.random()*8;const sx=(Math.random()-0.5)*tp*40;
ct.drawImage(gc,0,sy,W,sh,sx,sy,W,sh)}ct.fillStyle=`rgba(6,6,12,${tp*0.7})`;ct.fillRect(0,0,W,H)}
else{// Default iris wipe
ct.fillStyle='#06060c';ct.beginPath();ct.rect(0,0,W,H);ct.moveTo(W/2+r,H/2);ct.arc(W/2,H/2,Math.max(0,r),0,Math.PI*2,true);ct.fill()}
ct.restore()}
if(sfA>0){ct.globalAlpha=sfA;ct.fillStyle=sfC;ct.fillRect(0,0,W,H);ct.globalAlpha=1}
// v6.0 Boss blood moon effect
const bossLow=ents.find(e=>e.type==='boss'&&e.hp<e.mhp*0.25);
if(bossLow){const bPulse=Math.sin(fr*.06)*.04+.04;ct.fillStyle=`rgba(180,0,30,${bPulse})`;ct.fillRect(0,0,W,H);
// Ember rain
if(fr%2===0){const rx=Math.random()*W,ry=-10;parts.push({x:rx+cX,y:ry+cY,vx:(Math.random()-.5)*.5,vy:1+Math.random()*2,life:40+Math.random()*30,ml:70,color:Math.random()>.5?'#ff4422':'#ff8844',size:1+Math.random()*2,shape:'circle',grav:0.02})}}
// v6.1 enhanced low-HP heartbeat vignette
if(P.hp<=P.mhp*.25&&P.hp>0&&gSt==='playing'){
const heartbeat=Math.pow(Math.sin(fr*.12),8);const urgency=1-(P.hp/(P.mhp*.25));
ct.fillStyle=`rgba(255,0,0,${heartbeat*.08*(1+urgency)})`;ct.fillRect(0,0,W,H);
const edge=ct.createRadialGradient(W/2,H/2,W*.15,W/2,H/2,W*.45);
edge.addColorStop(0,'transparent');edge.addColorStop(1,`rgba(255,0,30,${(.08+heartbeat*.12)*(1+urgency)})`);
ct.fillStyle=edge;ct.fillRect(0,0,W,H)}
// v6.1 blizzard frost screen edges
if(blizzardFrostT>0){const fa=Math.min(1,blizzardFrostT/30)*.12;blizzardFrostT--;
ct.fillStyle=`rgba(136,204,255,${fa})`;ct.fillRect(0,0,W,6);ct.fillRect(0,H-6,W,6);ct.fillRect(0,0,6,H);ct.fillRect(W-6,0,6,H);
const g1=ct.createLinearGradient(0,0,0,40);g1.addColorStop(0,`rgba(136,204,255,${fa*.8})`);g1.addColorStop(1,'transparent');ct.fillStyle=g1;ct.fillRect(0,0,W,40);
const g2=ct.createLinearGradient(0,H,0,H-40);g2.addColorStop(0,`rgba(136,204,255,${fa*.8})`);g2.addColorStop(1,'transparent');ct.fillStyle=g2;ct.fillRect(0,H-40,W,40)}

// v10.0 Player status effect screen overlays
if(P.statuses&&gSt==='playing'){for(const s of P.statuses){
if(s.type==='poison'){const pa=0.035+Math.sin(fr*0.08)*0.015;
ct.fillStyle=`rgba(60,180,40,${pa})`;ct.fillRect(0,0,W,H);
const edg=ct.createRadialGradient(W/2,H/2,W*.3,W/2,H/2,W*.55);
edg.addColorStop(0,'transparent');edg.addColorStop(1,`rgba(80,200,60,${0.05+Math.sin(fr*0.1)*0.02})`);
ct.fillStyle=edg;ct.fillRect(0,0,W,H)}
else if(s.type==='burn'){const ba=0.025+Math.sin(fr*0.15)*0.015;
ct.fillStyle=`rgba(255,80,20,${ba})`;ct.fillRect(0,0,W,H)}
else if(s.type==='freeze'){const fa=0.04+Math.sin(fr*0.06)*0.015;
ct.fillStyle=`rgba(100,180,255,${fa})`;ct.fillRect(0,0,W,H);
ct.fillStyle=`rgba(180,220,255,${0.06+Math.sin(fr*0.03)*0.02})`;
for(let x=0;x<W;x+=20){const h=6+Math.sin(x*0.15+fr*0.02)*3;
ct.beginPath();ct.moveTo(x,0);ct.lineTo(x+10,0);ct.lineTo(x+5,h);ct.fill();
ct.beginPath();ct.moveTo(x,H);ct.lineTo(x+10,H);ct.lineTo(x+5,H-h);ct.fill()}}}}

// v5 Directional chromatic aberration
if(chromAb>0.1){const cab=Math.min(chromAb,4);const ca=shkAngle||0;
const dx=Math.cos(ca)*cab,dy=Math.sin(ca)*cab;
ct.globalCompositeOperation='lighter';ct.globalAlpha=cab*0.035;
ct.fillStyle='rgba(255,0,0,1)';ct.fillRect(dx,dy,W,H);
ct.fillStyle='rgba(0,0,255,1)';ct.fillRect(-dx,-dy,W,H);
ct.globalCompositeOperation='source-over';ct.globalAlpha=1}

// v5 Biome post-FX
if(bio.i===0){// Crypt: dust motes + edge shadow wisps
if(fr%6===0){ct.save();ct.fillStyle='rgba(200,180,150,0.04)';
for(let dm=0;dm<3;dm++){ct.beginPath();ct.arc(Math.random()*W,Math.random()*H,0.5+Math.random(),0,Math.PI*2);ct.fill()}ct.restore()}
if(fr%90<3){ct.save();const wispX=Math.random()<0.5?Math.random()*40:W-Math.random()*40;
const wispY=Math.random()*H;ct.globalAlpha=0.03;ct.fillStyle='rgba(100,80,120,1)';
ct.beginPath();ct.arc(wispX,wispY,20+Math.random()*15,0,Math.PI*2);ct.fill();ct.restore()}}
if(bio.i===2){// Infernal: heat shimmer on lower screen
const shimAmt=Math.sin(fr*.05)*1.5;ct.save();ct.globalAlpha=0.015;
ct.drawImage(gc,0,H*0.4+shimAmt,W,H*0.6,Math.sin(fr*.08)*1.5,H*0.4,W,H*0.6);ct.restore()}
if(bio.i===4){// Void: periodic glitch
if(fr%120<3){ct.save();ct.globalAlpha=0.08;const sliceY=Math.random()*H;const sliceH=10+Math.random()*20;
ct.drawImage(gc,0,sliceY,W,sliceH,3+Math.random()*6,sliceY,W,sliceH);ct.restore()}}

// v6 Biome weather effects
if(bio.i===1&&fr%3===0){// Fungal: rain
ct.save();ct.strokeStyle='rgba(100,220,140,0.08)';ct.lineWidth=1;
for(let r=0;r<6;r++){const rx=Math.random()*W,ry=Math.random()*H;ct.beginPath();ct.moveTo(rx,ry);ct.lineTo(rx-1,ry+8+Math.random()*6);ct.stroke()}ct.restore()}
if(bio.i===2&&fr%2===0){// Infernal: floating embers
ct.save();for(let e=0;e<3;e++){const ex=Math.random()*W,ey=H-Math.random()*H*0.7;
ct.globalAlpha=0.1+Math.random()*0.12;ct.fillStyle=Math.random()>0.5?'#ff6633':'#ffaa33';
ct.beginPath();ct.arc(ex,ey,0.5+Math.random()*1.5,0,Math.PI*2);ct.fill()}ct.restore()}
if(bio.i===3&&fr%4===0){// Frozen: snow
ct.save();ct.fillStyle='rgba(200,220,255,0.1)';
for(let s=0;s<4;s++){const sx=(fr*0.3+s*137)%W,sy=(fr*0.5+s*211)%H;
ct.beginPath();ct.arc(sx,sy,0.8+Math.sin(fr*0.02+s)*0.5,0,Math.PI*2);ct.fill()}ct.restore()}
if(bio.i===4&&fr%5===0){// Void: static noise
ct.save();ct.globalAlpha=0.03;ct.fillStyle='#cc66ff';
for(let v=0;v<8;v++){ct.fillRect(Math.random()*W,Math.random()*H,1+Math.random()*3,1)}ct.restore()}

// v9.0 Dynamic weather overlay
drawWeather(ct);
// v9.0 Screen transition effect
drawTransitionEffect(ct);
// v9.0 Room modifier display
if(curRoomMod&&gSt==='playing'){const rmA=Math.sin(fr*0.04)*0.15+0.35;
ct.globalAlpha=rmA;ct.fillStyle=curRoomMod.color;ct.font='7px Silkscreen';ct.textAlign='right';
ct.fillText(`${curRoomMod.icon} ${curRoomMod.name}`,W-18,46);ct.globalAlpha=1}
// v9.0 FPS display
if(gameSettings.showFPS){ct.fillStyle=fpsDisplay<40?'rgba(255,80,80,0.5)':'rgba(255,255,255,0.2)';ct.font='8px JetBrains Mono';ct.textAlign='right';ct.fillText(`${fpsDisplay} FPS`,W-18,H-18)}
// v9.0 Active curses display
if(activeCurses.length>0){ct.font='7px Silkscreen';ct.textAlign='left';
for(let ci=0;ci<activeCurses.length;ci++){ct.fillStyle=activeCurses[ci].color;ct.globalAlpha=0.4;
ct.fillText(`${activeCurses[ci].icon} ${activeCurses[ci].name}`,18,60+ci*12)}ct.globalAlpha=1}
// v9.0 Boss intro cinematic overlay
drawBossIntro(ct);
// v9.0 Onboarding hints
drawHint(ct);

// Boss HP bar
const boss=ents.find(e=>e.type==='boss');
if(boss){const bw=Math.min(360,W*.55),bx=(W-bw)/2,by=52;
ct.fillStyle='rgba(0,0,0,0.6)';ct.fillRect(bx-4,by-4,bw+8,18);
ct.fillStyle='rgba(40,10,20,0.85)';ct.fillRect(bx,by,bw,12);
const hpPct=boss.hp/boss.mhp;ct.fillStyle=boss.enraged?'#ff0033':boss.color;ct.shadowColor=ct.fillStyle;ct.shadowBlur=10;
ct.fillRect(bx,by,bw*hpPct,12);ct.shadowBlur=0;
for(let s=1;s<10;s++){ct.fillStyle='rgba(0,0,0,0.2)';ct.fillRect(bx+bw/10*s,by,1,12)}
// Phase threshold markers
ct.fillStyle='rgba(255,255,255,0.2)';ct.fillRect(bx+bw*0.75,by,1,12);ct.fillRect(bx+bw*0.5,by,1,12);ct.fillRect(bx+bw*0.25,by,1,12);
ct.fillStyle='rgba(255,255,255,0.55)';ct.font='7px Silkscreen';ct.textAlign='center';ct.fillText(boss.enraged?`⚠ ${boss.bossName} ⚠`:boss.bossName,W/2,by-7);
ct.fillStyle='rgba(255,255,255,0.22)';ct.font='7px JetBrains Mono';ct.fillText(`${Math.ceil(boss.hp)} / ${boss.mhp}`,W/2,by+24);
// v6 Stagger bar
const sby=by+18;const stPct=boss.staggerTimer>0?boss.staggerDmg/boss.staggerThresh:0;
ct.fillStyle='rgba(0,0,0,0.4)';ct.fillRect(bx,sby,bw,5);
if(boss.staggered){ct.fillStyle=fr%6<3?'#ffee44':'#ffffff';ct.fillRect(bx,sby,bw,5);
ct.fillStyle='rgba(255,255,100,0.7)';ct.font='7px Silkscreen';ct.fillText('STAGGERED!',W/2,sby+14)}
else{ct.fillStyle='rgba(255,220,60,0.6)';ct.fillRect(bx,sby,bw*Math.min(1,stPct),5)}
// v6 Enrage timer
if(!boss.enraged&&boss.enrageTimer>0){const secs=Math.ceil(boss.enrageTimer/60);
ct.fillStyle=secs<=15?`rgba(255,60,60,${0.4+Math.sin(fr*.15)*.3})`:'rgba(255,255,255,0.2)';
ct.font='6px JetBrains Mono';ct.fillText(`ENRAGE: ${secs}s`,W/2,sby+22)}
// v6 Arena hazards rendering
if(boss.arenaHazards){for(const ah of boss.arenaHazards){const hsx=ah.x-cX,hsy=ah.y-cY;
ct.save();ct.globalAlpha=0.15+Math.sin(fr*.08+ah.x)*0.1;
if(ah.htype==='ghost_wall'){ct.fillStyle='#8888cc';ct.fillRect(hsx-12,hsy-12,24,24);ct.strokeStyle='rgba(136,136,204,0.5)';ct.strokeRect(hsx-14,hsy-14,28,28)}
else if(ah.htype==='toxic_pool'){ct.fillStyle='#44ff66';ct.beginPath();ct.arc(hsx,hsy,ah.rad||18,0,Math.PI*2);ct.fill();ct.globalAlpha*=0.5;ct.beginPath();ct.arc(hsx,hsy,(ah.rad||18)*1.3,0,Math.PI*2);ct.fill()}
else if(ah.htype==='fire_pillar'){const fa=fr*0.05+ah.x;ct.fillStyle='#ff6633';ct.beginPath();ct.arc(hsx,hsy,10,0,Math.PI*2);ct.fill();ct.globalAlpha=0.3;ct.fillStyle='#ffaa33';ct.beginPath();ct.arc(hsx+Math.cos(fa)*8,hsy+Math.sin(fa)*8,6,0,Math.PI*2);ct.fill()}
else if(ah.htype==='ice_patch'){ct.fillStyle='#88ccff';ct.beginPath();ct.arc(hsx,hsy,ah.rad||16,0,Math.PI*2);ct.fill();ct.fillStyle='rgba(200,230,255,0.3)';ct.beginPath();ct.arc(hsx,hsy,(ah.rad||16)*0.6,0,Math.PI*2);ct.fill()}
else if(ah.htype==='gravity_well'){ct.fillStyle='#cc66ff';for(let gr=3;gr>0;gr--){ct.globalAlpha=0.06*gr;ct.beginPath();ct.arc(hsx,hsy,ah.rad*gr/3,0,Math.PI*2);ct.fill()}}
ct.restore()}}}
// v10.0 Corruption HUD bar
if(corruption>0){const cbw=80,cbx=W-cbw-16,cby=38;
ct.fillStyle='rgba(0,0,0,0.4)';ct.fillRect(cbx-1,cby-1,cbw+2,7);
const corCol=corruption>=75?'#cc44ff':corruption>=50?'#ff6644':corruption>=25?'#ffaa44':'#888888';
ct.fillStyle=corCol;ct.fillRect(cbx,cby,cbw*(corruption/100),5);
if(corruptionThreshold>=2){const pulse=Math.sin(fr*0.08)*0.1+0.1;ct.fillStyle=`rgba(${corruption>=75?'204,68,255':'255,102,68'},${pulse})`;ct.fillRect(cbx,cby,cbw*(corruption/100),5)}
ct.fillStyle='rgba(255,255,255,0.3)';ct.font='6px Silkscreen';ct.textAlign='right';
const cNames=['','TAINTED','CORRUPTED','ABYSSAL','CONSUMED'];
ct.fillText(corruptionThreshold>0?cNames[corruptionThreshold]:`${Math.floor(corruption)}%`,cbx-3,cby+5)}
// v10.0 HP bar pulse when low + cracks
if(P.hp<P.mhp*0.25&&P.hp>0&&gSt==='playing'){const pulse=Math.sin(fr*0.15)*0.15+0.15;
ct.fillStyle=`rgba(255,0,0,${pulse})`;ct.fillRect(17,13,102,10)}
// v10.0 Combo ring glow
if(cmb>=5){const cGlow=Math.min(0.3,cmb*0.015);const cCol=cmb>=25?'#ff0044':cmb>=15?'#ff4400':cmb>=10?'#ff8800':'#ffcc00';
ct.strokeStyle=cCol;ct.lineWidth=2;ct.globalAlpha=cGlow+Math.sin(fr*0.1)*0.1;ct.beginPath();
ct.arc(W-60,16,12,0,Math.PI*2);ct.stroke();ct.globalAlpha=1}
// v7.1 UI particles (screen-space, e.g. HP bar shatter)
for(let ui=uiParts.length-1;ui>=0;ui--){const p=uiParts[ui];p.x+=p.vx;p.y+=p.vy;p.vy+=0.15;p.life--;
if(p.life<=0){uiParts.splice(ui,1);continue}
ct.globalAlpha=Math.min(1,p.life/p.ml)*0.8;ct.fillStyle=p.color;
ct.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size)}ct.globalAlpha=1;

// v5 Off-screen enemy indicators
for(const e of ents){if(e.animState==='spawn'&&!e.spawnDone)continue;
const sx=e.x-cX,sy=e.y-cY;
if(sx<-10||sx>W+10||sy<-10||sy>H+10){
const a=Math.atan2(sy-H/2,sx-W/2);const edgeX=Math.max(20,Math.min(W-20,W/2+Math.cos(a)*(W/2-20)));
const edgeY=Math.max(20,Math.min(H-20,H/2+Math.sin(a)*(H/2-20)));
const dist=Math.hypot(sx-W/2,sy-H/2);const sz=Math.max(4,Math.min(8,300/dist));
ct.save();ct.translate(edgeX,edgeY);ct.rotate(a);ct.fillStyle=e.type==='boss'?'rgba(255,50,80,0.6)':'rgba(255,80,80,0.35)';
ct.beginPath();ct.moveTo(sz,0);ct.lineTo(-sz,-sz*.6);ct.lineTo(-sz,sz*.6);ct.closePath();ct.fill();ct.restore()}}

// Weapon special cooldown
if(P.w&&P.w.sp!=='none'&&P.spCd>0){ct.fillStyle='rgba(255,255,255,0.12)';ct.font='8px Silkscreen';ct.textAlign='left';
ct.fillText(`R: ${Math.ceil(P.spCd/60*10)/10}s`,18,H-22)}
if(P.ab!=='none'&&abCh<abMax){ct.fillStyle='rgba(255,255,255,0.12)';ct.font='8px Silkscreen';ct.textAlign='left';
ct.fillText(`Q: ${Math.ceil((abMax-abCh)/abMax*100)}%`,18,H-34)}

// v7.0 Enhanced virtual joystick
if(joyVisible||tA){const jx=joyBaseX||tSX,jy=joyBaseY||tSY;
ct.globalAlpha=.12;ct.strokeStyle='#c8a0ff';ct.lineWidth=2;ct.beginPath();ct.arc(jx,jy,40,0,Math.PI*2);ct.stroke();
ct.fillStyle='rgba(200,160,255,0.04)';ct.fill();
const knobX=jx+tMX*30,knobY=jy+tMY*30;
ct.globalAlpha=.25;ct.fillStyle='#c8a0ff';ct.beginPath();ct.arc(knobX,knobY,10,0,Math.PI*2);ct.fill();
ct.globalAlpha=.08;ct.strokeStyle='#c8a0ff';ct.lineWidth=1;ct.beginPath();ct.moveTo(jx,jy);ct.lineTo(knobX,knobY);ct.stroke();
ct.globalAlpha=1}
// v7.0 Virtual action buttons (mobile)
if(isMobile&&gSt==='playing'){layoutVBtns();ct.font='7px Silkscreen';ct.textAlign='center';ct.textBaseline='middle';
for(const[k,b]of Object.entries(vBtns)){
ct.globalAlpha=b.active?0.35:0.15;ct.strokeStyle=b.color;ct.lineWidth=b.active?2.5:1.5;
ct.beginPath();ct.arc(b.x,b.y,b.r,0,Math.PI*2);ct.stroke();
ct.fillStyle=b.active?b.color+'44':'rgba(255,255,255,0.03)';ct.fill();
ct.globalAlpha=b.active?0.6:0.25;ct.fillStyle=b.color;ct.fillText(b.label,b.x,b.y)}
ct.globalAlpha=1;ct.textAlign='left';ct.textBaseline='alphabetic'}

// ═══ DYNAMIC LIGHTING PASS ═══
drawLighting();
// v10.0 Room entry reveal animation
if(roomRevealT>0){const rp=roomRevealT/45;const maxR=Math.max(W,H)*0.9;const revR=maxR*(1-rp);
ct.save();ct.setTransform(1,0,0,1,0,0);ct.fillStyle=bio.fl;ct.globalAlpha=0.6*rp;
ct.beginPath();ct.rect(0,0,W,H);
const spx=P.x-cX,spy=P.y-cY;ct.moveTo(spx+revR,spy);ct.arc(spx,spy,Math.max(1,revR),0,Math.PI*2,true);
ct.fill();ct.restore();roomRevealT--}
// v10.0 Narrative whispers — ethereal text at top of screen
if(whisperT>0&&whisperQ){ct.save();ct.setTransform(1,0,0,1,0,0);
const wa=whisperT>150?(180-whisperT)/30:whisperT<30?whisperT/30:1;
ct.globalAlpha=wa*0.6;ct.font='italic 13px Cinzel,serif';ct.textAlign='center';
ct.fillStyle='#c8d0e8';ct.shadowColor='#4488ff';ct.shadowBlur=12;
ct.fillText(whisperQ,W/2,42);ct.shadowBlur=0;ct.restore()}
// v10.0 Impact freeze-frame radial zoom blur
if(hitSt>5){const hpx=hitFreezeX-cX,hpy=hitFreezeY-cY;const intensity=Math.min(1,hitSt/20);
ct.save();ct.setTransform(1,0,0,1,0,0);ct.globalCompositeOperation='lighter';
for(let z=1;z<=3;z++){const s=1+z*0.008*intensity;const ox=hpx*(1-s),oy=hpy*(1-s);
ct.globalAlpha=0.06*intensity*(4-z);ct.setTransform(s,0,0,s,ox,oy);ct.drawImage(gc,0,0)}
ct.setTransform(1,0,0,1,0,0);ct.globalCompositeOperation='source-over';ct.globalAlpha=1;ct.restore()}
// ═══ CRT OVERLAY ═══
drawCRT()}

/* ═══════════════════════════════════════════════════
   MINIMAP — v5 enhanced with relic visibility
   ═══════════════════════════════════════════════════ */
function drawMM(){const mw=mmc.width,mh=mmc.height;mmt.fillStyle='rgba(6,6,12,0.92)';mmt.fillRect(0,0,mw,mh);const cs=14;
const ox=mw/2-cRX*cs-cs/2,oy=mh/2-cRY*cs-cs/2;
const cols={start:bio.ac+'0.12)',normal:bio.ac+'0.06)',stairs:'rgba(255,100,170,0.25)',boss:'rgba(255,50,80,0.3)',
treasure:'rgba(255,200,60,0.2)',shop:'rgba(100,255,100,0.2)',challenge:'rgba(255,140,0,0.22)',secret:'rgba(255,255,255,0.18)',
lore:'rgba(180,200,255,0.2)',miniboss:'rgba(255,80,40,0.25)'};
for(const r of rooms){
// VOID EYE relic: see all room types
const visible=r.visited||(P.relic&&P.relic.name==='VOID EYE');
if(!visible)continue;const rx=ox+r.gx*cs,ry=oy+r.gy*cs;
// v9.0 Enhanced color-coded rooms + dimmed cleared rooms
const isCurrentRoom=r===cR;const isCleared=r.cleared;
mmt.fillStyle=isCurrentRoom?bio.ac+'0.4)':isCleared?(cols[r.type]||bio.ac+'0.03)'):(cols[r.type]||bio.ac+'0.08)');
mmt.fillRect(rx+1,ry+1,cs-2,cs-2);
if(isCleared&&!isCurrentRoom){mmt.fillStyle='rgba(0,0,0,0.3)';mmt.fillRect(rx+1,ry+1,cs-2,cs-2)}
// v6 Current room pulse
if(r===cR){const pulse=Math.sin(fr*0.06)*0.15+0.15;mmt.strokeStyle=bio.ac+pulse+')';mmt.lineWidth=1;mmt.strokeRect(rx,ry,cs,cs)}
// v6 Event room icon
if(r.event&&!r.event.used){mmt.fillStyle='rgba(255,200,100,0.4)';mmt.font='8px Silkscreen';mmt.textAlign='center';mmt.fillText('?',rx+cs/2,ry+cs/2+3)}
if(!r.cleared&&r!==cR){mmt.fillStyle='rgba(255,60,80,0.25)';mmt.fillRect(rx+cs/2-1,ry+cs/2-1,2,2)}
if(r.type==='boss'&&!r.cleared){mmt.fillStyle='rgba(255,50,80,0.4)';mmt.fillRect(rx+cs/2-2,ry+cs/2-2,4,4)}
if(r.type==='miniboss'&&!r.cleared){mmt.fillStyle='rgba(255,80,40,0.3)';mmt.fillRect(rx+cs/2-1.5,ry+cs/2-1.5,3,3)}
mmt.fillStyle=bio.ac+'0.04)';
if(r.doors.n&&(gR(r.gx,r.gy-1)?.visited||(P.relic&&P.relic.name==='VOID EYE')))mmt.fillRect(rx+cs/2-1,ry-1,2,2);
if(r.doors.s&&(gR(r.gx,r.gy+1)?.visited||(P.relic&&P.relic.name==='VOID EYE')))mmt.fillRect(rx+cs/2-1,ry+cs-1,2,2);
if(r.doors.e&&(gR(r.gx+1,r.gy)?.visited||(P.relic&&P.relic.name==='VOID EYE')))mmt.fillRect(rx+cs-1,ry+cs/2-1,2,2);
if(r.doors.w&&(gR(r.gx-1,r.gy)?.visited||(P.relic&&P.relic.name==='VOID EYE')))mmt.fillRect(rx-1,ry+cs/2-1,2,2)}
mmt.fillStyle=P.classColor;mmt.shadowColor=P.classColor;mmt.shadowBlur=5;mmt.beginPath();mmt.arc(ox+cRX*cs+cs/2,oy+cRY*cs+cs/2,3,0,Math.PI*2);mmt.fill();mmt.shadowBlur=0}

/* ═══════════════════════════════════════════════════
   GAME LOOP
   ═══════════════════════════════════════════════════ */
let lastT=performance.now();
function loop(t){const raw=(t-lastT)/16.67,dt=Math.min(raw,3);lastT=t;
if(gSt==='playing')update(dt);
else if(gSt==='dying'){// v10 Death cinematic — world frozen, soul dissolves
dyingT+=dt;
// Spawn soul particles upward in class color
if(dyingT<120&&dyingT%2<1){for(let sp=0;sp<3;sp++){const sa=Math.random()*Math.PI*2;
parts.push({x:dyingPx+(Math.random()-.5)*16,y:dyingPy+(Math.random()-.5)*16,vx:Math.cos(sa)*0.5,vy:-1.5-Math.random()*2,
life:40+Math.random()*30,ml:70,color:dyingColor,size:1.5+Math.random()*2.5,shape:'circle',grav:-0.03,blend:'lighter'})}}
// Update particles
for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx;p.y+=p.vy;if(p.grav)p.vy+=p.grav;p.vx*=.96;p.life--;if(p.life<=0)parts.splice(i,1)}
for(let i=fts.length-1;i>=0;i--){fts[i].y-=.3;fts[i].life--;if(fts[i].life<=0)fts.splice(i,1)}}
else if(gSt==='ascending'){// v10 Victory ascension cinematic
ascendT+=dt;
// Spawn ember trail behind rising player
if(ascendT%2<1){for(let ep=0;ep<2;ep++){const ea=Math.random()*Math.PI*2;
parts.push({x:W/2+(Math.random()-.5)*30,y:H*0.5+20,vx:Math.cos(ea)*1.5,vy:1+Math.random()*2,
life:30+Math.random()*20,ml:50,color:['#ffcc00','#ff8844','#ffffff','#44ff66'][ep%4],size:1.5+Math.random()*2,shape:'star',grav:0.05,blend:'lighter'})}}
// Biome color rectangles zooming past
if(ascendT%8<1){const bIdx=Math.min(4,Math.floor(ascendT/60));const bCols=['#c8a0ff','#88ccff','#ff6633','#44ff88','#4a3060'];
parts.push({x:Math.random()*W,y:-20,vx:0,vy:4+Math.random()*6,life:80,ml:80,color:bCols[4-bIdx],size:10+Math.random()*20,shape:'rect',grav:0.1})}
for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx;p.y+=p.vy;if(p.grav)p.vy+=p.grav;p.life--;if(p.life<=0)parts.splice(i,1)}
// Stats flash during ascent
if(ascendT>300){gSt='victory';slMo=1;camZoom=1;flash('#ffffff',1)}}
else if(gSt==='dead'){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx;p.y+=p.vy;p.vx*=.94;p.vy*=.94;p.life--;if(p.life<=0)parts.splice(i,1)}
for(let i=fts.length-1;i>=0;i--){fts[i].y-=.4;fts[i].life--;if(fts[i].life<=0)fts.splice(i,1)}}
else if(gSt==='victory'){// v8.0 Victory confetti rain
for(let ci=0;ci<3;ci++){const cx=Math.random()*W,cCol=['#ffcc00','#ff4488','#44ff88','#4488ff','#ff8844','#ffffff'][Math.floor(Math.random()*6)];
parts.push({x:cx,y:-5,vx:(Math.random()-.5)*1.5,vy:0.8+Math.random()*1.2,life:160+Math.random()*80,ml:240,color:cCol,size:3+Math.random()*3,shape:Math.random()>.5?'rect':'diamond',grav:0.02})}
for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx;p.y+=p.vy;if(p.grav)p.vy+=p.grav;p.vx*=.99;p.life--;if(p.life<=0)parts.splice(i,1)}}
if(chromAb>0&&gSt!=='playing')chromAb*=0.95;
if(['playing','dead','dying','ascending','victory','levelup','shop','inventory','forge','relicChoice','controls','event','paused'].includes(gSt)){
draw();
// v10 Dying cinematic overlay
if(gSt==='dying'){const dp=Math.min(1,dyingT/180);
// Desaturation + vignette
ct.fillStyle=`rgba(4,4,12,${0.3+dp*0.5})`;ct.fillRect(0,0,W,H);
// Player pulses white
if(dyingT<90){const wA=Math.sin(dyingT*0.3)*0.2+0.2;ct.fillStyle=`rgba(255,255,255,${wA})`;ct.beginPath();ct.arc(dyingPx-cX+W/2,dyingPy-cY+H/2,12,0,Math.PI*2);ct.fill()}
// Radial vignette closes in
if(dyingT>90){const vigP=Math.min(1,(dyingT-90)/90);const vigR=Math.max(20,W*(1-vigP));
const vig=ct.createRadialGradient(W/2,H/2,vigR*0.3,W/2,H/2,vigR);vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,0,0,0.8)');ct.fillStyle=vig;ct.fillRect(0,0,W,H)}
// Epitaph text
if(dyingT>60){const etA=Math.min(1,(dyingT-60)/40);ct.save();ct.globalAlpha=etA*0.7;ct.fillStyle='#c8a0ff';ct.shadowColor='#c8a0ff';ct.shadowBlur=20;
ct.font='italic 11px Cinzel';ct.textAlign='center';ct.fillText(dyingEpitaph,W/2,H*0.35);ct.shadowBlur=0;ct.restore()}}
// v10 Ascending cinematic overlay
if(gSt==='ascending'){const ap=Math.min(1,ascendT/300);
ct.fillStyle=`rgba(4,4,12,${0.6-ap*0.4})`;ct.fillRect(0,0,W,H);
// Rising player silhouette at center
const riseY=H*0.5-ascendT*0.3;ct.fillStyle='#ffffff';ct.shadowColor='#ffcc00';ct.shadowBlur=30;
ct.beginPath();ct.arc(W/2,H*0.5,8+Math.sin(ascendT*0.1)*2,0,Math.PI*2);ct.fill();ct.shadowBlur=0;
// Stats flash
const statTexts=[`FLOOR ${flr}`,`${kills} SLAIN`,`${mxCmb}x COMBO`,`${formatTime(runTime)}`];
const stIdx=Math.min(statTexts.length-1,Math.floor(ascendT/75));
if(ascendT>30){const stA=Math.min(1,(ascendT%75)/20)*0.6;ct.globalAlpha=stA;ct.fillStyle='#ffcc00';ct.font='10px Silkscreen';ct.textAlign='center';
ct.fillText(statTexts[stIdx],W/2,H*0.25);ct.globalAlpha=1}
// Bright flash at end
if(ascendT>270){const flA=(ascendT-270)/30;ct.fillStyle=`rgba(255,255,255,${flA})`;ct.fillRect(0,0,W,H)}}
drawMM()}
else{ct.fillStyle='#06060c';ct.fillRect(0,0,W,H);
if(gSt==='intro'){drawIntro();introTimer-=dt;if(introTimer<=0){introStep++;advanceIntro()}drawCRT()}
else if(gSt==='title'){drawTitle();drawCRT()}
if(gSt==='classSelect'){
const cbg=document.getElementById('class-bg');if(cbg){const cctx=cbg.getContext('2d');
cctx.fillStyle='rgba(6,6,12,0.12)';cctx.fillRect(0,0,W,H);
const cx=W/2,cy=H/2-30;
for(let ring=0;ring<3;ring++){const r=50+ring*30+Math.sin(fr*.025+ring)*10;
cctx.strokeStyle=`rgba(200,160,255,${0.02-ring*0.005})`;cctx.lineWidth=1;cctx.beginPath();
for(let a=0;a<Math.PI*2;a+=0.03){const dr=r+Math.sin(a*4+fr*.02+ring)*15;
const x=cx+Math.cos(a)*dr,y=cy+Math.sin(a)*dr*.5;
a===0?cctx.moveTo(x,y):cctx.lineTo(x,y)}cctx.closePath();cctx.stroke()}}
drawCRT()}}
fr++;requestAnimationFrame(loop)}requestAnimationFrame(loop);

/* ═══════════════════════════════════════════════════
   EVENT HANDLERS
   ═══════════════════════════════════════════════════ */
document.getElementById('start-btn').addEventListener('click',()=>{dailyMode=false;beginIntro()});
document.getElementById('retry-btn').addEventListener('click',()=>{dailyMode=false;begin()});
document.getElementById('victory-retry-btn').addEventListener('click',()=>{dailyMode=false;begin()});
document.getElementById('daily-btn').addEventListener('click',()=>{dailyMode=true;seedRng=mulberry32(getDailySeed());begin()});
document.addEventListener('keydown',e=>{
if(gSt==='intro'&&(e.code==='Space'||e.code==='Escape'||e.code==='Enter')){skipIntro();e.preventDefault();return}
if(e.code==='Enter'){if(gSt==='title'||gSt==='dead'||gSt==='victory')begin();
if(gSt==='shop'){closeShop();if(dialogueActive)closeDialogue()}
if(gSt==='forge')closeForge();
if(dialogueActive){closeDialogue();e.preventDefault();return}
if(loreActive){closeLore();e.preventDefault();return}}
if(e.code==='Escape'){
// Always close dialogue/lore first before any state changes
if(dialogueActive){closeDialogue();e.preventDefault();return}
if(loreActive){closeLore();e.preventDefault();return}
if(gSt==='event')closeEvent();
else if(gSt==='relicChoice'){gSt='playing';document.getElementById('relic-overlay').style.display='none'}
else if(gSt==='controls')toggleControls();
else if(gSt==='paused'){gSt='playing';document.getElementById('pause-overlay').style.display='none'}
else if(gSt==='playing'){gSt='paused';const ps=document.getElementById('pause-stats');
ps.innerHTML=`FLOOR ${flr} · ${bio.name}<br>${P.classIcon} ${P.className} LV${P.lvl}<br>HP: ${Math.floor(P.hp)}/${P.mhp} · DMG: ${Math.floor(P.bd+(P.w?P.w.d:0))} · SPD: ${P.spd.toFixed(1)}<br>KILLS: ${kills} · COMBO BEST: ${mxCmb}<br>GOLD: ${gold} · TIME: ${formatTime(runTime)}${P.relic?'<br>RELIC: '+P.relic.name:''}${P.perkNames.length?'<br>PERKS: '+P.perkNames.join(', '):''}`;
document.getElementById('pause-overlay').style.display='flex'}
else if(gSt==='shop')closeShop();else if(gSt==='inventory')toggleInv();else if(gSt==='forge')closeForge()}});

// Click to dismiss dialogue and lore
document.getElementById('dialogue-box').addEventListener('click',()=>{if(dialogueActive)closeDialogue()});
document.getElementById('lore-popup').addEventListener('click',()=>{if(loreActive)closeLore()});

// Show best score on title if saved
if(bestScore>0){const bs=document.getElementById('best-score');if(bs){bs.textContent=`BEST: ${bestScore}`;bs.style.display='block'}}

