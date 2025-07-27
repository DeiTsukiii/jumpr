import BasicPlatform from './basic.js'
import BreakablePlatform from './breakable.js';
import BouncePlatform from './bounce.js';
import MovingPlatform from './moving.js';
import InvisiblePlatform from './invisible.js';

export { BasicPlatform, BreakablePlatform, BouncePlatform, MovingPlatform, InvisiblePlatform };

export const spawnRates = {
    'BreakablePlatform': 10,
    'BouncePlatform': 10,
    'MovingPlatform': 10,
    'InvisiblePlatform': 10,
}