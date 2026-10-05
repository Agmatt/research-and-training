/**
 * StatusBadge — shared between applicants and partnerships.
 * Handles both status vocabularies.
 */
import { statusLabel } from '../../../lib/admin/partnerships';

const STYLES = {
  /* Application statuses */
  submitted: 'bg-blue-50 text-blue-700 ring-blue-200',
  under_review: 'bg-amber-50 text-amber-700 ring-amber-200',
  verified: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  assigned: 'bg-violet-50 text-violet-700 ring-violet-200',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  completed: 'bg-slate-100 text-slate-600 ring-slate-200',
  declined: 'bg-red-50 text-red-700 ring-red-200',
  withdrawn: 'bg-slate-100 text-slate-500 ring-slate-200',

  /* Partnership statuses */
  new: 'bg-blue-50 text-blue-700 ring-blue-200',
  reviewing: 'bg-amber-50 text-amber-700 ring-amber-200',
  contacted: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  in_discussion: 'bg-violet-50 text-violet-700 ring-violet-200',
  mou_drafted: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  signed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  closed: 'bg-slate-100 text-slate-500 ring-slate-200',
};

export default function StatusBadge({ status, size = 'sm' }) {
  const cls = STYLES[status] || STYLES.withdrawn;
  const sizeCls =
    size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1';
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ring-1 ${sizeCls} ${cls}`}>
      {statusLabel(status)}
    </span>
  );
}
