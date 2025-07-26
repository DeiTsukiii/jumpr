import BasicPlatform from "./basic.js";

export default class BreakablePlatform extends BasicPlatform {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.setTint(0xff0000);
    }

    onHit(player) {
        super.onHit(player);

        if (!this.canTouch) return;
        super.despawn(() => this.canTouch = false);
    }
}
