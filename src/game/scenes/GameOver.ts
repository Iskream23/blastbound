import { Scene, GameObjects } from 'phaser';

export class GameOver extends Scene
{
    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: GameObjects.Image;
    gameover_text! : GameObjects.Text;
    instructions!: GameObjects.Text;

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xff0000);

        this.background = this.add.image(0, 0, 'background');
        this.background.setAlpha(0.5);

        const w = this.scale.width / 2;
        const h = this.scale.height / 2;

        this.gameover_text = this.add.text(w, h - 16, 'Game Over', {
            fontFamily: 'PressStart2P', fontSize: 16, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        });
        this.gameover_text.setOrigin(0.5);

        this.instructions = this.add.text(w, h + 20, 'Press spacebar', {
            fontFamily: 'PressStart2P', fontSize: 8, color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);

        const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        spaceKey.once('down', () => {
            this.scene.start('MainMenu');
        });
    }
}
