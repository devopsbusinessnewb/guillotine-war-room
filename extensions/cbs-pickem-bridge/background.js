
const DEFAULT={captures:[],snapshots:[],meta:{hookReady:null,scan:{state:"idle",step:""}}};

async function state(){return await chrome.storage.local.get(DEFAULT)}
async function setScan(stateName,step=""){const s=await state();await chrome.storage.local.set({meta:{...s.meta,scan:{state:stateName,step}}})}
const delay=ms=>new Promise(r=>setTimeout(r,ms));

function parseOperation(url){
 try{
   const u=new URL(url);
   const op=u.searchParams.get("operationName")||"";
   const variables=u.searchParams.get("variables")||"";
   return {operationName:op,variables}
 }catch{return {operationName:"",variables:""}}
}
async function waitComplete(tabId,timeout=15000){
 return new Promise(resolve=>{
   let done=false;
   const timer=setTimeout(()=>{if(!done){done=true;chrome.tabs.onUpdated.removeListener(fn);resolve()}},timeout);
   const fn=(id,info)=>{if(id===tabId&&info.status==="complete"&&!done){done=true;clearTimeout(timer);chrome.tabs.onUpdated.removeListener(fn);resolve()}};
   chrome.tabs.onUpdated.addListener(fn)
 })
}
async function snapshotTab(tabId){try{await chrome.tabs.sendMessage(tabId,{type:"SNAPSHOT"})}catch{}}

async function runScan(tab){
 const match=String(tab.url||"").match(/^https:\/\/picks\.cbssports\.com\/football\/pickem\/pools\/([^/]+)/);
 if(!match) throw new Error("Open your CBS Pick'em pool first.");
 const poolId=match[1], base=`https://picks.cbssports.com/football/pickem/pools/${poolId}`;
 await chrome.storage.local.set({captures:[],snapshots:[],meta:{hookReady:null,scan:{state:"running",step:"Opening Picks"}}});

 await chrome.tabs.update(tab.id,{url:base});
 await waitComplete(tab.id); await delay(3500); await snapshotTab(tab.id);

 await setScan("running","Opening Weekly Standings");
 await chrome.tabs.update(tab.id,{url:`${base}/standings/weekly`});
 await waitComplete(tab.id); await delay(3500); await snapshotTab(tab.id);

 await setScan("done","Scan complete");
}

chrome.runtime.onMessage.addListener((m,s,r)=>{
 (async()=>{
   const x=await state();

   if(m?.type==="ADD_CAPTURE"){
     const parsed=parseOperation(m.payload.url);
     const rec={...m.payload,...parsed};
     const key=rec.operationName+"|"+rec.variables+"|"+rec.body;
     const existing=x.captures.filter(c=>(c.operationName+"|"+c.variables+"|"+c.body)!==key);
     await chrome.storage.local.set({captures:[...existing,rec].slice(-100)});
     r({ok:true});
   }
   else if(m?.type==="ADD_SNAPSHOT"){
     await chrome.storage.local.set({snapshots:[...x.snapshots,m.payload].slice(-10)});r({ok:true});
   }
   else if(m?.type==="HOOK_READY"){
     await chrome.storage.local.set({meta:{...x.meta,hookReady:m.payload}});r({ok:true});
   }
   else if(m?.type==="GET_STATE"){r(x)}
   else if(m?.type==="CLEAR"){
     await chrome.storage.local.set(DEFAULT);r({ok:true})
   }
   else if(m?.type==="RUN_SCAN"){
     const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
     r({ok:true,started:true});
     try{await runScan(tab)}catch(e){await setScan("error",e.message)}
   }
   else if(m?.type==="EXPORT"){
     const latest=await state();
     const summary=latest.captures.map(c=>({
       operationName:c.operationName,variables:c.variables,status:c.status,
       ts:c.ts,bodyBytes:(c.body||"").length
     }));
     const out={
       product:"CBS Pick'em IQ Bridge",version:"0.3.0",exportedAt:new Date().toISOString(),
       privacy:"No passwords, cookies, request headers, Authorization headers, or CSRF headers are intentionally captured.",
       graphqlSummary:summary,captures:latest.captures,snapshots:latest.snapshots
     };
     const u="data:application/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(out,null,2));
     const fn=`cbs-pickem-iq-clean-${new Date().toISOString().replace(/[:.]/g,"-")}.json`;
     await chrome.downloads.download({url:u,filename:fn,saveAs:true});r({ok:true,filename:fn})
   }
 })(); return true
});
