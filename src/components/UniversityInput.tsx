import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { GraduationCap } from 'lucide-react';
import { VN_UNIVERSITIES } from '@/lib/universities';

interface UniversityInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

function normalize(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}

export default function UniversityInput({ value, onChange, placeholder }: UniversityInputProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const q = normalize(value);
  const filtered = (q
    ? VN_UNIVERSITIES.filter(u => normalize(u).includes(q))
    : VN_UNIVERSITIES
  ).slice(0, 8);

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || 'VD: Đại học FPT'}
          className="pl-9"
          autoComplete="off"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border bg-popover shadow-xl max-h-64 overflow-y-auto">
          {filtered.map(u => (
            <button
              type="button"
              key={u}
              onClick={() => { onChange(u); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2"
            >
              <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{u}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
