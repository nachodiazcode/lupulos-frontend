export const STATS = [
  { value: "1.2K+", label: "Etiquetas artesanales", icon: "🍺" },
  { value: "280+", label: "Cervecerías y bares", icon: "🏭" },
  { value: "8.5K+", label: "Amantes del lúpulo", icon: "💛" },
  { value: "42K+", label: "Reseñas y brindis", icon: "🍻" },
] as const;

export const STORY = [
  {
    chapter: "Capítulo I",
    title: "Aromas que despiertan algo nuevo",
    narrative:
      "Maracuyá, cacao tostado, pimienta rosa. Cada cerveza artesanal es un viaje sensorial creado con pasión. Aquí no buscas una birra más — encuentras la que va a cambiar tu forma de entender el lúpulo.",
    img: "/assets/personajes-landing/explorar-cervezas.png",
    accent: "#fbbf24",
    href: "/cervezas",
    cta: "Explorar el catálogo",
    icon: "🍺",
  },
  {
    chapter: "Capítulo II",
    title: "Donde el maestro cervecero abre la puerta",
    narrative:
      "La cervecería de barrio con recetas de tres generaciones. El taproom escondido donde prueban lotes experimentales. El rooftop donde el sunset sabe a dry hop. Lo mejor de la cerveza artesanal no está en las guías — está aquí.",
    img: "/assets/personajes-landing/encuentra-bares.png",
    accent: "#ef4444",
    href: "/lugares",
    cta: "Descubrir lugares",
    icon: "📍",
  },
  {
    chapter: "Capítulo III",
    title: "Fans y creadores, misma mesa",
    narrative:
      "Cerveceros que comparten recetas. Fans que descubren pequeños productores. Debates sobre si la Hazy cuenta como IPA. Fotos de tiradas perfectas. Aquí la pasión por la artesanal une a quienes la crean y quienes la disfrutan.",
    img: "/assets/personajes/sofilupula.png",
    accent: "#10b981",
    href: "/posts",
    cta: "Sentarme a la mesa",
    icon: "💬",
  },
  {
    chapter: "Epílogo",
    title: "Cada gran cerveza empezó con un primer sorbo",
    narrative:
      "Da igual si recién descubriste las IPAs o si llevas años perfeccionando tu receta. Todos empezamos curiosos. Aquí vas a encontrar tu gente, tus cervezas y los lugares que van a marcar tu historia.",
    img: "/assets/personajes/teamlupulos.png",
    accent: "#fbbf24",
    href: "/auth/register",
    cta: "Empezar mi camino",
    icon: "✨",
  },
];

export type StoryItem = (typeof STORY)[number];

export const STEPS = [
  {
    number: "01",
    title: "Crea tu perfil cervecero",
    desc: "30 segundos, cero costo. Cuéntanos si vienes a descubrir, a crear, o a las dos cosas.",
    icon: "user" as const,
  },
  {
    number: "02",
    title: "Explora un mundo curado",
    desc: "Catálogo artesanal, bares verificados y rankings honestos. Todo filtrado por estilo, aroma y puntuación.",
    icon: "search" as const,
  },
  {
    number: "03",
    title: "Comparte y conecta",
    desc: "Reseña, sube fotos, recomienda. Si además fabricas cerveza, muestra tu trabajo al público que lo valora.",
    icon: "chat" as const,
  },
] as const;

export type StepIconName = (typeof STEPS)[number]["icon"];

export const FEATURES = [
  { icon: "🧠", label: "Sommelier IA que conoce tu paladar" },
  { icon: "🏭", label: "Vitrina para cervecerías artesanales" },
  { icon: "🏆", label: "Rankings honestos de la comunidad" },
  { icon: "🍻", label: "Catas, festivales y encuentros" },
  { icon: "🗺️", label: "Mapa vivo de cervecerías y bares" },
  { icon: "⚡", label: "Conexión directa fan ↔ creador" },
] as const;

export const QUOTES = [
  "La mejor cerveza del mundo es la que aún no probaste.",
  "Detrás de cada gran cerveza hay alguien que puso el alma en la receta.",
  "El lúpulo une. La malta abraza. La comunidad lo celebra.",
  "No buscamos la cerveza perfecta — buscamos la perfecta para ti.",
  "Donde un fan descubre y un cervecero crea, nace algo mágico.",
];
