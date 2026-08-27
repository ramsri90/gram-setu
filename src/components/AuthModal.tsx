'use client';

import React, { useState } from 'react';
import { UserProfile, UserRole } from '@/types';
import { signUpCitizen, signInUser, isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  X,
  User,
  Building2,
  Lock,
  Mail,
  UserPlus,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  defaultRole?: UserRole;
}

export function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultRole = 'citizen',
}: AuthModalProps) {
  // Active Portal Tab: 'citizen' or 'official'
  const [activePortal, setActivePortal] = useState<'citizen' | 'official'>(
    defaultRole === 'official' ? 'official' : 'citizen'
  );

  // Citizen Mode: 'login' or 'register'
  const [citizenAuthMode, setCitizenAuthMode] = useState<'login' | 'register'>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [panchayatName, setPanchayatName] = useState('Rampur Gram Panchayat');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (citizenAuthMode === 'register') {
      if (!fullName || !email || !password) {
        setErrorMsg('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      const res = await signUpCitizen(email, password, fullName, panchayatName);
      setLoading(false);

      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.user) {
        setSuccessMsg('Account created successfully! Logging you in...');
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
        }, 1000);
      }
    } else {
      // Citizen Login
      if (!email || !password) {
        setErrorMsg('Please enter email and password.');
        setLoading(false);
        return;
      }

      const res = await signInUser(email, password, 'citizen');
      setLoading(false);

      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.user) {
        setSuccessMsg('Welcome back! Citizen portal loaded.');
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
        }, 800);
      }
    }
  };

  const handleOfficialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!email || !password) {
      // Auto fallback for official demo
      const mockOfficial: UserProfile = {
        id: `official_admin_01`,
        email: email || 'panchyatadmin@gmail.com',
        full_name: 'Shri Rajesh Verma (Panchayat Master Admin)',
        role: 'official',
        panchayat_name: 'Sehore District Headquarters',
      };
      setLoading(false);
      onLoginSuccess(mockOfficial);
      onClose();
      return;
    }

    const res = await signInUser(email, password, 'official');
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.user) {
      setSuccessMsg('Official Master Admin authenticated.');
      setTimeout(() => {
        onLoginSuccess(res.user!);
        onClose();
      }, 800);
    }
  };

  // Quick Demo Auto fill
  const fillDemoCitizen = () => {
    setEmail('citizen.rampur@gmail.com');
    setPassword('demo123456');
    setFullName('Ramesh Kumar');
    setPanchayatName('Rampur Gram Panchayat');
  };

  const fillDemoOfficial = () => {
    setEmail('panchyatadmin@gmail.com');
    setPassword('Gramsetu@123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl glass-panel border border-teal-500/30 shadow-2xl shadow-teal-950/50 text-gray-100">
        
        {/* Top Decorative Header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 border-b border-teal-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Gram <span className="gradient-text-teal">Setu Portals</span>
                </h3>
                <p className="text-xs text-teal-300/80 font-medium">
                  Gram Panchayat Priority Engine & Governance System
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Portal Switcher */}
          <div className="grid grid-cols-2 gap-2 mt-5 p-1 bg-slate-950/80 rounded-2xl border border-teal-500/20 text-xs font-bold">
            <button
              onClick={() => {
                setActivePortal('citizen');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition ${
                activePortal === 'citizen'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Citizen Portal</span>
            </button>

            <button
              onClick={() => {
                setActivePortal('official');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition ${
                activePortal === 'official'
                  ? 'bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>Official / Master Admin</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Status Alert Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-teal-950/90 border border-teal-400/40 text-teal-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-300 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

                  {/* CITIZEN PORTAL */}
                  {activePortal === 'citizen' && (
                    <div className="space-y-4">
                      {/* Citizen Auth Mode Switcher */}
                      <div className="border-b border-gray-800 pb-3 text-xs">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              setCitizenAuthMode('login');
                              setErrorMsg(null);
                            }}
                            className={`font-bold pb-1 transition ${
                              citizenAuthMode === 'login'
                                ? 'text-teal-300 border-b-2 border-teal-400'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            Citizen Sign In
                          </button>

                          <button
                            onClick={() => {
                              setCitizenAuthMode('register');
                              setErrorMsg(null);
                            }}
                            className={`font-bold pb-1 transition flex items-center gap-1 ${
                              citizenAuthMode === 'register'
                                ? 'text-teal-300 border-b-2 border-teal-400'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Create Account</span>
                          </button>
                        </div>
                      </div>

              <form onSubmit={handleCitizenSubmit} className="space-y-3.5">
                {citizenAuthMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Kumar"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-gray-800 text-sm text-white focus:border-teal-400 focus:outline-none"
                        required={citizenAuthMode === 'register'}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      placeholder="citizen@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-gray-800 text-sm text-white focus:border-teal-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {citizenAuthMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Gram Panchayat Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rampur Gram Panchayat"
                      value={panchayatName}
                      onChange={(e) => setPanchayatName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-gray-800 text-sm text-white focus:border-teal-400 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-gray-800 text-sm text-white focus:border-teal-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-teal-950 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : citizenAuthMode === 'register' ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Citizen Account & Login</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Citizen Portal</span>
                    </>
                  )}
                </button>
              </form>

              <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/20 text-[11px] text-teal-200">
                💡 <strong>Citizen Features:</strong> Log in to upload public infrastructure problems, attach site photos, and track resolution status by official authorities.
              </div>
            </div>
          )}

          {/* OFFICIAL / MASTER ADMIN PORTAL */}
          {activePortal === 'official' && (
            <div className="space-y-4">
              <div className="border-b border-gray-800 pb-2 text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Government Official & Master Admin Portal
                </span>
              </div>

              <form onSubmit={handleOfficialSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Official Email / Officer ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      placeholder="panchyatadmin@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-gray-800 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Security Password / Master Key
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-gray-800 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-teal-700 via-teal-600 to-amber-600 hover:from-teal-600 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-teal-950 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {loading ? (
                    <span>Verifying Authority...</span>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 text-amber-300" />
                      <span>Log In as Official Master Admin</span>
                    </>
                  )}
                </button>
              </form>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/20 text-[11px] text-gray-300">
                🛡️ <strong>Official Privileges:</strong> Access citizen-uploaded issue gallery, update complaint statuses to <strong>"Marked as Noted"</strong> or <strong>"Work in Progress"</strong>, execute 0/1 Knapsack optimization, and approve funds.
              </div>
            </div>
          )}

          {/* Database Connection Notice */}
          <div className="text-[10px] text-center font-mono text-teal-400/70 border-t border-teal-500/10 pt-3">
            {isSupabaseConfigured()
              ? '🟢 Live Supabase Database & Auth Connected'
              : '⚡ Local Offline Mode Enabled (Instant Evaluation)'}
          </div>
        </div>
      </div>
    </div>
  );
}
