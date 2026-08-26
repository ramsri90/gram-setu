'use client';

import React, { useState } from 'react';
import { PanchayatProblem, UserRole } from '@/types';
import {
  CheckCircle2,
  Clock,
  HardHat,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';

interface WorkProgressProps {
  problems: PanchayatProblem[];
  onUpdateStatus: (problemId: string, newStatus: PanchayatProblem['status']) => void;
  userRole: UserRole;
}

export function WorkProgress({ problems, onUpdateStatus, userRole }: WorkProgressProps) {
  const [filterStage, setFilterStage] = useState<string>('all');

  const fundedProblems = problems.filter((p) => p.status !== 'reported');

  const stageCount = {
    verified: problems.filter((p) => p.status === 'verified' || p.status === 'scored').length,
    funded: problems.filter((p) => p.status === 'funded').length,
    in_progress: problems.filter((p) => p.status === 'in_progress').length,
    completed: problems.filter((p) => p.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <HardHat className="w-4 h-4" /> Village Development Action Plan
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Work Progress & Execution Tracker
            </h2>
            <p className="text-sm text-gray-300 mt-1 max-w-2xl">
              Track approved Panchayat development projects through procurement, field execution, and post-completion audit verification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StagePill label="Verified" count={stageCount.verified} color="bg-blue-500/20 text-blue-300" />
            <StagePill label="Funded" count={stageCount.funded} color="bg-purple-500/20 text-purple-300" />
            <StagePill label="In Progress" count={stageCount.in_progress} color="bg-amber-500/20 text-amber-300" />
            <StagePill label="Completed" count={stageCount.completed} color="bg-emerald-500/20 text-emerald-300" />
          </div>
        </div>
      </div>

      {/* Execution Tracker List */}
      <div className="space-y-4">
        {fundedProblems.map((problem) => (
          <ProgressCard
            key={problem.id}
            problem={problem}
            onUpdateStatus={onUpdateStatus}
            userRole={userRole}
          />
        ))}

        {fundedProblems.length === 0 && (
          <div className="glass-panel p-12 text-center rounded-2xl text-gray-400">
            No active development projects currently in execution.
          </div>
        )}
      </div>
    </div>
  );
}

function StagePill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={`px-3 py-1.5 rounded-xl border border-gray-800 flex items-center gap-1.5 text-xs font-bold ${color}`}>
      <span>{label}:</span>
      <span className="font-mono">{count}</span>
    </div>
  );
}

function ProgressCard({
  problem,
  onUpdateStatus,
  userRole,
}: {
  problem: PanchayatProblem;
  onUpdateStatus: (id: string, status: PanchayatProblem['status']) => void;
  userRole: UserRole;
}) {
  const costLakhs = (problem.estimated_cost / 100000).toFixed(1);

  let currentStep = 1;
  if (problem.status === 'funded') currentStep = 2;
  if (problem.status === 'in_progress') currentStep = 3;
  if (problem.status === 'completed') currentStep = 4;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-gray-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-gray-300">
              {problem.id}
            </span>
            <span className="text-xs text-gray-400">{problem.panchayat_name}</span>
          </div>
          <h4 className="text-base font-bold text-white mt-1">{problem.title}</h4>
        </div>

        <div className="text-right font-mono flex-shrink-0">
          <div className="text-sm font-bold text-emerald-400">₹{costLakhs} Lakhs</div>
          <div className="text-xs text-gray-400">{problem.people_affected.toLocaleString('en-IN')} benefited</div>
        </div>
      </div>

      {/* Progress Milestone Bar */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-800/80">
        <MilestoneStep step={1} title="Verified" active={currentStep >= 1} done={currentStep > 1} />
        <MilestoneStep step={2} title="Funded" active={currentStep >= 2} done={currentStep > 2} />
        <MilestoneStep step={3} title="In Execution" active={currentStep >= 3} done={currentStep > 3} />
        <MilestoneStep step={4} title="Completed" active={currentStep >= 4} done={currentStep === 4} />
      </div>

      {/* Next Milestone Action */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <span className="text-gray-400 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          Logged on: {problem.reported_date}
        </span>

        {userRole !== 'citizen' && problem.status !== 'completed' && (
          <button
            onClick={() => {
              if (problem.status === 'verified' || problem.status === 'scored') onUpdateStatus(problem.id, 'funded');
              else if (problem.status === 'funded') onUpdateStatus(problem.id, 'in_progress');
              else if (problem.status === 'in_progress') onUpdateStatus(problem.id, 'completed');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
          >
            <span>Advance to Next Phase</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function MilestoneStep({
  step,
  title,
  active,
  done,
}: {
  step: number;
  title: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex flex-col items-center space-y-1">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
          done
            ? 'bg-emerald-500 text-white'
            : active
            ? 'bg-amber-500 text-white animate-pulse'
            : 'bg-slate-800 text-gray-500 border border-gray-700'
        }`}
      >
        {done ? '✓' : step}
      </div>
      <span className={`text-[11px] font-medium text-center ${active ? 'text-white' : 'text-gray-500'}`}>
        {title}
      </span>
    </div>
  );
}
