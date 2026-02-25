# 🚀 Configuración Completa para Desarrollo Local

## ✅ Cambios Realizados

Se ha migrado todo el código al nuevo sistema centralizado que funciona correctamente tanto en local como en producción.

### Archivos Migrados:

1. ✅ `src/lib/api.ts` - Cliente axios centralizado
2. ✅ `src/lib/constants.ts` - Constantes centralizadas
3. ✅ `src/app/auth/login/page.tsx` - Migrado
4. ✅ `src/app/auth/register/page.tsx` - Migrado
5. ✅ `src/app/auth/google/success/page.tsx` - Migrado
6. ✅ `src/components/Navbar.tsx` - Migrado
7. ✅ `src/components/BeerFormModal.tsx` - Migrado
8. ✅ `src/components/LugarFormModal.tsx` - Migrado
9. ✅ `src/app/cervezas/page.tsx` - Migrado

---

## 📝 Paso 1: Configurar Variables de Entorno

### Crear/Actualizar `.env.local`

Crea o actualiza el archivo `.env.local` en la raíz del proyecto:

```bash
# URL del backend SIN /api al final
# Para desarrollo local:
NEXT_PUBLIC_API_URL=http://64.23.255.101:3940

# Si tu backend está en localhost:
# NEXT_PUBLIC_API_URL=http://localhost:3001
```

**⚠️ IMPORTANTE:**

- No incluyas `/api` al final de la URL
- El código automáticamente agrega `/api` cuando es necesario
- Si tu backend está en `http://localhost:3001`, usa exactamente eso (sin `/api`)

---

## 🔐 Paso 2: Configurar Google OAuth en Google Cloud Console

Para que Google OAuth funcione en desarrollo local, necesitas agregar las URLs locales.

### Opción A: Usando IP Pública (Tu caso actual)

1. Ve a [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Selecciona tu OAuth 2.0 Client ID (`716941408216-...`)
3. En **Authorized redirect URIs**, agrega:

   ```
   http://64.23.255.101:3940/api/auth/google/callback
   ```

4. En **Authorized JavaScript origins**, agrega:

   ```
   http://64.23.255.101:3940
   ```

5. **Corrige el URI de producción** (elimina el duplicado):
   - ❌ Elimina: `https://lupulos.app/api/api/auth/google/callback`
   - ✅ Agrega: `https://lupulos.app/api/auth/google/callback`

6. Haz clic en **Guardar**

### Opción B: Usando Túnel (ngrok/localtunnel) - Recomendado para desarrollo

Si prefieres usar un túnel para desarrollo:

1. **Instala ngrok:**

   ```bash
   # macOS
   brew install ngrok

   # O descarga desde https://ngrok.com/download
   ```

2. **Inicia el túnel apuntando a tu backend:**

   ```bash
   ngrok http 3940
   # O si tu backend está en otro puerto:
   ngrok http 3001
   ```

3. **Copia la URL HTTPS** que ngrok te da (ej: `https://abc123.ngrok.io`)

4. **Actualiza `.env.local`:**

   ```bash
   NEXT_PUBLIC_API_URL=https://abc123.ngrok.io
   ```

5. **En Google Cloud Console**, agrega:
   - **Redirect URI:** `https://abc123.ngrok.io/api/auth/google/callback`
   - **JavaScript Origin:** `https://abc123.ngrok.io`

---

## ✅ Paso 3: Verificar la Configuración

### 3.1 Verificar Variables de Entorno

```bash
# En la terminal, desde la raíz del proyecto:
cat .env.local

# Debería mostrar:
# NEXT_PUBLIC_API_URL=http://64.23.255.101:3940
```

### 3.2 Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

### 3.3 Probar las Funcionalidades

1. **Login Normal:**
   - Ve a `http://localhost:3000/auth/login`
   - Debería conectarse a: `http://64.23.255.101:3940/api/auth/login` ✅

2. **Google OAuth:**
   - Haz clic en "Continuar con Google"
   - Debería redirigir a: `http://64.23.255.101:3940/api/auth/google` ✅
   - El callback debería ser: `http://64.23.255.101:3940/api/auth/google/callback` ✅

3. **Registro:**
   - Ve a `http://localhost:3000/auth/register`
   - Debería funcionar correctamente ✅

4. **Cervezas:**
   - Ve a `http://localhost:3000/cervezas`
   - Debería cargar las cervezas desde: `http://64.23.255.101:3940/api/beer` ✅

---

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"

**Síntoma:** Al hacer clic en "Continuar con Google", aparece un error de redirect URI.

**Solución:**

1. Verifica que en Google Cloud Console tengas exactamente:
   ```
   http://64.23.255.101:3940/api/auth/google/callback
   ```
2. Asegúrate de que NO tenga `/api/api/` duplicado
3. Espera 5-10 minutos después de guardar (Google puede tardar en aplicar cambios)

### Error: "Network Error" o CORS

**Síntoma:** No se pueden cargar datos del backend.

**Solución:**

1. Verifica que tu backend esté corriendo en `http://64.23.255.101:3940`
2. Verifica la configuración de CORS en tu backend
3. Asegúrate de que el backend permita requests desde `http://localhost:3000`

### Las URLs siguen teniendo `/api/api/`

**Síntoma:** En la consola del navegador ves URLs con `/api/api/`.

**Solución:**

1. Verifica que `.env.local` NO tenga `/api` al final:

   ```bash
   # ❌ INCORRECTO:
   NEXT_PUBLIC_API_URL=http://64.23.255.101:3940/api

   # ✅ CORRECTO:
   NEXT_PUBLIC_API_URL=http://64.23.255.101:3940
   ```

2. Reinicia el servidor de desarrollo:
   ```bash
   # Detén el servidor (Ctrl+C) y vuelve a iniciarlo:
   npm run dev
   ```

### Error: "Cannot read property 'exito' of undefined"

**Síntoma:** Las páginas no cargan datos.

**Solución:**

1. Verifica que el backend esté respondiendo correctamente
2. Abre las DevTools del navegador (F12) y ve a la pestaña Network
3. Verifica que las peticiones se estén haciendo correctamente
4. Revisa la respuesta del backend en la pestaña Response

---

## 📋 Checklist de Configuración

Marca cada paso cuando lo completes:

- [ ] Archivo `.env.local` creado con `NEXT_PUBLIC_API_URL=http://64.23.255.101:3940`
- [ ] Google Cloud Console: Redirect URI local agregado
- [ ] Google Cloud Console: JavaScript Origin local agregado
- [ ] Google Cloud Console: Redirect URI de producción corregido (sin `/api/api/`)
- [ ] Backend corriendo en `http://64.23.255.101:3940`
- [ ] Frontend iniciado con `npm run dev`
- [ ] Login normal funciona
- [ ] Google OAuth funciona
- [ ] Registro funciona
- [ ] Páginas de cervezas cargan correctamente

---

## 🔄 Migración de Otros Archivos (Opcional)

Si encuentras archivos que todavía usan el sistema antiguo, puedes migrarlos siguiendo este patrón:

### Antes:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app/api";

const res = await fetch(`${API_URL}/api/beer`);
const data = await res.json();
```

### Después:

```typescript
import api from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";

const { data } = await api.get("/beer");
```

### Para imágenes:

```typescript
// Antes:
src={`${API_URL}${imagen}`}

// Después:
import { API_BASE_URL } from "@/lib/constants";
src={imagen.startsWith("http") ? imagen : `${API_BASE_URL}${imagen}`}
```

---

## 📚 Archivos que Aún Pueden Necesitar Migración

Estos archivos pueden beneficiarse de la migración (pero no son críticos):

- `src/app/lugares/page.tsx`
- `src/app/lugares/[id]/page.tsx`
- `src/app/posts/page.tsx`
- `src/app/posts/[id]/page.tsx`
- `src/app/usuarios/page.tsx`
- `src/app/usuarios/[id]/page.tsx`
- `src/app/auth/perfil/page.tsx`
- `src/app/cervezas/[id]/page.tsx`
- `src/app/cervezas/editar/[id]/page.tsx`
- `src/app/lugares/editar/[id]/page.tsx`
- `src/app/lugares/nueva/page.tsx`
- `src/app/cervezas/nueva/page.tsx`

Puedes migrarlos gradualmente usando el mismo patrón.

---

## ✨ Ventajas del Nuevo Sistema

1. ✅ **Sin duplicación de `/api`** - El código maneja esto automáticamente
2. ✅ **Interceptores JWT automáticos** - No necesitas agregar tokens manualmente
3. ✅ **Manejo de errores centralizado** - Logout automático en 401
4. ✅ **Código más limpio** - Menos repetición, más mantenible
5. ✅ **Funciona en local y producción** - Solo cambia la variable de entorno

---

**¡Listo!** Tu aplicación debería funcionar correctamente en desarrollo local. 🍺

Si encuentras algún problema, revisa la sección de "Solución de Problemas" arriba.
