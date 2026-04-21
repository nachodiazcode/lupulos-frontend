"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Snackbar, Alert, CircularProgress } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import useAuth from "@/hooks/useAuth";
import { persistAuthSession, type StoredAuthUser } from "@/lib/auth-storage";
import { normalizeStoredAuthUser } from "@/lib/auth-user";
import { getImageUrl } from "@/lib/constants";
import { api } from "@/lib/api";

/* ═══════════════════════════════════════════
   Validation Schema
   ═══════════════════════════════════════════ */

const SAFE_TEXT = /^[a-zA-ZÀ-ÿñÑ0-9\s._\-']*$/;
const NO_SCRIPT = /^(?!.*<script)(?!.*javascript:).*$/i;

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(30, "Máximo 30 caracteres")
    .regex(SAFE_TEXT, "Solo letras, números, puntos y guiones"),
  ciudad: z
    .string()
    .max(50, "Máximo 50 caracteres")
    .regex(SAFE_TEXT, "Caracteres no permitidos")
    .optional()
    .or(z.literal("")),
  pais: z
    .string()
    .max(50, "Máximo 50 caracteres")
    .regex(SAFE_TEXT, "Caracteres no permitidos")
    .optional()
    .or(z.literal("")),
  sitioWeb: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .refine((val) => !val || /^https?:\/\/.+\..+/.test(val), {
      message: "URL inválida (ej: https://misitio.com)",
    })
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(250, "Máximo 250 caracteres")
    .regex(NO_SCRIPT, "Contenido no permitido")
    .optional()
    .or(z.literal("")),
  pronombres: z
    .string()
    .max(20, "Máximo 20 caracteres")
    .regex(SAFE_TEXT, "Caracteres no permitidos")
    .optional()
    .or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

interface UserProfile {
  _id: string;
  username: string;
  email?: string;
  ciudad?: string;
  pais?: string;
  sitioWeb?: string;
  bio?: string;
  pronombres?: string;
  fotoPerfil?: string;
}

interface FieldConfig {
  name: keyof ProfileFormData;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  multiline?: boolean;
  maxLength?: number;
  fullWidth?: boolean;
}

/* ═══════════════════════════════════════════
   Icons (SVG inline for zero dependencies)
   ═══════════════════════════════════════════ */

const icons = {
  user: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  city: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
    </svg>
  ),
  globe: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  link: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  pen: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  shield: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  upload: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  ),
  warning: (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  hop: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" opacity="0" />
      <path d="M12 3c1.5 2 2.5 4.5 2.5 7s-1 5-2.5 7c-1.5-2-2.5-4.5-2.5-7s1-5 2.5-7z" />
      <path d="M3 12c2-1.5 4.5-2.5 7-2.5s5 1 7 2.5c-2 1.5-4.5 2.5-7 2.5s-5-1-7-2.5z" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════
   Field configuration
   ═══════════════════════════════════════════ */

const FIELDS: FieldConfig[] = [
  {
    name: "username",
    label: "Nombre de usuario",
    placeholder: "tu_nombre_cervecero",
    icon: icons.user,
    maxLength: 30,
  },
  {
    name: "pronombres",
    label: "Pronombres",
    placeholder: "él/ella/elle",
    icon: icons.user,
    maxLength: 20,
  },
  { name: "ciudad", label: "Ciudad", placeholder: "Santiago", icon: icons.city, maxLength: 50 },
  { name: "pais", label: "País", placeholder: "Chile", icon: icons.globe, maxLength: 50 },
  {
    name: "sitioWeb",
    label: "Sitio web",
    placeholder: "https://tucerveceria.cl",
    icon: icons.link,
    maxLength: 100,
    fullWidth: true,
  },
  {
    name: "bio",
    label: "Biografía",
    placeholder: "Cuéntanos sobre tu pasión cervecera...",
    icon: icons.pen,
    multiline: true,
    maxLength: 250,
    fullWidth: true,
  },
];

/* ═══════════════════════════════════════════
   Animations
   ═══════════════════════════════════════════ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.05, ease: "easeOut" },
  }),
};

type AuthLikeUser = Partial<StoredAuthUser> & {
  id?: string;
  city?: string;
  country?: string;
  sitioWeb?: string;
  bio?: string;
  pronombres?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const pickFirstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
};

const resolveUserId = (user: AuthLikeUser | null | undefined): string | null =>
  pickFirstString(user?._id, user?.id) ?? null;

const extractProfileUser = (payload: unknown): Record<string, unknown> | null => {
  if (!isRecord(payload)) return null;

  const data = isRecord(payload.data) ? payload.data : payload;
  if (isRecord(data.user)) return data.user;
  return data;
};

const buildProfileFromPayload = (
  payload: unknown,
  fallbackUser: AuthLikeUser | null,
): UserProfile | null => {
  const source = extractProfileUser(payload);
  const normalizedUser = normalizeStoredAuthUser(
    { ...(fallbackUser ?? {}), ...(source ?? {}) },
    resolveUserId(fallbackUser) ?? undefined,
  );

  if (!normalizedUser) return null;

  return {
    _id: normalizedUser._id,
    username: pickFirstString(source?.username, normalizedUser.username, normalizedUser.name) ?? "",
    email: pickFirstString(source?.email, normalizedUser.email) ?? "",
    ciudad:
      pickFirstString(
        source?.ciudad,
        source?.city,
        fallbackUser?.ciudad,
        fallbackUser?.city,
      ) ?? "",
    pais:
      pickFirstString(
        source?.pais,
        source?.country,
        fallbackUser?.pais,
        fallbackUser?.country,
      ) ?? "",
    sitioWeb: pickFirstString(source?.sitioWeb, fallbackUser?.sitioWeb) ?? "",
    bio: pickFirstString(source?.bio, fallbackUser?.bio) ?? "",
    pronombres: pickFirstString(source?.pronombres, fallbackUser?.pronombres) ?? "",
    fotoPerfil:
      pickFirstString(
        source?.fotoPerfil,
        source?.photo,
        source?.profilePicture,
        normalizedUser.fotoPerfil,
        normalizedUser.photo,
        normalizedUser.profilePicture,
      ) ?? "",
  };
};

const toStoredUser = (
  profile: UserProfile,
  fallbackUser: AuthLikeUser | null,
): StoredAuthUser & Record<string, unknown> => {
  const normalized = normalizeStoredAuthUser(
    {
      ...(fallbackUser ?? {}),
      ...profile,
      fotoPerfil: profile.fotoPerfil,
      photo: profile.fotoPerfil,
      profilePicture: profile.fotoPerfil,
      ciudad: profile.ciudad,
      city: profile.ciudad,
      pais: profile.pais,
      country: profile.pais,
    },
    profile._id,
  );

  return {
    ...(normalized ?? { _id: profile._id, id: profile._id }),
    username: profile.username,
    email: profile.email,
    fotoPerfil: profile.fotoPerfil,
    photo: profile.fotoPerfil,
    profilePicture: profile.fotoPerfil,
    ciudad: profile.ciudad,
    city: profile.ciudad,
    pais: profile.pais,
    country: profile.pais,
    sitioWeb: profile.sitioWeb,
    bio: profile.bio,
    pronombres: profile.pronombres,
  };
};

/* ═══════════════════════════════════════════
   Shared field input classes
   ═══════════════════════════════════════════ */

const inputBase =
  "w-full rounded-lg border px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-all duration-300 focus:outline-none";

const inputNormal =
  "border-white/[0.06] bg-white/[0.03] hover:border-emerald-400/20 hover:bg-white/[0.04] focus:border-emerald-400/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(52,211,153,0.12),0_0_4px_rgba(52,211,153,0.15)]";

const inputError =
  "border-red-400/40 bg-red-400/[0.03] focus:border-red-400/60 focus:shadow-[0_0_20px_rgba(248,113,113,0.12),0_0_4px_rgba(248,113,113,0.15)]";

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */

export default function PerfilPage() {
  const router = useRouter();
  const { user: authUser, token, isAuthReady, setUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = (authUser as AuthLikeUser | null) ?? null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: "", ciudad: "", pais: "", sitioWeb: "", bio: "", pronombres: "" },
  });

  const bioValue = watch("bio");

  const syncAuthSession = useCallback(
    (nextProfile: UserProfile) => {
      if (!token) return;

      const nextUser = toStoredUser(nextProfile, currentUser);
      persistAuthSession({ token, user: nextUser });
      setUser(nextUser);
    },
    [currentUser, setUser, token],
  );

  /* ─── Fetch profile ─── */
  useEffect(() => {
    if (!isAuthReady) return;

    const userId = resolveUserId(currentUser);
    if (!userId || !token) {
      setLoading(false);
      router.replace("/auth/login");
      return;
    }

    let alive = true;

    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/auth/perfil/${userId}`);
        const nextProfile = buildProfileFromPayload(data, currentUser);

        if (!alive || !nextProfile) return;

        setProfile(nextProfile);
        reset({
          username: nextProfile.username,
          ciudad: nextProfile.ciudad ?? "",
          pais: nextProfile.pais ?? "",
          sitioWeb: nextProfile.sitioWeb ?? "",
          bio: nextProfile.bio ?? "",
          pronombres: nextProfile.pronombres ?? "",
        });
      } catch {
        if (alive) showToast("Error al cargar el perfil", "error");
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      alive = false;
    };
  }, [currentUser, isAuthReady, reset, router, token]);

  /* ─── Helpers ─── */
  const showToast = (message: string, severity: "success" | "error") => {
    setToast({ open: true, message, severity });
  };

  const getAvatarUrl = useCallback(() => {
    const foto = profile?.fotoPerfil;
    if (!foto) return null;
    return getImageUrl(foto);
  }, [profile?.fotoPerfil]);

  /* ─── Save profile ─── */
  const onSubmit = async (formData: ProfileFormData) => {
    if (!profile) return;
    setSaving(true);
    try {
      await api.put(`/auth/perfil/${profile._id}`, formData);
      const updated = { ...profile, ...formData };
      setProfile(updated);
      syncAuthSession(updated);
      setEditMode(false);
      showToast("Perfil actualizado correctamente", "success");
    } catch {
      showToast("Error al guardar los cambios", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Upload photo ─── */
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (file.size > MAX_SIZE) return showToast("La imagen no puede superar 5MB", "error");
    if (!ALLOWED.includes(file.type)) return showToast("Solo JPG, PNG, WebP o GIF", "error");

    setUploading(true);
    try {
      const form = new FormData();
      form.append("fotoPerfil", file);
      const res = await api.post("/auth/upload/profile", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        const ruta = res.data.path;
        await api.put(`/auth/perfil/${profile._id}`, { fotoPerfil: ruta });
        const updated = { ...profile, fotoPerfil: ruta };
        setProfile(updated);
        syncAuthSession(updated);
        showToast("Foto actualizada", "success");
      }
    } catch {
      showToast("Error al subir la foto", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (profile) {
      reset({
        username: profile.username,
        ciudad: profile.ciudad ?? "",
        pais: profile.pais ?? "",
        sitioWeb: profile.sitioWeb ?? "",
        bio: profile.bio ?? "",
        pronombres: profile.pronombres ?? "",
      });
    }
  };

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div
        className="flex min-h-screen flex-col"
        style={{ background: "var(--color-surface-deepest)" }}
      >
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <CircularProgress
              size={34}
              sx={{ color: "var(--color-amber-primary)" }}
              aria-label="Cargando perfil"
            />
            <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Cargando perfil...
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Estamos preparando tu información.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const avatarUrl = getAvatarUrl();

  /* ═══════════════════════════════════════════
     Render
     ═══════════════════════════════════════════ */

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--color-surface-deepest)", color: "var(--color-text-primary)" }}
    >
      <Navbar />

      <main className="flex-1 px-4 py-8 sm:py-12">
        {/* Layout: form + sidebar on xl */}
        <div className="mx-auto flex max-w-6xl gap-6">
          {/* ─── Main Column ─── */}
          <div className="min-w-0 flex-1">
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl"
              style={{
                boxShadow:
                  "var(--shadow-emerald-glow-sm), 0 16px 40px color-mix(in srgb, var(--color-surface-overlay) 65%, transparent)",
              }}
            >
              {/* Banner with neon glow */}
              <div
                className="relative h-32 overflow-hidden sm:h-36"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-surface-card) 0%, var(--color-surface-card-alt) 50%, var(--color-surface-card) 100%)",
                }}
              >
                {/* Neon streak */}
                <div
                  className="absolute -top-20 left-1/4 h-40 w-80 rotate-12 rounded-full opacity-30 blur-3xl"
                  style={{ background: "linear-gradient(90deg, var(--color-emerald), var(--color-emerald-dark), transparent)" }}
                />
                <div
                  className="absolute right-1/4 -bottom-10 h-32 w-64 -rotate-6 rounded-full opacity-20 blur-3xl"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, var(--color-amber-primary), var(--color-amber-hover))",
                  }}
                />
                {/* Hop pattern */}
                <div className="absolute top-3 right-5 text-emerald-400/[0.06]">
                  <svg width="70" height="70" viewBox="0 0 100 100" fill="currentColor">
                    <ellipse cx="50" cy="30" rx="18" ry="25" />
                    <ellipse cx="30" cy="55" rx="18" ry="25" transform="rotate(-30 30 55)" />
                    <ellipse cx="70" cy="55" rx="18" ry="25" transform="rotate(30 70 55)" />
                    <circle cx="50" cy="50" r="8" />
                  </svg>
                </div>
                {/* Subtle grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
              </div>

              {/* Bottom section */}
              <div
                className="flex flex-col gap-4 px-6 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-8"
                style={{ background: "var(--color-surface-card)", marginTop: -1 }}
              >
                {/* Avatar + info */}
                <div className="flex items-end gap-4">
                  <div className="-mt-10 sm:-mt-12">
                    <div className="group relative">
                      <div
                        className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-[3px] sm:h-24 sm:w-24"
                        style={{
                          borderColor: "var(--color-emerald)",
                          background:
                            "linear-gradient(135deg, var(--color-surface-elevated), var(--color-surface-card-alt))",
                          boxShadow:
                            "var(--shadow-emerald-glow), 0 0 0 4px var(--color-surface-deepest), 0 8px 24px color-mix(in srgb, var(--color-surface-overlay) 76%, transparent)",
                        }}
                      >
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt="Avatar"
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-emerald-400/40">
                            <svg
                              width="36"
                              height="36"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </span>
                        )}
                        {uploading && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60">
                            <svg
                              className="h-5 w-5 animate-spin text-emerald-400"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="opacity-25"
                              />
                              <path
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                fill="currentColor"
                                className="opacity-75"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/50 group-hover:opacity-100"
                      >
                        {icons.upload}
                      </button>
                      {/* Online-style dot */}
                      <div
                        className="absolute -right-0.5 -bottom-0.5 h-4 w-4 rounded-full border-[3px]"
                        style={{
                          background: "var(--color-emerald)",
                          borderColor: "var(--color-surface-deepest)",
                          boxShadow: "var(--shadow-emerald-glow-sm)",
                        }}
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <div className="pb-1">
                    <h1
                      className="text-lg font-bold sm:text-xl"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {profile?.username || "Cervecero"}
                    </h1>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {profile?.email}
                    </p>
                  </div>
                </div>

                {/* Edit/Cancel button */}
                <div className="sm:pb-1">
                  <AnimatePresence mode="wait">
                    {editMode ? (
                      <motion.button
                        key="cancel"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={handleCancelEdit}
                        className="rounded-lg border px-4 py-2 text-xs font-medium transition-all hover:brightness-105"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--color-border-light) 78%, transparent)",
                          background:
                            "color-mix(in srgb, var(--color-surface-card-alt) 88%, transparent)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        Cancelar edición
                      </motion.button>
                    ) : (
                      <motion.button
                        key="edit"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all hover:brightness-110"
                        style={{
                          background: "var(--gradient-emerald)",
                          color: "var(--color-text-dark)",
                          boxShadow:
                            "var(--shadow-emerald-glow-sm), 0 2px 8px color-mix(in srgb, var(--color-surface-overlay) 65%, transparent)",
                        }}
                      >
                        {icons.pen}
                        Editar perfil
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* ─── Form Card ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="relative mt-5"
            >
              {/* Ambient neon glow behind card */}
              <div
                className="pointer-events-none absolute -inset-1 rounded-2xl opacity-[0.03] blur-xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-emerald), var(--color-emerald-dark), var(--color-amber-primary))",
                }}
              />

              <div
                className="relative rounded-2xl border p-5 sm:p-7"
                style={{
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 96%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 92%, transparent))",
                  borderColor: "color-mix(in srgb, var(--color-border-emerald) 90%, transparent)",
                  boxShadow:
                    "0 0 30px color-mix(in srgb, var(--color-emerald) 12%, transparent), var(--shadow-card), inset 0 1px 0 color-mix(in srgb, var(--color-text-primary) 5%, transparent)",
                }}
              >
                {/* Header */}
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-400"
                    style={{
                      background: "rgba(52,211,153,0.1)",
                      boxShadow: "0 0 12px rgba(52,211,153,0.1)",
                    }}
                  >
                    {icons.hop}
                  </div>
                  <div>
                    <h2
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Información personal
                    </h2>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {editMode
                        ? "Los campos se validan automáticamente."
                        : "Tu perfil público en la comunidad cervecera."}
                    </p>
                  </div>
                </div>

                <div className="mb-5 h-px" style={{ background: "rgba(52,211,153,0.06)" }} />

                {/* Fields Grid */}
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                    {FIELDS.map((field, i) => {
                      const error = errors[field.name];
                      const value = watch(field.name);

                      return (
                        <motion.div
                          key={field.name}
                          custom={i}
                          variants={fadeUp}
                          initial="hidden"
                          animate="visible"
                          className={field.fullWidth ? "md:col-span-2" : ""}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <label className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-emerald-400/50 uppercase">
                              <span className="text-emerald-400/30">{field.icon}</span>
                              {field.label}
                            </label>
                            {editMode && field.maxLength && (
                              <span
                                className={`text-[10px] tabular-nums ${
                                  (value?.length ?? 0) > field.maxLength * 0.9
                                    ? "text-red-400/70"
                                    : "text-[var(--color-text-subtle)]"
                                }`}
                              >
                                {value?.length ?? 0}/{field.maxLength}
                              </span>
                            )}
                          </div>

                          <AnimatePresence mode="wait">
                            {editMode ? (
                              <motion.div
                                key="edit"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                {field.multiline ? (
                                  <textarea
                                    {...register(field.name)}
                                    placeholder={field.placeholder}
                                    rows={3}
                                    maxLength={field.maxLength}
                                    className={`${inputBase} resize-none ${error ? inputError : inputNormal}`}
                                  />
                                ) : (
                                  <input
                                    {...register(field.name)}
                                    placeholder={field.placeholder}
                                    maxLength={field.maxLength}
                                    className={`${inputBase} ${error ? inputError : inputNormal}`}
                                  />
                                )}
                                <AnimatePresence>
                                  {error && (
                                    <motion.p
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-1 flex items-center gap-1 text-[11px] text-red-400/80"
                                    >
                                      {icons.warning}
                                      {error.message}
                                    </motion.p>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            ) : (
                              <motion.p
                                key="view"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className={`rounded-lg border px-3.5 py-2.5 text-sm ${
                                  value
                                    ? "text-[var(--color-text-secondary)]"
                                    : "text-[var(--color-text-subtle)] italic"
                                }`}
                                style={{
                                  background:
                                    "color-mix(in srgb, var(--color-surface-card-alt) 82%, transparent)",
                                  borderColor:
                                    "color-mix(in srgb, var(--color-border-light) 72%, transparent)",
                                }}
                              >
                                {value || "Sin especificar"}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>

                  {editMode && bioValue && bioValue.length > 200 && (
                    <p className="mt-1 text-right text-[10px] text-amber-400/60">
                      {250 - bioValue.length} caracteres restantes
                    </p>
                  )}

                  {/* Actions */}
                  <AnimatePresence>
                    {editMode && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="mt-6 flex flex-col-reverse items-stretch gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--color-border-emerald) 70%, transparent)",
                        }}
                      >
                        <div
                          className="flex items-center gap-1.5 text-[11px]"
                          style={{ color: "var(--color-text-subtle)" }}
                        >
                          <span className="text-emerald-400/40">{icons.shield}</span>
                          Validación activa
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="rounded-lg border px-4 py-2 text-xs font-medium transition-all hover:brightness-105"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--color-border-light) 76%, transparent)",
                              background:
                                "color-mix(in srgb, var(--color-surface-card-alt) 84%, transparent)",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            Cancelar
                          </button>
                          <motion.button
                            type="submit"
                            disabled={saving || !isDirty}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="rounded-lg px-5 py-2 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-30"
                            style={{
                              background: isDirty
                                ? "var(--gradient-emerald)"
                                : "color-mix(in srgb, var(--color-surface-card-alt) 88%, transparent)",
                              color: isDirty
                                ? "var(--color-text-dark)"
                                : "var(--color-text-subtle)",
                              boxShadow: isDirty
                                ? "var(--shadow-emerald-glow), 0 4px 12px color-mix(in srgb, var(--color-surface-overlay) 65%, transparent)"
                                : "none",
                            }}
                          >
                            {saving ? (
                              <span className="flex items-center gap-2">
                                <svg
                                  className="h-3.5 w-3.5 animate-spin"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    className="opacity-25"
                                  />
                                  <path
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    fill="currentColor"
                                    className="opacity-75"
                                  />
                                </svg>
                                Guardando...
                              </span>
                            ) : (
                              "Guardar cambios"
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </motion.div>
          </div>

          {/* ─── Sidebar (xl+) ─── */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="hidden w-72 shrink-0 space-y-4 xl:block"
          >
            {/* Security card */}
            <div
              className="rounded-2xl border p-5"
              style={{
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 96%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 92%, transparent))",
                borderColor: "color-mix(in srgb, var(--color-border-emerald) 72%, transparent)",
                boxShadow:
                  "0 0 20px color-mix(in srgb, var(--color-emerald) 10%, transparent), 0 8px 24px color-mix(in srgb, var(--color-surface-overlay) 58%, transparent)",
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-emerald-400"
                  style={{
                    background: "rgba(52,211,153,0.1)",
                    boxShadow: "0 0 8px rgba(52,211,153,0.1)",
                  }}
                >
                  {icons.shield}
                </div>
                <h3 className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                  Seguridad
                </h3>
              </div>
              <ul className="space-y-2.5">
                {[
                  { icon: "🛡️", text: "Caracteres especiales bloqueados" },
                  { icon: "🚫", text: "Scripts e inyecciones rechazadas" },
                  { icon: "🔗", text: "URLs validadas (https://)" },
                  { icon: "📸", text: "Fotos máx. 5MB" },
                  { icon: "📐", text: "Límites de largo por campo" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-2">
                    <span className="mt-0.5 text-xs">{item.icon}</span>
                    <span
                      className="text-[11px] leading-relaxed"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats card */}
            <div
              className="rounded-2xl border p-5"
              style={{
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 96%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 92%, transparent))",
                borderColor: "color-mix(in srgb, var(--color-border-amber) 68%, transparent)",
                boxShadow:
                  "0 0 20px color-mix(in srgb, var(--color-amber-primary) 10%, transparent), 0 8px 24px color-mix(in srgb, var(--color-surface-overlay) 58%, transparent)",
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-amber-400"
                  style={{
                    background: "rgba(251,191,36,0.1)",
                    boxShadow: "0 0 8px rgba(251,191,36,0.08)",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20V10M18 20V4M6 20v-4" />
                  </svg>
                </div>
                <h3 className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                  Tu actividad
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Cervezas reseñadas", value: "—", color: "var(--color-amber-primary)" },
                  { label: "Bares visitados", value: "—", color: "var(--color-amber-hover)" },
                  { label: "Posts publicados", value: "—", color: "var(--color-emerald)" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                      {stat.label}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: stat.color, textShadow: `0 0 10px ${stat.color}40` }}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip card */}
            <div
              className="rounded-2xl border p-5"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--color-emerald) 8%, transparent), color-mix(in srgb, var(--color-emerald-dark) 6%, transparent))",
                borderColor: "color-mix(in srgb, var(--color-border-emerald) 78%, transparent)",
              }}
            >
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                💡 <span className="font-medium" style={{ color: "var(--color-emerald)" }}>Tip:</span> Completa tu perfil
                para aparecer en las recomendaciones de la comunidad y conectar con otros
                cerveceros.
              </p>
            </div>
          </motion.aside>
        </div>
      </main>

      <Footer />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          sx={{
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "0.8rem",
            backgroundColor:
              toast.severity === "success" ? "var(--color-emerald-darker)" : "#dc2626",
            boxShadow:
              toast.severity === "success"
                ? "var(--shadow-emerald-glow)"
                : "0 0 20px rgba(220,38,38,0.3)",
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
