'use client';

import React from 'react';
import { PanchayatProblem, ScoringWeights } from '@/types';
import { X, Sparkles, AlertTriangle, Users, HeartPulse, ShieldAlert, Wrench, Coins, Info } from 'lucide-react';

interface ExplainModalProps {
  problem: PanchayatProblem | null;
  weights: ScoringWeights;
  onClose: () => void;
}

export function ExplainModal({ problem, weights, onClose }: ExplainModalProps) {
  if (!problem) return null;

  const costLakhs = (problem.estimated_cost / 100000).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden glass-panel border border-emerald-500/30 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {problem.id}
                </span>
                <span className="text-xs text-gray-400 font-medium">{problem.panchayat_name}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1 leading-snug">{problem.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Priority Score Banner */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/25 mb-6">
          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">
              Calculated Priority Score
            </div>
            <div className="text-3xl font-extrabold text-white flex items-baseline gap-2">
              <span>{problem.priority_score ?? 'N/A'}</span>
              <span className="text-sm font-normal text-gray-400">/ 100 pts</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Estimated Cost</div>
            <div className="text-lg font-bold text-emerald-300">₹{costLakhs} Lakhs</div>
            <div className="text-xs text-gray-400">{problem.people_affected.toLocaleString('en-IN')} villagers</div>
          </div>
        </div>

        {/* Natural Language Explanation */}
        <div className="mb-6 p-4 rounded-xl bg-slate-900/90 border border-gray-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <Info className="w-4 h-4" /> Explainable Decision Rationale
          </div>
          <p className="text-sm text-gray-200 leading-relaxed font-sans italic">
            "{problem.score_explanation || 'Score calculated based on weighted criteria.'}"
          </p>
        </div>

        {/* Factor Breakdown */}
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Multi-Criteria Factor Scoring Weights
        </h4>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <FactorCard
            icon={<Users className="w-4 h-4 text-blue-400" />}
            label="People Affected"
            value={`${problem.people_affected.toLocaleString('en-IN')} persons`}
            weight={`${Math.round(weights.w_people * 100)}%`}
          />
          <FactorCard
            icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
            label="Emergency Urgency"
            value={`${problem.urgency} / 5`}
            weight={`${Math.round(weights.w_urgency * 100)}%`}
          />
          <FactorCard
            icon={<ShieldAlert className="w-4 h-4 text-rose-400" />}
            label="Safety Hazard"
            value={`${problem.safety_impact} / 5`}
            weight={`${Math.round(weights.w_safety * 100)}%`}
          />
          <FactorCard
            icon={<HeartPulse className="w-4 h-4 text-emerald-400" />}
            label="Health Impact"
            value={`${problem.health_impact} / 5`}
            weight={`${Math.round(weights.w_health * 100)}%`}
          />
          <FactorCard
            icon={<Wrench className="w-4 h-4 text-orange-400" />}
            label="Asset Degradation"
            value={`Rating ${problem.current_condition} / 5`}
            weight={`${Math.round(weights.w_condition * 100)}%`}
          />
          <FactorCard
            icon={<Coins className="w-4 h-4 text-purple-400" />}
            label="Cost Efficiency"
            value={`₹${costLakhs} L`}
            weight={`${Math.round(weights.w_efficiency * 100)}%`}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
}

function FactorCard({
  icon,
  label,
  value,
  weight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  weight: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-gray-800/80">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-slate-800 border border-gray-700">{icon}</div>
        <div>
          <div className="text-xs text-gray-400">{label}</div>
          <div className="text-sm font-semibold text-white">{value}</div>
        </div>
      </div>
      <div className="text-right">
        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
          {weight}
        </span>
      </div>
    </div>
  );
}
