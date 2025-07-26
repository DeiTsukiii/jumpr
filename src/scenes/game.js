import { BasicPlatform, BreakablePlatform, BouncePlatform, spawnRates } from "../platforms/platforms.js";

let mouseX = 225;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');

        this.player;
        this.ground;
        this.platforms = [];
        this.started = false;
        this.score = 0;
        this.scoreText;
        this.startGame;
        this.lastPlayerY;
        this.stars = [];
        this.minDistanceX = 100;
        this.lastPlatformX = null;
        this.canJump = false;
        this.menu = {
            text: 'Jumpr',
            score: false,
            scoreValue: 'Move mouse to move.',
            highScoreValue: 'Click to jump.',
            btn: 'Play'
        };
    }

    _generateBackground() {
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, 450);
            const y = Phaser.Math.Between(0, window.innerHeight - 100);

            const star = this.add.image(x, y, 'star')
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
        this.lastPlayerY = this.player.y;
        this.physics.add.collider(this.player, this.ground);
        this.cameras.main.startFollow(this.player, false, 0, 0.1);
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
            // platform.canTouch = false;

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

            // const starsGroup = [];
            // const starCount = 20;
            // const radius = 40;

            // for (let i = 0; i < starCount; i++) {
            //     const angle = (i / starCount) * Math.PI * 2;

            //     const startX = centerX + Math.cos(angle) * radius;
            //     const startY = centerY + Math.sin(angle) * radius;

            //     const star = this.add.image(startX, startY, 'star')
            //         .setDepth(20)
            //         .setAlpha(1)
            //         .setScale(1);

            //     starsGroup.push({ star, angle });
            // }

            // this.tweens.add({
            //     targets: starsGroup.map(s => s.star),
            //     x: {
            //         getEnd: (target, key, value, targetIndex) => {
            //             return centerX + Math.cos(starsGroup[targetIndex].angle) * (radius + 60);
            //         }
            //     },
            //     y: {
            //         getEnd: (target, key, value, targetIndex) => {
            //             return centerY + Math.sin(starsGroup[targetIndex].angle) * (radius + 60);
            //         }
            //     },
            //     alpha: 0,
            //     scale: 0,
            //     ease: 'Sine.easeOut',
            //     duration: 2000,
            //     onComplete: () => starsGroup.forEach(s => s.star.destroy())
            // });
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
        const startGameText = this.add.bitmapText(0, -60, 'pixelFont', this.menu.text, 30).setOrigin(0.5);
        const scoreDisplay = this.add.bitmapText(0, -10, 'pixelFont', this.menu.score ? `Score: ${this.menu.scoreValue}` : this.menu.scoreValue, 20).setOrigin(0.5);
        const highScoreDisplay = this.add.bitmapText(0, 20, 'pixelFont', this.menu.score ? `High Score: ${this.menu.highScoreValue}` : this.menu.highScoreValue, 20).setOrigin(0.5);

        const restartBtn = this.add.bitmapText(0, 70, 'pixelFont', `[ ${this.menu.btn} ]`, 20)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.startGame.setVisible(false);
                setTimeout(() => this.canJump = true, 100);
            });

        this.startGame.add([bg, startGameText, scoreDisplay, highScoreDisplay, restartBtn]);
    }

    create() {
        this.input.on('pointermove', pointer => mouseX = pointer.x);
        this._generateBackground();
        this._createWorld();
        this._createPlayer();
        this._createPlatforms();
        this._setUI();
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
        this.canJump = false;
        this.started = false;
        this.menu = {
            text: 'GAME OVER',
            score: true,
            scoreValue: this.score,
            highScoreValue: highScore,
            btn: 'Replay'
        }
        this.score = 0;
        this.scoreText.setText('0 m');
        this.startGame.setVisible(true);
        this.startGame.list[1].setText(this.menu.text);
        this.startGame.list[2].setText(`Score: ${this.menu.scoreValue} m`);
        this.startGame.list[3].setText(`High Score: ${this.menu.highScoreValue} m`);
        this.startGame.list[4].setText(`[ ${this.menu.btn} ]`);

        mouseX = playerX;
        this._createPlayer(playerX);
        this._createPlatforms();
    }

    _handleGameOver() {
        if (!this.started) return;
        const minPlatformY = Math.max(...this.platforms.map(p => p.y));
        if (this.lastPlayerY >= this.player.y) this.lastPlayerY = this.player.y;
        else if (minPlatformY < this.player.y - 500 || this.ground.y - this.player.y <= 40) this._gameOver();
    }

    _handleMovement() {
        const speed = this.player.body.touching.down ? 200 : 500;
        const distanceX = mouseX - this.player.x;
        const targetSpeed = Math.abs(distanceX) > 3 ? Phaser.Math.Clamp(distanceX * 5, -speed, speed) : 0;
        this.player.setVelocityX(targetSpeed);

        if (this.input.activePointer.isDown && this.player.body.touching.down && this.ground.y - this.player.y <= 40 && this.canJump) this.player.setVelocityY(-600);
    }

    _handlePlatformMovement() {
        let highestY = Math.min(...this.platforms.map(p => p.y));

        this.platforms.forEach((platform, index) => {
            if ((platform.y >= this.player.y + 300 || platform.y >= this.ground.y - 100) && platform.active) {
                platform.active = false;
                this.tweens.add({
                    targets: platform,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        let newX;
                        const newY = highestY - 160;

                        newX = Phaser.Math.Between(20, 430);

                        highestY = Math.min(highestY, newY);
                        this.lastPlatformX = newX;

                        const random = Phaser.Math.Between(0, 100);

                        platform.destroy();
                        if (random < spawnRates.breakable) this.platforms[index] = new BreakablePlatform(this, newX, newY);
                        else if (random < spawnRates.bounce) this.platforms[index] = new BouncePlatform(this, newX, newY);
                        else this.platforms[index] = new BasicPlatform(this, newX, newY);
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

    update() {
        this._handlePlatformMovement();
        this._handleGameOver();
        this._handleMovement();
        this._updateScore();
    }
}