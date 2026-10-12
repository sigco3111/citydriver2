// The garage's paint counter. Twelve mixed colors keep a repainted car inside
// the game's slightly dusty, faceted palette; the custom well covers anything
// else. One color dresses the whole garage rather than a car at a time, and
// Default hands every car the finish it arrived in back. It is saved with
// the fleet, since a new color costs PAINT_PRICE.
export const PAINTS = [
  { name: "노을 산호색", color: '#d96143' },
  { name: "신호등 빨강", color: '#b8232f' },
  { name: "귤색", color: '#e08a33' },
  { name: "사막 겨자색", color: '#e0b44a' },
  { name: "세이지 초록", color: '#78977b' },
  { name: "숲 초록", color: '#3f6b4a' },
  { name: "바다 유리색", color: '#6fa9c2' },
  { name: "밤하늘 파랑", color: '#2f4a6d' },
  { name: "빙하색", color: '#9fc4d5' },
  { name: "진한 자두색", color: '#6b4a6b' },
  { name: "아이보리", color: '#e7e3d5' },
  { name: "흑연색", color: '#4a5257' },
];

// The one swatch that is not a color: it clears whatever the garage is wearing.
export const DEFAULT_PAINT = 'default';
export const DEFAULT_PAINT_NAME = "차량 기본색";
// The Konami code's paint: the car runs through every hue (see
// ActorMotion.updatePaint). Its swatch is a wheel of them.
export const RAINBOW_PAINT = 'rainbow', RAINBOW_NAME = "무지개";
export const RAINBOW_SWATCH = 'conic-gradient(#ff4d4d, #ffd84d, #5ee05e, #4dd8ff, #6a5cff, #ff4dd2, #ff4d4d)';
// A new color costs this much (going back to the cars' own is free)
export const PAINT_PRICE = 100;

const HEX = /^#[0-9a-f]{6}$/i;
export const isPaint = value => typeof value === 'string' && HEX.test(value);
// A swatch either names a color or asks for the cars' own finishes back.
export const readPaint = value => (isPaint(value) ? value.toLowerCase() : null);
export const paintName = color => PAINTS.find(paint => paint.color === color)?.name ?? null;
