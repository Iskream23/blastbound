import { Scene } from 'phaser';
import { Player } from '../gameobjects/Player';
import { Level } from '../gameobjects/Level';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    player: Player;
    level: Level;

    constructor ()
    {
        super('Game');
    }

    preload()
    {
        this.load.spritesheet('player', 'assets/spritesheet.png',{frameWidth: 16, frameHeight: 16});
        this.load.image('tiles', 'assets/spritesheet.png');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.level = new Level(this);
        this.level.create();

        this.player = new Player(this, 1, 1, this.level.getLevelData());

        // Listen for player death
        this.events.on('player-hit', () => {
            this.scene.start('GameOver');
        });
    }

    update()
    {
        if (this.player) {
            this.player.update();
        }
    }
}
