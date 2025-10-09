import { Scene } from 'phaser';
import { Player } from '../gameobjects/Player';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    player: Player;

    constructor ()
    {
        super('Game');
    }

    preload()
    {
        this.load.spritesheet('player', 'assets/spritesheet.png',{frameWidth: 16, frameHeight: 16});
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.player = new Player(this, 50, 50);

        this.input.once('pointerdown', () => {
            this.scene.start('GameOver');
        });
    }
}
