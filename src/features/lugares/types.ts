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
}
