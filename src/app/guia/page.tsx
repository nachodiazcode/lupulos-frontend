import GuiaPage from "@/features/guia/components/GuiaPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "La Guía | Lúpulos App",
  description: "Descubre los distintos estilos de cerveza en la guía de Lúpulos App.",
};

export default function Page() {
  return <GuiaPage />;
}
