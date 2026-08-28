
(()=>{if(window.__CBSIQ3)return;window.__CBSIQ3=true;
const MAX=3000000;
const cleanUrl=(raw)=>{try{
 const u=new URL(raw,location.href);
 for(const[k]of[...u.searchParams]) if(/token|auth|session|cookie|csrf|jwt|key|secret/i.test(k)) u.searchParams.set(k,"[REDACTED]");
 return u.toString()
}catch{return String(raw||"")}};

const emit=p=>window.postMessage({source:"CBSIQ3",type:"capture",payload:p},"*");
const shouldKeep=u=>{try{return new URL(u,location.href).origin==="https://picks.cbssports.com" && /\/graphql/.test(new URL(u,location.href).pathname)}catch{return false}};

const f=window.fetch;
window.fetch=async function(...a){
 const st=Date.now(),i=a[0],raw=typeof i==="string"?i:(i&&i.url)||"",
       method=(a[1]&&a[1].method)||(i&&i.method)||"GET";
 const r=await f.apply(this,a);
 if(shouldKeep(raw)){
   try{
     const t=(await r.clone().text()).slice(0,MAX);
     emit({transport:"fetch",ts:new Date().toISOString(),durationMs:Date.now()-st,
       method,url:cleanUrl(raw),status:r.status,contentType:r.headers.get("content-type")||"",body:t});
   }catch{}
 }
 return r
};

const X=window.XMLHttpRequest,o=X.prototype.open,s=X.prototype.send;
X.prototype.open=function(m,u,...r){this.__iq={m,u,st:Date.now()};return o.call(this,m,u,...r)};
X.prototype.send=function(...a){
 this.addEventListener("load",function(){
   try{
    const q=this.__iq||{};
    if(!shouldKeep(q.u||""))return;
    let t="";
    if(!this.responseType||this.responseType==="text")t=String(this.responseText||"").slice(0,MAX);
    else if(this.responseType==="json")t=JSON.stringify(this.response||{}).slice(0,MAX);
    emit({transport:"xhr",ts:new Date().toISOString(),durationMs:Date.now()-(q.st||Date.now()),
      method:q.m||"GET",url:cleanUrl(q.u||""),status:this.status,
      contentType:this.getResponseHeader("content-type")||"",body:t});
   }catch{}
 });
 return s.apply(this,a)
};

window.postMessage({source:"CBSIQ3",type:"ready",payload:{ts:new Date().toISOString(),href:location.href}},"*");
})();
