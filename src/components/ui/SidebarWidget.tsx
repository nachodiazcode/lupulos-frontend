"use client";

import React, { PointerEventHandler } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function SidebarWidget({
  label,
  collapsed = false,
  onClose,
  onToggleCollapse,
  children,
}: {
  label: string;
  collapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 18, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 18, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="premium-widget-card relative overflow-hidden rounded-[1.5rem] border"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 95%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 90%, transparent))",
        borderColor: "color-mix(in srgb, var(--color-border-light) 76%, transparent)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 color-mix(in srgb, var(--color-amber-primary) 5%, transparent)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          border:
            "1px solid color-mix(in srgb, var(--color-amber-light) 14%, var(--color-border-light))",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-6 bottom-[1px] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-amber-light) 38%, transparent), transparent)",
          opacity: 0.62,
        }}
        aria-hidden="true"
      />
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <p
            className="font-bold uppercase"
            style={{ 
              color: "var(--color-amber-primary)",
              fontSize: "10.5px",
              letterSpacing: "0.18em"
            }}
          >
            {label}
          </p>
          {(onClose || onToggleCollapse) && (
            <div className="flex items-center gap-1">
              {onToggleCollapse && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onToggleCollapse}
                  className="flex h-6 w-6 items-center justify-center rounded-full border text-[11px] transition-all"
                  style={{
                    borderColor: "color-mix(in srgb, var(--color-border-light) 65%, transparent)",
                    background: collapsed
                      ? "color-mix(in srgb, var(--color-amber-primary) 10%, transparent)"
                      : "rgba(255,255,255,0.04)",
                    color: collapsed ? "var(--color-amber-primary)" : "var(--color-text-muted)",
                  }}
                  aria-label={collapsed ? "Expandir" : "Minimizar"}
                >
                  {collapsed ? "+" : "−"}
                </motion.button>
              )}
              {onClose && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="flex h-6 w-6 items-center justify-center rounded-full border text-[13px] transition-all"
                  style={{
                    borderColor: "color-mix(in srgb, var(--color-border-light) 65%, transparent)",
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--color-text-muted)",
                  }}
                  aria-label="Cerrar widget"
                >
                  ×
                </motion.button>
              )}
            </div>
          )}
        </div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="rw-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-3">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function SidebarWidgetChromeButton({
  label,
  title,
  active = false,
  onClick,
  onPointerDown,
  className,
  children,
}: {
  label: string;
  title: string;
  active?: boolean;
  onClick?: () => void;
  onPointerDown?: PointerEventHandler<HTMLButtonElement>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      onPointerDown={onPointerDown}
      className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] transition-all ${className ?? ""}`}
      style={{
        borderColor: active
          ? "color-mix(in srgb, var(--color-amber-primary) 44%, var(--color-border-light))"
          : "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
        background: active
          ? "color-mix(in srgb, var(--color-amber-primary) 10%, transparent)"
          : "rgba(255,255,255,0.04)",
        color: active ? "var(--color-amber-primary)" : "var(--color-text-muted)",
      }}
      aria-label={label}
      title={title}
    >
      {children}
    </motion.button>
  );
}

export function SidebarWidgetMetric({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
      style={{
        borderColor: "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
        background: "rgba(255,255,255,0.03)",
        color: "var(--color-text-muted)",
      }}
    >
      <span style={{ color: "var(--color-text-primary)" }}>{value}</span> {label}
    </div>
  );
}

export function SidebarWidgetList({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="space-y-2.5 pb-1"
      style={{
        minHeight: "fit-content",
      }}
    >
      {children}
    </div>
  );
}

export function SidebarWidgetItem({
  href,
  icon,
  title,
  description,
  badge,
  ctaLabel = "Abrir",
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
  ctaLabel?: string;
}) {
  return (
    <Link
      href={href}
      className="group/item block rounded-[1.2rem] border px-3.5 py-3 transition-all duration-200 hover:translate-y-[-1px]"
      style={{
        borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[1rem] text-base"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 90%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 84%, transparent))",
            border: "1px solid color-mix(in srgb, var(--color-border-light) 64%, transparent)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
              {title}
            </p>
            {badge ? (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-[0.16em] uppercase"
                style={{
                  background: "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)",
                  color: "var(--color-amber-primary)",
                }}
              >
                {badge}
              </span>
            ) : null}
          </div>

          <p
            className="mt-1 text-[12px] leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {description}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <span
              className="text-[11px] font-semibold"
              style={{ color: "var(--color-text-muted)" }}
            >
              {ctaLabel}
            </span>
            <span
              className="text-[11px] transition-transform duration-200 group-hover/item:translate-x-0.5"
              style={{ color: "var(--color-amber-primary)" }}
            >
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
