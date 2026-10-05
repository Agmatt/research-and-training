/* ============================================================
   Form validation utilities
   Return: null if valid, string (error message) if invalid.
   ============================================================ */

export type Validator = (value: string, all?: Record<string, string>) => string | null;

/* ---------- Primitives ---------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Kenyan phone: +254 or 254 or 0, followed by 7 or 1, then 8 digits
const KENYAN_PHONE_RE = /^(\+?254|0)[17]\d{8}$/;

// Names: letters (any script), spaces, hyphens, apostrophes, dots
const NAME_RE = /^[\p{L}\s\-'.]+$/u;

export function isEmail(v: string): boolean {
  return EMAIL_RE.test(v.trim());
}

export function isKenyanPhone(v: string): boolean {
  const digits = v.replace(/[\s\-().]/g, '');
  return KENYAN_PHONE_RE.test(digits);
}

export function isNameLike(v: string): boolean {
  return NAME_RE.test(v.trim());
}

/* ---------- Field validators ---------- */

export function required(fieldLabel: string): Validator {
  return (v) => (!v || !v.trim() ? `${fieldLabel} is required.` : null);
}

export function minLength(n: number, fieldLabel: string): Validator {
  return (v) => {
    if (!v || !v.trim()) return `${fieldLabel} is required.`;
    if (v.trim().length < n) {
      return `${fieldLabel} must be at least ${n} characters.`;
    }
    return null;
  };
}

export function maxLength(n: number, fieldLabel: string): Validator {
  return (v) => {
    if (v && v.trim().length > n) {
      return `${fieldLabel} must be under ${n} characters.`;
    }
    return null;
  };
}

export function emailValidator(): Validator {
  return (v) => {
    if (!v || !v.trim()) return 'Email is required.';
    if (!isEmail(v)) return 'Enter a valid email address.';
    if (v.trim().length > 254) return 'Email is too long.';
    return null;
  };
}

export function phoneValidator(): Validator {
  return (v) => {
    if (!v || !v.trim()) return 'Phone number is required.';
    if (!isKenyanPhone(v)) {
      return 'Enter a valid Kenyan phone number (e.g. +254 7XX XXX XXX or 07XX XXX XXX).';
    }
    return null;
  };
}

export function nameValidator(fieldLabel: string, min = 2, max = 100): Validator {
  return (v) => {
    if (!v || !v.trim()) return `${fieldLabel} is required.`;
    const t = v.trim();
    if (t.length < min) return `${fieldLabel} must be at least ${min} characters.`;
    if (t.length > max) return `${fieldLabel} must be under ${max} characters.`;
    if (!isNameLike(v)) return `${fieldLabel} contains invalid characters.`;
    return null;
  };
}

export function institutionValidator(): Validator {
  return (v) => {
    if (!v || !v.trim()) return 'Institution name is required.';
    const t = v.trim();
    if (t.length < 3) return 'Enter the full name of your institution.';
    if (t.length > 150) return 'Institution name must be under 150 characters.';
    return null;
  };
}

export function selectValidator(fieldLabel: string, allowed?: string[]): Validator {
  return (v) => {
    if (!v) return `Please select a ${fieldLabel.toLowerCase()}.`;
    if (allowed && !allowed.includes(v)) return `Invalid ${fieldLabel.toLowerCase()}.`;
    return null;
  };
}

export function textareaValidator(
  fieldLabel: string,
  min = 50,
  max = 2000,
): Validator {
  return (v) => {
    if (!v || !v.trim()) return `${fieldLabel} is required.`;
    const t = v.trim();
    if (t.length < min) {
      return `${fieldLabel} is too short. Please write at least ${min} characters.`;
    }
    if (t.length > max) {
      return `${fieldLabel} must be under ${max} characters.`;
    }
    return null;
  };
}

/* ---------- Date validators ---------- */

function todayAtMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startDateValidator(): Validator {
  return (v) => {
    if (!v) return 'Start date is required.';
    const d = new Date(v);
    if (isNaN(d.getTime())) return 'Enter a valid start date.';
    if (d < todayAtMidnight()) return 'Start date cannot be in the past.';
    const maxFuture = new Date();
    maxFuture.setFullYear(maxFuture.getFullYear() + 2);
    if (d > maxFuture) return 'Start date is too far in the future.';
    return null;
  };
}

export function endDateValidator(): Validator {
  return (v, all) => {
    if (!v) return 'End date is required.';
    const end = new Date(v);
    if (isNaN(end.getTime())) return 'Enter a valid end date.';
    const start = all?.start_date ? new Date(all.start_date) : null;
    if (start && !isNaN(start.getTime()) && end <= start) {
      return 'End date must be after the start date.';
    }
    return null;
  };
}

/* ---------- Duration ↔ Date-range match ---------- */

/**
 * Parse "6 weeks" → 6
 */
export function parseDurationWeeks(durationText: string): number | null {
  const m = durationText.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Returns null if the date range matches the selected duration.
 * Tolerates ±4 days for weekend boundaries.
 */
export function durationDateMatch(
  durationText: string,
  start: string,
  end: string,
): string | null {
  if (!durationText || !start || !end) return null;

  const expected = parseDurationWeeks(durationText);
  if (expected === null) return null;

  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;

  const days = (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24);
  const expectedDays = expected * 7;
  const tolerance = 4;

  if (Math.abs(days - expectedDays) > tolerance) {
    return `Duration is ${durationText}, but the dates span ${Math.round(days)} days. Please align them (should be ~${expectedDays} days).`;
  }
  return null;
}

/* ---------- Email DNS-ish sanity (optional, cheap) ---------- */

const DISPOSABLE_DOMAINS = new Set([
  // Add any domains you want to block, e.g.:
  // 'tempmail.com', 'guerrillamail.com',
]);

export function isDisposableEmail(v: string): boolean {
  const domain = v.split('@')[1]?.toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}