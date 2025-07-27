import BasicPlatform from "./basic.js";

export default class InvisiblePlatform extends BasicPlatform {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.setTint(0x00FFFF);
        this.setAlpha(0);

        setInterval(() => {
            this.setAlpha(this.alpha === 0 ? 1 : 0);
        }, 3000);
    }
}
