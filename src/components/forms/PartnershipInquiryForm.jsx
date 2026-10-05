import { useState } from 'react';
import { getSupabase, supabaseConfigured } from '../../lib/supabase';
import {
  nameValidator,
  emailValidator,
  institutionValidator,
  selectValidator,
  textareaValidator,
} from '../../lib/validation';

const LOCATION_TYPES = [
  { value: 'local', label: 'Local (Kenya)' },
  { value: 'regional', label: 'Regional (East Africa)' },
  { value: 'international', label: 'International' },
];

const INQUIRY_TYPES = [
  { value: 'student_attachment', label: 'Student Attachment Pipeline' },
  { value: 'research', label: 'Research Collaboration' },
  { value: 'faculty_exchange', label: 'Faculty Exchange' },
  { value: 'cme', label: 'CME / Training Collaboration' },
  { value: 'mou', label: 'Formal MOU' },
  { value: 'other', label: 'Other' },
];

const validators = {
  institution_name: institutionValidator(),
  contact_person: nameValidator('Contact person', 2, 100),
  email: emailValidator(),
  location_type: selectValidator(
    'location',
    LOCATION_TYPES.map((l) => l.value),
  ),
  inquiry_type: selectValidator(
    'partnership type',
    INQUIRY_TYPES.map((i) => i.value),
  ),
  message: textareaValidator('Message', 50, 2000),
};

const baseInput =
  'w-full rounded-lg border bg-slate-900/60 px-4 py-2.5 text-sm text-white ' +
  'placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors';

function inputCls(hasError) {
  return (
    baseInput +
    (hasError
      ? ' border-red-500/60 focus:border-red-500 focus:ring-red-500/30'
      : ' border-slate-600 focus:border-primary-light focus:ring-primary-light/30')
  );
}

const labelCls = 'block text-sm font-semibold text-slate-200 mb-1.5';

function Field({ label, required, error, hint, children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className='block'>
      <span className={labelCls}>
        {label}
        {required && <span className='text-red-400 ml-0.5'>*</span>}
      </span>
      {children}
      {error ? (
        <span
          id={`${htmlFor}-error`}
          role='alert'
          className='mt-1.5 flex items-start gap-1.5 text-xs text-red-300'>
          <i className='fas fa-circle-exclamation mt-0.5' aria-hidden='true' />
          {error}
        </span>
      ) : hint ? (
        <span className='mt-1 block text-xs text-slate-400'>{hint}</span>
      ) : null}
    </label>
  );
}

export default function PartnershipInquiryForm() {
  const initialForm = {
    institution_name: '',
    contact_person: '',
    email: '',
    location_type: 'local',
    inquiry_type: 'student_attachment',
    message: '',
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);

  function validateField(name, value, allValues) {
    const fn = validators[name];
    return fn ? fn(value, allValues) : null;
  }

  function setField(name, value) {
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, nextForm),
      }));
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

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);

    if (!validateAll()) {
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
        'Inquiries are temporarily unavailable — please email partnerships@spmh.co.ke directly.',
      );
      return;
    }

    setLoading(true);

    const sanitized = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [
        k,
        v === '' || v === undefined ? null : v.trim ? v.trim() : v,
      ]),
    );

    const { error: err } = await supabase
      .from('partnership_inquiries')
      .insert([sanitized]);

    setLoading(false);

    if (err) {
      console.error('[PartnershipInquiryForm] insert failed:', err);
      setSubmitError(
        'We could not submit your inquiry. Please email partnerships@spmh.co.ke.',
      );
      return;
    }

    setSuccess(true);
    setForm(initialForm);
  }

  if (!supabaseConfigured) {
    return (
      <div className='rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center'>
        <i
          className='fas fa-triangle-exclamation text-2xl text-amber-400 mb-3'
          aria-hidden='true'
        />
        <h3 className='text-lg font-bold text-amber-100 mb-1'>
          Inquiries are offline
        </h3>
        <p className='text-sm text-amber-200/90'>
          The form is temporarily unavailable. Please email{' '}
          <a href='mailto:partnerships@spmh.co.ke' className='underline'>
            partnerships@spmh.co.ke
          </a>
          .
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className='rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center'>
        <div className='w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4'>
          <i className='fas fa-check text-xl' aria-hidden='true' />
        </div>
        <h3 className='text-xl font-bold text-white mb-2'>Thank you</h3>
        <p className='text-sm text-emerald-100'>
          We&rsquo;ve received your inquiry. Our partnerships team will respond
          within 48 hours.
        </p>
      </div>
    );
  }

  const messageLength = form.message.trim().length;

  return (
    <form onSubmit={handleSubmit} className='space-y-5' noValidate>
      {submitError && (
        <div
          role='alert'
          className='rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200'>
          {submitError}
        </div>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
        <Field
          label='Institution name'
          required
          htmlFor='institution_name'
          error={touched.institution_name ? errors.institution_name : null}>
          <input
            id='institution_name'
            type='text'
            autoComplete='organization'
            value={form.institution_name}
            onChange={(e) => setField('institution_name', e.target.value)}
            onBlur={() => handleBlur('institution_name')}
            aria-invalid={touched.institution_name && !!errors.institution_name}
            placeholder='e.g. University of Nairobi'
            className={inputCls(
              touched.institution_name && !!errors.institution_name,
            )}
          />
        </Field>

        <Field
          label='Contact person'
          required
          htmlFor='contact_person'
          error={touched.contact_person ? errors.contact_person : null}>
          <input
            id='contact_person'
            type='text'
            autoComplete='name'
            value={form.contact_person}
            onChange={(e) => setField('contact_person', e.target.value)}
            onBlur={() => handleBlur('contact_person')}
            aria-invalid={touched.contact_person && !!errors.contact_person}
            placeholder='Dr. Jane Doe'
            className={inputCls(
              touched.contact_person && !!errors.contact_person,
            )}
          />
        </Field>

        <Field
          label='Email'
          required
          htmlFor='email'
          error={touched.email ? errors.email : null}>
          <input
            id='email'
            type='email'
            autoComplete='email'
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            aria-invalid={touched.email && !!errors.email}
            placeholder='partnerships@institution.ac.ke'
            className={inputCls(touched.email && !!errors.email)}
          />
        </Field>

        <Field
          label='Location'
          required
          htmlFor='location_type'
          error={touched.location_type ? errors.location_type : null}>
          <select
            id='location_type'
            value={form.location_type}
            onChange={(e) => setField('location_type', e.target.value)}
            onBlur={() => handleBlur('location_type')}
            aria-invalid={touched.location_type && !!errors.location_type}
            className={inputCls(
              touched.location_type && !!errors.location_type,
            )}>
            {LOCATION_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label='Type of partnership'
        required
        htmlFor='inquiry_type'
        error={touched.inquiry_type ? errors.inquiry_type : null}>
        <select
          id='inquiry_type'
          value={form.inquiry_type}
          onChange={(e) => setField('inquiry_type', e.target.value)}
          onBlur={() => handleBlur('inquiry_type')}
          aria-invalid={touched.inquiry_type && !!errors.inquiry_type}
          className={inputCls(touched.inquiry_type && !!errors.inquiry_type)}>
          {INQUIRY_TYPES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label='Message'
        required
        htmlFor='message'
        error={touched.message ? errors.message : null}
        hint="Tell us briefly about your institution and what you'd like to explore. Minimum 50 characters.">
        <textarea
          id='message'
          rows={5}
          value={form.message}
          onChange={(e) => setField('message', e.target.value)}
          onBlur={() => handleBlur('message')}
          aria-invalid={touched.message && !!errors.message}
          className={
            inputCls(touched.message && !!errors.message) + ' resize-y'
          }
          placeholder='A short paragraph about your institution and partnership interests…'
        />
        <div className='mt-1 flex justify-between text-xs'>
          <span
            className={
              messageLength < 50
                ? 'text-slate-500'
                : messageLength > 2000
                  ? 'text-red-400'
                  : 'text-slate-500'
            }>
            {messageLength} / 2000 characters
          </span>
          {messageLength > 0 && messageLength < 50 && (
            <span className='text-amber-400'>
              {50 - messageLength} more to go
            </span>
          )}
        </div>
      </Field>

      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2'>
        <p className='text-xs text-slate-400'>
          We respond within 48 hours on business days.
        </p>
        <button
          type='submit'
          disabled={loading}
          className='btn-primary px-6 py-3 disabled:opacity-60 disabled:cursor-not-allowed'>
          {loading ? 'Sending…' : 'Send Inquiry'}
          {!loading && (
            <i className='fas fa-paper-plane text-xs' aria-hidden='true' />
          )}
        </button>
      </div>
    </form>
  );
}
