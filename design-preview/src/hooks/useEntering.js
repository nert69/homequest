import { useEffect, useState } from 'react';

// True for the first moment after a screen mounts, so its entrance cascade
// plays once; rows moved or added later (e.g. ticked into "bought") don't
// replay it.
export default function useEntering(ms = 1100) {
  const [entering, setEntering] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setEntering(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return entering;
}
