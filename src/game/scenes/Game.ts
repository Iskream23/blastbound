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
        this.load.image('tiles', 'assets/spritesheet.png');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        const level = [
            [ 85, 70, 70, 70, 70, 70, 70, 70, 70, 85 ],
            [ 85, 1, 1, 1, 1, 1, 1, 1, 1, 85 ],
            [ 85, 1, 1, 1, 1, 1, 1, 1, 1, 85 ],
            [ 85, 1, 1, 1, 1, 1, 1, 1, 1, 85 ],
            [ 85, 1, 1, 1, 1, 1, 1, 1, 1, 85 ],
            [ 85, 1, 1, 1, 1, 1, 1, 1, 1, 85 ],
            [ 85, 1, 1, 1, 1, 1, 1, 1, 1, 85 ],
            [ 85, 1, 1, 1, 1, 1, 1, 1, 1, 85 ],
            [ 85, 1, 1, 1, 1, 1, 1, 1, 1, 85 ],
            [ 70, 70, 70, 70, 70, 70, 70, 70, 70, 70 ],
        ]

        const map = this.make.tilemap({data: level, tileWidth: 16, tileHeight: 16});
        const tiles = map.addTilesetImage('tiles');

        if (!tiles) {
            console.error('Failed to load tileset!');
            return;
        }

        const layer = map.createLayer(0, tiles, 0, 0);

        const playerX = (1 * 16) + 8;
        const playerY = (1 * 16) + 8;
        this.player = new Player(this, playerX, playerY);

        this.input.once('pointerdown', () => {
            this.scene.start('GameOver');
        });
    }
}
