import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck, KeyRound, Loader2 } from 'lucide-react';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useApp();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token || !email) {
      setError('Invalid or missing password reset token. Please request a new link.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    const hasNum = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_]/.test(password);
    if (!hasNum || !hasSpecial) {
      setError('Password must contain at least one number and one special character (e.g. @, #, $, _).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, email, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-160px)] px-4 py-8">
      <div className="w-full max-w-md glass-panel border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {success ? (
          <div className="flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in duration-300 py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" /> Password Secured
              </span>
              <h2 className="font-heading text-2xl font-bold text-white">
                Password Reset Successful!
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-light">
                Your password has been updated. You can now sign in with your new credentials.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="mt-4 w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/15"
            >
              Sign In to Your Account
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-4">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white">
                Set New Password
              </h3>
              <p className="text-xs text-slate-400 mt-2 font-light">
                Please enter a strong new password for <span className="text-slate-200 font-medium">{email || 'your account'}</span>.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-left animate-in fade-in duration-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* New Password */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password Requirements hint */}
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] text-slate-400 space-y-1">
                <p className={password.length >= 8 ? 'text-emerald-400' : ''}>
                  • At least 8 characters
                </p>
                <p className={/\d/.test(password) ? 'text-emerald-400' : ''}>
                  • At least 1 number
                </p>
                <p className={/[!@#$%^&*(),.?":{}|<>_]/.test(password) ? 'text-emerald-400' : ''}>
                  • At least 1 special character (@, #, $, _, etc.)
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-slate-400">
              Remember your password?{' '}
              <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
