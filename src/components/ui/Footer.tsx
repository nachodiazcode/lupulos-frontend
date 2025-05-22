"use client";

import React from "react";
import { Box, Typography, Container, Link as MuiLink } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: "#1a1a1a",
        color: "white",
        borderTop: "1px solid #333",
      }}
    >
      <Container maxWidth="lg" sx={{ textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary" sx={{ color: "#ccc" }}>
          © {new Date().getFullYear()}{" "}
          <MuiLink href="/" underline="hover" color="inherit">
            Lúpulos App
          </MuiLink>{" "}
          · Hecho con 🍻 y pasión.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
