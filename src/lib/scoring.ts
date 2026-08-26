import { PanchayatProblem, ScoringWeights } from '@/types';

/**
 * Calculates priority score for each problem in the list based on weight parameters.
 * Returns new array of problems with computed `priority_score` and `score_explanation`.
 */
export function calculatePriorityScores(
  problems: PanchayatProblem[],
  weights: ScoringWeights
): PanchayatProblem[] {
  if (!problems || problems.length === 0) return [];

  // Find max and min for normalization across dataset
  let minPeople = Infinity;
  let maxPeople = -Infinity;
  let minEfficiency = Infinity;
  let maxEfficiency = -Infinity;

  const efficiencies = problems.map((p) => {
    // Impact per Lakh of Cost
    const costInLakhs = Math.max(0.1, p.estimated_cost / 100000);
    const impactFactor = p.people_affected * (p.urgency + p.safety_impact + p.health_impact);
    return impactFactor / costInLakhs;
  });

  problems.forEach((p, idx) => {
    if (p.people_affected < minPeople) minPeople = p.people_affected;
    if (p.people_affected > maxPeople) maxPeople = p.people_affected;

    const eff = efficiencies[idx];
    if (eff < minEfficiency) minEfficiency = eff;
    if (eff > maxEfficiency) maxEfficiency = eff;
  });

  const peopleRange = Math.max(1, maxPeople - minPeople);
  const effRange = Math.max(0.001, maxEfficiency - minEfficiency);

  const weightSum =
    weights.w_people +
    weights.w_urgency +
    weights.w_safety +
    weights.w_health +
    weights.w_condition +
    weights.w_efficiency || 1;

  return problems.map((problem, idx) => {
    // Normalization (0 - 1)
    const normPeople = (problem.people_affected - minPeople) / peopleRange;
    const normUrgency = problem.urgency / 5;
    const normSafety = problem.safety_impact / 5;
    const normHealth = problem.health_impact / 5;
    // Condition 1 (failing) gets 1.0 (highest need), Condition 5 (fair) gets 0.2
    const normCondition = (6 - problem.current_condition) / 5;
    const normEfficiency = (efficiencies[idx] - minEfficiency) / effRange;

    const rawScore =
      (weights.w_people * normPeople +
        weights.w_urgency * normUrgency +
        weights.w_safety * normSafety +
        weights.w_health * normHealth +
        weights.w_condition * normCondition +
        weights.w_efficiency * normEfficiency) /
      weightSum;

    const priority_score = Math.round(rawScore * 100 * 10) / 10; // 1 decimal place

    const explanation = generateExplanation(problem, priority_score, {
      normPeople,
      normUrgency,
      normSafety,
      normHealth,
      normCondition,
      normEfficiency,
    });

    return {
      ...problem,
      priority_score,
      score_explanation: explanation,
    };
  });
}

function generateExplanation(
  problem: PanchayatProblem,
  score: number,
  factors: {
    normPeople: number;
    normUrgency: number;
    normSafety: number;
    normHealth: number;
    normCondition: number;
    normEfficiency: number;
  }
): string {
  const costLakhs = (problem.estimated_cost / 100000).toFixed(1);
  const topReasons: string[] = [];

  if (problem.people_affected >= 3000) {
    topReasons.push(`serves a large community of ${problem.people_affected.toLocaleString('en-IN')} villagers`);
  } else if (problem.people_affected >= 1000) {
    topReasons.push(`impacts ${problem.people_affected.toLocaleString('en-IN')} local residents`);
  }

  if (problem.urgency >= 4) {
    topReasons.push(`has immediate urgency level (${problem.urgency}/5)`);
  }

  if (problem.safety_impact >= 4) {
    topReasons.push(`prevents critical public safety hazards (${problem.safety_impact}/5)`);
  }

  if (problem.health_impact >= 4) {
    topReasons.push(`mitigates high health & disease risks (${problem.health_impact}/5)`);
  }

  if (problem.current_condition <= 2) {
    topReasons.push(`addresses severely deteriorated infrastructure (condition rating ${problem.current_condition}/5)`);
  }

  if (factors.normEfficiency > 0.6) {
    topReasons.push(`delivers high cost-to-benefit ratio (₹${costLakhs} Lakhs)`);
  }

  if (topReasons.length === 0) {
    topReasons.push(`provides essential maintenance and community benefit for ₹${costLakhs} Lakhs`);
  }

  const primaryFactors = topReasons.slice(0, 3).join(', ');
  return `Prioritized (Score: ${score}/100) because it ${primaryFactors}.`;
}
