import fs from 'node:fs';

const semantic = {
  0:'nexus',1:'orbit',2:'survey',3:'expense',4:'forge',5:'beacon',6:'cipher',7:'pulse',8:'vector',9:'signal',10:'kernel',11:'atlas',12:'prism',13:'vertex',14:'quartz',15:'ember',16:'harbor',17:'relay',18:'summit',19:'canvas',
  20:'video',21:'meet',22:'repo',23:'music',24:'paper',25:'wiki',26:'chat',27:'model',28:'package',29:'python',30:'puzzle',31:'forum',32:'post',33:'career',34:'design',35:'notes',36:'shop',37:'kart',38:'voice',39:'call',40:'doc',
  120:'global',121:'build',122:'india',123:'union',124:'input',125:'campus',126:'brain',127:'network',128:'deploy',129:'pages',130:'trade',131:'academy',2047:'raw',
  2048:'portal',2049:'matrix',2050:'query',2051:'ledger',2052:'code',2053:'signalbox',2054:'keypad',2055:'waveform',2056:'vectorize',2057:'beaconed',2058:'system',2059:'maproom',2060:'spectrum',2061:'vertices',2062:'crystal',2063:'cinder',2064:'haven',2065:'carrier',2066:'pinnacle',2067:'gallery',
  2068:'stream',2069:'room',2070:'branch',2071:'album',2072:'preprint',2073:'article',2074:'prompt',2075:'weights',2076:'module',2077:'script',2078:'solve',2079:'thread',2080:'tweet',2081:'profile',2082:'artboard',2083:'page',2084:'item',2085:'order',2086:'server',2087:'zoom',2088:'drive',
  2168:'globe',2169:'craft',2170:'bharat',2171:'group',2172:'output',2173:'school',2174:'neural',2175:'mesh',2176:'preview',2177:'static',2178:'market',2179:'college',4095:'custom'
};

const bip = fs.readFileSync('/tmp/nexus-bip39.txt','utf8').trim().split(/\s+/);
const eff = fs.readFileSync('/tmp/nexus-eff.txt','utf8').trim().split('\n').map(x=>x.trim().split(/\s+/).pop());
const used = new Set(Object.values(semantic));
const pool = [...bip,...eff]
  .map(w=>w.toLowerCase().replace(/[^a-z]/g,''))
  .filter(w=>w.length>=3 && w.length<=10 && !used.has(w))
  .filter((w,i,a)=>a.indexOf(w)===i);
const dictionary = Array(4096);
for (const [i,w] of Object.entries(semantic)) dictionary[+i]=w;
let p=0;
for(let i=0;i<dictionary.length;i++) if(!dictionary[i]) { while(used.has(pool[p])) p++; dictionary[i]=pool[p++]; used.add(dictionary[i]); }
if(new Set(dictionary).size!==4096) throw new Error('dictionary must be unique');

const entries = Array(2048).fill(null);
const put = (id, data) => entries[id]={id,...data};
put(0,{type:'exact_domain',domain:'siv19.dev',label:'Siv19',alphabet:'SLUG_LOWER'});
put(1,{type:'subdomain',domain:'siv19.dev',label:'Siv19 subdomain',alphabet:'DOMAIN'});
put(2,{type:'exact_domain',domain:'aayvu.io',label:'Aayvu',alphabet:'SLUG_LOWER'});
put(3,{type:'exact_domain',domain:'splitllm.com',label:'SplitLLM',alphabet:'SLUG_LOWER'});
put(4,{type:'platform',prefix:'github.com/sivab193/',label:'Sivab193 GitHub',alphabet:'SLUG_LOWER'});
put(5,{type:'exact_domain',domain:'linkedin.com/in/sivab193',label:'Sivaganesh on LinkedIn',alphabet:'SLUG_LOWER'});
for(let i=6;i<20;i++) put(i,{type:'reserved',label:`Reserved personal ${i}`});
const platforms = [
 [20,'YouTube','youtu.be/','BASE64_URL'],[21,'Google Meet','meet.google.com/','ALPHA_LOWER'],[22,'GitHub','github.com/','SLUG_LOWER'],[23,'Spotify','open.spotify.com/track/','BASE64_URL'],[24,'arXiv','arxiv.org/abs/','NUMERIC'],[25,'Wikipedia','en.wikipedia.org/wiki/','FULL_URL'],[26,'ChatGPT Share','chatgpt.com/share/','FULL_URL'],[27,'Hugging Face','huggingface.co/','SLUG_LOWER'],[28,'npm','npmjs.com/package/','SLUG_LOWER'],[29,'PyPI','pypi.org/project/','SLUG_LOWER'],[30,'LeetCode','leetcode.com/problems/','SLUG_LOWER'],[31,'Reddit','reddit.com/r/','SLUG_LOWER'],[32,'X','x.com/','SLUG_LOWER'],[33,'LinkedIn','linkedin.com/in/','SLUG_LOWER'],[34,'Figma','figma.com/file/','BASE64_URL'],[35,'Notion','notion.so/','FULL_URL'],[36,'Amazon US','amazon.com/dp/','BASE36'],[37,'Amazon India','amazon.in/dp/','BASE36'],[38,'Discord','discord.gg/','BASE64_URL'],[39,'Zoom','zoom.us/j/','DIGITS'],[40,'Google Docs','docs.google.com/document/d/','BASE64_URL']
 ];
for(const [id,label,prefix,alphabet] of platforms) put(id,{type:'platform',prefix,label,alphabet});
for(let i=41;i<120;i++) if(!entries[i]) put(i,{type:'reserved',label:`Reserved platform ${i}`});
const suffixes = [[120,'com','Commercial'],[121,'dev','Developer'],[122,'in','India'],[123,'org','Organization'],[124,'io','Input/output'],[125,'edu','Education'],[126,'ai','Artificial intelligence'],[127,'net','Network'],[128,'vercel.app','Vercel'],[129,'github.io','GitHub Pages'],[130,'co.in','India company'],[131,'ac.in','India academic'],[132,'app','Application'],[133,'co','Company'],[134,'me','Personal'],[135,'gov','Government'],[136,'uk','United Kingdom'],[137,'de','Germany'],[138,'jp','Japan'],[139,'ca','Canada'],[140,'us','United States'],[141,'au','Australia'],[142,'fr','France'],[143,'xyz','XYZ'],[144,'tech','Technology'],[145,'site','Site'],[146,'cloud','Cloud'],[147,'info','Information'],[148,'tv','Television'],[149,'gg','Gaming']];
for(const [id,suffix,label] of suffixes) put(id,{type:'suffix',suffix,label,alphabet:'DOMAIN'});
const knownSuffixes=new Set(suffixes.map(([,suffix])=>suffix));
const iana=fs.readFileSync('/tmp/nexus-iana-tlds.txt','utf8').split('\n').filter(x=>x&&!x.startsWith('#')).map(x=>x.toLowerCase()).filter(x=>!knownSuffixes.has(x));
let tldSlot=150;
for(const suffix of iana){if(tldSlot>1700)break;put(tldSlot++,{type:'suffix',suffix,label:`.${suffix} domain`,alphabet:'DOMAIN'})}
for(let i=150;i<=1700;i++) if(!entries[i]) put(i,{type:'reserved',label:`Available registry slot ${i}`});
for(let i=1701;i<2047;i++) put(i,{type:'reserved',label:`Reserved expansion ${i}`});
put(2047,{type:'raw',label:'Universal fallback',alphabet:'FULL_URL'});
fs.writeFileSync('dictionary.json',JSON.stringify(dictionary));
fs.writeFileSync('registry.json',JSON.stringify({version:3,immutable:true,entries},null,2)+'\n');
