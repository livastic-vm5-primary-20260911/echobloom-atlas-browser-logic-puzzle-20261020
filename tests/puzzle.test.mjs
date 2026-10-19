import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stage, STAGE_COUNT, dimensions, effectCells, press, hintIndex, isSolved } from "../puzzle.mjs";

test("Every one of 18 puzzle stages is deterministic, initially unsolved and reconstructably solvable",()=>{
 assert.equal(STAGE_COUNT,18);
 const seen=new Set();
 for(let i=0;i<STAGE_COUNT;i++){
  const p=stage(i),q=stage(i);
  assert.equal(p.size,dimensions(i));
  assert.equal(p.initial.length,p.size*p.size);
  assert.equal(p.initial.every(n=>n===0||n===1),true);
  assert.equal(isSolved(p.initial),false);
  assert.deepEqual(p.initial,q.initial);
  assert.deepEqual(p.solution,q.solution);
  assert.deepEqual([...p.echoes],[...q.echoes]);
  assert.equal(new Set(p.solution).size,p.solution.length);
  assert.equal(p.solution.every(n=>Number.isInteger(n)&&n>=0&&n<p.initial.length),true);
  let now=p.initial.slice();
  for(const click of p.solution)now=press(now,click,p.size,p.echoes);
  assert.equal(isSolved(now),true,"Puzzle "+(i+1));
  seen.add(p.initial.join(""));
 }
 assert.equal(seen.size,STAGE_COUNT);
});
test("Each tap toggles only its own orthogonal neighbours, with special diagonals on echo tiles",()=>{
 const e=new Set([4]),square=[0,1,2,3,4,5,6,7,8];
 assert.deepEqual(effectCells(4,3,new Set()).sort((a,b)=>a-b),[1,3,4,5,7]);
 assert.deepEqual(effectCells(4,3,e).sort((a,b)=>a-b),square);
 assert.deepEqual(effectCells(0,3,e).sort((a,b)=>a-b),[0,1,3]);
 assert.deepEqual(effectCells(0,3,new Set([0])).sort((a,b)=>a-b),[0,1,3,4]);
 assert.throws(()=>effectCells(-1,3,e),RangeError);
 assert.throws(()=>effectCells(9,3,e),RangeError);
 assert.throws(()=>press([1,1],0,3,e),TypeError);
});
test("Applying the same tile twice, even an echo, is always reversible",()=>{
 for(let k=0;k<STAGE_COUNT;k++){
  const p=stage(k);
  for(let i=0;i<p.initial.length;i++)assert.deepEqual(press(press(p.initial,i,p.size,p.echoes),i,p.size,p.echoes),p.initial);
 }
});
test("Computed hint remains a valid remaining solution after 150+ arbitrary player moves",()=>{
 for(let k=0;k<STAGE_COUNT;k++){
  const p=stage(k);let bits=p.initial.slice(),moves=[];
  const steps=(k+1)*11;
  for(let m=0;m<steps;m++){
   const j=(m*m*31+k*19+12*m)%(p.size*p.size);
   bits=press(bits,j,p.size,p.echoes);moves.push(j);
  }
  let count=0;
  while(!isSolved(bits)){
   const n=hintIndex(p.solution,moves);
   assert.notEqual(n,null);
   bits=press(bits,n,p.size,p.echoes);moves.push(n);count++;
   assert.ok(count<=p.size*p.size,"Hint never diverges");
  }
  assert.equal(isSolved(bits),true);
 }
});
test("No external files, inline analytics, advertisements, DOM network calls or identity requirements",()=>{
 const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
 const js=readFileSync(new URL("../main.mjs",import.meta.url),"utf8");
 const css=readFileSync(new URL("../style.css",import.meta.url),"utf8");
 assert.match(html,/<meta name="viewport"/);
 assert.match(html,/role="dialog"/);
 assert.match(html,/id="board"/);
 assert.match(html,/id="announcer"/);
 assert.match(html,/main\.mjs/);
 assert.match(html,/aria-live="polite"/);
 assert.ok(!/<(?:iframe|form|object|embed)\b/i.test(html));
 assert.ok(!/<script[^>]+src="https?:/i.test(html));
 assert.ok(!/href="https?:/i.test(html));
 assert.ok(!/url\(["']?https?:/i.test(css));
 assert.ok(!/\b(fetch|XMLHttpRequest|sendBeacon|WebSocket)\s*\(/.test(js));
 assert.ok(!/https?:\/\/.+/.test(js));
 assert.match(css,/prefers-reduced-motion/);
 assert.match(js,/localStorage/);
 assert.ok(!/document.cookie/.test(js));
});
