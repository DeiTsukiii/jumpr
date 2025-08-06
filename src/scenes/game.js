import { BasicPlatform, BreakablePlatform, BouncePlatform, MovingPlatform, InvisiblePlatform } from "../platforms/platforms.js";

let mouseX = 225;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.stars = data.stars || [];
    }

    _setBase() {
        this.items = {
            shield: { value: 0, duration: 60 },
            feather: { value: 0, duration: 20 },
            star: { value: 0, duration: 8 }
        };
        this.platforms = [];
        this.started = false;
        this.score = 0;
        this.uiScene;
        this.minDistanceX = 100;
        this.spawnRates = {
            items: 0.05,
            platforms: 0
        }
        this.platformSpacing = { x: 200, y: 90 };
        this.maxPlatformSpacing = 190;
        this.incrementPlatSpawnRate = 0.005;
        this.incrementPlatSpacing = 1;
        this.itemDepletionRate = 1;
        mouseX = 225;
        this.canJump = true;
        this.multiplier = localStorage.getItem('JumprMultiplier') ? parseInt(localStorage.getItem('JumprMultiplier')) : 1;
    }

    _getSetting(setting) {
        const settings = localStorage.getItem('JumprSettings');
        if (settings) {
            const parsedSettings = JSON.parse(settings);
            return parsedSettings.find(s => s.key === setting)?.value || null;
        }
        return null;
    }

    _generateBackground() {
        this.add.image(0, 0, 'bg-gradient')
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(-5);

        this.stars.forEach(starData => {
            const img = this.add.image(starData.x, starData.y, 'flares', 'white')
                .setDisplaySize(starData.size, starData.size)
                .setScrollFactor(0)
                .setDepth(-2)
                .setAlpha(starData.alpha);

            starData.image = img;
        });

        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                this.stars.forEach(star => {
                    const newAlpha = Phaser.Math.FloatBetween(0.3, 0.9);
                    this.tweens.add({
                        targets: star.image,
                        alpha: newAlpha,
                        duration: 1500,
                    });
                });
            }
        });

        this.time.addEvent({
            delay: Phaser.Math.Between(8000, 15000),
            loop: true,
            callback: () => {
                if (this.ground.y - this.player.y < this.scale.height) return;
                const startY = Phaser.Math.Between(this.player.y - 50, this.player.y - this.scale.height / 2);
                const targetY = Phaser.Math.Between(this.player.y + 50, this.player.y + this.scale.height / 2);

                const shootingStar = this.add.image(-50, startY, 'flares', 'white').setAlpha(0);

                this.add.particles(0, 0, 'flares', {
                    frame: 'white',
                    scale: { start: 0.2, end: 0 },
                    alpha: { start: 1, end: 0 },
                    lifespan: 1000,
                    blendMode: 'ADD',
                    follow: shootingStar,
                    followOffset: { y: -20, x: 0 }
                });

                this.tweens.add({
                    targets: shootingStar,
                    x: 500,
                    y: targetY,
                    duration: 1500,
                    ease: 'Cubic.easeOut',
                    onComplete: () => {
                        shootingStar.destroy();
                    }
                });
            }
        });
    }

    _createPlayer(playerX = 225, playerY = 672) {
        this.player = this.physics.add.sprite(playerX, playerY, 'whiteRect')
            .setDisplaySize(40, 40)
            .setBounce(0)
            .setOrigin(0.5, 1)
            .setCollideWorldBounds(true)
            .setDepth(10);
        this.physics.add.collider(this.player, this.ground);
        this.cameras.main.startFollow(this.player, false, 0, 0.1);
        this.playerTrail = this.add.particles(0, 0, 'flares', {
            frame: 'white',
            scale: { start: 0.2, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            blendMode: 'ADD',
            follow: this.player,
            followOffset: { y: -20, x: 0 },
        });
        this.playerShadow = this.add.ellipse(playerX, 672, 40, 15, 0x000000, 0.5);
    }

    _createWorld() {
        this.cameras.main.setBounds(0, -99300, 450, 100000);
        this.physics.world.setBounds(0, -99300, 450, 100000);

        this.ground = this.physics.add.staticImage(225, 712, 'whiteRect')
            .setDisplaySize(450, 40)
            .setOrigin(0.5, 1)
            .refreshBody();
        
        this.physics.add.staticImage(225, 700, 'ground').setOrigin(0.5, 1).setScale(0.85);
        this.physics.add.staticImage(225, 700, 'ground2').setDepth(11).setOrigin(0.5, 1).setScale(0.85);
    }

    _getItem(item) {
        this.items[item].value = this.items[item].duration;
    }

    _createPlatforms() {
        const nbPlatforms = 20;
        let lastX;
        for (let i = 0; i < nbPlatforms; i++) {
            let x;
            const y = 550 - (i * this.platformSpacing.y);

            if (!lastX) x = Phaser.Math.Between(20, 430);
            else {
                do {
                    x = Phaser.Math.Between(20, 430);
                } while (Math.abs(x - lastX) < this.platformSpacing.x);
            }

            lastX = x;

            const platform = new BasicPlatform(this, x, y);
            this.platforms.push(platform);
        }
    }

    _setUI() {
        this.scene.launch('UiScene');
        this.uiScene = this.scene.get('UiScene');
    }

    create() {
        this._setBase();
        this.input.on('pointermove', pointer => mouseX = pointer.x);
        this._generateBackground();
        this._createWorld();
        this._createPlayer();
        this._createPlatforms();
        this._setUI();
        // this.sound.play('music', {
        //     loop: true,
        //     volume: this._getSetting('music') ? this._getSetting('musicVol') / 400 : 0
        // });
    }

    _circleStarsFX(x, y) {
        const starsGroup = [];
        const starCount = 20;
        const radius = 40;

        for (let i = 0; i < starCount; i++) {
            const angle = (i / starCount) * Math.PI * 2;

            const startX = x + Math.cos(angle) * radius;
            const startY = y + Math.sin(angle) * radius;

            const star = this.add.image(startX, startY, 'flares', 'white')
                .setScale(0.2)
                .setAlpha(1);

            starsGroup.push({ star, angle });
        }

        this.tweens.add({
            targets: starsGroup.map(s => s.star),
            x: {
                getEnd: (target, key, value, targetIndex) => {
                    return x + Math.cos(starsGroup[targetIndex].angle) * (radius + 60);
                }
            },
            y: {
                getEnd: (target, key, value, targetIndex) => {
                    return y + Math.sin(starsGroup[targetIndex].angle) * (radius + 60);
                }
            },
            alpha: 0,
            scale: 0,
            ease: 'Sine.easeOut',
            duration: 2000,
            onComplete: () => starsGroup.forEach(s => s.star.destroy())
        });
    }

    _gameOver() {
        let highScore = parseInt(localStorage.getItem('404HighScore'));
        if (isNaN(highScore)) highScore = 0;
        if (this.score > highScore) highScore = this.score;
        localStorage.setItem('404HighScore', highScore);

        this.platforms.forEach(platform => platform.destroy());
        const playerX = this.player.x;
        this.player.destroy();
        this.playerTrail.destroy();
        this.playerShadow.destroy();
        this._setBase();
        this.canJump = false;
        this.uiScene.setMenu('Game Over', `Score: ${this.score}m`, `High Score: ${highScore}m`, 'Play Again', () => this.canJump = true);
        mouseX = playerX;
        this._createPlayer(playerX);
        this._createPlatforms();
    }

    _secondChance() {
        this.player.setVelocityY(-1500);
        this.player.setPosition(this.player.x, this.player.y - 100);
        this.items.shield.value = 0;
        this._circleStarsFX(this.player.x, this.player.y);
    }

    _handleGameOver() {
        if (!this.started) return;

        const minPlatformY = Math.max(...this.platforms.map(p => p.y));
        if (minPlatformY < this.player.y - 500 || this.ground.y - this.player.y <= 40) {
            if (this.items.shield.value > 0) this._secondChance();
            else this._gameOver();
        }
    }

    _handleMovement() {
        const speed = this.player.body.touching.down ? 200 : 500;
        const distanceX = mouseX - this.player.x;
        const targetSpeed = Math.abs(distanceX) > 3 ? Phaser.Math.Clamp(distanceX * 5, -speed, speed) : 0;
        this.player.setVelocityX(targetSpeed);
        this.playerShadow.setPosition(this.player.x, this.ground.y - 39);
        this.playerShadow.setScale(Math.max(500 - ((this.ground.y - this.player.y) * 2.5), 0) / 400);

        if (this.input.activePointer.isDown && this.player.body.touching.down && this.ground.y - this.player.y <= 40 && this.canJump) this.player.setVelocityY(-600);
    }

    _updatePlatforms(time, delta) {
        this.platforms.forEach((platform, index) => {
            if (!platform.body) return;
            platform.update(time, delta);

            if ((platform.y >= this.player.y + (innerHeight / 2) || platform.y >= this.ground.y - 150) && platform.active) {
                platform.active = false;
                this.tweens.add({
                    targets: platform,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        const highest = this.platforms.find(p => p.y === Math.min(...this.platforms.map(p => p.y)));
                        let newX;
                        do {
                            newX = Phaser.Math.Between(20, 430);
                        } while (Math.abs(newX - highest.x) < this.platformSpacing.x);

                        const newY = highest.y - this.platformSpacing.y;

                        platform.destroy();
                        let possiblePlatforms = [BasicPlatform];
                        if (Math.random() < this.spawnRates.platforms) possiblePlatforms = [BreakablePlatform, BouncePlatform, MovingPlatform, InvisiblePlatform];
                        const randomPlatform = Phaser.Utils.Array.GetRandom(possiblePlatforms);
                        this.platforms[index] = new randomPlatform(this, newX, newY);
                    }
                });
            }
        });
    }

    _updateScore() {
        const height = Math.round((this.ground.y - this.player.y - 40) * this.multiplier / 200);
        this.score = height > this.score ? height : this.score;
        this.uiScene.scoreText.setText(`${this.score}m`);
    }

    _updateItems(time, delta) {
        Object.keys(this.items).forEach(item => {
            if (this.items[item].value > 0) {
                this.items[item].value -= this.itemDepletionRate * (1 / 1000) * delta;
                if (this.items[item].value <= 0) this.items[item].value = 0;
            }
        });
    }

    update(time, delta) {
        this._updatePlatforms(time, delta);
        this._handleGameOver();
        this._handleMovement();
        this._updateScore();
        this._updateItems(time, delta);

        if (this.started) this.spawnRates.platforms += this.incrementPlatSpawnRate * (1 / 1000) * delta;
        if (this.started && this.platformSpacing.y < this.maxPlatformSpacing) this.platformSpacing.y += this.incrementPlatSpacing * (1 / 1000) * delta;
        else if (this.platformSpacing.y > this.maxPlatformSpacing) this.platformSpacing.y = this.maxPlatformSpacing;

        if (this.started && this.platformSpacing.x >= 0) this.platformSpacing.x -= this.incrementPlatSpacing * (1 / 1000) * delta;
        else if (this.platformSpacing.x < 0) this.platformSpacing.x = 0;

        if (this.items.star.value > 0) {
            const rainbow = Phaser.Display.Color.HSVToRGB((time % 1000) / 1000, 1, 1).color;
            this.player.setTint(rainbow);
        } else if (this.player.tintTopLeft !== 0xffffff) this.player.clearTint();

        this.player.setGravityY(this.items.feather.value > 0 ? -200 : 0);
    }
}