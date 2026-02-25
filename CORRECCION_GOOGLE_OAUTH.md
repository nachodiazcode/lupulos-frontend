# 🔧 Corrección de Google OAuth - URI Duplicado

## Problema Detectado

En Google Cloud Console, el **Authorized Redirect URI** está configurado incorrectamente:

```
❌ INCORRECTO: https://lupulos.app/api/api/auth/google/callback
✅ CORRECTO:   https://lupulos.app/api/auth/google/callback
```

## Causa Raíz

El código del frontend tiene `API_URL` definido como:

```typescript
const API_URL = "https://lupulos.app/api"; // Ya incluye /api
```

Pero luego se usa así:

```typescript
`${API_URL}/api/auth/google`; // Duplica /api → /api/api/auth/google
```

## Solución Inmediata

### Paso 1: Corregir en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Selecciona tu OAuth 2.0 Client ID
3. En **Authorized redirect URIs**, cambia:
   - **De:** `https://lupulos.app/api/api/auth/google/callback`
   - **A:** `https://lupulos.app/api/auth/google/callback`
4. Haz clic en **Guardar**

### Paso 2: Verificar el Backend

Asegúrate de que tu backend esté configurado para recibir el callback en:

```
/api/auth/google/callback
```

## Solución a Largo Plazo

Refactorizar el código para evitar la duplicación. Hay dos opciones:

### Opción A: Quitar `/api` de `API_URL` (Recomendada)

Cambiar todas las definiciones de:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app/api";
```

A:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app";
```

**Ventaja:** Las rutas ya tienen `/api/` al inicio, así que funcionarán correctamente.

### Opción B: Quitar `/api/` de las rutas

Mantener `API_URL` con `/api` pero cambiar todas las rutas de:

```typescript
`${API_URL}/api/auth/login`; // ❌
```

A:

```typescript
`${API_URL}/auth/login`; // ✅
```

**Desventaja:** Requiere cambiar muchas rutas en el código.

## Archivos que Necesitan Cambio (Opción A)

Si eliges la Opción A, estos archivos necesitan actualización:

- `src/components/Navbar.tsx`
- `src/app/auth/login/page.tsx`
- `src/app/auth/register/page.tsx`
- `src/app/auth/google/success/page.tsx`
- `src/app/cervezas/page.tsx`
- `src/app/cervezas/[id]/page.tsx`
- `src/app/lugares/page.tsx`
- `src/app/lugares/[id]/page.tsx`
- `src/app/posts/page.tsx`
- `src/app/posts/[id]/page.tsx`
- `src/app/usuarios/page.tsx`
- `src/app/usuarios/[id]/page.tsx`
- `src/app/auth/perfil/page.tsx`
- `src/components/BeerFormModal.tsx`
- `src/components/LugarFormModal.tsx`
- Y otros...

**Total:** ~20 archivos

## Mejor Solución: Centralizar en `api.ts`

La mejor práctica sería crear `src/lib/api.ts` con:

```typescript
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app";

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptores JWT aquí...

export default api;
```

Y luego usar `api.get()`, `api.post()`, etc. en lugar de construir URLs manualmente.

---

**Nota:** Después de cambiar el Redirect URI en Google Cloud Console, puede tardar entre 5 minutos y algunas horas en aplicarse.
