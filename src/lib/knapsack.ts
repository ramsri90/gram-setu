import { OptimizationResult, PanchayatProblem, ScoringWeights } from '@/types';
import { calculatePriorityScores } from './scoring';

const DP_SCALE = 10000; // ₹10,000 scaling unit for DP grid

/**
 * 0/1 Knapsack Optimization Algorithm
 * Solves: Maximize total priority score subject to sum(estimated_cost) <= budgetLimit
 */
export function optimizeBudgetKnapsack(
  problems: PanchayatProblem[],
  budgetLimit: number,
  strategyName: string = 'Optimal Plan',
  strategyDescription: string = 'Knapsack DP optimized allocation'
): OptimizationResult {
  if (!problems || problems.length === 0 || budgetLimit <= 0) {
    return {
      strategyName,
      strategyDescription,
      selectedProblems: [],
      unfundedProblems: problems || [],
      totalCost: 0,
      budgetLimit,
      totalPriorityScore: 0,
      totalPeopleBenefited: 0,
      criticalSolvedCount: 0,
      efficiencyRatio: 0,
    };
  }

  const n = problems.length;
  const maxWeight = Math.floor(budgetLimit / DP_SCALE);

  // Scaled integer costs and score values (score * 10 for integer precision)
  const weights = problems.map((p) => Math.ceil(p.estimated_cost / DP_SCALE));
  const values = problems.map((p) => Math.round((p.priority_score || 0) * 10));

  // Initialize DP Matrix (n+1) x (maxWeight+1)
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(maxWeight + 1).fill(0)
  );

  // Fill DP table
  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1];
    const val = values[i - 1];
    for (let j = 0; j <= maxWeight; j++) {
      if (w <= j) {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - w] + val);
      } else {
        dp[i][j] = dp[i - 1][j];
      }
    }
  }

  // Backtrack to find selected items
  const selected: PanchayatProblem[] = [];
  const unfunded: PanchayatProblem[] = [];
  let wRemaining = maxWeight;

  for (let i = n; i > 0; i--) {
    if (dp[i][wRemaining] !== dp[i - 1][wRemaining]) {
      selected.push(problems[i - 1]);
      wRemaining -= weights[i - 1];
    } else {
      unfunded.push(problems[i - 1]);
    }
  }

  selected.reverse();
  unfunded.reverse();

  // Summary Metrics
  const totalCost = selected.reduce((sum, p) => sum + p.estimated_cost, 0);
  const totalPriorityScore = Math.round(
    selected.reduce((sum, p) => sum + (p.priority_score || 0), 0) * 10
  ) / 10;
  const totalPeopleBenefited = selected.reduce((sum, p) => sum + p.people_affected, 0);
  const criticalSolvedCount = selected.filter(
    (p) => p.urgency >= 4 || p.safety_impact >= 4 || p.health_impact >= 4
  ).length;

  const costInLakhs = Math.max(0.1, totalCost / 100000);
  const efficiencyRatio = Math.round((totalPriorityScore / costInLakhs) * 10) / 10;

  return {
    strategyName,
    strategyDescription,
    selectedProblems: selected,
    unfundedProblems: unfunded,
    totalCost,
    budgetLimit,
    totalPriorityScore,
    totalPeopleBenefited,
    criticalSolvedCount,
    efficiencyRatio,
  };
}

/**
 * Runs 3 distinct decision strategies for the Simulator comparison screen.
 */
export function runSimulatorStrategies(
  rawProblems: PanchayatProblem[],
  budgetLimit: number
): {
  planA: OptimizationResult;
  planB: OptimizationResult;
  planC: OptimizationResult;
} {
  // Strategy A: Maximum Population Reach
  const weightsA: ScoringWeights = {
    w_people: 0.50,
    w_urgency: 0.10,
    w_safety: 0.10,
    w_health: 0.10,
    w_condition: 0.10,
    w_efficiency: 0.10,
  };
  const problemsA = calculatePriorityScores(rawProblems, weightsA);
  const planA = optimizeBudgetKnapsack(
    problemsA,
    budgetLimit,
    'Plan A: Maximum Reach',
    'Prioritizes projects affecting the largest number of village residents.'
  );

  // Strategy B: Emergency & Public Safety Focus
  const weightsB: ScoringWeights = {
    w_people: 0.10,
    w_urgency: 0.35,
    w_safety: 0.25,
    w_health: 0.20,
    w_condition: 0.05,
    w_efficiency: 0.05,
  };
  const problemsB = calculatePriorityScores(rawProblems, weightsB);
  const planB = optimizeBudgetKnapsack(
    problemsB,
    budgetLimit,
    'Plan B: Emergency & Safety',
    'Directs funds to immediate hazards, critical health risks, and failing infrastructure.'
  );

  // Strategy C: Cost-Efficiency & Asset Sustainability
  const weightsC: ScoringWeights = {
    w_people: 0.15,
    w_urgency: 0.15,
    w_safety: 0.15,
    w_health: 0.15,
    w_condition: 0.20,
    w_efficiency: 0.20,
  };
  const problemsC = calculatePriorityScores(rawProblems, weightsC);
  const planC = optimizeBudgetKnapsack(
    problemsC,
    budgetLimit,
    'Plan C: High Efficiency',
    'Balances cost-benefit ratio and focuses on restoring degraded assets efficiently.'
  );

  return { planA, planB, planC };
}
