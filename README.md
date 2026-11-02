# Farm Fresh

Standalone Farm Fresh brand website, connected to the corporate 5 Fingers V3 homepage.

- Production: https://fingers-v3-farm-fresh.pages.dev/
- Corporate site: https://fingers-v3.pages.dev/
- Repository: https://github.com/HaseebFASTian/fingers-v3-farm-fresh
- Local preview: http://127.0.0.1:5176/

## Development

Static HTML, CSS and JavaScript modules; no runtime dependencies. Node.js 20 or later.

```sh
npm run dev
npm run check
npm run build
```

Build output is `dist/`. Deploy to Cloudflare Pages project `fingers-v3-farm-fresh`, branch `main`. This project is independent of all corporate website versions.

## Content and design

The client supplied the Milky Mix reference image for playful typography, large serving imagery, curved section boundaries and mobile composition. The final colour direction comes from the Farm Fresh logo: navy blue (`#073a70`), field green (`#19683d`), sunshine yellow (`#fbd154`) and warm cream. Decorative UI colours must follow this palette; natural food colours and the approved packaging artwork remain unchanged. Achha e-Mart (https://achhaemart.com/) informed product-category navigation and the longer catalogue/brand-content sequence. No competitor prices, discounts, testimonials, certifications or delivery promises have been copied.

The opening composition is designed to fit within one screen on desktop and mobile, keeping the header, Farm Fresh title, serving visual, introduction and primary action together. The current hero uses mango yogurt imagery. Preserve readable text, complete product artwork and accessible controls when adapting the composition to short screens or enlarged text.

Stylesheets load in this order: `src/styles.css` supplies the shared layout, `src/brand-colors.css` supplies the authoritative logo palette, and `src/hero-layout.css` controls the opening composition. Historical token and class names such as `--purple`, `--pink` and `.pink-text` are compatibility aliases; they resolve to the current blue, yellow and green palette and do not define the design direction.

The page includes a hero, a six-item favourites carousel, yogurt serving banner, brand introduction, five categories, full 20-product catalogue, cheese spotlight, brand story, three expandable serving ideas, business enquiries, five FAQs and a contact section.

Product data is the approved Farm Fresh subset from the final 5 Fingers catalogue and supplied packaging sheets. Every product retains its source reference and corresponding pack illustration. Unspecified pack weights remain an enquiry item. Catalogue illustrations may vary from a particular pack's actual packaging.

The enquiry form is deliberately a local preview/download workflow. It does not send messages or accept orders or payments. Connect verified corporate contact details and a submission service before enabling actual sending.

## Assets

All assets are stored locally. Existing approved Farm Fresh logo and 20 product illustrations were copied from the corporate final version. Dedicated serving visuals were created for this site, including the current mango hero, the yogurt pairing and the breakfast scene. Prompts and provenance, including the earlier strawberry hero, are in `docs/visual-assets.json`. Source PNGs are retained locally in ignored `work/generated/`.

Serving images are illustrative compositions. Original product naming and brand identity are retained. Supporting food photographs are existing generated 5 Fingers serving images. Typography: Chewy (Apache license) and Outfit (OFL), with licenses in `public/fonts/`.

## Checks

`npm run check` validates the product data, local assets, internal anchors, essential controls and JavaScript syntax. Browser QA covers desktop/mobile overflow, menu, filters/search, unknown-weight packs, product selection and the enquiry preview. Native dialogs support keyboard focus and Escape; reduced motion is respected.
