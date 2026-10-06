import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Loader2,
  KeyRound,
} from "lucide-react";

const LoginPage = () => {
  const { login, register, forgotPassword, resendVerification, user } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode: 'login' | 'register' | 'forgot' | 'verify-notice' | 'reset-notice'
  const [authMode, setAuthMode] = useState(
    searchParams.get("register") === "true"
      ? "register"
      : searchParams.get("forgot") === "true"
      ? "forgot"
      : "login"
  );

  const [role, setRole] = useState("student"); // student, recruiter, admin
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Sync state when URL query updates
  useEffect(() => {
    if (searchParams.get("register") === "true") {
      setAuthMode("register");
    } else if (searchParams.get("forgot") === "true") {
      setAuthMode("forgot");
    } else {
      setAuthMode("login");
    }
    setError("");
  }, [searchParams]);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail("");

    if (authMode === "forgot") {
      setLoading(true);
      try {
        await forgotPassword(email);
        setAuthMode("reset-notice");
      } catch (err) {
        setError(err.message || "Failed to send reset link.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (authMode === "register") {
      // 1. Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address (e.g. name@domain.com).");
        return;
      }

      // 2. Password length check
      if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }

      // 3. Password character checks
      const hasNum = /\d/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>_]/.test(password);
      if (!hasNum || !hasSpecial) {
        setError(
          "Password must contain at least one number and one special character (e.g., @, #, $, _)."
        );
        return;
      }
    }

    setLoading(true);
    try {
      if (authMode === "register") {
        const res = await register(name, email, password, role);
        if (res.requiresVerification) {
          setUnverifiedEmail(email);
          setAuthMode("verify-notice");
        } else {
          navigate("/dashboard");
        }
      } else {
        await login(email, password);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      if (err.message && err.message.toLowerCase().includes("verify")) {
        setUnverifiedEmail(email);
      }
      setError(
        err.message || "An error occurred during authentication."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = unverifiedEmail || email;
    if (!targetEmail) return;

    setResendLoading(true);
    setResendSuccess(false);
    try {
      await resendVerification(targetEmail);
      setResendSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  };

  const autofillUser = (roleType) => {
    setRole(roleType);
    if (roleType === "student") {
      setEmail("student@placify.com");
      setPassword("password123");
    } else if (roleType === "recruiter") {
      setEmail("recruiter@placify.com");
      setPassword("password123");
    } else {
      setEmail("admin@placify.com");
      setPassword("password123");
    }
  };

  return (
    <div className="flex-1 flex flex-col md:grid md:grid-cols-12 min-h-[calc(100vh-80px)] max-w-7xl mx-auto px-4 w-full pt-4 pb-12 gap-8 items-stretch">
      {/* Left Column: Branding Showcase */}
      <div className="hidden md:flex md:col-span-6 glass-card rounded-3xl p-10 flex-col justify-between border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-lg text-[#B985FC]">
            Placify Enterprise
          </span>
        </div>

        <div className="my-auto flex flex-col gap-6">
          <h2 className="font-heading text-4xl font-extrabold text-white leading-tight">
            Accelerate your career trajectory with{" "}
            <span className="gradient-text">verified matchmaking</span>
          </h2>
          <p className="text-slate-400 font-light text-sm leading-relaxed">
            Placify provides authenticated student verification, connects candidates
            directly with recruiter boards, and sends instant automated notifications.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <span className="text-2xl font-bold text-indigo-400 font-heading">
                98.6%
              </span>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                Placement efficiency
              </p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <span className="text-2xl font-bold text-purple-400 font-heading">
                100%
              </span>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                Spam Protected Accounts
              </p>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-medium">
          Protected by industry standard encryption protocols. &copy;{" "}
          {new Date().getFullYear()} Placify
        </div>
      </div>

      {/* Right Column: Glass Auth Card */}
      <div className="col-span-12 md:col-span-6 flex items-center justify-center">
        <div className="w-full max-w-md glass-panel border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
          
          {/* VIEW 1: VERIFICATION SENT NOTICE */}
          {authMode === "verify-notice" && (
            <div className="flex flex-col items-center text-center gap-5 py-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
                <Mail className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-semibold text-indigo-400 mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Activation Required
                </span>
                <h3 className="font-heading text-2xl font-bold text-white">
                  Check your inbox
                </h3>
                <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">
                  We sent an email verification link to{" "}
                  <strong className="text-slate-200">{unverifiedEmail || email}</strong>.
                  Please click the link in your email to activate your account.
                </p>
              </div>

              {resendSuccess ? (
                <div className="w-full p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                  📬 Verification link resent successfully!
                </div>
              ) : null}

              <div className="w-full flex flex-col gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="w-full py-3 rounded-xl font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs transition-all flex items-center justify-center gap-2"
                >
                  {resendLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Resend Verification Email
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setError("");
                  }}
                  className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-95 transition-all text-xs"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: RESET LINK SENT NOTICE */}
          {authMode === "reset-notice" && (
            <div className="flex flex-col items-center text-center gap-5 py-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/10">
                <KeyRound className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold text-white">
                  Reset Link Sent
                </h3>
                <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">
                  If an account exists for <strong className="text-slate-200">{email}</strong>, you will receive a password reset link shortly.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setError("");
                }}
                className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-95 transition-all text-xs flex items-center justify-center gap-2 mt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </div>
          )}

          {/* VIEW 3: LOGIN / REGISTER / FORGOT FORMS */}
          {authMode !== "verify-notice" && authMode !== "reset-notice" && (
            <>
              <div className="text-center mb-8">
                <h3 className="font-heading text-2xl font-bold text-white">
                  {authMode === "register"
                    ? "Create an account"
                    : authMode === "forgot"
                    ? "Reset your password"
                    : "Welcome back"}
                </h3>
                <p className="text-xs text-slate-400 mt-2 font-light">
                  {authMode === "register"
                    ? "Get access to jobs and ATS tracking tools"
                    : authMode === "forgot"
                    ? "Enter your email to receive a password reset link"
                    : "Sign in to access your placement dashboard"}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-left animate-in fade-in duration-200">
                  <p>{error}</p>
                  {unverifiedEmail && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="mt-2 text-indigo-400 hover:underline flex items-center gap-1 font-medium text-[11px]"
                    >
                      <RefreshCw className="w-3 h-3" /> Resend verification link
                    </button>
                  )}
                </div>
              )}

              {/* Autofill Demo Credentials */}
              {authMode === "login" && (
                <div className="mb-6 p-4 bg-indigo-500/[0.04] border border-indigo-500/10 rounded-2xl">
                  <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block mb-2">
                    Autofill Demo Roles:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => autofillUser("student")}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold transition-all border border-indigo-500/15"
                    >
                      Student Account
                    </button>
                    <button
                      type="button"
                      onClick={() => autofillUser("recruiter")}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[10px] font-semibold transition-all border border-purple-500/15"
                    >
                      Recruiter Account
                    </button>
                    <button
                      type="button"
                      onClick={() => autofillUser("admin")}
                      className="px-2.5 py-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 text-[10px] font-semibold transition-all border border-pink-500/15"
                    >
                      Admin Account
                    </button>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Register: Name Input */}
                {authMode === "register" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Password Input (Login & Register only) */}
                {authMode !== "forgot" && (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-300">
                        Password
                      </label>
                      {authMode === "login" && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("forgot");
                            setError("");
                          }}
                          className="text-[10px] text-indigo-400 hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Register: Role Selection */}
                {authMode === "register" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Select Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole("student")}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                          role === "student"
                            ? "bg-indigo-500/10 border-indigo-500 text-indigo-300"
                            : "bg-transparent border-white/10 text-slate-400 hover:border-white/20"
                        }`}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("recruiter")}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                          role === "recruiter"
                            ? "bg-indigo-500/10 border-indigo-500 text-indigo-300"
                            : "bg-transparent border-white/10 text-slate-400 hover:border-white/20"
                        }`}
                      >
                        Recruiter
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember Me (Login only) */}
                {authMode === "login" && (
                  <label className="flex items-center gap-2 cursor-pointer mt-1 select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-white/10 bg-slate-950/40 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-400">
                      Remember session for 30 days
                    </span>
                  </label>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                >
                  {loading ? (
                    <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      {authMode === "register"
                        ? "Register Account"
                        : authMode === "forgot"
                        ? "Send Reset Link"
                        : "Sign In"}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Mode Switcher */}
              <div className="mt-8 text-center text-xs text-slate-400">
                {authMode === "forgot" ? (
                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setError("");
                    }}
                    className="text-indigo-400 font-semibold hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </button>
                ) : authMode === "register" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        setAuthMode("login");
                        setError("");
                      }}
                      className="text-indigo-400 font-semibold hover:underline"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{" "}
                    <button
                      onClick={() => {
                        setAuthMode("register");
                        setError("");
                      }}
                      className="text-indigo-400 font-semibold hover:underline"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
