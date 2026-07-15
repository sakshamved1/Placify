import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast System for premium micro-alerts
  const showToast = (title, message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Helper fetch wrapper to inject token
  const apiFetch = async (url, options = {}) => {
    const headers = {
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${res.status}`);
    }

    return res.json();
  };

  // Fetch current user details
  const fetchUser = async (authToken) => {
    try {
      setLoading(true);
      const data = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }).then(r => {
        if (!r.ok) throw new Error('Session invalid');
        return r.json();
      });
      setUser(data);
    } catch (err) {
      console.warn('Session check failed, logging out');
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      showToast('Logged In', `Welcome back, ${data.name}!`, 'success');
      return data;
    } catch (err) {
      showToast('Login Failed', err.message, 'error');
      throw err;
    }
  };

  // Register
  const register = async (name, email, password, role) => {
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      showToast('Registered', 'Account created successfully!', 'success');
      return data;
    } catch (err) {
      showToast('Registration Failed', err.message, 'error');
      throw err;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setNotifications([]);
    setApplications([]);
    showToast('Logged Out', 'You have been securely signed out.', 'info');
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    try {
      const data = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      setUser(data);
      showToast('Profile Updated', 'Your profile details have been saved.', 'success');
      return data;
    } catch (err) {
      showToast('Update Failed', err.message, 'error');
      throw err;
    }
  };

  // Upload Resume
  const uploadResume = async (formData) => {
    try {
      const data = await apiFetch('/api/auth/upload-resume', {
        method: 'POST',
        body: formData,
      });
      
      // Update local user state
      setUser(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          resumeUrl: data.resumeUrl,
          resumeOriginalName: data.resumeOriginalName,
          atsScore: data.atsScore,
          resumeSuggestions: data.resumeSuggestions
        }
      }));

      showToast('Resume Uploaded', `ATS Analysis complete. Score: ${data.atsScore}%`, 'success');
      return data;
    } catch (err) {
      showToast('Upload Failed', err.message, 'error');
      throw err;
    }
  };

  // Fetch Jobs
  const fetchJobs = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== '') {
          queryParams.append(key, val);
        }
      });
      const data = await apiFetch(`/api/jobs?${queryParams.toString()}`);
      setJobs(data);
    } catch (err) {
      console.error('Fetch Jobs failed:', err);
    }
  };

  // Post Job (Recruiter / Admin)
  const postJob = async (jobData) => {
    try {
      const data = await apiFetch('/api/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
      });
      setJobs(prev => [data, ...prev]);
      showToast('Job Posted', `${jobData.title} was successfully published!`, 'success');
      return data;
    } catch (err) {
      showToast('Error Posting Job', err.message, 'error');
      throw err;
    }
  };

  // Delete Job
  const deleteJob = async (jobId) => {
    try {
      await apiFetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });
      setJobs(prev => prev.filter(j => j._id !== jobId));
      showToast('Job Removed', 'The job listing was deleted.', 'info');
    } catch (err) {
      showToast('Delete Failed', err.message, 'error');
      throw err;
    }
  };

  // Fetch Applications
  const fetchApplications = async () => {
    try {
      const data = await apiFetch('/api/applications');
      setApplications(data);
    } catch (err) {
      console.error('Fetch Applications failed:', err);
    }
  };

  // Apply for Job
  const applyJob = async (jobId, notes) => {
    try {
      const data = await apiFetch('/api/applications', {
        method: 'POST',
        body: JSON.stringify({ jobId, notes }),
      });
      setApplications(prev => [data, ...prev]);
      showToast('Application Sent', 'Your application is now under review.', 'success');
      return data;
    } catch (err) {
      showToast('Application Failed', err.message, 'error');
      throw err;
    }
  };

  // Update Application Status (Recruiter / Admin)
  const updateAppStatus = async (appId, status, notes) => {
    try {
      const data = await apiFetch(`/api/applications/${appId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes }),
      });
      setApplications(prev => prev.map(app => app._id === appId ? { ...app, status, notes } : app));
      showToast('Status Updated', `Candidate is now marked as "${status}".`, 'success');
      return data;
    } catch (err) {
      showToast('Update Failed', err.message, 'error');
      throw err;
    }
  };

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const data = await apiFetch('/api/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Fetch Notifications failed:', err);
    }
  };

  // Mark notification read
  const markNotifRead = async (notifId) => {
    try {
      await apiFetch(`/api/notifications/${notifId}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all read
  const markAllNotifsRead = async () => {
    try {
      await apiFetch('/api/notifications/read-all', { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all users (admin only)
  const fetchAllUsers = async () => {
    try {
      const data = await apiFetch('/api/auth/users');
      return data;
    } catch (err) {
      showToast('Fetch Users Failed', err.message, 'error');
      return [];
    }
  };

  // AI Resume Feedback
  const getResumeFeedback = async () => {
    try {
      const data = await apiFetch('/api/ai/resume-feedback', { method: 'POST' });
      setUser(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          atsScore: data.atsScore,
          resumeSuggestions: data.suggestions
        }
      }));
      return data;
    } catch (err) {
      showToast('AI Scan Failed', err.message, 'error');
      throw err;
    }
  };

  // AI Job Match Analyzer
  const getJobMatchScore = async (jobId) => {
    try {
      return await apiFetch('/api/ai/job-match', {
        method: 'POST',
        body: JSON.stringify({ jobId }),
      });
    } catch (err) {
      showToast('Match Analysis Failed', err.message, 'error');
      throw err;
    }
  };

  // AI Interview Practice Generator
  const getInterviewPrep = async (jobId) => {
    try {
      return await apiFetch('/api/ai/interview-prep', {
        method: 'POST',
        body: JSON.stringify({ jobId }),
      });
    } catch (err) {
      showToast('Interview Prep Failed', err.message, 'error');
      throw err;
    }
  };

  // AI Career Roadmap Generator
  const generateRoadmap = async (targetRole) => {
    try {
      return await apiFetch('/api/ai/roadmap', {
        method: 'POST',
        body: JSON.stringify({ targetRole }),
      });
    } catch (err) {
      showToast('Roadmap Generation Failed', err.message, 'error');
      throw err;
    }
  };

  // Load user profile on token setup
  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // Load app data once logged in
  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchApplications();
      fetchNotifications();

      // Establish Real-Time Socket Connection
      const newSocket = io({
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket.io client connected. Registering room...');
        newSocket.emit('join', user._id);
      });

      newSocket.on('notification', (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        showToast(newNotif.title, newNotif.content, newNotif.type);
        // Refresh applications to reflect latest status changes
        fetchApplications();
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        socket,
        notifications,
        jobs,
        applications,
        loading,
        toasts,
        login,
        register,
        logout,
        updateProfile,
        uploadResume,
        fetchJobs,
        postJob,
        deleteJob,
        fetchApplications,
        applyJob,
        updateAppStatus,
        fetchNotifications,
        markNotifRead,
        markAllNotifsRead,
        showToast,
        fetchAllUsers,
        getResumeFeedback,
        getJobMatchScore,
        getInterviewPrep,
        generateRoadmap,
      }}
    >
      {children}

      {/* Premium Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`glass-panel p-4 rounded-xl border border-white/10 shadow-2xl flex flex-col gap-1 transition-all duration-300 transform translate-y-0 opacity-100 ${
              toast.type === 'success'
                ? 'border-emerald-500/20 bg-emerald-950/20'
                : toast.type === 'error'
                ? 'border-rose-500/20 bg-rose-950/20'
                : 'border-indigo-500/20 bg-indigo-950/20'
            }`}
          >
            <div className="flex justify-between items-start">
              <h4 className={`text-sm font-semibold ${
                toast.type === 'success'
                  ? 'text-emerald-400'
                  : toast.type === 'error'
                  ? 'text-rose-400'
                  : 'text-indigo-400'
              }`}>
                {toast.title}
              </h4>
            </div>
            <p className="text-xs text-slate-300">{toast.message}</p>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};
