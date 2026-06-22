"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Snackbar, Alert, CircularProgress } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import PageContainer from "@/components/layouts/PageContainer";
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
  "border-white/[0.06] bg-white/[0.03] hover:border-[var(--color-amber-primary)]/30 hover:bg-white/[0.05] focus:border-[var(--color-amber-primary)]/60 focus:bg-white/[0.05] focus:shadow-[0_0_20px_color-mix(in_srgb,var(--color-amber-primary)_12%,transparent)]";

const inputError =
  "border-red-400/30 bg-red-400/[0.02] focus:border-red-400/60 focus:shadow-[0_0_20px_color-mix(in_srgb,var(--color-error)_12%,transparent)]";

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
      <PageContainer>
        {/* Layout: form + sidebar on xl */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── Main Column ─── */}
          <div className="min-w-0 flex-1">
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl border"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border-light) 50%, transparent)",
                boxShadow:
                  "var(--shadow-amber-glow), 0 16px 40px color-mix(in srgb, var(--color-surface-overlay) 65%, transparent)",
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
                {/* Neon streak left (theme-based glow) */}
                <div
                  className="absolute -top-20 left-1/4 h-40 w-80 rotate-12 rounded-full opacity-35 blur-3xl"
                  style={{ background: "linear-gradient(90deg, var(--color-amber-primary), var(--color-amber-hover), transparent)" }}
                />
                {/* Neon streak right (complementary emerald/teal shimmer) */}
                <div
                  className="absolute right-1/4 -bottom-10 h-32 w-64 -rotate-6 rounded-full opacity-25 blur-3xl"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, var(--color-amber-primary), var(--color-emerald))",
                  }}
                />
                {/* Hop pattern */}
                <div className="absolute top-3 right-5 text-[var(--color-amber-primary)]/[0.08]">
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
                        className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-[3px] sm:h-24 sm:w-24 transition-all duration-300 group-hover:scale-[1.02]"
                        style={{
                          borderColor: "var(--color-amber-primary)",
                          background:
                            "linear-gradient(135deg, var(--color-surface-elevated), var(--color-surface-card-alt))",
                          boxShadow:
                            "var(--shadow-amber-glow), 0 0 0 4px var(--color-surface-deepest), 0 8px 24px color-mix(in srgb, var(--color-surface-overlay) 76%, transparent)",
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
                          <span className="text-[var(--color-text-secondary)]/40">
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
                              className="h-5 w-5 animate-spin text-[var(--color-amber-primary)]"
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
                        className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/50 group-hover:opacity-100 animate-fade-in"
                        title="Subir foto de perfil"
                      >
                        {icons.upload}
                      </button>
                      {/* Online-style dot */}
                      <div
                        className="absolute -right-0.5 -bottom-0.5 h-4 w-4 rounded-full border-[3px]"
                        style={{
                          background: "var(--color-emerald)",
                          borderColor: "var(--color-surface-deepest)",
                          boxShadow: "0 0 10px var(--color-emerald), 0 0 3px var(--color-emerald)",
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
                      className="text-lg font-bold sm:text-xl tracking-tight"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {profile?.username || "Cervecero"}
                    </h1>
                    <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
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
                        className="rounded-lg border px-4 py-2 text-xs font-semibold transition-all duration-250 hover:brightness-105 active:scale-98"
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
                        className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all duration-250 hover:brightness-110 active:scale-98"
                        style={{
                          background: "var(--gradient-button-primary)",
                          color: "var(--color-text-dark)",
                          boxShadow:
                            "var(--shadow-amber-glow), 0 2px 8px color-mix(in srgb, var(--color-surface-overlay) 65%, transparent)",
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
                className="pointer-events-none absolute -inset-1 rounded-2xl opacity-5 blur-xl transition-all duration-500"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-amber-primary), var(--color-amber-hover), var(--color-emerald))",
                }}
              />

              <div
                className="relative rounded-2xl border p-5 sm:p-7 glass-card transition-all duration-300"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-border-amber) 30%, transparent)",
                  boxShadow:
                    "0 12px 40px color-mix(in srgb, var(--color-surface-overlay) 60%, transparent), 0 0 30px color-mix(in srgb, var(--color-amber-primary) 5%, transparent), inset 0 1px 0 color-mix(in srgb, var(--color-text-primary) 8%, transparent)",
                }}
              >
                {/* Header */}
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-amber-primary)] transition-all duration-300"
                    style={{
                      background: "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)",
                      boxShadow: "0 0 12px color-mix(in srgb, var(--color-amber-primary) 12%, transparent)",
                    }}
                  >
                    {icons.hop}
                  </div>
                  <div>
                    <h2
                      className="text-sm font-bold tracking-tight"
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

                <div className="mb-5 h-px" style={{ background: "color-mix(in srgb, var(--color-border-light) 40%, transparent)" }} />

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
                            <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[var(--color-amber-primary)]/70 uppercase">
                              <span className="text-[var(--color-amber-primary)]/40">{field.icon}</span>
                              {field.label}
                            </label>
                            {editMode && field.maxLength && (
                              <span
                                className={`text-[10px] tabular-nums font-medium ${
                                  (value?.length ?? 0) > field.maxLength * 0.9
                                    ? "text-red-400/80"
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
                                      className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400/80 font-medium"
                                    >
                                      {icons.warning}
                                      {error.message}
                                    </motion.p>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="view"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                {value ? (
                                  <div
                                    onClick={() => setEditMode(true)}
                                    className="group/field relative rounded-lg border px-3.5 py-2.5 text-sm cursor-pointer transition-all duration-300 hover:border-[var(--color-amber-primary)]/45 hover:bg-white/[0.01]"
                                    style={{
                                      background: "color-mix(in srgb, var(--color-surface-card-alt) 65%, transparent)",
                                      borderColor: "color-mix(in srgb, var(--color-border-light) 60%, transparent)",
                                      color: "var(--color-text-secondary)",
                                    }}
                                  >
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex-1 min-w-0">
                                        {field.name === "sitioWeb" ? (
                                          <a
                                            href={value}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()} // Evita abrir edición al clickear el enlace
                                            className="flex items-center gap-1.5 text-sm text-[var(--color-amber-primary)] hover:underline hover:text-[var(--color-amber-hover)] transition-colors duration-200"
                                          >
                                            <span className="truncate">{value}</span>
                                            <svg
                                              width="12"
                                              height="12"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              className="shrink-0 opacity-70"
                                            >
                                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                              <polyline points="15 3 21 3 21 9" />
                                              <line x1="10" y1="14" x2="21" y2="3" />
                                            </svg>
                                          </a>
                                        ) : (
                                          <p className="whitespace-pre-line leading-relaxed">{value}</p>
                                        )}
                                      </div>
                                      <span className="opacity-0 group-hover/field:opacity-75 hover:!opacity-100 transition-opacity duration-200 text-[var(--color-amber-primary)] shrink-0">
                                        {icons.pen}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setEditMode(true)}
                                    className="group/btn flex items-center gap-1.5 rounded-lg border border-dashed px-3.5 py-2.5 text-xs font-semibold tracking-wide cursor-pointer transition-all duration-300 w-full text-left"
                                    style={{
                                      borderColor: "color-mix(in srgb, var(--color-border-light) 50%, transparent)",
                                      background: "color-mix(in srgb, var(--color-surface-card-alt) 40%, transparent)",
                                      color: "var(--color-text-muted)",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.borderColor = "var(--color-amber-primary)";
                                      e.currentTarget.style.color = "var(--color-amber-primary)";
                                      e.currentTarget.style.background = "color-mix(in srgb, var(--color-amber-primary) 4%, transparent)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.borderColor = "color-mix(in srgb, var(--color-border-light) 50%, transparent)";
                                      e.currentTarget.style.color = "var(--color-text-muted)";
                                      e.currentTarget.style.background = "color-mix(in srgb, var(--color-surface-card-alt) 40%, transparent)";
                                    }}
                                  >
                                    <span className="text-sm opacity-55 group-hover/btn:scale-110 transition-transform duration-200">+</span>
                                    <span>Añadir {field.label.toLowerCase()}</span>
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>

                  {editMode && bioValue && bioValue.length > 200 && (
                    <p className="mt-1 text-right text-[10px] text-amber-400/60 font-medium">
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
                            "color-mix(in srgb, var(--color-border-amber) 30%, transparent)",
                        }}
                      >
                        <div
                          className="flex items-center gap-1.5 text-[11px] font-medium"
                          style={{ color: "var(--color-text-subtle)" }}
                        >
                          <span className="text-[var(--color-amber-primary)]/40">{icons.shield}</span>
                          Validación activa
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="rounded-lg border px-4 py-2 text-xs font-semibold transition-all duration-250 hover:brightness-105 active:scale-98"
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
                            className="rounded-lg px-5 py-2 text-xs font-bold transition-all duration-250 disabled:cursor-not-allowed disabled:opacity-30"
                            style={{
                              background: isDirty
                                ? "var(--gradient-button-primary)"
                                : "color-mix(in srgb, var(--color-surface-card-alt) 88%, transparent)",
                              color: isDirty
                                ? "var(--color-text-dark)"
                                : "var(--color-text-subtle)",
                              boxShadow: isDirty
                                ? "var(--shadow-amber-glow), 0 4px 12px color-mix(in srgb, var(--color-surface-overlay) 65%, transparent)"
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
              className="rounded-2xl border p-5 glass-card transition-all duration-300"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border-amber) 30%, transparent)",
                boxShadow:
                  "0 8px 32px color-mix(in srgb, var(--color-surface-overlay) 40%, transparent), 0 0 20px color-mix(in srgb, var(--color-amber-primary) 3%, transparent)",
              }}
            >
              <div className="mb-3.5 flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-amber-primary)] transition-all duration-300"
                  style={{
                    background: "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)",
                    boxShadow: "0 0 8px color-mix(in srgb, var(--color-amber-primary) 12%, transparent)",
                  }}
                >
                  {icons.shield}
                </div>
                <h3 className="text-xs font-bold tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                  Seguridad
                </h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Caracteres especiales bloqueados",
                  "Scripts e inyecciones rechazadas",
                  "URLs validadas (https://)",
                  "Fotos de perfil máx. 5MB",
                  "Límites de largo por campo",
                ].map((itemText) => (
                  <li key={itemText} className="flex items-start gap-2.5">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[var(--color-amber-primary)] shrink-0 mt-0.5"
                      style={{ filter: "drop-shadow(0 0 4px color-mix(in srgb, var(--color-amber-primary) 40%, transparent))" }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span
                      className="text-[11px] leading-relaxed font-medium"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {itemText}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats card */}
            <div
              className="rounded-2xl border p-5 glass-card transition-all duration-300"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border-amber) 30%, transparent)",
                boxShadow:
                  "0 8px 32px color-mix(in srgb, var(--color-surface-overlay) 40%, transparent), 0 0 20px color-mix(in srgb, var(--color-amber-primary) 3%, transparent)",
              }}
            >
              <div className="mb-3.5 flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-amber-primary)] transition-all duration-300"
                  style={{
                    background: "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)",
                    boxShadow: "0 0 8px color-mix(in srgb, var(--color-amber-primary) 12%, transparent)",
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
                <h3 className="text-xs font-bold tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                  Tu actividad
                </h3>
              </div>
              <div className="space-y-3.5">
                {[
                  { label: "Cervezas reseñadas", value: "0", color: "var(--color-amber-primary)" },
                  { label: "Bares visitados", value: "0", color: "var(--color-amber-hover)" },
                  { label: "Posts publicados", value: "0", color: "var(--color-emerald)" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-[11px] font-medium" style={{ color: "var(--color-text-muted)" }}>
                      {stat.label}
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full border tracking-tight transition-all duration-300 hover:scale-105"
                      style={{
                        color: stat.color,
                        background: `color-mix(in srgb, ${stat.color} 10%, transparent)`,
                        borderColor: `color-mix(in srgb, ${stat.color} 20%, transparent)`,
                        textShadow: `0 0 8px color-mix(in srgb, ${stat.color} 40%, transparent)`,
                      }}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip card */}
            <div
              className="rounded-2xl border p-5 transition-all duration-300"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--color-amber-primary) 8%, transparent), color-mix(in srgb, var(--color-amber-hover) 4%, transparent))",
                borderColor: "color-mix(in srgb, var(--color-border-amber) 30%, transparent)",
                boxShadow: "0 8px 24px color-mix(in srgb, var(--color-surface-overlay) 40%, transparent)",
              }}
            >
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                💡 <span className="font-bold" style={{ color: "var(--color-amber-primary)", textShadow: "0 0 8px color-mix(in srgb, var(--color-amber-primary) 30%, transparent)" }}>Tip:</span> Completa tu perfil
                para aparecer en las recomendaciones de la comunidad y conectar con otros
                cerveceros.
              </p>
            </div>
          </motion.aside>
        </div>
      </PageContainer>

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
