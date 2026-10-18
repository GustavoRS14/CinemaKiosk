import type { AppLocale, TranslationKey } from '../../i18n';

export function formatLocalizedShowtime(time: string, locale: AppLocale) {
  if (locale === 'pt-BR') return time;
  const match = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time;
  const hours = Number(match[1]);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${match[2]} ${suffix}`;
}

export function formatLocalizedCalendarDate(value: Date | string, locale: AppLocale) {
  const date = value instanceof Date
    ? value
    : (() => {
      const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      return match
        ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
        : new Date(value);
    })();
  if (Number.isNaN(date.getTime())) return String(value);
  if (locale === 'en-US') {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${month} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
  }
  if (locale === 'es-419') {
    const month = date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
    return `${String(date.getDate()).padStart(2, '0')} ${month.charAt(0).toUpperCase()}${month.slice(1)}, ${date.getFullYear()}`;
  }
  return date.toLocaleDateString('pt-BR');
}

const portugueseMonthAliases: Record<string, { en: string; es: string }> = {
  jan: { en: 'Jan', es: 'Ene' }, fev: { en: 'Feb', es: 'Feb' }, mar: { en: 'Mar', es: 'Mar' },
  abr: { en: 'Apr', es: 'Abr' }, mai: { en: 'May', es: 'May' }, jun: { en: 'Jun', es: 'Jun' },
  jul: { en: 'Jul', es: 'Jul' }, ago: { en: 'Aug', es: 'Ago' }, set: { en: 'Sep', es: 'Sep' },
  out: { en: 'Oct', es: 'Oct' }, nov: { en: 'Nov', es: 'Nov' }, dez: { en: 'Dec', es: 'Dic' },
};

export function formatLocalizedCheckoutDate(value: string, locale: AppLocale) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const differenceInDays = Math.round((date.getTime() - startOfToday.getTime()) / 86_400_000);
    if (differenceInDays === 0 || differenceInDays === 1) {
      const relative = differenceInDays === 0
        ? { 'pt-BR': 'Hoje', 'en-US': 'Today', 'es-419': 'Hoy' }[locale]
        : { 'pt-BR': 'Amanhã', 'en-US': 'Tomorrow', 'es-419': 'Mañana' }[locale];
      const localizedMonth = date.toLocaleDateString(locale, { month: 'short' }).replace('.', '');
      const displayMonth = localizedMonth.charAt(0).toLocaleUpperCase(locale) + localizedMonth.slice(1);
      return locale === 'en-US'
        ? `${relative}, ${displayMonth} ${day}`
        : `${relative}, ${day} ${displayMonth}`;
    }
    return formatLocalizedCalendarDate(value, locale);
  }
  if (locale === 'pt-BR') return value;

  const relativeMatch = value.trim().match(/^(Hoje|Amanhã),\s*(\d{1,2})\s+([A-Za-zÀ-ÿ]{3})$/i);
  if (!relativeMatch) return value;
  const isTomorrow = relativeMatch[1].toLocaleLowerCase('pt-BR') === 'amanhã';
  const day = relativeMatch[2];
  const monthKey = relativeMatch[3].toLocaleLowerCase('pt-BR');
  const month = portugueseMonthAliases[monthKey]?.[locale === 'en-US' ? 'en' : 'es'] ?? relativeMatch[3];
  if (locale === 'en-US') return `${isTomorrow ? 'Tomorrow' : 'Today'}, ${month} ${day}`;
  return `${isTomorrow ? 'Mañana' : 'Hoy'}, ${day} ${month}`;
}

export const normalizeMovieLanguage = (tag: string) => {
  const normalized = tag.trim().toLocaleLowerCase('pt-BR');
  if (['dub', 'dublado'].includes(normalized)) return 'movie.dubbed' as TranslationKey;
  if (['leg', 'legendado'].includes(normalized)) return 'movie.subtitled' as TranslationKey;
  return 'movie.original' as TranslationKey;
};

export function resolveMovieLanguage(
  tag: string,
  originCountry: string | undefined,
  locale: AppLocale,
) {
  const normalizedLanguage = normalizeMovieLanguage(tag);
  if (normalizedLanguage !== 'movie.original' || locale === 'pt-BR') return normalizedLanguage;

  const normalizedCountry = (originCountry ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase();
  return ['brasil', 'brazil'].includes(normalizedCountry)
    ? 'movie.dubbed' as TranslationKey
    : 'movie.originalAudio' as TranslationKey;
}

const genreKeys: Record<string, TranslationKey> = {
  'ação': 'genre.action', aventura: 'genre.adventure', animação: 'genre.animation',
  comédia: 'genre.comedy', drama: 'genre.drama', terror: 'genre.horror', suspense: 'genre.thriller',
  romance: 'genre.romance', fantasia: 'genre.fantasy', documentário: 'genre.documentary',
  musical: 'genre.musical', crime: 'genre.crime', família: 'genre.family',
  ficção: 'genre.scifi', 'ficção científica': 'genre.scifi', 'fic. científica': 'genre.scifi', biografia: 'genre.biography',
  esporte: 'genre.sport', guerra: 'genre.war', faroeste: 'genre.western', mistério: 'genre.mystery',
};

export function localizeMovieGenre(genre: string, t: (key: TranslationKey) => string) {
  return genre.split(/\s*[,;|/]\s*/).map((item) => {
    const key = genreKeys[item.trim().toLocaleLowerCase('pt-BR')];
    return key ? t(key) : item.trim();
  }).join(' | ');
}

const seatTypeKeys: Record<string, TranslationKey> = {
  obeso: 'seats.obese',
  bariatrico: 'seats.obese',
  bariatric: 'seats.obese',
  cadeirante: 'seats.wheelchair',
  wheelchair: 'seats.wheelchair',
  wheelchairspace: 'seats.wheelchair',
  espacioparasilladeruedas: 'seats.wheelchair',
  acompanhante: 'seats.companion',
  acompanante: 'seats.companion',
  companion: 'seats.companion',
};

export function localizeSeatTag(seatTag: string, t: (key: TranslationKey) => string) {
  return seatTag.replace(/\(([^)]+)\)/g, (match, seatType: string) => {
    const normalizedType = seatType
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z]/gi, '')
      .toLocaleLowerCase('pt-BR');
    const key = seatTypeKeys[normalizedType];
    return key ? `(${t(key)})` : match;
  });
}
