import { useState } from 'react';
import { getSupabase } from '../../lib/supabase';

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

const inputCls =
  'w-full rounded-lg border border-slate-600 bg-slate-900/60 px-4 py-2.5 text-sm ' +
  'text-white placeholder-slate-500 focus:border-primary-light focus:outline-none ' +
  'focus:ring-2 focus:ring-primary-light/30 transition-colors';

const labelCls = 'block text-sm font-semibold text-slate-200 mb-1.5';

function Field({ label, required, children, hint }) {
  return (
    <label className='block'>
      <span className={labelCls}>
        {label}
        {required && <span className='text-red-400 ml-0.5'>*</span>}
      </span>
      {children}
      {hint && (
        <span className='mt-1 block text-xs text-slate-400'>{hint}</span>
      )}
    </label>
  );
}

export default function PartnershipInquiryForm() {
  const [form, setForm] = useState({
    institution_name: '',
    contact_person: '',
    email: '',
    location_type: 'local',
    inquiry_type: 'student_attachment',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    const supabase = getSupabase();
    if (!supabase) {
      setError(
        'Inquiries are temporarily unavailable — please email partnerships@spmh.co.ke directly.',
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
        'We could not submit your inquiry. Please email partnerships@spmh.co.ke.',
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

  return (
    <form onSubmit={submit} className='space-y-5' noValidate>
      {error && (
        <div className='rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200'>
          {error}
        </div>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
        <Field label='Institution name' required>
          <input
            type='text'
            required
            value={form.institution_name}
            onChange={update('institution_name')}
            placeholder='e.g. University of Nairobi'
            className={inputCls}
          />
        </Field>

        <Field label='Contact person' required>
          <input
            type='text'
            required
            value={form.contact_person}
            onChange={update('contact_person')}
            placeholder='Dr. Jane Doe'
            className={inputCls}
          />
        </Field>

        <Field label='Email' required>
          <input
            type='email'
            required
            value={form.email}
            onChange={update('email')}
            placeholder='partnerships@institution.ac.ke'
            className={inputCls}
          />
        </Field>

        <Field label='Location' required>
          <select
            required
            value={form.location_type}
            onChange={update('location_type')}
            className={inputCls}>
            {LOCATION_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label='Type of partnership' required>
        <select
          required
          value={form.inquiry_type}
          onChange={update('inquiry_type')}
          className={inputCls}>
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
        hint="Tell us briefly about your institution and what you'd like to explore.">
        <textarea
          rows={5}
          required
          value={form.message}
          onChange={update('message')}
          className={inputCls + ' resize-y'}
          placeholder='A short paragraph about your institution and partnership interests…'
        />
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
