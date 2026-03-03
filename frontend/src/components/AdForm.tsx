import { useState, useCallback, useRef } from 'react';
import { adsApi } from '@/api/client';
import type { CreateAdRequest, PricingInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2, Calculator, Sparkles } from 'lucide-react';
import LocationSelector from '@/components/LocationSelector';

const CATEGORIES = [
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'jobs',        label: 'Employment'  },
  { value: 'services',    label: 'Services'    },
  { value: 'matrimonial', label: 'Matrimonial' },
  { value: 'automobiles', label: 'Automobiles' },
];

const INITIAL_FORM: CreateAdRequest = {
  title: '', description: '', category: 'real-estate',
  contact_phone: '', location: '', is_premium: false,
};

export default function AdForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm]           = useState<CreateAdRequest>(INITIAL_FORM);
  const [pricing, setPricing]     = useState<PricingInfo | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calculatePrice = useCallback(async (description: string, isPremium: boolean) => {
    if (!description.trim()) { setPricing(null); return; }
    setCalculating(true);
    try {
      const res = await adsApi.calculatePrice(description, isPremium);
      setPricing(res.data);
    } catch {}
    finally { setCalculating(false); }
  }, []);

  const debouncedCalculate = useCallback((description: string, isPremium: boolean) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => calculatePrice(description, isPremium), 400);
  }, [calculatePrice]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'description') debouncedCalculate(value, updated.is_premium);
      return updated;
    });
  };

    const handlePremiumToggle = (checked: boolean) => {
    setForm(prev => {
      debouncedCalculate(prev.description, checked);
      return { ...prev, is_premium: checked };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adsApi.create(form);
      setSubmitted(true);
      setForm(INITIAL_FORM);
      setPricing(null);
      onSuccess?.();
    } catch {
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = form.description.trim()
    ? form.description.trim().split(/\s+/).length : 0;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-serif text-xl font-bold text-stone-900 mb-1">Ad Submitted</h3>
          <p className="text-sm text-stone-500">
            Your listing is under review and will be published shortly.
          </p>
        </div>
        <Button variant="outline" onClick={() => setSubmitted(false)} className="mt-2">
          Post Another Ad
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-xs font-semibold tracking-wider uppercase text-stone-500">
          Headline *
        </Label>
        <Input
          id="title" name="title" value={form.title}
          onChange={handleTextChange} required maxLength={200}
          placeholder="e.g., 3BHK House for Sale — Lalitpur"
          className="font-serif text-stone-900 placeholder:text-stone-300 border-stone-200 focus-visible:ring-1 focus-visible:ring-stone-400"
        />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold tracking-wider uppercase text-stone-500">
          Section *
        </Label>
        <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
          <SelectTrigger className="border-stone-200 focus:ring-stone-400">
            <SelectValue placeholder="Choose category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="description" className="text-xs font-semibold tracking-wider uppercase text-stone-500">
            Advertisement Text *
          </Label>
          <span className="text-[11px] text-stone-400 font-mono">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>
        <Textarea
          id="description" name="description" value={form.description}
          onChange={handleTextChange} required rows={5}
          placeholder="Write your classified advertisement here. Be clear and concise — every word is counted."
          className="resize-none text-sm leading-relaxed text-stone-800 placeholder:text-stone-300 border-stone-200 focus-visible:ring-1 focus-visible:ring-stone-400 [text-align:justify]"
        />
      </div>

      {/* Premium Toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-lg bg-amber-50 border border-amber-200">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Premium Listing</p>
            <p className="text-xs text-amber-700">2× visibility · Bold display · Priority placement</p>
          </div>
        </div>
        <Switch
          checked={form.is_premium}
          onCheckedChange={handlePremiumToggle}
          className="data-[state=checked]:bg-amber-500"
        />
      </div>

      {/* Price Calculator */}
      {(pricing || calculating) && (
        <div className="rounded-lg border border-stone-200 bg-stone-50 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-200 bg-stone-100">
            <Calculator className="h-3.5 w-3.5 text-stone-500" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-stone-500">
              Price Calculation
            </span>
            {calculating && <Loader2 className="h-3 w-3 animate-spin text-stone-400 ml-auto" />}
          </div>
          {pricing && (
            <div className="px-4 py-3 space-y-1.5 font-mono text-[13px]">
              <div className="flex justify-between text-stone-600">
                <span>{pricing.word_count} words × Rs. {pricing.price_per_word}</span>
                <span>Rs. {pricing.word_count * pricing.price_per_word}</span>
              </div>
              {pricing.word_count * pricing.price_per_word < pricing.minimum_cost && (
                <div className="flex justify-between text-stone-500 text-[12px]">
                  <span>Minimum charge applies</span>
                  <span>Rs. {pricing.minimum_cost}</span>
                </div>
              )}
              {pricing.is_premium && (
                <div className="flex justify-between text-amber-700">
                  <span>Premium multiplier ×{pricing.premium_multiplier}</span>
                  <span>+Rs. {pricing.total_cost - pricing.base_cost}</span>
                </div>
              )}
              <Separator className="bg-stone-200 my-2" />
              <div className="flex justify-between font-bold text-stone-900 text-sm">
                <span>Total</span>
                <span className="text-base">Rs. {pricing.total_cost.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Phone */}
      <div className="space-y-1.5">
        <Label htmlFor="contact_phone" className="text-xs font-semibold tracking-wider uppercase text-stone-500">
          Phone *
        </Label>
        <div className="flex">
          <div className="flex items-center px-2.5 bg-stone-50 border border-r-0 border-stone-200 text-xs font-mono text-stone-500 shrink-0">
            +977
          </div>
          <Input
            id="contact_phone" name="contact_phone" type="tel"
            value={form.contact_phone} onChange={handleTextChange}
            required placeholder="98XXXXXXXX"
            className="font-mono border-stone-200 focus-visible:ring-1 focus-visible:ring-stone-400 rounded-l-none"
          />
        </div>
      </div>

      {/* Location — cascade dropdown */}
      <LocationSelector
        value={form.location}
        onChange={(loc) => setForm(prev => ({ ...prev, location: loc }))}
      />

      {/* Submit */}
      <Button
        type="submit" disabled={submitting}
        className="w-full bg-stone-900 hover:bg-stone-700 text-white font-semibold tracking-wide h-11 text-sm"
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Publishing…
          </span>
        ) : (
          <>
            Publish Ad
            {pricing && (
              <span className="ml-2 font-mono text-stone-300">
                — Rs. {pricing.total_cost.toLocaleString()}
              </span>
            )}
          </>
        )}
      </Button>
    </form>
  );
}