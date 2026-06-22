"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { CircularProgress, Snackbar, Alert } from "@mui/material";
import MainLayout from "@/components/layouts/MainLayout";
import { blogService } from "@/features/blog/services/blogService";
import styles from "./page.module.scss";

// Import Quill dynamically to avoid "document is not defined" SSR errors
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function CreateBlogPage() {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [content, setContent] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success"|"error" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setToast({ open: true, message: "El título y el contenido son obligatorios.", type: "error" });
      return;
    }

    try {
      setIsSubmitting(true);
      const tagsArray = tags.split(",").map(t => t.trim()).filter(Boolean);
      
      await blogService.createBlog({
        title,
        content,
        coverImage,
        tags: tagsArray,
        status
      });

      setToast({ open: true, message: "¡Artículo publicado con éxito!", type: "success" });
      setTimeout(() => {
        router.push("/blog");
      }, 1500);
      
    } catch (err: any) {
      setToast({ open: true, message: err.message || "Error al crear el artículo.", type: "error" });
      setIsSubmitting(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <motion.div 
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.header}>
            <h1 className={styles.title}>Redactar Artículo</h1>
            <p className={styles.subtitle}>Escribe algo genial para la comunidad cervecera.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Título del artículo *</label>
              <input 
                type="text" 
                className={styles.input}
                placeholder="Ej. Guía para catar IPAs"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Imagen de portada (URL)</label>
              <input 
                type="url" 
                className={styles.input}
                placeholder="https://ejemplo.com/imagen.jpg"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={styles.formGroup}>
                <label className={styles.label}>Etiquetas (separadas por coma)</label>
                <input 
                  type="text" 
                  className={styles.input}
                  placeholder="IPA, Guía, Historia"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Estado de publicación</label>
                <select 
                  className={styles.input}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "draft"|"published")}
                >
                  <option value="published">Publicado (Visible)</option>
                  <option value="draft">Borrador (Oculto)</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Contenido del artículo *</label>
              <div className={styles.editorContainer}>
                <ReactQuill 
                  theme="snow" 
                  value={content} 
                  onChange={setContent}
                  modules={quillModules}
                  placeholder="Escribe el cuerpo de tu artículo aquí..."
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button 
                type="button" 
                className={styles.btnCancel}
                onClick={() => router.push("/blog")}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className={styles.btnSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <CircularProgress size={16} color="inherit" /> Guardando...
                  </span>
                ) : (
                  "Publicar Artículo"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <Snackbar 
        open={toast.open} 
        autoHideDuration={4000} 
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          onClose={() => setToast({ ...toast, open: false })} 
          severity={toast.type} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
