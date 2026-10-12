import { taxiLicense } from './taxi-license.js';
import { demolitionRank, money as damageMoney } from './demolition-run.js';

const money = value => `$${Math.round(value ?? 0).toLocaleString('en-US')}`;

export function taxiResultModel(run, found = []) {
  const license = taxiLicense(run.cash), best = taxiLicense(run.best);
  const improved = run.cash > 0 && license.rank > taxiLicense(run.previousBest).rank;
  return { cash: money(run.cash), license, name: license.id === 'none' ? license.name : `${license.name} 면허`,
    next: [improved && "최고 면허 등급 경신!", license.next ? `${license.next.name}까지 ${money(license.next.min - run.cash)} 남음` : "최고 면허 등급"].filter(Boolean).join(' · '),
    best: [`최고 ${money(run.best)} · ${best.name}`, found.length && `새 장소 ${found.length}곳 발견`].filter(Boolean).join(' · ') };
}

export function demolitionResultModel(run) {
  const rank = demolitionRank(run.score), improved = run.score > 0 && rank.rank > demolitionRank(run.previousBest).rank;
  return { cash: damageMoney(run.score), rank, name: rank.name,
    next: [run.summary?.best ? "최고 기록 경신!" : improved && "최고 평가 경신!",
      rank.next ? `${rank.next.name}까지 ${damageMoney(rank.next.min - Math.max(0, run.score))} 남음` : "최고 평가"].filter(Boolean).join(' · ') };
}
