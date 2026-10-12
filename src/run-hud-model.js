import { STOP_RADIUS, STOP_SECONDS, MOODS, taxiRoute, fareBand, arrivalRating, insideStop } from './taxi-run.js';
import { routeDistance } from './world/nav-graph.js';
import { money as damageMoney, contractProgress, CONTRACT_SECONDS } from './demolition-run.js';

const compactCash = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const money = value => `$${Math.round(value ?? 0).toLocaleString('en-US')}`;
const compact = (value, format = money) => value >= 1000 ? compactCash.format(value) : format(value);
const distanceLabel = meters => meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters / 10) * 10} m`;
const countUp = (shown, total, step) => total < shown ? total : Math.min(total, shown + Math.max(step, (total - shown) * .35));
const mileageFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
// What the Drift button says through a drift, as its sparks change (see Drift)
const DRIFT_STATES = ["드리프트 중", "파랑", "주황", "분홍"];

function baseHud(run, vehicle, free = false) {
  // (the Drift button shows the charge toward the next stage, then the turbo running down)
  const drift = vehicle.drift, charging = Boolean(drift && vehicle.drifting), turbo = !charging && drift?.boost > 0;
  return { running: run.running, buttons: run.running || free, boostVisible: run.running,
    boosting: run.running ? run.boostActive : vehicle.boosting, drifting: vehicle.drifting,
    driftStage: charging ? drift.stage : turbo ? drift.turboStage : 0, driftCharge: charging ? drift.progress : turbo ? drift.boost : 0,
    driftState: charging ? DRIFT_STATES[drift.stage] : turbo ? "터보" : null, turbo,
    boost: run.boost, boostState: run.running ? run.boostActive ? "부스트 중" : run.boost < .1 ? "놓으면 충전" : "누르기"
      : vehicle.boosting ? vehicle.walker ? "달리는 중" : "부스트 중" : "누르기",
    speed: Math.round(Math.abs(vehicle.speed) * 2.23694), navigation: null, timer: null, stopProgress: null,
    combo: '', party: '', band: '', nextStop: '', mood: '', detail: '', info: '', fareStatus: '', arriving: false, taskUrgent: false, overtime: false };
}

// The waiting fare the cab is closest to, within sight of its ring
const NEARBY_FARE = 32;
function nearbyFare(run, vehicle) {
  const near = customer => Math.hypot(customer.s - vehicle.s, customer.u - vehicle.u);
  return run.boarding ?? run.customers.reduce((best, customer) => near(customer) < NEARBY_FARE && (!best || near(customer) < near(best)) ? customer : best, null);
}
// What a fare waiting by the cab offers: where to, who, how far and for
// how much, the same in a shift and in free drive's standby
function pickupCard(model, run, vehicle, nearby) {
  const band = nearby && fareBand(nearby.length), mood = MOODS[nearby?.mood];
  model.arriving = Boolean(run.boarding);
  model.title = nearby ? `목적지: ${nearby.destination.name}` : '';
  model.party = band ? `${nearby.passengers > 1 ? `승객 ${nearby.passengers}명` : nearby.name} · ${band.label} · ${distanceLabel(nearby.length)}` : '';
  model.band = band?.id ?? '';
  model.nextStop = mood ? `${mood.label} · ${mood.rule}` : nearby?.passengers > 1 ? `${nearby.stops.length}곳 하차 · 마지막에 정산` : '';
  model.mood = nearby?.mood ?? '';
  const inRing = nearby && nearby.id !== run.blockedPickup?.id && Math.hypot(nearby.s - vehicle.s, nearby.u - vehicle.u) < STOP_RADIUS;
  model.detail = run.boarding ? "탑승 중…" : inRing ? "정차하여 태우세요" : '';
  // (a special rider's rule matters more than the band, and the fare is on the line above)
  model.info = mood ? 'next' : 'party';
  model.fareStatus = nearby ? `운임 ${money(nearby.fare + nearby.groupBonus)}` : '';
}

// Build once per HUD tick. Counting cash and once-only hints must not advance
// separately for the page and the headset.
export function taxiHudModel(run, vehicle, { free = false, shownCash = 0, hint = () => '' } = {}) {
  const model = baseHud(run, vehicle, free);
  model.shownCash = shownCash;
  if (!run.running) return model;
  model.shownCash = countUp(shownCash, run.cash, 25);
  Object.assign(model, { clockLabel: run.overtime ? "마지막 운행" : "남은 시간", clock: String(Math.ceil(run.timeLeft)), urgent: run.timeLeft <= 15,
    cash: compact(Math.round(model.shownCash)), cashLabel: `총 수입 ${money(run.cash)}`,
    fares: `운행 ${run.delivered}회`, status: run.status });
  const stop = run.target, pickup = run.status === 'pickup';
  model.stage = pickup ? "승차" : run.overtime ? "마지막 운행" : run.fare.stops.length > 1 ? `하차 ${run.stopIndex + 1} / ${run.fare.stops.length}` : "하차";
  model.taskUrgent = !pickup && run.fareLeft <= 10;
  model.combo = !pickup && run.combo > 1 ? `콤보 ×${run.combo}` : '';
  model.stopProgress = { visible: run.hold > 0, label: pickup ? "승객 탑승 중" : "승객 하차 중", fraction: Math.min(1, run.hold / STOP_SECONDS) };
  if (!stop) {
    const nearby = nearbyFare(run, vehicle);
    pickupCard(model, run, vehicle, nearby);
    model.title ||= "승객을 찾으세요";
    model.detail ||= hint(!nearby && 'rings');
    return model;
  }
  const length = routeDistance(taxiRoute(vehicle, run.approach(vehicle))), nearStop = insideStop(stop, vehicle);
  model.navigation = { distance: nearStop ? "도착" : `${Math.max(10, Math.round(length / 10) * 10)} m`,
    label: `목적지까지 도로 거리 ${Math.round(length)} m. 초록 화살표는 목적지 방향입니다` };
  model.title = stop.name;
  const remaining = run.legRemaining, rating = arrivalRating(remaining), seconds = Math.ceil(run.ratingSeconds);
  model.timer = { text: `${rating.label} ${seconds}s`, tone: rating.id, fraction: remaining,
    label: rating.remaining > 0 ? `${seconds}초 이내 도착 시 ${rating.label}` : `승객 포기까지 ${seconds}초` };
  model.fareStatus = `미터 ${money(run.remainingFare + run.tips)}`;
  const mood = MOODS[run.fare.mood];
  model.party = run.fare.passengers > 1 ? `${run.onboard}명 탑승 중` : mood ? run.shaken ? `${mood.label} · 보너스 상실` : `${mood.label} · ${mood.rule}` : '';
  const next = run.fare.stops[run.stopIndex + 1];
  model.nextStop = next ? `다음 · ${next.destination.name} · ${Math.round(next.length / 10) * 10} m` : run.fare.passengers > 1 ? "마지막 정류장" : '';
  const key = run.tips > 0 ? 'tips' : run.fare.passengers > 1 ? 'group' : 'drive';
  model.detail = nearStop ? Math.abs(vehicle.speed) >= 2.5 ? "정차하여 내려 주세요" : "하차 중…" : hint(!run.overtime && key);
  model.info = model.nextStop ? 'next' : 'party';
  model.arriving = nearStop;
  return model;
}

export function demolitionHudModel(run, vehicle, { shownCash = 0, hint = () => '' } = {}) {
  const model = baseHud(run, vehicle);
  model.shownCash = run.running ? countUp(shownCash, run.score, 900) : run.score;
  if (!run.running) return model;
  Object.assign(model, { clockLabel: run.overtime ? "마지막 연속 기록" : "남은 시간", clock: run.overtime ? '' : String(Math.ceil(run.timeLeft)),
    overtime: run.overtime, urgent: run.timeLeft <= 10, cash: compact(model.shownCash, damageMoney), cashLabel: `피해액 ${damageMoney(run.score)}`,
    fares: run.beatBest ? "최고 기록 경신!" : run.previousBest > 0 ? `최고 ${compact(run.previousBest, damageMoney)}` : `${run.smashed + run.carsHit}개 파괴`, status: 'demolition' });
  const contracts = run.contracts ?? [], open = contracts.filter(contract => !contract.done);
  if (run.chain > 0) {
    model.stage = `${run.overtime ? "마지막 연속 기록" : "연속 기록"} ×${run.multiplier}`;
    model.timer = { text: `타격 ${run.chain}회`, tone: 'chain', fraction: run.chainLeft, label: `연속 타격 ${run.chain}회` };
    model.fareStatus = damageMoney(run.pending);
    model.title = run.last.label;
    model.party = `+${damageMoney(run.last.value)}`; model.band = 'damage';
    model.nextStop = run.nextStep ? `×${run.multiplier + 1}까지 ${run.nextStep}회 남음` : "최대 배율";
    model.detail = hint(run.multiplier > 1 ? 'bank' : ''); model.info = 'next';
  } else {
    const next = open[0];
    model.stage = next ? "계약" : "철거";
    model.timer = { text: `${contracts.length - open.length} / ${contracts.length}`, tone: 'chain', fraction: null,
      label: `계약 ${contracts.length}개 중 ${contracts.length - open.length}개 완료` };
    model.fareStatus = ''; model.title = next ? next.text : "모든 것을 파괴하세요";
    model.party = next ? `${contractProgress(next)} · +${CONTRACT_SECONDS}s` : ''; model.band = next ? 'damage' : '';
    model.nextStop = next ? open.slice(1).map(other => `${other.short} ${contractProgress(other)}`).join(' · ') : contracts.length ? "모든 계약 완료" : '';
    model.detail = hint(run.bestChain ? 'time' : 'chain'); model.info = next ? 'party' : 'next';
  }
  return model;
}

// A test drive's card (see TestDrive): the clock, and once it is up, the car
// stopping or landing before the player's own takes its place
function testCard(model, test) {
  const seconds = Math.ceil(test.left);
  return Object.assign(model, { task: true, status: 'test', stage: test.stage ?? (test.over ? "시승 종료" : "시승"), fareStatus: test.price,
    timer: { text: test.clock, tone: seconds <= 15 ? 'slow' : 'chain', fraction: test.fraction, label: `시승 ${seconds}초 남음` },
    title: test.over ? test.landing ? "착륙 중…" : "정차 중…" : test.label, taskUrgent: !test.over && seconds <= 15,
    party: test.over ? `내 ${test.own} 복귀` : test.note, info: 'party' });
}

// Free drive's HUD, in the runs' panels. The task card only shows when it
// has something to say: a stunt chain going, a job on standby (a cab, with
// the fare it is by, see TaxiRun.standby, or the demolition truck), a test
// drive's clock. The rest of the time the view stays clear.
export function freeHudModel(stunts, vehicle, { taxi = null, demolition = null, test = null, hint = () => '' } = {}) {
  const model = Object.assign(baseHud({ running: false }, vehicle, true), { task: false, status: 'free' });
  if (test?.over) return testCard(model, test);
  if (stunts.chain) {
    return Object.assign(model, { task: true, status: 'chain', stage: `연속 기록 ×${stunts.multiplier}`, fareStatus: money(stunts.pot),
      timer: { text: `묘기 ${stunts.chain}회`, tone: 'chain', fraction: stunts.chainLeft, label: `연속 묘기 ${stunts.chain}회` },
      title: stunts.last?.label ?? "묘기", party: `+${money(stunts.last?.value)}`, band: 'damage',
      nextStop: stunts.nextStep ? `×${stunts.multiplier + 1}까지 ${stunts.nextStep}회 남음` : "최대 배율", info: 'next', detail: hint('chain') });
  }
  const nearby = taxi?.waiting ? nearbyFare(taxi, vehicle) : null;
  if (nearby) {
    pickupCard(model, taxi, vehicle, nearby);
    return Object.assign(model, { task: true, status: 'pickup', stage: "운임",
      stopProgress: { visible: taxi.hold > 0, label: "승객 탑승 중", fraction: Math.min(1, taxi.hold / STOP_SECONDS) } });
  }
  if (test) return testCard(model, test);
  // (the demolition truck on standby: what starts the run, and its contracts)
  if (demolition?.waiting) {
    const contracts = demolition.contracts ?? [];
    return Object.assign(model, { task: true, status: 'standby', stage: "철거", fareStatus: `남은 시간 ${Math.round(demolition.timeLeft)}초`,
      title: "무언가에 부딪히면 시작", party: contracts.length ? `계약 · ${contracts.map(contract => contract.short).join(', ')}` : '', info: 'party' });
  }
  // (and a cab with no fare near: what starts the shift. Said once as a tip,
  // it left a shift picked on the menus with nothing on screen.)
  if (taxi?.waiting) {
    return Object.assign(model, { task: true, status: 'standby', stage: "택시 영업", fareStatus: `남은 시간 ${Math.round(taxi.timeLeft)}초`,
      title: "승객을 찾으세요", party: "원 안에 정차 · 첫 승객부터 시간 시작", info: 'party' });
  }
  return model;
}

export function locationHudModel(vehicle, district, weather, cash = '') {
  const degrees = ((vehicle.heading * 180 / Math.PI) % 360 + 360) % 360;
  return { distance: mileageFormat.format(vehicle.distance / 1609.344),
    heading: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(degrees / 45) % 8], place: district, weather, cash };
}

export function headsetHudModel(run, location, hint = '') {
  // (free drive's card, when it has one, between the heading and the cash)
  if (!run?.running && run?.task) return { free: true, heading: location.heading, place: location.place, cash: location.cash,
    stage: [run.stage, run.fareStatus].filter(Boolean).join(' · '), title: run.title, distance: run.navigation?.distance ?? '',
    detail: run.detail || [run.party, run.nextStop].filter(Boolean).join(' · '),
    timer: run.timer && { text: run.timer.text, tone: run.timer.tone, fraction: run.timer.fraction === null ? null : Math.round(run.timer.fraction * 100) / 100 }, hint };
  if (!run?.running) return { ...location, hint };
  const pickup = run.status === 'pickup', contract = run.status === 'demolition' && run.timer?.fraction === null;
  return { taxi: true, clockLabel: run.clockLabel, clock: run.clock, urgent: run.urgent, cash: run.cash, fares: run.fares,
    stage: [run.stage, run.fareStatus].filter(Boolean).join(' · '), title: run.title,
    distance: pickup ? '' : run.navigation?.distance ?? '',
    detail: pickup || contract ? [run.party, run.detail].filter(Boolean).join(' · ')
      : run.detail || run.nextStop || [run.party, run.combo].filter(Boolean).join(' · '),
    // Whole percents avoid uploading a new canvas texture for tiny bar changes.
    timer: run.timer && { text: run.timer.text, tone: run.timer.tone, fraction: run.timer.fraction === null ? null : Math.round(run.timer.fraction * 100) / 100 }, hint };
}
