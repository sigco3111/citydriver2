import { UNSAVED } from './chooser-model.js';

export const WEATHER_CHOICES = [
  ['auto', "자동"], ['clear', "낮"], ['overcast', "흐림"], ['rain', "비"], ['storm', "폭풍"], ['snow', "눈"], ['sunset', "노을"], ['night', "밤"],
];
export const cycleChoice = (list, value) => list[(list.indexOf(value) + 1) % list.length];
const VR_CONTROLS = '오른쪽 트리거: 가속 · 왼쪽 트리거: 제동\n왼쪽 스틱: 조향 · 왼쪽 그립: 드리프트\n오른쪽 그립: 부스트 · A: 카메라 · B: 일시 정지';
const VR_POINTING = "가리키고 트리거를 누르거나 스틱과 A로 선택 · B: 뒤로";

// Controls have stable names. Desktop binds them to its own markup, while VR
// lays out these same labels, values and commands on a canvas.
export function menuControls(state, actions) {
  const control = (label, activate, extra = {}) => ({ label, activate, ...extra });
  const run = state.mode !== 'free', taxi = state.mode === 'taxi', locked = state.started && run;
  return {
    start: control("택시 영업", actions.start), taxi: control("택시 영업", actions.taxi), demolition: control("철거", actions.demolition), free: control("자유 주행", actions.free, { job: 'free' }),
    resume: control("계속하기", actions.resume), back: control("뒤로", actions.back), exit: control("VR 종료", actions.exit),
    retry: control(taxi ? "다음 영업" : "다시 플레이", state.mode === 'demolition' ? actions.demolition : actions.taxi),
    // Carrying on in free drive after a run, in the same car at the same spot
    keep: control("자유 주행", actions.keep, { job: 'free' }),
    // (free drive's is New city, asked twice: it drops the places found and the jump stars)
    restart: control(run ? "다시 시작" : state.newCityArmed ? "정말 바꾸시겠습니까? 진행 상황은 저장됩니다." : "새 도시", state.mode === 'demolition' ? actions.demolition : actions.newCity),
    end: control(taxi ? "영업 종료" : "플레이 종료", actions.end),
    // (in free drive on a job's standby, its button would start what is
    // already waiting: Free drive takes its place, back in their own car)
    // (`job`: which mode the button starts, for its color and icon on the
    // pause screen. In a run it is Free drive, beside the other run.)
    switchMode: run || state.standby === 'taxi' ? control("자유 주행", actions.free, { job: 'free' }) : control("택시 영업", actions.taxi, { job: 'taxi' }),
    otherRun: state.mode === 'demolition' ? control("택시 영업", actions.taxi, { job: 'taxi' })
      : state.standby === 'demolition' ? control("자유 주행", actions.free, { job: 'free' }) : control("철거", actions.demolition, { job: 'demolition' }),
    // (the cabs and their liveries are in it too: in a shift only those, for the next shift)
    garage: control("차고", actions.garage, { value: state.carName, disabled: state.started && state.mode === 'demolition' }),
    autodrive: control("자동 운전", actions.autodrive, { toggle: state.autodrive, disabled: locked }),
    traffic: control("교통", actions.traffic, { toggle: state.traffic, disabled: locked }),
    driftTap: control("탭으로 드리프트", actions.driftTap, { toggle: state.driftTap }),
    popups: control("팝업 알림", actions.popups, { toggle: state.popups }),
    reset: control("차량 복귀", actions.reset, { value: state.running ? '−5초' : '' }),
    map: control("도시 지도", actions.map, { value: state.location.place }),
    weather: control("날씨", actions.weather, { value: WEATHER_CHOICES.find(([id]) => id === state.weather)?.[1] }),
    view: control("카메라", actions.view, { value: state.view.replace(/ view$/, '') }),
    recenter: control("시점 중앙으로", actions.recenter), comfort: control("시야 가장자리 가림", actions.comfort, { toggle: state.comfort }),
    lookSensitivity: control("스틱 시선 속도", actions.lookSensitivity, { value: `${Math.round((state.lookSensitivity ?? 1) * 100)}%` }),
    graphics: control("그래픽", actions.graphics, { value: state.graphics }),
    rate: control("주사율", actions.rate, { value: state.rateChoice === null ? state.frameRate ? `자동 · ${Math.round(state.frameRate)} Hz` : "자동" : `${state.rateChoice} Hz` }),
    sound: control("소리", actions.sound, { toggle: state.sound }),
    vibration: control("진동", actions.vibration, { toggle: state.vibration }),
    mix: control("소리 믹스", actions.mix, { value: state.mix[0].toUpperCase() + state.mix.slice(1) }),
  };
}

export function menuModel(state, controls, { garage, result, mapImage, mapKey, mark } = {}) {
  const item = (key, extra) => ({ id: key, ...controls[key], ...extra });
  const back = item('back', { footer: true });
  if (state.loading) return { id: 'loading', title: "불러오는 중…", subtitle: "곧 주행을 시작할 수 있습니다", items: [] };
  if (state.chooser === 'map') return { id: 'map', title: "도시 지도", subtitle: `현재 위치: ${state.location.place}`, image: mapImage, imageKey: mapKey, items: [back], hint: "B: 뒤로" };
  // (an unowned car's offer is a menu of its own, and Back goes back to the garage)
  if (state.chooser === 'garage' && garage.offer) return { id: 'car-offer', title: garage.offer.label, subtitle: garage.offer.summary,
    items: garage.offer.items, hint: VR_POINTING };
  if (state.chooser === 'garage') return { id: 'car-dialog', title: "차고", flow: true, hint: VR_POINTING,
    subtitle: garage.shift ? `${garage.balance}${garage.unsaved ? ` · ${UNSAVED}` : ''} · 택시 변경은 다음 영업에 적용됩니다` : `${garage.summary} · 모든 차량 도색: 색상당 ${garage.paintPrice}`,
    items: [...garage.paints, ...garage.liveries, ...garage.cars, ...garage.gear, back] };
  if (state.over) return { id: `${state.mode}-results`, title: `시간 종료 · ${result.cash}`,
    subtitle: [result.name, state.mode === 'demolition' ? result.next : result.best].filter(Boolean).join(' · '), hint: VR_POINTING,
    items: [item('retry', { primary: true }), item('keep'), item(state.mode === 'demolition' ? 'taxi' : 'garage', { value: undefined }), item('exit', { footer: true })] };
  if (!state.started) return { id: 'title', title: 'citydriver', wordmark: true, mark, hint: VR_CONTROLS,
    items: [item('start', { primary: true }), item('demolition'), item('free'), item('exit')] };
  if (!state.paused) return null;
  const drive = key => item(key, { group: "운전" });
  const view = key => item(key, { column: 1, group: "시점" });
  return { id: 'pause', title: "일시 정지", subtitle: [state.location.place, state.career].filter(Boolean).join(' · '), columns: 2,
    hint: state.mode === 'free' ? `${VR_CONTROLS} · Y: 내리기` : VR_CONTROLS, items: [
      item('resume', { primary: true, header: true }),
      ...(state.mode === 'taxi' ? ['end', 'free', 'demolition', 'garage'] : state.mode === 'demolition' ? ['restart', 'end', 'free', 'taxi']
        : [state.standby === 'taxi' ? 'free' : 'taxi', state.standby === 'demolition' ? 'free' : 'demolition', 'garage', 'autodrive', 'traffic']).map(drive),
      drive('driftTap'), drive('popups'), drive('reset'), item('map', { group: "도시" }), item('weather', { group: "도시" }),
      ...['view', 'recenter', 'lookSensitivity', 'comfort', 'graphics'].map(view), ...(state.rates.length ? [view('rate')] : []),
      item('sound', { column: 1, group: "소리" }), item('mix', { column: 1, group: "소리" }), item('vibration', { column: 1, group: "소리" }), item('exit', { footer: true }),
    ] };
}
