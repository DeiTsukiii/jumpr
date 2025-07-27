import BasicPlatform from "./basic.js";

export default class BreakablePlatform extends BasicPlatform {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.setTint(0xff0000);
    }

    onHit(player) {
        super.onHit(player);

        if (!this.canTouch || !this.active) return;
        this.scene.tweens.add({
            targets: this,
            y: this.y + 10,
            duration: 100,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                if (this.y < this.scene.ground.y - 100) this.setX(1000);
                this.canTouch = false;
            }
        });
    }
}
