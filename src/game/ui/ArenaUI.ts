import { Scene } from "phaser";
import { ActiveBoost } from "../managers/BoostManager";
import { ItemPickup } from "../managers/ItemDropManager";

export class ArenaUI {
  private scene: Scene;
  private container: Phaser.GameObjects.Container;

  // UI Elements
  private connectionStatus!: Phaser.GameObjects.Text;
  private statusIndicator!: Phaser.GameObjects.Circle;
  private gameIdText!: Phaser.GameObjects.Text;
  private boostsContainer!: Phaser.GameObjects.Container;
  private metricsContainer!: Phaser.GameObjects.Container;

  // Metrics
  private enemiesKilledText!: Phaser.GameObjects.Text;
  private cratesDestroyedText!: Phaser.GameObjects.Text;
  private survivalTimeText!: Phaser.GameObjects.Text;

  // State
  private isConnected: boolean = false;
  private gameId: string = "";
  private gameStartTime: number = 0;
  private enemiesKilled: number = 0;
  private cratesDestroyed: number = 0;

  constructor(scene: Scene) {
    this.scene = scene;
    this.container = this.scene.add.container(0, 0).setDepth(999);
    this.createUI();
  }

  /**
   * Create UI elements
   */
  private createUI(): void {
    // Connection status (top-left)
    this.statusIndicator = this.scene.add
      .circle(10, 10, 4, 0xff0000)
      .setOrigin(0, 0);
    this.container.add(this.statusIndicator);

    this.connectionStatus = this.scene.add
      .text(20, 8, "Arena: Disconnected", {
        fontFamily: "PressStart2P",
        fontSize: "6px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0, 0);
    this.container.add(this.connectionStatus);

    // Game ID (below connection status)
    this.gameIdText = this.scene.add
      .text(20, 20, "", {
        fontFamily: "PressStart2P",
        fontSize: "5px",
        color: "#888888",
        stroke: "#000000",
        strokeThickness: 1,
      })
      .setOrigin(0, 0);
    this.container.add(this.gameIdText);

    // Boosts container (top-right)
    this.boostsContainer = this.scene.add.container(
      this.scene.scale.width - 10,
      10
    );
    this.container.add(this.boostsContainer);

    // Metrics container (bottom-left)
    this.metricsContainer = this.scene.add.container(
      10,
      this.scene.scale.height - 60
    );
    this.container.add(this.metricsContainer);

    // Create metrics text
    const metricsTitle = this.scene.add
      .text(0, 0, "ARENA STATS", {
        fontFamily: "PressStart2P",
        fontSize: "6px",
        color: "#ffff00",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0, 0);
    this.metricsContainer.add(metricsTitle);

    this.enemiesKilledText = this.scene.add
      .text(0, 12, "Kills: 0", {
        fontFamily: "PressStart2P",
        fontSize: "5px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 1,
      })
      .setOrigin(0, 0);
    this.metricsContainer.add(this.enemiesKilledText);

    this.cratesDestroyedText = this.scene.add
      .text(0, 22, "Crates: 0", {
        fontFamily: "PressStart2P",
        fontSize: "5px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 1,
      })
      .setOrigin(0, 0);
    this.metricsContainer.add(this.cratesDestroyedText);

    this.survivalTimeText = this.scene.add
      .text(0, 32, "Time: 0:00", {
        fontFamily: "PressStart2P",
        fontSize: "5px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 1,
      })
      .setOrigin(0, 0);
    this.metricsContainer.add(this.survivalTimeText);

    // Hide metrics initially
    this.metricsContainer.setVisible(false);
  }

  /**
   * Update connection status
   */
  public updateConnectionStatus(connected: boolean): void {
    this.isConnected = connected;

    if (connected) {
      this.statusIndicator.setFillStyle(0x00ff00);
      this.connectionStatus.setText("Arena: Connected");
      this.connectionStatus.setColor("#00ff00");

      // Pulse animation
      this.scene.tweens.add({
        targets: this.statusIndicator,
        scale: 1.5,
        duration: 300,
        yoyo: true,
        repeat: 2,
      });
    } else {
      this.statusIndicator.setFillStyle(0xff0000);
      this.connectionStatus.setText("Arena: Disconnected");
      this.connectionStatus.setColor("#ff0000");
    }
  }

  /**
   * Set game ID
   */
  public setGameId(gameId: string): void {
    this.gameId = gameId;
    this.gameIdText.setText(`ID: ${gameId.substring(0, 12)}...`);
  }

  /**
   * Update active boosts display
   */
  public updateBoosts(boosts: ActiveBoost[]): void {
    // Clear existing boost displays
    this.boostsContainer.removeAll(true);

    // Create boost indicators
    let yOffset = 0;
    for (const boost of boosts) {
      const remaining = this.getBoostTimeRemaining(boost);
      const percentage = (remaining / boost.duration) * 100;

      // Background
      const bg = this.scene.add
        .rectangle(-100, yOffset, 90, 12, 0x000000, 0.7)
        .setOrigin(1, 0);
      this.boostsContainer.add(bg);

      // Progress bar
      const progress = this.scene.add
        .rectangle(-100, yOffset, (90 * percentage) / 100, 12, this.getBoostColor(boost.type), 0.8)
        .setOrigin(1, 0);
      this.boostsContainer.add(progress);

      // Text
      const text = this.scene.add
        .text(-95, yOffset + 2, this.getBoostName(boost.type), {
          fontFamily: "PressStart2P",
          fontSize: "5px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 1,
        })
        .setOrigin(0, 0);
      this.boostsContainer.add(text);

      // Timer
      const timer = this.scene.add
        .text(-12, yOffset + 2, `${Math.ceil(remaining / 1000)}s`, {
          fontFamily: "PressStart2P",
          fontSize: "5px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 1,
        })
        .setOrigin(1, 0);
      this.boostsContainer.add(timer);

      yOffset += 15;
    }
  }

  /**
   * Get boost time remaining
   */
  private getBoostTimeRemaining(boost: ActiveBoost): number {
    const elapsed = Date.now() - boost.startTime;
    return Math.max(0, boost.duration - elapsed);
  }

  /**
   * Get boost color
   */
  private getBoostColor(type: string): number {
    const colors: Record<string, number> = {
      speed: 0x00ff00,
      bombs: 0xff9900,
      explosion_range: 0xff0000,
      invincibility: 0xffff00,
      rapid_fire: 0x00ffff,
    };
    return colors[type] || 0xffffff;
  }

  /**
   * Get boost name
   */
  private getBoostName(type: string): string {
    const names: Record<string, string> = {
      speed: "SPEED",
      bombs: "BOMBS",
      explosion_range: "POWER",
      invincibility: "SHIELD",
      rapid_fire: "RAPID",
    };
    return names[type] || type.toUpperCase();
  }

  /**
   * Start game tracking
   */
  public startGameTracking(): void {
    this.gameStartTime = Date.now();
    this.enemiesKilled = 0;
    this.cratesDestroyed = 0;
    this.metricsContainer.setVisible(true);
  }

  /**
   * Update enemy kill count
   */
  public addEnemyKill(): void {
    this.enemiesKilled++;
    this.enemiesKilledText.setText(`Kills: ${this.enemiesKilled}`);

    // Flash effect
    this.scene.tweens.add({
      targets: this.enemiesKilledText,
      scale: 1.3,
      duration: 150,
      yoyo: true,
      ease: "Power2",
    });
  }

  /**
   * Update crate destroy count
   */
  public addCrateDestroy(): void {
    this.cratesDestroyed++;
    this.cratesDestroyedText.setText(`Crates: ${this.cratesDestroyed}`);

    // Flash effect
    this.scene.tweens.add({
      targets: this.cratesDestroyedText,
      scale: 1.3,
      duration: 150,
      yoyo: true,
      ease: "Power2",
    });
  }

  /**
   * Update survival time
   */
  public updateSurvivalTime(): void {
    if (this.gameStartTime === 0) return;

    const elapsed = Date.now() - this.gameStartTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;

    this.survivalTimeText.setText(
      `Time: ${minutes}:${remainderSeconds.toString().padStart(2, "0")}`
    );
  }

  /**
   * Get metrics
   */
  public getMetrics(): {
    enemiesKilled: number;
    cratesDestroyed: number;
    survivalTime: number;
  } {
    return {
      enemiesKilled: this.enemiesKilled,
      cratesDestroyed: this.cratesDestroyed,
      survivalTime: Date.now() - this.gameStartTime,
    };
  }

  /**
   * Show notification
   */
  public showNotification(
    message: string,
    color: string = "#ffffff",
    duration: number = 2000
  ): void {
    const text = this.scene.add
      .text(this.scene.scale.width / 2, 60, message, {
        fontFamily: "PressStart2P",
        fontSize: "8px",
        color: color,
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(1000);

    this.scene.tweens.add({
      targets: text,
      y: 40,
      alpha: 0,
      duration: duration,
      ease: "Power2",
      onComplete: () => {
        text.destroy();
      },
    });
  }

  /**
   * Update (call in scene update)
   */
  public update(): void {
    if (this.isConnected && this.gameStartTime > 0) {
      this.updateSurvivalTime();
    }
  }

  /**
   * Reset UI
   */
  public reset(): void {
    this.gameStartTime = 0;
    this.enemiesKilled = 0;
    this.cratesDestroyed = 0;
    this.metricsContainer.setVisible(false);
    this.boostsContainer.removeAll(true);
  }

  /**
   * Destroy UI
   */
  public destroy(): void {
    this.container.destroy();
  }
}
