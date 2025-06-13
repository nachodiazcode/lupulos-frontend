# 🍺 Lúpulos App - Frontend

**Lúpulos App** es una plataforma web moderna desarrollada con **Next.js 14**, **TypeScript**, **Tailwind CSS** y **Material UI**, pensada para amantes de la cerveza artesanal. Permite descubrir cervezas, comentar, puntuar, subir contenido visual y explorar lugares cerveceros en un entorno intuitivo y responsive.

> 🔗 [API oficial](https://github.com/ignaciosergiodiaz/lupulos-api)  
> 🌐 [Sitio en producción](https://lupulos.app)

---

## Características

- Autenticación con JWT y login social
- CRUD completo de cervezas y lugares
- Comentarios con puntuación, multimedia y respuestas
- Reacciones tipo “saludo vikingo”
- Filtros avanzados (tipo, nombre, cervecería)
- Subida y vista previa de imágenes
- Navegación SPA con diseño oscuro y responsivo
- Panel de usuario y perfil público

---

## Tecnologías

- **Next.js 14** (App Router, SSR, Static Routes)
- **TypeScript**
- **Tailwind CSS** + **Material UI**
- **Axios** con interceptores JWT
- **MongoDB Atlas** con **Mongoose**
- **Multer** para subida de imágenes
- **Framer Motion** (opcional)
- **Zod** (planificado para validaciones)

---

## Comunicación con la API

```ts
// src/lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor JWT para adjuntar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
