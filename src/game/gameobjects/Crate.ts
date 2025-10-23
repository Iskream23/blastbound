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
            angle: { from: this.angle, to: this.angle + 180 }, // Spin while shrinking
            duration: 300,
            ease: 'Power2.easeIn',
            onComplete: () => {
                this.addDestructionEffect();
            }
        });
    }

    private addDestructionEffect(): void {
        // Create some debris particles for better visual feedback
        const particleCount = 4;
        const colors = [0xD2691E, 0x8B4513, 0xA0522D]; // Brown wood colors
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.scene.add.rectangle(
                this.x + (Math.random() - 0.5) * 8,
                this.y + (Math.random() - 0.5) * 8,
                8, 8,
                colors[Math.floor(Math.random() * colors.length)]
            );

            this.scene.tweens.add({
                targets: particle,
                x: particle.x + (Math.random() - 0.5) * 30,
                y: particle.y + (Math.random() - 0.5) * 30,
                alpha: { from: 1, to: 0 },
                scale: { from: 1, to: 0 },
                duration: 1000 + Math.random() * 200,
                ease: 'Power2.easeOut',
                onComplete: () => {
                    super.destroy();
                    particle.destroy();
                }
            });
        }
    }

    getGridX(): number {
        return this.gridX;
    }

    getGridY(): number {
        return this.gridY;
    }
}