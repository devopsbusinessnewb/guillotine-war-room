
const $=id=>document.getElementById(id),status=$("status"),cc=$("captureCount"),sc=$("snapshotCount");
async function refresh(){
 try{
   const x=await chrome.runtime.sendMessage({type:"GET_STATE"});
   cc.textContent=x.captures?.length||0;sc.textContent=x.snapshots?.length||0;
   const scan=x.meta?.scan||{};
   if(scan.state==="running")status.textContent="SCANNING — "+(scan.step||"working…");
   else if(scan.state==="done")status.textContent="SCAN COMPLETE — export the clean CBS data.";
   else if(scan.state==="error")status.textContent="SCAN ERROR — "+scan.step;
   else status.textContent=x.meta?.hookReady?"CONNECTED — ready to scan CBS.":"Refresh your CBS Pick'em tab once.";
 }catch(e){status.textContent="Bridge error: "+e.message}
}
$("scanBtn").onclick=async()=>{
 const [t]=await chrome.tabs.query({active:true,currentWindow:true});
 if(!t?.url?.startsWith("https://picks.cbssports.com/football/pickem/pools/")){status.textContent="Open your CBS Pick'em pool first.";return}
 await chrome.runtime.sendMessage({type:"RUN_SCAN"});status.textContent="SCANNING — you can leave this popup alone.";
};
$("exportBtn").onclick=async()=>{
 const r=await chrome.runtime.sendMessage({type:"EXPORT"});
 status.textContent=r?.ok?"Export created — upload that JSON here.":"Export failed."
};
$("clearBtn").onclick=async()=>{await chrome.runtime.sendMessage({type:"CLEAR"});refresh()};
refresh();setInterval(refresh,1000);
