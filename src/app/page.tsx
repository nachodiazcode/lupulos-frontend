"use client";

import { Box, Button, Typography, Container, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import GoldenBackground from "@/components/GoldenBackground";
import { keyframes } from "@emotion/react";

// ✨ Animaciones suaves
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function HomePage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        background: "transparent", // fondo controlado por GoldenBackground
        animation: `${fadeIn} 1s ease-out`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 🍺 Fondo animado con partículas */}
      <GoldenBackground />

      {/* 🌟 Contenido principal */}
      <Container
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          zIndex: 2,
          pt: 10,
          pb: 6,
        }}
      >
        {/* Título */}
        <Typography
          variant="h1"
          fontWeight="900"
          sx={{
            fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
            color: "white",
            mb: 3,
            letterSpacing: "-1px",
            animation: `${fadeIn} 1.2s ease-out`,
          }}
        >
          Bienvenido a <br />
          <span style={{ color: "#fbbf24" }}>Lupuverse 🍻</span>
        </Typography>

        {/* Subtítulo */}
        <Typography
          variant="subtitle1"
          sx={{
            color: "#cbd5e1",
            fontSize: { xs: "1rem", sm: "1.2rem" },
            mb: 5,
            maxWidth: 600,
            animation: `${fadeIn} 1.4s ease-out`,
          }}
        >
          Una dimensión cervecera con personajes, lugares mágicos y aventuras espumantes. ¡Explora, descubre y conéctate!
        </Typography>

        {/* Botones */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          sx={{ animation: `${fadeIn} 1.6s ease-out`, mb: 6 }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "#fbbf24",
              color: "black",
              fontWeight: "bold",
              px: 5,
              py: 1.5,
              borderRadius: 2,
              '&:hover': { bgcolor: "#f59e0b" },
            }}
            onClick={() => router.push("/auth/login")}
          >
            Entrar al Lupuverso
          </Button>

          <Button
            variant="outlined"
            size="large"
            sx={{
              borderColor: "#fbbf24",
              color: "#fbbf24",
              fontWeight: "bold",
              px: 5,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                borderColor: "#f59e0b",
                color: "#f59e0b",
              },
            }}
            onClick={() => router.push("/personajes")}
          >
            Conocer a Lupin 🧝‍♂️
          </Button>
        </Stack>

        {/* Imagen de personajes */}
        <Box
          component="img"
          src="/assets/personajes/lupuverse.png"
          alt="Team Lúpulos"
          sx={{
            width: { xs: "100%", sm: "80%", md: "65%" },
            maxWidth: 900,
            animation: `${fadeIn} 1s ease-out`,
            filter: "drop-shadow(0 5px 20px rgba(0,0,0,0.3))",
          }}
        />
      </Container>

      <Footer />
    </Box>
  );
}
