// External SDK is the first script in the HTML <head> (official GamePix rule).
// This module imports the complete stand-alone original puzzle as fallback.
import {createGamePixBridge} from "./gamepix-bridge.mjs";
// No GamePix platform approval or official game ID is present until a real
// legal publisher is approved. The public default config stays OFF.
let approved=false;
if(window.parent!==window){
 try{
  const response=await fetch("./publisher-config.json",{cache:"no-store",redirect:"error"});
  if(response.ok){
   const config=await response.json();
   approved=config?.approvedByGamePix===true &&
     config?.adsEnabled===true &&
     typeof config?.approvedGameId==="string" &&
     /^[A-Za-z0-9_-]{3,96}$/.test(config.approvedGameId);
  }
 }catch{} // No config/network: stay fully playable with no sdk calls.
}
const platform=window.GamePix;
const bridge=createGamePixBridge(platform,{embedded:window.parent!==window,approved});
window.__gamepixAdPaused=false;
window.__gamepixBeforeNext=x=>bridge.beforeNext(x);
window.__gamepixOnVictory=x=>bridge.onVictory(x);
window.__gamepixOnLevel=x=>bridge.onLevel(x);
await import("./main.mjs");
if(bridge.initialize()){
 // Never call loaded twice; direct public GitHub Pages remains a fully
 // playable no-ad demo, not a GamePix-approved or monetized game.
 bridge.onLevel(Number(document.getElementById("stage-number")?.textContent?.match(/\d+/)?.[0])||1);
}
document.documentElement.dataset.gamepixSdk=bridge.available?"available":"standalone";
