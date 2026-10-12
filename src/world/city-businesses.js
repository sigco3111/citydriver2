import { CITY_PLACES, SPACE_NAMES } from './city-places.js';

// Display name and short building lettering. No advertising copy.
export const VENUE_BRANDS = {
  cinema: [["리볼리 영화관", "리볼리"], ["아폴로 영화관", "아폴로"], ["비주 영화관", "비주"]],
  hotel: [["그랜드 호텔", "그랜드 호텔"], ["메리골드 호텔", "메리골드"], ["웨이페어러 호텔", "웨이페어러"]],
  museum: [["시립 박물관", "시립 박물관"], ["메리디언 박물관", "메리디언"], ["호기심 박물관", "호기심"]],
  station: [["유니언역", "유니언"], ["북극성역", "북극성"], ["정션역", "정션"]],
  library: [["중앙 도서관", "중앙 도서관"], ["랜턴 도서관", "랜턴 도서관"], ["단풍 도서관", "단풍 도서관"]],
  hospital: [["시립 병원", "시립 병원"], ["머시 병원", "머시 병원"], ["그린웨이 병원", "그린웨이"]],
  observatory: [["별빛 천문대", "천체관"], ["오리온 천문대", "오리온"], ["달맞이 천문대", "달맞이"]],
  music: [["블루노트 클럽", "블루노트"], ["브라스핀치", "브라스핀치"], ["벨벳에코", "벨벳에코"]],
  sports: [["체육 클럽", "체육 클럽"], ["랠리 스포츠 클럽", "랠리 클럽"], ["그린코트 클럽", "그린코트"]],
  firehouse: [["소방서", "소방서"], ["파운드리 소방서", "파운드리"], ["비컨 소방서", "비컨"]],
  postoffice: [["중앙 우체국", "우체국"], ["페니 우체국", "페니 우체국"], ["소포 우체국", "소포 우체국"]],
  bathhouse: [["모자이크 목욕탕", "모자이크 목욕탕"], ["고요한 물 목욕탕", "고요한 물"], ["주니퍼 온천", "주니퍼 온천"]],
  farmersmarket: [["수확 시장", "수확 시장"], ["햇살 시장", "햇살 시장"], ["모임 시장", "모임 시장"]],
  donut: [["럭키 도넛", "럭키 도넛"], ["글레이즈 데이즈", "글레이즈 데이즈"], ["도시도 도넛", "도시도 도넛"]],
};
export function venueBrand(type, variant) {
  const brand = VENUE_BRANDS[type]?.[variant];
  return brand ? { name: brand[0], lettering: brand[1] } : null;
}
// What a place is called, on its sign and to a passenger: a venue by its
// brand, City Hall as City Hall, and anywhere else by its own name (Bell
// Court, a clocktower square; Carriage Works, a tram depot)
export function placeName(type, variant) {
  return venueBrand(type, variant)?.name ?? (type === 'cityhall' ? CITY_PLACES.cityhall.name : SPACE_NAMES[type]?.[variant] ?? CITY_PLACES[type].name);
}
