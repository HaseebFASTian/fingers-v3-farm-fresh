# Farm Fresh standalone website

Work in this folder for the Farm Fresh brand website. Local port 5176. Cloudflare Pages project `fingers-v3-farm-fresh`, production branch `main`. GitHub repository `HaseebFASTian/fingers-v3-farm-fresh`.

The corporate homepage is the sibling `v3-final-version` project, with its own deployment `fingers-v3`. Keep changes independent. Corporate Farm Fresh brand-card/footer links lead to this standalone site. Do not edit sibling versions 1/2/3.

Preserve the playful reference layout, expressive typography, curved section boundaries, Farm Fresh logo, supplied product artwork and authoritative product data. The latest approved colour direction is the logo palette: navy blue (`#073a70`), field green (`#19683d`), sunshine yellow (`#fbd154`) and warm cream. Use `src/brand-colors.css` for palette changes. Do not reintroduce decorative pink, purple or lavender UI colours from the earlier reference. Natural strawberry colours and authentic packaging colours are preserved.

Keep the header and complete hero composition together in the opening screen on desktop and mobile: title, mango serving visual, introductory copy and primary action. Hero geometry belongs in `src/hero-layout.css`. Adapt to screen height without clipping content or sacrificing readable text and accessible controls. Stylesheet order is `styles.css`, `brand-colors.css`, then `hero-layout.css`; the last file should not redefine colours. Historical colour-token names in the base stylesheet are compatibility aliases, not instructions to restore the old palette.

Do not invent certifications, testimonials, product claims, prices or pack sizes. Keep enquiries as clearly labelled previews until actual contact channels are provided.

Run `npm run check` and `npm run build` before deployment. Verify desktop and mobile layouts and key interactions. Store all website assets locally; preserve source provenance in docs. Generated originals and screenshots belong in ignored work/.
