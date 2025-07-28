import { BasicPlatform, BreakablePlatform, BouncePlatform, MovingPlatform, InvisiblePlatform } from "../platforms/platforms.js";

let mouseX = 225;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');

        this.player;
        this.playerTrail;
        this.items = {
            shield: { value: 0, duration: 60 },
            feather: { value: 0, duration: 20 }
        };
        this.ground;
        this.platforms = [];
        this.started = false;
        this.score = 0;
        this.uiScene;
        this.stars = [];
        this.minDistanceX = 100;
        this.lastPlatformX = null;
        this.canJump = false;
        this.spawnRates = {
            items: 0,
            platforms: 0
        }
        this.incrementPlatSpawnRate = 0.005;
        this.itemDepletionRate = 1;
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
            if (!this.started) this.started = true;
            
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
        this.scene.launch('UiScene');
        this.uiScene = this.scene.get('UiScene');
    }

    create() {
        this.input.on('pointermove', pointer => mouseX = pointer.x);
        this._generateBackground();
        this._createWorld();
        this._createPlayer();
        this._createPlatforms();
        this._setUI();
        // ajouter la plume
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
        this.uiScene.toggleMenuView(true);
        this.uiScene.setMenu('Game Over', `Score: ${this.score}m`, `High Score: ${highScore}m`, 'Play Again', () => this.canJump = true);
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
        this.player.setVelocityY(-1500);
        this.player.setPosition(this.player.x, this.player.y - 100);
        this.items.shield.value = 0;

        this._circleStarsFX(this.player.x, this.player.y );
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

    _updatePlatforms(time, delta) {
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
        this.uiScene.scoreText.setText(`${height}m`);
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
    }
}