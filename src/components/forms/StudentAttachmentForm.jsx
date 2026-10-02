import { useState } from 'react';
import { supabase } from '../../lib/supabase';

const ROTATION_TYPES = [
  'Nursing',
  'Medical Laboratory',
  'Pharmacy',
  'Clinical Medicine',
  'Outpatient / Community',
  'Other',
];

const DURATIONS = ['4 weeks', '6 weeks', '8 weeks', '10 weeks', '12 weeks'];

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 ' +
  'placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 ' +
  'focus:ring-primary/20 transition-colors';

const labelCls = 'block text-sm font-semibold text-slate-700 mb-1.5';

function Field({ label, required, children, hint }) {
  return (
    <label className='block'>
      <span className={labelCls}>
        {label}
        {required && <span className='text-accent ml-0.5'>*</span>}
      </span>
      {children}
      {hint && (
        <span className='mt-1 block text-xs text-slate-500'>{hint}</span>
      )}
    </label>
  );
}

export default function StudentAttachmentForm() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    home_institution: '',
    rotation_type: '',
    duration_text: '',
    start_date: '',
    end_date: '',
    cover_letter: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reference, setReference] = useState(null);

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

   const submit = async (e) => {
    e.preventDefault();
    setError(null);

    const supabase = getSupabase();
    if (!supabase) {
      setError(
        'Inquiries are temporarily unavailable — please email partnerships@spmh.co.ke directly.'
      );
      return;
    }

    setLoading(true);
    const { error: err } = await supabase
      .from('partnership_inquiries')
      .insert([form]);
    setLoading(false);

    if (err) {
      setError(
        'We could not submit your inquiry. Please email partnerships@spmh.co.ke.'
      );
      return;
    }
    setSuccess(true);
    setForm({
      institution_name: '',
      contact_person: '',
      email: '',
      location_type: 'local',
      inquiry_type: 'student_attachment',
      message: '',
    });
  };

  if (reference) {
    return (
      <div className='rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center'>
        <div className='w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4'>
          <i className='fas fa-check text-xl' aria-hidden='true' />
        </div>
        <h3 className='text-xl font-bold text-emerald-900 mb-2'>
          Application submitted
        </h3>
        <p className='text-sm text-emerald-800 mb-4'>
          Save your reference code. HR will contact you within 3–5 working days.
        </p>
        <p className='reference-code'>{reference}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className='space-y-5' noValidate>
      {error && (
        <div className='rounded-lg border border-accent/30 bg-red-50 px-4 py-3 text-sm text-accent'>
          {error}
        </div>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
        <Field label='Full name' required>
          <input
            type='text'
            required
            value={form.full_name}
            onChange={update('full_name')}
            placeholder='Jane Wanjiku'
            className={inputCls}
          />
        </Field>

        <Field label='Email' required>
          <input
            type='email'
            required
            value={form.email}
            onChange={update('email')}
            placeholder='jane@example.com'
            className={inputCls}
          />
        </Field>

        <Field label='Phone' required>
          <input
            type='tel'
            required
            value={form.phone}
            onChange={update('phone')}
            placeholder='+254 7XX XXX XXX'
            className={inputCls}
          />
        </Field>

        <Field label='Home institution' required>
          <input
            type='text'
            required
            value={form.home_institution}
            onChange={update('home_institution')}
            placeholder='e.g. Kenya Medical Training College'
            className={inputCls}
          />
        </Field>

        <Field label='Rotation type' required>
          <select
            required
            value={form.rotation_type}
            onChange={update('rotation_type')}
            className={inputCls}>
            <option value=''>Select a rotation</option>
            {ROTATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label='Duration' required>
          <select
            required
            value={form.duration_text}
            onChange={update('duration_text')}
            className={inputCls}>
            <option value=''>Select duration</option>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>

        <Field label='Preferred start date' required>
          <input
            type='date'
            required
            value={form.start_date}
            onChange={update('start_date')}
            className={inputCls}
          />
        </Field>

        <Field label='Preferred end date'>
          <input
            type='date'
            value={form.end_date}
            onChange={update('end_date')}
            className={inputCls}
          />
        </Field>
      </div>

      <Field
        label='Cover letter / notes'
        hint='Optional — tell us anything we should know (special interests, prior clinical experience, accessibility needs).'>
        <textarea
          rows={4}
          value={form.cover_letter}
          onChange={update('cover_letter')}
          className={inputCls + ' resize-y'}
          placeholder="A short paragraph about why you're applying…"
        />
      </Field>

      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2'>
        <p className='text-xs text-slate-500'>
          By submitting you agree to our{' '}
          <a
            href='/terms-of-attachment'
            className='text-primary underline underline-offset-2'>
            terms of attachment
          </a>
          .
        </p>
        <button
          type='submit'
          disabled={loading}
          className='btn-primary px-6 py-3 disabled:opacity-60 disabled:cursor-not-allowed'>
          {loading ? 'Submitting…' : 'Submit Application'}
          {!loading && (
            <i className='fas fa-arrow-right text-xs' aria-hidden='true' />
          )}
        </button>
      </div>
    </form>
  );
}
