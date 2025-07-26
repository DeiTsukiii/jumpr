import BasicPlatform from "./basic.js";

export default class BouncePlatform extends BasicPlatform {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.setTint(0x00FF00);
        this.bounce = 800;
    }

    onHit(player) {
        super.onHit(player);

        if (!this.canTouch) return;

        if (this.bounce > 0) {
            player.setVelocityY(-this.bounce);
            this.bounce = 0;
            this.setTint(0xFFFFFF);
        }
    }
}
