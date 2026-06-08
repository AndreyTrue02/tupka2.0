export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair';
export type DealStatus = 'pending' | 'paid' | 'completed' | 'disputed' | 'cancelled';

export interface User {
  id: number;
  username: string | null;
  first_name: string | null;
  city: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  music_projects?: string | null;
  project_links?: string | null;
  rating: number;
  deals_count: number;
  created_at: string;
}

export interface UserUpdate {
  username?: string | null;
  first_name?: string | null;
  city?: string | null;
  bio?: string | null;
  music_projects?: string | null;
  project_links?: string | null;
  avatar_url?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  level: number;
  children: Category[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  country: string | null;
  website_url: string | null;
  is_active: boolean;
}

export interface EquipmentModel {
  id: number;
  brand_id: number;
  category_id: number;
  name: string;
  slug: string;
  is_active: boolean;
  brand: Brand;
  category: Category | null;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Photo {
  id: number;
  file_id: string;
  order_num: number;
  url: string;
}

export interface PhotoUpload {
  url: string;
}

export interface ListingShort {
  id: number;
  seller_id: number;
  category_id: number;
  brand_id: number | null;
  equipment_model_id: number | null;
  model_name: string | null;
  title: string;
  description: string | null;
  price: number;
  condition: ListingCondition;
  city: string | null;
  is_sold: boolean;
  views_count: number;
  created_at: string;
  cover_photo: Photo | null;
  seller: User;
  category: Category | null;
  brand: Brand | null;
  equipment_model: EquipmentModel | null;
  is_favorite: boolean;
}

export interface Listing extends ListingShort {
  seller: User;
  category: Category;
  is_active: boolean;
  photos: Photo[];
  tags: Tag[];
}

export interface ListingCreate {
  category_id: number;
  brand_id?: number;
  equipment_model_id?: number;
  model_name?: string;
  title: string;
  description?: string;
  price: number;
  condition: ListingCondition;
  city?: string;
  tag_ids?: number[];
  photo_urls?: string[];
}

export interface ListingUpdate {
  title?: string;
  description?: string;
  price?: number;
  condition?: ListingCondition;
  city?: string;
  brand_id?: number | null;
  equipment_model_id?: number | null;
  model_name?: string | null;
  is_active?: boolean;
  is_sold?: boolean;
  tag_ids?: number[];
}

export interface CommunityRoom {
  id: number;
  category_id: number;
  title: string;
  members_count: number;
}

export interface CommunityMessage {
  id: number;
  room_id: number;
  sender_id: number;
  sender: User;
  text: string;
  created_at: string;
}

export interface CommunityMessageCreate {
  text: string;
}

export interface Deal {
  id: number;
  listing_id: number;
  buyer_id: number;
  seller_id: number;
  amount: number;
  status: DealStatus;
  created_at: string;
}

export interface DealCreate {
  listing_id: number;
}

export interface Review {
  id: number;
  deal_id: number;
  author_id: number;
  target_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  author: User;
}

export interface ReviewCreate {
  deal_id: number;
  rating: number;
  comment?: string;
}

export interface ListingFilters {
  category_id?: number;
  brand_id?: number;
  equipment_model_id?: number;
  tag_ids?: number[];
  city?: string;
  condition?: ListingCondition;
  min_price?: number;
  max_price?: number;
  search?: string;
  page?: number;
  size?: number;
}
