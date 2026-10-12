import './camera-controls.css';
import { CAMERA_VIEWS, CAMERA_ZOOM_MIN, CAMERA_ZOOM_MAX } from './camera-preferences.js';
import { pressOnRelease } from './touch-stick.js';

// Desktop and touch use native settings controls. Headset menus read the same
// preference model through menuControls, never these labels or DOM values.
export function setupCameraControls(rendering, { action, chooseView, changed, inputSource }) {
  const preferences = rendering.cameraPreferences, $ = id => document.getElementById(id);
  const panel = $('camera-settings'), toggle = $('camera-toggle'), source = $('camera-source');
  const view = $('camera-view'), distance = $('camera-distance'), sensitivity = $('look-sensitivity');
  view.replaceChildren(...CAMERA_VIEWS.map((view, index) => new Option(view.label, index)));
  source.value = inputSource();
  function refresh() {
    const chase = rendering.chaseView, firstPerson = rendering.firstPersonView, perspective = rendering.camera.isPerspectiveCamera;
    view.value = String(rendering.viewIndex);
    $('camera-summary').textContent = rendering.viewLabel;
    $('camera-profile-note').textContent = `운전과 도보의 시점·거리는 따로 저장됩니다. 현재: ${rendering.cameraMode === 'walking' ? '도보' : '운전'}.`;
    distance.value = String(Math.round(rendering.zoomLevel * 100)); distance.disabled = !chase;
    $('camera-distance-value').textContent = `${rendering.zoomLevel.toFixed(2).replace(/0$/, '')}×`;
    distance.setAttribute('aria-valuetext', `기본 거리의 ${rendering.zoomLevel.toFixed(2)}배`);
    distance.style.setProperty('--control-level', `${(rendering.zoomLevel - CAMERA_ZOOM_MIN) / (CAMERA_ZOOM_MAX - CAMERA_ZOOM_MIN) * 100}%`);
    $('camera-recenter').disabled = !perspective;
    $('camera-recenter').querySelector('.panel-button-value').textContent = inputSource() === 'touch' ? '' : inputSource() === 'controller' ? 'R3' : 'Q';
    $('camera-tools').hidden = !perspective;
    for (const button of document.querySelectorAll('[data-camera-action]')) {
      const name = button.dataset.cameraAction;
      button.hidden = name === 'zoomOut' ? !perspective : name === 'zoomIn' && !chase;
      button.disabled = name === 'zoomIn' ? firstPerson
        : name === 'zoomOut' ? !firstPerson && rendering.zoomLevel >= CAMERA_ZOOM_MAX - 1e-6 : false;
      if (name === 'zoomIn' || name === 'zoomOut') {
        const label = name === 'zoomOut' ? firstPerson ? "3인칭 시점으로 전환" : "카메라 멀리 이동"
          : rendering.zoomLevel <= CAMERA_ZOOM_MIN + 1e-6 ? "1인칭 시점으로 전환" : "카메라 가까이 이동";
        button.title = label; button.setAttribute('aria-label', label);
      }
    }
    const settings = preferences.inputs[source.value], percent = Math.round(settings.sensitivity * 100);
    sensitivity.value = String(percent);
    sensitivity.style.setProperty('--control-level', `${(percent - 25) / 175 * 100}%`);
    sensitivity.setAttribute('aria-valuetext', `${percent}%${percent === 100 ? ', default' : ''}`);
    $('look-sensitivity-value').textContent = `${percent}%${percent === 100 ? " · 기본값" : ''}`;
    $('invert-look').setAttribute('aria-pressed', String(settings.invertY));
    $('reset-look').disabled = settings.sensitivity === 1 && !settings.invertY;
  }
  toggle.addEventListener('click', () => {
    panel.hidden = !panel.hidden; toggle.setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) { source.value = inputSource(); refresh(); }
  });
  view.addEventListener('change', () => chooseView(Number(view.value)));
  distance.addEventListener('input', () => { if (!rendering.chaseView) return; rendering.setZoom(Number(distance.value) / 100, true); changed(); });
  $('camera-recenter').addEventListener('click', () => action('recenter'));
  source.addEventListener('change', refresh);
  sensitivity.addEventListener('input', () => preferences.setInput(source.value, { sensitivity: Number(sensitivity.value) / 100 }));
  $('invert-look').addEventListener('click', () => preferences.setInput(source.value, { invertY: !preferences.inputs[source.value].invertY }));
  $('reset-look').addEventListener('click', () => preferences.resetInput(source.value));
  for (const button of document.querySelectorAll('[data-camera-action]')) pressOnRelease(button, () => action(button.dataset.cameraAction));
  preferences.onChange(refresh); refresh();
  return { refresh };
}
