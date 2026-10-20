import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {makeAdGate} from "../docs/oneplay/oneplay-bridge.mjs";
const cfg={interstitialPlacementId:null,rewardedPlacementId:null,approvedByConsole:false};
function mock(){
 let calls=0;
 return {
  sdk:{ads:{isSupported:(feature)=>feature==="interstitial",
  showInterstitialAsync:async()=>{calls++;return {status:"completed"}}}},
  calls:()=>calls
 };
}
test("before a real ONEconsole placement, no ad, no payment or simulated revenue",async()=>{
 const m=mock(),gate=makeAdGate(m.sdk,cfg,true);
 assert.equal(gate.isEnabled(),false);
 assert.deepEqual(await gate.beforeNext({completedStage:1}),{offered:false,reason:"not_ready"});
 assert.equal(m.calls(),0);
});
test("even configured placement must be console-approved and initialized",async()=>{
 const m=mock(),data={...cfg,interstitialPlacementId:"officialPlacement123"};
 assert.equal(makeAdGate(m.sdk,data,true).isEnabled(),false);
 assert.equal(makeAdGate(m.sdk,{...data,approvedByConsole:true},false).isEnabled(),false);
});
test("only eligible complete level 1-17 on deliberate next stage may show an approved interstitial",async()=>{
 const m=mock(),gate=makeAdGate(m.sdk,{interstitialPlacementId:"officialPlacement123",approvedByConsole:true},true);
 assert.equal(gate.isEnabled(),true);
 assert.equal((await gate.beforeNext({completedStage:1})).status,"completed");
 assert.equal(m.calls(),1);
 for(const n of [undefined,0,18,19,-1,1.5,"2"]){
  assert.equal((await gate.beforeNext({completedStage:n})).offered,false);
 }
 assert.equal(m.calls(),1);
});
test("errors never create a fake paid result or throw blocking a game",async()=>{
 const sdk={ads:{isSupported:()=>true,showInterstitialAsync:async()=>{throw Error("offline")}}};
 const g=makeAdGate(sdk,{interstitialPlacementId:"officialPlacement123",approvedByConsole:true},true);
 assert.deepEqual(await g.beforeNext({completedStage:2}),{offered:true,status:"failed"});
});
test("concurrent Next clicks never trigger duplicate advertising",async()=>{
 let release,calls=0;
 const hold=new Promise(r=>release=r);
 const sdk={ads:{isSupported:()=>true,showInterstitialAsync:async()=>{calls++;await hold;return {status:"completed"}}}};
 const g=makeAdGate(sdk,{interstitialPlacementId:"officialPlacement123",approvedByConsole:true},true);
 const first=g.beforeNext({completedStage:2});
 assert.deepEqual(await g.beforeNext({completedStage:2}),{offered:false,reason:"not_ready"});
 release();await first;assert.equal(calls,1);
});
test("source is restricted to legitimate official SDK with no wallet, self-buy or invented ad ID",()=>{
 const d="docs/oneplay/";
 const bootstrap=readFileSync(d+"oneplay-bootstrap.mjs","utf8");
 const main=readFileSync(d+"main.mjs","utf8");
 const config=JSON.parse(readFileSync(d+"placement-config.json","utf8"));
 const h=readFileSync(d+"index.html","utf8");
 assert.match(bootstrap,/https:\/\/h5sdk\.onestore\.net\/lib\/v1\.1\.0\/onestore-h5-sdk\.min\.js/);
 assert.match(bootstrap,/initializeAsync/);
 assert.match(bootstrap,/startGameAsync/);
 assert.match(bootstrap,/setLoadingProgress/);
 assert.match(main,/__oneplayBeforeNext/);
 assert.equal(config.approvedByConsole,false);
 assert.equal(config.interstitialPlacementId,null);
 assert.equal(config.rewardedPlacementId,null);
 assert.match(h,/oneplay-bootstrap\.mjs/);
 assert.doesNotMatch(h,/https:\/\/.*(tracker|analytics)/i);
});
