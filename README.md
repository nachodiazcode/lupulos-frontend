# Lúpulos Backend
Frontend web de **Lúpulos**, construido con **Next.js (App Router)**, **React** y **TypeScript**.
- Producción: https://lupulos.app
- Backend/API: https://github.com/ignaciosergiodiaz/lupulos-api
## Características
- Autenticación con JWT y login social
- CRUD de cervezas y lugares
- Posts, comentarios, puntuación y multimedia
- UI responsive (Tailwind + MUI)
## Stack
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4 + Material UI
- Axios (con interceptores JWT)
- React Hook Form + Zod
## Requisitos
- Node.js: ver `package.json#engines` (y `.nvmrc` para desarrollo)
- npm: ver `package.json#packageManager`
## Setup local
1. Instalar dependencias
```bash
npm install
```
2. Variables de entorno
```bash
cp .env.example .env.local
```
Editá `.env.local` y configurá:
- `NEXT_PUBLIC_API_URL` (URL base del backend **sin** `/api`)
3. Levantar el entorno
```bash
npm run dev
```
## Scripts útiles
- `npm run dev`: levantar Next en desarrollo
- `npm run check`: formato + lint + typecheck
- `npm run ci`: check + build (ideal para CI)
- `npm run format`: aplicar Prettier
- `npm run format:check`: validar formato
## Deploy en Vercel
1. Conectá este repo de GitHub en Vercel (Framework Preset: **Next.js**)
2. Configurá variables de entorno (Preview/Production según corresponda)
3. Deploy: Vercel detecta `npm run build` automáticamente para Next.js
### Opción A: conexión directa al backend
- `NEXT_PUBLIC_API_URL=https://tu-backend.com` (sin `/api`)
### Opción B (recomendada): proxy de API en Vercel
- `NEXT_PUBLIC_API_URL=/api`
- `API_PROXY_TARGET=https://tu-backend.com` (sin `/api`)
Rewrites automáticos:
- `/api/*` → `${API_PROXY_TARGET}/api/*`
- `/uploads/*` → `${API_PROXY_TARGET}/uploads/*`
La opción B reduce problemas de CORS y deja el frontend listo para deploy continuo desde GitHub.
