// Fullscreen, Escape and pointer release have to agree on who paused the drive.
export function createFullscreen({ button, state, pause, toast, window = globalThis.window }) {
  const { document, navigator, performance } = window, desktop = window.citydriverDesktop;
  const display = window.matchMedia('(display-mode: fullscreen)');
  let pending = false, leaving = false, leftAt = -Infinity, releasedAt = -Infinity;
  let escapeKept = false, onResume = false, desktopActive = false, gestureTimer = 0, lockRequest = 0;
  const element = () => document.fullscreenElement || document.webkitFullscreenElement;
  const active = () => desktop ? desktopActive : Boolean(element() || display.matches);

  function update() {
    const on = active();
    if (button.getAttribute('aria-pressed') !== String(on)) button.setAttribute('aria-pressed', String(on));
    if (on) awaitGesture(false);
  }
  async function set(on, { quiet = false } = {}) {
    if (pending || on === active()) return;
    // F11 and an installed app's fullscreen belong to the browser.
    if (!desktop && !on && !element()) {
      if (!quiet) toast(window.matchMedia('(any-pointer: fine)').matches ? "F11을 눌러 전체 화면을 종료하세요" : "전체 화면은 브라우저에서 설정합니다");
      return;
    }
    const gesture = navigator.userActivation?.isActive ?? true;
    pending = true;
    try {
      if (!on) leftAt = performance.now();
      if (desktop) desktopActive = await desktop.toggleFullscreen();
      else if (!on) {
        leaving = true;
        await (document.exitFullscreen ?? document.webkitExitFullscreen).call(document);
      } else {
        const request = document.documentElement.requestFullscreen ?? document.documentElement.webkitRequestFullscreen;
        if (!request) { if (!quiet) toast("전체 화면 사용 불가"); return; }
        if (!gesture) { if (!quiet) { awaitGesture(true); toast("클릭하거나 아무 키나 누르면 전체 화면으로 전환합니다"); } return; }
        await request.call(document.documentElement);
      }
    } catch {
      leaving = false;
      leftAt = -Infinity;
      if (!quiet) toast("전체 화면 사용 불가");
    } finally { pending = false; update(); }
  }
  // A controller press has no browser gesture. Give the next click or key 10 s.
  function awaitGesture(on) {
    window.clearTimeout(gestureTimer);
    for (const type of ['pointerup', 'keydown']) window[on ? 'addEventListener' : 'removeEventListener'](type, onGesture, true);
    if (on) gestureTimer = window.setTimeout(() => awaitGesture(false), 10000);
  }
  function onGesture(event) {
    if (!event.isTrusted || (event.type === 'keydown' && (event.repeat || ['Escape', 'Shift', 'Control', 'Alt', 'Meta'].includes(event.key)))) return;
    awaitGesture(false);
    // F and the switch go fullscreen themselves.
    if (event.code === 'KeyF' || event.key === 'F11' || event.target.closest?.('#fullscreen')) return;
    void set(true, { quiet: true });
  }
  document.addEventListener('onfullscreenchange' in document ? 'fullscreenchange' : 'webkitfullscreenchange', () => {
    const request = ++lockRequest;
    update();
    if (element()) {
      escapeKept = false;
      // A permission result can arrive after this fullscreen session has ended.
      try {
        navigator.keyboard?.lock?.(['Escape'])?.then(() => { if (request === lockRequest) escapeKept = true; }, () => {});
      } catch { /* Fullscreen still works without Keyboard Lock. */ }
      return;
    }
    const kept = escapeKept; escapeKept = false;
    if (active()) return;
    const { started, paused, vr } = state();
    // A pointer release from the same Escape may already have paused it.
    const driving = started && !vr && (!paused || performance.now() - releasedAt < 500);
    if (!leaving && driving) { pause(); onResume = !kept; }
    leaving = false;
  });
  display.addEventListener?.('change', update);
  button.hidden = !desktop && !(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  update();
  if (desktop) {
    desktop.onFullscreenChange(on => { desktopActive = on; update(); });
    desktop.getFullscreen().then(on => { desktopActive = on; update(); });
  }
  return {
    get active() { return active(); },
    get recentlyReleased() { return performance.now() - releasedAt < 400; },
    toggle() { onResume = false; return set(!active()); },
    resume() {
      const { started, vr } = state();
      if (onResume && started && !vr) void set(true, { quiet: true });
      onResume = false;
    },
    captured() { leftAt = -Infinity; },
    released() {
      // Ignore the release caused by leaving fullscreen, never the player's
      // next Escape after the pointer has been taken again.
      if (performance.now() - leftAt < 1000) { leftAt = -Infinity; return false; }
      pause(); releasedAt = performance.now();
    },
  };
}
