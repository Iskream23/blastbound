import Phaser from "phaser";

export class Enemy extends Phaser.GameObjects.Sprite{
    private gridX: number;
    private gridY: number;
    private isMoving: boolean = false;
    private levelData: number[][];
    private moveDirection: 'horizontal' | 'vertical';
    private currentDirection: number = 1; // 1 for right/down, -1 for left/up
    private moveTimer: Phaser.Time.TimerEvent;
    private moveDelay: number = 1000; // Move every 1 second
    private moveTween: Phaser.Tweens.Tween | null = null; // Store reference to active tween

    constructor(scene: Phaser.Scene, gridX: number, gridY: number, levelData: number[][], moveDirection: 'horizontal' | 'vertical' = 'horizontal') {
        const pixelX = (gridX * 16) + 8;
        const pixelY = (gridY * 16) + 8;
        
        super(scene, pixelX, pixelY, 'enemy');
        scene.add.existing(this);

        this.gridX = gridX;
        this.gridY = gridY;
        this.levelData = levelData;
        this.moveDirection = moveDirection;

        this.createAnim(this.scene, 'enemy-idle', 16, 16);
        this.play('enemy-idle');

        this.moveTimer = this.scene.time.addEvent({
            delay: this.moveDelay,
            callback: this.attemptMove,
            callbackScope: this,
            loop: true
        })
    }

    private createAnim(scene: Phaser.Scene, animKey: string, start: number, end: number) {
        if (!scene.anims.exists(animKey)) {
            scene.anims.create({
                key: animKey,
                frames: scene.anims.generateFrameNumbers('enemy', {start: start, end: end}),
                frameRate: 8,
                repeat: -1
            });
        }
    }

    private attemptMove(): void {
        if (this.isMoving) return;

        let newGridX = this.gridX;
        let newGridY = this.gridY;

        if (this.moveDirection === 'horizontal') {
            newGridX += this.currentDirection;
            this.setFlipX(this.currentDirection < 0);
        } else {
            newGridY += this.currentDirection;
        }

        // Check if we can move to the new position
        if (this.canMoveTo(newGridX, newGridY)) {
            this.moveToGrid(newGridX, newGridY);
        } else {
            // Reverse direction if we hit an obstacle
            this.currentDirection *= -1;
        }
    }

    private canMoveTo(gridX: number, gridY: number): boolean {
        // Check bounds
        if (gridX < 0 || gridX >= this.levelData[0].length ||
            gridY < 0 || gridY >= this.levelData.length) {
            return false;
        }

        const tileValue = this.levelData[gridY][gridX];

        // Check if there's a bomb at this position
        const player = (this.scene as any).player;
        //const hasBomb = player && player.bombs && player.bombs.some((bomb: any) =>
        const hasBomb = player && player.getBombs().some((bomb: any) =>
            bomb.getGridX() === gridX && bomb.getGridY() === gridY
        );

        // Check if there's a crate at this position
        const level = (this.scene as any).level;
        const hasCrate = level.hasCrateAt(gridX, gridY);

        // Allow movement on empty spaces (1) but block walls (2) and borders (70, 85) and bombs
        return tileValue === 1 && !hasBomb && !hasCrate;
    }

    private moveToGrid(newGridX: number, newGridY: number) {
        this.isMoving = true;

        this.gridX = newGridX;
        this.gridY = newGridY;

        const targetX = (newGridX * 16) + 8;
        const targetY = (newGridY * 16) + 8;

        this.moveTween = this.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            duration: this.moveDelay * 0.8,
            ease: 'Power2',
            onComplete: () => {
                this.isMoving = false;
                // Check if the enemy still exists before checking collision
                if (this.scene) {
                    this.checkPlayerCollision();
                }
            }
        });
    }

    private checkPlayerCollision(): void {
        const player = (this.scene as any).player;
        if (player && player.getGridX() === this.gridX  && player.getGridY() === this.gridY) {
            this.scene.events.emit('player-hit');
        }
    }

    update(): void {
        // Additional update logic if needed
        // Check collision even when not moving (in case player moves into enemy)
        if (!this.isMoving) {
            this.checkPlayerCollision();
        }
    }

    destroy(fromScene?: boolean): void {
        if (this.moveTween) {
            this.moveTween.stop();
            this.moveTween = null;
        }

        if (this.moveTimer) {
            this.moveTimer.destroy();
        }
        
        this.setTint(0xff0000);
        this.addBloodEffect(fromScene);
    }

    private addBloodEffect(fromScene?: boolean): void {
        // Create some debris particles for better visual feedback
        const particleCount = 4;
        const colors = [0x8B0000, 0xDC143C, 0xB22222];
        
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
                    super.destroy(fromScene);
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

    isAtPosition(gridX: number, gridY: number): boolean {
        return this.gridX === gridX && this.gridY === gridY;
    }

    // Call this when enemy is destroyed by bomb
    onDestroy(): void {
        this.destroy();
    }
}