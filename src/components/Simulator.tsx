'use client';

import React from 'react';
import { OptimizationResult, PanchayatProblem } from '@/types';
import {
  GitCompare,
  Sparkles,
  Users,
  AlertOctagon,
  TrendingUp,
  Coins,
  CheckCircle2,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface SimulatorProps {
  planA: OptimizationResult;
  planB: OptimizationResult;
  planC: OptimizationResult;
  budgetLimit: number;
  onApplyPlan: (plan: OptimizationResult) => void;
  onExplain: (problem: PanchayatProblem) => void;
}

export function Simulator({
  planA,
  planB,
  planC,
  budgetLimit,
  onApplyPlan,
  onExplain,
}: SimulatorProps) {
  const budgetInLakhs = (budgetLimit / 100000).toFixed(1);

  // Chart Data Preparation
  const chartData = [
    {
      metric: 'Villagers Benefited (100s)',
      'Plan A (Reach)': Math.round(planA.totalPeopleBenefited / 100),
      'Plan B (Safety)': Math.round(planB.totalPeopleBenefited / 100),
      'Plan C (Efficiency)': Math.round(planC.totalPeopleBenefited / 100),
    },
    {
      metric: 'Priority Score (pts)',
      'Plan A (Reach)': planA.totalPriorityScore,
      'Plan B (Safety)': planB.totalPriorityScore,
      'Plan C (Efficiency)': planC.totalPriorityScore,
    },
    {
      metric: 'Critical Solved (x10)',
      'Plan A (Reach)': planA.criticalSolvedCount * 10,
      'Plan B (Safety)': planB.criticalSolvedCount * 10,
      'Plan C (Efficiency)': planC.criticalSolvedCount * 10,
    },
    {
      metric: 'Efficiency (pts/Lakh)',
      'Plan A (Reach)': planA.efficiencyRatio * 10,
      'Plan B (Safety)': planB.efficiencyRatio * 10,
      'Plan C (Efficiency)': planC.efficiencyRatio * 10,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-purple-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
              <GitCompare className="w-4 h-4" /> Multi-Strategy Decision Simulator
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Plan A vs Plan B vs Plan C Tradeoff Matrix
            </h2>
            <p className="text-sm text-gray-300 mt-1 max-w-2xl">
              Simulates budget allocation under 3 distinct policy goals for a total budget of ₹{budgetInLakhs} Lakhs. Evaluate hard tradeoffs before final official approval.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Plan Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlanSummaryCard
          title="Plan A: Maximum Reach"
          badge="Population Heavy"
          badgeColor="bg-blue-500/20 text-blue-300 border-blue-500/30"
          description="Prioritizes projects that touch the largest number of village residents."
          result={planA}
          onApply={() => onApplyPlan(planA)}
        />
        <PlanSummaryCard
          title="Plan B: Emergency & Safety"
          badge="Risk & Health First"
          badgeColor="bg-rose-500/20 text-rose-300 border-rose-500/30"
          description="Directs capital directly to immediate safety hazards, disease threats, and critical failures."
          result={planB}
        />
        <PlanSummaryCard
          title="Plan C: High Efficiency"
          badge="Optimal Return"
          badgeColor="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
          description="Balances cost-benefit ratio and focuses on restoring degraded assets efficiently."
          result={planC}
          onApply={() => onApplyPlan(planC)}
        />
      </div>

      {/* Recharts Analytics Comparison */}
      <div className="glass-panel rounded-2xl p-6 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Side-by-Side Impact Comparison Chart
          </h3>
          <span className="text-xs text-gray-400 font-mono">Budget: ₹{budgetInLakhs} L</span>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="metric" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="Plan A (Reach)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Plan B (Safety)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Plan C (Efficiency)" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="glass-panel rounded-2xl p-6 border border-gray-800 space-y-4">
        <h3 className="text-base font-bold text-white">Strategy Metrics Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Metric</th>
                <th className="py-3 px-4 text-blue-400">Plan A (Reach)</th>
                <th className="py-3 px-4 text-rose-400">Plan B (Safety)</th>
                <th className="py-3 px-4 text-emerald-400">Plan C (Efficiency)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-medium">
              <tr>
                <td className="py-3 px-4 text-gray-300">Total Budget Spent</td>
                <td className="py-3 px-4 font-mono font-bold text-white">₹{(planA.totalCost / 100000).toFixed(1)} L</td>
                <td className="py-3 px-4 font-mono font-bold text-white">₹{(planB.totalCost / 100000).toFixed(1)} L</td>
                <td className="py-3 px-4 font-mono font-bold text-white">₹{(planC.totalCost / 100000).toFixed(1)} L</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-300">Villagers Benefited</td>
                <td className="py-3 px-4 text-blue-300 font-bold">{planA.totalPeopleBenefited.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-rose-300 font-bold">{planB.totalPeopleBenefited.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-emerald-300 font-bold">{planC.totalPeopleBenefited.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-300">Critical Hazards Solved</td>
                <td className="py-3 px-4">{planA.criticalSolvedCount} projects</td>
                <td className="py-3 px-4 text-rose-400 font-bold">{planB.criticalSolvedCount} projects</td>
                <td className="py-3 px-4">{planC.criticalSolvedCount} projects</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-300">Total Priority Captured</td>
                <td className="py-3 px-4 font-mono">{planA.totalPriorityScore} pts</td>
                <td className="py-3 px-4 font-mono">{planB.totalPriorityScore} pts</td>
                <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{planC.totalPriorityScore} pts</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-300">Funded Projects Count</td>
                <td className="py-3 px-4">{planA.selectedProblems.length} funded</td>
                <td className="py-3 px-4">{planB.selectedProblems.length} funded</td>
                <td className="py-3 px-4">{planC.selectedProblems.length} funded</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PlanSummaryCard({
  title,
  badge,
  badgeColor,
  description,
  result,
  onApply,
}: {
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  result: OptimizationResult;
  onApply?: () => void;
}) {
  const costLakhs = (result.totalCost / 100000).toFixed(1);

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-gray-800 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
            {badge}
          </span>
          <span className="text-xs text-gray-400 font-mono">₹{costLakhs} L</span>
        </div>

        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-xs text-gray-400 leading-relaxed">{description}</p>

        <div className="space-y-2 pt-2 border-t border-gray-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" /> Benefited:
            </span>
            <span className="font-bold text-white">{result.totalPeopleBenefited.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" /> Critical Solved:
            </span>
            <span className="font-bold text-white">{result.criticalSolvedCount} hazards</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Score Captured:
            </span>
            <span className="font-mono font-bold text-emerald-400">{result.totalPriorityScore} pts</span>
          </div>
        </div>
      </div>

      {onApply && (
        <button
          onClick={onApply}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white font-semibold text-xs transition border border-gray-700 hover:border-emerald-500"
        >
          Adopt Strategy Plan
        </button>
      )}
    </div>
  );
}
