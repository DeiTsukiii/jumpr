export default class HomeScene extends Phaser.Scene {
    constructor() {
        super('HomeScene');
    }

    create() {
        this.font = 'Monocraft';
        this.center = {
            x: this.sys.game.config.width / 2,
            y: this.sys.game.config.height / 2
        };

        this.setMainScreen();
    }

    setMainScreen() {
        const menu = this.add.container(this.center.x, this.center.y)
            .setDepth(100)
            .setScrollFactor(0);

        const logo = this.add.image(0, -150, 'logo')
            .setOrigin(0.5)
            .setDisplaySize(400, 400);

        const title = this.add.text(0, 0, "Jumpr", { font: '50px ' + this.font, fill: '#fff' })
            .setOrigin(0.5);

        const subtitle = this.add.text(0, 100, "The player follow you.", { font: '25px ' + this.font, fill: '#fff' })
            .setOrigin(0.5);

        const subtitle2 = this.add.text(0, 140, "Tap to jump.", { font: '25px ' + this.font, fill: '#fff' })
            .setOrigin(0.5);

        const subtitle3 = this.add.text(0, 230, "Tap to continue", { font: '18px ' + this.font, fill: '#fff' })
            .setOrigin(0.5)
            .setAlpha(0.7);

        menu.add([logo, title, subtitle, subtitle2, subtitle3]);

        this.input.off('pointerdown').on('pointerdown', () => {
            this.input.off('pointerdown');
            menu.destroy();
            this.setLobbyScreen();
        });
    }

    setLobbyScreen() {
        const menu = this.add.container(this.center.x, this.center.y)
            .setDepth(100)
            .setScrollFactor(0);

        const player = this.physics.add.sprite(this.center.x, this.center.y, 'whiteRect')
            .setDisplaySize(40, 40)
            .setBounce(0)
            .setOrigin(0.5, 1)
            .setCollideWorldBounds(true)
            .setDepth(10)
            .setMaxVelocity(400, 400)
            .setVelocityY(400);
        this.cameras.main.startFollow(player, false);
        this.cameras.main.setBounds(0, 99300, 450, 100000);
        this.physics.world.setBounds(0, 99300, 450, 100000);
        const playerTrail = this.add.particles(0, 0, 'flares', {
            frame: 'white',
            scale: { start: 0.2, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            blendMode: 'ADD',
            follow: player,
            followOffset: { y: -20, x: 0 },
        });
        
        this.input.off('pointerdown').on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}