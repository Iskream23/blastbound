import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background!: GameObjects.Image;
    logo!: GameObjects.Image;
    title!: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const w = this.scale.width / 2;
        const h = this.scale.height / 2;
        const fontsize = 16;
        
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo');

        this.title = this.add.text(w, h - fontsize, 'Blastbound', {
            fontFamily: 'PressStart2P', fontSize: fontsize, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('Game');

        });
    }
}
