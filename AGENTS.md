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
│   │   ├── gallery/route.js     — CRUD for gallery images (auth required for POST/DELETE)
│   │   └── applications/route.js — Job application submission
│   ├── gallery/page.jsx         — Public gallery (loading skeleton)
│   ├── galleryAdmin/page.jsx    — Admin gallery (login required, upload/delete)
│   └── meli-it-case/page.jsx   — Job application form (CPF/phone/CEP auto-format, validation)
├── components/
│   ├── pages/Home.jsx     — Home page composition
│   ├── Hero.jsx           — Main hero with MELI logo, typewriter, Lottie animation
│   ├── MeliHeroSection.jsx — IT Case hero (fades at 800px scroll)
│   ├── MeliFeaturesSection.jsx
│   ├── MeliRequirementsSection.jsx
│   ├── MeliFooter.jsx
│   ├── About.jsx, TechSection.jsx, Skills.jsx, Projects.jsx, Contact.jsx
│   ├── LanguageSwitcher.jsx, PageHeader.jsx, Providers.jsx
│   └── GalleryLightbox.jsx
├── lib/
│   ├── i18n.js            — Translations (en/es/pt)
│   ├── useTheme.js        — Theme toggle + localStorage (reads DOM class on init)
│   ├── usePageTitle.js
│   ├── mongodb.js         — MongoDB client singleton
│   ├── auth.js            — Bearer token admin auth
│   ├── validate.js        — Server-side validation (CPF, email, phone, CEP, image, application)
│   └── rateLimit.js       — 20 req/min per IP rate limiter
└── style/
    ├── styles.css          — All CSS (Tailwind v4 theme, cards, buttons, form, skeleton)
    ├── DotPattern.jsx      — Animated dot grid background
    ├── BackToTop.jsx
    └── animations.js       — Framer Motion variants
```

## Key Features Implemented
1. **Theme** — Light/dark toggle, persisted per device via localStorage, blocking script prevents flash
2. **i18n** — EN/ES/PT with language switcher in hero and page headers
3. **Gallery** — MongoDB-backed image gallery with admin upload/delete (Bearer token auth)
4. **Security** — Admin auth (`ADMIN_API_KEY`), rate limiting (20/min), input sanitization, CPF/CEP/email validation
5. **IT Case Form** — Application form with auto-formatting (CPF: `000.000.000-00`, phone: `(11) 99999-9999`, CEP: `00000-000`), field-level format warnings, birthDate with age validation, PCD deficiency conditional field
6. **Animations** — Staggered entrance, card hover lift, skeleton loading, dot pattern parallax, hero typewriter

## Notable CSS Variables (styles.css)
- `--accent`: `#2D3277` (light), `#FFE600` (dark)
- `--bg-app`: `#f4f4f7` (light), `#212630` (dark)
- `--bg-hero`: `#ebebed` (light), `#121b29` (dark)
- `--text-main`: `#111827` (light), `#f9fafb` (dark)

## Pending / Known Issues
- (none currently tracked)

## Environment Variables (.env.local)
```
MONGODB_URI=...
ADMIN_API_KEY=meli-admin-2024-secure-key
```
