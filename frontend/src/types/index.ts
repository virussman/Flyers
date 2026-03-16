// ================================================================
// FILE: src/types/index.ts
// Centralised shared types
// ================================================================

export interface TickerItem {
  cat: string;
  title: string;
}

export interface LiveFeedItem {
  id: string;
  cat: string;
  catKey: string;
  premium: boolean;
  title: string;
  desc: string;
  phone: string;
  loc: string;
  time: string;
}

export interface FeaturedItem {
  id: string;
  cat: string;
  catKey: string;
  title: string;
  desc: string;
  phone: string;
  loc: string;
  type: 'ad' | 'notice';
  noticeType?: string;
  meta?: string;
  by?: string;
  color?: string;
  bg?: string;
  premium?: boolean;
}

export interface CategoryCount {
  value: string;
  label: string;
  icon: string;
  count: number;
  isNP?: boolean;
}

// Banner uploaded via admin — one per category slug
export interface CategoryBanner {
  id: string;
  category: string;   // 'real-estate' | 'jobs' | etc.
  imageUrl: string;
  altText: string;
  linkUrl?: string;
  active: boolean;
}

export type NoticeType =
  | 'samvedana'
  | 'shraddhanjali'
  | 'bibaha'
  | 'bratabandha'
  | 'graduation'
  | 'birth'
  | 'business';

// ================================================================
// NOTICE — full DB shape (used by admin, dashboard, cards)
// ================================================================

export type NoticeStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface Notice {
  id: string;
  user_id?: number;
  notice_type: NoticeType;
  notice_status: NoticeStatus;
  display_size?: 'small' | 'large';

  // Common
  title: string;
  body_text?: string;
  published_by?: string;
  contact_phone?: string;

  // Obituary
  deceased_name?: string;
  deceased_name_en?: string;
  deceased_title?: string;
  birth_date_bs?: string;
  death_date_bs?: string;
  kriya_text?: string;
  funeral_location?: string;
  funeral_datetime?: string;
  photo_url?: string;

  // Celebration
  person1_name?: string;
  person2_name?: string;
  person1_photo_url?: string;
  person2_photo_url?: string;
  event_date_bs?: string;
  event_date_ad?: string;
  event_time?: string;
  event_venue?: string;
  blessings_from?: string;

  // Legal (admin only — stripped from public API)
  advertiser_name?: string;
  advertiser_citizenship?: string;
  advertiser_id_doc_url?: string;
  death_cert_url?: string;
  advertiser_relationship?: string;
  family_consent_agreed?: boolean;
  terms_agreed?: boolean;

  // Pricing & meta
  total_cost?: number;
  is_premium?: boolean;
  admin_note?: string;
  created_at?: string;
  updated_at?: string;
  expires_at?: string;

  // UI-only aliases (used by NoticeCard / homepage feed)
  type?: NoticeType;       // alias for notice_type
  message?: string;        // alias for body_text
  by?: string;             // alias for published_by
  meta?: string;
  color?: string;
  bg?: string;
  premium?: boolean;       // alias for is_premium
  createdAt?: string;      // alias for created_at
}

// LegacyNotice kept as alias — nothing breaks
export type LegacyNotice = Notice;

// ================================================================
// LOST & FOUND
// ================================================================

export type LostFoundStatus = 'pending' | 'active' | 'rejected' | 'resolved';

export interface LostFoundReport {
  id: number;
  type: 'lost' | 'found';
  status: LostFoundStatus;
  title: string;
  description: string;
  location?: string;
  date_lost?: string;
  phone: string;
  reward?: string;
  photo_url?: string;
  created_at: string;
  updated_at?: string;
}

// ================================================================
// NOTICE — create request & list response
// ================================================================

export interface CreateNoticeRequest {
  notice_type: NoticeType;
  display_size: 'small' | 'large';
  title: string;
  body_text: string;
  published_by: string;
  contact_phone?: string;
  deceased_name?: string;
  deceased_name_en?: string;
  deceased_title?: string;
  birth_date_bs?: string;
  death_date_bs?: string;
  kriya_text?: string;
  funeral_location?: string;
  funeral_datetime?: string;
  person1_name?: string;
  person2_name?: string;
  event_date_bs?: string;
  event_date_ad?: string;
  event_time?: string;
  event_venue?: string;
  blessings_from?: string;
  advertiser_name: string;
  advertiser_citizenship: string;
  advertiser_relationship?: string;
  family_consent_agreed: boolean;
  terms_agreed: boolean;
  is_premium: boolean;
}

export interface NoticeListResponse {
  notices: Notice[];
  total: number;
  page: number;
  limit: number;
}

// ================================================================
// AD TYPES
// ================================================================

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