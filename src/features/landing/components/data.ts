export const STATS = [
  { value: "1.2K+", label: "Cervezas craft catalogadas", icon: "🍺" },
  { value: "280+", label: "Cervecerías y taprooms en Chile", icon: "🏭" },
  { value: "8.5K+", label: "Cerveceros compartiendo pasión", icon: "💛" },
  { value: "42K+", label: "Reseñas honestas de la comunidad", icon: "🍻" },
] as const;

export const STORY = [
  {
    chapter: "Capítulo I",
    title: "Mil sabores esperando por tu próximo sorbo",
    narrative:
      "Pomelo fresco en una IPA de Valparaíso. Vainilla ahumada en una Stout del sur profundo. Merkén sobre una Golden Ale que nadie más ha probado. Cada cerveza artesanal en Chile tiene una historia fermentando adentro — y acá vas a encontrar las que te erizen la piel.",
    illustration: "explorar-cervezas" as const,
    accent: "#fbbf24",
    href: "/cervezas",
    cta: "Descubrir cervezas artesanales",
    icon: "🍺",
  },
  {
    chapter: "Capítulo II",
    title: "Taprooms secretos, cervecerías con alma",
    narrative:
      "El brewpub escondido en un pasaje de Bellavista donde fermentan a metros de tu mesa. La cervecería artesanal familiar en el Valle del Elqui que solo abre los viernes. El taproom frente al Pacífico donde cada pinta sabe a atardecer y sal. Chile cervecero es inmenso — y este mapa lo dibuja la gente que lo vive.",
    illustration: "encuentra-bares" as const,
    accent: "#ef4444",
    href: "/lugares",
    cta: "Explorar el mapa cervecero",
    icon: "📍",
  },
  {
    chapter: "Capítulo III",
    title: "Donde la birra se convierte en conversación",
    narrative:
      "Maestros cerveceros que comparten sus recetas sin guardarse nada. Fans que ponen en el mapa a productores invisibles. Debates eternos sobre si la Hazy merece llamarse IPA. Fotos de tiradas que te hacen buscar las llaves del auto. Acá la cerveza craft se vive en primera persona y en buena compañía.",
    illustration: "comunidad" as const,
    accent: "#10b981",
    href: "/posts",
    cta: "Unirme a la conversación",
    icon: "💬",
  },
  {
    chapter: "Epílogo",
    title: "Tu próximo capítulo se escribe con lúpulo",
    narrative:
      "No importa si recién descubriste qué es una IPA o si llevas años perfeccionando tu Stout imperial. Todos arrancamos con curiosidad y una pinta en la mano. Acá vas a encontrar tu gente, tus cervecerías artesanales favoritas y los rincones de Chile que van a marcar tu historia cervecera para siempre.",
    illustration: "team" as const,
    accent: "#fbbf24",
    href: "/auth/register",
    cta: "Crear mi cuenta gratis",
    icon: "✨",
  },
];

export type StoryItem = (typeof STORY)[number];

export const STEPS = [
  {
    number: "01",
    title: "Tu perfil cervecero en un parpadeo",
    desc: "Gratis y sin letra chica. Cuéntanos si vienes a descubrir cerveza artesanal, a mostrar la que fabricas, o ambas — te armamos la experiencia a tu medida.",
    icon: "user" as const,
  },
  {
    number: "02",
    title: "Encuentra la cerveza que no sabías que buscabas",
    desc: "+1.200 cervezas artesanales de Chile con notas de cata, opiniones reales y filtros por estilo — IPA, Stout, Lager, Sour y más. Tu próxima favorita está a un scroll.",
    icon: "search" as const,
  },
  {
    number: "03",
    title: "Publica, recomienda y hazte notar",
    desc: "Deja reseñas, sube fotos de tus hallazgos y recomienda cervecerías. Si brasceas, acá tu craft beer tiene la vitrina y el público que merece.",
    icon: "chat" as const,
  },
] as const;

export type StepIconName = (typeof STEPS)[number]["icon"];

export const FEATURES = [
  { icon: "🧠", label: "IA que afina tus gustos y anticipa tu próxima favorita" },
  { icon: "🏭", label: "Perfil propio para cada cervecería artesanal de Chile" },
  { icon: "🏆", label: "Rankings reales votados por miles, cero algoritmos turbios" },
  { icon: "🍻", label: "Catas, festivales y encuentros que no te puedes perder" },
  { icon: "🗺️", label: "Mapa vivo de taprooms, brewpubs y cervecerías en todo Chile" },
  { icon: "⚡", label: "Puente directo entre quien bebe craft beer y quien la crea" },
] as const;

export const QUOTES = [
  "La mejor cerveza artesanal del mundo es la que todavía no probaste — y alguien en Chile la está fermentando ahora mismo.",
  "Cada pinta craft lleva adentro las manos de alguien que eligió crear algo propio en vez de repetir lo de siempre.",
  "La malta abraza, el lúpulo despierta y la comunidad brinda: así nace todo lo que vale la pena.",
  "No existe la cerveza perfecta — pero existe la perfecta para esta noche, esta mesa y esta compañía.",
  "Donde alguien descubre una IPA que le vuela la cabeza y alguien más la creó en su garage, ahí empieza algo grande.",
];
