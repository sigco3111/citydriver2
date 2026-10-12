const LABELS = { master: "전체 음량", engine: "엔진", road: "타이어와 바람", ambience: "환경음", traffic: "교통", cues: "게임 알림음" };
const PRESETS = { balanced: "균형", scenic: "풍경", night: "야간 주행" };

export function setupAudioMixer(audio) {
  const toggle = document.querySelector('#audio-mixer-toggle');
  const panel = document.querySelector('#audio-mixer');
  panel.innerHTML = `<div class="audio-presets" role="group" aria-label="소리 프리셋">${Object.entries(PRESETS).map(([id, label]) => `<button type="button" data-audio-preset="${id}" aria-pressed="false">${label}</button>`).join('')}</div>
    <div class="audio-channels">${Object.entries(LABELS).map(([id, label]) => `<div class="audio-channel"><label for="audio-${id}">${label}</label><output for="audio-${id}" id="audio-${id}-value"></output><input id="audio-${id}" data-audio-channel="${id}" type="range" min="0" max="100" step="1" aria-describedby="audio-mix-help"></div>`).join('')}</div>
    <button type="button" id="audio-night" class="panel-toggle" aria-pressed="false"><span>큰 소리 줄이기</span><span class="panel-switch" aria-hidden="true"></span></button>
    <p class="audio-description" id="audio-mix-help">설정 저장됨. 계속하기를 눌러 들어 보세요.</p>`;
  const inputs = [...panel.querySelectorAll('[data-audio-channel]')];
  const presets = [...panel.querySelectorAll('[data-audio-preset]')];
  function refresh() {
    for (const input of inputs) {
      const value = Math.round(audio.mix[input.dataset.audioChannel] * 100);
      input.value = value;
      input.style.setProperty('--audio-level', `${value}%`);
      input.setAttribute('aria-valuetext', value === 0 ? "끔" : `${value}퍼센트`);
      document.getElementById(`${input.id}-value`).value = value === 0 ? "끔" : `${value}%`;
    }
    for (const button of presets) button.setAttribute('aria-pressed', String(button.dataset.audioPreset === audio.preset));
    document.querySelector('#audio-night').setAttribute('aria-pressed', String(audio.mix.night));
    document.querySelector('#audio-mix-label').textContent = PRESETS[audio.preset] ?? "사용자 지정";
  }
  toggle.addEventListener('click', () => { panel.hidden = !panel.hidden; toggle.setAttribute('aria-expanded', String(!panel.hidden)); });
  for (const input of inputs) input.addEventListener('input', () => { audio.setMix(input.dataset.audioChannel, Number(input.value) / 100); refresh(); });
  for (const button of presets) button.addEventListener('click', () => { audio.setPreset(button.dataset.audioPreset); refresh(); });
  document.querySelector('#audio-night').addEventListener('click', () => { audio.setMix('night', !audio.mix.night); refresh(); });
  refresh();
  return refresh;
}
