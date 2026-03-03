export type AdStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface Ad {
  id: number;
  title: string;
  description: string;
  category: string;
  price?: number;
  word_count: number;
  total_cost: number;
  contact_phone: string;
  contact_email?: string;
  location?: string;
  status: AdStatus;
  is_premium: boolean;
  image_urls?: string[];
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface CreateAdRequest {
  title: string;
  description: string;
  category: string;
  price?: number;
  contact_phone: string;
  contact_email?: string;
  location?: string;
  is_premium: boolean;
  image_urls?: string[];
}

export interface PricingInfo {
  word_count: number;
  price_per_word: number;
  base_cost: number;
  minimum_cost: number;
  is_premium: boolean;
  premium_multiplier: number;
  total_cost: number;
}

export interface ApiResponse<T> {
  data: T;
  total: number;
  page: number;
  limit: number;
}