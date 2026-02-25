# Lúpulos Frontend

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

1. Importá este repo en Vercel (Framework Preset: **Next.js**)
2. Configurá variables de entorno (Preview/Production según corresponda)
   - `NEXT_PUBLIC_API_URL` (sin `/api`)
3. Deploy: Vercel detecta `npm run build` automáticamente para Next.js

Tip: si no seteás `NEXT_PUBLIC_API_URL`, el frontend usa `https://lupulos.app` por defecto.
