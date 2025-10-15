import Phaser from 'phaser';

export class Crate extends Phaser.GameObjects.Sprite {
    private gridX: number;
    private gridY: number;

    constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
        const pixelX = (gridX * 16) + 8;
        const pixelY = (gridY * 16) + 8;

        super(scene, pixelX, pixelY, 'player', 9);

        scene.add.existing(this);
        
        this.gridX = gridX;
        this.gridY = gridY;
    }

    destroy(): void {
        // Add destruction animation
        this.scene.tweens.add({
            targets: this,
            scale: { from: 1, to: 0 },
            alpha: { from: 1, to: 0 },
            duration: 300,
            onComplete: () => {
                super.destroy();
            }
        });
    }

    getGridX(): number {
        return this.gridX;
    }

    getGridY(): number {
        return this.gridY;
    }
}