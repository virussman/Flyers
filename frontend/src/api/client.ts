/// <reference types="vite/client" />
import axios from 'axios';
import type { Ad, CreateAdRequest, PricingInfo, ApiResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const adsApi = {
  calculatePrice: (description: string, isPremium: boolean) =>
    api.post<PricingInfo>('/ads/calculate-price', {
      description,
      is_premium: isPremium,
    }),

  create: (data: CreateAdRequest) => api.post<Ad>('/ads', data),

  list: (params?: {
    category?: string;
    location?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse<Ad[]>>('/ads', { params }),

  get: (id: number) => api.get<Ad>(`/ads/${id}`),

  update: (id: number, data: Partial<CreateAdRequest>) =>
    api.put<Ad>(`/ads/${id}`, data),

  delete: (id: number) => api.delete(`/ads/${id}`),
};