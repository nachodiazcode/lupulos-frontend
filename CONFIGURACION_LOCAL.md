# 🔧 Configuración para Desarrollo Local

## ✅ Cambios Realizados

Se ha corregido el problema de duplicación de `/api` en las URLs. Ahora el código funciona correctamente tanto en local como en producción.

### Archivos Creados/Modificados:

1. ✅ `src/lib/api.ts` - Cliente axios centralizado con interceptores
2. ✅ `src/lib/constants.ts` - Constantes centralizadas (API_URL, GOOGLE_AUTH_URL)
3. ✅ `src/app/auth/login/page.tsx` - Actualizado para usar las nuevas constantes
4. ✅ `.env.example` - Documentación de variables de entorno

---

## 📝 Configuración de Variables de Entorno

### Para Desarrollo Local

Crea o actualiza tu archivo `.env.local`:

```bash
# URL del backend SIN /api al final
NEXT_PUBLIC_API_URL=http://64.23.255.101:3940
```

**Importante:** No incluyas `/api` al final, se agrega automáticamente.

### Para Producción

En producción (Vercel, etc.), configura:

```bash
NEXT_PUBLIC_API_URL=https://lupulos.app
```

---

## 🔐 Configuración de Google OAuth para Local

Para que Google OAuth funcione en desarrollo local, necesitas agregar URLs locales en Google Cloud Console:

### Paso 1: Obtener tu URL local

Si estás usando un túnel (ngrok, localtunnel, etc.) o tienes una IP pública, necesitas:

- **Opción A - Túnel (Recomendado):** Usa ngrok o similar

  ```bash
  ngrok http 3000
  # Obtendrás algo como: https://abc123.ngrok.io
  ```

- **Opción B - IP Pública:** Si tu servidor backend es accesible públicamente
  ```
  http://64.23.255.101:3940
  ```

### Paso 2: Agregar Redirect URIs en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Selecciona tu OAuth 2.0 Client ID
3. En **Authorized redirect URIs**, agrega:

   **Para desarrollo local con túnel:**

   ```
   https://TU-TUNEL.ngrok.io/api/auth/google/callback
   ```

   **Para desarrollo local con IP pública:**

   ```
   http://64.23.255.101:3940/api/auth/google/callback
   ```

   **Para producción (ya debería estar):**

   ```
   https://lupulos.app/api/auth/google/callback
   ```

4. Haz clic en **Guardar**

### Paso 3: Agregar JavaScript Origins (si usas túnel)

En **Authorized JavaScript origins**, agrega:

```
https://TU-TUNEL.ngrok.io
```

O si usas IP pública:

```
http://64.23.255.101:3940
```

---

## 🚀 Cómo Usar el Nuevo Sistema

### Antes (❌ Incorrecto):

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app/api";

// Esto causaba duplicación:
fetch(`${API_URL}/api/auth/login`); // → /api/api/auth/login ❌
```

### Ahora (✅ Correcto):

```typescript
import { API_URL, GOOGLE_AUTH_URL } from "@/lib/constants";
import api from "@/lib/api";

// Usar el cliente axios (recomendado):
await api.post("/auth/login", { email, password });

// O usar constantes para URLs especiales:
<a href={GOOGLE_AUTH_URL}>Login con Google</a>
```

---

## 📋 Migración de Archivos Existentes

Para migrar otros archivos al nuevo sistema:

### Paso 1: Reemplazar importaciones

**Antes:**

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app/api";
```

**Después:**

```typescript
import { API_URL } from "@/lib/constants";
// O mejor aún:
import api from "@/lib/api";
```

### Paso 2: Actualizar llamadas HTTP

**Antes:**

```typescript
const response = await fetch(`${API_URL}/api/beer`);
const data = await response.json();
```

**Después:**

```typescript
const { data } = await api.get("/beer");
```

### Paso 3: Corregir rutas duplicadas

Buscar y reemplazar:

- `${API_URL}/api/` → Usar `api.get()`, `api.post()`, etc.
- `${API_URL}/auth/` → Usar `api.get("/auth/...")` o `${API_URL}/auth/...`

---

## ✅ Verificación

Para verificar que todo funciona:

1. **Verifica las variables de entorno:**

   ```bash
   # En desarrollo, debería mostrar tu URL local
   echo $NEXT_PUBLIC_API_URL
   ```

2. **Inicia el servidor:**

   ```bash
   npm run dev
   ```

3. **Prueba el login:**
   - Debería conectarse a: `http://64.23.255.101:3940/api/auth/login`
   - Sin duplicación de `/api`

4. **Prueba Google OAuth:**
   - Debería redirigir a: `http://64.23.255.101:3940/api/auth/google`
   - El callback debería ser: `http://64.23.255.101:3940/api/auth/google/callback`

---

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"

**Causa:** El redirect URI en Google Cloud Console no coincide con el que estás usando.

**Solución:**

1. Verifica que el redirect URI en Google Cloud Console sea exactamente:
   ```
   http://64.23.255.101:3940/api/auth/google/callback
   ```
2. Asegúrate de que no tenga `/api/api/` duplicado

### Error: "Network Error" o CORS

**Causa:** El backend no está corriendo o no permite CORS desde tu frontend.

**Solución:**

1. Verifica que el backend esté corriendo en `http://64.23.255.101:3940`
2. Verifica la configuración de CORS en el backend

### Las URLs siguen teniendo `/api/api/`

**Causa:** Algún archivo todavía usa el sistema antiguo.

**Solución:**

1. Busca archivos que definan `API_URL` localmente
2. Reemplázalos con imports de `@/lib/constants` o `@/lib/api`

---

## 📚 Archivos que Necesitan Migración (Opcional)

Estos archivos todavía usan el sistema antiguo y pueden beneficiarse de la migración:

- `src/app/auth/register/page.tsx`
- `src/app/auth/google/success/page.tsx`
- `src/app/cervezas/page.tsx`
- `src/app/lugares/page.tsx`
- `src/components/Navbar.tsx`
- Y otros...

Puedes migrarlos gradualmente usando el mismo patrón que en `login/page.tsx`.

---

**Última actualización:** $(date)
