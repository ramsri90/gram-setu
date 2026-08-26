from flask import Flask, request, jsonify
from flask_cors import CORS
import math

app = Flask(__name__)
CORS(app)

DP_SCALE = 10000  # ₹10,000 scaling unit


def calculate_scores(problems, weights):
    if not problems:
        return []

    min_people = min(p.get('people_affected', 0) for p in problems)
    max_people = max(p.get('people_affected', 0) for p in problems)
    people_range = max(1, max_people - min_people)

    efficiencies = []
    for p in problems:
        cost_lakhs = max(0.1, p.get('estimated_cost', 100000) / 100000.0)
        impact = p.get('people_affected', 0) * (p.get('urgency', 1) + p.get('safety_impact', 1) + p.get('health_impact', 1))
        efficiencies.append(impact / cost_lakhs)

    min_eff = min(efficiencies) if efficiencies else 0
    max_eff = max(efficiencies) if efficiencies else 1
    eff_range = max(0.001, max_eff - min_eff)

    w_people = weights.get('w_people', 0.25)
    w_urgency = weights.get('w_urgency', 0.20)
    w_safety = weights.get('w_safety', 0.20)
    w_health = weights.get('w_health', 0.20)
    w_condition = weights.get('w_condition', 0.10)
    w_eff = weights.get('w_efficiency', 0.05)
    w_sum = w_people + w_urgency + w_safety + w_health + w_condition + w_eff or 1.0

    scored = []
    for idx, p in enumerate(problems):
        norm_people = (p.get('people_affected', 0) - min_people) / people_range
        norm_urgency = p.get('urgency', 1) / 5.0
        norm_safety = p.get('safety_impact', 1) / 5.0
        norm_health = p.get('health_impact', 1) / 5.0
        norm_condition = (6 - p.get('current_condition', 3)) / 5.0
        norm_efficiency = (efficiencies[idx] - min_eff) / eff_range

        raw = (w_people * norm_people +
               w_urgency * norm_urgency +
               w_safety * norm_safety +
               w_health * norm_health +
               w_condition * norm_condition +
               w_eff * norm_efficiency) / w_sum

        score = round(raw * 100.0, 1)

        cost_lakhs_str = f"{p.get('estimated_cost', 0) / 100000.0:.1f}"
        explanation = (
            f"Prioritized (Score: {score}/100) because it impacts {p.get('people_affected', 0):,} residents, "
            f"has urgency {p.get('urgency', 1)}/5, safety impact {p.get('safety_impact', 1)}/5, "
            f"and requires ₹{cost_lakhs_str} Lakhs."
        )

        p_copy = dict(p)
        p_copy['priority_score'] = score
        p_copy['score_explanation'] = explanation
        scored.append(p_copy)

    return scored


def knapsack_optimize(problems, budget_limit):
    n = len(problems)
    max_w = math.floor(budget_limit / DP_SCALE)

    weights = [math.ceil(p['estimated_cost'] / DP_SCALE) for p in problems]
    values = [round(p.get('priority_score', 0) * 10) for p in problems]

    dp = [[0] * (max_w + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        w = weights[i - 1]
        val = values[i - 1]
        for j in range(max_w + 1):
            if w <= j:
                dp[i][j] = max(dp[i - 1][j], dp[i - 1][j - w] + val)
            else:
                dp[i][j] = dp[i - 1][j]

    selected = []
    unfunded = []
    w_rem = max_w

    for i in range(n, 0, -1):
        if dp[i][w_rem] != dp[i - 1][w_rem]:
            selected.append(problems[i - 1])
            w_rem -= weights[i - 1]
        else:
            unfunded.append(problems[i - 1])

    selected.reverse()
    unfunded.reverse()

    total_cost = sum(p['estimated_cost'] for p in selected)
    total_score = round(sum(p.get('priority_score', 0) for p in selected), 1)
    total_people = sum(p['people_affected'] for p in selected)
    critical_count = sum(1 for p in selected if p.get('urgency', 0) >= 4 or p.get('safety_impact', 0) >= 4 or p.get('health_impact', 0) >= 4)

    return {
        'selectedProblems': selected,
        'unfundedProblems': unfunded,
        'totalCost': total_cost,
        'budgetLimit': budget_limit,
        'totalPriorityScore': total_score,
        'totalPeopleBenefited': total_people,
        'criticalSolvedCount': critical_count,
        'efficiencyRatio': round(total_score / (max(0.1, total_cost / 100000.0)), 1)
    }


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'Gram Setu Knapsack Optimizer API'})


@app.route('/api/optimize', methods=['POST'])
def optimize():
    data = request.get_json() or {}
    raw_problems = data.get('problems', [])
    budget = data.get('budget', 4500000)
    weights = data.get('weights', {
        'w_people': 0.25,
        'w_urgency': 0.20,
        'w_safety': 0.20,
        'w_health': 0.20,
        'w_condition': 0.10,
        'w_efficiency': 0.05
    })

    scored = calculate_scores(raw_problems, weights)
    res = knapsack_optimize(scored, budget)
    return jsonify(res)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
