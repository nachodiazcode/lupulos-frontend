"use client";

import Link from "next/link";
import Image from "next/image";

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
      className="border-t border-border-subtle"
      style={{ background: "var(--gradient-footer)" }}
    >
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/logo.gif"
                alt="Lúpulos App"
                width={40}
                height={40}
                className="rounded-lg"
              />
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
                      className="text-text-subtle hover:text-amber-primary text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-border-subtle mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-text-subtle text-xs">
            © {new Date().getFullYear()} Lúpulos App · Hecho con 🍺 por Nacho Díaz
          </p>
          <p className="text-text-ghost text-xs">
            Bebe responsablemente. La cerveza artesanal es cultura.
          </p>
        </div>
      </div>
    </footer>
  );
}
