import type { NextConfig } from "next";
const normalizeApiTarget = (value: string | undefined): string =>
  (value || "").trim().replace(/\/api\/?$/, "").replace(/\/$/, "");

const apiProxyTarget = normalizeApiTarget(process.env.API_PROXY_TARGET);

const nextConfig: NextConfig = {
  reactStrictMode: false,
  devIndicators: false,

  // Suppress Sass deprecations that are currently expected in our toolchain:
  // - `import`: Tailwind v4 still uses `@import "tailwindcss"` in globals.scss
  // - `legacy-js-api`: emitted by the Sass loader path Next/Webpack still uses
  // Both are harmless for the app and just add noise to local dev/build logs.
  sassOptions: {
    silenceDeprecations: ["import", "legacy-js-api"],
  },

  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "@emotion/react",
      "@emotion/styled",
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

  async rewrites() {
    if (!apiProxyTarget) return [];

    return [
      { source: "/api/:path*", destination: `${apiProxyTarget}/api/:path*` },
      { source: "/uploads/:path*", destination: `${apiProxyTarget}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
