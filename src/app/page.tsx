'use client';

import React, { useState, useMemo } from 'react';
import { MOCK_PROBLEMS, DEFAULT_WEIGHTS, INITIAL_BUDGET } from '@/data/mockProblems';
import { PanchayatProblem, ScoringWeights, UserRole, OptimizationResult } from '@/types';
import { calculatePriorityScores } from '@/lib/scoring';
import { optimizeBudgetKnapsack, runSimulatorStrategies } from '@/lib/knapsack';
import { Navbar, ActiveTabType } from '@/components/Navbar';
import { ScoringEngine } from '@/components/ScoringEngine';
import { BudgetOptimizer } from '@/components/BudgetOptimizer';
import { Simulator } from '@/components/Simulator';
import { ProblemMap } from '@/components/ProblemMap';
import { ImpactDashboard } from '@/components/ImpactDashboard';
import { WorkProgress } from '@/components/WorkProgress';
import { ProblemEntry } from '@/components/ProblemEntry';
import { ExplainModal } from '@/components/ExplainModal';

export default function GramSetuApp() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('scoring');
  const [userRole, setUserRole] = useState<UserRole>('official');
  const [problems, setProblems] = useState<PanchayatProblem[]>(MOCK_PROBLEMS);
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS);
  const [budgetLimit, setBudgetLimit] = useState<number>(INITIAL_BUDGET);
  const [explainProblem, setExplainProblem] = useState<PanchayatProblem | null>(null);

  // Recalculate priority scores dynamically
  const scoredProblems = useMemo(() => {
    return calculatePriorityScores(problems, weights);
  }, [problems, weights]);

  // Recalculate 0/1 Knapsack optimization dynamically
  const optimizationResult = useMemo(() => {
    return optimizeBudgetKnapsack(scoredProblems, budgetLimit, 'Official Allocation Plan', 'DP Optimized');
  }, [scoredProblems, budgetLimit]);

  // Recalculate 3-plan Simulator strategies
  const simulatorStrategies = useMemo(() => {
    return runSimulatorStrategies(problems, budgetLimit);
  }, [problems, budgetLimit]);

  // Handlers
  const handleResetData = () => {
    setProblems(MOCK_PROBLEMS);
    setWeights(DEFAULT_WEIGHTS);
    setBudgetLimit(INITIAL_BUDGET);
  };

  const handleAddProblem = (newProblem: PanchayatProblem) => {
    setProblems((prev) => [newProblem, ...prev]);
  };

  const handleVerifyProblem = (problemId: string, updates: Partial<PanchayatProblem>) => {
    setProblems((prev) =>
      prev.map((p) => (p.id === problemId ? { ...p, ...updates } : p))
    );
  };

  const handleUpdateStatus = (problemId: string, newStatus: PanchayatProblem['status']) => {
    setProblems((prev) =>
      prev.map((p) => (p.id === problemId ? { ...p, status: newStatus } : p))
    );
  };

  const handleApplyPlan = (plan: OptimizationResult) => {
    setActiveTab('optimizer');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        onResetData={handleResetData}
        problemCount={problems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'scoring' && (
          <ScoringEngine
            problems={scoredProblems}
            weights={weights}
            setWeights={setWeights}
            onExplain={(p) => setExplainProblem(p)}
            userRole={userRole}
          />
        )}

        {activeTab === 'optimizer' && (
          <BudgetOptimizer
            budgetLimit={budgetLimit}
            setBudgetLimit={setBudgetLimit}
            result={optimizationResult}
            onExplain={(p) => setExplainProblem(p)}
            userRole={userRole}
          />
        )}

        {activeTab === 'simulator' && (
          <Simulator
            planA={simulatorStrategies.planA}
            planB={simulatorStrategies.planB}
            planC={simulatorStrategies.planC}
            budgetLimit={budgetLimit}
            onApplyPlan={handleApplyPlan}
            onExplain={(p) => setExplainProblem(p)}
          />
        )}

        {activeTab === 'map' && (
          <ProblemMap
            problems={scoredProblems}
            onExplain={(p) => setExplainProblem(p)}
          />
        )}

        {activeTab === 'analytics' && (
          <ImpactDashboard
            problems={scoredProblems}
            optimizationResult={optimizationResult}
          />
        )}

        {activeTab === 'progress' && (
          <WorkProgress
            problems={problems}
            onUpdateStatus={handleUpdateStatus}
            userRole={userRole}
          />
        )}

        {activeTab === 'reporting' && (
          <ProblemEntry
            problems={problems}
            onAddProblem={handleAddProblem}
            onVerifyProblem={handleVerifyProblem}
            userRole={userRole}
          />
        )}
      </main>

      {/* Explainable AI Modal */}
      <ExplainModal
        problem={explainProblem}
        weights={weights}
        onClose={() => setExplainProblem(null)}
      />

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-slate-950 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Gram Setu — Explainable Panchayat Priority Engine & 0/1 Knapsack Optimizer
          </div>
          <div className="font-mono text-[11px] text-gray-600">
            Powered by Next.js, Dynamic Programming & Multi-Criteria Decision Analysis
          </div>
        </div>
      </footer>
    </div>
  );
}
