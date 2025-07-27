import { BasicPlatform, BreakablePlatform, BouncePlatform, MovingPlatform, InvisiblePlatform } from "../platforms/platforms.js";

let mouseX = 225;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');

        this.player;
        this.playerTrail;
        this.items = {
            shield: { value: 0, duration: 60 }
        };
        this.ground;
        this.platforms = [];
        this.started = false;
        this.score = 0;
        this.scoreText;
        this.startGame;
        this.stars = [];
        this.minDistanceX = 100;
        this.lastPlatformX = null;
        this.canJump = false;
        this.spawnRates = {
            items: 0.05,
            platforms: 0
        }
        this.itemDepletionRate = 6 / 10000;
    }

    _generateBackground() {
        for (let i = 0; i < window.innerHeight / 5; i++) {
            const x = Phaser.Math.Between(0, 450);
            const y = Phaser.Math.Between(0, window.innerHeight);

            const size = Phaser.Math.Between(8, 10);
            const star = this.add.image(x, y, 'flares', 'white')
                .setDisplaySize(size, size)
                .setScrollFactor(0)
                .setDepth(-1)
                .setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));

            this.stars.push(star);
        }
    }

    _createPlayer(playerX = 225, playerY = 660) {
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
    }

    _createWorld() {
        this.cameras.main.setBounds(0, -99300, 450, 100000);
        this.physics.world.setBounds(0, -99300, 450, 100000);

        this.ground = this.physics.add.staticImage(225, 700, 'whiteRect')
            .setDisplaySize(450, 40)
            .setOrigin(0.5, 1)
            .refreshBody();
    }

    _onPlatformHit(player, platform) {
        const playerBottom = player.getBounds().bottom;
        const platformTop = platform.getBounds().top;
        const tolerance = 15;

        if (Math.abs(playerBottom - platformTop) < tolerance && platform.canTouch) {
            if (!this.started) {
                this.started = true;
                if (!this.incrementPlatSpawnRate) this.incrementPlatSpawnRate = setInterval(() => this.spawnRates.platforms += 0.005, 1000);
            }
            
            platform.onHit(player);
        }
    }
    _getItem(item) {
        this.items[item].value = this.items[item].duration;
    }

    _createPlatforms() {
        const nbPlatforms = 10;
        for (let i = 0; i < nbPlatforms; i++) {
            let x;
            const y = 550 - (i * 160);

            x = Phaser.Math.Between(20, 430);

            const platform = new BasicPlatform(this, x, y);
            this.platforms.push(platform);
        }
    }

    _setUI() {
        this.scoreText = this.add.bitmapText(20, 20, 'pixelFont', '0', 30).setDepth(11).setScrollFactor(0);
        document.getElementById('debugButton').style.display = 'block';

        const centerX = this.sys.game.config.width / 2;
        const centerY = this.sys.game.config.height / 2;

        this.startGame = this.add.container(centerX, centerY)
            .setVisible(true)
            .setDepth(100)
            .setScrollFactor(0)
            .setAlpha(0)
            .setScale(0.8);

        this.toggleStartGameMenu = bool => {
            if (bool) this.startGame.setVisible(true);
            this.tweens.add({
                targets: this.startGame,
                alpha: bool ? 1 : 0,
                scale: bool ? 1 : 0.8,
                duration: 500,
                ease: 'Back.easeOut',
                onComplete: () => {
                    if (!bool) this.startGame.setVisible(false);
                }
            });
        }

        const bg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.8)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xFFFFFF);

        const startGameText = this.add.bitmapText(0, -60, 'pixelFont', "Jumpr", 40).setOrigin(0.5);
        const scoreDisplay = this.add.bitmapText(0, -15, 'pixelFont', "Move mouse to move.", 20).setOrigin(0.5);
        const highScoreDisplay = this.add.bitmapText(0, 15, 'pixelFont', "Click to jump.", 20).setOrigin(0.5);

        const buttonYPosition = 60;
        const restartBtnTxt = this.add.bitmapText(0, buttonYPosition, 'pixelFont', "[ Play ]", 25)
            .setOrigin(0.5)
            .setTint(0xFFFFFF);

        this.buttonWidth = 100;
        const buttonHeight = 45;
        const buttonRadius = 10;

        const restartBtnGraphics = this.add.graphics()
            .fillStyle(0x2E2E2E, 0.7)
            .fillRoundedRect(-this.buttonWidth / 2, buttonYPosition - (buttonHeight / 2), this.buttonWidth, buttonHeight, buttonRadius);

        const restartBtn = this.add.rectangle(0, buttonYPosition, this.buttonWidth, buttonHeight, 0x2E2E2E, 0)
            .setScrollFactor(0)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                restartBtnGraphics.clear();
                restartBtnGraphics.fillStyle(0xCCCCCC, 0.9);
                restartBtnGraphics.fillRoundedRect(-this.buttonWidth / 2, buttonYPosition - (buttonHeight / 2), this.buttonWidth, buttonHeight, buttonRadius);

                restartBtnTxt.setTint(0x0E0E0E);
                // this.tweens.add({ targets: [restartBtnGraphics, restartBtnTxt], scale: 1.05, duration: 100, ease: 'Power1' });
            })
            .on('pointerout', () => {
                restartBtnGraphics.clear();
                restartBtnGraphics.fillStyle(0x2E2E2E, 0.7);
                restartBtnGraphics.fillRoundedRect(-this.buttonWidth / 2, buttonYPosition - (buttonHeight / 2), this.buttonWidth, buttonHeight, buttonRadius);

                restartBtnTxt.setTint(0xFFFFFF);
                // this.tweens.add({ targets: [restartBtnGraphics, restartBtnTxt], scale: 1, duration: 100, ease: 'Power1' });
            })
            .on('pointerdown', () => {
                if (this.sound.get('buttonClick')) {
                    this.sound.play('buttonClick');
                }
                this.toggleStartGameMenu(false);
                setTimeout(() => this.canJump = true, 100);
            });

        this.startGame.add([bg, startGameText, scoreDisplay, highScoreDisplay, restartBtnGraphics, restartBtnTxt, restartBtn]);

        this.toggleStartGameMenu(true);
    }

    create() {
        this.input.on('pointermove', pointer => mouseX = pointer.x);
        this._generateBackground();
        this._createWorld();
        this._createPlayer();
        this._createPlatforms();
        this._setUI();
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
        this.platforms = [];
        const playerX = this.player.x;
        this.player.destroy();
        this.playerTrail.destroy();
        this.canJump = false;
        this.started = false;
        this.scoreText.setText('0 m');
        this.startGame.list[1].setText("GAME OVER");
        this.startGame.list[2].setText(`Score: ${this.score} m`);
        this.startGame.list[3].setText(`High Score: ${highScore} m`);
        this.buttonWidth = 140;
        this.startGame.list[4].clear();
        this.startGame.list[4].fillStyle(0x2E2E2E, 0.7);
        this.startGame.list[4].fillRoundedRect(-this.buttonWidth / 2, 60 - (45 / 2), this.buttonWidth, 45, 10);
        this.startGame.list[5].setText("[ Replay ]");
        this.toggleStartGameMenu(true);
        this.score = 0;
        this.spawnRates = {
            items: 0.05,
            platforms: 0
        }

        mouseX = playerX;
        this._createPlayer(playerX);
        this._createPlatforms();
    }

    _secondChance() {
        this.started = false;
        setTimeout(() => this.started = true, 100);
        this.player.setVelocityY(-1500);
        this.items.shield.value = 0;

        this._circleStarsFX(this.player.x, this.player.y - 100);
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

        if (this.input.activePointer.isDown && this.player.body.touching.down && this.ground.y - this.player.y <= 40 && this.canJump) this.player.setVelocityY(-600);
    }

    _handlePlatformRecycle(time, delta) {
        let highestY = Math.min(...this.platforms.map(p => p.y));

        this.platforms.forEach((platform, index) => {
            if (!platform.body) return;
            platform.update(time, delta);

            if ((platform.y >= this.player.y + (innerHeight / 2) || platform.y >= this.ground.y - 100) && platform.active) {
                platform.active = false;
                this.tweens.add({
                    targets: platform,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        const newX = Phaser.Math.Between(20, 430);
                        const newY = highestY - 160;

                        highestY = Math.min(highestY, newY);
                        this.lastPlatformX = newX;

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
        const height = Math.round((this.ground.y - this.player.y - 40) / 200);
        this.score = height > this.score ? height : this.score;
        this.scoreText.setText(`${height} m`);
    }

    _updateItems(time, delta) {
        Object.keys(this.items).forEach(item => {
            if (this.items[item].value > 0) {
                this.items[item].value -= this.itemDepletionRate * delta;
                if (this.items[item].value <= 0) this.items[item].value = 0;
            }
        });
    }

    update(time, delta) {
        this._handlePlatformRecycle(time, delta);
        this._handleGameOver();
        this._handleMovement();
        this._updateScore();
        this._updateItems(time, delta);
    }
}