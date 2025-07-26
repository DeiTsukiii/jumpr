import BasicPlatform from './basic.js'
import BreakablePlatform from './breakable.js';
import BouncePlatform from './bounce.js';
import MovingPlatform from './moving.js';

export { BasicPlatform, BreakablePlatform, BouncePlatform, MovingPlatform };

export const spawnRates = {
    'BreakablePlatform': 10,
    'BouncePlatform': 20,
    'MovingPlatform': 30,
}