"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, Button, Stack, Container, Paper } from "@mui/material";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SECTIONS = [
  {
    title: "🍺 Cervezas Artesanales",
    description: "Descubre y filtra cervezas chilenas e internacionales según estilo, sabor y amargor. ¡Encuentra tu favorita!",
    button: "VER CERVEZAS",
    route: "/auth/login",
  },
  {
    title: "📍 Lugares Imperdibles",
    description: "Explora bares, festivales y locales donde vivir la experiencia cervecera. Opiniones y mapas en tiempo real.",
    button: "EXPLORAR LUGARES",
    route: "/auth/login",
  },
  {
    title: "👥 Comunidad Lúpulos",
    description: "Conecta con amantes de la cerveza, comenta descubrimientos y brinda 'salud' a tus etiquetas favoritas.",
    button: "UNIRSE A LA COMUNIDAD",
    route: "/auth/login",
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <Box sx={{ bgcolor: "#cdb9a5", color: "#1e1e1e", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* HERO */}
      <Box
        sx={{
          py: 12,
          px: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="h2" fontWeight="bold" color="#1e1e1e" gutterBottom>
          Bienvenido a Lúpulos App
        </Typography>
        <Typography variant="h6" sx={{ maxWidth: 700, mb: 5 }}>
          Descubre cervezas únicas, lugares auténticos y conecta con amantes de la cultura cervecera. Todo en una sola plataforma.
        </Typography>

        {/* BOTONES PRINCIPALES */}
        <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center" mb={8}>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push("/auth/login")}
            sx={{
              bgcolor: "#fbbf24",
              color: "#000",
              fontWeight: "bold",
              px: 4,
              "&:hover": { bgcolor: "#f59e0b" },
            }}
          >
            EXPLORAR CERVEZAS
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push("/auth/login")}
            sx={{
              color: "#1e1e1e",
              borderColor: "#1e1e1e",
              px: 4,
              fontWeight: "bold",
              "&:hover": { bgcolor: "#1e1e1e11" },
            }}
          >
            CONOCER COMUNIDAD
          </Button>
        </Stack>

        {/* TARJETAS HORIZONTALES */}
        <Container sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" flexWrap="wrap" gap={4}>
            {SECTIONS.map((item, idx) => (
              <Paper
                key={idx}
                elevation={4}
                sx={{
                  bgcolor: "#3b2f1e",
                  color: "#fefce8",
                  border: "1px solid #fbbf24",
                  borderRadius: 4,
                  p: 4,
                  width: { xs: "100%", sm: "90%", md: "30%" },
                  minWidth: 280,
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: 6,
                  },
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom color="#fbbf24">
                  {item.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{item.description}</Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => router.push(item.route)}
                  sx={{
                    color: "#fbbf24",
                    borderColor: "#fbbf24",
                    "&:hover": { bgcolor: "#fbbf2411" },
                  }}
                >
                  {item.button}
                </Button>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
