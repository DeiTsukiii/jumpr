import BasicPlatform from "./basic.js";

export default class BreakablePlatform extends BasicPlatform {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.setTexture('platform-breakable');
        this.touchs = 0;
    }

    break() {
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

    onHit(player) {
        super.onHit(player);

        if (!this.canTouch || !this.active) return;
        this.touchs++;
        const haveFeather = this.scene.items.feather.value > 0;
        if (haveFeather && this.touchs >= 3) this.break();
        else if (!haveFeather && this.touchs >= 1) this.break();
    }
}
