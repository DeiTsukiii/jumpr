export default class BasicPlatform extends Phaser.GameObjects.Image {
    constructor(scene, x, y) {
        super(scene, x, y, 'whiteRect');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDisplaySize(30, 30);
        this.setOrigin(0.5, 0);
        this.canTouch = true;
        this.scene = scene;
        this.body.setImmovable(true);
        this.body.setAllowGravity(false);
        this.hitSound = 'platformSound';
    }

    onHit(player) {
        if (!this.canTouch) return;
        player.setVelocityY(-600);
        this.scene.sound.play(this.hitSound);
    }

    despawn(callback = () => {}) {
        this.scene.tweens.add({
            targets: this,
            y: this.y + 10,
            duration: 100,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                if (this.y < this.scene.ground.y - 100) this.setX(1000);

                // this.scene.scoreTot += this.scene.score;
                // this.scene.score += 1;
                // this.scene.scoreText.setText(this.scene.scoreTot);

                callback();
            }
        });
    }
}