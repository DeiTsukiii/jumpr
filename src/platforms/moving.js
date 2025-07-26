import BasicPlatform from "./basic.js";

export default class MovingPlatform extends BasicPlatform {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.limits = { min: 20, max: 430 };
        this.direction = 1;
        setInterval(() => {
            if (!this.body) return;
            if (this.x < this.limits.min|| this.x > this.limits.max) this.direction *= -1;
            this.x += 2 * this.direction;
        }, 30);

        this.setTint(0x0000FF);
    }
}
