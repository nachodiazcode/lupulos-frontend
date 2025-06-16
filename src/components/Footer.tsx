"use client";

import { Box, Container, Grid, Typography, Link as MuiLink, Stack, Divider } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";

export default function Footer() {
  return (
    <Box sx={{ backgroundColor: "#2e1a10", color: "white", pt: 8, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Lúpulos App 🍺
            </Typography>
            <Typography variant="body2">
              Plataforma para descubrir cervezas artesanales chilenas, compartir en comunidad y encontrar los mejores bares vikingos.
            </Typography>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Empresa
            </Typography>
            <Stack spacing={1}>
              <MuiLink href="/nosotros" underline="hover" color="inherit">Sobre Nosotros</MuiLink>
              <MuiLink href="/equipo" underline="hover" color="inherit">Equipo</MuiLink>
              <MuiLink href="/blog" underline="hover" color="inherit">Blog</MuiLink>
              <MuiLink href="/contacto" underline="hover" color="inherit">Contacto</MuiLink>
            </Stack>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Recursos
            </Typography>
            <Stack spacing={1}>
              <MuiLink href="/terminos" underline="hover" color="inherit">Términos y condiciones</MuiLink>
              <MuiLink href="/privacidad" underline="hover" color="inherit">Política de Privacidad</MuiLink>
              <MuiLink href="/soporte" underline="hover" color="inherit">Centro de Ayuda</MuiLink>
              <MuiLink href="/preguntas" underline="hover" color="inherit">Preguntas Frecuentes</MuiLink>
            </Stack>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Redes Sociales
            </Typography>
            <Stack direction="row" spacing={2}>
              <MuiLink href="https://facebook.com" target="_blank" rel="noopener" color="inherit">
                <FacebookIcon />
              </MuiLink>
              <MuiLink href="https://instagram.com" target="_blank" rel="noopener" color="inherit">
                <InstagramIcon />
              </MuiLink>
              <MuiLink href="https://github.com" target="_blank" rel="noopener" color="inherit">
                <GitHubIcon />
              </MuiLink>
              <MuiLink href="https://twitter.com" target="_blank" rel="noopener" color="inherit">
                <TwitterIcon />
              </MuiLink>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.2)" }} />

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body2" sx={{ color: "#ddd" }}>
            © {new Date().getFullYear()} Lúpulos App. Todos los derechos reservados.
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: "italic", color: "#fbbf24" }}>
            Hecho con 🍺 por Nacho Díaz
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
