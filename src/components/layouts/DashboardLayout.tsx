"use client";

import React, { useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SportsBarIcon from "@mui/icons-material/SportsBar";
import PlaceIcon from "@mui/icons-material/Place";
import ForumIcon from "@mui/icons-material/Forum";
import LogoutIcon from "@mui/icons-material/Logout";
import Link from "next/link";
import { useRouter } from "next/navigation";

const drawerWidth = 240;

const navItems = [
  { href: "/cervezas", text: "Cervezas", icon: <SportsBarIcon /> },
  { href: "/lugares", text: "Lugares", icon: <PlaceIcon /> },
  { href: "/posts", text: "Comunidad", icon: <ForumIcon /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    alert("Cerrar sesión");
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Lúpulos App
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#111827",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Toolbar />

        <Box sx={{ flexGrow: 1 }}>
          <List>
            {navItems.map((item) => (
              <ListItem
                key={item.href}
                component={Link}
                href={item.href}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  "&:hover": { backgroundColor: "#374151" },
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Logout anclado abajo sin errores */}
        <List>
          <ListItem
            component="div"
            onClick={handleLogout}
            sx={{
              cursor: "pointer",
              color: "white",
              textDecoration: "none",
              "&:hover": { backgroundColor: "#374151" },
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Cerrar sesión" />
          </ListItem>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: open ? `${drawerWidth}px` : 0,
          transition: "margin 0.3s ease",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
