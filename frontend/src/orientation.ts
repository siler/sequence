import { useEffect, useMemo, useState } from 'react';

export type Orientation = 'landscape' | 'portrait';

export const useOrientation = () => {
   const matcher = useMemo(
      () => window.matchMedia('(orientation:portrait)'),
      []
   );

   const [orientation, setOrientation] = useState<Orientation>(
      matcher.matches ? 'portrait' : 'landscape'
   );

   useEffect(() => {
      const listener = (ev: MediaQueryListEvent) => {
         setOrientation(ev.matches ? 'portrait' : 'landscape');
      };
      matcher.addEventListener('change', listener);
      return () => {
         matcher.removeEventListener('change', listener);
      };
   }, [matcher]);

   return orientation;
};
