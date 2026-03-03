import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import nepal from '@/data/nepal';

interface LocationSelectorProps {
  value?: string;
  onChange: (location: string) => void;
}

export default function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const [province, setProvince]       = useState('');
  const [district, setDistrict]       = useState('');
  const [municipality, setMunicipality] = useState('');

  // Parse incoming value back into selections (for edit mode)
  useEffect(() => {
    if (value && !province) {
      // Try to find which province/district matches the stored value
      // Format stored: "Municipality, District, Province"
      const parts = value.split(', ');
      if (parts.length >= 2) {
        const districtName = parts[1];
        const prov = nepal.find(p => p.districts.some(d => d.name === districtName));
        if (prov) {
          setProvince(prov.name);
          setDistrict(districtName);
          if (parts[0]) setMunicipality(parts[0]);
        }
      }
    }
  }, []);

  const selectedProvince = nepal.find(p => p.name === province);
  const selectedDistrict = selectedProvince?.districts.find(d => d.name === district);

  const handleProvinceChange = (val: string) => {
    setProvince(val);
    setDistrict('');
    setMunicipality('');
    onChange('');
  };

  const handleDistrictChange = (val: string) => {
    setDistrict(val);
    setMunicipality('');
    // Store district level immediately
    onChange(`${val}, ${province}`);
  };

  const handleMunicipalityChange = (val: string) => {
    setMunicipality(val);
    // Store full location string
    onChange(`${val}, ${district}`);
  };

  // Type badge colors
  const typeColor = (type: string) => {
    switch (type) {
      case 'Metropolitan':     return 'text-purple-600';
      case 'Sub-Metropolitan': return 'text-blue-600';
      case 'Municipality':     return 'text-emerald-600';
      default:                 return 'text-stone-400';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5 text-stone-400" />
        <Label className="text-xs font-semibold tracking-wider uppercase text-stone-500">
          Location
        </Label>
      </div>

      <div className="grid grid-cols-1 gap-2">

        {/* Province */}
        <Select value={province} onValueChange={handleProvinceChange}>
          <SelectTrigger className="border-stone-200 focus:ring-stone-400 text-sm">
            <SelectValue placeholder="Select Province" />
          </SelectTrigger>
          <SelectContent>
            {nepal.map(p => (
              <SelectItem key={p.id} value={p.name}>
                <span className="font-mono text-[10px] text-stone-400 mr-2">P{p.id}</span>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* District — only show after province selected */}
        {province && (
          <Select value={district} onValueChange={handleDistrictChange}>
            <SelectTrigger className="border-stone-200 focus:ring-stone-400 text-sm">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {selectedProvince?.districts.map(d => (
                <SelectItem key={d.name} value={d.name}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Municipality — only show after district selected */}
        {district && selectedDistrict && (
          <Select value={municipality} onValueChange={handleMunicipalityChange}>
            <SelectTrigger className="border-stone-200 focus:ring-stone-400 text-sm">
              <SelectValue placeholder="Select Municipality / VDC" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {selectedDistrict.municipalities.map(m => (
                <SelectItem key={m.name} value={m.name}>
                  <span className="flex items-center gap-2">
                    {m.name}
                    <span className={`text-[10px] ${typeColor(m.type)}`}>
                      {m.type === 'Rural Municipality' ? 'Rural' :
                       m.type === 'Sub-Metropolitan' ? 'Sub-Metro' :
                       m.type}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

      </div>

      {/* Preview of selected location */}
      {!!value && (
        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 bg-stone-50 border border-stone-200 px-2.5 py-1.5">
          <MapPin className="h-3 w-3 text-stone-400 shrink-0" />
          <span className="font-mono">{value}</span>
        </div>
      )}
    </div>
  );
}