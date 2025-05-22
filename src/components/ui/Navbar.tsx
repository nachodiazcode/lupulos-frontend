"use client";

import React from "react";
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Typography } from "@mui/material";
import SportsBarIcon from "@mui/icons-material/SportsBar";
import PlaceIcon from "@mui/icons-material/Place";
import ForumIcon from "@mui/icons-material/Forum";
import HomeIcon from "@mui/icons-material/Home";
import Link from "next/link";

const navItems = [
  { label: "Inicio", href: "/", icon: <HomeIcon /> },
  { label: "Cervezas", href: "/cervezas", icon: <SportsBarIcon /> },
  { label: "Lugares", href: "/lugares", icon: <PlaceIcon /> },
  { label: "Comunidad", href: "/posts", icon: <ForumIcon /> },
];

const Menu = () => {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          bgcolor: "#0f0f0f",
          color: "#f1f5f9",
          borderRight: "1px solid #1f2937",
        },
      }}
    >
      <Box sx={{ px: 2, py: 3 }}>
        <Typography variant="h6" fontWeight="bold" color="#fbbf24">
          Lúpulos
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            sx={{
              "&:hover": {
                bgcolor: "#1f2937",
              },
            }}
          >
            <ListItemIcon sx={{ color: "#fbbf24" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default Menu;
