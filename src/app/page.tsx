"use client";

import { Box, Typography, Button, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import FraseCervecera from "@/components/FraseCervecera";
import Footer from "@/components/Footer";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <>
      <Navbar />

      {/* HERO */}
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #FFD580, #D7981C)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          px: 4,
          pt: 12,
          pb: 8,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontFamily: "'Lora', serif",
            fontWeight: 900,
            fontSize: { xs: "2.7rem", md: "3.7rem" },
            color: "#3a1f00",
            textShadow: "2px 2px 6px rgba(255, 215, 135, 0.6)",
          }}
        >
          Explora el mundo cervecero <br />
          como nunca antes 🍺
        </Typography>

        <Typography
          sx={{
            mt: 3,
            fontSize: { xs: "1.2rem", md: "1.5rem" },
            color: "#3a1f00",
            maxWidth: 800,
            textShadow: "1px 1px 5px rgba(255, 230, 170, 0.5)",
          }}
        >
          Encuentra cervezas artesanales, bares ocultos y comparte tu pasión por el lúpulo.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          mt={4}
          alignItems="center"
        >
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#4A2502",
              px: 4,
              py: 1.5,
              borderRadius: "999px",
              fontWeight: "bold",
              color: "#fff",
              "&:hover": { backgroundColor: "#3a1f00" },
            }}
            onClick={() => router.push("/auth/login")}
          >
            ¡Comenzar a descubrir!
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
              "&:hover": { backgroundColor: "#4A250210" },
            }}
            onClick={() => router.push("/comunidad")}
          >
            Conocer Comunidad
          </Button>
        </Stack>

        <Box sx={{ mt: 8, width: { xs: 280, md: 420 }, animation: "float 5s ease-in-out infinite" }}>
          <Image
            src="/personajes/lupinvikingoylupincervesota.png"
            alt="personajes cerveza y lúpulo"
            width={600}
            height={400}
            style={{ width: "100%", height: "auto" }}
          />
        </Box>
      </Box>

      {/* FUNCIONALIDADES DESTACADAS */}
      <Box
        sx={{
          mt: { xs: 10, md: 20 },
          px: 4,
          py: 10,
          background: "linear-gradient(145deg, #fff8ec, #ffecc4)",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Lora', serif",
            fontWeight: 800,
            fontSize: { xs: "2rem", md: "3rem" },
            color: "#3a1f00",
            mb: 6,
            animation: "fadeIn 2s ease-in-out forwards",
          }}
        >
          ¿Qué puedes hacer con Lúpulos App? 🍺✨
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
          maxWidth={1200}
          mx="auto"
        >
          {[
            {
              titulo: "🍻 Explora Cervezas",
              desc: "Descubre cientos de cervezas artesanales chilenas con reseñas, imágenes, puntuaciones y más.",
              img: "/personajes/explorar-cervezas.png",
            },
            {
              titulo: "📍 Encuentra Bares",
              desc: "Explora bares ocultos, beer gardens y lugares vikingos para probar nuevas experiencias.",
              img: "/personajes/encuentra-bares.png",
            },
            {
              titulo: "🗣️ Comparte en Comunidad",
              desc: "Comenta, comparte fotos, videos y saludos vikingos con otros amantes del lúpulo.",
              img: "/personajes/comparte-comunidades.png",
            },
          ].map((item, i) => (
            <Box
              key={i}
              sx={{
                backgroundColor: "#fffaf3",
                borderRadius: 4,
                boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                p: 4,
                flex: 1,
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                },
              }}
            >
              <Image
                src={item.img}
                alt={item.titulo}
                width={400}
                height={250}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "12px",
                  marginBottom: "1rem",
                }}
              />
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#3a1f00", mb: 1 }}>
                {item.titulo}
              </Typography>
              <Typography variant="body1" sx={{ color: "#5c3b1a" }}>
                {item.desc}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <FraseCervecera />
      <Footer />

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
