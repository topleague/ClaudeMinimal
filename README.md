# topleague-minimalist-wp

The `minimalist` design (Astro + Tailwind v4, editorial/spare aesthetic,
light/dark mode) wired up to pull live content from your WordPress site via
WPGraphQL — same bridge used in `astro-medical-starter`.

## What's different from the original `minimalist` repo

- Removed the local markdown "work" portfolio system (content collections,
  `/work` pages, `WorkRow.astro`).
- Added `src/lib/wordpress.js` — the WordPress GraphQL fetch functions,
  copied unchanged from your working `astro-medical-starter` repo.
- `src/pages/index.astro` now lists your 5 most recent WordPress posts
  instead of local "work" entries.
- `src/pages/[...uri].astro` — new catch-all route that renders WordPress
  posts, pages, and category/tag archives, styled with minimalist's design
  tokens (`--paper`, `--ink`, `--signal`, etc.) instead of writing new CSS.
- `src/components/Header.astro` now pulls its nav links live from
  WordPress's block-theme Navigation block (`getNavigationMenu()`), with a
  safe hardcoded fallback (`Home`, `About`) if that menu is ever empty or
  unreachable — so a missing WordPress menu can never fail the build again.
- `src/components/PostRow.astro` — new component, same visual design as the
  original `WorkRow.astro`, adapted for WordPress post data.

## Before you deploy

1. Open `src/lib/wordpress.js` and confirm the URL at the top matches your
   site: `https://susanta.com/graphql`.
2. Open `src/site.config.ts` and edit `SITE.name`, `SITE.role`,
   `SITE.tagline`, `SITE.description`, and `SITE.email` to your own copy.
3. In WordPress, make sure a Navigation block exists with the slug
   `header-navigation` (Appearance → Editor → Navigation) if you want a
   live nav menu — otherwise the site falls back to Home/About links
   automatically, so this step is optional.

## Deploy

Push this folder to a new GitHub repo, then connect it to Cloudflare Pages
the same way your other projects are connected:
- Build command: `npm run build`
- Output directory: `dist`

