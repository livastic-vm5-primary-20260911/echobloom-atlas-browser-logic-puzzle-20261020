import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const publisher=readFileSync(new URL("../docs/publisher.html",import.meta.url),"utf8");
const originalGame=readFileSync(new URL("../docs/index.html",import.meta.url),"utf8");

test("Korean buyer gets a navigable, descriptive on-page commercial summary",()=>{
 assert.match(publisher,/href="#kr" lang="ko">한국어 제휴 안내/);
 assert.match(publisher,/<section class="section" id="kr" lang="ko"/);
 assert.match(publisher,/에코블룸 아틀라스/);
 assert.match(publisher,/18단계/);
 assert.match(publisher,/한국 소재/);
 assert.match(publisher,/퍼블리셔 검토/);
});

test("Korean licence terms are conditional, no automatic rights or funds",()=>{
 for(const wording of ["$149","12개월","비독점","단일 도메인","별도 서면","실제 계약이나 지급이 이루어졌다는 뜻이 아닙니다","원본 파일을 전달하거나 권리를 이전하지 않습니다"])assert.ok(publisher.includes(wording),wording);
 assert.match(publisher,/한국 거주 개인의 계약·세무·정산 적격성/);
 assert.match(publisher,/실제 제휴 승인, 매출, 광고 노출 및 지급 이력은 아직 없습니다/);
 assert.match(publisher,/AI 도구의 도움/);
});

test("Korean route is inquiry-only, source disclosure without marketing leakage",()=>{
 assert.match(publisher,/mailto:onecursora1@gmail.com/);
 assert.match(publisher,/비밀번호·API 키·고객 개인정보를 전송하지 마세요/);
 assert.doesNotMatch(publisher,/<form\b/i);
 assert.doesNotMatch(publisher,/<script\b/i);
 assert.deepEqual(originalGame.includes("mailto:"),false);
 assert.deepEqual(originalGame.includes("publisher.html"),false);
});
