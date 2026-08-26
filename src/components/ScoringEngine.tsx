'use client';

import React, { useState } from 'react';
import { PanchayatProblem, ScoringWeights, UserRole } from '@/types';
import { DEFAULT_WEIGHTS } from '@/data/mockProblems';
import {
  Sliders,
  Sparkles,
  Search,
  Filter,
  Users,
  AlertTriangle,
  HeartPulse,
  ShieldAlert,
  Wrench,
  Coins,
  ChevronRight,
  Info,
  Droplets,
  Construction,
  Zap,
  Trash2,
  Stethoscope,
  GraduationCap,
} from 'lucide-react';

interface ScoringEngineProps {
  problems: PanchayatProblem[];
  weights: ScoringWeights;
  setWeights: (w: ScoringWeights) => void;
  onExplain: (problem: PanchayatProblem) => void;
  userRole: UserRole;
}

export function ScoringEngine({
  problems,
  weights,
  setWeights,
  onExplain,
  userRole,
}: ScoringEngineProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.panchayat_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProblems = [...filteredProblems].sort(
    (a, b) => (b.priority_score || 0) - (a.priority_score || 0)
  );

  const applyPreset = (preset: 'default' | 'safety' | 'reach' | 'efficiency') => {
    switch (preset) {
      case 'default':
        setWeights(DEFAULT_WEIGHTS);
        break;
      case 'safety':
        setWeights({
          w_people: 0.10,
          w_urgency: 0.35,
          w_safety: 0.25,
          w_health: 0.20,
          w_condition: 0.05,
          w_efficiency: 0.05,
        });
        break;
      case 'reach':
        setWeights({
          w_people: 0.50,
          w_urgency: 0.10,
          w_safety: 0.10,
          w_health: 0.10,
          w_condition: 0.10,
          w_efficiency: 0.10,
        });
        break;
      case 'efficiency':
        setWeights({
          w_people: 0.15,
          w_urgency: 0.15,
          w_safety: 0.15,
          w_health: 0.15,
          w_condition: 0.20,
          w_efficiency: 0.20,
        });
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <Sliders className="w-4 h-4" /> Priority Scoring Engine (MCDA)
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Multi-Criteria Weight Optimization
            </h2>
            <p className="text-sm text-gray-300 mt-1 max-w-2xl">
              Gram Setu normalizes and combines 6 weighted parameters into a transparent priority score (0–100). Adjust sliders to see live recalculation.
            </p>
          </div>

          {/* Preset buttons */}
          <div className="flex flex-wrap gap-2">
            <PresetButton label="Govt Standard" onClick={() => applyPreset('default')} />
            <PresetButton label="🚨 Safety & Hazards" onClick={() => applyPreset('safety')} />
            <PresetButton label="👥 Maximum Population" onClick={() => applyPreset('reach')} />
            <PresetButton label="💡 Cost-Efficient" onClick={() => applyPreset('efficiency')} />
          </div>
        </div>

        {/* Live Weight Sliders Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800">
          <WeightSlider
            icon={<Users className="w-4 h-4 text-blue-400" />}
            label="People Affected"
            value={weights.w_people}
            onChange={(val) => setWeights({ ...weights, w_people: val })}
          />
          <WeightSlider
            icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
            label="Emergency Urgency"
            value={weights.w_urgency}
            onChange={(val) => setWeights({ ...weights, w_urgency: val })}
          />
          <WeightSlider
            icon={<ShieldAlert className="w-4 h-4 text-rose-400" />}
            label="Safety Impact"
            value={weights.w_safety}
            onChange={(val) => setWeights({ ...weights, w_safety: val })}
          />
          <WeightSlider
            icon={<HeartPulse className="w-4 h-4 text-emerald-400" />}
            label="Health & Sanitation Impact"
            value={weights.w_health}
            onChange={(val) => setWeights({ ...weights, w_health: val })}
          />
          <WeightSlider
            icon={<Wrench className="w-4 h-4 text-orange-400" />}
            label="Asset Condition Severity"
            value={weights.w_condition}
            onChange={(val) => setWeights({ ...weights, w_condition: val })}
          />
          <WeightSlider
            icon={<Coins className="w-4 h-4 text-purple-400" />}
            label="Cost-to-Impact Ratio"
            value={weights.w_efficiency}
            onChange={(val) => setWeights({ ...weights, w_efficiency: val })}
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search village, title, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-gray-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
          <CategoryFilter active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} label="All" />
          <CategoryFilter active={selectedCategory === 'water'} onClick={() => setSelectedCategory('water')} label="Water" />
          <CategoryFilter active={selectedCategory === 'road'} onClick={() => setSelectedCategory('road')} label="Roads" />
          <CategoryFilter active={selectedCategory === 'health'} onClick={() => setSelectedCategory('health')} label="Health" />
          <CategoryFilter active={selectedCategory === 'sanitation'} onClick={() => setSelectedCategory('sanitation')} label="Sanitation" />
          <CategoryFilter active={selectedCategory === 'electricity'} onClick={() => setSelectedCategory('electricity')} label="Power" />
          <CategoryFilter active={selectedCategory === 'education'} onClick={() => setSelectedCategory('education')} label="Education" />
        </div>
      </div>

      {/* Ranked Problems List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400 px-1 font-semibold uppercase tracking-wider">
          <span>Ranked Village Projects ({sortedProblems.length})</span>
          <span>Priority Score (0–100)</span>
        </div>

        {sortedProblems.map((problem, index) => (
          <ProblemRow
            key={problem.id}
            rank={index + 1}
            problem={problem}
            onExplain={() => onExplain(problem)}
          />
        ))}

        {sortedProblems.length === 0 && (
          <div className="text-center py-12 glass-panel rounded-2xl border border-gray-800 text-gray-400">
            No projects matched your search filter.
          </div>
        )}
      </div>
    </div>
  );
}

function PresetButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-emerald-900/40 border border-gray-700 hover:border-emerald-500/50 text-xs font-semibold text-gray-200 hover:text-white transition"
    >
      {label}
    </button>
  );
}

function WeightSlider({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="p-3 rounded-xl bg-slate-950/60 border border-gray-800/80 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-gray-300">
          {icon}
          {label}
        </span>
        <span className="font-mono font-bold text-emerald-400">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
      />
    </div>
  );
}

function CategoryFilter({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
        active
          ? 'bg-emerald-600 text-white shadow'
          : 'bg-slate-900 text-gray-400 hover:text-white border border-gray-800'
      }`}
    >
      {label}
    </button>
  );
}

function ProblemRow({
  rank,
  problem,
  onExplain,
}: {
  rank: number;
  problem: PanchayatProblem;
  onExplain: () => void;
}) {
  const score = problem.priority_score ?? 0;
  const costLakhs = (problem.estimated_cost / 100000).toFixed(1);

  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-800">
      {/* Left Details */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-lg font-mono font-bold text-sm flex-shrink-0 ${
            rank <= 3
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-800 text-gray-400 border border-gray-700'
          }`}
        >
          #{rank}
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={problem.category} />
            <span className="text-xs text-gray-400 font-medium">{problem.panchayat_name}</span>
            <span className="text-xs text-gray-500">• {problem.location}</span>
          </div>

          <h3 className="text-base font-bold text-white leading-snug truncate">{problem.title}</h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 pt-0.5">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              {problem.people_affected.toLocaleString('en-IN')} affected
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-purple-400" />
              Est. ₹{costLakhs} Lakhs
            </span>
            <span>•</span>
            <span className="text-amber-400">Urgency: {problem.urgency}/5</span>
          </div>
        </div>
      </div>

      {/* Right Score & Explain Action */}
      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-800">
        <div className="text-left sm:text-right">
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
            {score}
            <span className="text-xs font-normal text-gray-400">/100</span>
          </div>
          <div className="w-24 sm:w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
        </div>

        <button
          onClick={onExplain}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Why this score?</span>
        </button>
      </div>
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  let bg = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  let icon = <Droplets className="w-3 h-3" />;
  let label = category;

  switch (category) {
    case 'water':
      bg = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      icon = <Droplets className="w-3 h-3" />;
      label = 'Water';
      break;
    case 'road':
      bg = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      icon = <Construction className="w-3 h-3" />;
      label = 'Road';
      break;
    case 'electricity':
      bg = 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
      icon = <Zap className="w-3 h-3" />;
      label = 'Power';
      break;
    case 'sanitation':
      bg = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      icon = <Trash2 className="w-3 h-3" />;
      label = 'Sanitation';
      break;
    case 'health':
      bg = 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      icon = <Stethoscope className="w-3 h-3" />;
      label = 'Health';
      break;
    case 'education':
      bg = 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      icon = <GraduationCap className="w-3 h-3" />;
      label = 'Education';
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${bg}`}>
      {icon}
      {label}
    </span>
  );
}
