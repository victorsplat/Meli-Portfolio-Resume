<div align="center">
  <img src="https://http2.mlstatic.com/frontend-assets/ui-navigation/5.19.1/mercadolibre/logo__large_plus.png" alt="Mercado Livre" height="40"/>

  <h1 align="center" style="font-family: 'Poppins', sans-serif; font-weight: 700; color: #2D3277;">
    Meli Portfolio & Resume
  </h1>

  <p align="center" style="font-family: 'Poppins', sans-serif; font-size: 1.1rem; color: #555;">
    A full-stack portfolio built with <strong>Next.js 16</strong>, applying for developer roles at <strong>Mercado Livre</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16"/>
    <img src="https://img.shields.io/badge/React-18-58c4dc?style=flat-square&logo=react" alt="React 18"/>
    <img src="https://img.shields.io/badge/Tailwind-FFF4B8?style=flat-square&logo=tailwindcss&labelColor=2D3277" alt="Tailwind CSS"/>
    <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb" alt="MongoDB Atlas"/>
    <img src="https://img.shields.io/badge/Vercel-Blob-000?style=flat-square&logo=vercel" alt="Vercel Blob"/>
    <img src="https://img.shields.io/badge/i18n-EN%20%7C%20ES%20%7C%20PT-FFF4B8?style=flat-square&labelColor=2D3277" alt="i18n"/>
    <img src="https://img.shields.io/badge/license-MIT-FFE600?style=flat-square" alt="License MIT"/>
  </p>
</div>

---

## ✨ Features

| | |
|---|---|
| 🌓 **Dark/Light Theme** | Persistent per device, no flash on load |
| 🌐 **i18n** | English, Español, Português — switchable on the fly |
| 🖼️ **Image Gallery** | MongoDB-backed, admin upload/delete with auth |
| 📷 **Canvas Compression** | 2000px max, JPEG q0.85 — stays under Vercel's 4.5MB limit |
| ☁️ **Vercel Blob** | Private image storage with signed URLs |
| 📝 **IT Case Form** | CPF/phone/CEP auto-format, birthDate validation, dynamic PCD field |
| 🛡️ **Security** | Bearer token auth, rate limiting (20/min), input sanitization |
| ⚡ **Animations** | Framer Motion — staggered entrances, card hover lift, typewriter hero |
| 📊 **Skills Radar** | Recharts interactive chart |

## 🛠️ Tech Stack

```
Framework   Next.js 16 (Turbopack)
Frontend    React 18, Tailwind CSS v4, Framer Motion
Database    MongoDB Atlas
Storage     Vercel Blob (private) + Sharp WebP fallback
Icons       react-icons, Lottie (@lottiefiles/dotlottie-react)
Charts      Recharts 3.x
State       Zustand + TanStack Query
Validation  Zod
Auth        Bearer token (ADMIN_API_KEY)
i18n        Custom provider (EN, ES, PT)
```

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.jsx              Root layout
│   ├── page.jsx                Home
│   ├── api/gallery/            Gallery CRUD
│   ├── api/gallery/settings/   Gallery settings
│   ├── api/gallery/migrate/    Base64 → Blob migration
│   ├── api/gallery/proxy/      Private Blob proxy
│   ├── api/applications/       Job applications
│   ├── gallery/                Public gallery
│   ├── galleryAdmin/           Admin dashboard
│   └── meli-it-case/           Application form
├── components/
│   ├── pages/Home.jsx          Page composition
│   ├── Hero.jsx, About.jsx     Sections
│   ├── MeliHeroSection.jsx     IT Case hero
│   ├── MeliFeaturesSection.jsx
│   ├── MeliRequirementsSection.jsx
│   ├── MeliFooter.jsx
│   ├── Skills.jsx, Projects.jsx, Contact.jsx
│   ├── LanguageSwitcher.jsx
│   ├── GalleryLightbox.jsx
│   ├── ImageEditModal.jsx
│   └── UploadOverlay.jsx
├── lib/
│   ├── i18n.js                 Translations
│   ├── mongodb.js              MongoDB client (lazy)
│   ├── auth.js                 Bearer token
│   ├── validate.js             Server validation
│   ├── blob.js                 Blob helpers
│   ├── rateLimit.js            20 req/min per IP
│   ├── stores/                 Zustand stores
│   ├── hooks/                  TanStack Query hooks
│   └── schemas/                Zod schemas
└── style/
    ├── styles.css              Tailwind v4 + custom CSS
    ├── DotPattern.jsx          Animated background
    ├── animations.js           Framer Motion variants
    └── BackToTop.jsx
```

## 🚀 Getting Started

```bash
# Install
npm install

# Development
npm run dev

# Build
npm run build

# Lint
npm run lint
```

### Environment Variables

Create `.env.local` (gitignored):

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/
ADMIN_API_KEY=your-secret-key
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

> Set these in **Vercel dashboard → Environment Variables** for deployment.

## 🌐 i18n

Translations live in `src/lib/i18n.js`. Three languages:

| Code | Language |
|------|----------|
| `en` | English (default) |
| `es` | Español |
| `pt` | Português |

Usage: `t("key")` returns translated string. Supports `{param}` interpolation.

## 🖼️ Gallery Architecture

```
Upload Flow:
  Client → Canvas (2000px, JPEG q0.85) → Vercel Blob (private) → MongoDB (URL + metadata)

Fallback:
  Client → Sharp WebP q80 → MongoDB (base64)

View:
  MongoDB → getSignedUrl() → Gallery UI
```

## 🔐 Admin Auth

- Zustand store with `persist` middleware
- Bearer token via `ADMIN_API_KEY`
- Centralized `getAuthHeaders()` across admin pages

## 🧩 OpenCode

This project includes configs for [opencode](https://opencode.ai):

| Agent | Model | Purpose |
|-------|-------|---------|
| `plan` | DeepSeek R1 | Architecture planning |
| `fast` | Gemini 2.5 Flash | Quick tasks |
| `explore` | Gemini 2.5 Flash | Code search |

## 📄 License

MIT — feel free to use as inspiration for your own portfolio.

---

<div align="center">
  <sub style="font-family: 'Poppins', sans-serif; color: #888;">
    Built with 💛 for Mercado Livre
  </sub>
</div>
