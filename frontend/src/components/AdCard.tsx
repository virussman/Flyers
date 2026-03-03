import { Card, CardContent } from '@/components/ui/card';
import type { Ad } from '@/types';
import { Phone, MapPin, Clock, Star } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  'real-estate': 'Real Estate',
  jobs:          'Employment',
  services:      'Services',
  matrimonial:   'Matrimonial',
  automobiles:   'Automobiles',
};

const CATEGORY_STYLES: Record<string, string> = {
  'real-estate': 'bg-stone-100 text-stone-800 border-stone-300',
  jobs:          'bg-emerald-50 text-emerald-800 border-emerald-300',
  services:      'bg-sky-50 text-sky-800 border-sky-300',
  matrimonial:   'bg-rose-50 text-rose-800 border-rose-300',
  automobiles:   'bg-amber-50 text-amber-800 border-amber-300',
};

interface AdCardProps {
  ad: Ad;
}

export default function AdCard({ ad }: AdCardProps) {
  const formattedDate = new Date(ad.created_at).toLocaleDateString('en-NP', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card
      className={`group relative overflow-hidden border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        ad.is_premium
          ? 'border-amber-300 bg-gradient-to-br from-amber-50/60 to-white shadow-amber-100/50'
          : 'border-stone-200 bg-white hover:border-stone-400'
      }`}
    >
      {/* Premium top stripe */}
      {ad.is_premium && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />
      )}

      <CardContent className="p-5 flex flex-col">

        {/* ── Header ── */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`inline-block text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded border ${
                CATEGORY_STYLES[ad.category] || 'bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              {CATEGORY_LABELS[ad.category] || ad.category}
            </span>
            {ad.is_premium && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold tracking-widest uppercase text-amber-700">
                <Star className="h-2.5 w-2.5 fill-amber-500 stroke-amber-500" />
                Premium
              </span>
            )}
          </div>

          <h3 className="font-serif text-[15px] font-bold leading-snug text-stone-900 line-clamp-2 group-hover:text-stone-700 transition-colors">
            {ad.title}
          </h3>
        </div>

        {/* ── Description — fixed 3 lines ── */}
        <p className="text-[13px] leading-relaxed text-stone-600 line-clamp-3 [text-align:justify] mb-4 min-h-[4.5rem]">
          {ad.description}
        </p>

        {/* ── Divider ── */}
        <div className="h-px bg-stone-100 mb-3" />

        {/* ── Footer ── */}
        <div className="flex flex-col gap-1 text-xs">
          {/* Phone — clickable to dial + WhatsApp icon */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:+977${ad.contact_phone}`}
              className="flex items-center gap-1 text-stone-800 font-mono font-semibold hover:text-stone-500 transition-colors"
              title="Tap to call"
            >
              <Phone className="h-3 w-3 shrink-0 text-stone-400" />
              {ad.contact_phone}
            </a>
            <a
              href={`https://wa.me/977${ad.contact_phone}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Chat on WhatsApp"
              className="text-[#25D366] hover:text-[#1da851] transition-colors"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
          {/* Location + date */}
          <div className="flex items-center gap-2 text-stone-400">
            {ad.location && (
              <span className="flex items-center gap-0.5 max-w-[90px] truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{ad.location}</span>
              </span>
            )}
            <span className="flex items-center gap-0.5 shrink-0">
              <Clock className="h-3 w-3 shrink-0" />
              {formattedDate}
            </span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}