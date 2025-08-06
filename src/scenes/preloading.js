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

        this.load.font('Monocraft', 'Monocraft.ttf');
        this.load.audio('platformSound', 'platform.mp3');
        // this.load.audio('music', 'music.mp3');
        this.load.atlas('flares', 'flares.png', 'flares.json');
        this.load.image('ground', 'ground.png');
        this.load.image('ground2', 'ground2.png');

        this.load.image('item-shield', 'items/shield.png');
        this.load.image('item-feather', 'items/feather.png');
        this.load.image('item-mystery', 'items/mystery.png');
        this.load.image('item-star', 'items/star.png');

        this.load.image('pauseIcon', 'pause.png');
        this.load.image('logo', 'logo.png');
        this.load.image('settingsIcon', 'settings.png');
        this.load.image('moneyIcon', 'money.png');
        this.load.image('gemIcon', 'gem.png');
        this.load.image('shopIcon', 'shop.png');
        this.load.image('userIcon', 'user.png');
        this.load.image('missionsIcon', 'missions.png');
        this.load.image('closeIcon', 'close.png');

        this.load.image('platform-invisible', 'platforms/invisible.png');
        this.load.image('platform-basic', 'platforms/basic.png');
        this.load.image('platform-breakable', 'platforms/breakable.png');
        this.load.image('platform-bounce', 'platforms/bounce.png');

        this.make.graphics().fillStyle(0xffffff).fillRect(0, 0, 50, 10).generateTexture('whiteRect', 50, 10).destroy();

        const width = this.scale.width;
        const height = this.scale.height;

        const rt = this.textures.createCanvas('bg-gradient', width, height);
        const ctx = rt.getContext();

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0E0E0E');
        gradient.addColorStop(1, '#301e4eff');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        rt.refresh();
    }

    create() {
        this.scene.start('HomeScene');
    }
}