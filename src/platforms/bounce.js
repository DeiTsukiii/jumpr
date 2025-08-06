import BasicPlatform from "./basic.js";

export default class BouncePlatform extends BasicPlatform {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.setTexture('platform-bounce');
    }

    onHit(player) {
        super.onHit(player);

        if (!this.canTouch || !this.active) return;
        player.setVelocityY(-800);
    }
}
