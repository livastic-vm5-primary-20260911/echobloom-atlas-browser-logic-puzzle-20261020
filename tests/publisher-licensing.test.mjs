import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,statSync} from "node:fs";
const root=new URL("../docs/",import.meta.url);
const html=readFileSync(new URL("publisher.html",root),"utf8");
test("Publisher terms clearly separate indicative price and actual paid contract",()=>{
 assert.match(html,/Echobloom Atlas/);
 assert.match(html,/\$149/);
 assert.match(html,/non-exclusive/i);
 assert.match(html,/not a completed sale/i);
 assert.match(html,/written agreement/i);
 assert.match(html,/No source\/IP buyout/i);
 assert.match(html,/No invoice or payment request is issued/i);
 assert.match(html,/no accepted orders/i);
 assert.match(html,/AI-AS[S]?ISTED/i);
 assert.match(html,/ChatGPT assistance/i);
 assert.match(html,/South Korea/i);
});
test("One-owner original game public build stays unaltered and unaffected by marketing",()=>{
 const htmlGame=readFileSync(new URL("index.html",root),"utf8");
 assert.ok(htmlGame.includes("Echobloom Atlas"));
 assert.ok(!htmlGame.includes("mailto:"));
 assert.ok(!htmlGame.includes("publisher.html"));
 assert.ok(!htmlGame.includes("149"));
 assert.ok(!/https?:\/\/[^\s"'<>]+/i.test(htmlGame));
});
test("Publisher page uses real licensed QA assets and a single real contact",()=>{
 assert.ok(html.includes("publisher-assets/desktop.webp"));
 assert.ok(html.includes("publisher-assets/mobile.webp"));
 for(const asset of ["publisher-assets/desktop.webp","publisher-assets/mobile.webp"])
  assert.ok(statSync(new URL(asset,root)).size>1500);
 assert.ok(html.includes("href=\"mailto:onecursora1@gmail.com"));
 assert.ok(html.includes("https://livastic-vm5-primary-20260911.github.io/echobloom-atlas-browser-logic-puzzle-20261020/publisher.html"));
 assert.ok(!/<script\b/.test(html));
 assert.ok(!/<iframe\b/.test(html));
 assert.ok(!/<form\b/.test(html));
});
