import type { Metadata } from "next";
import ThemeRegistry from "@/theme/ThemeRegistry";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import AppLoader from "@/components/AppLoader";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Lúpulos App 🍺",
  description: "Explora y comparte las mejores cervezas artesanales",
};

const themeBootScript = `(function(){try{var key='lupulos-theme';var themes=['ambar','saintpatrick','stout','haze','dorado'];var backgrounds={ambar:'#160800',saintpatrick:'#e0f0e6',stout:'#080610',haze:'#ede5ff',dorado:'#030201'};var stored=localStorage.getItem(key);var theme=themes.indexOf(stored)>=0?stored:'stout';var root=document.documentElement;root.setAttribute('data-theme',theme);root.style.background=backgrounds[theme]||backgrounds.stout;root.style.colorScheme=theme==='saintpatrick'||theme==='haze'?'light':'dark';}catch(e){}}())`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning style={{ background: "#080610" }}>
      <head>
        {/* Inline script: set data-theme before first paint to prevent FOUC */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: themeBootScript,
          }}
        />
      </head>
      <body className="antialiased">
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
