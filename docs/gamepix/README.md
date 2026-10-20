# Echobloom Atlas — GamePix HTML5 candidate (NOT a published GamePix title)

Original VM5 human-owned, AI-assisted complete 18-stage logic puzzle, a future nonexclusive GamePix developer technical-review candidate. NOT a platform-approved title, signed commercial agreement or actual sale.

## Official economic and technical evidence
- Firstparty https://partners.gamepix.com/developers currently advertises **50% of net game advertising revenue** to eligible developers. This is not 50% of gross and not a revenue guarantee. Official publisher acceptance, genuine users, ads and payment settlement are separate requirements.
- Firstparty https://partners.gamepix.com/sdk/doc/javascript requires the actual official JavaScript v3 SDK as the first head script, its GamePix.loaded() once before progress/ads, optional GamePix.updateLevel(number)/GamePix.updateScore(number), and GamePix.interstitialAd() only between genuine user gameplay breaks. The platform itself decides whether it shows any paid advertisement.
- Firstparty https://partners.gamepix.com/guidelines/submission requires actual completed browser gameplay and testing, not empty placeholders.
- Firstparty new-account form https://partners.gamepix.com/join-us?t=developer requests genuine owner given name, surname, email, actual year/month/day of birth, public username, country and TOS acceptance. **True identity and birthdate are NOT provided or verified**. South Korea exists on the actual form's country list, but legal payout eligibility and payout threshold remain unverified. No fake DOB, registration or partner agreement acceptance.

## Original complete playable candidate
Publish isolated full game at:
https://livastic-vm5-primary-20260911.github.io/echobloom-atlas-browser-logic-puzzle-20261020/gamepix/

The original root fully playable 18-stage puzzle and separate /oneplay/ publisher kit remain unchanged. This GamePix candidate exists only in docs/gamepix, source and assets independent of server gameplay and without third-party marketing/ad tracking other than the official platform SDK. It may be zipped with index.html at the archive root for a *legitimately approved* original owner developer upload. Public GitHub source and AI-generated elements preclude guaranteeing exclusive rights to anyone.

### Fail-closed advertisement permission
publisher-config.json defaults:
- approvedByGamePix: false
- approvedGameId: null
- adsEnabled: false

Consequently zero ads and zero SDK commercial calls from any standalone GitHub Pages preview or iframe. Never change these fields until the genuine human owner legally registers and passes GamePix publisher and game review, receives a real game ID and permission to monetize this exact game. No fabricated GamePix approval or ad IDs.

If correctly approved and configured, GamePix.loaded() may execute once, then it can report numeric level and puzzle score progress. One possible GamePix.interstitialAd() call occurs only after a solved level1–17 when the actual player explicitly clicks Next, never on startup/replay/undo/hint/reset, and puzzle input pauses until the ad opportunity is resolved. A no-fill/error cannot block stage progression. Stage18 final does not request another ad. No rewarded ads, purchases, owner ad clicks or self-buy.

### Evidence and revenue terms
Offline Node test command from repo root:
node --test tests/gamepix-integration.test.mjs tests/puzzle.test.mjs tests/publisher-korean.test.mjs tests/publisher-licensing.test.mjs tests/oneplay-monetization.test.mjs

Actual Chrome smoke command:
node tests/gamepix-browser.smoke.mjs

The Chrome iframe uses an obviously MOCKED SDK/approval exclusively within local test code, NOT actual third-party advertising or income. Actual profit only when an independently approved real customer/player transaction is credited by official platform to the original lawful payout owner and actually remitted. Public pageview, SDK callbacks, site signup, pending review, fake ad counters, local test passing and source distribution are NOT deposited money.

No owner's wallet keys, private identity, OTP, signup password, signing gas, KYC or tax data may appear in the repo or ZIP. Existing one-owner other portal licences are conditional/nonexclusive, any transfer needs written legal terms. Original user binding Oct19 STOP all Golem/AIOZ/DePIN/CPU/GPU/VPS/raw computing resource rentals/restarts/substitutes remains strictly active.

Rollback: remove only the isolated docs/gamepix variant in a separately reviewed commit.
