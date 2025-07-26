let mouseX = 225;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');

        this.player;
        this.ground;
        this.platforms = [];
        this.score = 1;
        this.scoreTot = 0;
        this.scoreText;
        this.startGame;
        this.gameStarted = false;
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

    _generateStars() {
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

    _createPlayer() {
        this.player = this.physics.add.sprite(225, 660, 'whiteRect')
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

    _onPlatforHit(player, platform) {
        const playerBottom = player.getBounds().bottom;
        const platformTop = platform.getBounds().top;
        const tolerance = 15;

        if (Math.abs(playerBottom - platformTop) < tolerance && !platform.touched) {
            platform.touched = true;
            
            if (!this.gameStarted) this.gameStarted = true;
            
            this.player.setVelocityY(-600);
            this.sound.play('platformSound');
            
            const floatText = this.add.bitmapText(platform.x, platform.y - 20, 'pixelFont', `+${this.score}`, 20)
                .setOrigin(0.5)
                .setDepth(20);

            const centerX = platform.x;
            const centerY = platform.y - 20;

            this.tweens.add({
                targets: floatText,
                y: floatText.y - 30,
                alpha: 0,
                duration: 2000,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    floatText.destroy();
                }
            });

            const starsGroup = [];
            const starCount = 20;
            const radius = 40;

            for (let i = 0; i < starCount; i++) {
                const angle = (i / starCount) * Math.PI * 2;

                const startX = centerX + Math.cos(angle) * radius;
                const startY = centerY + Math.sin(angle) * radius;

                const star = this.add.image(startX, startY, 'star')
                    .setDepth(20)
                    .setAlpha(1)
                    .setScale(1);

                starsGroup.push({ star, angle });
            }

            this.tweens.add({
                targets: starsGroup.map(s => s.star),
                x: {
                    getEnd: (target, key, value, targetIndex) => {
                        return centerX + Math.cos(starsGroup[targetIndex].angle) * (radius + 60);
                    }
                },
                y: {
                    getEnd: (target, key, value, targetIndex) => {
                        return centerY + Math.sin(starsGroup[targetIndex].angle) * (radius + 60);
                    }
                },
                alpha: 0,
                scale: 0,
                ease: 'Sine.easeOut',
                duration: 2000,
                onComplete: () => {
                    starsGroup.forEach(s => s.star.destroy());
                }
            });

            this.tweens.add({
                targets: platform,
                y: platform.y + 10,
                duration: 100,
                yoyo: true,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    if (platform.y < this.ground.y - 100) platform.setX(1000).refreshBody();

                    this.scoreTot += this.score;
                    this.score += 1;
                    this.scoreText.setText(this.scoreTot);

                    platform.touched = false;
                }
            });
        }
    }

    _createPlatforms() {
        let lastPlatX = null;
        for (let i = 0; i < 6; i++) {
            let x;
            const y = 550 - (i * 160);

            const possibleX = [];
            for (let candidate = 50; candidate <= 400; candidate += 1) {
                if (lastPlatX === null || Math.abs(candidate - lastPlatX) >= this.minDistanceX) {
                    possibleX.push(candidate);
                }
            }
            x = Phaser.Utils.Array.GetRandom(possibleX);

            lastPlatX = x;

            const p = this.physics.add.staticImage(x, y, 'whiteRect')
                .setDisplaySize(30, 30)
                .setOrigin(0.5, 0)
                .refreshBody();

            this.platforms.push(p);

            this.platformInterval = setInterval(() => {
                if (p.body) {
                    p.y += 1;
                    p.refreshBody();
                }
            }, 30)

            this.physics.add.collider(this.player, p, this._onPlatforHit, null, this);
        }
    }

    _setUI() {
        this.scoreText = this.add.bitmapText(20, 20, 'pixelFont', '0', 30).setDepth(11).setScrollFactor(0);

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
        this._generateStars();
        this._createWorld();
        this._createPlayer();
        this._createPlatforms();
        this._setUI();
    }

    _resetGame() {
        let highScore = parseInt(localStorage.getItem('404HighScore'));
        if (isNaN(highScore)) highScore = 0;
        if (this.scoreTot > highScore) highScore = this.scoreTot;
        localStorage.setItem('404HighScore', highScore);

        this.platforms.forEach(platform => platform.destroy());
        this.platforms = [];
        this.player.destroy();
        this.score = 1;
        this.scoreTot = 0;
        this.gameStarted = false;
        this.canJump = false;
        clearInterval(this.platformInterval);
        this.menu = {
            text: 'GAME OVER',
            score: true,
            scoreValue: this.scoreTot,
            highScoreValue: highScore,
            btn: 'Replay'
        }
        this.scoreText.setText('0');
        this.startGame.setVisible(true);
        this.startGame.list[1].setText(this.menu.text);
        this.startGame.list[2].setText(`Score: ${this.menu.scoreValue}`);
        this.startGame.list[3].setText(`High Score: ${this.menu.highScoreValue}`);
        this.startGame.list[4].setText(`[ ${this.menu.btn} ]`);

        this._createPlayer();
        this._createPlatforms();
    }

    update() {
        let highestY = Math.min(...this.platforms.map(p => p.y));

        if (this.gameStarted) {
            if (this.lastPlayerY >= this.player.y) this.lastPlayerY = this.player.y;
            else if (this.player.y - this.lastPlayerY >= 500 || this.ground.y - this.player.y <= 40) this._resetGame();
        }

        this.platforms.forEach((platform) => {
            if (platform.y >= this.player.y + 300 || platform.y >= this.ground.y - 100) {
                this.tweens.add({
                    targets: platform,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        let newX;
                        const newY = highestY - 160;

                        const possibleX = [];
                        for (let candidate = 50; candidate <= 400; candidate += 1) {
                            if (this.lastPlatformX === null || Math.abs(candidate - this.lastPlatformX) >= this.minDistanceX) {
                                possibleX.push(candidate);
                            }
                        }
                        newX = Phaser.Utils.Array.GetRandom(possibleX);

                        platform.setPosition(newX, newY);
                        platform.refreshBody();
                        platform.setAlpha(1);

                        highestY = Math.min(highestY, newY);
                        this.lastPlatformX = newX
                    }
                });
            }
        });

        const speed = this.player.body.touching.down ? 200 : 500;
        const distanceX = mouseX - this.player.x;
        if (Math.abs(distanceX) > 3) {
            const targetSpeed = Phaser.Math.Clamp(distanceX * 5, -speed, speed);
            this.player.setVelocityX(targetSpeed);
        } else {
            this.player.setVelocityX(0);
        }


        const pointer = this.input.activePointer;
        if (pointer.isDown && this.player.body.touching.down && this.canJump) {
            this.player.setVelocityY(-600);
        }
    }
}
