import { useState, useEffect, useCallback } from 'react';
import { adsApi } from '@/api/client';
import type { Ad } from '@/types';
import AdCard from './AdCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, AlertCircle, RefreshCw } from 'lucide-react';

interface AdListProps {
  refresh?: number;
  initialCategory?: string;
}

export default function AdList({ refresh, initialCategory = 'all' }: AdListProps) {
  const [ads, setAds]       = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [total, setTotal]   = useState(0);
  const [location, setLocation] = useState('');
  const [page, setPage]     = useState(1);
  const LIMIT = 12;

  const fetchAds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: LIMIT,
        status: 'approved',
      };
      if (initialCategory !== 'all') params.category = initialCategory;
      if (location.trim()) params.location = location.trim();

      const res = await adsApi.list(params);
      setAds(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setError('Could not load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [initialCategory, location, page, refresh]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // Reset page when location filter changes
  useEffect(() => {
    setPage(1);
  }, [location, initialCategory]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">

      {/* Location filter */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
        <Input
          placeholder="Filter by location…"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="pl-8 border-stone-200 text-sm focus-visible:ring-1 focus-visible:ring-stone-400 bg-white"
        />
      </div>

      {/* Stats bar */}
      {!loading && !error && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-stone-400 font-mono uppercase tracking-wider">
            {total} listing{total !== 1 ? 's' : ''} found
            {location && <span className="ml-1">in "{location}"</span>}
          </p>
          <button
            onClick={fetchAds}
            className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-stone-300" />
            <p className="text-xs text-stone-400 font-mono tracking-wider uppercase">Loading</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <AlertCircle className="h-8 w-8 text-stone-300" />
          <p className="text-sm text-stone-500">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchAds} className="border-stone-200">
            Try Again
          </Button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && ads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="font-serif text-6xl text-stone-200 leading-none">—</div>
          <p className="font-serif text-stone-500 text-lg">No listings found</p>
          <p className="text-xs text-stone-400">
            {initialCategory !== 'all' || location
              ? 'Try adjusting your filters'
              : 'Be the first to post an ad in this section'}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && ads.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ads.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-stone-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                ← Prev
              </Button>
              <span className="text-xs text-stone-400 font-mono px-4">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}