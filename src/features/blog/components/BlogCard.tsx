"use client";

import React from "react";
import Link from "next/link";
import styles from "./BlogCard.module.scss";
import type { Blog } from "../services/blogService";

interface BlogCardProps {
  blog: Blog;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  const formattedDate = new Date(blog.createdAt).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link href={`/blog/${blog.slug}`} style={{ textDecoration: "none" }}>
      <article className={styles.card}>
        <div className={styles.imageContainer}>
          <img 
            src={blog.coverImage || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop"} 
            alt={blog.title} 
            loading="lazy"
          />
        </div>
        
        <div className={styles.content}>
          <div className={styles.tags}>
            {blog.tags?.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
            {(!blog.tags || blog.tags.length === 0) && (
              <span className={styles.tag}>Cerveza</span>
            )}
          </div>
          
          <h2 className={styles.title}>{blog.title}</h2>
          
          {/* We show a snippet of content as summary */}
          <p className={styles.summary}>
            {blog.content.substring(0, 150)}...
          </p>
          
          <div className={styles.footer}>
            <div className={styles.author}>
              <img 
                src={blog.author.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author.name)}&background=random`} 
                alt={blog.author.name} 
                className={styles.avatar} 
              />
              <span className={styles.name}>{blog.author.name}</span>
            </div>
            <div className={styles.meta}>
              <span>{formattedDate}</span>
              <span>•</span>
              <span>{blog.views} vistas</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};
