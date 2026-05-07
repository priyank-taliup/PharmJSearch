import { useState } from 'react';

const PASSCODE = '9909';
const SESSION_KEY = 'pj_auth';

export default function PasscodeGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === '1'
  );
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (input === PASSCODE) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setUnlocked(true);
    } else {
      setError(true);
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 600);
    }
  }

  if (unlocked) return children;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-700 via-sky-600 to-cyan-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-sky-600 flex items-center justify-center shadow-md mb-4">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6" />
              <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Pharmacy<span className="text-sky-600">Jobs</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Enter passcode to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="Passcode"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(false);
              }}
              autoFocus
              className={`w-full px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] border-2 rounded-xl outline-none transition-all
                ${error
                  ? 'border-red-400 bg-red-50 text-red-600 placeholder-red-300'
                  : 'border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-300 focus:border-sky-400 focus:bg-white'
                }
                ${shake ? 'animate-shake' : ''}
              `}
            />
            {error && (
              <p className="text-red-500 text-sm text-center mt-2 font-medium">
                Incorrect passcode. Please try again.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!input}
            className="w-full py-3 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Unlock
          </button>
        </form>
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
