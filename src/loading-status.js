// The loading screen's line of progress: what is being built now. Each stage
// of the city is shown before it begins, and the page is given a frame to
// draw it (the build itself allows none). Outside a page, the tests and
// scripts, the stages simply run on.
export const LOADING_STAGES = {
  coast: "해안선 생성 중…", streets: "도로 생성 중…", junctions: "교차로 생성 중…",
  waterfront: "수변 생성 중…", pavements: "필지 생성 중…",
  bridges: "다리 생성 중…", furniture: "거리 시설 배치 중…", buildings: "건물 생성 중…",
  skyline: "스카이라인 불러오는 중…", graphics: "셰이더 준비 중…",
};

export function startupErrorMessage(error) {
  return /Error creating WebGL context|WebGL 1 is not supported/i.test(error?.message ?? '')
    ? "WebGL 2가 필요합니다. 브라우저를 업데이트하고 하드웨어 가속을 켜세요."
    : "게임을 불러오지 못했습니다. 다시 시도를 눌러 새로 고침하세요.";
}

export function loadingStage(stage) {
  const line = globalThis.document?.getElementById('loading-status');
  if (!line) return Promise.resolve();
  line.textContent = LOADING_STAGES[stage] ?? line.textContent;
  // (a frame drawn, or a moment if the page is hidden and draws none)
  return new Promise(resolve => {
    const timer = setTimeout(resolve, 100);
    if (!document.hidden) requestAnimationFrame(() => setTimeout(() => { clearTimeout(timer); resolve(); }));
  });
}

// A staged build (a generator yielding each stage as it begins) run to its
// end, each stage shown on the loading screen
export async function throughStages(stages) {
  for (;;) {
    const { done, value } = stages.next();
    if (done) return value;
    await loadingStage(value);
  }
}
