import Phaser from "phaser";

export class Player extends Phaser.GameObjects.Sprite {
    private gridX: number;
    private gridY: number;
    private isMoving: boolean = false;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private levelData: number[][]

    constructor(scene: Phaser.Scene, gridX: number, gridY: number, levelData: number[][]) {
        const pixelX = (gridX * 16) + 8;
        const pixelY = (gridY * 16) + 8;

        super(scene, pixelX, pixelY, 'player');

        scene.add.existing(this);
        
        this.gridX = gridX;
        this.gridY = gridY;
        this.levelData = levelData;

        this.cursors = scene.input.keyboard?.createCursorKeys()!;

        if (!scene.anims.exists('idle')) {
            scene.anims.create({
                key: 'idle',
                frames: scene.anims.generateFrameNumbers('player', {start: 60, end: 60}),
                frameRate: 10,
                repeat: 1
            })
        }

        this.play('idle');
    }

    update() {
        if (this.isMoving) return;

        let newGridX = this.gridX;
        let newGridY = this.gridY;

        if (this.cursors.left.isDown) {
            newGridX--;
        } else if (this.cursors.right.isDown) {
            newGridX++;
        } else if (this.cursors.up.isDown) {
            newGridY--;
        } else if (this.cursors.down.isDown) {
            newGridY++;
        } else {
            return;
        }

        // Check bounds (optional - adjust based on your level size)
        /*if (newGridX < 1 || newGridX > 8 || newGridY < 1 || newGridY > 8) {
            return;
        }*/

        if (this.canMoveTo(newGridX, newGridY)) {
            this.moveToGrid(newGridX, newGridY);
        }
    }

    private canMoveTo(gridX: number, gridY: number): boolean {
        // Check bounds
        if (gridX < 0 || gridX >= this.levelData[0].length || 
            gridY < 0 || gridY >= this.levelData.length) {
            return false;
        }

        const tileValue = this.levelData[gridY][gridX];
        
        // Allow movement on empty spaces (1) but block walls (2) and borders (70, 85)
        return tileValue === 1;
    }

    private moveToGrid(newGridX: number, newGridY: number) {
        this.isMoving = true;
        this.gridX = newGridX;
        this.gridY = newGridY;

        const targetX = (newGridX * 16) + 8;
        const targetY = (newGridY * 16) + 8;

        this.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
                this.isMoving = false;
            }
        });
    }
}