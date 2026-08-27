'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_PROBLEMS, DEFAULT_WEIGHTS, INITIAL_BUDGET } from '@/data/mockProblems';
import { PanchayatProblem, ScoringWeights, UserRole, UserProfile, OptimizationResult } from '@/types';
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
import { AuthModal } from '@/components/AuthModal';
import { LandingLoginScreen } from '@/components/LandingLoginScreen';
import { fetchSupabaseProblems, insertSupabaseProblem, updateSupabaseProblemStatus, deleteSupabaseProblem } from '@/lib/supabaseClient';

export default function GramSetuApp() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('reporting');
  const [userRole, setUserRole] = useState<UserRole>('citizen');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('citizen');

  const [problems, setProblems] = useState<PanchayatProblem[]>(MOCK_PROBLEMS);
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS);
  const [budgetLimit, setBudgetLimit] = useState<number>(INITIAL_BUDGET);
  const [explainProblem, setExplainProblem] = useState<PanchayatProblem | null>(null);

  // Load live Supabase problems if available on mount
  useEffect(() => {
    async function loadData() {
      const liveProblems = await fetchSupabaseProblems();
      if (liveProblems && liveProblems.length > 0) {
        setProblems(liveProblems);
      }
    }
    loadData();
  }, []);

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

  const handleOpenAuthModal = (defaultRole: UserRole = 'citizen') => {
    setAuthModalRole(defaultRole);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setUserRole(user.role);
    if (user.role === 'official') {
      setActiveTab('progress');
    } else {
      setActiveTab('reporting');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole('citizen');
  };

  const handleAddProblem = async (newProblem: PanchayatProblem) => {
    setProblems((prev) => [newProblem, ...prev]);
    // Sync to Supabase in background
    await insertSupabaseProblem(newProblem);
  };

  const handleVerifyProblem = async (problemId: string, updates: Partial<PanchayatProblem>) => {
    setProblems((prev) =>
      prev.map((p) => (p.id === problemId ? { ...p, ...updates } : p))
    );
    if (updates.status) {
      await updateSupabaseProblemStatus(problemId, updates.status, updates.verified_by);
    }
  };

  const handleUpdateStatus = async (problemId: string, newStatus: PanchayatProblem['status']) => {
    setProblems((prev) =>
      prev.map((p) => (p.id === problemId ? { ...p, status: newStatus } : p))
    );
    await updateSupabaseProblemStatus(problemId, newStatus);
  };

  const handleDeleteProblem = async (problemId: string) => {
    setProblems((prev) => prev.filter((p) => p.id !== problemId));
    await deleteSupabaseProblem(problemId);
  };

  const handleApplyPlan = (plan: OptimizationResult) => {
    setActiveTab('optimizer');
  };

  // If user is not logged in, display full-screen Landing Login Screen
  if (!currentUser) {
    return (
      <LandingLoginScreen
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#041418] text-gray-100 font-sans flex flex-col antialiased selection:bg-teal-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
        onResetData={handleResetData}
        problemCount={problems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'reporting' && (
          <ProblemEntry
            problems={problems}
            onAddProblem={handleAddProblem}
            onVerifyProblem={handleVerifyProblem}
            userRole={userRole}
          />
        )}

        {activeTab === 'progress' && (
          <WorkProgress
            problems={problems}
            onUpdateStatus={handleUpdateStatus}
            onDeleteProblem={handleDeleteProblem}
            userRole={userRole}
          />
        )}

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
      </main>

      {/* Auth Portal Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        defaultRole={authModalRole}
      />

      {/* Explainable AI Modal */}
      <ExplainModal
        problem={explainProblem}
        weights={weights}
        onClose={() => setExplainProblem(null)}
      />

      {/* Footer */}
      <footer className="border-t border-teal-500/20 bg-[#030f13] py-6 text-center text-xs text-teal-200/60">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Gram Setu — Dual Citizen & Official Grievance Engine with Supabase Integration
          </div>
          <div className="font-mono text-[11px] text-teal-300/60">
            Powered by Next.js, PostgreSQL, Supabase Storage & Knapsack DP Solver
          </div>
        </div>
      </footer>
    </div>
  );
}


