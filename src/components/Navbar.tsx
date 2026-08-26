'use client';

import React from 'react';
import { UserRole } from '@/types';
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
  onResetData: () => void;
  problemCount: number;
}

export function Navbar({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  onResetData,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white font-sans">
                  Gram <span className="gradient-text-emerald">Setu</span>
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold font-mono tracking-wide uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SIH Edition
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium hidden md:block">
                Panchayat Resource Scoring, Knapsack Optimizer & Simulator
              </p>
            </div>
          </div>

          {/* Right Side Controls: Role Switcher & Reset */}
          <div className="flex items-center gap-3">
            {/* Role Switcher Pill */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-gray-800 text-xs">
              <RoleButton
                active={userRole === 'official'}
                onClick={() => setUserRole('official')}
                icon={<Building2 className="w-3.5 h-3.5 text-amber-400" />}
                label="Official"
              />
              <RoleButton
                active={userRole === 'field_staff'}
                onClick={() => setUserRole('field_staff')}
                icon={<ShieldCheck className="w-3.5 h-3.5 text-teal-400" />}
                label="Field Staff"
              />
              <RoleButton
                active={userRole === 'citizen'}
                onClick={() => setUserRole('citizen')}
                icon={<User className="w-3.5 h-3.5 text-blue-400" />}
                label="Citizen"
              />
            </div>

            {/* Reset dataset */}
            <button
              onClick={onResetData}
              title="Reset Demo Dataset"
              className="p-2 rounded-xl text-gray-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-gray-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Header Bar */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-gray-800/80 no-scrollbar">
          <TabButton
            active={activeTab === 'scoring'}
            onClick={() => setActiveTab('scoring')}
            icon={<Sliders className="w-3.5 h-3.5" />}
            label="1. Scoring Engine"
          />
          <TabButton
            active={activeTab === 'optimizer'}
            onClick={() => setActiveTab('optimizer')}
            icon={<Cpu className="w-3.5 h-3.5" />}
            label="2. Knapsack Optimizer"
          />
          <TabButton
            active={activeTab === 'simulator'}
            onClick={() => setActiveTab('simulator')}
            icon={<GitCompare className="w-3.5 h-3.5" />}
            label="3. Strategy Simulator"
          />
          <TabButton
            active={activeTab === 'map'}
            onClick={() => setActiveTab('map')}
            icon={<MapPin className="w-3.5 h-3.5" />}
            label="4. GIS Problem Map"
          />
          <TabButton
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            label="5. Impact Analytics"
          />
          <TabButton
            active={activeTab === 'progress'}
            onClick={() => setActiveTab('progress')}
            icon={<HardHat className="w-3.5 h-3.5" />}
            label="6. Work Progress"
          />
          <TabButton
            active={activeTab === 'reporting'}
            onClick={() => setActiveTab('reporting')}
            icon={<PlusCircle className="w-3.5 h-3.5" />}
            label="7. Citizen Portal"
          />
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
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950'
          : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/60'
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
          ? 'bg-slate-800 text-white shadow border border-gray-700 font-semibold'
          : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
