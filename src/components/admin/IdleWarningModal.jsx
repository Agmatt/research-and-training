import { useIdleLogout } from '../../lib/useIdleLogout';

export default function IdleWarning() {
  const { secondsRemaining, keepAlive } = useIdleLogout(true);

  if (secondsRemaining === null) return null;

  const mm = Math.floor(secondsRemaining / 60);
  const ss = secondsRemaining % 60;
  const display =
    mm > 0
      ? `${mm}:${String(ss).padStart(2, '0')}`
      : `0:${String(ss).padStart(2, '0')}`;

  return (
    <>
      <div
        className='fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-sm'
        aria-hidden='true'
      />
      <div
        role='alertdialog'
        aria-modal='true'
        aria-labelledby='idle-title'
        aria-describedby='idle-body'
        className='fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none'>
        <div className='bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto overflow-hidden'>
          <div className='px-6 pt-6 pb-5 text-center'>
            <div className='w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4'>
              <i className='fas fa-clock text-xl' aria-hidden='true' />
            </div>
            <h2
              id='idle-title'
              className='font-display font-light text-2xl text-slate-900 leading-tight'>
              Still there?
            </h2>
            <p
              id='idle-body'
              className='mt-2 text-sm text-slate-500 leading-relaxed'>
              For your security, you&rsquo;ll be signed out in
            </p>
            <p className='mt-3 font-mono text-3xl text-slate-900 tabular-nums leading-none'>
              {display}
            </p>
          </div>

          <div className='px-6 pb-6 flex items-center gap-2'>
            <button
              type='button'
              onClick={keepAlive}
              className='flex-1 inline-flex items-center justify-center gap-2
                         px-4 py-3 rounded-xl bg-primary text-white text-sm font-semibold
                         hover:bg-primary-dark transition-colors'>
              <i className='fas fa-hand text-xs' aria-hidden='true' />
              Stay signed in
            </button>
            <button
              type='button'
              onClick={async () => {
                const { signOut } = await import('../../lib/auth');
                await signOut();
                window.location.href = '/admin/login';
              }}
              className='px-4 py-3 rounded-xl border border-slate-200 text-slate-600
                         text-sm font-medium hover:bg-slate-50 transition-colors'>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
