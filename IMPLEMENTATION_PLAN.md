# Plano de Implementação — Galeria MeliPortfolio (P1–P7)

## Contexto

Repositório: `/home/victorprado/Área de trabalho/Code Projects/MELI/Meli-Portfolio-Resume`

---

## P1 — Landing Scroll Não Funciona (scroll-expansion-hero.tsx)

### Causa Raiz
`scroll-expansion-hero.tsx:49-69` usa `handleWheel` no `window` com `e.deltaY * 0.0009` para controlar expansão progressiva. Três problemas:
1. **Sem body scroll lock** — `window` continua scrollável, conflitando com o wheel handler
2. **Sem reversão** — `expanded && e.deltaY < 0` permite encolher, mas sem transição suave
3. **Escala ruim** — `deltaY * 0.0009` exige ~1100px de scroll para 100% (pouco responsivo)

### Plano
```tsx
// scroll-expansion-hero.tsx
useEffect(() => {
  document.body.style.overflow = 'hidden'; // lock body scroll
  document.body.style.height = '100dvh';   // kill page scroll
  return () => {
    document.body.style.overflow = '';
    document.body.style.height = '';
  };
}, []);

// Em handleWheel, aumentar deltaY * 0.002 (2.2x mais responsivo)
// handleTouchMove: deltaY * 0.02 (touch)
// Reversão: smooth transition via setScrollProgress
```

### Arquivos
- `src/components/ui/scroll-expansion-hero.tsx`
- `src/app/gallery/page.tsx` (passa `bgImageSrc` e `postScrollBg`)

---

## P2 — Background Zoom Excessivo na Landing

### Causa Raiz
`gallery/page.tsx:39-41`:
```tsx
const bgImage = pickHeroImage(1);  // pode ser mesma img que mediaImage
const postScrollBg = pickHeroImage(2);
```
Se não há imagens suficientes, `bgImage` e `mediaImage` podem ser a mesma — daí o zoom é efeito de `object-fit: cover` com a mesma imagem em dois lugares.

### Plano
1. Garantir `pickHeroImage` nunca retorna imagem já usada
2. Em `scroll-expansion-hero.tsx:154-160`: `bgImage` com `object-fit: cover` e `objectPosition: 'center'`, mesma imagem em `bg` e `postScrollBg` se só há uma disponível (evitar duplicação que causa "zoom" visual)
3. Remover o layer extra se `postScrollBg.url === bgImage.url`

### Arquivos
- `src/app/gallery/page.tsx`
- `src/components/ui/scroll-expansion-hero.tsx`

---

## P3 — Carrossel 3D Quebrado (circular-gallery.tsx + explore/page.tsx)

### Causa Raiz
Duas camadas de `overflow: hidden` cortam os cards projetados pelo `perspective: 1200px` + `rotateY()`:

1. **`circular-gallery.tsx:290`**: `className="overflow-hidden"` no container do carrossel
2. **`explore/page.tsx:113`**: `<div className="h-screen overflow-hidden">` no wrapper da página
3. **`explore/page.tsx:169`**: `<div className="overflow-hidden">` no wrapper interno
4. O `h-screen` nas divs pai (`line 113`) também limita altura

O `rotateY()` projeta os cards laterais *fora* do bounding box, e `overflow: hidden` recorta tudo.

### Plano
```
circular-gallery.tsx:290 — `overflow-hidden` → `overflow-visible`
explore/page.tsx:113 — `h-screen overflow-hidden` → `relative w-full overflow-x-hidden overflow-y-auto` (scroll vertical)
explore/page.tsx:169 — `overflow-hidden` → `overflow-visible`
explore/page.tsx:176 — adicionar `className="!overflow-visible"`
```
Garantir que o `perspective` seja alto o suficiente (já está `1200px`, `radius=500` → ~600px de profundidade, dentro de 1200px).

### Arquivos
- `src/components/ui/circular-gallery.tsx`
- `src/app/gallery/explore/page.tsx`

---

## P4 — Fallback SVG Não Aparece

### Causa Raiz
`public/fallback-image.svg` (116 linhas) usa CSS `@keyframes` dentro de `<style>`. Quando carregado como `<img src="...">`, navegadores não executam CSS animations de SVGs externos por segurança (CSS pode ser bloqueado por Content Security Policy).

### Plano
**Opção A (recomendada)**: Converter animações CSS para SVG `<animate>`/`<animateTransform>` nativos:

```xml
<circle class="ring-outer" cx="150" cy="150" r="110" ...>
  <animateTransform attributeName="transform" type="rotate"
    from="0 150 150" to="360 150 150" dur="4s"
    repeatCount="indefinite" />
</circle>
```

**Opção B**: Criar fallback estático (sem animação) mais simples e confiável.

### Arquivos
- `public/fallback-image.svg`

---

## P5 — Background da Explore Page Sem Graça

### Causa Raiz
`explore/page.tsx:113`: só `<div className="h-screen bg-bg-app overflow-hidden">` — fundo sólido sem textura.

### Plano
Adicionar gradient mesh usando paleta Meli (`#2D3277`, `#585FD9`, `#41468B`):

```tsx
// explore/page.tsx
<div
  className="fixed inset-0 z-0 pointer-events-none"
  style={{
    background: `
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(88,95,217,0.15) 0%, transparent 60%),
      radial-gradient(ellipse 50% 50% at 80% 80%, rgba(65,70,139,0.12) 0%, transparent 50%),
      radial-gradient(ellipse 50% 50% at 20% 80%, rgba(45,50,119,0.15) 0%, transparent 50%)
    `
  }}
/>
```

### Arquivos
- `src/app/gallery/explore/page.tsx`

---

## P6 — Botão Auto-Rotate na Explore

### Causa Raiz
`circular-gallery.tsx:118` define `autoRotateSpeed = 0.01` como padrão. Sem interface para o usuário controlar.

### Plano
1. Adicionar estado `isAutoRotating` em `CircularGallery`
2. Renderizar botão "projector" (ícone de seta circular) no canto inferior esquerdo
3. `autoRotateSpeed=0` → para rotação
4. Estado inicial: OFF (`autoRotateSpeed=0`) — usuário ativa manualmente

```tsx
// circular-gallery.tsx
const [isAutoRotating, setIsAutoRotating] = useState(false);

// Botão projector
<button onClick={() => setIsAutoRotating(!isAutoRotating)} ...>
  {isAutoRotating ? '⏹' : '🔄'}
</button>

// No loop tick: usar autoRotateSpeedRef apenas se isAutoRotating
if (isIdleRef.current && isAutoRotating) { ... }
```

### Arquivos
- `src/components/ui/circular-gallery.tsx`

---

## P7 — Dashboard Multi-Select (galleryAdmin)

### Causa Raiz
`galleryAdmin/page.tsx` só permite editar/deletar uma imagem por vez (via `ImageEditModal`). API `PUT` e `DELETE` em `api/gallery/route.ts` só aceitam `id` único (query param).

### Plano

**Frontend (galleryAdmin/page.tsx)**:
1. Estado `selectedIds: Set<string>` — checkboxes nas imagens
2. Botão "Edit Selected (n)" — abre modal com fields (categoria, featured, title batch)
3. Botão "Delete Selected (n)" — confirmação + loop de deleções

**API (api/gallery/route.ts)**:
```ts
// PUT — aceitar ids[] no body, aplicar batch update
// DELETE — aceitar ids[] no body, deletar múltiplos
```

**Hooks (useGallery.ts)**:
```ts
export function useBatchUpdate() { ... }  // mutationFn({ ids, updates })
export function useBatchDelete() { ... }  // mutationFn({ ids })
```

### Arquivos
- `src/app/galleryAdmin/page.tsx`
- `src/app/api/gallery/route.ts`
- `src/hooks/useGallery.ts`

---

## Ordem de Implementação

1. **P3** → Carrossel 3D (mais crítico, visual quebrado)
2. **P1** → Scroll landing (funcionalidade quebrada)
3. **P5** → Background explore (fácil, impacto visual alto)
4. **P6** → Auto-rotate toggle (fácil, melhoria UX)
5. **P4** → Fallback SVG (testar, pode ser simples)
6. **P2** → Background zoom (depende de P1)
7. **P7** → Dashboard multi-select (mais complexo, maior risco de regressão)

---

## Scripts

```bash
# Review do plano
opencode-review-run "revise o plano de implementação IMPLEMENTATION_PLAN.md"

# Verificar lint antes de commit
npm run lint

# Build
npm run build

# Deploy
npm run build && git add -A && git commit && git push
```
