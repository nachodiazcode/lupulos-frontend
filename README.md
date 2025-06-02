# 🍺 Lúpulos App - Frontend

**Lúpulos App** es una plataforma web moderna desarrollada con **Next.js 14**, **TypeScript**, **Tailwind**, y **Material UI**, enfocada en la comunidad de amantes de la cerveza artesanal. Este frontend se comunica con una API robusta construida en Node.js + MongoDB y ofrece una experiencia intuitiva, elegante y completamente responsive.

> 🔗 API oficial: [Lúpulos API](https://github.com/ignaciosergiodiaz/lupulos-api)

---

![Status](https://img.shields.io/badge/status-en%20desarrollo-yellow)
![Next.js](https://img.shields.io/badge/Next.js-14-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC?style=flat&logo=typescript&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

---

## 🚀 Características

- 🔐 Autenticación con JWT y rutas protegidas
- 🎨 Diseño oscuro personalizado, estilo *craft beer*
- 🍺 CRUD de cervezas, bares y lugares
- 💬 Comentarios con puntuación y respuestas
- 💛 Favoritos con persistencia en localStorage ("saludos vikingos")
- 🔎 Búsqueda avanzada por nombre, ciudad y tipo de cerveza
- 📸 Subida de imágenes con vista previa
- 🧭 Navegación fluida tipo SPA con scroll y animaciones
- 📱 100% responsive (diseño mobile-first)
- ⚙️ Panel de usuario y perfil propio

---

## 📁 Estructura del Proyecto

```bash
lupulos-frontend/
├── public/                # Imágenes y assets estáticos
├── src/
│   ├── app/               # Rutas (Next.js App Router)
│   ├── components/        # Componentes reutilizables
│   ├── hooks/             # Custom hooks (ej. useAuth)
│   ├── lib/               # Cliente Axios centralizado
│   ├── styles/            # Estilos globales
│   └── themes/            # Temas de color (cervezas)
├── package.json           # Dependencias
└── README.md              # Este archivo
```

---

## 🧪 Stack Tecnológico

- **Next.js 14 (App Router + SSR)**
- **TypeScript**
- **Tailwind CSS + Material UI**
- **Axios**
- **Framer Motion**
- **JWT Authentication**
- **MongoDB Atlas (vía API)**

---

## 🔧 Instalación local

```bash
git clone https://github.com/ignaciosergiodiaz/lupulos-frontend.git
cd lupulos-frontend
npm install
# o
yarn install
```

Agrega un archivo `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3940
```

Ejecuta:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🌐 Deploy

Este proyecto está optimizado para desplegarse en **[Vercel](https://vercel.com)**.  
Solo haz push al repositorio conectado y... ¡listo!

---

## 👨‍💻 Autor

Desarrollado con 💛 por [@ignaciosergiodiaz](https://github.com/ignaciosergiodiaz)  
Inspirado por el espíritu del lúpulo y el poder del código abierto 🍻

---

## 📸 Preview

```bash
# Puedes reemplazar esto por una imagen real
```

![Preview](./public/assets/logo.gif)

---

## 🤝 Contribuciones

¡Se aceptan ideas, pull requests y saludos vikingos!

1. Haz un fork 🍴
2. Crea una rama nueva 🚀
3. Haz commit de tus cambios ✅
4. Abre un pull request 🛠️

---

## 📄 Licencia

MIT © Ignacio Sergio Díaz
# 🍺 Lúpulos App - Frontend

**Lúpulos App** es una plataforma web moderna desarrollada con **Next.js 14**, **TypeScript**, **Tailwind**, y **Material UI**, enfocada en la comunidad de amantes de la cerveza artesanal. Este frontend se comunica con una API robusta construida en Node.js + MongoDB y ofrece una experiencia intuitiva, elegante y completamente responsive.

> 🔗 API oficial: [Lúpulos API](https://github.com/ignaciosergiodiaz/lupulos-api)

---

![Status](https://img.shields.io/badge/status-en%20desarrollo-yellow)
![Next.js](https://img.shields.io/badge/Next.js-14-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC?style=flat&logo=typescript&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

---

## 🚀 Características

- 🔐 Autenticación con JWT y rutas protegidas
- 🎨 Diseño oscuro personalizado, estilo *craft beer*
- 🍺 CRUD de cervezas, bares y lugares
- 💬 Comentarios con puntuación y respuestas
- 💛 Favoritos con persistencia en localStorage ("saludos vikingos")
- 🔎 Búsqueda avanzada por nombre, ciudad y tipo de cerveza
- 📸 Subida de imágenes con vista previa
- 🧭 Navegación fluida tipo SPA con scroll y animaciones
- 📱 100% responsive (diseño mobile-first)
- ⚙️ Panel de usuario y perfil propio

---

## 📁 Estructura del Proyecto

```bash
lupulos-frontend/
├── public/                # Imágenes y assets estáticos
├── src/
│   ├── app/               # Rutas (Next.js App Router)
│   ├── components/        # Componentes reutilizables
│   ├── hooks/             # Custom hooks (ej. useAuth)
│   ├── lib/               # Cliente Axios centralizado
│   ├── styles/            # Estilos globales
│   └── themes/            # Temas de color (cervezas)
├── package.json           # Dependencias
└── README.md              # Este archivo
```

---

## 🧪 Stack Tecnológico

- **Next.js 14 (App Router + SSR)**
- **TypeScript**
- **Tailwind CSS + Material UI**
- **Axios**
- **Framer Motion**
- **JWT Authentication**
- **MongoDB Atlas (vía API)**

---

## 🔧 Instalación local

```bash
git clone https://github.com/ignaciosergiodiaz/lupulos-frontend.git
cd lupulos-frontend
npm install
# o
yarn install
```

Agrega un archivo `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3940
```

Ejecuta:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🌐 Deploy

Este proyecto está optimizado para desplegarse en **[Vercel](https://vercel.com)**.  
Solo haz push al repositorio conectado y... ¡listo!

---

## 👨‍💻 Autor

Desarrollado con 💛 por [@ignaciosergiodiaz](https://github.com/ignaciosergiodiaz)  
Inspirado por el espíritu del lúpulo y el poder del código abierto 🍻

---

## 📸 Preview

```bash
# Puedes reemplazar esto por una imagen real
```

![Preview](./public/assets/logo.gif)

---

## 📄 Licencia

MIT © Ignacio Sergio Díaz
