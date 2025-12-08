export function generateMatchId(): string {
  return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateWinRate(wins: number, totalMatches: number): number {
  if (totalMatches === 0) return 0;
  return Math.round((wins / totalMatches) * 100 * 100) / 100;
}

export function calculateRanking(
  wins: number,
  losses: number,
  draws: number
): number {
  return wins * 10 - losses * 5 + draws * 3;
}

export function calculateTokenReward(
  difficulty: string,
  baseWager: number
): number {
  const multipliers: Record<string, number> = {
    EASY: 1.2,
    MEDIUM: 1.5,
    HARD: 2.0,
    EXPERT: 2.5,
  };
  return Math.floor(baseWager * (multipliers[difficulty] || 1.5));
}
