export interface BeerReviewUser {
  _id?: string;
  id?: string;
  username?: string;
  fotoPerfil?: string;
  profilePicture?: string;
}

export interface BeerReview {
  comment: string;
  rating: number;
  user?: BeerReviewUser;
}

export interface Beer {
  _id: string;
  name: string;
  description: string;
  image?: string;
  brewery: string;
  style: string;
  abv: number;
  likes: string[];
  reviews: BeerReview[];
  averageRating?: number;
  createdBy?: BeerReviewUser;
  createdAt?: string;
}

export interface BeersApiResponse {
  success?: boolean;
  data?: Beer[];
}
