export interface PG {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string;
  priceRange: string;
  roomTypes: RoomType[];
  amenities: string[];
  images: string[];
  mapEmbedUrl?: string;
  contactNumber?: string;
  contactEmail?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RoomType {
  type: string;
  price: number;
  availability: number;
  description?: string;
}

export interface PGFilter {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  roomType?: string;
}
