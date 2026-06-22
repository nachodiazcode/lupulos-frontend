"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Switch,
  FormControlLabel,
  Chip,
  Divider,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import Footer from "@/components/Footer";
import GoldenBackground from "@/components/GoldenBackground";
import PageContainer from "@/components/layouts/PageContainer";

const amarillo = "var(--color-amber-primary)";

export default function PlanesPage() {
  const [anual, setAnual] = useState(false);
  const router = useRouter();

  const planes = [
    {
      slug: "free",
      nombre: "Gratis",
      descripcion: "Explora cervezas, lugares y comenta libremente.",
      beneficios: [
        "✔️ Acceso a catálogo de cervezas",
        "✔️ Ver lugares cerveceros",
        "✔️ Comentar y reaccionar",
        "✔️ Hasta 5 cervezas/mes",
        "✔️ Hasta 10 posts/mes",
      ],
      icono: <LocalBarIcon sx={{ fontSize: 48 }} />,
      color: "var(--color-surface-elevated)",
      boton: "Comenzar",
      ruta: "/cervezas",
      precioMensual: "$0 CLP",
      precioAnual: "$0 CLP",
    },
    {
      slug: "lupuloso",
      nombre: "Lupuloso",
      descripcion: "Para los fanáticos que quieren ir más allá.",
      beneficios: [
        "✨ Todo lo del plan Gratis",
        "✨ Destaca tus comentarios",
        "✨ Agrega lugares a la app",
        "✨ Perfil personalizado",
        "✨ Hasta 20 cervezas/mes",
        "✨ Hasta 50 posts/mes",
      ],
      icono: <StarBorderIcon sx={{ fontSize: 48 }} />,
      color: "#334155",
      boton: "Suscribirse",
      ruta: "/auth/registro",
      destacado: true,
      precioMensual: "$2.000 CLP",
      precioAnual: "$20.000 CLP",
    },
    {
      slug: "pro",
      nombre: "Cervecero Pro",
      descripcion: "Ideal para expertos y cervecerías.",
      beneficios: [
        "🏆 Todo lo del plan Lupuloso",
        "🏆 Cervezas y posts ilimitados",
        "🏆 Subir videos de cervezas",
        "🏆 Fijar posts destacados",
        "🏆 Analítica de publicaciones",
        "🏆 Badge de Experto Cervecero",
        "🏆 Contenido premium exclusivo",
      ],
      icono: <EmojiEventsIcon sx={{ fontSize: 48 }} />,
      color: "#475569",
      boton: "Upgrade Pro",
      ruta: "/auth/registro",
      precioMensual: "$6.000 CLP",
      precioAnual: "$60.000 CLP",
    },
    {
      slug: "explorer",
      nombre: "Explorador",
      descripcion: "Para los que quieren probar funciones antes que nadie.",
      beneficios: [
        "🧪 Todo lo del plan Pro",
        "🧪 Acceso beta a funciones nuevas",
        "🧪 Feedback directo con el equipo",
        "🧪 Eventos exclusivos",
      ],
      icono: <AutoAwesomeIcon sx={{ fontSize: 48 }} />,
      color: "#4b5563",
      boton: "Unirme",
      ruta: "/auth/registro",
      precioMensual: "$9.000 CLP",
      precioAnual: "$85.000 CLP",
    },
  ];

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", pb: 10 }}>
      <GoldenBackground />

      <PageContainer className="relative z-10 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h2"
            align="center"
            fontWeight="bold"
            sx={{ mb: 1, color: amarillo, letterSpacing: 1 }}
          >
            Planes de Lúpulos 🍻
          </Typography>

          <Box
            sx={{
              width: 120,
              height: 4,
              backgroundColor: amarillo,
              borderRadius: 4,
              mx: "auto",
              mb: 3,
            }}
          />

          <Typography align="center" sx={{ color: "#cbd5e1", mb: 5 }}>
            Elige el plan que se adapte a tu nivel de pasión cervecera.
          </Typography>

          <Box textAlign="center" mb={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={anual}
                  onChange={() => setAnual(!anual)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: amarillo,
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: amarillo,
                    },
                  }}
                />
              }
              label={anual ? "Pago Anual" : "Pago Mensual"}
              sx={{ color: "#ccc" }}
            />
          </Box>
        </motion.div>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
        >
          {planes.map((plan, i) => (
            <motion.div
              key={plan.nombre}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              style={{ flex: 1, minWidth: 280, position: "relative" }}
            >
              <Card
                sx={{
                  background: `linear-gradient(145deg, ${plan.color}, #0f172a)`,
                  color: "white",
                  borderRadius: 5,
                  boxShadow: 12,
                  backdropFilter: "blur(6px)",
                  border: plan.destacado ? `2px solid ${amarillo}` : undefined,
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: `0 12px 25px ${amarillo}33`,
                  },
                }}
              >
                {plan.destacado && (
                  <Chip
                    label="Más conveniente"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      backgroundColor: amarillo,
                      color: "#000",
                      fontWeight: "bold",
                    }}
                  />
                )}

                <CardContent>
                  <Box display="flex" justifyContent="center" mb={2}>
                    <motion.div whileHover={{ scale: 1.15, rotate: 4 }}>{plan.icono}</motion.div>
                  </Box>
                  <Typography variant="h5" align="center" fontWeight="bold">
                    {plan.nombre}
                  </Typography>
                  <Typography align="center" sx={{ mb: 1 }}>
                    {plan.descripcion}
                  </Typography>

                  <Divider sx={{ borderColor: "#444", my: 2 }} />

                  <Typography
                    align="center"
                    sx={{
                      color: amarillo,
                      fontSize: 20,
                      fontWeight: "bold",
                      mb: 2,
                    }}
                  >
                    {anual ? plan.precioAnual : plan.precioMensual}
                  </Typography>

                  {plan.beneficios.map((b, idx) => (
                    <Typography
                      key={idx}
                      variant="body2"
                      sx={{ mb: 0.5, color: "#e2e8f0" }}
                      align="center"
                    >
                      {b}
                    </Typography>
                  ))}
                </CardContent>

                <Box p={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: amarillo,
                      color: "#000",
                      fontWeight: "bold",
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: "#facc15",
                      },
                    }}
                    onClick={() => router.push(plan.ruta)}
                  >
                    {anual ? `${plan.boton} Anual` : `${plan.boton} Mensual`}
                  </Button>
                </Box>
              </Card>
            </motion.div>
          ))}
        </Stack>
      </PageContainer>

      <Footer />
    </Box>
  );
}
