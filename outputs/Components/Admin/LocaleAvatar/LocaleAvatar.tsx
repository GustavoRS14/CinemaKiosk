import React, { useState, useEffect } from 'react';
import './LocaleAvatar.css';

export interface LocaleAvatarProps {
  /*
   * The ISO locale string (e.g., 'pt-BR', 'en-US', 'pt-PT').
   * The component dynamically imports the matching SVG from @icons/Flags/{lang}/{COUNTRY}.svg
   */
  locale?: string;
}

export const LocaleAvatar: React.FC<LocaleAvatarProps> = ({
  locale = 'pt-BR',
}) => {
  // State to hold the dynamically loaded SVG component
  const [FlagIcon, setFlagIcon] = useState<React.FC<React.SVGProps<SVGSVGElement>> | null>(null);

  const normalizedLocale = locale.trim().toLowerCase();

  useEffect(() => {
    let isMounted = true;

    // Extract lang (e.g., 'pt') and country (e.g., 'BR') securely
    // es-419 uses the existing Spain flag asset while retaining the
    // Latin-American Spanish locale for translations and formatting.
    const flagLocale = normalizedLocale === 'es-419' ? 'es-es' : normalizedLocale;
    const parts = flagLocale.split('-');
    const lang = parts[0] ? parts[0].toLowerCase() : 'pt';
    const country = parts[1] ? parts[1].toUpperCase() : 'BR';

    // Blind dynamic import - bundler maps the whole directory automatically
    import(`@icons/Flags/${lang}/${country}.svg`)
      .then((module) => {
        if (isMounted) {
          // Supports default exports and SVGR ReactComponent exports
          setFlagIcon(() => module.ReactComponent || module.default || module);
        }
      })
      .catch(() => {
        // Absolute fallback if the developer types a non-existent flag
        import(`@icons/Flags/pt/BR.svg`).then((fallbackModule) => {
          if (isMounted) {
            setFlagIcon(() => fallbackModule.ReactComponent || fallbackModule.default || fallbackModule);
          }
        });
      });

    return () => {
      isMounted = false;
    };
  }, [normalizedLocale]);

  return (
    <div className="locale-avatar-wrapper" data-locale={normalizedLocale} aria-label={`Flag of ${normalizedLocale}`}>
      {FlagIcon ? <FlagIcon aria-hidden="true" className="locale-avatar-icon"/> : null}
    </div>
  );
};
