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
  BookmarkCheck,
  Activity,
  Image as ImageIcon,
  ExternalLink,
  Eye,
} from 'lucide-react';

interface WorkProgressProps {
  problems: PanchayatProblem[];
  onUpdateStatus: (problemId: string, newStatus: PanchayatProblem['status']) => void;
  onDeleteProblem: (problemId: string) => void;
  userRole: UserRole;
}

export function WorkProgress({ problems, onUpdateStatus, onDeleteProblem, userRole }: WorkProgressProps) {
  const [filterStage, setFilterStage] = useState<string>('all');
  const [modalImage, setModalImage] = useState<string | null>(null);

  const stageCount = {
    reported: problems.filter((p) => p.status === 'reported').length,
    noted: problems.filter((p) => p.status === 'noted' || p.status === 'verified').length,
    in_progress: problems.filter((p) => p.status === 'in_progress' || p.status === 'funded').length,
    completed: problems.filter((p) => p.status === 'completed').length,
  };

  const filteredProblems = problems.filter((p) => {
    if (filterStage === 'all') return true;
    if (filterStage === 'reported') return p.status === 'reported';
    if (filterStage === 'noted') return p.status === 'noted' || p.status === 'verified';
    if (filterStage === 'in_progress') return p.status === 'in_progress' || p.status === 'funded';
    if (filterStage === 'completed') return p.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-teal-500/30 bg-gradient-to-r from-[#041418] via-[#06262d] to-[#07353f]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-wider mb-1">
              <HardHat className="w-4 h-4 text-amber-400" /> Gram Panchayat Grievance & Execution Tracker
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Official Grievance Portal & Work Progress
            </h2>
            <p className="text-xs text-teal-100/70 mt-1 max-w-2xl">
              Officials can review citizen-submitted complaints, view uploaded site images, mark status as <strong>Noted</strong> or <strong>Work In Progress</strong>, and delete resolved/invalid issues.
            </p>
          </div>

          {/* Stage Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterStage('all')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                filterStage === 'all'
                  ? 'bg-teal-600 text-white border-teal-400'
                  : 'bg-[#061e23] text-teal-200/70 border-teal-500/20 hover:text-white'
              }`}
            >
              All ({problems.length})
            </button>
            <button
              onClick={() => setFilterStage('reported')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                filterStage === 'reported'
                  ? 'bg-cyan-600 text-white border-cyan-400'
                  : 'bg-[#061e23] text-cyan-200/70 border-cyan-500/20 hover:text-white'
              }`}
            >
              Reported ({stageCount.reported})
            </button>
            <button
              onClick={() => setFilterStage('noted')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                filterStage === 'noted'
                  ? 'bg-amber-600 text-white border-amber-400'
                  : 'bg-[#061e23] text-amber-200/70 border-amber-500/20 hover:text-white'
              }`}
            >
              Noted ({stageCount.noted})
            </button>
            <button
              onClick={() => setFilterStage('in_progress')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                filterStage === 'in_progress'
                  ? 'bg-teal-600 text-white border-teal-400'
                  : 'bg-[#061e23] text-teal-200/70 border-teal-500/20 hover:text-white'
              }`}
            >
              In Progress ({stageCount.in_progress})
            </button>
            <button
              onClick={() => setFilterStage('completed')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                filterStage === 'completed'
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-[#061e23] text-emerald-200/70 border-emerald-500/20 hover:text-white'
              }`}
            >
              Completed ({stageCount.completed})
            </button>
          </div>
        </div>
      </div>

      {/* Execution Tracker List */}
      <div className="space-y-4">
        {filteredProblems.map((problem) => (
          <ProgressCard
            key={problem.id}
            problem={problem}
            onUpdateStatus={onUpdateStatus}
            onDeleteProblem={onDeleteProblem}
            userRole={userRole}
            onViewImage={(url) => setModalImage(url)}
          />
        ))}

        {filteredProblems.length === 0 && (
          <div className="glass-panel p-12 text-center rounded-3xl text-teal-200/70 border border-teal-500/20">
            No complaints found under the selected status filter.
          </div>
        )}
      </div>

      {/* Full Image Modal View */}
      {modalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl glass-panel border border-teal-500/40 p-2">
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/80 text-white hover:bg-rose-600 transition"
            >
              ✕
            </button>
            <img
              src={modalImage}
              alt="Full size problem photo"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressCard({
  problem,
  onUpdateStatus,
  onDeleteProblem,
  userRole,
  onViewImage,
}: {
  problem: PanchayatProblem;
  onUpdateStatus: (id: string, status: PanchayatProblem['status']) => void;
  onDeleteProblem: (id: string) => void;
  userRole: UserRole;
  onViewImage: (url: string) => void;
}) {
  const costLakhs = (problem.estimated_cost / 100000).toFixed(1);

  let currentStep = 1;
  if (problem.status === 'noted' || problem.status === 'verified' || problem.status === 'scored') currentStep = 2;
  if (problem.status === 'funded' || problem.status === 'in_progress') currentStep = 3;
  if (problem.status === 'completed') currentStep = 4;

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-teal-500/25 space-y-4 hover:border-teal-400/40 transition">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        {/* Left Side: Thumbnail & Issue Info */}
        <div className="flex items-start gap-4">
          {problem.photo_url ? (
            <div
              onClick={() => onViewImage(problem.photo_url!)}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-teal-500/30 flex-shrink-0 cursor-pointer group shadow-lg"
            >
              <img
                src={problem.photo_url}
                alt={problem.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-teal-950/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#061e23] border border-teal-500/20 flex flex-col items-center justify-center text-teal-400/50 flex-shrink-0">
              <ImageIcon className="w-8 h-8 mb-1" />
              <span className="text-[10px]">No Photo</span>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/30">
                {problem.id}
              </span>
              <span className="text-xs font-bold text-teal-200/80">{problem.panchayat_name}</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 uppercase font-mono">
                {problem.category}
              </span>
            </div>

            <h4 className="text-lg font-black text-white">{problem.title}</h4>
            <p className="text-xs text-teal-100/70 flex items-center gap-1">
              <span>Location:</span> <strong>{problem.location}</strong>
            </p>
            <div className="text-[11px] text-teal-200/60 pt-1">
              Reported by: <span className="text-white font-medium">{problem.reported_by}</span> on {problem.reported_date}
            </div>
          </div>
        </div>

        {/* Right Side: Cost & Beneficiaries */}
        <div className="text-left md:text-right font-mono flex-shrink-0">
          <div className="text-lg font-black text-teal-300">₹{costLakhs} Lakhs</div>
          <div className="text-xs text-teal-200/70">{problem.people_affected.toLocaleString('en-IN')} villagers affected</div>
          <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#061e23] text-xs font-semibold text-amber-300 border border-amber-500/30">
            Urgency: {problem.urgency}/5
          </div>
        </div>
      </div>

      {/* Progress Milestone Bar */}
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-teal-500/15">
        <MilestoneStep step={1} title="Reported" active={currentStep >= 1} done={currentStep > 1} />
        <MilestoneStep step={2} title="Noted / Verified" active={currentStep >= 2} done={currentStep > 2} />
        <MilestoneStep step={3} title="Work in Progress" active={currentStep >= 3} done={currentStep > 3} />
        <MilestoneStep step={4} title="Completed" active={currentStep >= 4} done={currentStep === 4} />
      </div>

      {/* Official Master Admin Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-teal-500/15 text-xs">
        <div className="flex items-center gap-2 text-teal-200/70">
          <span>Current Status:</span>
          <span className="font-bold text-white uppercase font-mono px-2 py-0.5 rounded bg-teal-950 border border-teal-500/30">
            {problem.status.replace('_', ' ')}
          </span>
        </div>

        {/* Official Quick Action Controls */}
        {userRole !== 'citizen' && (
          <div className="flex flex-wrap items-center gap-2">
            {problem.status !== 'noted' && problem.status !== 'in_progress' && problem.status !== 'completed' && (
              <button
                onClick={() => onUpdateStatus(problem.id, 'noted')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold transition shadow-md shadow-amber-950"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>Mark as Noted</span>
              </button>
            )}

            {problem.status !== 'in_progress' && problem.status !== 'completed' && (
              <button
                onClick={() => onUpdateStatus(problem.id, 'in_progress')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-bold transition shadow-md shadow-teal-950"
              >
                <Activity className="w-4 h-4" />
                <span>Work in Progress</span>
              </button>
            )}

            {problem.status !== 'completed' && (
              <button
                onClick={() => onUpdateStatus(problem.id, 'completed')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white font-bold transition shadow-md shadow-emerald-950"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Resolved</span>
              </button>
            )}

            {/* Official Delete Issue Button */}
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete issue "${problem.title}"?`)) {
                  onDeleteProblem(problem.id);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/90 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold transition shadow-md"
              title="Delete this complaint from official database"
            >
              <span>Delete Issue</span>
            </button>
          </div>
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
            ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
            : active
            ? 'bg-amber-400 text-slate-950 animate-pulse font-extrabold'
            : 'bg-[#061e23] text-teal-400/50 border border-teal-500/20'
        }`}
      >
        {done ? '✓' : step}
      </div>
      <span className={`text-[11px] font-medium text-center ${active ? 'text-white font-bold' : 'text-teal-200/50'}`}>
        {title}
      </span>
    </div>
  );
}

