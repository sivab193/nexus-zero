export const ALPHABETS = {
  DIGITS:'0123456789', NUMERIC:'0123456789.v', ALPHA_LOWER:'abcdefghijklmnopqrstuvwxyz',
  DOMAIN:'abcdefghijklmnopqrstuvwxyz0123456789-.', SLUG_LOWER:'abcdefghijklmnopqrstuvwxyz0123456789-_/.?=',
  BASE36:'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', BASE64_URL:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  FULL_URL:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~/:#?=&%+'
};

let dictionary=[], registry={entries:[]}, wordIndex=new Map();
export async function loadCodec(){
  [dictionary,registry]=await Promise.all([fetch('./dictionary.json').then(r=>r.json()),fetch('./registry.json').then(r=>r.json())]);
  wordIndex=new Map(dictionary.map((w,i)=>[w,i]));
  return {dictionary,registry};
}
export const data=()=>({dictionary,registry});

function cleanUrl(input){
  let raw=input.trim(); if(!/^https?:\/\//i.test(raw)) raw='https://'+raw;
  const u=new URL(raw); u.hostname=u.hostname.toLowerCase().replace(/^www\./,'');
  [...u.searchParams.keys()].forEach(k=>{if(/^utm_/i.test(k)||['fbclid','gclid','si'].includes(k.toLowerCase()))u.searchParams.delete(k)});
  if((u.hostname==='youtube.com'||u.hostname==='m.youtube.com')&&u.pathname==='/watch'&&u.searchParams.get('v')){
    const id=u.searchParams.get('v'); u.hostname='youtu.be';u.pathname='/'+id;u.search='';
  }
  let out=u.hostname+u.pathname+(u.searchParams.size?'?'+u.searchParams.toString():'')+u.hash;
  return out.endsWith('/')&&u.pathname==='/'&&!u.search&&!u.hash?out.slice(0,-1):out;
}
function selectAlphabet(payload, preferred){
  if(preferred&&[...payload].every(c=>ALPHABETS[preferred]?.includes(c))) return preferred;
  if([...payload].every(c=>ALPHABETS.SLUG_LOWER.includes(c))) return 'SLUG_LOWER';
  return 'FULL_URL';
}
function pack(text, alphabet){let v=1n,b=BigInt(alphabet.length);for(const c of text){const i=alphabet.indexOf(c);if(i<0)throw Error(`Unsupported character “${c}”`);v=v*b+BigInt(i)}return v}
function unpack(v,alphabet){let chars=[],b=BigInt(alphabet.length);while(v>1n){chars.push(alphabet[Number(v%b)]);v/=b}if(v!==1n)throw Error('Coordinate has no valid sentinel');return chars.reverse().join('')}
function toWords(v){const out=[];while(v>0n){out.push(dictionary[Number(v%4096n)]);v/=4096n}return out}
function fromWords(words){let v=0n,m=1n;for(const w of words){const i=wordIndex.get(w);if(i===undefined)throw Error(`“${w}” is not in the Nexus dictionary`);v+=BigInt(i)*m;m*=4096n}return v}

export function encode(input){
  const canonical=cleanUrl(input); let slot=registry.entries[2047],payload=canonical,hasPath=false,alphabetName='FULL_URL';
  const exact=[0,2,3,5].map(i=>registry.entries[i]);
  for(const s of exact){if(canonical===s.domain||canonical===s.domain+'/')return {coordinate:dictionary[s.id],words:[dictionary[s.id]],canonical:s.domain,url:'https://'+s.domain,slot:s};if(canonical.startsWith(s.domain+'/')){slot=s;payload=canonical.slice(s.domain.length+1);hasPath=true;break}}
  if(slot.id===2047&&canonical.endsWith('.siv19.dev')){slot=registry.entries[1];payload=canonical.slice(0,-'.siv19.dev'.length)}
  if(slot.id===2047){for(let id=4;id<=40;id++){const s=registry.entries[id];if(s?.prefix&&canonical.startsWith(s.prefix)){slot=s;payload=canonical.slice(s.prefix.length);if(id===21)payload=payload.replaceAll('-','');break}}}
  if(slot.id===2047){const slash=canonical.indexOf('/'),host=slash<0?canonical:canonical.slice(0,slash),path=slash<0?'':canonical.slice(slash+1);const matches=registry.entries.filter(s=>s?.type==='suffix'&&(host===s.suffix||host.endsWith('.'+s.suffix))).sort((a,b)=>b.suffix.length-a.suffix.length);if(matches.length){slot=matches[0];const root=host.slice(0,-slot.suffix.length).replace(/\.$/,'');payload=path?root+'/'+path:root;hasPath=!!path}}
  if(slot.type==='raw') hasPath=true;
  alphabetName=selectAlphabet(payload,slot.alphabet);
  if(slot.type==='platform'&&alphabetName!==slot.alphabet){slot=registry.entries[2047];payload=canonical;hasPath=true;alphabetName='FULL_URL'}
  let v=pack(payload,ALPHABETS[alphabetName]);
  const genericPath=hasPath&&(slot.type==='suffix'||slot.type==='exact_domain'||slot.type==='subdomain');
  if(genericPath){const flag=alphabetName==='FULL_URL'?1n:0n;v=v*2n+flag}
  const first=slot.id+(hasPath?2048:0);const words=[dictionary[first],...toWords(v)];
  return {coordinate:words.join('.'),words,canonical,url:'https://'+canonical,slot,alphabet:alphabetName};
}

export function decode(input){
  const words=input.toLowerCase().trim().split(/[.\s-]+/).filter(Boolean);if(!words.length)throw Error('Enter at least one dictionary word');
  const first=wordIndex.get(words[0]);if(first===undefined)throw Error(`“${words[0]}” is not in the Nexus dictionary`);
  const hasPath=first>=2048,slotId=hasPath?first-2048:first,slot=registry.entries[slotId];if(!slot)throw Error('This registry slot is not assigned');
  if(slot.type==='reserved')return {reserved:true,coordinate:words.join('.'),slot};
  if(words.length===1&&slot.type==='exact_domain'&&!hasPath)return {coordinate:words[0],url:'https://'+slot.domain,canonical:slot.domain,slot};
  if(words.length===1)throw Error('This registry word needs payload words');
  let v=fromWords(words.slice(1)),alphabetName=slot.alphabet||'FULL_URL';
  if(hasPath&&(slot.type==='suffix'||slot.type==='exact_domain'||slot.type==='subdomain')){const flag=v%2n;v/=2n;alphabetName=flag?'FULL_URL':'SLUG_LOWER'}
  let payload=unpack(v,ALPHABETS[alphabetName]),canonical='';
  if(slot.type==='exact_domain')canonical=slot.domain+(hasPath?'/'+payload:'');
  else if(slot.type==='subdomain'){const cut=payload.indexOf('/');canonical=(cut<0?payload:payload.slice(0,cut))+'.'+slot.domain+(cut<0?'':payload.slice(cut))}
  else if(slot.type==='platform'){if(slot.id===21&&payload.length===10)payload=`${payload.slice(0,3)}-${payload.slice(3,7)}-${payload.slice(7)}`;canonical=slot.prefix+payload}
  else if(slot.type==='suffix'){const cut=payload.indexOf('/');canonical=(cut<0?payload:payload.slice(0,cut))+'.'+slot.suffix+(cut<0?'':payload.slice(cut))}
  else canonical=payload;
  return {coordinate:words.join('.'),url:'https://'+canonical,canonical,slot,alphabet:alphabetName};
}
