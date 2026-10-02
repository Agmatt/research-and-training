/* ============================================================
   SPMH TRAINING & RESEARCH — SHARED UTILITIES
   Small, dependency-free helpers. Anything that pulls a library
   (dates, slugification) is flagged; everything else is pure.
   ============================================================ */

import { SITE } from '../data/site';

/* ------------------------------------------------------------
   1. CLASS NAMES
   ------------------------------------------------------------ */

/**
 * Join truthy class strings. Accepts strings, falsy values, and
 * (optionally) objects/arrays.
 *
 *   cn('btn', isActive && 'btn-active', { hidden: !open })
 *   // → "btn btn-active"  (or "btn hidden" if open is false)
 *
 * If you later want Tailwind conflict resolution, swap this for
 * `twMerge(clsx(...))` from `clsx` + `tailwind-merge`.
 */
export function cn(
  ...inputs: Array<
    string | number | boolean | null | undefined | Record<string, boolean> | Array<unknown>
  >
): string {
  const out: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      out.push(String(input));
      continue;
    }

    if (Array.isArray(input)) {
      const nested = cn(...(input as Parameters<typeof cn>));
      if (nested) out.push(nested);
      continue;
    }

    if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) out.push(key);
      }
    }
  }

  return out.join(' ');
}

/* ------------------------------------------------------------
   2. STRINGS
   ------------------------------------------------------------ */

/** "Dr. Crispine Murhula" → "CM" */
export function initials(name: string, max = 2): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, max)
    .toUpperCase();
}

/** Lowercase, URL-safe, no diacritics. Used for anchors + slugs. */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Ellipsis on word boundaries where possible. */
export function truncate(input: string, length = 160, ellipsis = '…'): string {
  if (input.length <= length) return input;
  const cut = input.slice(0, length + 1);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > length * 0.6 ? cut.slice(0, lastSpace) : cut.slice(0, length);
  return base.trimEnd() + ellipsis;
}

/* ------------------------------------------------------------
   3. URLS
   ------------------------------------------------------------ */

/** True for `https://…`, `mailto:`, `tel:`, `//…`. */
export function isExternal(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || /^(mailto|tel):/.test(href);
}

/** Resolve a subdomain-root-relative path to a full URL. */
export function buildAbsoluteUrl(path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${clean === '/' ? '/' : clean}`;
}

/** Same, but for the main hospital site. */
export function buildMainSiteUrl(path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.mainSite.url}${clean === '/' ? '/' : clean}`;
}

/* ------------------------------------------------------------
   4. DATES
   ------------------------------------------------------------ */

const EN_KE_SHORT = new Intl.DateTimeFormat('en-KE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const EN_KE_LONG = new Intl.DateTimeFormat('en-KE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatDate(
  value: string | number | Date | null | undefined,
  variant: 'short' | 'long' = 'short',
): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return (variant === 'long' ? EN_KE_LONG : EN_KE_SHORT).format(d);
}

/** "12 Mar – 24 May 2026" · "12 Mar 2026" if only one date. */
export function formatDateRange(
  start: string | number | Date | null | undefined,
  end: string | number | Date | null | undefined,
): string {
  const s = start ? new Date(start) : null;
  const e = end ? new Date(end) : null;
  const sOk = s && !Number.isNaN(s.getTime());
  const eOk = e && !Number.isNaN(e.getTime());

  if (sOk && eOk) {
    const sameYear = (s as Date).getFullYear() === (e as Date).getFullYear();
    const startFmt = new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      ...(sameYear ? {} : { year: 'numeric' }),
    }).format(s as Date);
    const endFmt = new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(e as Date);
    return `${startFmt} – ${endFmt}`;
  }
  if (sOk) return formatDate(s as Date);
  if (eOk) return formatDate(e as Date);
  return '';
}

/** For `<input type="date">` values (YYYY-MM-DD). */
export function toDateInputValue(value: string | number | Date | null | undefined): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/* ------------------------------------------------------------
   5. ASYNC
   ------------------------------------------------------------ */

/** Await a promise, return [data, error]. */
export async function tryCatch<T>(
  promise: Promise<T>,
): Promise<[T | null, Error | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (err) {
    return [null, err instanceof Error ? err : new Error(String(err))];
  }
}

/* ------------------------------------------------------------
   6. NAV / ROUTES
   ------------------------------------------------------------ */

/** Best-effort active-route check for navbar and subpages. */
export function isActivePath(current: string, href: string, exact = false): boolean {
  if (href === '/') return current === '/';
  if (exact) return current === href;
  return current === href || current.startsWith(`${href}/`);
}