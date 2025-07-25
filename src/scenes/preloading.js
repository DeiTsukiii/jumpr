export default class PreloadingScene extends Phaser.Scene {
    constructor() {
        super('PreloadingScene');
    }

    preload() {
        this.cameras.main.setBackgroundColor('#000');
        const centerX = this.cameras.main.width / 2, centerY = this.cameras.main.height / 2;
        const loadingText = this.add.text(centerX, centerY - 50, 'Loading...', { font: '40px Monospace', fill: '#fff' }).setOrigin(0.5);
        const progressBar = this.add.graphics(), progressBox = this.add.graphics().fillStyle(0x222222, 0.8).fillRect(centerX - 160, centerY, 320, 50);
        this.load.on('progress', value => {
            progressBar.clear().fillStyle(0xffffff, 1).fillRect(centerX - 150, centerY + 10, 300 * value, 30);
        });
        this.load.once('complete', () => [progressBar, progressBox, loadingText].forEach(obj => obj.destroy()));
        
        this.load.bitmapFont('pixelFont', 'assets/pixel-font.png', 'assets/pixel-font.xml');
        this.load.audio('platformSound', 'assets/platform.mp3');
    }

    create() {
        this.scene.start('GameScene');
    }
}