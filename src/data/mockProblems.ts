import { PanchayatProblem, ScoringWeights } from '@/types';

export const INITIAL_BUDGET = 4500000; // ₹45 Lakhs default budget

export const MOCK_PROBLEMS: PanchayatProblem[] = [];

export const DEFAULT_WEIGHTS: ScoringWeights = {
  w_people: 0.25,
  w_urgency: 0.20,
  w_safety: 0.20,
  w_health: 0.20,
  w_condition: 0.10,
  w_efficiency: 0.05,
};
