# Echobloom Atlas

A quiet, original HTML5 logic puzzle built and tested in **VM5** by a single human-owned, transparently AI-assisted studio. The work does not rent computing power, sell customer data or operate custodial wallets.

## Play

https://livastic-vm5-primary-20260911.github.io/echobloom-atlas-browser-logic-puzzle-20261020/

Make every garden cell glow. Press a tile to toggle it and its four orthogonal neighbors. Echo-rune tiles also toggle their diagonal neighbors. Complete 18 deterministic, guaranteed-solvable puzzles. Click/tap or use arrow keys plus Enter/Space, H for a parity-consistent hint, and R to restart. Undo and replay are free. Progress is stored on the player's own browser only.

Originality: original layout, typography, procedural colors and glyph artwork, sound synthesis and custom Echo-rune diagonal rule; no borrowed sprites, images, music, font files, third-party JavaScript or dependency-based game engine.

## Technical / player safety

- Self-contained static HTML5, CSS and JavaScript ES modules. Works on mobile portrait/landscape and desktop. No server-side gameplay.
- No advertisements, external hyperlinks in the playable interface, tracker, remote stats counter, login, name entry, payments, in-game purchases or violent content.
- Entirely playable after a first load without continued external API calls. Persisted progress stays on-device in `localStorage`; it is not sent anywhere.
- Core 18 levels are constructed by applying known invertible moves to solved layouts, so no random unsolvable positions are presented.
- Hint parity derives a correct remaining solution even after arbitrary moves.
- Accessibility: focusable cell buttons, aria labels and live announcements, keyboard arrow navigation, reduced-motion support, contrast-aware controls.
- Browser QA on Chrome completed 3 separate responsive viewports with real button interaction, zero external resource calls, zero browser exceptions, 18/18 solved in actual DOM, and no horizontal overflow. `node --test tests/puzzle.test.mjs` independently verifies construction, mechanics, reversibility, dynamic hints, and asset/local-privacy safety.

## Licensing & publisher submission

Developed for potential **non-exclusive, written flat-fee HTML5 game licensing**. Distribution on other sites is possible if commercial rights are agreed. No license or commercial rights are transferred by submitting a public browser preview. Technical demos, editorial review and public repository visibility are not proof of any payout, paid contract, independent organic customers or operational profit.

This game was produced with AI assistance by one human economic owner. Commercial IP terms, actual legal identity, third-party rights, payer tax compliance, and payout eligibility must be confirmed in any proposed contract **before** providing a full package or signing rights away.

© 2026 the original human operator of VM5 Delivery Lab. All rights reserved. Absence of a permissive license means repository source is viewable but commercial redistribution rights have not been granted.

## Release integrity

Authored source under `index.html`, `style.css`, `main.mjs`, `puzzle.mjs` and `favicon.svg`. Static GitHub Pages deploy ships those five files only. Unit tests and original headless browser QA are in `tests/`, excluded from public gameplay upload.

## Qualified publisher licensing inquiry

An original review-only publisher sheet for a possible **non-exclusive, one-named-domain** HTML5 license is available at [Echobloom Atlas Publisher Kit](https://livastic-vm5-primary-20260911.github.io/echobloom-atlas-browser-logic-puzzle-20261020/publisher.html). The starting quotation is **USD 149 equivalent**, with one scoped branding pass and one revision, always **subject to written acceptance and verified legal rights/payout compliance**. This is an invitation to negotiate, not a paid order or a license granted by browsing this page. Actual revenue from this sheet as of publication: **zero**.

The playable game itself remains strictly free of outside-site links, advertising, names, ads SDKs and analytics. The separate publisher page includes original browser QA screenshots and a mailto contact for **genuine funded** editorial/buyer inquiries. No full commercial package is sent before an actual mutually accepted agreement.
