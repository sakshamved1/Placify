import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Bell, LogOut, User as UserIcon, Briefcase, FileText, CheckSquare, Layers, Menu, X, Check, Globe } from 'lucide-react';

const Navbar = () => {
  const { user, logout, notifications, markNotifRead, markAllNotifsRead } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    if (!user) {
      return [
        { label: 'Overview', path: '/' },
        { label: 'Statistics', path: '/#stats' },
        { label: 'Features', path: '/#features' },
      ];
    }

    switch (user.role) {
      case 'student':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: Layers },
          { label: 'Jobs', path: '/jobs', icon: Briefcase },
          { label: 'Track Applications', path: '/tracking', icon: CheckSquare },
          { label: 'Resume ATS', path: '/resume', icon: FileText },
        ];
      case 'recruiter':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: Layers },
          { label: 'Post Job', path: '/jobs', icon: Briefcase }, // Handled inside JobPortal/PostJob
        ];
      case 'admin':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: Layers },
          { label: 'Hiring Analytics', path: '/jobs', icon: Briefcase },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <nav className="sticky top-4 left-0 right-0 z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-2xl border-white/10 px-6 py-3 flex items-center justify-between shadow-lg">
        
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <span 
            className="font-heading font-extrabold text-xl tracking-tight transition-all duration-300 hover:opacity-90"
            style={{ color: '#B985FC' }}
          >
            Placify
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-4 mx-10">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.05)]'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 text-indigo-400" />}
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Action Panel */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Notification Icon */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 glass-panel border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-2 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="font-heading font-semibold text-xs text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotifsRead}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500">
                        No alerts or updates yet
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 pt-1">
                        {notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => markNotifRead(notif._id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                              notif.read
                                ? 'bg-white/[0.02] border-white/5 opacity-60'
                                : 'bg-indigo-500/[0.04] border-indigo-500/10 hover:bg-indigo-500/[0.08]'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-semibold text-xs text-white line-clamp-1">{notif.title}</span>
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-300 leading-normal">{notif.content}</p>
                            <span className="text-[9px] text-slate-500 font-medium">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Identity Profile / Log Out */}
              <div className="hidden sm:flex items-center gap-3 border-l border-white/10 pl-4">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-white">{user.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium capitalize">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login?register=true"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 shadow-md shadow-indigo-500/10 transition-all hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Burger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 glass-panel border-white/10 rounded-2xl flex flex-col gap-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="border-t border-white/5 pt-3 mt-1 flex flex-col gap-2">
              <div className="px-4 py-2 flex flex-col">
                <span className="text-xs font-semibold text-white">{user.name}</span>
                <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 text-left flex items-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          ) : (
            <div className="border-t border-white/5 pt-3 mt-1 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white text-center hover:bg-white/5"
              >
                Sign In
              </Link>
              <Link
                to="/login?register=true"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-center shadow-lg shadow-indigo-500/10"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
