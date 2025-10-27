import { Scene } from "phaser";
import { Enemy } from "../gameobjects/Enemy";
import { Level } from "../gameobjects/Level";
import { DifficultyEvent } from "../services/ArenaIntegrationService";

export enum DifficultyLevel {
  EASY = "easy",
  NORMAL = "normal",
  HARD = "hard",
  EXTREME = "extreme",
}

export class DifficultyManager {
  private scene: Scene;
  private level: Level;
  private enemies: Enemy[];
  private currentDifficulty: DifficultyLevel = DifficultyLevel.NORMAL;

  // Difficulty settings
  private enemySpeedMultipliers: Record<DifficultyLevel, number> = {
    [DifficultyLevel.EASY]: 0.7,
    [DifficultyLevel.NORMAL]: 1.0,
    [DifficultyLevel.HARD]: 1.5,
    [DifficultyLevel.EXTREME]: 2.0,
  };

  private enemyCountMultipliers: Record<DifficultyLevel, number> = {
    [DifficultyLevel.EASY]: 0.5,
    [DifficultyLevel.NORMAL]: 1.0,
    [DifficultyLevel.HARD]: 1.5,
    [DifficultyLevel.EXTREME]: 2.5,
  };

  constructor(scene: Scene, level: Level, enemies: Enemy[]) {
    this.scene = scene;
    this.level = level;
    this.enemies = enemies;
  }

  /**
   * Apply difficulty event from Arena
   */
  public applyDifficultyEvent(event: DifficultyEvent): void {
    console.log("[DifficultyManager] Applying difficulty event:", event);

    const eventName = event.eventName.toLowerCase();

    // Map event names to difficulty actions
    if (eventName.includes("easy") || eventName.includes("slow")) {
      this.setDifficulty(DifficultyLevel.EASY);
    } else if (eventName.includes("hard") || eventName.includes("fast")) {
      this.setDifficulty(DifficultyLevel.HARD);
    } else if (eventName.includes("extreme") || eventName.includes("chaos")) {
      this.setDifficulty(DifficultyLevel.EXTREME);
    } else if (eventName.includes("spawn") || eventName.includes("add")) {
      this.spawnExtraEnemies(2);
    } else if (eventName.includes("remove") || eventName.includes("clear")) {
      this.removeRandomEnemies(2);
    } else if (eventName.includes("reset")) {
      this.setDifficulty(DifficultyLevel.NORMAL);
    }

    // Show difficulty change notification
    this.showDifficultyNotification(event);

    // Check if final event (ends game)
    if (event.isFinal) {
      this.handleFinalEvent(event);
    }
  }

  /**
   * Set difficulty level
   */
  public setDifficulty(difficulty: DifficultyLevel): void {
    console.log("[DifficultyManager] Setting difficulty:", difficulty);

    const oldDifficulty = this.currentDifficulty;
    this.currentDifficulty = difficulty;

    // Adjust enemy speeds
    const speedMultiplier = this.enemySpeedMultipliers[difficulty];
    this.adjustEnemySpeeds(speedMultiplier);

    // Adjust enemy count if needed
    if (difficulty > oldDifficulty) {
      // Increase difficulty - spawn enemies
      const enemiesToSpawn = Math.floor(
        this.enemies.length * (this.enemyCountMultipliers[difficulty] - 1)
      );
      if (enemiesToSpawn > 0) {
        this.spawnExtraEnemies(enemiesToSpawn);
      }
    } else if (difficulty < oldDifficulty) {
      // Decrease difficulty - remove some enemies
      const enemiesToRemove = Math.floor(
        this.enemies.length * (1 - this.enemyCountMultipliers[difficulty])
      );
      if (enemiesToRemove > 0) {
        this.removeRandomEnemies(enemiesToRemove);
      }
    }

    // Visual feedback
    this.showDifficultyChangeFeedback(difficulty);
  }

  /**
   * Adjust enemy movement speeds
   */
  private adjustEnemySpeeds(multiplier: number): void {
    for (const enemy of this.enemies) {
      // Adjust enemy move delay (lower = faster)
      const baseMoveDelay = 1000;
      const newMoveDelay = Math.max(200, baseMoveDelay / multiplier);

      // Access private moveTimer if possible, otherwise recreate timer
      if ((enemy as any).moveTimer) {
        (enemy as any).moveTimer.destroy();
        (enemy as any).moveTimer = this.scene.time.addEvent({
          delay: newMoveDelay,
          callback: () => (enemy as any).attemptMove(),
          callbackScope: enemy,
          loop: true,
        });
      }
    }

    console.log("[DifficultyManager] Adjusted enemy speeds:", multiplier);
  }

  /**
   * Spawn extra enemies
   */
  private spawnExtraEnemies(count: number): void {
    console.log("[DifficultyManager] Spawning", count, "extra enemies");

    for (let i = 0; i < count; i++) {
      const { gridX, gridY } = this.findEnemySpawnPosition();

      const enemy = new Enemy(
        this.scene,
        gridX,
        gridY,
        this.level.getLevelData(),
        Math.random() < 0.5 ? "horizontal" : "vertical"
      );

      this.enemies.push(enemy);

      // Add spawn effect
      this.createSpawnEffect(gridX * 16 + 8, gridY * 16 + 8);
    }

    // Show spawn notification
    const text = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        `+${count} ENEMIES!`,
        {
          fontFamily: "PressStart2P",
          fontSize: "16px",
          color: "#ff0000",
          stroke: "#000000",
          strokeThickness: 4,
        }
      )
      .setOrigin(0.5)
      .setDepth(1000);

    this.scene.tweens.add({
      targets: text,
      scale: 1.5,
      alpha: 0,
      duration: 1500,
      ease: "Power2",
      onComplete: () => {
        text.destroy();
      },
    });
  }

  /**
   * Find valid spawn position for enemy
   */
  private findEnemySpawnPosition(): { gridX: number; gridY: number } {
    const maxAttempts = 100;

    for (let i = 0; i < maxAttempts; i++) {
      const gridX = Phaser.Math.Between(2, 29);
      const gridY = Phaser.Math.Between(2, 21);

      // Check if position is valid (would need level reference for wall checking)
      const isEmpty = this.level.getTileAt(gridX, gridY) === 1;
      const noCrate = !this.level.hasCrateAt(gridX, gridY);

      if (isEmpty && noCrate) {
        return { gridX, gridY };
      }
    }

    // Fallback position
    return { gridX: 15, gridY: 11 };
  }

  /**
   * Create spawn effect
   */
  private createSpawnEffect(x: number, y: number): void {
    // Flash effect
    const flash = this.scene.add
      .circle(x, y, 20, 0xff0000, 0.8)
      .setDepth(10);

    this.scene.tweens.add({
      targets: flash,
      scale: 2,
      alpha: 0,
      duration: 500,
      ease: "Power2",
      onComplete: () => {
        flash.destroy();
      },
    });

    // Particles
    const particles = this.scene.add.particles(x, y, "tiles", {
      frame: 0,
      tint: 0xff0000,
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      speed: { min: 50, max: 100 },
      angle: { min: 0, max: 360 },
      lifespan: 500,
      quantity: 10,
    });

    this.scene.time.delayedCall(500, () => {
      particles.destroy();
    });
  }

  /**
   * Remove random enemies
   */
  private removeRandomEnemies(count: number): void {
    count = Math.min(count, this.enemies.length);
    console.log("[DifficultyManager] Removing", count, "enemies");

    for (let i = 0; i < count; i++) {
      if (this.enemies.length === 0) break;

      const randomIndex = Math.floor(Math.random() * this.enemies.length);
      const enemy = this.enemies[randomIndex];

      // Create despawn effect
      const x = (enemy as any).sprite?.x || 0;
      const y = (enemy as any).sprite?.y || 0;
      this.createDespawnEffect(x, y);

      // Remove enemy
      enemy.destroy();
      this.enemies.splice(randomIndex, 1);
    }

    // Show removal notification
    const text = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        `-${count} ENEMIES!`,
        {
          fontFamily: "PressStart2P",
          fontSize: "16px",
          color: "#00ff00",
          stroke: "#000000",
          strokeThickness: 4,
        }
      )
      .setOrigin(0.5)
      .setDepth(1000);

    this.scene.tweens.add({
      targets: text,
      scale: 1.5,
      alpha: 0,
      duration: 1500,
      ease: "Power2",
      onComplete: () => {
        text.destroy();
      },
    });
  }

  /**
   * Create despawn effect
   */
  private createDespawnEffect(x: number, y: number): void {
    const flash = this.scene.add
      .circle(x, y, 20, 0x00ff00, 0.8)
      .setDepth(10);

    this.scene.tweens.add({
      targets: flash,
      scale: 2,
      alpha: 0,
      duration: 500,
      ease: "Power2",
      onComplete: () => {
        flash.destroy();
      },
    });
  }

  /**
   * Show difficulty change feedback
   */
  private showDifficultyChangeFeedback(difficulty: DifficultyLevel): void {
    const difficultyNames: Record<DifficultyLevel, string> = {
      [DifficultyLevel.EASY]: "EASY MODE",
      [DifficultyLevel.NORMAL]: "NORMAL MODE",
      [DifficultyLevel.HARD]: "HARD MODE",
      [DifficultyLevel.EXTREME]: "EXTREME MODE",
    };

    const difficultyColors: Record<DifficultyLevel, number> = {
      [DifficultyLevel.EASY]: 0x00ff00,
      [DifficultyLevel.NORMAL]: 0xffff00,
      [DifficultyLevel.HARD]: 0xff9900,
      [DifficultyLevel.EXTREME]: 0xff0000,
    };

    const text = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        difficultyNames[difficulty],
        {
          fontFamily: "PressStart2P",
          fontSize: "20px",
          color: `#${difficultyColors[difficulty].toString(16).padStart(6, "0")}`,
          stroke: "#000000",
          strokeThickness: 5,
        }
      )
      .setOrigin(0.5)
      .setDepth(1000);

    this.scene.tweens.add({
      targets: text,
      scale: 1.3,
      alpha: 0,
      duration: 2000,
      ease: "Power2",
      onComplete: () => {
        text.destroy();
      },
    });

    // Camera effect
    this.scene.cameras.main.shake(300, 0.005);
    this.scene.cameras.main.flash(
      300,
      ...this.hexToRgb(difficultyColors[difficulty])
    );
  }

  /**
   * Show difficulty event notification
   */
  private showDifficultyNotification(event: DifficultyEvent): void {
    const text = this.scene.add
      .text(
        this.scene.scale.width / 2,
        100,
        event.eventName.toUpperCase(),
        {
          fontFamily: "PressStart2P",
          fontSize: "10px",
          color: event.isFinal ? "#ff0000" : "#ffffff",
          stroke: "#000000",
          strokeThickness: 3,
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setDepth(1000);

    this.scene.tweens.add({
      targets: text,
      y: 80,
      alpha: 0,
      duration: 2500,
      ease: "Power2",
      onComplete: () => {
        text.destroy();
      },
    });
  }

  /**
   * Handle final event (game-ending event)
   */
  private handleFinalEvent(event: DifficultyEvent): void {
    console.log("[DifficultyManager] Final event triggered:", event);

    // Show dramatic warning
    const text = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        "FINAL EVENT!\nGAME ENDING!",
        {
          fontFamily: "PressStart2P",
          fontSize: "16px",
          color: "#ff0000",
          stroke: "#000000",
          strokeThickness: 5,
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setDepth(1000);

    this.scene.tweens.add({
      targets: text,
      scale: { from: 0.5, to: 1.5 },
      alpha: 0,
      duration: 3000,
      ease: "Power2",
      onComplete: () => {
        text.destroy();
        // Trigger game over
        this.scene.events.emit("final-event-triggered", event);
      },
    });

    // Dramatic camera shake
    this.scene.cameras.main.shake(2000, 0.02);
  }

  /**
   * Convert hex color to RGB array
   */
  private hexToRgb(hex: number): [number, number, number] {
    return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
  }

  /**
   * Get current difficulty
   */
  public getCurrentDifficulty(): DifficultyLevel {
    return this.currentDifficulty;
  }

  /**
   * Get enemy count
   */
  public getEnemyCount(): number {
    return this.enemies.length;
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    // Reset to normal
    this.setDifficulty(DifficultyLevel.NORMAL);
  }
}
