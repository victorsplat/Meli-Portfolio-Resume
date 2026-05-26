# Meli Portfolio — Project Context

## Tech Stack
- **Framework**: Next.js 16 (Turbopack), React 18
- **Styling**: Tailwind CSS v4 + custom CSS (`src/style/styles.css`)
- **Animation**: Framer Motion
- **Charts**: Recharts 3.x (`src/components/Skills.jsx`)
- **Icons**: react-icons (Io5, Fa, Tb, Si)
- **Lottie**: @lottiefiles/dotlottie-react
- **Database**: MongoDB Atlas via `src/lib/mongodb.js`
- **i18n**: Custom `I18nProvider` in `src/lib/i18n.js` (EN, ES, PT)
- **Build**: `npm run build` — clean build, no lint errors

## Project Structure
```
src/
├── app/
│   ├── layout.jsx          — Root layout with theme-blocking script
│   ├── page.jsx            — Home page (imports Home from pages/)
│   ├── api/
│   │   ├── gallery/route.js       — CRUD for gallery images (auth required for POST/DELETE)
│   │   ├── gallery/auth/route.js  — Dedicated admin auth endpoint
│   │   ├── gallery/proxy/route.js — Private Blob image proxy
│   │   ├── gallery/migrate/route.js — Base64 to Blob migration
│   │   ├── gallery/contact/route.js — Contact form submission
│   │   └── applications/route.js   — Job application submission
│   ├── gallery/page.jsx           — Public gallery (loading skeleton)
│   ├── gallery/explore/page.jsx   — 3D circular gallery explore page
│   ├── galleryAdmin/page.jsx      — Admin gallery (login required, upload/delete)
│   └── meli-it-case/page.jsx     — Job application form (CPF/phone/CEP auto-format, validation)
├── components/
│   ├── pages/Home.jsx     — Home page composition
│   ├── Hero.jsx           — Main hero with MELI logo, typewriter, Lottie animation
│   ├── MeliHeroSection.jsx — IT Case hero (fades at 800px scroll)
│   ├── MeliFeaturesSection.jsx
│   ├── MeliRequirementsSection.jsx
│   ├── MeliFooter.jsx
│   ├── About.jsx, TechSection.jsx, Skills.jsx, Projects.jsx, Contact.jsx
│   ├── LanguageSwitcher.jsx, PageHeader.jsx, Providers.jsx
│   ├── GalleryLightbox.jsx, GalleryFooter.jsx
│   └── ui/
│       ├── circular-gallery.jsx       — 3D circular carousel with blur depth-of-field
│       ├── scroll-expansion-hero.jsx  — Scroll-to-expand media hero
│       ├── image-edit-modal.jsx       — Edit image modal
│       └── upload-overlay.jsx         — Upload progress overlay
├── lib/
│   ├── i18n.js            — Translations (en/es/pt)
│   ├── useTheme.js        — Theme toggle + localStorage (reads DOM class on init)
│   ├── usePageTitle.js
│   ├── mongodb.js         — MongoDB client singleton (lazy-init pattern)
│   ├── auth.js            — Bearer token admin auth
│   ├── validate.js        — Server-side validation (CPF, email, phone, CEP, image, application)
│   ├── rateLimit.js       — 20 req/min per IP rate limiter with periodic cleanup
│   ├── blob.js            — Vercel Blob upload and signed URL helpers
│   ├── stores/
│   │   ├── authStore.js   — Zustand auth store with persist
│   │   └── galleryStore.js — Zustand gallery UI state
│   ├── schemas/
│   │   └── gallery.js     — Zod schemas for gallery data
│   └── hooks/
│       └── useGallery.js  — TanStack Query hooks for gallery CRUD
└── style/
    ├── styles.css          — All CSS (Tailwind v4 theme, cards, buttons, form, skeleton)
    ├── DotPattern.jsx      — Animated dot grid background
    ├── BackToTop.jsx
    └── animations.js       — Framer Motion variants
```

## Key Features Implemented
1. **Theme** — Light/dark toggle, persisted per device via localStorage, blocking script prevents flash
2. **i18n** — EN/ES/PT with language switcher in hero and page headers
3. **Gallery** — MongoDB-backed image gallery with admin upload/delete (Bearer token auth), 3D circular explore view
4. **Security** — Admin auth (`ADMIN_API_KEY`), dedicated auth endpoint, rate limiting (20/min with cleanup), input sanitization, CPF/CEP/email validation
5. **IT Case Form** — Application form with auto-formatting (CPF, phone, CEP), field-level format warnings, birthDate with age validation, PCD deficiency conditional field
6. **Animations** — Staggered entrance, card hover lift, skeleton loading, dot pattern parallax, hero typewriter, 3D circular gallery with depth-of-field blur

## Notable CSS Variables (styles.css)
- `--accent`: `#2D3277` (light), `#FFE600` (dark)
- `--bg-app`: `#f4f4f7` (light), `#212630` (dark)
- `--bg-hero`: `#ebebed` (light), `#121b29` (dark)
- `--text-main`: `#111827` (light), `#f9fafb` (dark)

## Environment Variables (.env.local)
Required in Vercel dashboard → Environment Variables:
- `MONGODB_URI` — MongoDB Atlas connection string
- `ADMIN_API_KEY` — Bearer token for gallery admin auth
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob token for image storage

> `.env.local` is gitignored and not loaded by Vercel.

## Known Vercel/Deployment Constraints
- **Vercel ignores `.env.local`** — all secrets must be set in Vercel dashboard
- **Atlas IP whitelist** must include `0.0.0.0/0` for Vercel (dynamic IPs)
- **Client-side Canvas compression** (2000px max, JPEG q0.85) keeps payload under Vercel's 4.5MB serverless body limit
- **Vercel Blob** (`@vercel/blob`) used for image storage — old base64 images in MongoDB remain accessible

## Architecture Decisions

### Image Storage
- Client-side Canvas compression (2000px, JPEG q0.85) before upload
- New uploads → Vercel Blob (private) via `@vercel/blob` `put()`
- Fallback: Sharp WebP re-encode into MongoDB base64
- DELETE also cleans up Blob when URL is a blob URL

### Database
- MongoDB client uses lazy-init pattern (no connection at import time)
- Gallery settings stored as single document in `gallery.settings` collection (upsert)
- Rate limiter: 20 req/min per IP via in-memory Map with periodic cleanup (5 min interval)

### Dynamic Categories
- Categories stored in `settings.categories.items` in MongoDB
- CRUD via dashboard (add/edit/delete/reorder with emoji + i18n names)
- No code changes needed to add categories — loaded from settings at runtime

### Admin Auth
- Zustand store with `persist` middleware (`gallery_admin_token` localStorage key)
- Bearer token auth via `ADMIN_API_KEY` env var
- Dedicated `POST /api/gallery/auth` endpoint for login
- Centralized `getAuthHeaders()` across admin pages

### Gallery (Explore)
- 3D circular carousel with progressive blur depth-of-field
- Only ~5 images visible at a time (configurable `visibleRange`)
- Center image has glow effect; adjacent images progressively blur
- Vignette overlay for cinematic feel

## Session History

### May 10
- Client-side image compression (Canvas, 1200px, JPEG q0.8)
- Sharp server-side re-encoding to WebP q80 with try-catch fallback
- Error logging improved (returns `error.name: error.message`)
- Gallery GET resilience for missing/null `url` field
- TLS error fix: `0.0.0.0/0` in Atlas Network Access
- `.gitignore` updated from `.env` to `.env*`

### May 11
- Gallery page redesign: MELI-branded hero, featured image, stats bar, glass card story section
- Category filter pills (MELI yellow active), varied aspect-ratio grid
- Gallery CMS Dashboard: Edit Hero/About/Footer in EN/ES/PT with LibreTranslate
- Settings API: GET/PUT for `gallery.settings` collection
- Multi-file upload: sequential progress bar, per-file error collection
- i18n `t()` now supports `{param}` interpolation
- Bug fixes: hero visibility, about fallback, dashboard error state

### May 12 — Vercel Blob Migration + Admin UI Redesign
- New uploads stored in Vercel Blob instead of MongoDB base64
- Sharp fallback preserved if Blob unavailable
- Blob cleanup on DELETE
- Admin page: drag-and-drop upload, two-column layout, glassmorphism
- Compression increased to 2000px, JPEG q0.85
- 15MB file limit

### May 16 — Dynamic Categories + Zustand + Zod + TanStack Query Refactor
- `zustand`, `zod` installed. `@tanstack/react-query`, `axios` already present.
- Zod schemas for gallery images, settings, categories, contact
- Zustand auth store centralizes login/logout/getAuthHeaders
- Zustand gallery store for UI state (files, progress)
- TanStack Query hooks: `useGalleryImages`, `useUploadImage`, `useDeleteImage`, `useUpdateSettings`, `useSubmitContact`
- Dynamic categories via `settings.categories.items` — CRUD in dashboard
- All gallery pages refactored to use hooks instead of hardcoded state
- Backwards compatibility for old settings docs without categories

### May 16 (late) — Storage Dashboard, Private Blob Proxy
- Storage tab in dashboard: base64→Blob migration UI per image
- `POST /api/gallery/migrate`: single image migration to private Blob
- `GET /api/gallery/proxy`: proxy for private Blob images
- `src/lib/blob.js`: shared helpers `uploadToBlob()`, `getSignedUrl()`
- `ImageEditModal`, `UploadOverlay`, upload-form-schema in Zod
- Bug fixes: memory leak (revokeObjectURL), compressPending resilience, CircularGallery duplicate key

### May 17 — Planned: Tests + Sentry
- Test gallery: hero, explore, admin, dashboard
- Set up Sentry for error tracking (Next.js SDK)

### May 24 — Critical Bug Fixes + Depth-of-Field Gallery
- Fixed Blob env var name (`GALLERY_RW_TOKEN_READ_WRITE_TOKEN` → `BLOB_READ_WRITE_TOKEN`) across 3 files
- Created dedicated `POST /api/gallery/auth` endpoint for admin login
- Refactored `authStore` to use the auth endpoint instead of faking a POST to gallery
- Added periodic cleanup interval to rate limiter (prevents Map memory leak)
- Removed dead code `generateAdminToken()` from `auth.js` (security risk)
- Replaced full-visibility CircularGallery with depth-of-field blur variant:
  - Only ~5 images visible at a time (configurable via `visibleRange`)
  - Progressive CSS blur simulating camera depth-of-field
  - Center image glow with accent color
  - Dark vignette + ambient glow overlays for cinematic feel
  - Performance: invisible items skip GPU compositing via `opacity: 0`
