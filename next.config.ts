import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  // Suppress Sass @import deprecation — Tailwind v4 requires `@import "tailwindcss"`
  // which Sass flags as deprecated. This is harmless; the import is processed by
  // PostCSS (Tailwind's plugin), not by Sass itself.
  sassOptions: {
    silenceDeprecations: ["import"],
  },

  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "@mui/lab",
      "@emotion/react",
      "@emotion/styled",
      "framer-motion",
      "lucide-react",
      "@heroicons/react",
    ],
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lupulos.app" },
      { protocol: "https", hostname: "lupulos-dev.duckdns.org" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "64.23.255.101", port: "3940" },
      { protocol: "http", hostname: "localhost", port: "3001" },
      { protocol: "http", hostname: "localhost", port: "3940" },
      { protocol: "http", hostname: "127.0.0.1", port: "3001" },
      { protocol: "http", hostname: "127.0.0.1", port: "3940" },
    ],
  },
};

export default nextConfig;
