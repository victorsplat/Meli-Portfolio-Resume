---
name: meli-gallery
description: Meli Portfolio — image gallery, Blob storage, admin auth, dynamic categories, 3D explore
---

# Meli Portfolio — Gallery

## Overview
Sistema de galeria de imagens do Meli Portfolio: upload/download, Vercel Blob storage, admin auth, categorias dinâmicas, visualização 3D.

## When to Use
- Implementar ou modificar funcionalidade da galeria
- Gerenciar upload/imagens
- Configurar categorias
- Melhorar experiência de visualização

## Core Process

### 1. Image Storage Architecture
```
Upload flow:
1. Client: Canvas compression (2000px, JPEG q0.85)
2. Client → POST /api/gallery (formData com imagem)
3. Server: uploadToBlob(file) via @vercel/blob put()
4. MongoDB: salva { url (blob), alt, category, metadata }
5. Retorna: image object com URL do blob

Display flow:
1. GET /api/gallery (público, sem auth)
2. Para imagens privadas: GET /api/gallery/proxy/:id
3. Client renderiza com loading skeleton

Delete flow:
1. Admin: DELETE /api/gallery/:id (Bearer token)
2. Server: deleta do Blob + MongoDB
```

### 2. API Endpoints
| Method | Endpoint | Auth | Descrição |
|---|---|---|---|
| GET | `/api/gallery` | Não | Listar imagens (público) |
| POST | `/api/gallery` | Bearer | Upload imagem |
| DELETE | `/api/gallery/:id` | Bearer | Deletar imagem |
| POST | `/api/gallery/auth` | Não | Login admin (Bearer) |
| GET | `/api/gallery/proxy/:id` | Não | Proxy imagem privada |
| POST | `/api/gallery/migrate` | Bearer | Migrar base64→Blob |
| POST | `/api/gallery/contact` | Não | Formulário de contato |

### 3. Admin Auth
```jsx
// Zustand store com persist (localStorage)
const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      login: async (password) => {
        const res = await fetch('/api/gallery/auth', {
          method: 'POST',
          body: JSON.stringify({ password })
        });
        if (res.ok) set({ token: (await res.json()).token });
      }
    }),
    { name: 'gallery_admin_token' }
  )
);
```
- `ADMIN_API_KEY` no servidor (env var)
- Bearer token em toda request admin
- Centralizado: `getAuthHeaders()` helper

### 4. Dynamic Categories
```json
// MongoDB: gallery.settings
{
  "categories": {
    "items": [
      { "id": "cat_1", "name": { "en": "Photos", "es": "Fotos", "pt": "Fotos" }, "emoji": "📸" },
      { "id": "cat_2", "name": { "en": "Art", "es": "Arte", "pt": "Arte" }, "emoji": "🎨" }
    ]
  }
}
```
- CRUD via dashboard admin
- Nomes i18n (EN/ES/PT)
- Ordenação customizável (drag-and-drop)
- Filtro pills na galeria pública

### 5. 3D Circular Gallery (Explore)
```jsx
function CircularGallery({ images }) {
  // Depth-of-field: ~5 imagens visíveis
  // Centro: glow efeito
  // Adjacentes: blur progressivo
  // Performance: opacity: 0 esconde não visíveis
}
```
- `visibleRange` configurável (default 5)
- Blur CSS progressivo simulando profundidade de campo
- Vignette overlay para efeito cinematográfico
- Scroll/touch navigation

### 6. Rate Limiting
```js
// 20 req/min por IP
// Periodic cleanup a cada 5 min (Map memory leak prevention)
```
- Implementado em `src/lib/rateLimit.js`
- Aplica-se a todos os endpoints da API
- Cleanup automático via `setInterval`

### 7. Server-Side Validation
```js
// src/lib/validate.js
CPF validation (algorithm)
CEP validation (format + existence)
Email validation (format + domain)
Phone validation (Brazilian format)
Image validation (type, size, dimensions)
```
- Zod schemas em `src/lib/schemas/gallery.js`
- Server-side sempre (client-side é bônus)

## Common Rationalizations
- *"Vou guardar imagem no MongoDB como string"* → Base64 em MongoDB escala mal; Vercel Blob é mais performático e barato
- *"Vou fazer upload sem compressão"* → Canvas compression evita limite 4.5MB da Vercel e melhora UX
- *"Categoria fixa no código é mais simples"* → Categorias dinâmicas permitem ao admin gerenciar sem deploy

## Red Flags
- Imagem sem `alt` text (acessibilidade)
- Upload sem validação de tipo/tamanho
- Blob URL exposta sem proxy (dá acesso direto)
- Categoria deletada com imagens referenciando (orphan)
- Proxy sem cache (requisição repetida ao Blob)
- Memory leak no rate limiter (cleanup periódico obrigatório)

## Verification
- Upload: imagem comprimida, salva no Blob, metadata no MongoDB
- Gallery pública: carrega imagens com skeleton loading
- Admin dashboard: login, upload, delete, editar categorias
- Explore view: 3D circular funcional com blur depth-of-field
- Proxy: imagens privadas servidas corretamente
- Rate limit: 20 req/min, 429 após exceder
