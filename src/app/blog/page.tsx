"use client";

import React, { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MainLayout from "@/components/layouts/MainLayout";
import { BlogCard } from "@/features/blog/components/BlogCard";
import { blogService, type Blog } from "@/features/blog/services/blogService";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const res = await blogService.getBlogs(1, 20);
        setBlogs(res.data);
      } catch (err: any) {
        setError(err.message || "Error al cargar los blogs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
    }),
  };

  return (
    <MainLayout>
      <div className="relative z-[2] mx-auto w-full max-w-5xl flex-1 px-4 pt-10 pb-12 sm:px-6">
        <motion.div initial="hidden" animate="visible" className="mb-10 text-center">
          <motion.span
            variants={fadeUp}
            custom={0}
            className="inline-block rounded-full border px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase backdrop-blur-sm"
            style={{
              borderColor: "var(--color-border-amber)",
              color: "var(--color-amber-primary)",
              background: "rgba(251,191,36,0.06)",
            }}
          >
            📰 Lúpulos Blog
          </motion.span>
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
            style={{ color: "var(--color-text-primary)" }}
          >
            Últimos <span style={{ color: "var(--color-amber-primary)" }}>Artículos</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-3 max-w-2xl text-sm sm:text-base"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Aprende sobre cervecería artesanal, descubre tendencias y lee historias increíbles de nuestra comunidad.
          </motion.p>
          
          <motion.div
            variants={fadeUp}
            custom={3}
            className="mt-6 flex justify-center"
          >
            <Link href="/blog/create" style={{ textDecoration: "none" }}>
              <button
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all"
                style={{
                  background: "var(--gradient-button-primary)",
                  color: "var(--color-text-dark)",
                  boxShadow: "var(--shadow-amber-glow)",
                }}
              >
                <AddIcon fontSize="small" /> Redactar Artículo
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
            <CircularProgress sx={{ color: "var(--color-amber-primary)" }} />
            <p style={{ color: "var(--color-text-secondary)" }}>Cargando artículos...</p>
          </div>
        ) : error ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-xl bg-red-900/20 p-6 text-center text-red-200 border border-red-900/50">
            <p>{error}</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center">
            <span className="mb-4 text-4xl">📝</span>
            <h3 className="mb-2 text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
              No hay artículos todavía
            </h3>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Vuelve pronto para leer nuestro contenido exclusivo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <BlogCard blog={blog} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
