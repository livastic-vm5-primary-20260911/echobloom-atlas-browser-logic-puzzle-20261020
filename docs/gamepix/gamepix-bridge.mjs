// VM5 original, nonexclusive original 18-stage puzzle integration with the
// official GamePix SDK; never fabricate platform approval, views, or money.
export const GAMEPIX_SDK_SRC="https://integration.gamepix.com/sdk/v3/gamepix.sdk.js";
export function createGamePixBridge(platform,{embedded=false,approved=false}={}){
 const usable=Boolean(embedded && approved===true && platform && typeof platform.loaded==="function" &&
                  typeof platform.interstitialAd==="function");
 let loaded=false, busy=false, adOffers=0;
 const call=(fn,...args)=>{
  if(!loaded||typeof platform?.[fn]!=="function")return;
  try{platform[fn](...args)}catch{ /* optional telemetry never blocks puzzle */ }
 };
 return {
  get available(){return usable&&loaded},
  get realRevenueConfirmed(){return false},
  get adOffers(){return adOffers},
  initialize(){
   if(!usable||loaded)return false;
   try{platform.loaded();loaded=true;return true}
   catch{loaded=false;return false}
  },
  onLevel(number){
   if(!Number.isInteger(number)||number<1||number>18)return;
   call("updateLevel",number);
  },
  onVictory({completedStage,moves}={}){
   if(!Number.isInteger(completedStage)||completedStage<1||completedStage>18||
      !Number.isInteger(moves)||moves<1||moves>1999)return;
   // Stage progress is only an in-game score: not player purchases or income.
   call("updateScore",Math.max(1,completedStage*100-Math.min(moves,99)));
   call("happyMoment");
  },
  async beforeNext({completedStage}={}){
   if(!loaded||busy||!Number.isInteger(completedStage)||
      completedStage<1||completedStage>17)
     return {offered:false,reason:"not_publisher_ready"};
   busy=true;
   adOffers++;
   try{
    // The game has no timer. Block puzzle input during legitimate break.
    // This only reports SDK result; ad impressions and revenue must come
    // from GamePix's independently verified publisher settlement ledger.
    globalThis.__gamepixAdPaused=true;
    let timer;
    try {
     const reply=await Promise.race([
      Promise.resolve().then(()=>platform.interstitialAd()),
      new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error("ad_timeout")),12000)})
     ]);
     return {offered:true,success:reply?.success===true};
    } finally {if(timer!==undefined)clearTimeout(timer)}
   }catch{return {offered:true,success:false}}
   finally{globalThis.__gamepixAdPaused=false;busy=false}
  }
 }
}
