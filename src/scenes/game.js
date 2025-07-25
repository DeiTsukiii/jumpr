let player
let ground
let mouseX = 225;
let platforms = [];
let score = 1
let scoreTot = 0
let scoreText;
let gameStarted = false
let lastPlayerY;
let stars = [];
const minDistanceX = 100;
let lastPlatformX = null;
let canJump = false;
let menu = {
    text: 'Jumpr',
    score: false,
    scoreValue: 'Move mouse to move.',
    highScoreValue: 'Click to jump.',
    btn: 'Play'
};

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.input.on('pointermove', function (pointer) {
            mouseX = pointer.x;
        });

        this.make.graphics().fillStyle(0xffffff).fillRect(0, 0, 50, 10).generateTexture('whiteRect', 50, 10).destroy();
        this.make.graphics().fillStyle(0xffffff).fillCircle(2, 2, 2).generateTexture('star', 4, 4).destroy();

        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, 450);
            const y = Phaser.Math.Between(0, window.innerHeight - 100);

            const star = this.add.image(x, y, 'star')
                .setScrollFactor(0)
                .setDepth(-1)
                .setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));

            stars.push(star);
        }

        player = this.physics.add.sprite(225, 660, 'whiteRect')
            .setDisplaySize(40, 40)
            .setBounce(0)
            .setOrigin(0.5, 1)
            .setCollideWorldBounds(true)
            .setDepth(10);
        lastPlayerY = player.y

        this.cameras.main.startFollow(player, false, 0, 0.1);
        this.cameras.main.setBounds(0, -99300, 450, 100000);
        this.physics.world.setBounds(0, -99300, 450, 100000);

        ground = this.physics.add.staticImage(225, 700, 'whiteRect')
            .setDisplaySize(450, 40)
            .setOrigin(0.5, 1)
            .refreshBody();

        this.physics.add.collider(player, ground);

        platforms = [];

        scoreText = this.add.bitmapText(20, 20, 'pixelFont', '0', 30).setDepth(11).setScrollFactor(0);

        let lastPlatX = null;
        for (let i = 0; i < 6; i++) {
            let x;
            const y = 550 - (i * 160);

            const possibleX = [];
            for (let candidate = 50; candidate <= 400; candidate += 1) {
                if (lastPlatX === null || Math.abs(candidate - lastPlatX) >= minDistanceX) {
                    possibleX.push(candidate);
                }
            }
            x = Phaser.Utils.Array.GetRandom(possibleX);

            lastPlatX = x;

            const p = this.physics.add.staticImage(x, y, 'whiteRect')
                .setDisplaySize(30, 30)
                .setOrigin(0.5, 0)
                .refreshBody();

            platforms.push(p);

            this.platformInterval = setInterval(() => {
                if (p.body) {
                    p.y += 1;
                    p.refreshBody();
                }
            }, 30)

            this.physics.add.collider(player, p, (player, platform) => {
                const playerBottom = player.getBounds().bottom;
                const platformTop = platform.getBounds().top;
                const tolerance = 15;

                if (Math.abs(playerBottom - platformTop) < tolerance && !platform.touched) {
                    platform.touched = true;
                    
                    if (!gameStarted) gameStarted = true;
                    
                    player.setVelocityY(-600);
                    this.sound.play('platformSound');
                    
                    const floatText = this.add.bitmapText(platform.x, platform.y - 20, 'pixelFont', `+${score}`, 20)
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
                            if (platform.y < ground.y - 100) platform.setX(1000).refreshBody();

                            scoreTot += score;
                            score += 1;
                            scoreText.setText(scoreTot);

                            platform.touched = false;
                        }
                    });
                }
            }, null, this);
        }
        const startGame = this.add.container(225, 350).setVisible(true).setDepth(100);

        const bg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.8);
        const startGameText = this.add.bitmapText(0, -60, 'pixelFont', menu.text, 30).setOrigin(0.5);
        const scoreDisplay = this.add.bitmapText(0, -10, 'pixelFont', menu.score ? `Score: ${menu.scoreValue}` : menu.scoreValue, 20).setOrigin(0.5);
        const highScoreDisplay = this.add.bitmapText(0, 20, 'pixelFont', menu.score ? `High Score: ${menu.highScoreValue}` : menu.highScoreValue, 20).setOrigin(0.5);

        const restartBtn = this.add.bitmapText(0, 70, 'pixelFont', `[ ${menu.btn} ]`, 20)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                startGame.setVisible(false);
                setTimeout(() => canJump = true, 100);
            });

        startGame.add([bg, startGameText, scoreDisplay, highScoreDisplay, restartBtn]);
    }

    update() {
        let highestY = Math.min(...platforms.map(p => p.y));

        if (gameStarted) {
            if (lastPlayerY >= player.y) {
                lastPlayerY = player.y
            } else if (player.y - lastPlayerY >= 500 || ground.y - player.y <= 40) {
                let highScore = parseInt(localStorage.getItem('404HighScore'));
                if (isNaN(highScore)) {
                    highScore = 0;
                    localStorage.setItem('404HighScore', highScore);
                }
                if (scoreTot > highScore) {
                    highScore = scoreTot;
                    localStorage.setItem('404HighScore', highScore);
                }
                canJump = false;
                mouseX = 225;
                platforms = [];
                score = 1;
                gameStarted = false;
                stars = [];
                menu = {
                    text: 'GAME OVER',
                    score: true,
                    scoreValue: scoreTot,
                    highScoreValue: highScore,
                    btn: 'Replay'
                }
                scoreTot = 0;
                clearInterval(this.platformInterval);
                this.scene.restart();
            }
        }

        platforms.forEach((platform) => {
            if (platform.y >= player.y + 300 || platform.y >= ground.y - 100) {
                this.tweens.add({
                    targets: platform,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        let newX;
                        const newY = highestY - 160;

                        const possibleX = [];
                        for (let candidate = 50; candidate <= 400; candidate += 1) {
                            if (lastPlatformX === null || Math.abs(candidate - lastPlatformX) >= minDistanceX) {
                                possibleX.push(candidate);
                            }
                        }
                        newX = Phaser.Utils.Array.GetRandom(possibleX);

                        platform.setPosition(newX, newY);
                        platform.refreshBody();
                        platform.setAlpha(1);

                        highestY = Math.min(highestY, newY);
                        lastPlatformX = newX
                    }
                });
            }
        });

        const speed = player.body.touching.down ? 200 : 500;
        const distanceX = mouseX - player.x;

        if (Math.abs(distanceX) > 3) {
            const targetSpeed = Phaser.Math.Clamp(distanceX * 5, -speed, speed);
            player.setVelocityX(targetSpeed);
        } else {
            player.setVelocityX(0);
        }


        const pointer = this.input.activePointer;
        if (pointer.isDown && player.body.touching.down && canJump) {
            player.setVelocityY(-600);
        }
    }
}