import { useState, useEffect } from 'react';

interface Province { code: number; name: string; }
interface District { code: number; name: string; }
interface Ward { code: number; name: string; }

const API = 'https://provinces.open-api.vn/api';

export function useLocationPicker() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [provinceCode, setProvinceCode] = useState<number | null>(null);
  const [districtCode, setDistrictCode] = useState<number | null>(null);
  const [loadingGeo, setLoadingGeo] = useState(false);

  useEffect(() => {
    fetch(`${API}/p/`)
      .then(r => r.json())
      .then(setProvinces)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!provinceCode) { setDistricts([]); setSelectedDistrict(''); setSelectedWard(''); setWards([]); return; }
    fetch(`${API}/p/${provinceCode}?depth=2`)
      .then(r => r.json())
      .then(d => setDistricts(d.districts || []))
      .catch(() => {});
    setSelectedDistrict('');
    setSelectedWard('');
    setWards([]);
  }, [provinceCode]);

  useEffect(() => {
    if (!districtCode) { setWards([]); setSelectedWard(''); return; }
    fetch(`${API}/d/${districtCode}?depth=2`)
      .then(r => r.json())
      .then(d => setWards(d.wards || []))
      .catch(() => {});
    setSelectedWard('');
  }, [districtCode]);

  const selectProvince = (name: string) => {
    setSelectedProvince(name);
    const p = provinces.find(p => p.name === name);
    setProvinceCode(p?.code || null);
  };

  const selectDistrict = (name: string) => {
    setSelectedDistrict(name);
    const d = districts.find(d => d.name === name);
    setDistrictCode(d?.code || null);
  };

  const selectWard = (name: string) => {
    setSelectedWard(name);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=vi`
          );
          const data = await res.json();
          const addr = data.address || {};
          
          // Try to match province
          const city = addr.city || addr.state || addr.province || '';
          const matchedProvince = provinces.find(p => 
            city.includes(p.name) || p.name.includes(city) ||
            normalizeVN(city).includes(normalizeVN(p.name)) || normalizeVN(p.name).includes(normalizeVN(city))
          );
          if (matchedProvince) {
            setSelectedProvince(matchedProvince.name);
            setProvinceCode(matchedProvince.code);
            
            // Wait for districts to load then match
            const pRes = await fetch(`${API}/p/${matchedProvince.code}?depth=2`);
            const pData = await pRes.json();
            const dists = pData.districts || [];
            setDistricts(dists);
            
            const suburb = addr.suburb || addr.county || addr.district || addr.city_district || '';
            const matchedDistrict = dists.find((d: District) =>
              normalizeVN(suburb).includes(normalizeVN(d.name)) || normalizeVN(d.name).includes(normalizeVN(suburb))
            );
            if (matchedDistrict) {
              setSelectedDistrict(matchedDistrict.name);
              setDistrictCode(matchedDistrict.code);
              
              const dRes = await fetch(`${API}/d/${matchedDistrict.code}?depth=2`);
              const dData = await dRes.json();
              const ws = dData.wards || [];
              setWards(ws);
              
              const quarter = addr.quarter || addr.village || addr.neighbourhood || '';
              const matchedWard = ws.find((w: Ward) =>
                normalizeVN(quarter).includes(normalizeVN(w.name)) || normalizeVN(w.name).includes(normalizeVN(quarter))
              );
              if (matchedWard) setSelectedWard(matchedWard.name);
            }
          }
        } catch {}
        setLoadingGeo(false);
      },
      () => setLoadingGeo(false),
      { enableHighAccuracy: true }
    );
  };

  return {
    provinces, districts, wards,
    selectedProvince, selectedDistrict, selectedWard,
    selectProvince, selectDistrict, selectWard,
    useCurrentLocation, loadingGeo,
    setSelectedProvince, setSelectedDistrict, setSelectedWard,
    setProvinceCode, setDistrictCode,
  };
}

function normalizeVN(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}
