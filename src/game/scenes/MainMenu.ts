import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background!: GameObjects.Image;
    logo!: GameObjects.Image;
    title!: GameObjects.Text;
    instructions!: GameObjects.Text;
    instructions2!: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const w = this.scale.width / 2;
        const h = this.scale.height / 2;
        const fontsizeTitle = 16;
        
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo');

        this.title = this.add.text(w, h - fontsizeTitle, 'Blastbound', {
            fontFamily: 'PressStart2P', fontSize: fontsizeTitle, color: '#FFFFFF',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.instructions = this.add.text(w, h + 20, 'Arrow keys to move', {
            fontFamily: 'PressStart2P', fontSize: 8, color: '#FADA5E',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.instructions2 = this.add.text(w, h + 30, 'Spacebar to place bomb', {
            fontFamily: 'PressStart2P', fontSize: 8, color: '#FADA5E',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.textAnimationAtStart(this.title, 1000);
        this.textAnimationAtStart(this.instructions, 2000);
        this.textAnimationAtStart(this.instructions2, 2200);

        this.input.once('pointerdown', () => {

            this.scene.start('Game');

        });
    }

    private textAnimationAtStart(text: Phaser.GameObjects.Text, duration: number)
    {
        this.tweens.add({
            targets: text,
            alpha: 1,
            duration: duration,
            ease: 'Power2'
        });
    }
}
