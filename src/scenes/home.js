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

    _setSettings() {
        const settings = this.add.container(this.center.x, this.center.y)
            .setDepth(100)
            .setScrollFactor(0)
            .setAlpha(0)
            .setScale(0.8)
            .setVisible(false);

        const antiClick = this.add.rectangle(0, 0, this.center.x * 2.1, this.center.y * 2.1, 0x000000, 0)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setInteractive();

        const bg = this.add.rectangle(0, 0, 300, 400, 0x000000, 0.8)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xFFFFFF);

        const closeButton = this.add.image(bg.width / 2, -bg.height / 2, 'closeIcon')
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.add.tween({
                targets: settings,
                alpha: 0,
                scale: 0.8,
                duration: 200,
                ease: 'Back.easeIn',
                onComplete: () => {
                    settings.setVisible(false);
                }
            }));

        settings.add([antiClick, bg, closeButton]);

        return settings;
    }

    _setTopBar() {
        const topBarY = 10 - this.center.y;

        const settings = this._setSettings();
        const settingIcon = this.add.image(215, topBarY, 'settingsIcon')
            .setOrigin(1, 0)
            .setDepth(11)
            .setScrollFactor(0)
            .setDisplaySize(30, 30)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                settings.setVisible(true);
                this.tweens.add({
                    targets: settings,
                    alpha: 1,
                    scale: 1,
                    duration: 200,
                    ease: 'Back.easeOut'
                });
            });

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
        const paddingX = 34;

        const missionsX = paddingX - 150;
        const missions = {
            bg: this.add.rectangle(missionsX, downBarY, 150, 80, 0x000000, 0.8)
                .setOrigin(0.5, 1)
                .setStrokeStyle(3, 0xffffff)
                .setScrollFactor(0)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {}),
            icon: this.add.image(missionsX, downBarY - 25, 'missionsIcon')
                .setOrigin(0.5, 1)
                .setDepth(11)
                .setScrollFactor(0)
                .setDisplaySize(75, 75)
                .setTint(0x000000),
            iconStroke: this.add.image(missionsX, downBarY - 20, 'missionsIcon')
                .setOrigin(0.5, 1)
                .setDepth(10)
                .setScrollFactor(0)
                .setDisplaySize(85, 85),
            text: this.add.text(missionsX, downBarY - 5, 'Missions', { font: '25px ' + this.font, fill: '#fff' })
                .setOrigin(0.5, 1)
                .setDepth(11)
                .setScrollFactor(0)
        }

        const shopX = missionsX + (missions.bg.width/2) + 40 + paddingX;
        const shop = {
            bg: this.add.rectangle(shopX, downBarY, 80, 80, 0x000000, 0.8)
                .setOrigin(0.5, 1)
                .setStrokeStyle(3, 0xffffff)
                .setScrollFactor(0)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {}),
            icon: this.add.image(shopX, downBarY - 25, 'shopIcon')
                .setOrigin(0.5, 1)
                .setDepth(11)
                .setScrollFactor(0)
                .setDisplaySize(75, 75)
                .setTint(0x000000),
            iconStroke: this.add.image(shopX, downBarY - 20, 'shopIcon')
                .setOrigin(0.5, 1)
                .setDepth(10)
                .setScrollFactor(0)
                .setDisplaySize(85, 85),
            text: this.add.text(shopX, downBarY - 5, 'Shop', { font: '25px ' + this.font, fill: '#fff' })
                .setOrigin(0.5, 1)
                .setDepth(11)
                .setScrollFactor(0)
        }

        const meX = shopX + (shop.bg.width/2) + 40 + paddingX;
        const me = {
            bg: this.add.rectangle(meX, downBarY, 80, 80, 0x000000, 0.8)
                .setOrigin(0.5, 1)
                .setStrokeStyle(3, 0xffffff)
                .setScrollFactor(0)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {}),
            icon: this.add.image(meX, downBarY - 25, 'userIcon')
                .setOrigin(0.5, 1)
                .setDepth(11)
                .setScrollFactor(0)
                .setDisplaySize(75, 75)
                .setTint(0x000000),
            iconStroke: this.add.image(meX, downBarY - 20, 'userIcon')
                .setOrigin(0.5, 1)
                .setDepth(10)
                .setScrollFactor(0)
                .setDisplaySize(85, 85),
            text: this.add.text(meX, downBarY - 5, 'Me', { font: '25px ' + this.font, fill: '#fff' })
                .setOrigin(0.5, 1)
                .setDepth(11)
                .setScrollFactor(0)
        }

        return { shop, me, missions };
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
                this.add.tween({
                    targets: menu,
                    alpha: 0,
                    scale: 1.2,
                    duration: 200,
                    ease: 'easeInOut',
                });
            });

        const tapToPlay = this.add.text(0, 150, "Tap to play", { font: '18px ' + this.font, fill: '#fff' })
            .setOrigin(0.5)
            .setAlpha(0.7);

        setInterval(() => {
            this.tweens.add({
                targets: tapToPlay,
                rotation: 0.1,
                ease: 'Sine.easeInOut',
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    this.tweens.add({
                        targets: tapToPlay,
                        rotation: -0.1,
                        ease: 'Sine.easeInOut',
                        duration: 100,
                        yoyo: true,
                        onComplete: () => {
                            tapToPlay.rotation = 0;
                        }
                    });
                }
            });
        }, 3000);

        const highScore = this.add.text(-215, -200, `High Score:\n${localStorage.getItem('404HighScore') || 0}m`, { font: '20px ' + this.font, fill: '#fff' })
            .setOrigin(0, 0.5);

        const { settingIcon, multiplier, gem, money } = this._setTopBar();
        const { shop, me, missions } = this._setDownBar();

        menu.add([
            mainClicker, tapToPlay, settingIcon, highScore,
            multiplier.icon, multiplier.text,
            gem.icon, gem.text,
            money.icon, money.text,
            shop.bg, shop.iconStroke, shop.icon, shop.text,
            me.bg, me.iconStroke, me.icon, me.text,
            missions.bg, missions.iconStroke, missions.icon, missions.text
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