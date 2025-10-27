import { Scene, GameObjects } from 'phaser';
import { ArenaConfig } from '../services/ArenaIntegrationService';

export class MainMenu extends Scene
{
    background!: GameObjects.Image;
    title!: GameObjects.Text;
    instructions!: GameObjects.Text;
    arenaStatusText!: GameObjects.Text;

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

        // Check if Arena is available
        const arenaConfig = (window as any).arenaConfig as ArenaConfig | null;
        const arenaStatus = arenaConfig ? 'ARENA MODE' : 'SOLO MODE';
        const arenaColor = arenaConfig ? '#00FF00' : '#FFFF00';

        this.arenaStatusText = this.add.text(w, h + 40, arenaStatus, {
            fontFamily: 'PressStart2P', fontSize: 6, color: arenaColor,
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.textAnimationAtStart(this.title, 1000);
        this.textAnimationAtStart(this.instructions, 2000);
        this.textAnimationAtStart(this.arenaStatusText, 2500);

        const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        spaceKey.once('down', () => {
            // Check if Arena config is available from global window object
            const arenaConfig = (window as any).arenaConfig as ArenaConfig | null;

            if (arenaConfig) {
                console.log('[MainMenu] Starting game with Arena config:', arenaConfig);
                this.scene.start('Game', { levelId: 1, arenaConfig });
            } else {
                console.log('[MainMenu] Starting game in standalone mode');
                this.scene.start('Game', { levelId: 1 });
            }
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
