import { randomAt } from './world/route.js';

// Three goals per shift give each run its own shape: a shift spent hunting
// groups plays differently from one chasing a stunt chain. Bonuses go to the
// fleet bank rather than the score, so a license still measures pure fare
// money while the goals bring the next cab closer. Targets step up with the
// driver's rank, and the third goal is always one tier harder than the rest.
export const GOALS = [
  { id: 'fares', stat: 'delivered', targets: [3, 5, 8], bonus: [150, 300, 500], text: n => `운행 ${n}회 완료` },
  { id: 'riders', stat: 'riders', targets: [5, 10, 16], bonus: [150, 300, 500], text: n => `승객 ${n}명 운송` },
  { id: 'groups', stat: 'groups', targets: [1, 2, 4], bonus: [200, 350, 600], text: n => `단체 운행 ${n}회 완료` },
  { id: 'speedy', stat: 'speedy', targets: [3, 6, 10], bonus: [150, 300, 500], text: n => `빠른 도착 ${n}회 달성` },
  { id: 'streak', stat: 'streak', targets: [2, 3, 5], bonus: [200, 350, 600], text: n => `빠른 도착 ${n}회 연속` },
  { id: 'combo', stat: 'combo', targets: [4, 6, 10], bonus: [150, 300, 500], text: n => `묘기 콤보 ×${n} 달성` },
  { id: 'tips', stat: 'tips', targets: [40, 150, 400], bonus: [150, 300, 500], text: n => `팁 $${n} 정산` },
  { id: 'nearMiss', stat: 'nearMisses', targets: [4, 10, 20], bonus: [150, 300, 500], text: n => `아슬아슬한 추월 ${n}회` },
  { id: 'crazyStop', stat: 'crazyStops', targets: [1, 3, 6], bonus: [150, 300, 500], text: n => `굉장한 정차 ${n}회` },
  { id: 'long', stat: 'longRides', targets: [1, 2, 3], bonus: [200, 350, 600], text: n => `장거리 운행 ${n}회 완료 (초록 원)` },
  { id: 'fullCab', stat: 'fullCabs', targets: [1, 1, 2], bonus: [300, 300, 600], text: n => n > 1 ? `4명 만석 운행 ${n}회 완료` : "4명 만석 택시 운행 완료" },
  { id: 'pleased', stat: 'pleased', targets: [1, 2, 4], bonus: [200, 350, 600], text: n => `특별 승객 ${n}명 만족시키기` },
];
export const GOALS_PER_SHIFT = 3;
export const goalTier = rankIndex => Math.min(2, Math.floor(rankIndex / 2));

// The draw is seeded by the shift number, so restarting a run keeps its goals
// and the next shift brings new ones.
export function shiftGoals(shift, rankIndex = 0) {
  const tier = goalTier(rankIndex), pool = [...GOALS], goals = [];
  for (let i = 0; i < GOALS_PER_SHIFT && pool.length; i++) {
    const [type] = pool.splice(Math.floor(randomAt(shift, i + 20110) * pool.length), 1);
    const level = i === GOALS_PER_SHIFT - 1 ? Math.min(2, tier + 1) : tier;
    const target = type.targets[level];
    goals.push({ id: type.id, stat: type.stat, tier: level, target, bonus: type.bonus[level], text: type.text(target), progress: 0, done: false });
  }
  return goals;
}
export const goalProgress = (goal, stats) => Math.min(goal.target, Math.max(0, stats[goal.stat] ?? 0));
