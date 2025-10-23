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

    constructor(scene: Phaser.Scene, gridX: number, gridY: number, levelData: number[][], moveDirection: 'horizontal' | 'vertical' = 'horizontal') {
        const pixelX = (gridX * 16) + 8;
        const pixelY = (gridX * 16) + 8;
        
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
            // Try moving in the new direction immediately
            this.attemptMove();
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
        const level = (this.scene as any).level;
        const bombs = this.scene.children.list.filter(child =>
            child.constructor.name === 'bomb'
        );
        const hasBomb = bombs.some((bomb: any) =>
            bomb.getGridX() === gridX && bomb.getGridY() === gridY
        );

        // Check if there's a crate at this position
        const hasCrate = level.hasCrateAt(gridX, gridY);

        // Allow movement on empty spaces (1) but block walls (2) and borders (70, 85) and bombs
        return tileValue === 1 && !hasBomb && !hasCrate;
    }

    private moveToGrid(newGridX: number, newGridY: number) {
        this.isMoving = true;

        const oldX = this. gridX;
        const oldY = this.gridY;

        this.gridX = newGridX;
        this.gridY = newGridY;

        const targetX = (newGridX * 16) + 8;
        const targetY = (newGridY * 16) + 8;

        this.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            duration: this.moveDelay * 0.8,
            ease: 'Power2',
            onComplete: () => {
                this.isMoving = false;
                this.checkPlayerCollision();
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
        if (this.moveTimer) {
            this.moveTimer.destroy();
        }
        super.destroy(fromScene);
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