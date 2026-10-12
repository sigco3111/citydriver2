import { demolitionRank, money, contractProgress as progress, CONTRACT_SECONDS } from './demolition-run.js';
import { demolitionResultModel } from './result-model.js';
import { demolitionHudModel } from './run-hud-model.js';
import { renderRunHud } from './run-hud-dom.js';
import { FloatingLabels } from './floating-labels.js';
import { $, text, compactCash, clock, OnceHints } from './hud-dom.js';

const compact = value => value >= 1000 ? compactCash.format(value) : money(value);
const day = date => { const parsed = new Date(`${date}T12:00:00`); return Number.isNaN(parsed.getTime()) ? '' : parsed.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }); };
// Hints for new players, each shown once in the task card's last line
export const HINTS = {
  chain: "연달아 파괴하면 연속 기록이 쌓입니다",
  bank: "잠시 파괴를 멈추면 연속 기록을 정산합니다",
  time: "차량 격파와 계약 완료로 시간이 늘어납니다",
};
const HINTS_KEY = 'citydriver-demolition-hints';

// What each blow's number looks like as it floats up over the truck: the
// run's orange for damage, hotter for a car written off, red for a fine and
// green for time won
const LABEL_STYLES = {
  smash: { colour: '#ffc07a' }, dent: { colour: '#ffc07a' },
  wreck: { colour: '#ff8a2a', caption: "파괴됨" }, penalty: { colour: '#ff6d5e', caption: "보행자" },
  bonus: { colour: '#8ff0b0', caption: "차량 격파" }, contract: { colour: '#8ff0b0', caption: "계약" },
};
export class DemolitionView {
  constructor(scene, storage = null) {
    this.labels = new FloatingLabels(scene, 'demolition-labels');
    this.storage = storage; this.shown = 0;
  }
  // A stand-in for the labels' program, compiled with the city
  warmupObjects() { return this.labels.warmupObjects(); }
  reset() { this.labels.reset(); this.shown = 0; }
  // A blow's price (or a fine, or time won) rising over the truck. False with popups off.
  pop(event) {
    const style = LABEL_STYLES[event.kind] ?? LABEL_STYLES.smash;
    const amount = event.kind === 'penalty' ? event.fine ? `−$${event.fine.toLocaleString('en-US')}` : "연속 기록 상실"
      : event.kind === 'bonus' || event.kind === 'contract' ? event.seconds ? `+${event.seconds}s` : "완료" : `$${event.value.toLocaleString('en-US')}`;
    // (a blow in a chain says what it was multiplied by)
    const times = ['smash', 'dent', 'wreck'].includes(event.kind) && event.multiplier > 1 ? `×${event.multiplier}` : '';
    const caption = [style.caption, times].filter(Boolean).join(' ');
    return this.labels.pop({ amount, caption, colour: style.colour });
  }
  // Over the player's car; `camera`, if given, keeps near labels small
  render(vehicle, time, camera = null) { this.labels.render(time, camera, vehicle.car, vehicle.spec?.height); }
  // The driving HUD, in the taxi's panels: the clock and the banked damage
  // top left, the chain where the fare would be, the boost as a taxi has it
  buildHud(run, vehicle) {
    this.hudModel = demolitionHudModel(run, vehicle, { shownCash: this.shown, hint: id => this.hint(id) });
    this.shown = this.hudModel.shownCash;
    return this.hudModel;
  }
  hud(run, vehicle) {
    const model = this.buildHud(run, vehicle);
    renderRunHud(model);
    return model;
  }
  hint(id) {
    this.hints ??= new OnceHints(HINTS, HINTS_KEY, this.storage);
    return this.hints.get(id);
  }
  // The table as a list: place, damage, rating and day, `current` marked
  scoreList(scores, current = -1) {
    if (!scores.length) return '<li class="demolition-score-empty">No runs yet. Every smash counts.</li>';
    return scores.map((entry, index) => `<li data-current="${index === current}"><span>${index + 1}</span><strong>${money(entry.score)}</strong>`
      + `<span class="demolition-score-rank">${demolitionRank(entry.score).badge}</span><small>${day(entry.date)}</small></li>`).join('');
  }
  // The pause screen's contracts, in the taxi goals' list
  contracts(run) {
    const contracts = run.status === 'idle' ? [] : run.contracts ?? [];
    $('shift-goals').innerHTML = contracts.map(contract => `<li data-done="${contract.done}"><span class="goal-check" aria-hidden="true">${contract.done ? '✓' : '○'}</span>`
      + `<span class="goal-copy"><strong>${contract.text}</strong><small>${contract.done ? "완료" : `${progress(contract)} · +${CONTRACT_SECONDS}s`}</small></span></li>`).join('');
    text('goals-summary', contracts.length ? `${contracts.length}개 중 ${run.contractsDone}개 완료 · 각 ${CONTRACT_SECONDS}초 추가` : '');
  }
  // The pause screen's table
  scores(run) {
    const records = run.records;
    $('demolition-scores').innerHTML = this.scoreList(records.scores);
    text('scores-summary', records.runs ? `플레이 ${records.runs}회 · 누적 피해 ${money(records.lifetime)}` : '');
  }
  // (`saving`: what the balance is going toward, see savingFor)
  results(run, saving = '') {
    const model = demolitionResultModel(run), { rank } = model, summary = run.summary, records = run.records;
    $('demolition-result-time').textContent = clock(Math.round(run.elapsed));
    $('demolition-result-score').textContent = model.cash;
    $('demolition-result-rank').dataset.license = rank.id;
    $('demolition-rank-badge').textContent = rank.badge;
    $('demolition-rank-name').textContent = model.name;
    $('demolition-rank-next').textContent = model.next;
    // (contracts as a tile: listed, they made the card taller than a
    // laptop's screen once the high score table was full)
    const tiles = [['smashed', "파괴 수", run.smashed + run.wrecked], ['takedowns', "차량 격파", run.takedowns],
      ['chain', "연속 기록", run.bestMultiplier > 1 ? `×${run.bestMultiplier}` : run.bestChain || '–'], ['bank', "최고 정산액", run.bestBank ? compact(run.bestBank) : '–'],
      ['contracts', "계약", `${run.contractsDone}/${run.contracts?.length ?? 0}`], ['fines', "벌금", run.fineCount]];
    $('demolition-result-stats').innerHTML = tiles.map(([id, label, value]) =>
      `<li data-stat="${id}" data-bad="${id === 'fines' && run.fineCount > 0}"><strong>${value}</strong><span>${label}</span></li>`).join('');
    const placement = summary?.placement ?? -1;
    $('demolition-result-scores').innerHTML = `<div class="taxi-result-heading"><span>최고 기록</span><span>${placement >= 0 ? `${records.scores.length}개 기록 중 ${placement + 1}위` : `최고 ${money(records.best)}`}</span></div>`
      + `<ol class="demolition-score-list">${this.scoreList(records.scores, placement)}</ol>`;
    $('demolition-result-best').textContent = `플레이 ${records.runs}회 · 누적 피해 ${compact(records.lifetime)}`;
    // (the contractor's cut, paid into the fleet balance as each chain banked)
    $('demolition-result-total').textContent = [run.paid && `잔액 +${money(run.paid)}`, saving].filter(Boolean).join(' · ');
    $('demolition-results').hidden = false;
  }
  dispose() {
    this.labels.dispose();
  }
}
