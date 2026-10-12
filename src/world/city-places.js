// The kinds of place a passenger might ask for, and the notebook that records
// the ones the driver has found. `label` is what the notebook calls a kind;
// `name` is only the fallback for a place with no name of its own.
export const CITY_PLACES = Object.freeze({
  clock: { name: "시계탑", label: "시계탑 광장", short: "시계탑과 광장", color: '#eac482', symbol: 'I', description: "포장된 광장 위에 솟은 높은 시계탑입니다." },
  market: { name: "시장", label: "시장 홀", short: "시장 홀과 가판대", color: '#ee9a78', symbol: 'II', description: "아치형 시장 홀 앞 포장도로에 가판대가 늘어서 있습니다." },
  garden: { name: "정원", label: "식물원", short: "온실과 화단", color: '#a7cfaa', symbol: 'III', description: "원형 광장 안의 온실과 산책로를 따라 이어지는 화단입니다." },
  depot: { name: "트램 차고", label: "트램 차고", short: "트램과 정비소", color: '#8fbfce', symbol: 'IV', description: "톱니형 지붕 정비소에서 선로가 이어지며 측선에는 트램이 있습니다." },
  art: { name: "조각 공원", label: "조각 정원", short: "조각과 연못", color: '#c6ade0', symbol: 'V', description: "둥근 연못의 조각과 산책로에 놓인 작은 작품들입니다." },
  cinema: { name: "리볼리 영화관", label: "영화관", short: "영화와 낮 상영", color: '#ef997e', symbol: 'VI', description: "불 켜진 간판, 문 옆 포스터 진열장, 작은 매표소입니다." },
  hotel: { name: "그랜드 호텔", label: "호텔", short: "탑과 테라스", color: '#e8c477', symbol: 'VII', description: "계단형 구리 지붕의 높은 탑과 입구의 카페 테이블입니다." },
  museum: { name: "시립 박물관", label: "박물관", short: "미술과 건축", color: '#e1b18b', symbol: 'VIII', description: "구리 돔 아래 기둥이 늘어선 홀과 잔디밭의 조각들입니다." },
  station: { name: "유니언역", label: "기차역", short: "열차와 승강장", color: '#94c9c7', symbol: 'IX', description: "시계가 달린 아치형 역사와 승강장에서 대기하는 열차입니다." },
  library: { name: "중앙 도서관", label: "도서관", short: "책과 독서 정원", color: '#b5c798', symbol: 'X', description: "지붕의 유리 채광창과 울타리로 둘러싼 독서 정원입니다." },
  hospital: { name: "시립 병원", label: "병원", short: "병원과 치유 정원", color: '#a4d8d0', symbol: 'XI', description: "붉은 십자가가 있는 현관과 연못 주위의 조용한 정원입니다." },
  observatory: { name: "별빛 천문대", label: "천문대", short: "천체관과 별 관측", color: '#a7b5e5', symbol: 'XII', description: "나침반 모양 정원 안에 망원경이 펼쳐진 구리 돔이 있습니다." },
  music: { name: "블루노트 클럽", label: "재즈 클럽", short: "라이브 음악", color: '#d5a3cb', symbol: 'XIII', description: "네온과 정면의 피아노 건반, 문 옆 공연 포스터입니다." },
  sports: { name: "체육 클럽", label: "스포츠 클럽", short: "코트와 클럽하우스", color: '#b9cf85', symbol: 'XIV', description: "클럽하우스 앞 테니스장과 농구장, 양쪽 관람석입니다." },
  firehouse: { name: "소방서", label: "소방서", short: "역사적인 소방서", color: '#e99883', symbol: 'XV', description: "빨간 차고 문과 호스 건조탑, 오래된 소방차입니다." },
  park: { name: "동네 정원", label: "공원", short: "잔디밭과 산책로, 연못", color: '#aac793', symbol: 'XVI', description: "도시의 넓은 녹지입니다. 긴 산책로와 잔디밭, 숲과 연못이 있습니다." },
  plaza: { name: "도시 광장", label: "분수 광장", short: "분수와 카페 테이블", color: '#dfc6a0', symbol: 'XVII', description: "포장된 광장의 분수 옆에 카페 테이블이 놓여 있습니다." },
  postoffice: { name: "중앙 우체국", label: "우체국", short: "편지와 소포", color: '#e6b284', symbol: 'XVIII', description: "봉투 문장과 우편 분류실 채광창, 입구 우체통입니다." },
  bathhouse: { name: "모자이크 목욕탕", label: "공중 목욕탕", short: "수영장과 타일 회랑", color: '#90c9c8', symbol: 'XIX', description: "타일 회랑 뒤 테라코타 지붕과 바깥 수영장 테라스입니다." },
  farmersmarket: { name: "수확 시장", label: "농산물 시장", short: "가판대와 빵집", color: '#dfc68a', symbol: 'XX', description: "줄무늬 가판대와 빵집 매대, 커피 테이블이 늘어서 있습니다." },
  donut: { name: "럭키 도넛", label: "도넛 가게", short: "도넛과 커피", color: '#e6a2b3', symbol: 'XXI', description: "파스텔색 식당 지붕의 거대한 도넛과 야외 테이블입니다." },
  cityhall: { name: "시청", label: "시청", short: "시청사와 시계탑", color: '#d8c59d', symbol: 'XXII', description: "기둥과 의전 계단, 구리 돔과 시계탑, 양쪽 분수가 있습니다." },
});
export const PLACE_TYPES = Object.keys(CITY_PLACES);
export const LANDMARK_TYPES = PLACE_TYPES.filter(type => type !== 'park' && type !== 'plaza');
// Each kind's variant names. A park or a square goes by its name here; a
// venue's variant picks its brand and its sign (see city-businesses.js), so
// its names here only count its variants.
export const SPACE_NAMES = Object.freeze({
  clock: ["시계탑 광장", "종 광장", "종소리 테라스"], market: ["시장 홀", "실내 시장", "상인 거리"],
  garden: ["식물원", "온실 산책로", "장미 테라스"], depot: ["트램 차고", "전차 정비소", "철도 차고"],
  art: ["조각 공원", "돌 정원", "청동 광장"], cinema: ["아르데코 영화관", "네온 간판", "작은 상영관"],
  hotel: ["웅장한 입구", "정원 테라스", "구리 지붕"], museum: ["기둥 회랑과 앞마당", "조각 광장", "유리 갤러리"],
  station: ["아치형 역사", "역 시계", "승강장 지붕"], library: ["독서 정원", "채광 홀", "고요한 광장"],
  hospital: ["치유 정원", "환자 출입구", "밝은 병동"], observatory: ["구리 돔", "천체 정원", "망원경 테라스"],
  music: ["안뜰 무대", "피아노 외벽", "네온 클럽"], sports: ["클럽하우스 코트", "관람석", "육상 트랙"],
  firehouse: ["소방차 차고 문", "호스 건조탑", "역사적인 소방차"], park: ["버드나무 녹지", "피나무 정원", "초원 공원", "과수원 산책로"],
  plaza: ["분수 광장", "시장 광장", "구시가지 광장", "역 광장", "항구 광장", "기념 광장"], postoffice: ["우편 분류실", "봉투 문장", "소포 마당"],
  bathhouse: ["타일 정자", "청록색 수영장", "기둥 테라스"], farmersmarket: ["농산물 가판대", "꽃 가판대", "커피 안뜰"],
  donut: ["거대한 도넛", "파스텔 식당", "커피 테라스"], cityhall: ["시청사"],
});
// Where each kind of venue is at home: the districts that favor it
export const VENUE_DISTRICTS = {
  Midtown: ['hotel', 'cinema', 'museum', 'station', 'music', 'hospital'],
  'Old town': ['museum', 'market', 'bathhouse', 'donut', 'music', 'postoffice'],
  'Market district': ['market', 'donut', 'cinema', 'postoffice', 'firehouse', 'music', 'hotel'],
  'Civic quarter': ['library', 'museum', 'hospital', 'postoffice', 'firehouse', 'observatory', 'hotel'],
  'Garden quarter': ['observatory', 'sports', 'bathhouse', 'library', 'donut'],
  'Warehouse district': ['depot', 'station', 'market', 'firehouse', 'sports', 'music'],
};
// and the ones out of place in the quiet streets of the Garden quarter
export const NOT_IN_GARDENS = new Set(['music', 'hotel', 'cinema']);
