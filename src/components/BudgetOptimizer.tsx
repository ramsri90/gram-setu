'use client';

import React from 'react';
import { OptimizationResult, PanchayatProblem, UserRole } from '@/types';
import {
  Cpu,
  Coins,
  Users,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Sparkles,
  TrendingUp,
  Download,
  Info,
} from 'lucide-react';

interface BudgetOptimizerProps {
  budgetLimit: number;
  setBudgetLimit: (b: number) => void;
  result: OptimizationResult;
  onExplain: (problem: PanchayatProblem) => void;
  userRole: UserRole;
}

export function BudgetOptimizer({
  budgetLimit,
  setBudgetLimit,
  result,
  onExplain,
  userRole,
}: BudgetOptimizerProps) {
  const budgetInLakhs = (budgetLimit / 100000).toFixed(1);
  const costInLakhs = (result.totalCost / 100000).toFixed(1);
  const budgetUtilizationPercent = Math.min(100, Math.round((result.totalCost / budgetLimit) * 100));

  const handleExportPlan = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Gram_Setu_Allocation_Plan_${result.strategyName.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4" /> 0/1 Knapsack Optimization Algorithm
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Panchayat Budget Allocation Engine
            </h2>
            <p className="text-sm text-gray-300 mt-1 max-w-2xl">
              Mathematically maximizes total village priority score under strict budget constraints (sum of project costs &le; budget limit).
            </p>
          </div>

          <button
            onClick={handleExportPlan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-cyan-950 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Official Plan JSON</span>
          </button>
        </div>

        {/* Budget Controller Slider & Quick Presets */}
        <div className="mt-6 pt-6 border-t border-gray-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              Adjust Panchayat Annual Capital Budget Limit:
            </label>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">
              ₹{budgetInLakhs} Lakhs <span className="text-xs text-gray-400 font-normal">(₹{budgetLimit.toLocaleString('en-IN')})</span>
            </span>
          </div>

          <input
            type="range"
            min="1000000"
            max="10000000"
            step="250000"
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(parseInt(e.target.value, 10))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs text-gray-400 self-center mr-1 font-medium">Quick Limits:</span>
            <BudgetPreset limit={2500000} active={budgetLimit === 2500000} onClick={() => setBudgetLimit(2500000)} label="₹25 Lakhs" />
            <BudgetPreset limit={3500000} active={budgetLimit === 3500000} onClick={() => setBudgetLimit(3500000)} label="₹35 Lakhs" />
            <BudgetPreset limit={4500000} active={budgetLimit === 4500000} onClick={() => setBudgetLimit(4500000)} label="₹45 Lakhs" />
            <BudgetPreset limit={6000000} active={budgetLimit === 6000000} onClick={() => setBudgetLimit(6000000)} label="₹60 Lakhs" />
            <BudgetPreset limit={7500000} active={budgetLimit === 7500000} onClick={() => setBudgetLimit(7500000)} label="₹75 Lakhs" />
          </div>
        </div>
      </div>

      {/* Analytics Metric Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Budget Utilized"
          value={`₹${costInLakhs} L`}
          subtext={`${budgetUtilizationPercent}% of ₹${budgetInLakhs} L limit`}
          icon={<Coins className="w-5 h-5 text-emerald-400" />}
          borderColor="border-emerald-500/30"
          progress={budgetUtilizationPercent}
        />
        <MetricCard
          title="Villagers Benefited"
          value={result.totalPeopleBenefited.toLocaleString('en-IN')}
          subtext={`Across ${result.selectedProblems.length} funded projects`}
          icon={<Users className="w-5 h-5 text-blue-400" />}
          borderColor="border-blue-500/30"
        />
        <MetricCard
          title="Critical Hazards Solved"
          value={`${result.criticalSolvedCount} Projects`}
          subtext="Urgency/Safety/Health >= 4"
          icon={<AlertOctagon className="w-5 h-5 text-amber-400" />}
          borderColor="border-amber-500/30"
        />
        <MetricCard
          title="Priority Captured"
          value={`${result.totalPriorityScore} pts`}
          subtext={`Efficiency: ${result.efficiencyRatio} pts/Lakh`}
          icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
          borderColor="border-purple-500/30"
        />
      </div>

      {/* Dual Column: Funded vs Unfunded Hard Tradeoffs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Funded Projects */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
            <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>✅ Funded Projects ({result.selectedProblems.length})</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-300">
              Total: ₹{costInLakhs} Lakhs
            </span>
          </div>

          <div className="space-y-3">
            {result.selectedProblems.map((p) => (
              <OptimizedCard key={p.id} problem={p} isFunded={true} onExplain={() => onExplain(p)} />
            ))}
            {result.selectedProblems.length === 0 && (
              <div className="p-8 text-center glass-panel rounded-xl text-gray-400 text-sm">
                No projects fit within the selected budget limit.
              </div>
            )}
          </div>
        </div>

        {/* Right: Unfunded Hard Tradeoffs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-rose-950/40 border border-rose-500/30">
            <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>❌ Unfunded Hard Tradeoffs ({result.unfundedProblems.length})</span>
            </div>
            <span className="text-xs text-rose-300 font-medium">
              Requires extra ₹
              {(result.unfundedProblems.reduce((sum, p) => sum + p.estimated_cost, 0) / 100000).toFixed(1)} L
            </span>
          </div>

          <div className="space-y-3">
            {result.unfundedProblems.map((p) => (
              <OptimizedCard key={p.id} problem={p} isFunded={false} onExplain={() => onExplain(p)} />
            ))}
            {result.unfundedProblems.length === 0 && (
              <div className="p-8 text-center glass-panel rounded-xl text-emerald-400 text-sm">
                🎉 Budget is sufficient to fund ALL reported village projects!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BudgetPreset({
  limit,
  active,
  onClick,
  label,
}: {
  limit: number;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition ${
        active
          ? 'bg-emerald-600 text-white shadow border border-emerald-400'
          : 'bg-slate-900 text-gray-400 hover:text-white border border-gray-800'
      }`}
    >
      {label}
    </button>
  );
}

function MetricCard({
  title,
  value,
  subtext,
  icon,
  borderColor,
  progress,
}: {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  borderColor: string;
  progress?: number;
}) {
  return (
    <div className={`glass-panel p-4 rounded-xl border ${borderColor} space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
        <div className="p-1.5 rounded-lg bg-slate-900 border border-gray-800">{icon}</div>
      </div>
      <div className="text-2xl font-black text-white font-mono tracking-tight">{value}</div>
      <div className="text-xs text-gray-400">{subtext}</div>

      {progress !== undefined && (
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function OptimizedCard({
  problem,
  isFunded,
  onExplain,
}: {
  problem: PanchayatProblem;
  isFunded: boolean;
  onExplain: () => void;
}) {
  const costLakhs = (problem.estimated_cost / 100000).toFixed(1);

  return (
    <div
      className={`glass-panel rounded-xl p-4 border transition ${
        isFunded
          ? 'border-emerald-500/20 bg-slate-900/60 hover:border-emerald-500/40'
          : 'border-gray-800/80 bg-slate-950/40 opacity-80 hover:opacity-100 hover:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-gray-300">
              {problem.id}
            </span>
            <span className="text-xs text-gray-400">{problem.panchayat_name}</span>
          </div>
          <h4 className="text-sm font-bold text-white leading-snug">{problem.title}</h4>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-sm font-black text-emerald-400 font-mono">
            {problem.priority_score} <span className="text-[10px] font-normal text-gray-400">pts</span>
          </div>
          <div className="text-xs text-gray-400">₹{costLakhs} Lakhs</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-800/60 text-xs">
        <span className="text-gray-400">
          👥 {problem.people_affected.toLocaleString('en-IN')} residents
        </span>

        <button
          onClick={onExplain}
          className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition"
        >
          <Sparkles className="w-3 h-3" />
          <span>Why {isFunded ? 'funded' : 'skipped'}?</span>
        </button>
      </div>
    </div>
  );
}
