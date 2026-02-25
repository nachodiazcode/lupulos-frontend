export const STATS = [
  { value: "500+", label: "Cervezas artesanales", icon: "🍺" },
  { value: "120+", label: "Bares y brewpubs", icon: "📍" },
  { value: "2.5K+", label: "Cerveceros activos", icon: "👥" },
  { value: "15K+", label: "Reseñas compartidas", icon: "⭐" },
] as const;

export const STORY = [
  {
    chapter: "Capítulo I",
    title: "El descubrimiento",
    narrative:
      "Imagina encontrar esa IPA con aroma a maracuyá que te eriza la piel, o una Stout con notas de chocolate que jamás olvidarás. Cada cerveza tiene una historia — nosotros te ayudamos a descubrirla.",
    img: "/assets/personajes-landing/explorar-cervezas.png",
    accent: "#fbbf24",
    href: "/cervezas",
    cta: "Explorar cervezas",
    icon: "🍺",
  },
  {
    chapter: "Capítulo II",
    title: "La aventura",
    narrative:
      "Un speakeasy detrás de una barbería, un beer garden con vista al atardecer, una cervecería familiar donde el maestro te explica cada receta. Los mejores lugares no están en Google — están aquí.",
    img: "/assets/personajes-landing/encuentra-bares.png",
    accent: "#ef4444",
    href: "/lugares",
    cta: "Encontrar bares",
    icon: "📍",
  },
  {
    chapter: "Capítulo III",
    title: "La tribu",
    narrative:
      "No hay cerveza sin brindis, ni brindis sin compañía. Publica descubrimientos, debate estilos, comparte fotos y conecta con cerveceros que entienden que una buena birra cambia cualquier día.",
    img: "/assets/personajes-landing/comparte-comunidades.png",
    accent: "#10b981",
    href: "/posts",
    cta: "Unirme ahora",
    icon: "💬",
  },
  {
    chapter: "Epílogo",
    title: "Tu historia empieza hoy",
    narrative:
      "Todo gran cervecero empezó con un primer sorbo curioso. Crea tu cuenta, explora el catálogo y empieza a escribir tu propia leyenda cervecera. Miles de descubrimientos te esperan.",
    img: "/assets/personajes/teamlupulos.png",
    accent: "#fbbf24",
    href: "/auth/register",
    cta: "Comenzar mi historia",
    icon: "✨",
  },
];

export type StoryItem = (typeof STORY)[number];

export const STEPS = [
  {
    number: "01",
    title: "Crea tu perfil",
    desc: "Regístrate gratis, elige tus estilos favoritos y personaliza tu experiencia cervecera.",
    icon: "user" as const,
  },
  {
    number: "02",
    title: "Explora y descubre",
    desc: "Navega por cervezas, bares y eventos. Filtra por estilo, ubicación o puntuación.",
    icon: "search" as const,
  },
  {
    number: "03",
    title: "Comparte y conecta",
    desc: "Publica reseñas, sube fotos y forma parte de la comunidad que vive la cerveza.",
    icon: "chat" as const,
  },
] as const;

export type StepIconName = (typeof STEPS)[number]["icon"];

export const FEATURES = [
  { icon: "🎯", label: "Recomendaciones personalizadas" },
  { icon: "📸", label: "Fotos y reseñas colaborativas" },
  { icon: "🏆", label: "Rankings de la comunidad" },
  { icon: "🎉", label: "Eventos y encuentros" },
  { icon: "🗺️", label: "Mapa cervecero interactivo" },
  { icon: "💬", label: "Chat y grupos temáticos" },
] as const;

export const QUOTES = [
  "El arte de la cerveza es unir lo amargo con lo inolvidable.",
  "Donde hay cerveza, hay historias que valen oro.",
  "El lúpulo no se explica, se siente.",
  "Una buena cerveza no se bebe… se honra.",
  "Brindemos por las cervezas que nos unen y los bares que nos salvan.",
];
