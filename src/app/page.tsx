"use client";

import { Box, Typography, Button, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#D7981C",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
        px: 4,
        py: 10,
      }}
    >




      {/* TITULO */}
      <Typography
        variant="h2"
        sx={{
          fontFamily: "'Lora', serif",
          fontSize: { xs: "2.5rem", md: "3.5rem" },
          fontWeight: 900,
          color: "#3a1f00",
          textAlign: "center",
          textShadow: "2px 2px 6px rgba(255, 215, 135, 0.6)", // Sombra clara difusa
          zIndex: 2,
          position: "relative",
        }}
      >
        Explora el mundo cervecero <br />
        como nunca antes 🍺
      </Typography>

      {/* DESCRIPCIÓN */}
      <Typography
        variant="body1"
        sx={{
          mt: 3,
          maxWidth: 800,
          fontWeight: 480,
          fontSize: "1.5rem",
          color: "#3a1f00",
          textAlign: "center",
          textShadow: "2px 2px 5px rgba(255, 235, 175, 0.6)", // Sombra clara dorada
          zIndex: 2,
          position: "relative",
        }}
      >
        Encuentra cervezas artesanales, bares escondidos, eventos vikingos y comparte tu pasión por el lúpulo. Bienvenido a tu comunidad cervecera.
      </Typography>

      {/* BOTONES */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mt={4}
        alignItems="center"
        justifyContent="center"
        zIndex={2}
      >
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#4A2502",
            color: "#fff",
            px: 4,
            py: 1.5,
            borderRadius: "999px",
            fontWeight: "bold",
            "&:hover": { backgroundColor: "#3a1f00" },
          }}
          onClick={() => router.push("/auth/login")}
        >
          Explorar Cervezas
        </Button>

        <Button
          variant="outlined"
          sx={{
            borderColor: "#4A2502",
            color: "#4A2502",
            px: 4,
            py: 1.5,
            borderRadius: "999px",
            fontWeight: "bold",
            "&:hover": { backgroundColor: "#4A250220" },
          }}
          onClick={() => router.push("/auth/login")}
        >
          Conocer Comunidad
        </Button>
      </Stack>

      {/* PERSONAJES */}
      <Box
        sx={{
          mt: 8,
          width: { xs: 280, md: 420 },
          animation: "float 5s ease-in-out infinite",
          zIndex: 2,
        }}
      >
        <Image
          src="/assets/personajes/lupinvikingoylupincervesota.png"
          alt="personajes cerveza y lúpulo"
          width={600}
          height={400}
          style={{ width: "100%", height: "auto" }}
        />
      </Box>

      {/* ANIMACIONES */}
      <style jsx global>{`
        @keyframes starsMove {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 1000px 1000px;
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </Box>
  );
}
