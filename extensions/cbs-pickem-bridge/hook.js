(()=>{if(window.__CBSIQ4)return;window.__CBSIQ4=true;
const MAX=3000000;
const cleanUrl=(raw)=>{try{const u=new URL(raw,location.href);for(const[k]of[...u.searchParams]) if(/token|auth|session|cookie|csrf|jwt|key|secret/i.test(k)) u.searchParams.set(k,'[REDACTED]');return u.toString()}catch{return String(raw||'')}};
const emit=p=>window.postMessage({source:'CBSIQ4',type:'capture',payload:p},'*');
const shouldKeep=u=>{try{const x=new URL(u,location.href);return x.origin==='https://picks.cbssports.com'&&/\/graphql/.test(x.pathname)}catch{return false}};
const f=window.fetch;window.fetch=async function(...a){const st=Date.now(),i=a[0],raw=typeof i==='string'?i:(i&&i.url)||'',method=(a[1]&&a[1].method)||(i&&i.method)||'GET';const r=await f.apply(this,a);if(shouldKeep(raw)){try{const t=(await r.clone().text()).slice(0,MAX);emit({transport:'fetch',ts:new Date().toISOString(),durationMs:Date.now()-st,method,url:cleanUrl(raw),status:r.status,contentType:r.headers.get('content-type')||'',body:t})}catch{}}return r};
window.postMessage({source:'CBSIQ4',type:'ready',payload:{ts:new Date().toISOString(),href:location.href}},'*');})();