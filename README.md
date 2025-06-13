# 🍺 Lúpulos App - Frontend

**Lúpulos App** es una plataforma web moderna desarrollada con **Next.js 14**, **TypeScript**, **Tailwind CSS** y **Material UI**, diseñada especialmente para la comunidad cervecera artesanal. Con un enfoque elegante, intuitivo y responsive, permite descubrir cervezas, comentar, puntuar, interactuar y subir contenido visual.

> 🔗 API oficial: [Lúpulos API](https://github.com/ignaciosergiodiaz/lupulos-api)  
> 🌐 Sitio en producción: [https://lupulos.app](https://lupulos.app)

---

## 🚀 Características Principales

- 🔐 Autenticación con JWT y login social
- 🎨 Interfaz en modo oscuro, estilo *craft beer*
- 🍺 CRUD completo de cervezas y lugares
- 💬 Comentarios con puntuación, respuestas y multimedia
- 🤘 Reacciones tipo "saludo vikingo" con persistencia
- 🔍 Filtros avanzados por tipo, nombre y cervecería
- 🖼️ Subida de imágenes (preview + upload real)
- 🧭 Navegación SPA fluida con animaciones
- 🧑‍💻 Panel de usuario y perfil público
- 📱 Diseño completamente responsive (mobile-first)

---

## 🧱 Tecnologías Usadas

- **Next.js 14** (App Router + SSR + Static Routes)
- **TypeScript**
- **Tailwind CSS** + **Material UI**
- **Axios**
- **Framer Motion**
- **JWT + LocalStorage**
- **MongoDB Atlas (vía API)**
- **Mongoose (ODM para MongoDB)**
- **Multer + FormData (subida de imágenes)**
- **Zod (planificado para validaciones robustas)**

---

## 🧬 Comunicación Frontend ↔ API

- Cliente Axios configurado con interceptor JWT:

```ts
// src/lib/axios.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 🧠 ¿Usas ORM?

¡Sí! En el backend usamos **Mongoose**, que es un ODM (Object Document Mapper) para MongoDB. Es como un ORM para bases NoSQL. Permite definir esquemas, relaciones virtuales, validaciones y lógica embebida.

```ts
// Modelo de cerveza (ejemplo)
const BeerSchema = new mongoose.Schema({
  nombre: String,
  tipo: String,
  cerveceria: String,
  abv: Number,
  descripcion: String,
  imagen: String,
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Usuario" }],
  reviews: [
    {
      usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
      comentario: String,
      calificacion: Number,
      creadoEn: { type: Date, default: Date.now },
    },
  ],
});
```

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
├── .env.local             # Variables de entorno
├── tailwind.config.js     # Configuración de Tailwind
└── README.md              # Este archivo 🍻
```

---

## 📦 Instalación local

```bash
git clone https://github.com/ignaciosergiodiaz/lupulos-frontend.git
cd lupulos-frontend
npm install
# o
yarn install
```

### 🔐 Variables de entorno

Crea un archivo `.env.local`:

```env
# Local
NEXT_PUBLIC_API_URL=http://localhost:3940

# Producción (ejemplo)
# NEXT_PUBLIC_API_URL=https://lupulos.app
```

---

## ▶️ Iniciar en desarrollo

```bash
npm run dev
# o
yarn dev
```

Abre tu navegador en: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy en Vercel

- Repositorio conectado a Vercel
- Variable `NEXT_PUBLIC_API_URL` definida en entorno
- Despliegue automático al hacer push en `main`

---

## 🧪 Testing (planificado)

- [ ] Jest + React Testing Library (unitarias)
- [ ] Cypress o Playwright (e2e)
- [ ] ESLint + Prettier + husky (CI básico)

---

## 🧭 Roadmap

- [ ] Feed en tiempo real de comentarios
- [ ] Sistema de badges y gamificación
- [ ] Ranking de cervezas por la comunidad
- [ ] Seguimiento de usuarios y perfiles públicos
- [ ] Modo "cata" con puntuación anónima

---

## 👨‍💻 Autor

Creado con 🍻 por [@ignaciosergiodiaz](https://github.com/ignaciosergiodiaz)  
Inspirado por el espíritu del código abierto y el lúpulo artesanal.

---

## 📄 Licencia

MIT © Ignacio Sergio Díaz  
¡Libre para compartir, mejorar y brindar!
