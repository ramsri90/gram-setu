'use client';

import React, { useState } from 'react';
import { PanchayatProblem } from '@/types';
import {
  MapPin,
  Filter,
  Users,
  AlertTriangle,
  Coins,
  Sparkles,
  Layers,
  CheckCircle2,
  XCircle,
  Droplets,
  Construction,
  Zap,
  Trash2,
  Stethoscope,
  GraduationCap,
} from 'lucide-react';

interface ProblemMapProps {
  problems: PanchayatProblem[];
  onExplain: (problem: PanchayatProblem) => void;
}

// Synthetic ward coordinates for village GIS map grid
const WARD_COORDINATES: Record<string, { top: number; left: number }> = {
  'PRB-001': { top: 25, left: 30 },
  'PRB-002': { top: 38, left: 45 },
  'PRB-003': { top: 60, left: 20 },
  'PRB-004': { top: 72, left: 35 },
  'PRB-005': { top: 30, left: 70 },
  'PRB-006': { top: 20, left: 80 },
  'PRB-007': { top: 50, left: 65 },
  'PRB-008': { top: 65, left: 75 },
  'PRB-009': { top: 80, left: 60 },
  'PRB-010': { top: 85, left: 80 },
  'PRB-011': { top: 15, left: 45 },
  'PRB-012': { top: 40, left: 25 },
  'PRB-013': { top: 45, left: 85 },
  'PRB-014': { top: 55, left: 50 },
  'PRB-015': { top: 70, left: 15 },
  'PRB-016': { top: 32, left: 58 },
  'PRB-017': { top: 90, left: 40 },
  'PRB-018': { top: 22, left: 15 },
  'PRB-019': { top: 50, left: 38 },
  'PRB-020': { top: 62, left: 82 },
};

export function ProblemMap({ problems, onExplain }: ProblemMapProps) {
  const [selectedProblem, setSelectedProblem] = useState<PanchayatProblem | null>(
    problems[0] || null
  );
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<number>(0);

  const filteredProblems = problems.filter((p) => {
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const matchesUrgency = filterUrgency === 0 || p.urgency >= filterUrgency;
    return matchesCategory && matchesUrgency;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4" /> GIS Geo-Spatial Problem Map
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Panchayat Infrastructure Geo-Map
            </h2>
            <p className="text-sm text-gray-300 mt-1 max-w-2xl">
              Visualizes reported village issues across Panchayat wards. Click pins to inspect priority scores, hazard urgency, and affected residents.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-gray-800 text-xs font-semibold text-gray-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="water">Drinking Water</option>
              <option value="road">Roads & Bridges</option>
              <option value="health">Health Facilities</option>
              <option value="sanitation">Sanitation & Drainage</option>
              <option value="electricity">Power & Streetlights</option>
              <option value="education">School Facilities</option>
            </select>

            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-gray-800 text-xs font-semibold text-gray-200 focus:outline-none"
            >
              <option value={0}>All Urgency Levels</option>
              <option value={4}>Urgency 4+ (High & Critical)</option>
              <option value={5}>Urgency 5 Only (Emergency)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Map View & Inspection Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Visual (2 Columns) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-gray-800 p-4 relative min-h-[460px] bg-slate-950 flex flex-col justify-between overflow-hidden">
          {/* Top Map Toolbar Overlay */}
          <div className="flex items-center justify-between z-10 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-gray-800 text-xs">
            <div className="flex items-center gap-2 text-gray-300 font-semibold">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Gram Panchayat Ward Boundary Map</span>
            </div>
            <span className="text-gray-400 font-mono text-[11px]">
              Showing {filteredProblems.length} Map Markers
            </span>
          </div>

          {/* Simulated GIS Topo Map Container */}
          <div className="absolute inset-0 top-12 bottom-4 left-4 right-4 rounded-xl border border-gray-800/80 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden">
            {/* Topo lines SVG background */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0 100 Q 200 150 400 80 T 800 120 T 1200 60" fill="none" stroke="#10b981" strokeWidth="2" />
              <path d="M 0 250 Q 300 200 600 300 T 1200 220" fill="none" stroke="#3b82f6" strokeWidth="2" />
              <path d="M 0 380 Q 250 420 500 350 T 1000 400" fill="none" stroke="#f59e0b" strokeWidth="2" />
            </svg>

            {/* Render Map Pin Markers */}
            {filteredProblems.map((problem) => {
              const coords = WARD_COORDINATES[problem.id] || {
                top: 20 + (parseInt(problem.id.replace('PRB-', ''), 10) * 17) % 65,
                left: 15 + (parseInt(problem.id.replace('PRB-', ''), 10) * 23) % 70,
              };

              const isSelected = selectedProblem?.id === problem.id;
              const isCritical = problem.urgency >= 4;

              return (
                <button
                  key={problem.id}
                  onClick={() => setSelectedProblem(problem)}
                  style={{ top: `${coords.top}%`, left: `${coords.left}%` }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 z-20 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                >
                  <div
                    className={`relative flex items-center justify-center p-2 rounded-full shadow-lg border ${
                      isCritical
                        ? 'bg-rose-950 text-rose-400 border-rose-500 shadow-rose-950/50'
                        : 'bg-emerald-950 text-emerald-400 border-emerald-500 shadow-emerald-950/50'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    {isCritical && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                    )}
                  </div>

                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-40 whitespace-nowrap bg-slate-900 border border-gray-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xl pointer-events-none">
                    {problem.title} (Score: {problem.priority_score})
                  </div>
                </button>
              );
            })}
          </div>

          {/* Map Legend */}
          <div className="z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-gray-800 flex items-center justify-between text-xs text-gray-400 mt-auto">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-300" /> Critical Hazard (Urgency 4-5)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300" /> Standard Need (Urgency 1-3)
              </span>
            </div>
            <span className="font-mono text-[11px]">Click pin to inspect</span>
          </div>
        </div>

        {/* Selected Problem Detail Card (1 Column) */}
        <div className="space-y-4">
          {selectedProblem ? (
            <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30 space-y-4 bg-slate-900/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {selectedProblem.id}
                </span>
                <span className="text-xs font-bold font-mono text-emerald-400">
                  Score: {selectedProblem.priority_score} / 100
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white leading-snug">{selectedProblem.title}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedProblem.panchayat_name} — {selectedProblem.location}
                </p>
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-gray-800 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Villagers Affected:</span>
                  <span className="font-bold text-white">{selectedProblem.people_affected.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Estimated Cost:</span>
                  <span className="font-bold text-emerald-400">₹{(selectedProblem.estimated_cost / 100000).toFixed(1)} Lakhs</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Urgency Level:</span>
                  <span className="font-bold text-amber-400">{selectedProblem.urgency} / 5</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Safety Risk:</span>
                  <span className="font-bold text-rose-400">{selectedProblem.safety_impact} / 5</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-gray-800 text-xs italic text-gray-300">
                "{selectedProblem.score_explanation || 'Priority score computed via multi-factor MCDA formula.'}"
              </div>

              <button
                onClick={() => onExplain(selectedProblem)}
                className="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explain Score Rationale</span>
              </button>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 text-center text-gray-400 text-sm border border-gray-800">
              Select a marker on the map to inspect project details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
