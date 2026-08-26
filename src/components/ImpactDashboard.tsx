'use client';

import React from 'react';
import { OptimizationResult, PanchayatProblem } from '@/types';
import {
  TrendingUp,
  Coins,
  Users,
  AlertOctagon,
  PieChart as PieIcon,
  BarChart3,
  Award,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface ImpactDashboardProps {
  problems: PanchayatProblem[];
  optimizationResult: OptimizationResult;
}

const CATEGORY_COLORS: Record<string, string> = {
  water: '#06b6d4',
  road: '#f59e0b',
  health: '#f43f5e',
  sanitation: '#10b981',
  electricity: '#eab308',
  education: '#a855f7',
};

export function ImpactDashboard({ problems, optimizationResult }: ImpactDashboardProps) {
  // 1. Prepare Category Distribution Data
  const categoryCounts: Record<string, number> = {};
  problems.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  const categoryData = Object.keys(categoryCounts).map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: categoryCounts[cat],
  }));

  // 2. Prepare Panchayat Wise Allocation Data
  const panchayatAllocations: Record<string, number> = {};
  optimizationResult.selectedProblems.forEach((p) => {
    panchayatAllocations[p.panchayat_name] =
      (panchayatAllocations[p.panchayat_name] || 0) + p.estimated_cost / 100000;
  });

  const panchayatData = Object.keys(panchayatAllocations).map((name) => ({
    panchayat: name.replace(' Gram Panchayat', ''),
    allocatedLakhs: Math.round(panchayatAllocations[name] * 10) / 10,
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" /> Governance & Welfare Impact Dashboard
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Panchayat Resource Allocation Analytics
          </h2>
          <p className="text-sm text-gray-300 mt-1 max-w-2xl">
            Real-time analytics evaluating public impact, budget efficiency, hazard resolution rates, and category distribution across Gram Panchayats.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Budget Spent"
          value={`₹${(optimizationResult.totalCost / 100000).toFixed(1)} L`}
          subtext={`Budget Limit: ₹${(optimizationResult.budgetLimit / 100000).toFixed(1)} L`}
          icon={<Coins className="w-5 h-5 text-emerald-400" />}
          borderColor="border-emerald-500/30"
        />
        <KpiCard
          title="Total Villagers Benefited"
          value={optimizationResult.totalPeopleBenefited.toLocaleString('en-IN')}
          subtext={`Across ${optimizationResult.selectedProblems.length} funded projects`}
          icon={<Users className="w-5 h-5 text-blue-400" />}
          borderColor="border-blue-500/30"
        />
        <KpiCard
          title="Critical Hazards Mitigated"
          value={`${optimizationResult.criticalSolvedCount} Hazards`}
          subtext="Urgency/Safety/Health >= 4"
          icon={<AlertOctagon className="w-5 h-5 text-rose-400" />}
          borderColor="border-rose-500/30"
        />
        <KpiCard
          title="Efficiency Index"
          value={`${optimizationResult.efficiencyRatio} pts/Lakh`}
          subtext="Captured Priority Score Ratio"
          icon={<Award className="w-5 h-5 text-purple-400" />}
          borderColor="border-purple-500/30"
        />
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Pie Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-cyan-400" />
              Reported Issues by Infrastructure Sector
            </h3>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.name.toLowerCase()] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Panchayat Allocation Bar Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Funded Capital by Gram Panchayat (₹ Lakhs)
            </h3>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={panchayatData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="panchayat" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="allocatedLakhs" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtext,
  icon,
  borderColor,
}: {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  borderColor: string;
}) {
  return (
    <div className={`glass-panel p-5 rounded-2xl border ${borderColor} space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
        <div className="p-1.5 rounded-xl bg-slate-900 border border-gray-800">{icon}</div>
      </div>
      <div className="text-2xl font-black text-white font-mono tracking-tight">{value}</div>
      <div className="text-xs text-gray-400">{subtext}</div>
    </div>
  );
}
