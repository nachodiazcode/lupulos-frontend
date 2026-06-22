"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MainLayout from "@/components/layouts/MainLayout";
import { blogService, type Blog } from "@/features/blog/services/blogService";

export default function BlogPostPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true);
        const res = await blogService.getBlogBySlug(slug);
        setBlog(res.data);
      } catch (err: any) {
        setError(err.message || "Error al cargar el artículo");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <CircularProgress sx={{ color: "var(--color-amber-primary)" }} />
          <p style={{ color: "var(--color-text-secondary)" }}>Cargando artículo...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !blog) {
    return (
      <MainLayout>
        <div className="mx-auto mt-20 max-w-3xl px-6 text-center">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8">
            <h2 className="mb-4 text-2xl font-bold text-red-400">¡Ups! Algo salió mal</h2>
            <p className="mb-6 text-red-200/80">{error || "No pudimos encontrar el artículo."}</p>
            <button
              onClick={() => router.push("/blog")}
              className="rounded-xl px-6 py-2.5 font-semibold transition-colors"
              style={{ background: "var(--color-amber-primary)", color: "var(--color-text-dark)" }}
            >
              Volver al Blog
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const formattedDate = new Date(blog.createdAt).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <MainLayout>
      <article className="relative z-[2] mx-auto w-full max-w-4xl px-4 pt-8 pb-20 sm:px-6">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/blog")}
          className="mb-8 flex items-center gap-2 text-sm font-medium transition-colors hover:text-amber-400"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <ArrowBackIcon fontSize="small" /> Volver al Blog
        </motion.button>

        {/* Header del Artículo */}
        <header className="mb-10 text-center sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-wrap justify-center gap-2"
          >
            {blog.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                style={{
                  background: "rgba(251,191,36,0.15)",
                  color: "var(--color-amber-primary)",
                }}
              >
                {tag}
              </span>
            ))}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl"
            style={{ color: "var(--color-text-primary)" }}
          >
            {blog.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <div className="flex items-center gap-2">
              <img
                src={blog.author.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author.name)}&background=random`}
                alt={blog.author.name}
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="font-semibold text-white">{blog.author.name}</span>
            </div>
            <span>•</span>
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{blog.views} vistas</span>
          </motion.div>
        </header>

        {/* Imagen de Portada */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-12 overflow-hidden rounded-3xl border"
          style={{ borderColor: "var(--color-border-subtle)" }}
        >
          <img
            src={blog.coverImage || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop"}
            alt={blog.title}
            className="h-auto w-full object-cover"
            style={{ maxHeight: "500px" }}
          />
        </motion.div>

        {/* Contenido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="prose prose-invert mx-auto max-w-3xl lg:prose-lg"
          style={{ 
            color: "var(--color-text-secondary)",
            fontSize: "1.1rem",
            lineHeight: "1.8"
          }}
        >
          {/* Aquí podríamos usar react-markdown, pero por ahora renderizamos pre-formatted string o HTML */}
          <div 
            dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br/>') }} 
            className="blog-content"
          />
        </motion.div>
        
        <style dangerouslySetInnerHTML={{__html: `
          .blog-content h1, .blog-content h2, .blog-content h3 {
            color: var(--color-text-primary);
            font-weight: 700;
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
          .blog-content p {
            margin-bottom: 1.5rem;
          }
        `}} />
      </article>
    </MainLayout>
  );
}
