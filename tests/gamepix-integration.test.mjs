import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createGamePixBridge,GAMEPIX_SDK_SRC} from "../docs/gamepix/gamepix-bridge.mjs";
const makeMock=()=>{
 const calls=[];
 return {platform:{
  loaded(){calls.push(["loaded"])},
  updateScore(n){calls.push(["updateScore",n])},
  updateLevel(n){calls.push(["updateLevel",n])},
  happyMoment(){calls.push(["happyMoment"])},
  interstitialAd(){calls.push(["interstitialAd"]);return Promise.resolve({success:true})}
 },calls};
};
test("Standalone public demo, not approved publisher iframe, never calls or displays ads",async()=>{
 const x=makeMock(),b=createGamePixBridge(x.platform,{embedded:false});
 assert.equal(b.initialize(),false);assert.equal(b.available,false);
 b.onLevel(1);b.onVictory({completedStage:1,moves:3});
 assert.equal((await b.beforeNext({completedStage:1})).offered,false);
 assert.deepEqual(x.calls,[]);
});
test("Even a syntactically valid publisher embed stays advertising-disabled without official approval",async()=>{
 const x=makeMock(),bridge=createGamePixBridge(x.platform,{embedded:true,approved:false});
 assert.equal(bridge.initialize(),false);
 assert.equal((await bridge.beforeNext({completedStage:1})).offered,false);
 assert.deepEqual(x.calls,[]);
});
test("No SDK object or unrelated script cannot offer ads",async()=>{
 const b=createGamePixBridge(undefined,{embedded:true});
 assert.equal(b.initialize(),false);assert.equal(b.available,false);
 assert.equal((await b.beforeNext({completedStage:10})).offered,false);
});
test("Official SDK loaded once, emits only numeric stage and score, not fake revenue",async()=>{
 const x=makeMock(),b=createGamePixBridge(x.platform,{embedded:true,approved:true});
 assert.equal(b.initialize(),true);assert.equal(b.initialize(),false);
 b.onLevel(1);b.onLevel(18);b.onLevel(0);b.onLevel("7");
 b.onVictory({completedStage:1,moves:7});
 b.onVictory({completedStage:18,moves:9});
 b.onVictory({completedStage:19,moves:2});
 assert.deepEqual(x.calls,[
  ["loaded"],["updateLevel",1],["updateLevel",18],
  ["updateScore",93],["happyMoment"],["updateScore",1791],["happyMoment"]
 ]);
 assert.equal(b.realRevenueConfirmed,false);
});
test("Interstitial requires original player victory and Next click 1-17, never game load or replay",async()=>{
 const x=makeMock(),b=createGamePixBridge(x.platform,{embedded:true,approved:true});
 b.initialize();
 assert.equal(b.adOffers,0);
 for(const n of [0,18,19,null,1.4,"3",undefined,-1]){
  assert.equal((await b.beforeNext({completedStage:n})).offered,false);
 }
 assert.equal(b.adOffers,0);
 const r=await b.beforeNext({completedStage:1});
 assert.deepEqual(r,{offered:true,success:true});
 assert.equal(b.adOffers,1);
 assert.equal(globalThis.__gamepixAdPaused,false);
 assert.equal(x.calls.filter(x=>x[0]==="interstitialAd").length,1);
 assert.equal(b.realRevenueConfirmed,false);
});
test("Overlapping Next clicks do not cause double ads or hang",async()=>{
 let resolveAd,calls=0;
 const hold=new Promise(resolve=>resolveAd=resolve);
 const b=createGamePixBridge({
  loaded(){},interstitialAd(){calls++;return hold}
 },{embedded:true,approved:true});
 b.initialize();
 const a=b.beforeNext({completedStage:5});
 const d=await b.beforeNext({completedStage:5});
 assert.deepEqual(d,{offered:false,reason:"not_publisher_ready"});
 resolveAd({success:false});
 assert.deepEqual(await a,{offered:true,success:false});
 assert.equal(calls,1);
 assert.equal(globalThis.__gamepixAdPaused,false);
});
test("Third-party sdk errors fail open to normal free puzzle; never fabricate payment",async()=>{
 const b=createGamePixBridge({loaded(){},interstitialAd(){throw Error("no player")}}, {embedded:true,approved:true});
 b.initialize();
 assert.deepEqual(await b.beforeNext({completedStage:7}),{offered:true,success:false});
 assert.equal(globalThis.__gamepixAdPaused,false);
 assert.equal(b.realRevenueConfirmed,false);
});
test("No arbitrary external services, authentic GamePix v3 first script and no SDK copy",()=>{
 const d="docs/gamepix/";
 const html=readFileSync(d+"index.html","utf8");
 const bootstrap=readFileSync(d+"gamepix-bootstrap.mjs","utf8");
 const game=readFileSync(d+"main.mjs","utf8");
 assert.equal(GAMEPIX_SDK_SRC,"https://integration.gamepix.com/sdk/v3/gamepix.sdk.js");
 assert.equal((html.match(/integration\.gamepix\.com\/sdk\/v3\/gamepix\.sdk\.js/g)||[]).length,1);
 assert.ok(html.indexOf("integration.gamepix.com")<html.indexOf('type="module"'));
 assert.match(bootstrap,/createGamePixBridge/);
 const config=JSON.parse(readFileSync(d+"publisher-config.json","utf8"));
 assert.equal(config.approvedByGamePix,false);
 assert.equal(config.approvedGameId,null);
 assert.equal(config.adsEnabled,false);
 assert.match(game,/__gamepixBeforeNext/);
 assert.match(game,/__gamepixOnVictory/);
 assert.match(game,/__gamepixOnLevel/);
 assert.doesNotMatch(html,/<script[^>]*src="https:\/\/(?!integration\.gamepix\.com)/);
 assert.doesNotMatch(html,/adsense|PAYMENT-SIGNATURE|fromSeed|privateKey|SecretKey/);
});
