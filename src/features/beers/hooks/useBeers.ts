"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBeerReview, getBeers, toggleBeerLike } from "../api/beers.api";
import type { Beer } from "../model/types";

export const BEERS_QUERY_KEY = ["beers"];

export const useBeers = (query = "") => {
  const queryClient = useQueryClient();

  const {
    data: beers = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Beer[]>({
    queryKey: [...BEERS_QUERY_KEY, query],
    queryFn: () => getBeers(query),
  });

  const { mutateAsync: onToggleLike } = useMutation({
    mutationFn: toggleBeerLike,
    onSuccess: () => {
      // Invalidar cache de cervezas
      queryClient.invalidateQueries({ queryKey: BEERS_QUERY_KEY });
    },
  });

  const { mutateAsync: onCreateReview } = useMutation({
    mutationFn: ({ beerId, comment }: { beerId: string; comment: string }) =>
      createBeerReview(beerId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BEERS_QUERY_KEY });
    },
  });

  return {
    beers,
    isLoading,
    isError,
    refreshBeers: refetch, // Para mantener compatibilidad si se llama explícitamente
    onToggleLike,
    onCreateReview,
  };
};
