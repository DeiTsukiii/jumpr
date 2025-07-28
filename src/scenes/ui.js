export default class UiScene extends Phaser.Scene {
    constructor() {
        super('UiScene');

        this.menu;
    }

    create() {
        this.scoreText = this.add.text(20, 20, '0', { font: '30px Monocraft', fill: '#fff' }).setDepth(11).setScrollFactor(0);
        document.getElementById('debugButton').style.display = 'block';

        this.pauseButton = this.add.image(430, 20, 'pauseIcon')
            .setOrigin(1, 0)
            .setDepth(11)
            .setScrollFactor(0)
            .setDisplaySize(30, 30)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.pause());

        const centerX = this.sys.game.config.width / 2;
        const centerY = this.sys.game.config.height / 2;

        this.menu = this.add.container(centerX, centerY)
            .setVisible(true)
            .setDepth(100)
            .setScrollFactor(0)
            .setAlpha(0)
            .setScale(0.8);

        this.toggleMenuView = bool => {
            if (bool) this.menu.setVisible(true);
            this.tweens.add({
                targets: this.menu,
                alpha: bool ? 1 : 0,
                scale: bool ? 1 : 0.8,
                duration: 500,
                ease: 'Back.easeOut',
                onComplete: () => {
                    if (!bool) this.menu.setVisible(false);
                }
            });
        }

        const bg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.8)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xFFFFFF);

        const menuTitle = this.add.text(0, -60, "Title", { font: '40px Monocraft', fill: '#fff' }).setOrigin(0.5);
        const menuSubTitle = this.add.text(0, -15, "Subtitle", { font: '20px Monocraft', fill: '#fff' }).setOrigin(0.5);
        const menuSubTitle2 = this.add.text(0, 15, "Subtitle 2", { font: '20px Monocraft', fill: '#fff' }).setOrigin(0.5);

        this.uiButton = {
            yPosition: 60,
            width: 125,
            height: 45,
            radius: 10,
        }

        const menuButtonText = this.add.text(0, this.uiButton.yPosition, "Button", { font: '25px Monocraft', fill: '#fff' })
            .setOrigin(0.5)
            .setTint(0xFFFFFF);

        const menuButtonBg = this.add.graphics()
            .fillStyle(0x2E2E2E, 0.7)
            .fillRoundedRect(-this.uiButton.width / 2, this.uiButton.yPosition - (this.uiButton.height / 2) + 4, this.uiButton.width, this.uiButton.height, this.uiButton.radius);

        const menuButton = this.add.rectangle(0, this.uiButton.yPosition, this.uiButton.width, this.uiButton.height, 0x2E2E2E, 0)
            .setScrollFactor(0)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.toggleMenuView(false));

        this.menu.add([bg, menuTitle, menuSubTitle, menuSubTitle2, menuButtonBg, menuButtonText, menuButton]);

        this.sys.game.events.on(Phaser.Core.Events.BLUR, this.pause, this);
        this.toggleMenuView(true);
        this.setMenu('Jumpr', 'Move mouse to move.', 'Click to jump.', 'Play', () => this.scene.get('GameScene').canJump = true);
    }

    setMenu(title, subtitle, subtitle2, button, callback = () => {}) {
        if (!this.menu) return;
        this.menu.getAt(1).setText(title);
        this.menu.getAt(2).setText(subtitle);
        this.menu.getAt(3).setText(subtitle2);

        this.uiButton.width = button.length * 17.5 + 20;
        this.menu.getAt(4).clear();
        this.menu.getAt(4).fillStyle(0x2E2E2E, 0.7);
        this.menu.getAt(4).fillRoundedRect(-this.uiButton.width / 2, this.uiButton.yPosition - (this.uiButton.height / 2) + 4, this.uiButton.width, this.uiButton.height, this.uiButton.radius);

        this.menu.getAt(5).setText(button);
        this.menu.getAt(6).setSize(this.uiButton.width, this.uiButton.height).off('pointerdown').on('pointerdown', () => {
            this.toggleMenuView(false);
            setTimeout(callback, 100);
        });
    }

    pause() {
        if (this.scene.isPaused('GameScene')) return;
        this.toggleMenuView(true);
        this.scene.get('GameScene').canJump = false;
        this.setMenu('Paused', 'Game is', 'paused', 'Resume', () => {
            let i = 3;
            const text = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, '3', { font: '100px Monocraft', fill: '#fff' }).setOrigin(0.5).setDepth(11).setScrollFactor(0);
            const interval = setInterval(() => {
                if (i <= 0) {
                    clearInterval(interval);
                    this.scene.resume('GameScene');
                    this.scene.get('GameScene').canJump = true;
                    this.toggleMenuView(false);
                    text.destroy();
                    return;
                }
                i--;
                text.setText(i === 0 ? 'Go!' : i);
            }, 1000);
        });
        this.scene.pause('GameScene');
    }
}