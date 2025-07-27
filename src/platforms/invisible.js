import BasicPlatform from "./basic.js";

export default class InvisiblePlatform extends BasicPlatform {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.setTint(0x00FFFF);
        this.setAlpha(0);

        setTimeout(() => this.reveal(), Phaser.Math.Between(2000, 4000));
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
                    duration: 200,
                    onComplete: () => setTimeout(() => this.reveal(), Phaser.Math.Between(2000, 4000))
                });
            }
        });
    }
}
