# 🍺 Lúpulos — Frontend

> Comunidad cervecera artesanal: descubrí, compartí y conectá con otros cerveceros.

**Lúpulos** es una plataforma social dedicada a los amantes de la cerveza artesanal. Permite explorar cervezas y bares, publicar reseñas con fotos, seguir a otros cerveceros, y gestionar un perfil personalizado con múltiples temas visuales.

- 🌐 **Producción:** https://lupulos.app
- 🔧 **API / Backend:** https://github.com/nachodiazcode/lupulos-api

---

## ✨ Características Principales

- 🔐 **Autenticación** — JWT con refresh token + login social (Google OAuth)
- 🍻 **Cervezas** — CRUD completo con fotos, puntuación, reseñas y filtros
- 📍 **Lugares / Bares** — Mapa con locales, visitas y reseñas geolocalizadas
- 📝 **Posts & Comunidad** — Feed social con posts, comentarios y multimedia
- 👤 **Perfil de Usuario** — Editor con foto de perfil, bio, redes y stats de actividad
- 🎨 **Sistema de Temas** — 5 temas visuales dinámicos: Ámbar, Stout, Saint Patrick, Haze, Dorado
- 🔎 **Buscador Avanzado** — Command palette con resultados en tiempo real
- 📱 **Responsive** — Mobile-first con navegación inferior adaptativa
- 🪟 **Glassmorphism UI** — Efecto vidrio esmerilado estilo macOS Tahoe por tema

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Estilos | [Tailwind CSS v4](https://tailwindcss.com/) + [Material UI v7](https://mui.com/) |
| Animaciones | [Framer Motion](https://www.framer.com/motion/) |
| Formularios | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| HTTP Client | [Axios](https://axios-http.com/) (con interceptores JWT automáticos) |
| Temas | Sistema propio con CSS Custom Properties (`data-theme` en `<html>`) |
| Fuentes | Ubuntu (sans-serif), Victor Mono (mono) |

---

## 🎨 Sistema de Temas

La aplicación cuenta con 5 temas visuales intercambiables, controlados mediante el atributo `data-theme` en el elemento `<html>`. Cada tema redefine por completo las variables CSS de superficies, texto, bordes, gradientes y sombras:

| Tema | Descripción |
|---|---|
| 🍻 **Ámbar** (default) | Tonos cálidos dorados — estilo pub artesanal |
| 🖤 **Stout** | Púrpura oscuro con acentos dorados — Porter industrial |
| 🍀 **Saint Patrick** | Verde esmeralda claro — prado irlandés |
| 🔮 **Haze** | Lavanda pastel holográfica — Hazy IPA |
| 👑 **Dorado** | Oro puro sobre obsidiana — premium luxury |

---

## 🚀 Setup Local

### Requisitos

- **Node.js**: ver `package.json#engines` (recomendado `>=20`)
- **npm**: ver `package.json#packageManager`

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/nachodiazcode/lupulos-frontend.git
cd lupulos-frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
```

Editar `.env.local` y configurar:

```env
NEXT_PUBLIC_API_URL=http://localhost:3940   # URL del backend sin /api
```

```bash
# 4. Levantar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## 📦 Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (hot reload) |
| `npm run dev:turbo` | Servidor de desarrollo con Turbopack |
| `npm run build` | Build de producción optimizado |
| `npm run start` | Iniciar servidor de producción |
| `npm run lint` | Verificar ESLint (0 warnings) |
| `npm run format` | Aplicar Prettier a todos los archivos |
| `npm run typecheck` | Verificar tipos TypeScript |
| `npm run check` | Formato + lint + typecheck en conjunto |
| `npm run ci` | Check completo + build (ideal para CI/CD) |

---

## 🌐 Deploy en Vercel

1. Conectar este repositorio en [Vercel](https://vercel.com) (Framework Preset: **Next.js**)
2. Configurar las variables de entorno en el dashboard de Vercel
3. El deploy se activa automáticamente en cada push a `main`

### Variables de Entorno (Producción)

```env
# Opción A — Conexión directa al backend
NEXT_PUBLIC_API_URL=https://api.lupulos.app

# Opción B (recomendada) — Proxy de API en Vercel (evita problemas de CORS)
NEXT_PUBLIC_API_URL=/api
API_PROXY_TARGET=https://api.lupulos.app
```

Con la **Opción B**, Vercel redirige automáticamente:
- `/api/*` → `${API_PROXY_TARGET}/api/*`
- `/uploads/*` → `${API_PROXY_TARGET}/uploads/*`

---

## 📁 Estructura del Proyecto

```
src/
├── app/                  # Rutas Next.js (App Router)
│   ├── auth/             # Login, registro, perfil de usuario
│   ├── cervezas/         # Explorador y CRUD de cervezas
│   ├── lugares/          # Mapa y CRUD de bares/locales
│   ├── posts/            # Feed social y publicaciones
│   ├── blog/             # Artículos y guías
│   └── globals.scss      # Design tokens y temas globales
├── components/           # Componentes reutilizables (Navbar, Footer, etc.)
├── features/             # Lógica de dominio por feature (home, feed, etc.)
├── context/              # Proveedores de contexto React (Auth, UI)
├── hooks/                # Custom hooks (useAuth, useApi, etc.)
├── lib/                  # Utilidades, cliente API, helpers de sesión
├── theme/                # Sistema de temas (ThemeContext, muiTheme)
└── types/                # Tipos TypeScript compartidos
```

---

## 🔄 Changelog Reciente

### v1.x — Embellecimiento de Página de Perfil
- ✅ Integración dinámica con todos los temas de color del sistema (elimina colores hardcodeados)
- ✅ Modo vista de campos con hover interactivo y lápiz de edición rápida
- ✅ Sitio web como enlace clickable con ícono de enlace externo
- ✅ Placeholder inteligente `+ Añadir [campo]` para campos vacíos (abre modo edición al hacer clic)
- ✅ Botones de acción adaptados al gradiente del tema activo (`--gradient-button-primary`)
- ✅ Tarjetas laterales con glassmorphism (`.glass-card`) y checkmarks SVG en lista de seguridad
- ✅ Badges de métricas de actividad con brillo de color dinámico

### Mejoras de Infraestructura
- ✅ Eliminación de archivos `.md` obsoletos y assets PNG sin uso
- ✅ Eliminación de componente `StoriesCarousel` huérfano
- ✅ Limpieza de la carpeta `src/themes` (configuración antigua de temas)
- ✅ Arreglo de imágenes rotas de Unsplash con fallback robusto

---

## 👥 Contribución

Este proyecto es privado y mantenido activamente. Para reportar bugs o sugerir mejoras, contactar al equipo de desarrollo.

---

## 📄 Licencia

UNLICENSED — Todos los derechos reservados © 2025 Lúpulos.
