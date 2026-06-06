---
name: meli-i18n
description: Meli Portfolio — i18n EN/ES/PT, I18nProvider, t() function, interpolation
---

# Meli Portfolio — i18n

## Overview
Internacionalização do Meli Portfolio: 3 idiomas (EN, ES, PT), provider customizado, função `t()` com interpolação de parâmetros.

## When to Use
- Adicionar texto multilíngue em componente
- Criar nova chave de tradução
- Adicionar novo idioma
- Usar `t()` com parâmetros dinâmicos

## Core Process

### 1. Estrutura de Traduções
```js
// src/lib/i18n.js
const translations = {
  en: {
    hero: { title: "Hi, I'm Meli", subtitle: "Full Stack Developer" },
    gallery: { title: "Gallery", empty: "No images yet" }
  },
  es: {
    hero: { title: "Hola, soy Meli", subtitle: "Desarrolladora Full Stack" },
    gallery: { title: "Galería", empty: "Sin imágenes todavía" }
  },
  pt: {
    hero: { title: "Olá, sou Meli", subtitle: "Desenvolvedora Full Stack" },
    gallery: { title: "Galeria", empty: "Nenhuma imagem ainda" }
  }
};
```

### 2. Provider e Hook
```jsx
// I18nProvider no root layout
<LocaleProvider locale="pt">
  <App />
</LocaleProvider>

// Uso em componentes
function Hero() {
  const { t, locale, setLocale } = useLocale();
  return <h1>{t('hero.title')}</h1>;
}
```

### 3. Key Naming Convention
```
domínio.seção.subseção
ex: hero.title, gallery.empty, contact.form.name
```
- Sempre aninhado por domínio (hero, gallery, contact, about, skills)
- Último segmento descreve o conteúdo
- Keys únicas por domínio (não repetir `title` em domínios diferentes)

### 4. Parameter Interpolation
```js
// Definição
en: { greeting: "Welcome, {name}! You have {count} messages" }

// Uso
t('greeting', { name: 'Meli', count: 3 })
// → "Welcome, Meli! You have 3 messages"
```

### 5. Adicionar Novo Idioma
1. Criar objeto no `translations` em `src/lib/i18n.js`
2. Adicionar flag/selector no `LanguageSwitcher`
3. Traduzir todas as chaves existentes
4. SEO: `hreflang` no layout (se aplicável)

### 6. Language Switcher
```jsx
// src/components/LanguageSwitcher.jsx
<button onClick={() => setLocale('en')}>🇺🇸 EN</button>
<button onClick={() => setLocale('es')}>🇪🇸 ES</button>
<button onClick={() => setLocale('pt')}>🇧🇷 PT</button>
```
- Destaca idioma ativo
- Persiste escolha (localStorage ou cookie)
- Localizado no hero e page headers

## Common Rationalizations
- *"Vou traduzir só PT-BR e EN"* → ES é obrigatório (público do portfolio inclui hispanohablantes)
- *"Vou usar next-intl pra ser mais robusto"* → Custom provider é leve e atende perfeitamente o escopo
- *"Vou traduzir direto no JSX"* → Manter traduções centralizadas permite auditoria e consistência

## Red Flags
- Texto hardcoded sem `t()` (só EN aparece)
- Chave de tradução faltando em um idioma (quebra silenciosa)
- Parâmetro de interpolação esquecido (mostra `{param}` literal)
- Tradução desatualizada (texto novo sem tradução nos 3 idiomas)

## Verification
- Todos os textos visíveis têm tradução nos 3 idiomas
- `LanguageSwitcher` alterna corretamente (verificar EN, ES, PT)
- Interpolação funciona: `t('greeting', { name: 'Test' })` → mostra "Test"
- Sem chaves faltando: console sem warnings de tradução ausente
