'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Lang, getLangFromCookie, setLangCookie, langLabels, pageTranslations } from '@/lib/i18n';

export function useTranslation() {
  const [lang, setLang] = useState<Lang>('es');

  useEffect(() => {
    setLang(getLangFromCookie());

    // Listen for lang changes from other components (cookie polling)
    const interval = setInterval(() => {
      const current = getLangFromCookie();
      setLang((prev) => (prev !== current ? current : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const changeLang = useCallback((l: Lang) => {
    setLang(l);
    setLangCookie(l);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return pageTranslations[lang]?.[key] || pageTranslations.es[key] || key;
    },
    [lang]
  );

  return { t, lang, changeLang, langLabels };
}
