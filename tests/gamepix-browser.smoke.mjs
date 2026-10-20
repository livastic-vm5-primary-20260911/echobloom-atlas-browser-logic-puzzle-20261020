import { chromium } from "../../lastone-mobile-playgama-pilot-20261019/node_modules/playwright-core/index.mjs";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { stage } from "../puzzle.mjs";

const root=resolve(fileURLToPath(new URL("../docs/gamepix/",import.meta.url)));
const files=new Set(["index.html","gamepix-bootstrap.mjs","gamepix-bridge.mjs","main.mjs","puzzle.mjs","style.css","favicon.svg","publisher-config.json"]);
const types={mjs:"text/javascript",html:"text/html; charset=utf-8",css:"text/css",svg:"image/svg+xml",json:"application/json"};
const server=createServer((req,res)=>{
 const pathname=new URL(req.url,"http://127.0.0.1").pathname;
 if(pathname==="/frame"){res.writeHead(200,{"content-type":"text/html"});res.end('<!doctype html><title>Mock publisher iframe</title><iframe src="/gamepix/" title="GamePix sandbox"></iframe>');return}
 let name=pathname.startsWith("/gamepix/")?pathname.slice("/gamepix/".length):"";
 if(!name)name="index.html";
 if(!files.has(name)){res.writeHead(404);res.end("not found");return}
 const data=readFileSync(join(root,name));
 res.writeHead(200,{"content-type":types[name.split(".").pop()],"content-length":data.length});
 res.end(data);
});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
const base="http://127.0.0.1:"+server.address().port+"/";
let browser;
const source=readFileSync(join(root,"index.html"),"utf8");
assert.ok(source.indexOf("gamepix.sdk.js")<source.indexOf("gamepix-bootstrap.mjs"));
const mockSdk=[
'window.__gamepixMock={loaded:0,levels:[],scores:[],happy:0,ads:0};',
'window.GamePix={',
'loaded(){window.__gamepixMock.loaded++},',
'updateLevel(n){window.__gamepixMock.levels.push(n)},',
'updateScore(n){window.__gamepixMock.scores.push(n)},',
'happyMoment(){window.__gamepixMock.happy++},',
'interstitialAd(){window.__gamepixMock.ads++;return Promise.resolve({success:true})}',
'};'
].join("");
try{
 browser=await chromium.launch({executablePath:"/usr/bin/google-chrome",headless:true,args:["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"]});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[],external=[];
 page.on("pageerror",x=>errors.push(x.message));
 page.on("request",r=>{if(!r.url().startsWith(base))external.push(r.url())});
 await page.route("https://integration.gamepix.com/sdk/v3/gamepix.sdk.js",route=>route.fulfill({status:200,headers:{"content-type":"text/javascript"},body:mockSdk}));
 assert.equal((await page.goto(base+"gamepix/",{waitUntil:"domcontentloaded",timeout:10000})).status(),200);
 await page.locator('#board button').nth(8).waitFor({timeout:8000});
 assert.equal(await page.locator('html').getAttribute('data-gamepix-sdk'),"standalone");
 assert.equal(await page.locator('#board button').count(),9);
 assert.equal(await page.evaluate(()=>window.__gamepixMock.loaded),0);
 await page.locator('#board button').first().click();
 assert.equal(await page.locator('#move-count').textContent(),"01");
 await page.locator('#undo').click();
 assert.equal(await page.locator('#move-count').textContent(),"00");
 for(const move of stage(0).solution)await page.locator('#board button').nth(move).click();
 await page.locator('#win-panel:not([hidden])').waitFor({timeout:4000});
 await page.locator('#next').click();
 await page.waitForFunction(()=>document.getElementById('stage-number').textContent.includes('02'),{timeout:4500});
 assert.deepEqual(await page.evaluate(()=>window.__gamepixMock),{loaded:0,levels:[],scores:[],happy:0,ads:0});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
 assert.deepEqual(errors,[]);
 assert.deepEqual(external,["https://integration.gamepix.com/sdk/v3/gamepix.sdk.js"]);
 console.log("GAMEPIX_REAL_CHROME_MOBILE_DIRECT_18STAGE_GAME_SOLVE_NEXT_NO_ADS_PASS");
 await page.close();
 const host=await browser.newPage({viewport:{width:1080,height:800}});
 const hostErrors=[];
 host.on("pageerror",e=>hostErrors.push(e.message));
 await host.route("https://integration.gamepix.com/sdk/v3/gamepix.sdk.js",route=>route.fulfill({status:200,headers:{"content-type":"text/javascript"},body:mockSdk}));
 // Only this mocked test page pretends approved; actual hosted config is FALSE.
 await host.route("**/gamepix/publisher-config.json",route=>route.fulfill({
  status:200,headers:{"content-type":"application/json"},
  body:JSON.stringify({approvedByGamePix:true,approvedGameId:"LOCAL_TEST_ONLY",adsEnabled:true})
 }));
 await host.goto(base+"frame",{waitUntil:"domcontentloaded",timeout:9000});
 const frame=host.frameLocator("iframe");
 await frame.locator('#board button').nth(8).waitFor({timeout:9000});
 await frame.locator('html[data-gamepix-sdk="available"]').waitFor({timeout:3500});
 assert.equal(await frame.locator('html').evaluate(el=>window.__gamepixMock.loaded),1);
 assert.deepEqual(await frame.locator('html').evaluate(el=>window.__gamepixMock.levels),[1]);
 assert.equal(await frame.locator('html').evaluate(el=>window.__gamepixMock.ads),0);
 for(const move of stage(0).solution)await frame.locator('#board button').nth(move).click();
 await frame.locator('#win-panel:not([hidden])').waitFor({timeout:4000});
 assert.equal(await frame.locator('html').evaluate(el=>window.__gamepixMock.happy),1);
 assert.ok(await frame.locator('html').evaluate(el=>window.__gamepixMock.scores[0])>0);
 assert.equal(await frame.locator('html').evaluate(el=>window.__gamepixMock.ads),0);
 await frame.locator('#next').click();
 await frame.locator('#stage-number').waitFor({state:'visible'});
 await frame.locator('html').waitFor({state:'visible'});
 await frame.locator('#stage-number').evaluate(el=>new Promise(resolve=>setTimeout(resolve,180)));
 assert.equal(await frame.locator('html').evaluate(el=>window.__gamepixMock.ads),1);
 assert.equal(await frame.locator('html').evaluate(el=>window.__gamepixMock.loaded),1);
 assert.match(await frame.locator('#stage-number').textContent(),/02/);
 assert.deepEqual(await frame.locator('html').evaluate(el=>window.__gamepixMock.levels),[1,2]);
 assert.deepEqual(hostErrors,[]);
 console.log("GAMEPIX_REAL_CHROME_IFRAME_MOCK_SDK_ONCE_AND_SINGLE_WIN_AD_BREAK_PASS_ACTUAL_ADS0");
 await host.close();
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(resolve=>server.close(resolve));
}
