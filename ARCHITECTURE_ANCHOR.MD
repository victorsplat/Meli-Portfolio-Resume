# Architecture Anchor

> Ponte entre este projeto e o repositório de estudos AGENTStudies.
> Versionado — contém apenas metadados públicos e pendências arquiteturais.

## Projeto
- **Nome:** MeliPortfolio
- **Stack:** Next.js 16 + React 18 + MongoDB + Vercel Blob + Tailwind v4
- **Estudos:** `../AGENTStudies/Mockups/Projects/MeliPortfolio/`
- **Última sincronização:** 31/05/2026

## Decisões Ativas
| Decisão | Status | Data |
|---------|--------|------|
| Imagens em Vercel Blob privado com proxy `api/gallery/proxy` | ✅ Ativa | 12/05 |
| Fallback Sharp WebP em base64 MongoDB | ✅ Ativa | 10/05 |
| Categorias dinâmicas via `settings.categories.items` no MongoDB | ✅ Ativa | 16/05 |
| Auth admin via Bearer token + Zustand persist | ✅ Ativa | 24/05 |
| Rate limiter 20 req/min com cleanup periódico | ✅ Ativa | 24/05 |
| Scroll-to-expand hero com Framer Motion | ⚠️ Bug | 31/05 |
| Galeria 3D circular com depth-of-field blur | ✅ Ativa | 24/05 |
| Client-side Canvas compressão (2000px, JPEG q0.85) | ✅ Ativa | 12/05 |

## Pendências de Arquitetura
- [ ] scroll-expansion-hero: remover `e.preventDefault()` indevido que trava scroll após expansão
- [ ] scroll-expansion-hero: adicionar `unoptimized` no `<Image>` do Next.js para URLs de Blob
- [ ] scroll-expansion-hero: corrigir dependências do useEffect (stale closure em scrollProgress)
- [ ] gallery/page.jsx: tornar `pickHeroImage()` null-safe para evitar crash em `undefined.url`
- [ ] circular-gallery.jsx: adicionar `onError` + `loading="lazy"` no `<img>`

## Notas
Projeto pessoal usado como portfolio para candidatura a vaga de dev no Mercado Livre.
