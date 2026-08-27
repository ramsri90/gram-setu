'use client';

import React from 'react';
import { UserProfile, UserRole } from '@/types';
import {
  Sliders,
  Cpu,
  GitCompare,
  PlusCircle,
  ShieldCheck,
  User,
  RotateCcw,
  Building2,
  MapPin,
  TrendingUp,
  HardHat,
  LogIn,
  LogOut,
} from 'lucide-react';

export type ActiveTabType =
  | 'scoring'
  | 'optimizer'
  | 'simulator'
  | 'map'
  | 'analytics'
  | 'progress'
  | 'reporting';

interface NavbarProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: (defaultRole?: UserRole) => void;
  onLogout: () => void;
  onResetData: () => void;
  problemCount: number;
}

export function Navbar({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onResetData,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-teal-500/20 bg-[#041418]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-400 to-cyan-300 p-0.5 shadow-lg shadow-teal-500/25">
              <div className="w-full h-full bg-[#061e23] rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-teal-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white font-sans">
                  Gram <span className="gradient-text-teal">Setu</span>
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-bold font-mono tracking-wide uppercase rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  Teal Edition
                </span>
              </div>
              <p className="text-xs text-teal-200/70 font-medium hidden md:block">
                Panchayat Citizen Complaints & Official Decision Engine
              </p>
            </div>
          </div>

          {/* Right Side Controls: User Profile / Auth & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* User Session Badge or Login Modal Trigger */}
            {currentUser ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-950/80 border border-teal-500/30 text-xs">
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <div className="hidden sm:block">
                  <div className="font-bold text-white leading-tight">{currentUser.full_name}</div>
                  <div className="text-[10px] text-teal-300 uppercase font-mono">{currentUser.role}</div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-slate-900 transition ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuthModal('citizen')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-teal-950 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Portal Login</span>
              </button>
            )}

            {/* Active Portal Badge (shows ONLY the logged in portal) */}
            <div className="flex items-center px-3 py-1.5 rounded-xl bg-[#07242a] border border-teal-500/30 text-xs font-bold shadow-inner">
              {userRole === 'official' ? (
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Official Master Admin Portal</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-teal-300">
                  <User className="w-3.5 h-3.5" />
                  <span>Citizen Portal</span>
                </div>
              )}
            </div>

            {/* Reset dataset */}
            <button
              onClick={onResetData}
              title="Reset Demo Dataset"
              className="p-2 rounded-xl text-teal-200 hover:text-white bg-[#07242a] hover:bg-teal-900/50 border border-teal-500/20 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Header Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 border-t border-teal-500/15 no-scrollbar">
          {userRole === 'citizen' ? (
            <>
              {/* CITIZEN PORTAL TABS ONLY */}
              <TabButton
                active={activeTab === 'reporting'}
                onClick={() => setActiveTab('reporting')}
                icon={<PlusCircle className="w-3.5 h-3.5" />}
                label="1. Citizen Portal & Raise Issue"
              />
              <TabButton
                active={activeTab === 'progress'}
                onClick={() => setActiveTab('progress')}
                icon={<HardHat className="w-3.5 h-3.5" />}
                label="2. Work Progress & Status Tracking"
              />
            </>
          ) : (
            <>
              {/* OFFICIAL / MASTER ADMIN TABS ONLY */}
              <TabButton
                active={activeTab === 'progress'}
                onClick={() => setActiveTab('progress')}
                icon={<HardHat className="w-3.5 h-3.5" />}
                label="1. Work Progress & Official Actions"
              />
              <TabButton
                active={activeTab === 'scoring'}
                onClick={() => setActiveTab('scoring')}
                icon={<Sliders className="w-3.5 h-3.5" />}
                label="2. Priority Scoring Engine"
              />
              <TabButton
                active={activeTab === 'optimizer'}
                onClick={() => setActiveTab('optimizer')}
                icon={<Cpu className="w-3.5 h-3.5" />}
                label="3. Knapsack Budget Optimizer"
              />
              <TabButton
                active={activeTab === 'simulator'}
                onClick={() => setActiveTab('simulator')}
                icon={<GitCompare className="w-3.5 h-3.5" />}
                label="4. Strategy Simulator"
              />
              <TabButton
                active={activeTab === 'map'}
                onClick={() => setActiveTab('map')}
                icon={<MapPin className="w-3.5 h-3.5" />}
                label="5. GIS Problem Map"
              />
              <TabButton
                active={activeTab === 'analytics'}
                onClick={() => setActiveTab('analytics')}
                icon={<TrendingUp className="w-3.5 h-3.5" />}
                label="6. Impact Analytics"
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 text-white shadow-md shadow-teal-950 border border-teal-400/30'
          : 'text-teal-200/70 hover:text-white hover:bg-teal-900/40'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function RoleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
        active
          ? 'bg-teal-950 text-white shadow border border-teal-500/40 font-semibold'
          : 'text-teal-200/70 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

