import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ChevronRight,
  LogIn,
} from "lucide-react";

const LoginPage = () => {
  const { login, register, user } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isRegister, setIsRegister] = useState(
    searchParams.get("register") === "true",
  );
  const [role, setRole] = useState("student"); // student, recruiter, admin
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync isRegister state when URL query updates
  useEffect(() => {
    setIsRegister(searchParams.get("register") === "true");
  }, [searchParams]);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
            <span className="gradient-text">automated matching</span>
          </h2>
          <p className="text-slate-400 font-light text-sm leading-relaxed">
            Placify standardizes resume evaluations, connects top graduates
            directly with recruiter boards, and sends WebSockets triggers so you
            never miss an application event.
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
                15k+
              </span>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                Resume ATS scans
              </p>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-medium">
          Protected by industry standard encryption protocols. &copy;{" "}
          {new Date().getFullYear()} Placify
        </div>
      </div>

      {/* Right Column: Glass Login Form */}
      <div className="col-span-12 md:col-span-6 flex items-center justify-center">
        <div className="w-full max-w-md glass-panel border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
          <div className="text-center mb-8">
            <h3 className="font-heading text-2xl font-bold text-white">
              {isRegister ? "Create an account" : "Welcome back"}
            </h3>
            <p className="text-xs text-slate-400 mt-2 font-light">
              {isRegister
                ? "Get access to jobs and ATS tracking tools"
                : "Sign in to access your placement dashboard"}
            </p>
          </div>

          {/* Autofill Demo Credentials */}
          {!isRegister && (
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
            {isRegister && (
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

            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                {!isRegister && (
                  <a
                    href="#"
                    className="text-[10px] text-indigo-400 hover:underline"
                  >
                    Forgot Password?
                  </a>
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

            {/* Register: Role Selection */}
            {isRegister && (
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

            {/* Remember Me */}
            {!isRegister && (
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
                  {isRegister ? "Register Account" : "Sign In"}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign-In buttons */}
          <div className="relative my-6 text-center">
            <hr className="border-white/5" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-[#0b0f19] text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-medium text-xs flex justify-center items-center gap-2 transition-all"
            >
              Google
            </button>
            <button
              type="button"
              className="py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-medium text-xs flex justify-center items-center gap-2 transition-all"
            >
              GitHub
            </button>
          </div>

          {/* Switch Mode */}
          <div className="mt-8 text-center text-xs text-slate-400">
            {isRegister
              ? "Already have an account? "
              : "Don't have an account? "}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setName("");
                setEmail("");
                setPassword("");
              }}
              className="text-indigo-400 font-semibold hover:underline"
            >
              {isRegister ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
