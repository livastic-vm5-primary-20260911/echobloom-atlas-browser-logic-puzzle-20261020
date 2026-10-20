# Echobloom Atlas — ONEplay AI Game Web candidate

Original human-owned, transparently AI-assisted HTML5 puzzle, prepared on VM5 with official ONEstore H5 Web SDK v1.1.0. This is a CANDIDATE BUILD, not a published ONEconsole product, an accepted licence contract, or real revenue.

## Official registration
- ONEplay October 1 2026: https://dev.onestore.net/dev/notice/33757
- AI Game registration: https://onestore-dev.gitbook.io/dev/docs/apps/register-app/ai-game.md
- Select Apps -> New product -> AI usage YES (cannot change this flag later) -> Web -> original title -> actual HTTPS address.
- Web product: https://onestore-dev.gitbook.io/dev/docs/apps/product/web.md ; only FREE Web games, Korean distribution, statutory rating and actual platform review.
- SDK v1.1.0: https://onestore-dev.gitbook.io/dev/tools/web-sdk/releasenote.md ; ads: https://onestore-dev.gitbook.io/dev/tools/web-sdk/iaa.md

## Original candidate URL after deployment
https://livastic-vm5-primary-20260911.github.io/echobloom-atlas-browser-logic-puzzle-20261020/oneplay/

The separate /oneplay/ package contains the original 18-stage proprietary HTML5 puzzle from the same economic owner and does NOT change its existing root game or its unrelated conditional B2B licensing page.
The SDK flow uses createSDK -> initializeAsync -> setLoadingProgress -> import original game -> startGameAsync. Pause, resume and exit events are supported. A direct top-level browser loads the original free game without the remote SDK.

## Monetization / eligibility NOT YET VERIFIED
- ONEplay Web product itself must be free; potential earnings come ONLY from approved platform in-app ads (IAA) or in-app purchases (IAP). No speculative $149 Web checkout.
- placement-config.json starts with NULL placement IDs and approvedByConsole false. This guarantees NO advertising until ONEconsole legitimately issues a real per-game interstitial placementId.
- Legal human ONEconsole enrollment, Korean business/personal seller identity, tax/payout details, original IP ownership, legal game classification, actual platform QA and ad inventory ID are mandatory gates. Never fabricate or guess.
- After platform approval, use ONLY an authentic granted interstitial placement ID for optional between-stage ads, never fake impressions or ads to oneself; no rewarded inventory without server-side verification (SSV).
- SDK ad callback completion alone is NOT cash. Actual attributable platform remittance to legal owner is the only sale.
- Original code, tax credentials, private claim tokens, wallets, OTP and signer do not belong in public GitHub source.

## Tests, sources and rollback
Run node --test tests/oneplay-monetization.test.mjs tests/puzzle.test.mjs tests/publisher-korean.test.mjs tests/publisher-licensing.test.mjs
Run node tests/oneplay-browser.smoke.mjs ; real Chromium direct-game progression plus mocked ONEplay host handshake (the mocked part is NOT a native ONEplay app approval test).
Rollback: remove the isolated docs/oneplay folder in a reviewed new commit. Original root game remains unchanged.

Binding earlier user Oct19 STOP: no Golem/AIOZ/DePIN/CPU/GPU/VPS or raw compute resource rentals, restarts or substitutes. No self-pay, Sybil, fake KYC, account farming or arbitrary gas/spending.
