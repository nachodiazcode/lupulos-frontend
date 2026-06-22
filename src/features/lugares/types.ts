import type { Beer } from "@/features/beers/model/types";

export interface Review {
  _id?: string;
  comment: string;
  rating: number;
  user?: { username: string };
  createdAt?: string;
}

export interface Place {
  _id: string;
  name: string;
  description: string;
  coverImage?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  reviews?: Review[];
  likes?: string[];
  owner?: string;
  isFeatured?: boolean;
  beers?: Beer[];
  promotions?: Array<{
    _id?: string;
    description: string;
    discountPercent?: number;
    startDate?: string;
    endDate?: string;
  }>;
  hasTerrace?: boolean;
  hasLiveMusic?: boolean;
  isPetFriendly?: boolean;
}
