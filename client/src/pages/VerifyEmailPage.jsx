import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Mail, Sparkles, RefreshCw } from 'lucide-react';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification } = useApp();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState(email || '');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!token || !email) {
      setStatus('error');
      setErrorMessage('Missing verification token or email. Please check your link.');
      return;
    }

    const performVerification = async () => {
      try {
        await verifyEmail(token, email);
        if (isMounted) {
          setStatus('success');
          // Auto-redirect after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err.message || 'Verification link is invalid or has expired.');
        }
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token, email]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendLoading(true);
    setResendSuccess(false);
    try {
      await resendVerification(resendEmail);
      setResendSuccess(true);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-160px)] px-4 py-8">
      <div className="w-full max-w-lg glass-panel border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative text-center">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* LOADING STATE */}
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">
                Verifying your email...
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-light max-w-sm mx-auto">
                Please wait while we confirm your email credentials with Placify Enterprise.
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <div className="flex flex-col items-center gap-6 py-6 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Identity Verified
              </span>
              <h2 className="font-heading text-2xl font-bold text-white">
                Email Successfully Verified!
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-light max-w-sm mx-auto">
                Welcome to Placify. Your account is now active and protected. Redirecting you to your placement dashboard in a moment...
              </p>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-indigo-600 text-white hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ERROR / EXPIRED STATE */}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-5 py-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
              <XCircle className="w-9 h-9" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">
                Verification Link Expired or Invalid
              </h2>
              <p className="text-xs text-rose-300/90 mt-2 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 max-w-sm mx-auto font-medium">
                {errorMessage}
              </p>
            </div>

            {resendSuccess ? (
              <div className="w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                📬 A new verification link has been sent to <strong>{resendEmail}</strong>. Please check your inbox and spam folder!
              </div>
            ) : (
              <form onSubmit={handleResend} className="w-full flex flex-col gap-3 mt-2 text-left">
                <label className="text-xs font-semibold text-slate-300">
                  Request a new verification link
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resendLoading}
                  className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/15 disabled:opacity-50"
                >
                  {resendLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Resend Verification Link
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-4 pt-4 border-t border-white/5 w-full flex justify-between items-center text-xs text-slate-400">
              <Link to="/login" className="text-indigo-400 hover:underline">
                Back to Sign In
              </Link>
              <Link to="/login?register=true" className="text-slate-400 hover:text-white">
                Create new account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
