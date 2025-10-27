import { Scene } from "phaser";
import { Player } from "../gameobjects/Player";
import { Level } from "../gameobjects/Level";
import { Enemy } from "../gameobjects/Enemy";
import { LevelManager } from "../gameobjects/LevelManager";
import { ArenaIntegrationService, ArenaConfig } from "../services/ArenaIntegrationService";
import { BoostManager } from "../managers/BoostManager";
import { ItemDropManager } from "../managers/ItemDropManager";
import { DifficultyManager } from "../managers/DifficultyManager";
import { ArenaUI } from "../ui/ArenaUI";

export class Game extends Scene {
  camera!: Phaser.Cameras.Scene2D.Camera;
  background!: Phaser.GameObjects.Image;
  player!: Player;
  level!: Level;
  enemies!: Enemy[];
  isGameOver: boolean = false;
  currentLevelId: number = 1;

  // Arena integration
  private arenaService?: ArenaIntegrationService;
  private boostManager?: BoostManager;
  private itemDropManager?: ItemDropManager;
  private difficultyManager?: DifficultyManager;
  private arenaUI?: ArenaUI;
  private arenaEnabled: boolean = false;

  // Time limit (2 minutes = 120,000 milliseconds)
  private readonly TIME_LIMIT = 120000;
  private gameStartTime: number = 0;
  private timeLimitTimer?: Phaser.Time.TimerEvent;
  private timerText?: Phaser.GameObjects.Text;

  constructor() {
    super("Game");
  }

  init(data: { levelId?: number; arenaConfig?: ArenaConfig; preserveTimer?: boolean; gameStartTime?: number }) {
    // Accept level ID from scene transition
    this.currentLevelId = data.levelId || 1;

    // Check if Arena config is provided
    if (data.arenaConfig) {
      this.arenaEnabled = true;
      console.log("[Game] Arena mode enabled with config:", data.arenaConfig);
    } else {
      this.arenaEnabled = false;
      console.log("[Game] Running in standalone mode (no Arena)");
    }

    // Preserve timer state if transitioning between levels
    if (data.preserveTimer && data.gameStartTime) {
      this.gameStartTime = data.gameStartTime;
      console.log("[Game] Timer state preserved from previous level");
    }
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
  }

  async create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x000000);

    this.background = this.add.image(512, 384, "background");
    this.background.setAlpha(0.5);

    // Load the level
    this.loadLevel(this.currentLevelId);

    // Set up event listeners
    this.setupEventListeners();

    // Initialize Arena if enabled
    if (this.arenaEnabled) {
      await this.initializeArena();
    }

    // Start the 5-minute time limit
    this.startTimeLimit();

    /*
        this.events.on('crate-destroyed', (gridX: number, gridY: number) => {
            // Random chance to spawn a power-up
            if (Math.random() < 0.3) { // 30% chance
                // Create power-up at crate position
                // this.createPowerUp(gridX, gridY);
            }
        });*/
  }

  private startTimeLimit(): void {
    // Record game start time (only if not already set from preserved state)
    if (this.gameStartTime === 0) {
      this.gameStartTime = Date.now();
      console.log("[Game] 2-minute time limit started");
    } else {
      console.log("[Game] Continuing existing timer from", new Date(this.gameStartTime));
    }

    // Calculate remaining time
    const elapsed = Date.now() - this.gameStartTime;
    const remaining = Math.max(0, this.TIME_LIMIT - elapsed);

    // Set up timer to trigger game over after remaining time
    if (remaining > 0) {
      this.timeLimitTimer = this.time.delayedCall(remaining, () => {
        this.onTimeLimitExpired();
      });
    } else {
      // Time already expired
      this.onTimeLimitExpired();
      return;
    }

    // Always create timer display at the top of the screen
    this.timerText = this.add
      .text(this.scale.width / 2, 10, "Time: 2:00", {
        fontFamily: "PressStart2P",
        fontSize: "8px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
        align: "center",
      })
      .setOrigin(0.5, 0)
      .setDepth(1000)
      .setScrollFactor(0); // Fixed position regardless of camera
  }

  private onTimeLimitExpired(): void {
    if (!this.isGameOver) {
      console.log("[Game] Time limit expired - Game Over!");
      this.isGameOver = true;

      // Flash the screen red
      this.camera.flash(500, 255, 0, 0);

      // Show time's up message
      const text = this.add
        .text(this.scale.width / 2, this.scale.height / 2, "TIME'S UP!", {
          fontFamily: "PressStart2P",
          fontSize: "16px",
          color: "#FF0000",
          stroke: "#000000",
          strokeThickness: 4,
          align: "center",
        })
        .setOrigin(0.5);

      // Transition to game over screen
      this.time.delayedCall(2000, () => {
        this.cleanupArena();
        this.scene.start("GameOver", { isVictory: false, reason: "Time limit expired" });
      });
    }
  }

  private updateTimerDisplay(): void {
    if (!this.timerText || this.gameStartTime === 0) return;

    const elapsed = Date.now() - this.gameStartTime;
    const remaining = Math.max(0, this.TIME_LIMIT - elapsed);
    const seconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;

    // Change color based on remaining time
    let color = "#ffffff";
    if (remaining < 60000) {
      // Less than 1 minute - red and pulse
      color = "#ff0000";
      if (Math.floor(Date.now() / 500) % 2 === 0) {
        this.timerText.setScale(1.1);
      } else {
        this.timerText.setScale(1.0);
      }
    } else if (remaining < 120000) {
      // Less than 2 minutes - yellow
      color = "#ffff00";
      this.timerText.setScale(1.0);
    } else {
      this.timerText.setScale(1.0);
    }

    this.timerText.setColor(color);
    this.timerText.setText(
      `Time: ${minutes}:${remainderSeconds.toString().padStart(2, "0")}`
    );
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
        // Preserve timer state when transitioning to next level
        this.scene.restart({
          levelId: nextLevelId,
          preserveTimer: true,
          gameStartTime: this.gameStartTime
        });
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

      // Track enemy kill for Arena
      if (this.arenaUI) {
        this.arenaUI.addEnemyKill();
      }
    });

    this.events.on("player-hit", () => {
      // Check invincibility from boosts
      if (this.boostManager?.isPlayerInvincible()) {
        console.log("[Game] Player is invincible, ignoring hit!");
        return;
      }

      if (!this.isGameOver) {
        this.isGameOver = true;
        this.player.setTint(0xff0000);
        this.camera.flash(500, 255, 0, 0);
        this.time.delayedCall(1500, () => {
          this.cleanupArena();
          this.scene.start("GameOver", { isVictory: false });
        });
      }
    });

    this.events.on("crate-destroyed", (gridX: number, gridY: number) => {
      // Track crate destruction for Arena
      if (this.arenaUI) {
        this.arenaUI.addCrateDestroy();
      }
    });

    // Arena-specific events
    this.events.on("final-event-triggered", (event: any) => {
      console.log("[Game] Final event triggered, ending game:", event);
      this.isGameOver = true;
      this.time.delayedCall(2000, () => {
        this.cleanupArena();
        this.scene.start("GameOver", { isVictory: true });
      });
    });

    this.events.on("item-collected", (data: any) => {
      console.log("[Game] Item collected:", data);
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

    // Update timer display
    this.updateTimerDisplay();

    // Update Arena systems
    if (this.arenaEnabled) {
      this.boostManager?.update();
      this.itemDropManager?.checkPickups();
      this.arenaUI?.update();

      // Update active boosts display
      if (this.boostManager && this.arenaUI) {
        const activeBoosts = this.boostManager.getActiveBoosts();
        this.arenaUI.updateBoosts(activeBoosts);
      }
    }
  }

  shutdown() {
    // Clean up event listeners
    this.events.off("bomb-exploded");
    this.events.off("player-hit");
    this.events.off("enemy-hit");
    this.events.off("crate-destroyed");
    this.events.off("final-event-triggered");
    this.events.off("item-collected");

    // Clean up time limit timer
    if (this.timeLimitTimer) {
      this.timeLimitTimer.remove();
      this.timeLimitTimer = undefined;
    }

    // Clean up enemies
    this.enemies.forEach((enemy) => enemy.destroy());
    this.enemies = [];

    // Clean up Arena
    this.cleanupArena();
  }

  // ========================================
  // ARENA INTEGRATION METHODS
  // ========================================

  /**
   * Initialize Arena connection and managers
   */
  private async initializeArena(): Promise<void> {
    try {
      console.log("[Game] Initializing Arena integration...");

      // Get Arena config from init data
      const arenaConfig = (this.sys.settings.data as any).arenaConfig as ArenaConfig;
      if (!arenaConfig) {
        console.error("[Game] No Arena config found!");
        return;
      }

      // Create Arena UI
      this.arenaUI = new ArenaUI(this);
      this.arenaUI.setGameId(arenaConfig.gameId);

      // Create managers
      this.boostManager = new BoostManager(this, this.player);
      this.itemDropManager = new ItemDropManager(this, this.player);
      this.difficultyManager = new DifficultyManager(this, this.level, this.enemies);

      // Create and initialize Arena service
      this.arenaService = new ArenaIntegrationService(this);

      // Setup Arena event handlers
      this.setupArenaEventHandlers();

      // Initialize connection
      await this.arenaService.initialize(arenaConfig);

      console.log("[Game] Arena integration initialized successfully!");
    } catch (error) {
      console.error("[Game] Failed to initialize Arena:", error);
      this.arenaEnabled = false;
    }
  }

  /**
   * Setup Arena WebSocket event handlers
   */
  private setupArenaEventHandlers(): void {
    if (!this.arenaService) return;

    // Connection status
    this.arenaService.onConnectionChange = (connected: boolean) => {
      console.log("[Game] Arena connection changed:", connected);
      this.arenaUI?.updateConnectionStatus(connected);

      if (connected) {
        this.arenaUI?.showNotification("Connected to Arena!", "#00ff00");
      } else {
        this.arenaUI?.showNotification("Disconnected from Arena", "#ff0000");
      }
    };

    // Arena begins
    this.arenaService.onArenaBegins = () => {
      console.log("[Game] Arena begins!");
      this.arenaUI?.showNotification("ARENA BEGINS!", "#ffff00", 3000);
      this.arenaUI?.startGameTracking();
    };

    // Arena ends
    this.arenaService.onArenaEnds = () => {
      console.log("[Game] Arena ends!");
      this.arenaUI?.showNotification("Arena Ended", "#ff9900");
    };

    // Player boost activated
    this.arenaService.onBoostActivated = (boost) => {
      console.log("[Game] Boost activated:", boost);
      this.boostManager?.applyBoost(boost);
    };

    // Item dropped
    this.arenaService.onItemDropped = (item) => {
      console.log("[Game] Item dropped:", item);
      this.itemDropManager?.spawnItem(item);
    };

    // Difficulty event
    this.arenaService.onDifficultyEvent = (event) => {
      console.log("[Game] Difficulty event:", event);
      this.difficultyManager?.applyDifficultyEvent(event);
    };

    // Game completed
    this.arenaService.onGameCompleted = (data) => {
      console.log("[Game] Arena game completed:", data);
      this.arenaUI?.showNotification("GAME COMPLETED!", "#00ff00", 3000);

      // Report final metrics
      this.reportFinalMetrics();
    };
  }

  /**
   * Report final game metrics to Arena
   */
  private reportFinalMetrics(): void {
    if (!this.arenaUI || !this.arenaService) return;

    const metrics = this.arenaUI.getMetrics();
    console.log("[Game] Final metrics:", metrics);

    // Could send metrics to Arena API here
    // this.arenaService.sendMetrics(metrics);
  }

  /**
   * Cleanup Arena resources
   */
  private cleanupArena(): void {
    if (!this.arenaEnabled) return;

    console.log("[Game] Cleaning up Arena resources...");

    this.boostManager?.destroy();
    this.itemDropManager?.destroy();
    this.difficultyManager?.destroy();
    this.arenaUI?.destroy();
    this.arenaService?.destroy();

    this.boostManager = undefined;
    this.itemDropManager = undefined;
    this.difficultyManager = undefined;
    this.arenaUI = undefined;
    this.arenaService = undefined;
  }
}
