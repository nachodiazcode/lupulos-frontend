"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  PhotoCamera as PhotoCameraIcon,
  LocationOn as LocationOnIcon,
  RateReview as RateReviewIcon,
} from "@mui/icons-material";
import useAuth from "@/hooks/useAuth";
import { getImageUrl } from "@/lib/constants";
import { getDisplayName } from "@/lib/auth-storage";
import { normalizeStoredAuthUser } from "@/lib/auth-user";

/* ── Action buttons (Material / Google filled icons) ── */
const actions = [
  { key: "photo", label: "Foto", icon: PhotoCameraIcon, color: "#2dd4a7", href: "/posts?compose=photo" },
  { key: "checkin", label: "Check-in", icon: LocationOnIcon, color: "#f87171", href: "/lugares" },
  { key: "review", label: "Reseña", icon: RateReviewIcon, color: "#fbbf24", href: "/posts?compose=review" },
];

export default function HomeComposer() {
  const router = useRouter();
  const { user } = useAuth();
  const normalized = normalizeStoredAuthUser(user);
  const displayName = getDisplayName(normalized);
  const avatarPath = normalized?.fotoPerfil || normalized?.profilePicture || "";
  const avatarSrc = avatarPath ? getImageUrl(avatarPath) : "";
  const initial = (displayName || "U").charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full overflow-hidden rounded-[1.5rem] border px-6 py-5"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 95%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 90%, transparent))",
        borderColor: "color-mix(in srgb, var(--color-border-light) 40%, transparent)",
        boxShadow: "0 8px 28px rgba(0,0,0,0.16)",
      }}
    >
      {/* Top row: avatar + input */}
      <div className="flex items-center gap-3">
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={displayName || "Perfil"}
            width={44}
            height={44}
            unoptimized
            className="h-11 w-11 shrink-0 rounded-full object-cover"
            style={{ border: "1px solid color-mix(in srgb, var(--color-border-amber) 40%, transparent)" }}
          />
        ) : (
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-extrabold"
            style={{ background: "var(--gradient-button-primary)", color: "var(--color-text-dark)" }}
          >
            {initial}
          </span>
        )}

        <button
          type="button"
          onClick={() => router.push("/posts?compose=1")}
          className="flex h-12 flex-1 items-center rounded-full border px-5 text-left text-[15px] transition-colors hover:brightness-110"
          style={{
            background: "color-mix(in srgb, var(--color-surface-card-alt) 60%, transparent)",
            borderColor: "color-mix(in srgb, var(--color-border-light) 45%, transparent)",
            color: "var(--color-text-muted)",
          }}
        >
          ¿Qué estás tomando hoy{displayName ? `, ${displayName}` : ""}?
        </button>
      </div>

      {/* Divider */}
      <div
        className="my-3 h-px w-full"
        style={{ background: "color-mix(in srgb, var(--color-border-light) 30%, transparent)" }}
      />

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-1 sm:justify-around">
        {actions.map(({ key, label, icon: Icon, color, href }) => (
          <motion.button
            key={key}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push(href)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-colors hover:bg-white/5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <Icon style={{ fontSize: 22, color }} />
            <span className="hidden sm:inline">{label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
