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
        this.player = this.physics.add.sprite(this.center.x, 700 - this.center.y*1.2, 'whiteRect')
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

    _setTopBar() {
        const topBarY = 10 - this.center.y;

        const settingIcon = this.add.image(215, topBarY, 'settingsIcon')
            .setOrigin(1, 0)
            .setDepth(11)
            .setScrollFactor(0)
            .setDisplaySize(30, 30)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {});

        const multiplier = {
            icon: this.add.image(165, topBarY, 'starIcon')
                .setOrigin(1, 0)
                .setDepth(11)
                .setScrollFactor(0)
                .setDisplaySize(30, 30),
            text: this.add.text(135, topBarY, `x1`, { font: '20px ' + this.font, fill: '#fff' })
                .setOrigin(1, 0)
                .setDepth(11)
                .setScrollFactor(0)
        }

        const gem = {};
        gem.icon = this.add.image(-215, topBarY, 'gemIcon')
            .setOrigin(0, 0)
            .setDepth(11)
            .setScrollFactor(0)
            .setDisplaySize(30, 30);
        gem.text = this.add.text(gem.icon.x + 35, topBarY, `000`, { font: '20px ' + this.font, fill: '#fff' })
            .setOrigin(0, 0)
            .setDepth(11)
            .setScrollFactor(0);

        const money = {};
        money.icon = this.add.image(-165 + gem.text.width, topBarY, 'moneyIcon')
            .setOrigin(0, 0)
            .setDepth(11)
            .setScrollFactor(0)
            .setDisplaySize(30, 30);
        money.text = this.add.text(money.icon.x + 35, topBarY, `000`, { font: '20px ' + this.font, fill: '#fff' })
            .setOrigin(0, 0)
            .setDepth(11)
            .setScrollFactor(0);

        return { settingIcon, multiplier, gem, money };
    }

    _setDownBar() {
        const downBarY = this.center.y - 50;

        const shop = {
            bg: this.add.rectangle(0, downBarY, 80, 80, 0x000000, 0.8)
                .setOrigin(0.5, 1)
                .setStrokeStyle(3, 0xffffff),
            icon: this.add.image(0, downBarY - 25, 'shopIcon')
                .setOrigin(0.5, 1)
                .setDepth(11)
                .setScrollFactor(0)
                .setDisplaySize(75, 75)
                .setTint(0x000000),
            iconStroke: this.add.image(0, downBarY - 20, 'shopIcon')
                .setOrigin(0.5, 1)
                .setDepth(10)
                .setScrollFactor(0)
                .setDisplaySize(85, 85),
            text: this.add.text(0, downBarY - 5, 'Shop', { font: '25px ' + this.font, fill: '#fff' })
                .setOrigin(0.5, 1)
                .setDepth(11)
                .setScrollFactor(0)
        }

        return { shop };
    }

    _setMenu() {
        const menu = this.add.container(this.center.x, this.center.y)
            .setDepth(100)
            .setScrollFactor(0);

        const mainClicker = this.add.rectangle(0, 0, this.center.x * 2, this.center.y * 2, 0x000000, 0)
            .setScrollFactor(0)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.player.body.moves = true;
                menu.setAlpha(0);
            });

        const tapToPlay = this.add.text(0, 150, "Tap to play", { font: '18px ' + this.font, fill: '#fff' })
            .setOrigin(0.5)
            .setAlpha(0.7);

        const { settingIcon, multiplier, gem, money } = this._setTopBar();
        const { shop } = this._setDownBar();

        menu.add([
            mainClicker, tapToPlay, settingIcon,
            multiplier.icon, multiplier.text,
            gem.icon, gem.text,
            money.icon, money.text,
            shop.bg, shop.iconStroke, shop.icon, shop.text
        ]);
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