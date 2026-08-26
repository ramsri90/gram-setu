'use client';

import React, { useState } from 'react';
import { CategoryType, PanchayatProblem, UserRole } from '@/types';
import {
  PlusCircle,
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Users,
  MapPin,
  Building2,
  Coins,
  Sparkles,
} from 'lucide-react';

interface ProblemEntryProps {
  problems: PanchayatProblem[];
  onAddProblem: (newProblem: PanchayatProblem) => void;
  onVerifyProblem: (problemId: string, updates: Partial<PanchayatProblem>) => void;
  userRole: UserRole;
}

export function ProblemEntry({
  problems,
  onAddProblem,
  onVerifyProblem,
  userRole,
}: ProblemEntryProps) {
  const [activeSubTab, setActiveSubTab] = useState<'report' | 'verify'>('report');

  // Form State
  const [title, setTitle] = useState('');
  const [panchayatName, setPanchayatName] = useState('Rampur Gram Panchayat');
  const [district, setDistrict] = useState('Sehore');
  const [category, setCategory] = useState<CategoryType>('water');
  const [location, setLocation] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(400000);
  const [peopleAffected, setPeopleAffected] = useState(1500);
  const [urgency, setUrgency] = useState(4);
  const [reportedBy, setReportedBy] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !reportedBy) return;

    const newProblem: PanchayatProblem = {
      id: `PRB-${Math.floor(100 + Math.random() * 900)}`,
      panchayat_id: 'GP-NEW-09',
      panchayat_name: panchayatName,
      district,
      title,
      category,
      location,
      estimated_cost: Number(estimatedCost),
      people_affected: Number(peopleAffected),
      urgency: Number(urgency),
      safety_impact: Math.min(5, Number(urgency) + 1),
      health_impact: category === 'water' || category === 'sanitation' || category === 'health' ? 4 : 2,
      current_condition: 2,
      status: 'reported',
      reported_by: reportedBy,
      reported_date: new Date().toISOString().split('T')[0],
      photo_url: photoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&auto=format&fit=crop&q=80',
    };

    onAddProblem(newProblem);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 4000);

    // Reset Form
    setTitle('');
    setLocation('');
    setReportedBy('');
  };

  const unverifiedProblems = problems.filter((p) => p.status === 'reported');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Role Navigation Toggle */}
      <div className="flex items-center justify-between p-2 rounded-2xl glass-panel border border-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('report')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'report'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Citizen Report Form</span>
          </button>

          <button
            onClick={() => setActiveSubTab('verify')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'verify'
                ? 'bg-teal-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Field Staff Verification ({unverifiedProblems.length})</span>
          </button>
        </div>

        <span className="text-xs text-gray-400 px-3 py-1 font-mono hidden sm:inline-block">
          Active Role: <strong className="text-emerald-400 uppercase">{userRole}</strong>
        </span>
      </div>

      {/* Citizen Report Form */}
      {activeSubTab === 'report' && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-gray-800 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <PlusCircle className="w-4 h-4" /> Public Infrastructure Issue Entry
            </div>
            <h2 className="text-2xl font-extrabold text-white">Report a Village Problem</h2>
            <p className="text-sm text-gray-400 mt-1">
              Citizens and village leaders can submit critical issues for priority scoring and budget optimization.
            </p>
          </div>

          {isSubmitted && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-bold text-sm">Issue Successfully Logged!</div>
                <div className="text-xs text-emerald-200">
                  Your report has been queued for Field Staff verification and MCDA priority scoring.
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Gram Panchayat</label>
                <input
                  type="text"
                  value={panchayatName}
                  onChange={(e) => setPanchayatName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-gray-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-gray-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Problem Title</label>
              <input
                type="text"
                placeholder="e.g. Broken Handpump & Water Contamination near Anganwadi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-gray-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-gray-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="water">Drinking Water</option>
                  <option value="road">Road & Bridge</option>
                  <option value="health">Health & Sub-Centre</option>
                  <option value="sanitation">Sanitation & Drainage</option>
                  <option value="electricity">Electricity & Streetlights</option>
                  <option value="education">School Infrastructure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Specific Location</label>
                <input
                  type="text"
                  placeholder="e.g. Ward 3, High School Road"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-gray-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Estimated Repair Cost (₹)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-gray-800 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
                  required
                />
                <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
                  = ₹{(estimatedCost / 100000).toFixed(1)} Lakhs
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Villagers Affected (Count)
                </label>
                <input
                  type="number"
                  value={peopleAffected}
                  onChange={(e) => setPeopleAffected(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-gray-800 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Estimated Urgency: <span className="text-amber-400 font-bold">{urgency} / 5</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={urgency}
                  onChange={(e) => setUrgency(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Reported By (Name / Designation)</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar (School Teacher)"
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-gray-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Site Photo Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-gray-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950 transition"
            >
              Submit Issue for Priority Scoring
            </button>
          </form>
        </div>
      )}

      {/* Field Staff Verification */}
      {activeSubTab === 'verify' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-6 border border-teal-500/20">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              Field Auditor Verification Portal
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Field Officers inspect submitted issues, verify asset condition, safety impact ratings, and approve for inclusion in the Knapsack DP solver.
            </p>
          </div>

          <div className="space-y-3">
            {unverifiedProblems.map((problem) => (
              <VerificationCard
                key={problem.id}
                problem={problem}
                onVerify={(updates) => onVerifyProblem(problem.id, updates)}
              />
            ))}

            {unverifiedProblems.length === 0 && (
              <div className="glass-panel p-12 text-center rounded-2xl text-gray-400 border border-gray-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <div className="text-white font-bold text-base">All Reported Issues Verified!</div>
                <div className="text-xs text-gray-400 mt-1">
                  Every submitted village project has been audited and included in the Knapsack optimizer pool.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function VerificationCard({
  problem,
  onVerify,
}: {
  problem: PanchayatProblem;
  onVerify: (updates: Partial<PanchayatProblem>) => void;
}) {
  const [safety, setSafety] = useState(problem.safety_impact || 4);
  const [health, setHealth] = useState(problem.health_impact || 4);
  const [condition, setCondition] = useState(problem.current_condition || 2);

  const handleApprove = () => {
    onVerify({
      status: 'verified',
      safety_impact: safety,
      health_impact: health,
      current_condition: condition,
      verified_by: 'Er. Anil Verma (Block Officer)',
    });
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-teal-500/30 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
            {problem.id} • PENDING AUDIT
          </span>
          <h4 className="text-base font-bold text-white mt-1">{problem.title}</h4>
          <p className="text-xs text-gray-400">{problem.panchayat_name} — {problem.location}</p>
        </div>

        <div className="text-right font-mono">
          <div className="text-sm font-bold text-emerald-400">₹{(problem.estimated_cost / 100000).toFixed(1)} L</div>
          <div className="text-xs text-gray-400">{problem.people_affected.toLocaleString('en-IN')} villagers</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/60 border border-gray-800 text-xs">
        <div>
          <label className="text-gray-400 block mb-1">Safety Risk Tag (1-5):</label>
          <select
            value={safety}
            onChange={(e) => setSafety(Number(e.target.value))}
            className="w-full bg-slate-900 border border-gray-700 rounded p-1 text-white font-bold"
          >
            <option value={1}>1 - Minimal</option>
            <option value={2}>2 - Minor</option>
            <option value={3}>3 - Moderate</option>
            <option value={4}>4 - High Risk</option>
            <option value={5}>5 - Critical Hazard</option>
          </select>
        </div>

        <div>
          <label className="text-gray-400 block mb-1">Health Impact (1-5):</label>
          <select
            value={health}
            onChange={(e) => setHealth(Number(e.target.value))}
            className="w-full bg-slate-900 border border-gray-700 rounded p-1 text-white font-bold"
          >
            <option value={1}>1 - Low</option>
            <option value={2}>2 - Mild</option>
            <option value={3}>3 - Moderate</option>
            <option value={4}>4 - High Threat</option>
            <option value={5}>5 - Epidemic Risk</option>
          </select>
        </div>

        <div>
          <label className="text-gray-400 block mb-1">Asset Condition (1-5):</label>
          <select
            value={condition}
            onChange={(e) => setCondition(Number(e.target.value))}
            className="w-full bg-slate-900 border border-gray-700 rounded p-1 text-white font-bold"
          >
            <option value={1}>1 - Completely Broken</option>
            <option value={2}>2 - Severely Degraded</option>
            <option value={3}>3 - Moderate Wear</option>
            <option value={4}>4 - Minor Flaws</option>
            <option value={5}>5 - Operational</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          onClick={handleApprove}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow transition"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Approve & Lock Audit Ratings</span>
        </button>
      </div>
    </div>
  );
}
