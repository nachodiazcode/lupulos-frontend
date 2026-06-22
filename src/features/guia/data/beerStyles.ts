export interface BeerStyle {
  id: string;
  name: string;
  description: string;
  image: string; // URL of a placeholder image or emoji icon
}

export const beerStyles: BeerStyle[] = [
  {
    id: "lager",
    name: "Lager Tradicional",
    description: "Lager es un tipo de cerveza que se sirve fría. La cerveza lager o rubia es la típica que se fermenta a bajas temperaturas.",
    image: "🍺",
  },
  {
    id: "bock",
    name: "Bock",
    description: "Bock es un tipo cerveza conocida como cerveza negra, excelente para acompañarla con comidas robustas y platos fuertes.",
    image: "🍻",
  },
  {
    id: "ale",
    name: "Ale",
    description: "Las cervezas Ale son cervezas que tienen un sabor más complejo, de fermentación alta y generalmente más afrutadas.",
    image: "🍺",
  },
  {
    id: "stout",
    name: "Stout",
    description: "Las cervezas Stout si bien son de fermentación alta muchas veces no son consideradas dentro del mismo espectro por su oscuridad.",
    image: "🍻",
  },
  {
    id: "ipa",
    name: "IPA (India Pale Ale)",
    description: "Conocidas por su característico sabor amargo y fuertes aromas florales, cítricos o pináceos debido a su alto contenido de lúpulo.",
    image: "🍺",
  },
  {
    id: "porter",
    name: "Porter",
    description: "Cerveza oscura de fermentación alta originaria de Londres. Sabor a malta tostada con notas de chocolate y café.",
    image: "🍻",
  },
  {
    id: "pilsner",
    name: "Pilsner",
    description: "Un tipo específico de Lager originaria de la ciudad de Pilsen. Clara, dorada, de cuerpo ligero y con un distintivo amargor.",
    image: "🍺",
  },
];
