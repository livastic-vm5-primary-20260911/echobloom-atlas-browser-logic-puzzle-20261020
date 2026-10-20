import { chromium } from "../../lastone-mobile-playgama-pilot-20261019/node_modules/playwright-core/index.mjs";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import {stage} from "../puzzle.mjs";

const root=resolve(fileURLToPath(new URL("../docs/oneplay/", import.meta.url)));
const files=new Set(["index.html","oneplay-bootstrap.mjs","oneplay-bridge.mjs","main.mjs","puzzle.mjs","style.css","favicon.svg","placement-config.json"]);
const types={mjs:"text/javascript",html:"text/html; charset=utf-8",css:"text/css",svg:"image/svg+xml",json:"application/json"};
const server=createServer((req,res)=>{
 const pathname=new URL(req.url,"http://127.0.0.1").pathname;
 if(pathname==="/frame"){
  res.writeHead(200,{"content-type":"text/html"});
  res.end('<!doctype html><title>ONEplay mocked parent</title><iframe title="ONEplay preview" src="/oneplay/"></iframe>');return;
 }
 let name=pathname.startsWith("/oneplay/")?pathname.slice("/oneplay/".length):"";
 if(!name)name="index.html";
 if(!files.has(name)){res.writeHead(404);res.end("not found");return}
 const data=readFileSync(join(root,name));
 res.writeHead(200,{"Content-Type":types[name.split(".").pop()],"Content-Length":data.length});
 res.end(data);
});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
const url="http://127.0.0.1:"+server.address().port+"/";
let browser;
try{
 browser=await chromium.launch({executablePath:"/usr/bin/google-chrome",headless:true,args:["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"]});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[],outside=[];
 page.on("pageerror",e=>errors.push(e.message));
 page.on("request",r=>{if(!r.url().startsWith(url))outside.push(r.url())});
 const res=await page.goto(url+"oneplay/",{waitUntil:"domcontentloaded",timeout:9000});
 assert.equal(res.status(),200);
 await page.waitForSelector("#board button:nth-child(9)",{timeout:8500});
 assert.equal(await page.locator("html").getAttribute("data-oneplay-lifecycle"),"standalone");
 assert.equal(await page.locator("#board button").count(),9);
 assert.equal(await page.locator("#move-count").textContent(),"00");
 await page.locator("#board button").first().click();
 assert.equal(await page.locator("#move-count").textContent(),"01");
 await page.locator("#undo").click();
 assert.equal(await page.locator("#move-count").textContent(),"00");
 const solution=stage(0).solution;
 for(const move of solution)await page.locator("#board button").nth(move).click();
 await page.waitForSelector("#win-panel:not([hidden])",{timeout:2500});
 await page.locator("#next").click();
 await page.waitForFunction(()=>document.getElementById("stage-number").textContent.includes("02"),{timeout:4500});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
 assert.deepEqual(errors,[]);
 assert.deepEqual(outside,[]);
 await page.close();
 console.log("ONEPLAY_REAL_CHROME_DIRECT_MOBILE_PUZZLE_UNDO_SOLVE_NEXT_PASS externalRequests0");

 const host=await browser.newPage({viewport:{width:1180,height:800}});
 const err=[];
 host.on("pageerror",e=>err.push(e.message));
 await host.route("https://h5sdk.onestore.net/lib/v1.1.0/onestore-h5-sdk.min.js",route=>route.fulfill({
  status:200,headers:{"access-control-allow-origin":"*","content-type":"text/javascript"},
  body:'export function createSDK(){return {on(){},initializeAsync:async()=>({err:false}),setLoadingProgress(){},startGameAsync:async()=>{window.__mock_oneplay_ready=1},ads:{isSupported:()=>false}}}'
 }));
 await host.goto(url+"frame",{waitUntil:"domcontentloaded",timeout:7000});
 const frame=host.frameLocator('iframe');
 await frame.locator('#board button:nth-child(9)').waitFor({timeout:10000});
 await frame.locator('html[data-oneplay-lifecycle="running"]').waitFor({timeout:5000});
 assert.equal(await frame.locator('#board button').count(),9);
 assert.equal(await frame.locator('html').evaluate(el=>window.__mock_oneplay_ready),1);
 assert.deepEqual(err,[]);
 console.log("ONEPLAY_MOCKED_HOST_IFRAME_SDK_INIT_PROGRESS_START_PASS_REAL_ADS0");
 await host.close();
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(r=>server.close(r));
}
