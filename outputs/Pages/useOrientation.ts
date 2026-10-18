import { useEffect, useState } from 'react';

import {
  DISPLAY_PREFERENCES_EVENT,
  getOrientationPreference,
  type OrientationPreference,
} from './displayPreferences';

export type PageOrientation = 'vertical' | 'horizontal';

function getDeviceOrientation(): PageOrientation {
  if (typeof window === 'undefined') return 'vertical';
  return window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical';
}

function resolveOrientation(preference: OrientationPreference): PageOrientation {
  return preference === 'automatic' ? getDeviceOrientation() : preference;
}

export function useOrientation(override?: OrientationPreference): PageOrientation {
  const getCurrentOrientation = () => resolveOrientation(override ?? getOrientationPreference());
  const [orientation, setOrientation] = useState<PageOrientation>(getCurrentOrientation);

  useEffect(() => {
    const update = () => setOrientation(getCurrentOrientation());
    update();
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener(DISPLAY_PREFERENCES_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener(DISPLAY_PREFERENCES_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, [override]);

  return orientation;
}
