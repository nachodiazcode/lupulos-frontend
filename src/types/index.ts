/* ═══════════════════════════════════════════
   Lúpulos App — Shared Types
   ═══════════════════════════════════════════ */

export interface User {
  _id: string;
  id?: string;
  username: string;
  email?: string;
  fotoPerfil?: string;
  photo?: string;
  profilePicture?: string;
  ciudad?: string;
  pais?: string;
  bio?: string;
  sitioWeb?: string;
  pronombres?: string;
  [key: string]: unknown;
}

export interface Review {
  _id: string;
  comment: string;
  rating: number;
  createdAt?: string;
  user?: Pick<User, "_id" | "id" | "username" | "fotoPerfil" | "photo" | "profilePicture">;
}

export interface Beer {
  _id: string;
  name: string;
  style: string;
  abv: number;
  description: string;
  brewery: string;
  image?: string;
  likes: string[];
  averageRating?: number;
  reviews?: Review[];
  createdBy?: Pick<User, "_id" | "id" | "username" | "fotoPerfil" | "profilePicture">;
  createdAt?: string;
}

/** Helpers */
export const getUserId = (u?: Pick<User, "_id" | "id"> | null): string => u?._id ?? u?.id ?? "";

export const getUserAvatarPath = (
  u?: Pick<User, "fotoPerfil" | "photo" | "profilePicture"> | null,
): string => {
  const path = u?.fotoPerfil || u?.photo || u?.profilePicture || "";
  return path.startsWith("./") ? path.replace("./", "/") : path;
};
