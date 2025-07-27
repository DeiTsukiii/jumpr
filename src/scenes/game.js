import { BasicPlatform, BreakablePlatform, BouncePlatform, spawnRates, MovingPlatform, InvisiblePlatform } from "../platforms/platforms.js";

let mouseX = 225;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');

        this.player;
        this.playerTrail;
        this.items = [];
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
    }

    _generateBackground() {
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, 450);
            const y = Phaser.Math.Between(0, window.innerHeight - 100);

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
            frame: { frames: ['white'] },
            scale: { start: 0.2, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            blendMode: 'ADD',
            follow: this.player,
            followOffset: { y: -20, x: 0 }
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

            if (!this.started) this.started = true;
            
            platform.onHit(player);
            
            // const floatText = this.add.bitmapText(platform.x, platform.y - 20, 'pixelFont', `+${this.score}`, 20)
            //     .setOrigin(0.5)
            //     .setDepth(20);

            // const centerX = platform.x;
            // const centerY = platform.y - 20;

            // this.tweens.add({
            //     targets: floatText,
            //     y: floatText.y - 30,
            //     alpha: 0,
            //     duration: 2000,
            //     ease: 'Sine.easeOut',
            //     onComplete: () => {
            //         floatText.destroy();
            //     }
            // });
        }
    }
    _getItem(item) {
        if (!this.items.includes(item)) {
            this.items.push(item);
        }
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

        this.startGame = this.add.container(225, 350).setVisible(true).setDepth(100);

        const bg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.8);
        
        const startGameText = this.add.bitmapText(0, -60, 'pixelFont', "Jumpr", 30).setOrigin(0.5);
        const scoreDisplay = this.add.bitmapText(0, -10, 'pixelFont', "Move mouse to move.", 20).setOrigin(0.5);
        const highScoreDisplay = this.add.bitmapText(0, 20, 'pixelFont', "Click to jump.", 20).setOrigin(0.5);

        const restartBtn = this.add.bitmapText(0, 70, 'pixelFont', "[ Play ]", 20)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.startGame.setVisible(false);
                setTimeout(() => this.canJump = true, 100);
            });

        this.startGame.add([bg, startGameText, scoreDisplay, highScoreDisplay, restartBtn]);
    }

    _setPossiblePlatforms() {
        this.possiblePlatforms = [];
        Object.keys(spawnRates).forEach(key => {
            const PlatformClass = eval(key);
            for (let i = 0; i < spawnRates[key]; i++) this.possiblePlatforms.push(PlatformClass);
        });
        for (let i = 0; i < 100 - this.possiblePlatforms.length; i++) this.possiblePlatforms.push(BasicPlatform);
    }

    create() {
        this.input.on('pointermove', pointer => mouseX = pointer.x);
        this._generateBackground();
        this._createWorld();
        this._createPlayer();
        this._createPlatforms();
        this._setUI();
        this._setPossiblePlatforms();
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
        this.startGame.setVisible(true);
        this.startGame.list[1].setText("GAME OVER");
        this.startGame.list[2].setText(`Score: ${this.score} m`);
        this.startGame.list[3].setText(`High Score: ${highScore} m`);
        this.startGame.list[4].setText("[ Replay ]");
        this.score = 0;

        mouseX = playerX;
        this._createPlayer(playerX);
        this._createPlatforms();
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

    _secondChance() {
        this.started = false;
        setTimeout(() => this.started = true, 100);
        this.player.setVelocityY(-1500);
        this.items.pop('shield');

        this._circleStarsFX(this.player.x, this.player.y - 100);
    }

    _handleGameOver() {
        if (!this.started) return;

        const minPlatformY = Math.max(...this.platforms.map(p => p.y));
        if (minPlatformY < this.player.y - 500 || this.ground.y - this.player.y <= 40) {
            if (this.items.includes('shield')) this._secondChance();
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

    _getRandomPlatform() {
        return Phaser.Utils.Array.GetRandom(this.possiblePlatforms);
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
                        if (platform.item) platform.item.destroy();
                        const randomPlatform = this._getRandomPlatform();
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

    update(time, delta) {
        this._handlePlatformRecycle(time, delta);
        this._handleGameOver();
        this._handleMovement();
        this._updateScore();
    }
}