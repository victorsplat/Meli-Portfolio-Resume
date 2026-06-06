---
name: meli-styles
description: Meli Portfolio — design system, CSS variables, light/dark theme, Tailwind v4 tokens
---

# Meli Portfolio — Styles

## Overview
Design system do Meli Portfolio: CSS variables customizadas, tema light/dark, Tailwind v4 tokens, e componentes estilizados.

## When to Use
- Estilizar novo componente
- Usar cores do tema (light/dark)
- Adicionar variante de tema
- Criar componente com animação

## Core Process

### 1. CSS Variables (Design Tokens)
```css
/* src/style/styles.css */
:root {
  --accent: #2D3277;
  --accent-hover: #3D47A0;
  --bg-app: #f4f4f7;
  --bg-hero: #ebebed;
  --bg-card: #ffffff;
  --text-main: #111827;
  --text-secondary: #4B5563;
  --border: #E5E7EB;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
}

[data-theme="dark"] {
  --accent: #FFE600;
  --accent-hover: #FFD700;
  --bg-app: #212630;
  --bg-hero: #121b29;
  --bg-card: #2A303C;
  --text-main: #f9fafb;
  --text-secondary: #9CA3AF;
  --border: #374151;
  --shadow: 0 1px 3px rgba(0,0,0,0.3);
}
```

### 2. Tailwind v4 Theme
```css
@import "tailwindcss";

@theme {
  --color-accent: var(--accent);
  --color-bg-app: var(--bg-app);
  --color-text-main: var(--text-main);
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Fira Code', monospace;
}
```
- Usar `--color-*` prefix para Tokens de cor do Tailwind v4
- Variáveis CSS para valores dinâmicos (theme switching)
- `@theme` define o design system sem `tailwind.config.js`

### 3. Theme Toggle
```jsx
// src/lib/useTheme.js
// Lê classe DOM no init (blocking script previne flash)
// Persiste por dispositivo via localStorage

function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
```
- Blocking script no `<head>` para prevenir flash
- Persistência: localStorage + classe no `<html>`

### 4. Component Patterns
```jsx
// Card component
<div className="bg-[var(--bg-card)] shadow-[var(--shadow)] rounded-xl p-6
                hover:shadow-lg transition-shadow duration-300">
</div>

// Gradient accent text
<h2 className="text-[var(--accent)] font-bold">
  {t('section.title')}
</h2>

// Glassmorphism (gallery)
<div className="backdrop-blur-md bg-white/10 dark:bg-black/10 border
                border-white/20 rounded-2xl">
</div>
```

### 5. Animations (Framer Motion)
```jsx
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

<motion.div
  variants={variants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
  {children}
</motion.div>
```
- Staggered entrance em listas
- Card hover lift (`y: -4`)
- Skeleton loading shimmer
- Dot pattern parallax no hero

### 6. Tipografia
```css
h1 { @apply text-4xl md:text-5xl font-bold; }
h2 { @apply text-2xl md:text-3xl font-semibold; }
h3 { @apply text-xl font-semibold; }
body { @apply text-base leading-relaxed; }
```
- Inter para corpo e títulos
- Fira Code para código
- Escala tipográfica consistente

## Common Rationalizations
- *"Vou usar cor hardcoded no componente"* → Sempre usar variável CSS; tema fica inconsistente com cores fixas
- *"Vou fazer tema só com Tailwind dark:"* → Variáveis CSS + data-theme é mais flexível para temas customizados
- *"Vou colocar todas as animações no componente"* → Extrair variants para `src/style/animations.js` centraliza e reutiliza

## Red Flags
- Cor hardcoded que deveria ser variável CSS
- Tema quebrado em um dos modos (light ou dark não testado)
- Animação sem `prefers-reduced-motion` respect
- CSS duplicado entre componentes
- Fonte carregada sem `font-display: swap`
- Tamanho de fonte sem escala (11px, 13px, 17px inconsistentes)

## Verification
- Light/dark toggle funcional sem flash
- Cores consistentes entre páginas
- Tailwind purge: sem classes não utilizadas no bundle
- Animações suaves (60fps no DevTools)
- Acessibilidade: contraste 4.5:1 em ambos os temas
