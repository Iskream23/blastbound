import Phaser from 'phaser';
import { Crate } from './Crate';

export class Bomb extends Phaser.GameObjects.Sprite {
    private gridX: number;
    private gridY: number;
    private explosionTimer: number = 3000; // 3 seconds
    private explosionRange: number = 2;
    private hasExploded: boolean = false;

    constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
        const pixelX = (gridX * 16) + 8;
        const pixelY = (gridY * 16) + 8;

        super(scene, pixelX, pixelY, 'player');

        scene.add.existing(this);

        this.gridX = gridX;
        this.gridY = gridY;

        // Create bomb animation if it doesn't exist
        if (!scene.anims.exists('bomb-pulse')) {
            scene.anims.create({
                key: 'bomb-pulse',
                frames: scene.anims.generateFrameNumbers('player', {start: 79, end: 79}),
                frameRate: 2,
                repeat: -1
            });
        }

        this.play('bomb-pulse');

        // Add pulsing effect
        scene.tweens.add({
            targets: this,
            scale: { from: 1, to: 1.2 },
            duration: 300,
            yoyo: true,
            repeat: -1
        });

        // Set timer for explosion
        scene.time.delayedCall(this.explosionTimer, () => {
            this.explode();
        });
    }

    private explode(): void {
        if (this.hasExploded) return;

        this.hasExploded = true;

        // Create explosion effect at bomb position
        this.createExplosion(this.gridX, this. gridY);

        // Create explosions in four directions
        for (let i = 1; i <= this.explosionRange; i++) {
            // Right
            if (this.checkExplosionPath(this.gridX + i, this.gridY)) {
                this.createExplosion(this.gridX + i, this.gridY);
            } else break;
        }
        
        for (let i = 1; i <= this.explosionRange; i++) {
            // Left
            if (this.checkExplosionPath(this.gridX - i, this.gridY)) {
                this.createExplosion(this.gridX - i, this.gridY);
            } else break;
        }

        for (let i = 1; i <= this.explosionRange; i++) {
            // Down
            if (this.checkExplosionPath(this.gridX, this.gridY + i)) {
                this.createExplosion(this.gridX, this.gridY + i);
            } else break;
        }

        for (let i = 1; i <= this.explosionRange; i++) {
            // Up
            if (this.checkExplosionPath(this.gridX, this.gridY - i)) {
                this.createExplosion(this.gridX, this.gridY - i);
            } else break;
        }

        // Emit explosion event
        this.scene.events.emit('bomb-exploded', this.gridX, this.gridY, this.explosionRange);

        // Destroy the bomb
        this.destroy();
    }

    private checkExplosionPath(gridX: number, gridY: number): boolean {
        const level = (this.scene as any).level;
        const tileValue = level.getTileAt(gridX, gridY);

        // Check for crate
        const crate = level.getCrateAt(gridX, gridY);
        if (crate) {
            // Destroy the crate but stop the explosion
            this.destroyCrate(crate);
            return false; // Explosion stops at crate
        }
        
        // Explosion can pass through empty spaces (1)
        // but is blocked by walls (70, 85, 2)
        return tileValue === 1;
    }

    private destroyCrate(crate: Crate): void {
        const level = (this.scene as any).level;
        crate.destroy();
        level.removeCrate(crate);
        
        // Emit event for crate destruction (useful for scoring)
        this.scene.events.emit('crate-destroyed', crate.getGridX(), crate.getGridY());
    }

    private createExplosion(gridX: number, gridY: number): void {
        const pixelX = (gridX * 16) + 8;
        const pixelY = (gridY * 16) + 8;
        
        // Create explosion sprite (using a different frame from spritesheet)
        const explosion = this.scene.add.sprite(pixelX, pixelY, 'player', 77); // Assuming frame 77 is explosion
        
        // Add explosion animation
        this.scene.tweens.add({
            targets: explosion,
            scale: { from: 0.5, to: 1.5 },
            alpha: { from: 1, to: 0 },
            duration: 500,
            onComplete: () => {
                explosion.destroy();
            }
        });

        // Check for crate at explosion position (for the center of bomb)
        const level = (this.scene as any).level;
        const crate = level.getCrateAt(gridX, gridY);
        if (crate) {
            this.destroyCrate(crate);
        }

        // Check for player collision
        const player = (this.scene as any).player;
        if (player && player.getGridX() === gridX && player.getGridY() === gridY) {
            this.scene.events.emit('player-hit');
        }

        // Check for enemy collision
        const enemies = (this.scene as any).enemies;
        if (enemies) {
            enemies.forEach((enemy: any) => {
                if (enemy && enemy.getGridX() === gridX && enemy.getGridY() === gridY) {
                    this.scene.events.emit('enemy-hit', enemy);
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