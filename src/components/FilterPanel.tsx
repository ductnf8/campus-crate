import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, SlidersHorizontal, MapPin, Building2, Home, DollarSign, Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Province { code: number; name: string; }
interface District { code: number; name: string; }
interface Ward { code: number; name: string; }

const API = 'https://provinces.open-api.vn/api';

interface FilterPanelProps {
  search?: string;
  setSearch?: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  district: string;
  setDistrict: (v: string) => void;
  ward: string;
  setWard: (v: string) => void;
  priceMin: string;
  setPriceMin: (v: string) => void;
  priceMax: string;
  setPriceMax: (v: string) => void;
  onClear: () => void;
}

export default function FilterPanel({
  search, setSearch,
  location, setLocation, district, setDistrict, ward, setWard,
  priceMin, setPriceMin, priceMax, setPriceMax, onClear,
}: FilterPanelProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [provinceCode, setProvinceCode] = useState<number | null>(null);
  const [districtCode, setDistrictCode] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API}/p/`).then(r => r.json()).then(setProvinces).catch(() => {});
  }, []);

  useEffect(() => {
    if (!provinceCode) { setDistricts([]); return; }
    fetch(`${API}/p/${provinceCode}?depth=2`)
      .then(r => r.json())
      .then(d => setDistricts(d.districts || []))
      .catch(() => {});
  }, [provinceCode]);

  useEffect(() => {
    if (!districtCode) { setWards([]); return; }
    fetch(`${API}/d/${districtCode}?depth=2`)
      .then(r => r.json())
      .then(d => setWards(d.wards || []))
      .catch(() => {});
  }, [districtCode]);

  const handleProvinceChange = (name: string) => {
    setLocation(name);
    setDistrict('');
    setWard('');
    setDistrictCode(null);
    if (name === 'all' || !name) { setProvinceCode(null); return; }
    const p = provinces.find(p => p.name === name);
    setProvinceCode(p?.code || null);
  };

  const handleDistrictChange = (name: string) => {
    setDistrict(name);
    setWard('');
    if (name === 'all' || !name) { setDistrictCode(null); return; }
    const d = districts.find(d => d.name === name);
    setDistrictCode(d?.code || null);
  };

  const handleWardChange = (name: string) => {
    setWard(name);
  };

  const hasFilters = (location && location !== 'all') || priceMin || priceMax || (district && district !== 'all') || (ward && ward !== 'all');

  return (
    <div className="space-y-5 p-5 bg-card rounded-2xl border border-border/50 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
          </div>
          Bộ lọc
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-7 text-xs text-muted-foreground hover:text-destructive px-2">
            <X className="h-3 w-3 mr-1" /> Xóa tất cả
          </Button>
        )}
      </div>

      <Separator />

      {/* Search */}
      {setSearch && (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-primary" /> Tìm kiếm
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search || ''}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tên sản phẩm..."
              className="h-9 rounded-xl text-sm bg-background pl-9"
            />
          </div>
        </div>
      )}

      {setSearch && <Separator />}

      {/* Location Section */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-primary" /> Địa điểm
        </div>

        {/* Province */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Tỉnh / Thành phố</label>
          <Select value={location || 'all'} onValueChange={handleProvinceChange}>
            <SelectTrigger className="w-full bg-background text-sm h-9 rounded-xl">
              <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-60">
              <SelectItem value="all">Tất cả</SelectItem>
              {provinces.map(p => (
                <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District */}
        {districts.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <Building2 className="h-3 w-3" /> Quận / Huyện
            </label>
            <Select value={district || 'all'} onValueChange={handleDistrictChange}>
              <SelectTrigger className="w-full bg-background text-sm h-9 rounded-xl">
                <SelectValue placeholder="Chọn Quận/Huyện" />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-60">
                <SelectItem value="all">Tất cả</SelectItem>
                {districts.map(d => (
                  <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Ward */}
        {wards.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <Home className="h-3 w-3" /> Phường / Xã
            </label>
            <Select value={ward || 'all'} onValueChange={handleWardChange}>
              <SelectTrigger className="w-full bg-background text-sm h-9 rounded-xl">
                <SelectValue placeholder="Chọn Phường/Xã" />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-60">
                <SelectItem value="all">Tất cả</SelectItem>
                {wards.map(w => (
                  <SelectItem key={w.code} value={w.name}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Separator />

      {/* Price range */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-primary" /> Khoảng giá (₫)
        </div>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-[11px] text-muted-foreground">Tối thiểu</label>
            <Input
              type="number"
              placeholder="0₫"
              value={priceMin}
              onChange={e => setPriceMin(e.target.value)}
              className="h-9 rounded-xl text-sm bg-background"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[11px] text-muted-foreground">Tối đa</label>
            <Input
              type="number"
              placeholder="∞"
              value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
              className="h-9 rounded-xl text-sm bg-background"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
