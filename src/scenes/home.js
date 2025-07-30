export default class HomeScene extends Phaser.Scene {
    constructor() {
        super('HomeScene');
    }

    _createBg() {
        for (let i = 0; i < window.innerHeight / 5; i++) {
            const x = Phaser.Math.Between(0, 450);
            const y = Phaser.Math.Between(0, window.innerHeight);
            const alpha = Phaser.Math.FloatBetween(0.3, 0.8);
            const size = Phaser.Math.Between(8, 10);
            this.stars.push({ x, y, alpha, size });
        }

        this.stars.forEach(starData => this.add.image(starData.x, starData.y, 'flares', 'white')
            .setDisplaySize(starData.size, starData.size)
            .setScrollFactor(0)
            .setDepth(10)
            .setAlpha(starData.alpha));
    }

    _createPlayer() {
        this.player = this.physics.add.sprite(this.center.x, 700 - this.center.y - 50, 'whiteRect')
            .setDisplaySize(40, 40)
            .setBounce(0)
            .setOrigin(0.5, 1)
            .setCollideWorldBounds(true)
            .setDepth(10)
            .setVelocityY(400);
        this.player.body.moves = false;
        this.cameras.main.startFollow(this.player, false);
        this.cameras.main.setBounds(0, -99300, 450, 100000);
        this.physics.world.setBounds(0, -99300, 450, 100000);

        this.add.particles(0, 0, 'flares', {
            frame: 'white',
            scale: { start: 0.2, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            blendMode: 'ADD',
            follow: this.player,
            followOffset: { y: -20, x: 0 },
            speedY: -400,
            speedX: { min: -2, max: 2 },
        });
    }

    _createGround() {
        const ground = this.physics.add.staticImage(225, 700, 'whiteRect')
            .setDisplaySize(450, 40)
            .setOrigin(0.5, 1)
            .refreshBody();
        this.physics.add.collider(this.player, ground, () => {
            this.scene.start('GameScene', { stars: this.stars });
            this.scene.stop('HomeScene');
        }, null, this);
    }

    _setMenu() {
        const menu = this.add.container(this.center.x, this.center.y)
            .setDepth(100)
            .setScrollFactor(0);

        const mainClicker = this.add.rectangle(0, 0, this.center.x * 2, this.center.y * 2, 0x000000, 0)
            .setScrollFactor(0)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.player.body.moves = true);

        const tapToPlay = this.add.text(0, 230, "Tap to play", { font: '18px ' + this.font, fill: '#fff' })
            .setOrigin(0.5)
            .setAlpha(0.7);

        const settingIcon = this.add.image(215, 10-this.center.y, 'settingsIcon')
            .setOrigin(1, 0)
            .setDepth(11)
            .setScrollFactor(0)
            .setDisplaySize(30, 30)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {});

        menu.add([mainClicker, tapToPlay, settingIcon]);
    }

    create() {
        this.font = 'Monocraft';
        this.center = {
            x: this.sys.game.config.width / 2,
            y: this.sys.game.config.height / 2
        };
        this.stars = [];

        this._createBg();
        this._createPlayer();
        this._createGround();
        this._setMenu();
    }
}