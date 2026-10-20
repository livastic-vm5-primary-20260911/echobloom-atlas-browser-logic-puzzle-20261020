// Original VM5 game-only adapter. No real ad request without a legally issued
// ONEconsole placementId, successful ONEplay initialization, user stage win,
// explicit Next click and supported SDK. Monetization never simulated.
export function makeAdGate(sdk,config,ready){
 const id=config?.interstitialPlacementId;
 const approved=config?.approvedByConsole===true;
 const usable=Boolean(ready&&approved&&typeof id==="string"&&
  /^[A-Za-z0-9_-]{5,120}$/.test(id)&&sdk?.ads?.isSupported?.("interstitial")===true);
 let pending=false;
 return {
  isEnabled:()=>usable,
  async beforeNext({completedStage}={}){
   if(!usable||pending||!Number.isInteger(completedStage)||completedStage<1||completedStage>17)
    return {offered:false,reason:"not_ready"};
   pending=true;
   try{
    const response=await sdk.ads.showInterstitialAsync({placementId:id});
    return {offered:true,status:response?.status==="completed"?"completed":"unconfirmed_or_failed"};
   }catch{return {offered:true,status:"failed"}}
   finally{pending=false}
  }
 };
}
