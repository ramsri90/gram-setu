'use client';

import React, { useState } from 'react';
import { UserProfile, UserRole } from '@/types';
import { signUpCitizen, signInUser, isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  Building2,
  User,
  UserPlus,
  LogIn,
  ShieldCheck,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface LandingLoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export function LandingLoginScreen({ onLoginSuccess }: LandingLoginScreenProps) {
  const [activePortal, setActivePortal] = useState<'citizen' | 'official'>('citizen');
  const [citizenAuthMode, setCitizenAuthMode] = useState<'login' | 'register'>('login');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [panchayatName, setPanchayatName] = useState('Rampur Gram Panchayat');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
        setSuccessMsg('Account created successfully! Entering Citizen Portal...');
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 800);
      }
    } else {
      if (!email || !password) {
        setErrorMsg('Please enter your email and password.');
        setLoading(false);
        return;
      }

      const res = await signInUser(email, password, 'citizen');
      setLoading(false);

      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.user) {
        setSuccessMsg('Welcome back! Loading Citizen Portal...');
        setTimeout(() => {
          onLoginSuccess(res.user!);
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
      // Demo auto-fallback if submitted empty
      const mockOfficial: UserProfile = {
        id: `official_master_01`,
        email: email || 'panchyatadmin@gmail.com',
        full_name: 'Panchayat Master Admin',
        role: 'official',
        panchayat_name: 'Gram Panchayat Central HQ',
      };
      setLoading(false);
      onLoginSuccess(mockOfficial);
      return;
    }

    const res = await signInUser(email, password, 'official');
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.user) {
      setSuccessMsg('Official Master Admin authenticated. Entering Portal...');
      setTimeout(() => {
        onLoginSuccess(res.user!);
      }, 800);
    }
  };

  // Quick Demo Auto-fill helpers
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
    <div className="min-h-screen bg-[#041418] text-white flex flex-col justify-between selection:bg-teal-500 selection:text-white relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Logo */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-teal-500/15 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-400 to-cyan-300 p-0.5 shadow-lg shadow-teal-500/30">
            <div className="w-full h-full bg-[#061e23] rounded-[14px] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-teal-300" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white font-sans">
              Gram <span className="gradient-text-teal">Setu</span>
            </h1>
            <p className="text-xs text-teal-200/70 font-medium">
              Smart Panchayat Governance & Decision Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-950/80 border border-teal-400/30 text-xs font-mono text-teal-300">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span>{isSupabaseConfigured() ? 'Supabase Live Connected' : 'Local Offline Mode'}</span>
        </div>
      </header>

      {/* Center Screen Secure Login Portal */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 py-10 flex flex-col justify-center relative z-10">
        <div className="space-y-6">
          {/* Title Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> Secure Portal Sign In
            </div>

            <h2 className="text-3xl font-black text-white tracking-tight">
              Welcome to <span className="gradient-text-teal">Gram Setu</span>
            </h2>
            <p className="text-xs text-teal-100/70">
              Select your role below to log in or create a new citizen account.
            </p>
          </div>

          {/* Secure Login Card */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-teal-500/30 shadow-2xl shadow-teal-950/60">
            {/* Dual Portal Switcher Tabs */}
            <div className="grid grid-cols-2 p-1.5 bg-[#061e23] border-b border-teal-500/20 text-xs font-bold">
              <button
                onClick={() => {
                  setActivePortal('citizen');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl transition ${
                  activePortal === 'citizen'
                    ? 'bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 text-white shadow-lg'
                    : 'text-teal-200/70 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Citizen Portal</span>
              </button>

              <button
                onClick={() => {
                  setActivePortal('official');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl transition ${
                  activePortal === 'official'
                    ? 'bg-gradient-to-r from-teal-700 via-teal-600 to-amber-600 text-white shadow-lg'
                    : 'text-teal-200/70 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-300" />
                <span>Official Master Admin</span>
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 sm:p-8 space-y-5">
              {/* Alert Feedback Messages */}
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

              {/* CITIZEN PORTAL FORM */}
              {activePortal === 'citizen' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-teal-500/20 pb-3 text-xs">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setCitizenAuthMode('login');
                          setErrorMsg(null);
                        }}
                        className={`font-bold pb-1 transition ${
                          citizenAuthMode === 'login'
                            ? 'text-teal-300 border-b-2 border-teal-400'
                            : 'text-teal-200/60 hover:text-white'
                        }`}
                      >
                        Citizen Sign In
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCitizenAuthMode('register');
                          setErrorMsg(null);
                        }}
                        className={`font-bold pb-1 transition flex items-center gap-1 ${
                          citizenAuthMode === 'register'
                            ? 'text-teal-300 border-b-2 border-teal-400'
                            : 'text-teal-200/60 hover:text-white'
                        }`}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Create Account</span>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleCitizenSubmit} className="space-y-4">
                    {citizenAuthMode === 'register' && (
                      <div>
                        <label className="block text-xs font-semibold text-teal-100/90 mb-1.5">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3.5 top-3 text-teal-400/60" />
                          <input
                            type="text"
                            placeholder="e.g. Ramesh Kumar"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#061e23] border border-teal-500/20 text-sm text-white focus:border-teal-400 focus:outline-none"
                            required={citizenAuthMode === 'register'}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-teal-100/90 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3 text-teal-400/60" />
                        <input
                          type="email"
                          placeholder="citizen@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#061e23] border border-teal-500/20 text-sm text-white focus:border-teal-400 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {citizenAuthMode === 'register' && (
                      <div>
                        <label className="block text-xs font-semibold text-teal-100/90 mb-1.5">
                          Gram Panchayat Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Rampur Gram Panchayat"
                          value={panchayatName}
                          onChange={(e) => setPanchayatName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#061e23] border border-teal-500/20 text-sm text-white focus:border-teal-400 focus:outline-none"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-teal-100/90 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3 text-teal-400/60" />
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#061e23] border border-teal-500/20 text-sm text-white focus:border-teal-400 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-teal-950 flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Authenticating...</span>
                      ) : citizenAuthMode === 'register' ? (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Create Account & Enter Citizen Portal</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>Sign In to Citizen Portal</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* OFFICIAL / MASTER ADMIN FORM */}
              {activePortal === 'official' && (
                <div className="space-y-4">
                  <div className="border-b border-teal-500/20 pb-3 text-xs">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Official Master Admin Authentication
                    </span>
                  </div>

                  <form onSubmit={handleOfficialSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-teal-100/90 mb-1.5">
                        Official Email / Officer ID
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3 text-amber-400/60" />
                        <input
                          type="email"
                          placeholder="panchyatadmin@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#061e23] border border-teal-500/20 text-sm text-white focus:border-amber-400 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-teal-100/90 mb-1.5">
                        Security Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3 text-amber-400/60" />
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#061e23] border border-teal-500/20 text-sm text-white focus:border-amber-400 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-teal-700 via-teal-600 to-amber-600 hover:from-teal-600 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-teal-950 flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Authenticating Authority...</span>
                      ) : (
                        <>
                          <Building2 className="w-4 h-4 text-amber-300" />
                          <span>Log In as Official Master Admin</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-teal-500/15 bg-[#030f13] py-5 text-center text-xs text-teal-200/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>Gram Setu — Smart Panchayat Grievance & Official Decision Engine</div>
          <div className="font-mono text-[11px] text-teal-300/60">
            Powered by Next.js, PostgreSQL, Supabase Storage & Knapsack DP Solver
          </div>
        </div>
      </footer>
    </div>
  );
}

