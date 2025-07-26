import BasicPlatform from './basic.js'
import BreakablePlatform from './breakable.js';
import BouncePlatform from './bounce.js';
import MovingPlatform from './moving.js';

export { BasicPlatform, BreakablePlatform, BouncePlatform, MovingPlatform };

export const spawnRates = {
    breakable: 10,
    bounce: 20,
    moving: 30,
}