import Phaser from "phaser";
import { Bomb } from "./Bomb";

export class Player extends Phaser.GameObjects.Sprite {
    private gridX: number;
    private gridY: number;
    private isMoving: boolean = false;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private levelData: number[][];
    private spaceKey: Phaser.Input.Keyboard.Key;
    private bombs: Bomb[] = [];
    private maxBombs: number = 1;

    constructor(scene: Phaser.Scene, gridX: number, gridY: number, levelData: number[][]) {
        const pixelX = (gridX * 16) + 8;
        const pixelY = (gridY * 16) + 8;

        super(scene, pixelX, pixelY, 'player');

        scene.add.existing(this);
        
        this.gridX = gridX;
        this.gridY = gridY;
        this.levelData = levelData;

        this.cursors = scene.input.keyboard?.createCursorKeys()!;
        this.spaceKey = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)!;

        this.createAnim(this.scene, 'idle-top', 60, 60);
        this.createAnim(this.scene, 'walking-top', 68, 69);
        this.createAnim(this.scene, 'idle-down', 61, 61);
        this.createAnim(this.scene, 'walking-down', 62, 63);
        this.createAnim(this.scene, 'walking-right', 65, 66);

        this.play('idle-down');
    }

    update() {
        if (this.isMoving) return;

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            console.log("bomb placed");
            this.placeBomb();
        }

        let newGridX = this.gridX;
        let newGridY = this.gridY;

        if (this.cursors.left.isDown) {
            this.play('walking-right');
            this.setFlipX(true);
            newGridX--;
        } else if (this.cursors.right.isDown) {
            this.play('walking-right');
            this.setFlipX(false);
            newGridX++;
        } else if (this.cursors.up.isDown) {
            this.play('walking-top');
            newGridY--;
        } else if (this.cursors.down.isDown) {
            this.play('walking-down');
            newGridY++;
        } else {
            return;
        }

        if (this.canMoveTo(newGridX, newGridY)) {
            this.moveToGrid(newGridX, newGridY);
        }
    }

    private createAnim(scene: Phaser.Scene, animKey: string, start: number, end: number) {
        if (!scene.anims.exists(animKey)) {
            scene.anims.create({
                key: animKey,
                frames: scene.anims.generateFrameNumbers('player', {start: start, end: end}),
                frameRate: 10,
                repeat: 1
            })
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
        const hasBomb = this.bombs.some(bomb => 
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

    private placeBomb(): void {
        // Check if we can place more bombs
        if (this.bombs.length >= this.maxBombs) {
            return;
        }

        // Check if there's already a bomb at current position
        const hasBomb = this.bombs.some(bomb => 
            bomb.getGridX() === this.gridX && bomb.getGridY() === this.gridY
        );

        if (!hasBomb) {
            const bomb = new Bomb(this.scene, this.gridX, this.gridY);
            this.bombs.push(bomb);
        }
    }

    public removeBomb(gridX: number, gridY: number): void {
        this.bombs = this.bombs.filter(bomb => 
            !(bomb.getGridX() === gridX && bomb.getGridY() === gridY)
        );
    }

    getGridX(): number {
        return this.gridX;
    }

    getGridY(): number {
        return this.gridY;
    }
}