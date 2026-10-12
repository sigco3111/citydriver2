// End-of-shift taxi licenses, after Crazy Taxi's results screen. Each class
// asks for twice the cash of the one before, which tracks how earnings grow
// with skill: a first shift lands around Class E, a strong one in Class A,
// and only a shift that keeps its clock alive for many minutes reaches the top.
export const TAXI_LICENSES = [
  { id: 'none', badge: '–', name: "면허 없음", min: 0 },
  { id: 'e', badge: 'E', name: "E급", min: 250 },
  { id: 'd', badge: 'D', name: "D급", min: 500 },
  { id: 'c', badge: 'C', name: "C급", min: 1000 },
  { id: 'b', badge: 'B', name: "B급", min: 2000 },
  { id: 'a', badge: 'A', name: "A급", min: 4000 },
  { id: 's', badge: 'S', name: "S급", min: 8000 },
  { id: 'legend', badge: '★', name: "전설", min: 16000 },
];

export function taxiLicense(cash = 0) {
  const rank = TAXI_LICENSES.findLastIndex(license => cash >= license.min);
  return { ...TAXI_LICENSES[rank], rank, next: TAXI_LICENSES[rank + 1] ?? null };
}
