"use client";

import { useCallback, useState } from "react";
import { createBeerReview, getBeers, toggleBeerLike } from "../api/beers.api";
import type { Beer } from "../model/types";

export const useBeers = () => {
  const [beers, setBeers] = useState<Beer[]>([]);

  const refreshBeers = useCallback(async (query = "") => {
    const data = await getBeers(query);
    setBeers(data);
  }, []);

  const onToggleLike = useCallback(async (beerId: string) => {
    await toggleBeerLike(beerId);
  }, []);

  const onCreateReview = useCallback(async (beerId: string, comment: string) => {
    await createBeerReview(beerId, comment);
  }, []);

  return { beers, refreshBeers, onToggleLike, onCreateReview };
};
