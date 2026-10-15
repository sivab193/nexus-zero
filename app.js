import {loadCodec,encode,decode,data} from './codec.js?v=20261015-1';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let mode='anchor',selectedRealm='';
await loadCodec();
const {dictionary,registry}=data();
const assigned=registry.entries.map((entry,id)=>({entry,id,word:dictionary[id]})).filter(({entry,id})=>entry&&entry.type!=='reserved'&&id<1701);
$('#signals').innerHTML=Array.from({length:12},()=>'<i></i>').join('');
const coordinateUrl=document.createElement('a');
coordinateUrl.id='coordinate-url';coordinateUrl.className='coordinate-url hidden';coordinateUrl.target='_blank';coordinateUrl.rel='noopener';
$('#result-detail').insertAdjacentElement('afterend',coordinateUrl);
const copyUrl=document.createElement('button');
copyUrl.type='button';copyUrl.id='copy-url';copyUrl.className='minor hidden';copyUrl.textContent='Copy Nexus URL';
$('#copy').textContent='Copy words';$('#copy').insertAdjacentElement('afterend',copyUrl);

function drawRealms(term=''){
  const query=term.trim().toLowerCase();
  const options=[{id:'',word:'Any assigned realm',entry:{label:'Random assigned destination'}},...assigned]
    .filter(({id,word,entry})=>!query||`${id} ${word} ${entry.label||''} ${entry.suffix||entry.domain||entry.prefix||''}`.toLowerCase().includes(query));
  $('#realm-options').innerHTML=options.map(({id,word,entry})=>`<button type="button" role="option" aria-selected="${String(id)===String(selectedRealm)}" data-realm="${id}"><b>${word}</b><span>${entry.label||entry.type}</span></button>`).join('');
}
drawRealms();
$('#realm-search').addEventListener('input',e=>drawRealms(e.target.value));
$('#realm-options').addEventListener('click',e=>{const button=e.target.closest('[data-realm]');if(!button)return;selectedRealm=button.dataset.realm;$('#realm-label').textContent=button.querySelector('b').textContent;$('#realm-picker').removeAttribute('open');$('#realm-search').value='';drawRealms()});

function setMode(next){
  mode=next;$$('.tab').forEach(b=>{const on=b.dataset.mode===mode;b.classList.toggle('active',on);b.setAttribute('aria-selected',on)});
  $('#input-label').textContent=mode==='anchor'?'Destination URL':'Word coordinate';$('#entry').placeholder=mode==='anchor'?'youtube.com/watch?v=dQw4w9WgXcQ':'video.canyon.river.signal';
  $('#submit').textContent=mode==='anchor'?'Anchor':'Dial';$('#route-in').textContent=mode==='anchor'?'URL':'Words';$('#route-out').textContent=mode==='anchor'?'Words':'URL';
  $('#result').classList.remove('show');$('#dice').classList.toggle('hidden',mode!=='dial');
}
$$('.tab').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));

function show(value){
  const reserved=Boolean(value.reserved),r=$('#result'),out=$('#output'),launch=$('#launch');r.classList.add('show');out.className=reserved?'notice':'';
  const publicCoordinate=value.coordinate?`${location.origin}/${value.coordinate}`:'';
  out.textContent=reserved?'Reserved registry slot':mode==='anchor'?value.coordinate:value.url;
  $('#result-label').textContent=reserved?'Route terminated':mode==='anchor'?`${value.slot.label} · ${value.words.length} word${value.words.length===1?'':'s'}`:`${value.slot.label} · destination preview`;
  $('#result-detail').textContent=reserved?'Choose an assigned realm or roll again.':mode==='anchor'?`Destination: ${value.url}`:`Coordinate: ${value.coordinate}`;
  coordinateUrl.classList.toggle('hidden',reserved||mode!=='anchor');copyUrl.classList.toggle('hidden',reserved||mode!=='anchor');
  coordinateUrl.textContent=publicCoordinate;coordinateUrl.href=publicCoordinate;
  $('#copy').textContent=mode==='anchor'?'Copy words':'Copy URL';
  launch.classList.toggle('hidden',reserved);
  if(!reserved){if(mode==='anchor'){launch.textContent='Test coordinate ↗';launch.href=publicCoordinate}else{launch.textContent='Open destination ↗';launch.href=value.url}}
  $('#route').classList.remove('active');void $('#route').offsetWidth;$('#route').classList.add('active');
  $$('#signals i').forEach((n,i)=>n.classList.toggle('on',i<Math.min(12,(value.coordinate?.split('.').length||1)*2)));
}
$('#form').addEventListener('submit',e=>{e.preventDefault();try{show(mode==='anchor'?encode($('#entry').value):decode($('#entry').value))}catch(err){$('#result').classList.add('show');$('#result-label').textContent='Route fault';$('#output').textContent=err.message;$('#output').className='notice';$('#result-detail').textContent='Check the input and try again.';$('#launch').classList.add('hidden');coordinateUrl.classList.add('hidden');copyUrl.classList.add('hidden')}});
$('#copy').addEventListener('click',async()=>{await navigator.clipboard.writeText($('#output').textContent);$('#copy').textContent='Copied';setTimeout(()=>$('#copy').textContent=mode==='anchor'?'Copy words':'Copy URL',1200)});
copyUrl.addEventListener('click',async()=>{await navigator.clipboard.writeText(coordinateUrl.href);copyUrl.textContent='Copied URL';setTimeout(()=>copyUrl.textContent='Copy Nexus URL',1200)});
const randomInt=max=>crypto.getRandomValues(new Uint32Array(1))[0]%max;
const randomWord=()=>dictionary[randomInt(dictionary.length)].replace(/[^a-z0-9]/g,'')||'zero';
const randomChars=(alphabet,length)=>Array.from({length},()=>alphabet[randomInt(alphabet.length)]).join('');
function randomUrl(entry){
  const slug=`${randomWord()}-${randomWord()}-${randomInt(10000)}`;
  if(entry.type==='exact_domain')return `https://${entry.domain}/${slug}`;
  if(entry.type==='subdomain')return `https://${randomWord()}-${randomInt(1000)}.${entry.domain}/${randomWord()}`;
  if(entry.type==='suffix')return `https://${slug}.${entry.suffix}/${randomWord()}`;
  const payload=entry.id===21?randomChars('abcdefghijklmnopqrstuvwxyz',10)
    :entry.alphabet==='NUMERIC'?randomChars('0123456789',8)
    :entry.alphabet==='BASE64_URL'?randomChars('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',11)
    :entry.alphabet==='FULL_URL'?`${slug}/${randomWord()}`:slug;
  return `https://${entry.prefix}${payload}`;
}
$('#roll').addEventListener('click',()=>{
  const chosen=selectedRealm===''?assigned[randomInt(assigned.length)]:assigned.find(x=>String(x.id)===selectedRealm);if(!chosen)return;
  const value=encode(randomUrl(chosen.entry));$('#entry').value=value.coordinate;show(value);
});
$('#theme').addEventListener('click',()=>{const light=document.documentElement.dataset.theme==='light';document.documentElement.dataset.theme=light?'dark':'light';localStorage.setItem('nz-theme',light?'dark':'light')});
document.documentElement.dataset.theme=localStorage.getItem('nz-theme')||'dark';
const queryDial=new URLSearchParams(location.search).get('dial'),route=location.pathname.split('/').pop();if(queryDial||(route&&!route.includes('.')&&route!=='')){setMode('dial');$('#entry').value=queryDial||route.replaceAll('/','.');$('#form').requestSubmit()}
