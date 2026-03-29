"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const footerLinks = {
  Explorar: [
    { label: "Cervezas", href: "/cervezas" },
    { label: "Lugares", href: "/lugares" },
    { label: "Comunidad", href: "/posts" },
    { label: "Usuarios", href: "/usuarios" },
  ],
  Cuenta: [
    { label: "Iniciar sesión", href: "/auth/login" },
    { label: "Registrarse", href: "/auth/register" },
    { label: "Mi perfil", href: "/auth/perfil" },
  ],
};

export default function Footer() {
  return (
    <footer
      className="border-border-subtle border-t"
      style={{ background: "var(--gradient-footer)" }}
    >
      <div className="home-content-shell py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/assets/logo.gif"
                  alt="Lúpulos App"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              </motion.div>
              <span className="text-text-primary text-lg font-bold">Lúpulos App</span>
            </div>
            <p className="text-text-muted mt-4 max-w-sm text-sm leading-relaxed">
              La comunidad cervecera más grande de Chile. Descubre cervezas artesanales, encuentra
              bares increíbles y conecta con amantes del lúpulo.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-text-muted text-xs font-semibold tracking-wider uppercase">
                {title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1.5 text-sm transition-all duration-200"
                    >
                      <span
                        className="h-0 w-0 rounded-full transition-all duration-200 group-hover:h-1.5 group-hover:w-1.5"
                        style={{ background: "var(--color-amber-primary)" }}
                      />
                      <span className="text-text-subtle transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-amber-primary">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom with shimmer divider */}
        <div className="relative mt-12 pt-8">
          <motion.div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, var(--color-border-amber), transparent)",
            }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-text-subtle text-xs">
              © {new Date().getFullYear()} Lúpulos App · Hecho con 🍺 por Nacho Díaz
            </p>
            <p className="text-text-ghost text-xs">
              Bebe responsablemente. La cerveza artesanal es cultura.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
