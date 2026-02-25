import api from "@/lib/api";
import type { Beer, BeersApiResponse } from "../model/types";

const normalizeBeers = (payload: BeersApiResponse): Beer[] => {
  if (!payload?.success || !Array.isArray(payload.data)) return [];
  return [...payload.data].reverse();
};

export const getBeers = async (query = ""): Promise<Beer[]> => {
  const url = query ? `/beer/search?name=${encodeURIComponent(query)}` : "/beer";
  const { data } = await api.get<BeersApiResponse>(url);
  return normalizeBeers(data);
};

export const toggleBeerLike = async (beerId: string): Promise<void> => {
  await api.post(`/beer/${beerId}/toggle-like`);
};

export const createBeerReview = async (beerId: string, comment: string): Promise<void> => {
  await api.post(`/beer/${beerId}/review`, { comment, rating: 5 });
};
