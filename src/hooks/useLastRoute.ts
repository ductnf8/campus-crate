import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'stumarket_last_route';

// Pages that should be remembered
const TRACKABLE = ['/', '/item/'];

export function useTrackRoute() {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    if (TRACKABLE.some(p => path === p || path.startsWith('/item/'))) {
      sessionStorage.setItem(STORAGE_KEY, path);
    }
  }, [location.pathname]);
}

export function getLastRoute(): string {
  return sessionStorage.getItem(STORAGE_KEY) || '/';
}
