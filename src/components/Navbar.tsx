"use client";

import React, { useState } from "react";
import {
  AppBar, Toolbar, Typography, Box, IconButton, Drawer, List,
  ListItem, ListItemIcon, ListItemText, useMediaQuery
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import SportsBarIcon from "@mui/icons-material/SportsBar";
import MapIcon from "@mui/icons-material/Map";
import GroupIcon from "@mui/icons-material/Group";
import ForumIcon from "@mui/icons-material/Forum";
import StarIcon from "@mui/icons-material/Star";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { usePathname } from "next/navigation";

const amarillo = "#fbbf24";

const navItems = [
  { href: "/", label: "Inicio", icon: <HomeIcon /> },
  { href: "/cervezas", label: "Cervezas", icon: <SportsBarIcon /> },
  { href: "/lugares", label: "Lugares", icon: <MapIcon /> },
  { href: "/usuarios", label: "Usuarios", icon: <GroupIcon /> },
  { href: "/posts", label: "Comunidad", icon: <ForumIcon /> },
  { href: "/planes", label: "Planes", icon: <StarIcon /> },
];

export default function Navbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ⚠️ Cambia el punto de quiebre a 979px
  const isSmallScreen = useMediaQuery("(max-width:979px)");

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: "#0f172a", boxShadow: "0 2px 10px rgba(0,0,0,0.4)" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight="bold" color={amarillo}>
            🍺 Lúpulos App
          </Typography>

          {isSmallScreen ? (
            <IconButton onClick={toggleDrawer} sx={{ color: "white" }}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Box display="flex" gap={2}>
              {navItems.map(({ href, label, icon }) => (
                <Link href={href} key={href} passHref>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "white",
                      px: 2,
                      borderBottom: pathname === href ? `2px solid ${amarillo}` : "2px solid transparent",
                      transition: "all 0.3s ease-in-out",
                      cursor: "pointer",
                      "&:hover": { borderBottom: `2px solid ${amarillo}` },
                    }}
                  >
                    {icon}
                    <Typography
                      variant="body2"
                      ml={1}
                      sx={{ display: isSmallScreen ? "none" : "inline" }}
                    >
                      {label}
                    </Typography>
                  </Box>
                </Link>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer para Mobile y Tablet */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ width: 240, bgcolor: "#0f172a", height: "100%", color: "white" }}>
          <List>
            {navItems.map(({ href, label, icon }) => (
              <Link href={href} key={href} passHref>
                <ListItem button selected={pathname === href} onClick={toggleDrawer}>
                  <ListItemIcon sx={{ color: amarillo }}>{icon}</ListItemIcon>
                  <ListItemText primary={label} />
                </ListItem>
              </Link>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
