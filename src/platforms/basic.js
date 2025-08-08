export default class BasicPlatform extends Phaser.GameObjects.Image {
    constructor(scene, x, y) {
        super(scene, x, y, 'platform-basic');
        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDisplaySize(30, 30);
        this.setTint(0x8ba3bb);
        this.setOrigin(0.5, 0);
        this.canTouch = true;
        this.active = true;
        this.body.setImmovable(true);
        this.body.setAllowGravity(false);
        this.hitSound = 'platformSound';

        if (Math.random() < this.scene.spawnRates.pieces) this.setItem('money');
        else if (Math.random() < this.scene.spawnRates.items) {
            const items = [...Object.keys(this.scene.items), 'mystery'];
            const randomItem = Phaser.Utils.Array.GetRandom(items);
            this.setItem(randomItem);
        }
        this.fallRate = 30;

        this.scene.physics.add.collider(this.scene.player, this, this.hitHandler.bind(this), null, this.scene);
    }

    hitHandler(player) {
        const playerBottom = player.getBounds().bottom;
        const platformTop = this.getBounds().top;
        const tolerance = 15;

        if (Math.abs(playerBottom - platformTop) > tolerance) {
            if (this.scene.items.star.value > 0 && this.canTouch && this.active) player.setPosition(this.x, this.y + player.height/2 + this.height/2);
            else return;
        }
        this.onHit(player);
    }

    onHit(player) {
        if (!this.scene.started) this.scene.started = true;
        player.setVelocityY(this.scene.items.star.value > 0 ? -700 : -600);
        const sfxVolume = this.scene._getSetting('sfx') ? this.scene._getSetting('sfxVol') / 100 : 0;
        this.scene.sound.play(this.hitSound, { volume: sfxVolume });
        if (this.item) this.claimItem();
    }

    update(time, delta) {
        if (!this.body) return;
        this.y += this.fallRate * (1 / 1000) * delta;
        if (this.item) {
            this.item.setPosition(this.x, this.y - 17 - Math.sin(time * 0.002) * 5);
            this.item.alpha = this.alpha;
        } else if (this.piece) {
            this.piece.setPosition(this.x, this.y - 17 - Math.sin(time * 0.002) * 5);
            this.piece.alpha = this.alpha;
        }
    }

    claimItem() {
        if (!this.item || !this.scene) return;
        this.scene._circleStarsFX(this.item.x, this.item.y);
        const item = this.item.texture.key.replace('item-', '');
        if (item === 'money') this.addMoney(1);
        else this.scene._getItem(item === 'mystery' ? Phaser.Utils.Array.GetRandom(Object.keys(this.scene.items)) : item);
        this.item.destroy();
        this.item = null;
    }

    destroy() {
        if (this.item) this.item.destroy();
        super.destroy();
    }

    setItem(item) {
        this.item = this.scene.add.image(this.x, this.y - 17, `item-${item}`).setDisplaySize(25, 25).setOrigin(0.5, 0.5);
    }

    addMoney(amount) {
        let nb = Number(localStorage.getItem('JumprMoney'));
        localStorage.setItem('JumprMoney', nb + amount);
    }
}