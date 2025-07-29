import PreloadingScene from "./scenes/preloading.js";
import GameScene from "./scenes/game.js";
import UiScene from "./scenes/ui.js";
import HomeScene from "./scenes/home.js";

const urlParams = new URLSearchParams(window.location.search);
const debug = urlParams.get('debug') === 'true';

export const CONFIG = {
    type: Phaser.AUTO,
    backgroundColor: '#0E0E0E',
    scale: {
        mode: Phaser.Scale.EXPAND,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 450,
        height: innerHeight
    },
    parent: 'gameContainer',
    pixelArt: !debug,
    input: {
        activePointers: 3,
    },
    scene: [PreloadingScene, GameScene, UiScene, HomeScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: debug
        }
    }
}