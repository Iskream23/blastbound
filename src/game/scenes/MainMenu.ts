import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background!: GameObjects.Image;
    title!: GameObjects.Text;
    instructions!: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const w = this.scale.width / 2;
        const h = this.scale.height / 2;
        const fontsizeTitle = 16;
        
        this.background = this.add.image(0, 0, 'background');

        this.title = this.add.text(w, h - fontsizeTitle, 'Blastbound', {
            fontFamily: 'PressStart2P', fontSize: fontsizeTitle, color: '#FFFFFF',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.instructions = this.add.text(w, h + 20, 'Press spacebar', {
            fontFamily: 'PressStart2P', fontSize: 8, color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.textAnimationAtStart(this.title, 1000);
        this.textAnimationAtStart(this.instructions, 2000);

        const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        spaceKey.once('down', () => {
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
