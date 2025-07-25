export default class PreloadingScene extends Phaser.Scene {
    constructor() {
        super('PreloadingScene');
    }

    preload() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.add.text(centerX, centerY - 50, 'Loading...', { font: '40px Monospace', fill: '#fff' }).setOrigin(0.5);
        const progressBar = this.add.graphics();
        this.add.graphics().fillStyle(0x222222, 0.8).fillRect(centerX - 160, centerY, 320, 50);
        this.load.on('progress', value => progressBar.clear().fillStyle(0xffffff, 1).fillRect(centerX - 150, centerY + 10, 300 * value, 30));
        
        this.load.setBaseURL('assets/');
        
        this.load.bitmapFont('pixelFont', 'pixel-font.png', 'pixel-font.xml');
        this.load.audio('platformSound', 'platform.mp3');

        this.make.graphics().fillStyle(0xffffff).fillRect(0, 0, 50, 10).generateTexture('whiteRect', 50, 10).destroy();
        this.make.graphics().fillStyle(0xffffff).fillCircle(2, 2, 2).generateTexture('star', 4, 4).destroy();
    }

    create() {
        this.scene.start('GameScene');
    }
}