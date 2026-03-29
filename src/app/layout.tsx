import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Outfit } from "next/font/google";
import ThemeRegistry from "@/theme/ThemeRegistry";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import AppLoader from "@/components/AppLoader";
import { AuthProvider } from "@/context/AuthContext";
import "leaflet/dist/leaflet.css";
import "./globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Lúpulos App 🍺",
  description: "Explora y comparte las mejores cervezas artesanales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning style={{ background: "#0c0a09" }}>
      <head>
        {/* Inline script: set data-theme before first paint to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('lupulos-theme'),v=['lager','ambar','stout'],t=v.indexOf(s)>=0?s:'ambar';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.background=t==='lager'?'#f0e9dc':'#0c0a09';}catch(e){}}())`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}
      >
        <AuthProvider>
          <ReactQueryProvider>
            <ThemeRegistry>
              <AppLoader>{children}</AppLoader>
            </ThemeRegistry>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
