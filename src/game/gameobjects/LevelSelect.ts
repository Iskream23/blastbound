import { Scene } from 'phaser';
import { LevelManager } from '../gameobjects/LevelManager';

export class LevelSelect extends Scene {
    constructor() {
        super('LevelSelect');
    }

    create() {
        this.add.text(this.scale.width / 2, 50, 'Select Level', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const levels = LevelManager.getAllLevels();
        const buttonsPerRow = 5;
        const buttonWidth = 100;
        const buttonHeight = 50;
        const spacing = 20;

        levels.forEach((level, index) => {
            const row = Math.floor(index / buttonsPerRow);
            const col = index % buttonsPerRow;
            const x = 100 + col * (buttonWidth + spacing);
            const y = 150 + row * (buttonHeight + spacing);

            const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x4444ff)
                .setInteractive()
                .on('pointerdown', () => {
                    this.scene.start('Game', { levelId: level.id });
                });

            this.add.text(x, y, `Level ${level.id}`, {
                fontSize: '20px',
                color: '#ffffff'
            }).setOrigin(0.5);
        });
    }
}