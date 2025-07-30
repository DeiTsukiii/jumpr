export default class UiScene extends Phaser.Scene {
    constructor() {
        super('UiScene');

        this.menu;
        this.font = 'Monocraft';
    }

    create() {
        this.scoreText = this.add.text(20, 20, '0', { font: '30px ' + this.font, fill: '#fff' }).setDepth(11).setScrollFactor(0);

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

        const bg = this.add.rectangle(0, 0, 300, 250, 0x000000, 0.8)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xFFFFFF);

        const menuTitle = this.add.text(0, -95, "Title", { font: '40px ' + this.font, fill: '#fff' }).setOrigin(0.5);
        const menuSubTitle = this.add.text(0, -50, "Subtitle", { font: '20px ' + this.font, fill: '#fff' }).setOrigin(0.5);
        const menuSubTitle2 = this.add.text(0, -20, "Subtitle 2", { font: '20px ' + this.font, fill: '#fff' }).setOrigin(0.5);

        this.uiButton = {
            yPosition: 25,
            width: 125,
            height: 45,
            radius: 10,
        }

        const quitButton = {
            yPosition: 80,
            width: 90,
            height: 45,
            radius: 10,
        }

        const menuButtonText = this.add.text(0, this.uiButton.yPosition, "Button", { font: '25px ' + this.font, fill: '#fff' })
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

        const quitButtonText = this.add.text(0, quitButton.yPosition, "Quit", { font: '25px ' + this.font, fill: '#fff' })
            .setOrigin(0.5)
            .setTint(0xFFFFFF);

        const quitButtonBg = this.add.graphics()
            .fillStyle(0x2E2E2E, 0.7)
            .fillRoundedRect(-quitButton.width / 2, quitButton.yPosition - (quitButton.height / 2) + 4, quitButton.width, quitButton.height, quitButton.radius);

        const quitButtonBtn = this.add.rectangle(0, quitButton.yPosition, quitButton.width, quitButton.height, 0x2E2E2E, 0)
            .setScrollFactor(0)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                const stars = this.scene.get('GameScene').stars;
                this.scene.start('HomeScene', { stars });
                this.scene.stop('GameScene');
                this.sys.game.events.off(Phaser.Core.Events.BLUR);
                this.scene.stop('UiScene');
            });

        this.menu.add([
            bg, menuTitle, menuSubTitle, menuSubTitle2,
            menuButtonBg, menuButtonText, menuButton,
            quitButtonBg, quitButtonText, quitButtonBtn
        ]);

        this.sys.game.events.on(Phaser.Core.Events.BLUR, this.pause, this);

        this.itemsIcons = {};

        Object.keys(this.scene.get('GameScene').items).forEach(itemName => this.itemsIcons[itemName] = this.add.image(430, 70, `item-${itemName}`)
            .setOrigin(1, 0)
            .setDisplaySize(30, 30)
            .setScrollFactor(0)
            .setAlpha(0));
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
        this.toggleMenuView(true);
    }

    pause() {
        if (this.scene.isPaused('GameScene')) return;
        this.toggleMenuView(true);
        this.scene.get('GameScene').canJump = false;
        this.setMenu('Paused', 'Game is', 'paused', 'Resume', () => {
            let i = 3;
            const text = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, '3', { font: '100px ' + this.font, fill: '#fff' }).setOrigin(0.5).setDepth(11).setScrollFactor(0);
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

    updateItemsIcons() {
        const items = this.scene.get('GameScene').items;

        const sortedItems = Object.entries(items)
            .filter(([_, data]) => data.duration > 0 && data.value > 0)
            .sort((a, b) => (b[1].value / b[1].duration) - (a[1].value / a[1].duration));

        const sortedKeys = sortedItems.map(([key]) => key);

        Object.keys(this.itemsIcons).forEach(itemName => {
            const itemData = items[itemName];
            const icon = this.itemsIcons[itemName];

            if (!itemData || itemData.value <= 0) {
                icon.y = 70;
                this.tweens.killTweensOf(icon);
                icon.setAlpha(0);
                return;
            }

            const targetY = 30 + 40 * (sortedKeys.indexOf(itemName) + 1);
            if (!icon.isBlinking) icon.setAlpha(itemData.value / itemData.duration);

            if (icon.y !== targetY) {
                this.tweens.add({
                    targets: icon,
                    y: targetY,
                    duration: 300,
                    ease: 'Power2'
                });
            }

            if (itemData.value <= 5 && !icon.isBlinking) {
                icon.isBlinking = true;

                this.tweens.add({
                    targets: icon,
                    alpha: { from: 1, to: itemData.value / itemData.duration },
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else if (itemData.value > 5 && icon.isBlinking) {
                this.tweens.killTweensOf(icon);
                icon.setAlpha(itemData.value / itemData.duration);
                icon.isBlinking = false;
            }
        });
    }

    update() {
        this.updateItemsIcons();
    }
}