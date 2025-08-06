import BasicPlatform from "./basic.js";

export default class MovingPlatform extends BasicPlatform {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.limits = { min: 20, max: 430 };
        this.direction = 1;

        this.setTint(0x0000FF);

        this.fireParticles = this.scene.add.particles(0, 0, 'flares', {
            frame: 'yellow',
            scale: { start: 0.2, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            blendMode: 'ADD',
            follow: this,
            followOffset: { y: 15, x: -15 },
        });
    }

    update(time, delta) {
        super.update(time, delta);
        if (!this.body) return;
        this.x += 2 * this.fallRate * this.direction * (1 / 1000) * delta;
        this.fireParticles.followOffset.x = 15 * -this.direction;
        if (this.x < this.limits.min|| this.x > this.limits.max) this.direction *= -1;
    }

    destroy() {
        this.fireParticles.destroy();
        super.destroy();
    }
}
