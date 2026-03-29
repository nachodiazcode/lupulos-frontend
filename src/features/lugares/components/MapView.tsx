"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress, Typography } from "@mui/material";

const MapViewInner = dynamic(() => import("./MapViewInner"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <CircularProgress sx={{ color: "var(--color-amber-primary)" }} />
      <Typography sx={{ color: "var(--color-text-secondary)" }}>Cargando mapa…</Typography>
    </Box>
  ),
});

export default MapViewInner;
