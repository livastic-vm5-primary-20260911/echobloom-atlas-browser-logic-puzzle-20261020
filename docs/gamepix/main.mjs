import { stage, STAGE_COUNT, press, isSolved, hintIndex } from "./puzzle.mjs";
const $ = id => document.getElementById(id);
const STORE = "echobloom-atlas-progress-v1";
let stored = { unlocked:0, last:0, best:{} };
try {
 const x = JSON.parse(localStorage.getItem(STORE)||"null");
 if (x && typeof x === "object" && Number.isInteger(x.unlocked) && x.unlocked >= 0 && x.unlocked < STAGE_COUNT) {
  stored.unlocked=x.unlocked;
  stored.last=Number.isInteger(x.last)&&x.last>=0&&x.last<=x.unlocked?x.last:x.unlocked;
  if (x.best && typeof x.best==="object") for(const [k,v] of Object.entries(x.best))
   if(/^(?:[0-9]|1[0-7])$/.test(k)&&Number.isInteger(v)&&v>0&&v<2000) stored.best[k]=v;
 }
} catch { /* game works in private browsing too */ }
let info, board, trace=[],current=0,openedHowFrom=null,hinted=null;
let sound=false, audio=null;
function persist(){ try{localStorage.setItem(STORE,JSON.stringify(stored))}catch{} }
function announce(message){$("announcer").textContent="";requestAnimationFrame(()=>$("announcer").textContent=message)}
function tone(f=440,d=.095,v=.025){
 if(!sound)return;
 try{
  if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();
  if(audio.state==="suspended")void audio.resume();
  const at=audio.currentTime,osc=audio.createOscillator(),g=audio.createGain();
  osc.type="sine";osc.frequency.setValueAtTime(f,at);osc.frequency.exponentialRampToValueAtTime(f*1.23,at+d);
  g.gain.setValueAtTime(v,at);g.gain.exponentialRampToValueAtTime(.00015,at+d);
  osc.connect(g);g.connect(audio.destination);osc.start(at);osc.stop(at+d+.014);
 }catch{}
}
function tileLabel(i){
 const row=Math.floor(i/info.size)+1,col=i%info.size+1;
 return "Row "+row+", column "+col+", "+(board[i]?"glowing":"dim")+(info.echoes.has(i)?", echo rune":"");
}
function makeBoard(){
 const g=$("board");g.replaceChildren();g.style.setProperty("--size",String(info.size));
 for(let i=0;i<info.size**2;i++){
  const b=document.createElement("button");b.type="button";b.className="tile";b.dataset.index=String(i);b.setAttribute("role","gridcell");
  const o=document.createElement("span");o.className="tile-ornament";o.setAttribute("aria-hidden","true");
  o.textContent=info.echoes.has(i)?"◇":"✦";b.append(o);b.addEventListener("click",()=>move(i));g.append(b);
 }
}
function render(){
 const cells=[...$("board").children],solved=isSolved(board);
 for(let i=0;i<cells.length;i++){
  const b=cells[i];b.classList.toggle("on",board[i]===1);b.classList.toggle("echo",info.echoes.has(i));
  b.classList.toggle("hinted",i===hinted);b.setAttribute("aria-label",tileLabel(i));
  b.setAttribute("aria-pressed",String(board[i]===1));b.disabled=solved;
 }
 const count=board.reduce((a,b)=>a+b,0),total=board.length;
 $("lit-count").textContent=count+" of "+total+" lights glowing";
 $("progress-fill").style.width=String(count/total*100)+"%";
 $("move-count").textContent=String(trace.length).padStart(2,"0");
 $("undo").disabled=trace.length===0||solved;$("reset").disabled=trace.length===0;$("hint").disabled=solved;
 $("stage-number").textContent="GARDEN "+String(info.number).padStart(2,"0")+" / "+STAGE_COUNT;
 $("stage-name").textContent=info.name;
 $("chapter-progress").textContent=String(stored.unlocked).padStart(2,"0")+" / "+STAGE_COUNT;
 $("best-progress").textContent=stored.best[current]??"—";
 $("win-panel").hidden=!solved;
 if(solved){
  $("win-title").textContent=current===STAGE_COUNT-1?"All gardens glowing!":"Garden restored!";
  $("win-subtitle").textContent="Solved in "+trace.length+" thoughtful "+(trace.length===1?"move":"moves")+".";
  $("next").textContent=current===STAGE_COUNT-1?"Replay the first ✧":"Next garden →";
 }
}
function redrawAtlas(){
 const div=$("chapters");div.replaceChildren();$("unlocked-label").textContent=String(stored.unlocked+1)+" / "+STAGE_COUNT+" unlocked";
 for(let i=0;i<STAGE_COUNT;i++){
  const b=document.createElement("button");b.type="button";b.textContent=String(i+1).padStart(2,"0");b.className="chapter-tile";
  b.disabled=i>stored.unlocked;b.classList.toggle("current",i===current);
  b.classList.toggle("complete",i<stored.unlocked||typeof stored.best[i]==="number");
  b.setAttribute("aria-label","Garden "+(i+1)+", "+(i>stored.unlocked?"locked":i===current?"currently playing":typeof stored.best[i]==="number"?"completed":"available"));
  if(i===current)b.setAttribute("aria-current","step");
  b.addEventListener("click",()=>select(i,true));div.append(b);
 }
}
function select(index,focus){
 if(index<0||index>stored.unlocked||index>=STAGE_COUNT)return;
 current=index;info=stage(index);board=info.initial.slice();trace=[];hinted=null;stored.last=index;persist();
 if(typeof window.__gamepixOnLevel==="function")window.__gamepixOnLevel(index+1);
 makeBoard();render();redrawAtlas();
 if(focus){
  const b=$("board").firstElementChild;if(b)b.focus({preventScroll:true});
  announce("Garden "+(index+1)+". "+info.name+". "+board.filter(x=>x===0).length+" dim lights.");
 }
}
function move(index){
 if(window.__gamepixAdPaused)return;
 if(isSolved(board)||!Number.isInteger(index)||index<0||index>=board.length)return;
 board=press(board,index,info.size,info.echoes);trace.push(index);hinted=null;
 const victory=isSolved(board);tone(victory?850:board[index]?520:300,victory?.19:.07,victory?.035:.012);
 if(victory){
  if(typeof window.__gamepixOnVictory==="function")window.__gamepixOnVictory({completedStage:current+1,moves:trace.length});
  if(stored.best[current]===undefined||trace.length<stored.best[current])stored.best[current]=trace.length;
  stored.unlocked=Math.max(stored.unlocked,Math.min(STAGE_COUNT-1,current+1));
  persist();redrawAtlas();
  announce("Garden "+(current+1)+" restored in "+trace.length+" moves. "+(current===STAGE_COUNT-1?"All gardens complete.":"Next garden unlocked."));
 }
 render();
}
$("undo").addEventListener("click",()=>{
 if(window.__gamepixAdPaused||!trace.length||isSolved(board))return;
 board=press(board,trace.pop(),info.size,info.echoes);hinted=null;tone(260,.045,.012);render();announce("Last move undone.");
});
$("reset").addEventListener("click",()=>{
 if(window.__gamepixAdPaused||!trace.length)return;
 const which=current;select(which,true);tone(330,.08,.014);announce("Garden "+(which+1)+" restarted.");
});
$("hint").addEventListener("click",()=>{
 if(window.__gamepixAdPaused||isSolved(board))return;
 hinted=hintIndex(info.solution,trace);render();
 if(hinted===null){announce("The remaining pattern is already complete.");return;}
 const row=Math.floor(hinted/info.size)+1,col=hinted%info.size+1;
 $("board").children[hinted].focus({preventScroll:true});
 announce("Hint: try row "+row+", column "+col+". This move belongs to one valid solution.");
});
// A successful level and explicit player Next click are the sole ad break.
// Never offer an impression from page load, hints, resets or arbitrary input.
let gamepixNextBusy=false;
$("next").addEventListener("click",async()=>{
 if(!isSolved(board)||gamepixNextBusy)return;
 gamepixNextBusy=true;
 const finished=current;
 try{
  if(finished<STAGE_COUNT-1&&typeof window.__gamepixBeforeNext==="function")
   await window.__gamepixBeforeNext({completedStage:finished+1});
  if(current!==finished||!isSolved(board))return;
  if(current===STAGE_COUNT-1){stored.unlocked=STAGE_COUNT-1;select(0,true);}
  else select(Math.min(current+1,stored.unlocked),true);
 }finally{gamepixNextBusy=false;}
});
$("board").addEventListener("keydown",event=>{
 const n=event.target;if(!(n instanceof HTMLButtonElement)||!n.classList.contains("tile"))return;
 const i=Number(n.dataset.index),s=info.size;let next=i;
 if(event.key==="ArrowRight")next=i%s<s-1?i+1:i;
 else if(event.key==="ArrowLeft")next=i%s>0?i-1:i;
 else if(event.key==="ArrowDown")next=i+s<board.length?i+s:i;
 else if(event.key==="ArrowUp")next=i-s>=0?i-s:i;
 else return;
 event.preventDefault();$("board").children[next].focus({preventScroll:true});
});
document.addEventListener("keydown",e=>{
 if(!$("how-dialog").hidden){if(e.key==="Escape")closeHow();return;}
 if(e.target instanceof HTMLButtonElement&&e.target.classList.contains("tile"))return;
 if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
 if(e.key==="r"||e.key==="R")$("reset").click();
 if(e.key==="h"||e.key==="H")$("hint").click();
});
function openHow(){openedHowFrom=document.activeElement;$("how-dialog").hidden=false;$("close-how").focus()}
function closeHow(){$("how-dialog").hidden=true;if(openedHowFrom&&"focus" in openedHowFrom)openedHowFrom.focus()}
$("how").addEventListener("click",openHow);
$("close-how").addEventListener("click",closeHow);
$("got-it").addEventListener("click",closeHow);
$("how-dialog").addEventListener("click",e=>{if(e.target===$("how-dialog"))closeHow()});
$("sound").addEventListener("click",()=>{
 sound=!sound;$("sound").setAttribute("aria-pressed",String(sound));
 $("sound").innerHTML="Sound "+(sound?"on":"off")+" <span aria-hidden='true'>♪</span>";
 if(sound)tone(540,.08,.013);
});
$("logo").addEventListener("click",e=>{e.preventDefault();select(Math.min(stored.last,stored.unlocked),true)});
select(Math.min(stored.last,stored.unlocked),false);

// Respect publisher/browser lifecycle; an in-progress synthesized tone is not
// allowed to keep sounding when the player switches tabs. No game timer runs.
document.addEventListener("visibilitychange",()=>{
 if(document.hidden&&audio?.state==="running")void audio.suspend().catch(()=>{});
});
