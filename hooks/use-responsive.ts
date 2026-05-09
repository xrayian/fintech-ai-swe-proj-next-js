'use client';

import { useState, useEffect } from 'react';

export function useResponsive() {
  const [size, setSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 767px)');
    const mqTablet = window.matchMedia('(min-width: 768px) and (max-width: 1024px)');

    const update = () => {
      if (mqMobile.matches) setSize('mobile');
      else if (mqTablet.matches) setSize('tablet');
      else setSize('desktop');
    };

    update();
    mqMobile.addEventListener('change', update);
    mqTablet.addEventListener('change', update);
    return () => {
      mqMobile.removeEventListener('change', update);
      mqTablet.removeEventListener('change', update);
    };
  }, []);

  return {
    isMobile: size === 'mobile',
    isTablet: size === 'tablet',
    isDesktop: size === 'desktop',
    size,
  };
}
