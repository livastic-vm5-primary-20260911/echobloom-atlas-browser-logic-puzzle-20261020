import { chromium } from "../../lastone-mobile-playgama-pilot-20261019/node_modules/playwright-core/index.mjs";
import { createServer } from "node:http";
import { readFileSync,mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname,resolve,join } from "node:path";
import assert from "node:assert/strict";
import { stage,STAGE_COUNT } from "../puzzle.mjs";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const qa=join(root,"qa");mkdirSync(qa,{recursive:true});
const names=new Map([
 ["/","index.html"],["/index.html","index.html"],["/main.mjs","main.mjs"],["/puzzle.mjs","puzzle.mjs"],["/style.css","style.css"],["/favicon.svg","favicon.svg"]
]);
const types={html:"text/html; charset=utf-8",mjs:"text/javascript; charset=utf-8",css:"text/css; charset=utf-8",svg:"image/svg+xml"};
const server=createServer((req,res)=>{
 const path=new URL(req.url,"http://127.0.0.1").pathname;
 if(!names.has(path)){res.writeHead(404);res.end("No resource");return}
 const file=names.get(path);
 const body=readFileSync(join(root,file));
 res.writeHead(200,{"Content-Type":types[file.split(".").pop()],"Content-Length":body.length,"Cache-Control":"no-store"});
 res.end(body);
});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
const base="http://127.0.0.1:"+server.address().port+"/";
let browser;
const errors=[],external=[];
try{
 browser=await chromium.launch({executablePath:"/usr/bin/google-chrome",headless:true,args:["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]});
 for(const v of [{name:"desktop",width:1240,height:800},{name:"mobile",width:390,height:844},{name:"landscape",width:896,height:414}]){
  const context=await browser.newContext({viewport:{width:v.width,height:v.height},deviceScaleFactor:1,isMobile:v.name==="mobile",hasTouch:v.name==="mobile"});
  const page=await context.newPage();
  page.on("pageerror",e=>errors.push(v.name+": "+e.message));
  page.on("request",r=>{if(!r.url().startsWith(base))external.push(r.url())});
  const response=await page.goto(base,{waitUntil:"domcontentloaded",timeout:12000});
  assert.equal(response.status(),200);
  await page.waitForSelector("#board button:nth-child(9)",{timeout:8000});
  const baseline=await page.evaluate(()=>({
   name:document.title,boardSize:document.querySelectorAll("#board button").length,
   bodyWidth:document.documentElement.scrollWidth,viewport:innerWidth,
   visibleBoard:document.getElementById("board").getBoundingClientRect().width,
   initialMoves:document.getElementById("move-count").textContent,
   initialLit:document.getElementById("lit-count").textContent,
   externalLinks:document.querySelectorAll("a[href^='http']").length
  }));
  assert.equal(baseline.boardSize,9);assert.equal(baseline.externalLinks,0);
  assert.equal(baseline.initialMoves,"00");assert.ok(baseline.bodyWidth <= baseline.viewport+2,"horizontal overflow "+JSON.stringify(baseline));
  await page.screenshot({path:join(qa,v.name+".png"),fullPage:true});
  if(v.name==="desktop"){
   await page.locator("#board button").first().click();
   assert.equal(await page.locator("#move-count").innerText(),"01");
   await page.locator("#undo").click();
   assert.equal(await page.locator("#move-count").innerText(),"00");
   await page.locator("#hint").click();
   assert.equal(await page.locator(".tile.hinted").count(),1);
   // A restart after Undo is disabled by design; never wait 30s on a disabled button.
   assert.equal(await page.locator("#reset").isEnabled(),false);
   await page.locator("#board button").first().click();
   assert.equal(await page.locator("#reset").isEnabled(),true);
   await page.locator("#reset").click();
   assert.equal(await page.locator("#move-count").innerText(),"00");
   await page.locator("#how").click();
   assert.equal(await page.locator("#how-dialog").isVisible(),true);
   await page.locator("#close-how").click();
   assert.equal(await page.locator("#how-dialog").isVisible(),false);
   const first=stage(0);
   for(const ix of first.solution)await page.locator("#board button").nth(ix).click();
   assert.equal(await page.locator("#win-panel").isVisible(),true);
   assert.equal(await page.locator("#chapters button").nth(1).isEnabled(),true);
   await page.locator("#next").click();
   assert.equal(await page.locator("#board button").count(),9);
   assert.equal(await page.locator("#stage-number").innerText(),"GARDEN 02 / 18");
   const completeSolutions=Array.from({length:STAGE_COUNT},(_,i)=>stage(i).solution);
   await page.evaluate(solutions=>{
    for(let i=1;i<solutions.length;i++){
     const cells=document.querySelectorAll("#board button");
     for(const move of solutions[i])cells[move].click();
     if(i+1<solutions.length)document.getElementById("next").click();
    }
   },completeSolutions);
   assert.equal(await page.locator("#win-panel").isVisible(),true);
   assert.ok((await page.locator("#win-title").innerText()).includes("All gardens"));
   const final=await page.evaluate(()=>({count:document.querySelectorAll("#chapters button:not([disabled])").length,saved:JSON.parse(localStorage.getItem("echobloom-atlas-progress-v1"))}));
   assert.equal(final.count,STAGE_COUNT);assert.equal(final.saved.unlocked,17);
   console.log("VIEWPORT",JSON.stringify({...v,...baseline,allEighteenSolved:true,localProgress:true}));
  }else{
   await page.locator("#board button").first().click();
   assert.equal(await page.locator("#move-count").innerText(),"01");
   console.log("VIEWPORT",JSON.stringify({...v,...baseline,realInteraction:true}));
  }
  await context.close();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log("HEADLESS_RESULT",JSON.stringify({pass:true,viewports:3,allStagesSolved:18,errors,externalRequests:external,artifacts:["qa/desktop.png","qa/mobile.png","qa/landscape.png"]}));
}finally{
 if(browser)await browser.close();
 await new Promise(r=>server.close(r));
}
