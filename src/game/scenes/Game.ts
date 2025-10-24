import { Scene } from 'phaser';
import { Player } from '../gameobjects/Player';
import { Level } from '../gameobjects/Level';
import { Enemy } from '../gameobjects/Enemy';
import { LevelManager } from '../gameobjects/LevelManager';

export class Game extends Scene
{
    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: Phaser.GameObjects.Image; 
    player!: Player;
    level!: Level;
    enemies!: Enemy[];
    isGameOver: boolean = false;
    currentLevelId: number = 1;

    constructor ()
    {
        super('Game');
    }

    init(data: { levelId?: number }) {
        // Accept level ID from scene transition
        this.currentLevelId = data.levelId || 1;
    }

    preload()
    {
        this.load.spritesheet('player', 'assets/spritesheet.png',{frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('enemy', 'assets/spritesheet.png',{frameWidth: 16, frameHeight: 16});
        this.load.image('tiles', 'assets/spritesheet.png');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        // Load the level
        this.loadLevel(this.currentLevelId);

        // Set up event listeners
        this.setupEventListeners();

        /*
        this.events.on('crate-destroyed', (gridX: number, gridY: number) => {
            // Random chance to spawn a power-up
            if (Math.random() < 0.3) { // 30% chance
                // Create power-up at crate position
                // this.createPowerUp(gridX, gridY);
            }
        });*/
    }

    private loadLevel(levelId: number): void {
        // Get level configuration
        const levelConfig = LevelManager.getLevel(levelId);
        if (!levelConfig) {
            console.error(`Level ${levelId} not found!`);
            return;
        }

        // Clean up existing level if any
        if (this.level) {
            // Destroy existing elements
            if (this.player) {
                this.player.destroy();
            }
            this.enemies.forEach(enemy => enemy.destroy());
            this.enemies = [];
        }

        // Create new level
        this.level = new Level(this, levelConfig);
        this.level.create();

        // Create player at level-specific start position
        this.player = new Player(
            this, 
            levelConfig.playerStartX, 
            levelConfig.playerStartY, 
            this.level.getLevelData()
        );

        // Create enemies from level config
        this.enemies = [];
        levelConfig.enemies.forEach(enemyConfig => {
            this.enemies.push(new Enemy(
                this, 
                enemyConfig.x, 
                enemyConfig.y, 
                this.level.getLevelData(), 
                enemyConfig.type
            ));
        });

        // Reset game over flag
        this.isGameOver = false;

        // Add level complete check
        this.checkLevelComplete();
    }

    private checkLevelComplete(): void {
        // Check if all crates are destroyed
        this.time.addEvent({
            delay: 500,
            loop: true,
            callback: () => {
                if (this.level.getCrates().length === 0 && this.enemies.length === 0) {
                    this.onLevelComplete();
                }
            }
        });
    }

    private onLevelComplete(): void {
        // Show level complete message
        const text = this.add.text(
            this.scale.width / 2, 
            this.scale.height / 2, 
            'Level Complete!', 
            { fontSize: '32px', color: '#ffffff' }
        ).setOrigin(0.5);

        // Transition to next level
        this.time.delayedCall(2000, () => {
            const nextLevelId = this.currentLevelId + 1;
            if (nextLevelId <= LevelManager.getLevelCount()) {
                this.scene.restart({ levelId: nextLevelId });
            } else {
                // All levels complete - go to victory screen
                this.scene.start('Victory');
            }
        });
    }

    private setupEventListeners(): void {
        this.events.on('bomb-exploded', (gridX: number, gridY: number) => {
            this.camera.shake(500, 0.01);
            this.player.removeBomb(gridX, gridY);
        });

        this.events.on('enemy-hit', (enemy: Enemy) => {
            this.removeEnemy(enemy);
        });

        this.events.on('player-hit', () => {
            if (!this.isGameOver) {
                this.isGameOver = true;
                this.player.setTint(0xff0000);
                this.camera.flash(500, 255, 0, 0);
                this.time.delayedCall(1500, () => {
                    this.scene.start('GameOver', { levelId: this.currentLevelId });
                });
            }
        });
    }

    private removeEnemy(enemy: Enemy): void {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
            enemy.onDestroy();
            
            // Optional: Add score or spawn power-up
            // this.events.emit('enemy-destroyed', enemy.getGridX(), enemy.getGridY());
        }
    }

    update()
    {
        if (this.player) {
            this.player.update();
        }
    }

    shutdown()
    {
        // Clean up event listeners
        this.events.off('bomb-exploded');
        this.events.off('player-hit');
        this.events.off('enemy-hit');
        this.events.off('crate-destroyed');

        // Clean up enemies
        this.enemies.forEach(enemy => enemy.destroy());
        this.enemies = [];
    }
}
