"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Snackbar,
  Alert
} from "@mui/material";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3940";

interface Usuario {
  _id: string;
  nombre: string;
  fotoPerfil?: string;
}

interface Comentario {
  _id: string;
  usuario: Usuario;
  comentario: string;
  puntuacion: number;
  fecha: string;
}

interface Lugar {
  _id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  direccion: {
    calle: string;
    ciudad: string;
    pais: string;
  };
  comentarios: Comentario[];
}

export default function LugarDetallePage() {
  const { id } = useParams();
  const router = useRouter();

  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("#6EE7B7");

  useEffect(() => {
    const fetchLugar = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/location/${id}`);
        setLugar(res.data.data);
      } catch (error) {
        console.error("❌ Error al obtener lugar:", error);
        setSnackbarMessage("Error al cargar lugar");
        setSnackbarColor("#f87171");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLugar();
  }, [id]);

  if (loading || !lugar) {
    return <div className="p-10 text-white">Cargando lugar...</div>;
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "linear-gradient(to bottom, rgb(30, 41, 59), rgb(15, 23, 42))" }}>
      <Navbar />

      {/* CONTENIDO PRINCIPAL AQUÍ (si quieres mostrar info del lugar, imagen, etc.) */}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="info" sx={{ backgroundColor: snackbarColor, color: "black" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Footer />
    </div>
  );
}
