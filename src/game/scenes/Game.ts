import { Scene } from 'phaser';
import { Player } from '../gameobjects/Player';
import { Level } from '../gameobjects/Level';
import { Enemy } from '../gameobjects/Enemy';

export class Game extends Scene
{
    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: Phaser.GameObjects.Image; 
    player!: Player;
    level!: Level;
    enemies!: Enemy[];

    constructor ()
    {
        super('Game');
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
        //this.camera.centerOn(0, 0);
        this.camera.setBackgroundColor(0x000000);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.level = new Level(this);
        this.level.create();

        this.player = new Player(this, 5, 1, this.level.getLevelData());

        // Create enemies
        this.enemies = [];
        this.createEnemies();

        // Listen for bomb explosions
        this.events.on('bomb-exploded', (gridX: number, gridY: number) => {
            this.camera.shake(500, 0.01);
            this.player.removeBomb(gridX, gridY);
        });

        // Listen for enemy hit by explosion
        this.events.on('enemy-hit', (enemy: Enemy) => {
            this.removeEnemy(enemy);
        });

        // Listen for player death
        this.events.on('player-hit', () => {
            this.scene.start('GameOver');
        });

        /*
        this.events.on('crate-destroyed', (gridX: number, gridY: number) => {
            // Random chance to spawn a power-up
            if (Math.random() < 0.3) { // 30% chance
                // Create power-up at crate position
                // this.createPowerUp(gridX, gridY);
            }
        });*/
    }

    private createEnemies(): void {
        // Add some enemies at specific positions
        // Horizontal moving enemies
        this.enemies.push(new Enemy(this, 7, 3, this.level.getLevelData(), 'horizontal'));
        this.enemies.push(new Enemy(this, 10, 5, this.level.getLevelData(), 'horizontal'));
        
        // Vertical moving enemies
        this.enemies.push(new Enemy(this, 7, 7, this.level.getLevelData(), 'vertical'));
        this.enemies.push(new Enemy(this, 12, 5, this.level.getLevelData(), 'vertical'));
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
