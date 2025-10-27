import { Scene } from "phaser";
import { Player } from "../gameobjects/Player";
import { Level } from "../gameobjects/Level";
import { Enemy } from "../gameobjects/Enemy";
import { LevelManager } from "../gameobjects/LevelManager";
import { BackgroundScrollingPostFxPipeline } from "../shaders/background-scrolling-post-fx-pipeline";

export class Game extends Scene {
  camera!: Phaser.Cameras.Scene2D.Camera;
  background!: Phaser.GameObjects.Image;
  player!: Player;
  level!: Level;
  enemies!: Enemy[];
  isGameOver: boolean = false;
  currentLevelId: number = 1;
  pipeline: BackgroundScrollingPostFxPipeline;

  constructor() {
    super("Game");
  }

  init(data: { levelId?: number }) {
    // Accept level ID from scene transition
    this.currentLevelId = data.levelId || 1;
  }

  preload() {
    this.load.spritesheet("player", "assets/spritesheet.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("enemy", "assets/spritesheet.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.image("tiles", "assets/spritesheet.png");

    this.load.image("bg1", "assets/backgrounds/004.png");
    this.load.image("bg2", "assets/backgrounds/045.png");
    this.load.image("bg3", "assets/backgrounds/102.png");
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x000000);

    this.setupPipelines();
    this.createMainBg();

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

  private setupPipelines(): void {
    const renderer = this.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    if (!renderer.pipelines.get(BackgroundScrollingPostFxPipeline.name)) {
      renderer.pipelines.addPostPipeline(
        BackgroundScrollingPostFxPipeline.name,
        BackgroundScrollingPostFxPipeline,
      );
    }
  }

  createMainBg(): void {
    const bg = this.add
      .image(0, 0, "bg1")
      .setDisplaySize(this.camera.width, this.camera.height)
      .setOrigin(0, 0)
      .setPostPipeline(BackgroundScrollingPostFxPipeline.name);

    this.pipeline = bg.getPostPipeline(
      BackgroundScrollingPostFxPipeline.name,
    ) as BackgroundScrollingPostFxPipeline;

    // Reset shader time for smooth scrolling from the start
    this.pipeline.resetTime();
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
      this.enemies.forEach((enemy) => enemy.destroy());
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
      this.level.getLevelData(),
    );

    // Create enemies from level config
    this.enemies = [];
    levelConfig.enemies.forEach((enemyConfig) => {
      this.enemies.push(
        new Enemy(
          this,
          enemyConfig.x,
          enemyConfig.y,
          this.level.getLevelData(),
          enemyConfig.type,
        ),
      );
    });

    // Reset game over flag
    this.isGameOver = false;

    // Display win condition description
    this.displayWinCondition(levelConfig.winCondition.description);

    // Add level complete check
    this.checkLevelComplete();
  }

  private displayWinCondition(description: string): void {
    // Display the win condition at the start of the level
    const text = this.add
      .text(this.scale.width / 2 - 8, this.scale.height / 2 - 8, description, {
        fontFamily: "PressStart2P",
        fontSize: "8px",
        color: "#FFFF00",
        stroke: "#000000",
        strokeThickness: 2,
        align: "center",
      })
      .setOrigin(0.5);

    // Fade out and destroy after 3 seconds
    this.tweens.add({
      targets: text,
      alpha: 0,
      duration: 500,
      delay: 2500,
      onComplete: () => {
        text.destroy();
      },
    });
  }

  private checkLevelComplete(): void {
    // Get the current level's win condition
    const levelConfig = LevelManager.getLevel(this.currentLevelId);
    if (!levelConfig) {
      console.error(`Level ${this.currentLevelId} not found!`);
      return;
    }

    // Check win condition periodically
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        if (levelConfig.winCondition.check(this)) {
          this.onLevelComplete();
        }
      },
    });
  }

  private onLevelComplete(): void {
    // Show level complete message
    const text = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "Level Complete!", {
        fontFamily: "PressStart2P",
        fontSize: "16px",
        color: "#FFFFFF",
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0.5);

    // Transition to next level
    this.time.delayedCall(2000, () => {
      const nextLevelId = this.currentLevelId + 1;
      if (nextLevelId <= LevelManager.getLevelCount()) {
        this.scene.restart({ levelId: nextLevelId });
      } else {
        // All levels complete - go to game over screen with victory message
        this.scene.start("GameOver", { isVictory: true });
      }
    });
  }

  private setupEventListeners(): void {
    this.events.on("bomb-exploded", (gridX: number, gridY: number) => {
      this.camera.shake(500, 0.01);
      this.player.removeBomb(gridX, gridY);
    });

    this.events.on("enemy-hit", (enemy: Enemy) => {
      this.removeEnemy(enemy);
    });

    this.events.on("player-hit", () => {
      if (!this.isGameOver) {
        this.isGameOver = true;
        this.player.setTint(0xff0000);
        this.camera.flash(500, 255, 0, 0);
        this.time.delayedCall(1500, () => {
          this.scene.start("GameOver", { isVictory: false });
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

  update() {
    if (this.player) {
      this.player.update();
    }
  }

  shutdown() {
    // Clean up event listeners
    this.events.off("bomb-exploded");
    this.events.off("player-hit");
    this.events.off("enemy-hit");
    this.events.off("crate-destroyed");

    // Clean up enemies
    this.enemies.forEach((enemy) => enemy.destroy());
    this.enemies = [];
  }
}
