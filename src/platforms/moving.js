import BasicPlatform from "./basic.js";

export default class MovingPlatform extends BasicPlatform {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.limits = { min: 20, max: 430 };
        this.direction = 1;

        this.setTint(0x0000FF);
    }

    update(time, delta) {
        super.update(time, delta);
        if (!this.body) return;
        this.x += 2 * this.fallRate * this.direction * (1 / 1000) * delta;
        if (this.x < this.limits.min|| this.x > this.limits.max) this.direction *= -1;
    }
}
