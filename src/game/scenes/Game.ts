import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;

    constructor ()
    {
        super('Game');
    }

    preload()
    {
        this.load.spritesheet('player',
            'assets/spritesheet.png',
            {frameWidth: 16, frameHeight: 16}
        );
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        if (!this.anims.exists('idle')) {
            this.anims.create({
                key: 'idle',
                frames: this.anims.generateFrameNumbers('player', {start: 60, end: 60}),
                frameRate: 10,
                repeat: 0
            });
        }

        let player = this.add.sprite(50, 50, 'player');
        player.anims.play('idle', true);

        this.input.once('pointerdown', () => {

            this.scene.start('GameOver');

        });
    }
}
