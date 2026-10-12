import { CitydriverWorld } from './world/citydriver-world.js';
import { citydriverRoute } from './world/city-route.js';

// A single connected city, sharing the garage and renderer scene interface.
export const JOURNEYS = {
  city: {
    label: 'CITYDRIVER', routeNumber: '1',
    World: CitydriverWorld, route: citydriverRoute,
    sound: "소리 켬",
    canvas: "WASD 또는 방향키로 운전하세요.",
  },
};
