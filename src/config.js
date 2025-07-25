import { preload, update, create } from "./game.js";

export const CONFIG = {
    type: Phaser.AUTO,
    backgroundColor: '#0E0E0E',
    scale: {
        mode: Phaser.Scale.EXPAND,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 450,
        height: innerHeight
    },
    parent: 'game-container',
    pixelArt: true,
    input: {
        activePointers: 3,
    },
    scene: {
        preload,
        create,
        update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    }
}