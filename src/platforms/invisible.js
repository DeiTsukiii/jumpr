import BasicPlatform from "./basic.js";

export default class InvisiblePlatform extends BasicPlatform {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.setTexture('platform-invisible');
        this.setDisplaySize(30, 30);
        this.setOrigin(0.5, 0);
        this.setAlpha(0);

        this.nextReveal = 0;
    }

    reveal() {
        if (!this.body) return;
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 200,
            onComplete: () => {
                if (!this.body) return;
                this.scene.tweens.add({
                    targets: this,
                    alpha: 0,
                    duration: 200
                });
            }
        });
    }

    update(time, delta) {
        super.update(time, delta);
        if (!this.body) return;
        if (this.nextReveal > 0 && time > this.nextReveal) {
            this.nextReveal = time + Phaser.Math.Between(2000, 4000);
            this.reveal();
        } else if (this.nextReveal === 0) this.nextReveal = time + Phaser.Math.Between(2000, 4000);
    }
}
