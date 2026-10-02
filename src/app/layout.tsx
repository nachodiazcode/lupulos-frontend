import type { Metadata } from "next";
import ThemeRegistry from "@/theme/ThemeRegistry";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import AppLoader from "@/components/AppLoader";
import { AuthProvider } from "@/context/AuthContext";
import { RealtimeProvider } from "@/context/RealtimeContext";
import Navbar from "@/components/Navbar";
import CommandPalette from "@/components/CommandPalette";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Lúpulos",
  description: "Catálogo, lugares y comunidad de cerveza artesanal en Chile",
};

const themeBootScript = `(function(){try{var key='lupulos-theme-v2';var themes=['corporativo','ambar','saintpatrick','stout','haze','dorado'];var backgrounds={corporativo:'#f4f1ea',ambar:'#160800',saintpatrick:'#f0fbf4',stout:'#080610',haze:'#f7f2ff',dorado:'#030201'};var stored=localStorage.getItem(key);var theme=themes.indexOf(stored)>=0?stored:'corporativo';var root=document.documentElement;root.setAttribute('data-theme',theme);root.style.background=backgrounds[theme]||backgrounds.corporativo;var light=theme==='corporativo'||theme==='saintpatrick'||theme==='haze';root.style.colorScheme=light?'light':'dark';}catch(e){}}())`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning style={{ background: "#f4f1ea" }}>
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
          <RealtimeProvider>
            <ReactQueryProvider>
              <ThemeRegistry>
                <Navbar />
                <CommandPalette />
                <AppLoader>{children}</AppLoader>
              </ThemeRegistry>
            </ReactQueryProvider>
          </RealtimeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
