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
  createdAt?: string;
  provider?: string;
  role?: string;
  plan?: string;
  isVerified?: boolean;
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
    createdAt: pickFirstString(source?.createdAt, fallbackUser?.createdAt) ?? "",
    provider: pickFirstString(source?.provider, fallbackUser?.provider) ?? "local",
    role: pickFirstString(source?.role, fallbackUser?.role) ?? "",
    plan: pickFirstString(source?.plan, fallbackUser?.plan) ?? "",
    isVerified: source?.isVerified === true || fallbackUser?.isVerified === true,
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
   Toggle switch (preferencias)
   ═══════════════════════════════════════════ */

function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  desc?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="flex w-full items-center justify-between gap-3 text-left"
    >
      <span className="min-w-0">
        <span className="block text-[12px] font-semibold" style={{ color: "var(--color-text-secondary)" }}>
          {label}
        </span>
        {desc && (
          <span className="block text-[10.5px] leading-snug" style={{ color: "var(--color-text-muted)" }}>
            {desc}
          </span>
        )}
      </span>
      <span
        className="relative h-5 w-9 shrink-0 rounded-full transition-all duration-300"
        style={{
          background: checked
            ? "var(--color-amber-primary)"
            : "color-mix(in srgb, var(--color-text-muted) 30%, transparent)",
          boxShadow: checked
            ? "0 0 10px color-mix(in srgb, var(--color-amber-primary) 45%, transparent)"
            : "none",
        }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all duration-300"
          style={{ left: checked ? "calc(100% - 1.125rem)" : "0.125rem" }}
        />
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */

export default function PerfilPage() {
  const router = useRouter();
  const { user: authUser, token, isAuthReady, setUser, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [prefs, setPrefs] = useState({ emailNotifs: true, publicProfile: true, newsletter: false });
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

  /* ─── Preferencias (persistidas en localStorage) ─── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("lupulos:prefs");
      if (raw) setPrefs((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {
      /* noop */
    }
  }, []);

  const togglePref = (key: keyof typeof prefs) =>
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("lupulos:prefs", JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

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

  /* ─── Datos derivados ─── */
  const COMPLETION_KEYS: (keyof UserProfile)[] = [
    "username",
    "pronombres",
    "ciudad",
    "pais",
    "sitioWeb",
    "bio",
    "fotoPerfil",
  ];
  const filledCount = profile
    ? COMPLETION_KEYS.filter((k) => {
        const v = profile[k];
        return typeof v === "string" && v.trim().length > 0;
      }).length
    : 0;
  const completion = profile ? Math.round((filledCount / COMPLETION_KEYS.length) * 100) : 0;

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("es-ES", { month: "long", year: "numeric" })
    : null;

  const isGoogle = profile?.provider === "google";
  const planLabel = (profile?.plan || "").trim();
  const roleLabel = (profile?.role || "").trim();

  /* ═══════════════════════════════════════════
     Render
     ═══════════════════════════════════════════ */

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--color-surface-deepest)", color: "var(--color-text-primary)" }}
    >
      <main className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        {/* Mismo ancho que cervezas/lugares (calc(1140px + 4rem)) */}
        <div className="mx-auto w-full" style={{ maxWidth: "calc(1140px + 4rem)" }}>
          {/* Layout: form + sidebar on xl */}
          <div className="flex flex-col gap-8 xl:flex-row">
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

                {/* Completitud del perfil */}
                <div className="absolute top-4 right-5 left-6 flex flex-col gap-1.5 sm:left-8">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-bold tracking-wide uppercase"
                      style={{
                        color: "color-mix(in srgb, var(--color-amber-primary) 88%, white)",
                        textShadow: "0 1px 6px rgba(0,0,0,0.5)",
                      }}
                    >
                      {completion === 100 ? "Perfil completo 🍺" : `Perfil ${completion}% completo`}
                    </span>
                    <span
                      className="text-[10px] font-semibold tabular-nums"
                      style={{ color: "var(--color-text-muted)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
                    >
                      {filledCount}/{COMPLETION_KEYS.length}
                    </span>
                  </div>
                  <div
                    className="h-1.5 w-full max-w-sm overflow-hidden rounded-full"
                    style={{ background: "color-mix(in srgb, var(--color-surface-deepest) 55%, transparent)" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completion}%` }}
                      transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{
                        background: "var(--gradient-button-primary)",
                        boxShadow: "0 0 10px color-mix(in srgb, var(--color-amber-primary) 55%, transparent)",
                      }}
                    />
                  </div>
                </div>
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
                  <div className="min-w-0 pb-1">
                    <div className="flex items-center gap-1.5">
                      <h1
                        className="truncate text-lg font-bold tracking-tight sm:text-xl"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {profile?.username || "Cervecero"}
                      </h1>
                      {profile?.isVerified && (
                        <span
                          title="Cuenta verificada"
                          className="shrink-0 text-[var(--color-amber-primary)]"
                        >
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 1.6l2.6 1.9 3.2-.2 1 3 2.8 1.7-1.1 3 1.1 3-2.8 1.7-1 3-3.2-.2L12 22.4l-2.6-1.9-3.2.2-1-3L2.4 16l1.1-3-1.1-3 2.8-1.7 1-3 3.2.2L12 1.6z" />
                            <path
                              d="M8.6 12.2l2.2 2.2 4.4-4.6"
                              fill="none"
                              stroke="var(--color-text-dark)"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                      {profile?.email}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {(planLabel || roleLabel) && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                          style={{
                            background: "color-mix(in srgb, var(--color-amber-primary) 14%, transparent)",
                            color: "var(--color-amber-primary)",
                            border: "1px solid color-mix(in srgb, var(--color-amber-primary) 25%, transparent)",
                          }}
                        >
                          {planLabel || roleLabel}
                        </span>
                      )}
                      {isGoogle && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{
                            background: "color-mix(in srgb, var(--color-text-primary) 6%, transparent)",
                            color: "var(--color-text-secondary)",
                            border: "1px solid color-mix(in srgb, var(--color-border-light) 60%, transparent)",
                          }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                          Google
                        </span>
                      )}
                      {memberSince && (
                        <span className="text-[10px]" style={{ color: "var(--color-text-subtle)" }}>
                          Miembro desde {memberSince}
                        </span>
                      )}
                    </div>
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
            className="hidden w-[280px] shrink-0 space-y-4 xl:block"
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

            {/* Account card */}
            <div
              className="glass-card rounded-2xl border p-5 transition-all duration-300"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border-amber) 30%, transparent)",
                boxShadow:
                  "0 8px 32px color-mix(in srgb, var(--color-surface-overlay) 40%, transparent), 0 0 20px color-mix(in srgb, var(--color-amber-primary) 3%, transparent)",
              }}
            >
              <div className="mb-3.5 flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-amber-primary)]"
                  style={{
                    background: "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)",
                    boxShadow: "0 0 8px color-mix(in srgb, var(--color-amber-primary) 12%, transparent)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="text-xs font-bold tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                  Cuenta
                </h3>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "Acceso", value: isGoogle ? "Google" : "Email y contraseña" },
                  ...(memberSince ? [{ label: "Miembro desde", value: memberSince }] : []),
                  ...(planLabel || roleLabel ? [{ label: "Plan", value: planLabel || roleLabel }] : []),
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-medium" style={{ color: "var(--color-text-muted)" }}>
                      {row.label}
                    </span>
                    <span className="truncate text-[11px] font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="active:scale-98 mt-4 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-all duration-250 hover:brightness-110"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-error) 35%, transparent)",
                  background: "color-mix(in srgb, var(--color-error) 10%, transparent)",
                  color: "color-mix(in srgb, var(--color-error) 80%, var(--color-text-primary))",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Cerrar sesión
              </button>
            </div>

            {/* Preferences card */}
            <div
              className="glass-card rounded-2xl border p-5 transition-all duration-300"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border-amber) 30%, transparent)",
                boxShadow:
                  "0 8px 32px color-mix(in srgb, var(--color-surface-overlay) 40%, transparent), 0 0 20px color-mix(in srgb, var(--color-amber-primary) 3%, transparent)",
              }}
            >
              <div className="mb-4 flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-amber-primary)]"
                  style={{
                    background: "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)",
                    boxShadow: "0 0 8px color-mix(in srgb, var(--color-amber-primary) 12%, transparent)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" />
                    <line x1="9" y1="8" x2="15" y2="8" />
                    <line x1="17" y1="16" x2="23" y2="16" />
                  </svg>
                </div>
                <h3 className="text-xs font-bold tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                  Preferencias
                </h3>
              </div>
              <div className="space-y-4">
                <Toggle
                  checked={prefs.emailNotifs}
                  onChange={() => togglePref("emailNotifs")}
                  label="Notificaciones por email"
                  desc="Catas, respuestas y novedades"
                />
                <Toggle
                  checked={prefs.publicProfile}
                  onChange={() => togglePref("publicProfile")}
                  label="Perfil público"
                  desc="Aparecé en la comunidad"
                />
                <Toggle
                  checked={prefs.newsletter}
                  onChange={() => togglePref("newsletter")}
                  label="Newsletter cervecero"
                  desc="Resumen semanal de la escena"
                />
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
