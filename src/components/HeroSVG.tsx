"use client";

import { Box } from "@mui/material";
import Image from "next/image";

export default function HeroSVG() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        py: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        src="/images/lupin-lupina-hero.svg" // Asegúrate de que esté en /public/images/
        alt="Lupín y Lupina brindando"
        width={720}
        height={400}
        style={{ width: "100%", height: "auto" }}
        priority
      />
    </Box>
  );
}
