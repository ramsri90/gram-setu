export type CategoryType = 'water' | 'road' | 'electricity' | 'sanitation' | 'health' | 'education';

export type ProblemStatus = 'reported' | 'noted' | 'verified' | 'scored' | 'funded' | 'in_progress' | 'completed';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  panchayat_name?: string;
  created_at?: string;
}

export interface PanchayatProblem {
  id: string;
  panchayat_id: string;
  panchayat_name: string;
  district: string;
  title: string;
  category: CategoryType;
  location: string;
  estimated_cost: number; // In Rupees (INR)
  people_affected: number;
  urgency: number; // 1-5
  safety_impact: number; // 1-5
  health_impact: number; // 1-5
  current_condition: number; // 1-5 (1 = worst/failing, 5 = poor)
  status: ProblemStatus;
  reported_by: string;
  reported_date: string;
  verified_by?: string;
  photo_url?: string;
  priority_score?: number;
  score_explanation?: string;
}

export interface ScoringWeights {
  w_people: number;
  w_urgency: number;
  w_safety: number;
  w_health: number;
  w_condition: number;
  w_efficiency: number;
}

export interface OptimizationResult {
  strategyName: string;
  strategyDescription: string;
  selectedProblems: PanchayatProblem[];
  unfundedProblems: PanchayatProblem[];
  totalCost: number;
  budgetLimit: number;
  totalPriorityScore: number;
  totalPeopleBenefited: number;
  criticalSolvedCount: number;
  efficiencyRatio: number;
}

export type UserRole = 'official' | 'field_staff' | 'citizen';
