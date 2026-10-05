import { useState } from 'react';
import { getSupabase, supabaseConfigured } from '../../lib/supabase';
import {
  nameValidator,
  emailValidator,
  phoneValidator,
  institutionValidator,
  selectValidator,
  textareaValidator,
  startDateValidator,
  endDateValidator,
  durationDateMatch,
} from '../../lib/validation';

const ROTATION_TYPES = [
  'Nursing',
  'Medical Laboratory',
  'Pharmacy',
  'Clinical Medicine',
  'Outpatient / Community',
  'Other',
];

const DURATIONS = ['4 weeks', '6 weeks', '8 weeks', '10 weeks', '12 weeks'];

/* ---------- Validators per field ---------- */
const validators = {
  full_name: nameValidator('Full name', 2, 100),
  email: emailValidator(),
  phone: phoneValidator(),
  home_institution: institutionValidator(),
  rotation_type: selectValidator('rotation type', ROTATION_TYPES),
  duration_text: selectValidator('duration', DURATIONS),
  start_date: startDateValidator(),
  end_date: endDateValidator(),
  cover_letter: textareaValidator('Cover letter', 50, 2000),
};

/* ---------- Helpers ---------- */
function generateReference() {
  return 'SPMH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/* ---------- Styles ---------- */
const baseInput =
  'w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 ' +
  'placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors';

function inputCls(hasError) {
  return (
    baseInput +
    (hasError
      ? ' border-red-400 focus:border-red-500 focus:ring-red-500/20'
      : ' border-slate-300 focus:border-primary focus:ring-primary/20')
  );
}

const labelCls = 'block text-sm font-semibold text-slate-700 mb-1.5';

function Field({ label, required, error, hint, children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className={labelCls}>
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </span>
      {children}
      {error ? (
        <span
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600"
        >
          <i className="fas fa-circle-exclamation mt-0.5" aria-hidden="true" />
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}

/* ---------- Component ---------- */
export default function StudentAttachmentForm() {
  const initialForm = {
    full_name: '',
    email: '',
    phone: '',
    home_institution: '',
    rotation_type: '',
    duration_text: '',
    start_date: '',
    end_date: '',
    cover_letter: '',
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [reference, setReference] = useState(null);

  const today = todayISO();

  /* -------- Per-field validation -------- */
  function validateField(name, value, allValues) {
    const fn = validators[name];
    if (!fn) return null;

    const basicError = fn(value, allValues);
    if (basicError) return basicError;

    // Cross-field: duration ↔ dates
    if (name === 'duration_text' || name === 'start_date' || name === 'end_date') {
      const dur = allValues.duration_text;
      const s = allValues.start_date;
      const e = allValues.end_date;
      if (dur && s && e) {
        const matchError = durationDateMatch(dur, s, e);
        if (matchError && (name === 'end_date' || name === 'duration_text')) {
          return matchError;
        }
      }
    }

    return null;
  }

  function setField(name, value) {
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    // Re-validate touched fields on change
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, nextForm),
      }));
    }

    // Cross-field re-validation when start_date / duration change
    if (name === 'start_date' || name === 'duration_text') {
      if (touched.end_date) {
        setErrors((prev) => ({
          ...prev,
          end_date: validateField('end_date', nextForm.end_date, nextForm),
        }));
      }
    }
  }

  function handleBlur(name) {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, form[name], form),
    }));
  }

  function validateAll() {
    const nextErrors = {};
    let valid = true;

    for (const key of Object.keys(form)) {
      const err = validateField(key, form[key], form);
      nextErrors[key] = err;
      if (err) valid = false;
    }

    setErrors(nextErrors);
    setTouched(Object.fromEntries(Object.keys(form).map((k) => [k, true])));
    return valid;
  }

  /* -------- Submit -------- */
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);

    if (!validateAll()) {
      // Focus first invalid field
      requestAnimationFrame(() => {
        const firstInvalid = document.querySelector('[aria-invalid="true"]');
        firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid?.focus({ preventScroll: true });
      });
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setSubmitError(
        'Applications are temporarily unavailable — the server is not configured. ' +
          'Please email academics@spmh.co.ke to apply.',
      );
      return;
    }

    setLoading(true);
    const refCode = generateReference();

    const sanitized = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [
        k,
        v === '' || v === undefined ? null : v.trim ? v.trim() : v,
      ]),
    );

    const { error: err } = await supabase
      .from('internship_applications')
      .insert([
        { ...sanitized, reference_code: refCode, status: 'submitted' },
      ]);

    setLoading(false);

    if (err) {
      console.error('[StudentAttachmentForm] insert failed:', err);
      setSubmitError(
        'We could not submit your application. Please try again or email academics@spmh.co.ke.',
      );
      return;
    }

    setReference(refCode);
  }

  /* -------- Offline state -------- */
  if (!supabaseConfigured) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <i
          className="fas fa-triangle-exclamation text-2xl text-amber-500 mb-3"
          aria-hidden="true"
        />
        <h3 className="text-lg font-bold text-amber-900 mb-1">
          Applications are offline
        </h3>
        <p className="text-sm text-amber-800">
          Online submissions are temporarily unavailable. To apply, please
          email{' '}
          <a href="mailto:academics@spmh.co.ke" className="underline">
            academics@spmh.co.ke
          </a>
          .
        </p>
      </div>
    );
  }

  /* -------- Success state -------- */
  if (reference) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-check text-xl" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold text-emerald-900 mb-2">
          Application submitted
        </h3>
        <p className="text-sm text-emerald-800 mb-4">
          Save your reference code. HR will contact you within 3–5 working days.
        </p>
        <p className="reference-code">{reference}</p>
      </div>
    );
  }

  /* -------- Form -------- */
  const coverLetterLength = form.cover_letter.trim().length;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {submitError && (
        <div
          role="alert"
          className="rounded-lg border border-accent/30 bg-red-50 px-4 py-3 text-sm text-accent"
        >
          {submitError}
        </div>
      )}

      {/* Row: name + email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label="Full name"
          required
          htmlFor="full_name"
          error={touched.full_name ? errors.full_name : null}
        >
          <input
            id="full_name"
            type="text"
            autoComplete="name"
            value={form.full_name}
            onChange={(e) => setField('full_name', e.target.value)}
            onBlur={() => handleBlur('full_name')}
            aria-invalid={touched.full_name && !!errors.full_name}
            aria-describedby={
              touched.full_name && errors.full_name ? 'full_name-error' : undefined
            }
            placeholder="Jane Wanjiku"
            className={inputCls(touched.full_name && !!errors.full_name)}
          />
        </Field>

        <Field
          label="Email"
          required
          htmlFor="email"
          error={touched.email ? errors.email : null}
        >
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            aria-invalid={touched.email && !!errors.email}
            aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
            placeholder="jane@example.com"
            className={inputCls(touched.email && !!errors.email)}
          />
        </Field>
      </div>

      {/* Row: phone + institution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label="Phone"
          required
          htmlFor="phone"
          error={touched.phone ? errors.phone : null}
          hint="Kenyan mobile — e.g. +254 7XX XXX XXX or 07XX XXX XXX"
        >
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            aria-invalid={touched.phone && !!errors.phone}
            aria-describedby={touched.phone && errors.phone ? 'phone-error' : undefined}
            placeholder="+254 7XX XXX XXX"
            className={inputCls(touched.phone && !!errors.phone)}
          />
        </Field>

        <Field
          label="Home institution"
          required
          htmlFor="home_institution"
          error={touched.home_institution ? errors.home_institution : null}
        >
          <input
            id="home_institution"
            type="text"
            autoComplete="organization"
            value={form.home_institution}
            onChange={(e) => setField('home_institution', e.target.value)}
            onBlur={() => handleBlur('home_institution')}
            aria-invalid={touched.home_institution && !!errors.home_institution}
            aria-describedby={
              touched.home_institution && errors.home_institution
                ? 'home_institution-error'
                : undefined
            }
            placeholder="e.g. Kenya Medical Training College"
            className={inputCls(touched.home_institution && !!errors.home_institution)}
          />
        </Field>
      </div>

      {/* Row: rotation + duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label="Rotation type"
          required
          htmlFor="rotation_type"
          error={touched.rotation_type ? errors.rotation_type : null}
        >
          <select
            id="rotation_type"
            value={form.rotation_type}
            onChange={(e) => setField('rotation_type', e.target.value)}
            onBlur={() => handleBlur('rotation_type')}
            aria-invalid={touched.rotation_type && !!errors.rotation_type}
            aria-describedby={
              touched.rotation_type && errors.rotation_type
                ? 'rotation_type-error'
                : undefined
            }
            className={inputCls(touched.rotation_type && !!errors.rotation_type)}
          >
            <option value="">Select a rotation</option>
            {ROTATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Duration"
          required
          htmlFor="duration_text"
          error={touched.duration_text ? errors.duration_text : null}
        >
          <select
            id="duration_text"
            value={form.duration_text}
            onChange={(e) => setField('duration_text', e.target.value)}
            onBlur={() => handleBlur('duration_text')}
            aria-invalid={touched.duration_text && !!errors.duration_text}
            aria-describedby={
              touched.duration_text && errors.duration_text
                ? 'duration_text-error'
                : undefined
            }
            className={inputCls(touched.duration_text && !!errors.duration_text)}
          >
            <option value="">Select duration</option>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Row: start + end dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label="Preferred start date"
          required
          htmlFor="start_date"
          error={touched.start_date ? errors.start_date : null}
        >
          <input
            id="start_date"
            type="date"
            min={today}
            value={form.start_date}
            onChange={(e) => setField('start_date', e.target.value)}
            onBlur={() => handleBlur('start_date')}
            aria-invalid={touched.start_date && !!errors.start_date}
            aria-describedby={
              touched.start_date && errors.start_date ? 'start_date-error' : undefined
            }
            className={inputCls(touched.start_date && !!errors.start_date)}
          />
        </Field>

        <Field
          label="Preferred end date"
          required
          htmlFor="end_date"
          error={touched.end_date ? errors.end_date : null}
          hint={
            form.duration_text && form.start_date
              ? `Should be ~${parseDurationWeeks(form.duration_text)} weeks after start.`
              : 'Must be after the start date.'
          }
        >
          <input
            id="end_date"
            type="date"
            min={form.start_date || today}
            value={form.end_date}
            onChange={(e) => setField('end_date', e.target.value)}
            onBlur={() => handleBlur('end_date')}
            aria-invalid={touched.end_date && !!errors.end_date}
            aria-describedby={
              touched.end_date && errors.end_date ? 'end_date-error' : undefined
            }
            className={inputCls(touched.end_date && !!errors.end_date)}
          />
        </Field>
      </div>

      {/* Cover letter */}
      <Field
        label="Cover letter / notes"
        required
        htmlFor="cover_letter"
        error={touched.cover_letter ? errors.cover_letter : null}
        hint="Tell us why you're applying and anything we should know (special interests, prior clinical experience, accessibility needs). Minimum 50 characters."
      >
        <textarea
          id="cover_letter"
          rows={5}
          value={form.cover_letter}
          onChange={(e) => setField('cover_letter', e.target.value)}
          onBlur={() => handleBlur('cover_letter')}
          aria-invalid={touched.cover_letter && !!errors.cover_letter}
          aria-describedby={
            touched.cover_letter && errors.cover_letter
              ? 'cover_letter-error'
              : undefined
          }
          className={inputCls(touched.cover_letter && !!errors.cover_letter) + ' resize-y'}
          placeholder="A short paragraph about why you're applying…"
        />
        <div className="mt-1 flex justify-between text-xs">
          <span
            className={
              coverLetterLength < 50
                ? 'text-slate-400'
                : coverLetterLength > 2000
                  ? 'text-red-600'
                  : 'text-slate-500'
            }
          >
            {coverLetterLength} / 2000 characters
          </span>
          {coverLetterLength > 0 && coverLetterLength < 50 && (
            <span className="text-amber-600">
              {50 - coverLetterLength} more to go
            </span>
          )}
        </div>
      </Field>

      {/* Submit row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <p className="text-xs text-slate-500">
          By submitting you agree to our{' '}
          <a
            href="/terms-of-attachment"
            className="text-primary underline underline-offset-2"
          >
            terms of attachment
          </a>
          .
        </p>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-6 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting…' : 'Submit Application'}
          {!loading && <i className="fas fa-arrow-right text-xs" aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
}

/* ---- Helpers used above ---- */
function parseDurationWeeks(durationText) {
  const m = durationText.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}