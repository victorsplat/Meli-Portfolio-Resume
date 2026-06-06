---
name: meli-deploy
description: Meli Portfolio — Vercel deploy, Blob storage, env vars, Atlas network
---

# Meli Portfolio — Deploy

## Overview
Pipeline de deploy e infraestrutura do Meli Portfolio Resume. Vercel (hosting), Vercel Blob (imagens), MongoDB Atlas (dados).

## When to Use
- Fazer deploy de atualização
- Configurar variáveis de ambiente na Vercel
- Gerenciar Blob storage (imagens da galeria)
- Configurar Atlas Network Access para Vercel

## Core Process

### 1. Deploy Vercel
```bash
npm run build          # build limpo com Turbopack
git add -A             # stage todas mudanças
git commit -m "feat: ..."  # conventional commit
git push               # Vercel auto-deploy na main
```
- Deploy automático via Vercel Git Integration
- Preview deployments em PRs
- Build command: `npm run build`
- Output directory: `.next`
- Node.js version: 22.x (via nvm)

### 2. Environment Variables (Vercel Dashboard)
| Variable | Onde obter |
|---|---|
| `MONGODB_URI` | MongoDB Atlas → Connect → Drivers |
| `ADMIN_API_KEY` | Gerar UUID v4 (`uuidgen`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Dashboard → Storage → Blob |

⚠️ **Vercel ignora `.env.local`** — todas as secrets devem estar no Vercel Dashboard.

### 3. Vercel Blob
- **Imagens novas**: upload para Blob privado via `@vercel/blob`
- **Imagens antigas**: base64 no MongoDB (ainda acessíveis)
- **Proxy**: `GET /api/gallery/proxy` para servir imagens privadas
- **Migração**: dashboard admin → Storage tab → migrar base64→Blob por imagem
- **Cleanup**: DELETE de imagem também remove do Blob
- **Compressão client-side**: Canvas 2000px max, JPEG q0.85 (evita limite 4.5MB Vercel)

### 4. MongoDB Atlas Network Access
```
IP Whitelist: 0.0.0.0/0  (Vercel tem IPs dinâmicos)
```
- Cluster: M0 free tier (512MB)
- `mongodb+srv://user:password@cluster.xxxxx.mongodb.net/meli-portfolio`

### 5. Vercel Constraints
| Limitação | Mitigação |
|---|---|
| Serverless body 4.5MB | Compressão client-side 2000px q0.85 |
| Execution timeout 10s | Operações rápidas, sem sync pesado |
| `.env.local` ignorado | Secrets no Vercel Dashboard |
| Dynamic IPs | Atlas whitelist `0.0.0.0/0` |

## Verification
- `npm run build` sem erros
- Deploy na Vercel: site acessível
- Gallery: upload, visualização, deleção funcionam
- Blob: imagens carregam via proxy
- Atlas: conexão ativa sem slow queries
