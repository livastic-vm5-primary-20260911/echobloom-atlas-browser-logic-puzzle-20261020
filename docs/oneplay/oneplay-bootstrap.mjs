// Isolated ONEplay Web-SDK integration; original GitHub Pages game stays
// untouched, independently playable, and free. No live ad ID is invented.
import {makeAdGate} from "./oneplay-bridge.mjs";
const SDK="https://h5sdk.onestore.net/lib/v1.1.0/onestore-h5-sdk.min.js";
const mark=(s)=>document.documentElement.dataset.oneplayLifecycle=s;
let sdk=null,ready=false,config={};
if(window.parent!==window){
 try{
  const mod=await Promise.race([
   import(SDK),
   new Promise((_,reject)=>setTimeout(()=>reject(new Error("official_sdk_timeout")),4500))
  ]);
  if(typeof mod.createSDK!=="function")throw new Error("SDK module missing createSDK");
  sdk=mod.createSDK();
  sdk.on("pause",()=>mark("paused"));
  sdk.on("resume",()=>mark("running"));
  sdk.on("exit",()=>mark("exited"));
  const info=await Promise.race([
   sdk.initializeAsync(),
   new Promise((_,reject)=>setTimeout(()=>reject(new Error("platform_init_timeout")),4500))
  ]);
  if(info?.err)throw new Error("platform_declined_initialization");
  sdk.setLoadingProgress(60);
  ready=true;
  mark("initialized");
  const r=await fetch("./placement-config.json",{cache:"no-store",redirect:"error"});
  if(r.ok)config=await r.json();
 }catch(error){
  console.info("ONEplay SDK unavailable; preserving normal free puzzle",error?.message||"unavailable");
  ready=false;sdk=null;
 }
}
const gate=makeAdGate(sdk,config,ready);
window.__oneplayBeforeNext=(stage)=>gate.beforeNext(stage);
await import("./main.mjs");
if(ready){
 try{
  sdk.setLoadingProgress(100);
  await sdk.startGameAsync();
  mark("running");
 }catch(error){
  mark("standalone");
  console.info("ONEplay start not acknowledged; standalone puzzle available",error?.message||"unavailable");
 }
}else mark("standalone");
