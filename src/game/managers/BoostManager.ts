import { Scene } from "phaser";
import { Player } from "../gameobjects/Player";
import { BoostEvent } from "../services/ArenaIntegrationService";

export enum BoostType {
  SPEED = "speed",
  BOMBS = "bombs",
  EXPLOSION_RANGE = "explosion_range",
  INVINCIBILITY = "invincibility",
  RAPID_FIRE = "rapid_fire",
}

export interface ActiveBoost {
  type: BoostType;
  amount: number;
  duration: number;
  startTime: number;
  boosterUsername: string;
}

export class BoostManager {
  private scene: Scene;
  private player: Player;
  private activeBoosts: Map<BoostType, ActiveBoost> = new Map();

  // Base values for player stats
  private baseSpeed: number = 150;
  private baseMaxBombs: number = 1;
  private baseExplosionRange: number = 2;
  private baseBombCooldown: number = 500;

  // Boost multipliers
  private speedMultiplier: number = 1.0;
  private bombsBonus: number = 0;
  private explosionRangeBonus: number = 0;
  private isInvincible: boolean = false;
  private rapidFireActive: boolean = false;

  constructor(scene: Scene, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  /**
   * Apply boost from Arena event
   */
  public applyBoost(boost: BoostEvent): void {
    console.log("[BoostManager] Applying boost:", boost);

    // Determine boost type based on amount
    const boostType = this.determineBoostType(boost.boostAmount);
    const duration = this.getBoostDuration(boost.boostAmount);

    this.activateBoost(boostType, boost.boostAmount, duration, boost.boosterUsername);

    // Show visual feedback
    this.showBoostFeedback(boostType, boost.boosterUsername);
  }

  /**
   * Determine boost type based on amount
   */
  private determineBoostType(amount: number): BoostType {
    // Map boost amounts to types
    if (amount >= 5000) {
      return BoostType.INVINCIBILITY;
    } else if (amount >= 500) {
      return BoostType.EXPLOSION_RANGE;
    } else if (amount >= 100) {
      return BoostType.BOMBS;
    } else if (amount >= 50) {
      return BoostType.RAPID_FIRE;
    } else {
      return BoostType.SPEED;
    }
  }

  /**
   * Get boost duration based on amount
   */
  private getBoostDuration(amount: number): number {
    // Duration in milliseconds
    if (amount >= 5000) return 10000; // 10 seconds
    if (amount >= 500) return 15000; // 15 seconds
    if (amount >= 100) return 20000; // 20 seconds
    if (amount >= 50) return 15000; // 15 seconds
    return 10000; // 10 seconds
  }

  /**
   * Activate a specific boost
   */
  private activateBoost(
    type: BoostType,
    amount: number,
    duration: number,
    username: string
  ): void {
    // Remove existing boost of same type
    if (this.activeBoosts.has(type)) {
      this.deactivateBoost(type);
    }

    const boost: ActiveBoost = {
      type,
      amount,
      duration,
      startTime: Date.now(),
      boosterUsername: username,
    };

    this.activeBoosts.set(type, boost);

    // Apply boost effects
    switch (type) {
      case BoostType.SPEED:
        this.applySpeedBoost(amount);
        break;
      case BoostType.BOMBS:
        this.applyBombsBoost(amount);
        break;
      case BoostType.EXPLOSION_RANGE:
        this.applyExplosionRangeBoost(amount);
        break;
      case BoostType.INVINCIBILITY:
        this.applyInvincibilityBoost();
        break;
      case BoostType.RAPID_FIRE:
        this.applyRapidFireBoost();
        break;
    }

    // Schedule boost expiration
    this.scene.time.delayedCall(duration, () => {
      this.deactivateBoost(type);
    });
  }

  /**
   * Apply speed boost
   */
  private applySpeedBoost(amount: number): void {
    // Increase speed by 50% per 25 points
    const multiplier = 1 + (amount / 25) * 0.5;
    this.speedMultiplier = multiplier;

    console.log("[BoostManager] Speed boost applied:", multiplier);
  }

  /**
   * Apply bombs boost
   */
  private applyBombsBoost(amount: number): void {
    // Add 1 bomb per 100 points
    const bonus = Math.floor(amount / 100);
    this.bombsBonus = bonus;

    console.log("[BoostManager] Bombs boost applied:", bonus);
  }

  /**
   * Apply explosion range boost
   */
  private applyExplosionRangeBoost(amount: number): void {
    // Add 1 range per 500 points
    const bonus = Math.floor(amount / 500);
    this.explosionRangeBonus = bonus;

    console.log("[BoostManager] Explosion range boost applied:", bonus);
  }

  /**
   * Apply invincibility boost
   */
  private applyInvincibilityBoost(): void {
    this.isInvincible = true;

    // Visual effect - player glows
    this.player.setTint(0xffff00);

    // Pulse effect
    this.scene.tweens.add({
      targets: this.player,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      repeat: -1,
    });

    console.log("[BoostManager] Invincibility boost applied");
  }

  /**
   * Apply rapid fire boost
   */
  private applyRapidFireBoost(): void {
    this.rapidFireActive = true;
    console.log("[BoostManager] Rapid fire boost applied");
  }

  /**
   * Deactivate boost
   */
  private deactivateBoost(type: BoostType): void {
    const boost = this.activeBoosts.get(type);
    if (!boost) return;

    console.log("[BoostManager] Deactivating boost:", type);

    switch (type) {
      case BoostType.SPEED:
        this.speedMultiplier = 1.0;
        break;
      case BoostType.BOMBS:
        this.bombsBonus = 0;
        break;
      case BoostType.EXPLOSION_RANGE:
        this.explosionRangeBonus = 0;
        break;
      case BoostType.INVINCIBILITY:
        this.isInvincible = false;
        this.player.clearTint();
        this.player.setAlpha(1);
        this.scene.tweens.killTweensOf(this.player);
        break;
      case BoostType.RAPID_FIRE:
        this.rapidFireActive = false;
        break;
    }

    this.activeBoosts.delete(type);
    this.showBoostExpiredFeedback(type);
  }

  /**
   * Show boost activation feedback
   */
  private showBoostFeedback(type: BoostType, username: string): void {
    const boostNames: Record<BoostType, string> = {
      [BoostType.SPEED]: "SPEED BOOST",
      [BoostType.BOMBS]: "MORE BOMBS",
      [BoostType.EXPLOSION_RANGE]: "BIGGER EXPLOSIONS",
      [BoostType.INVINCIBILITY]: "INVINCIBILITY",
      [BoostType.RAPID_FIRE]: "RAPID FIRE",
    };

    const boostColors: Record<BoostType, number> = {
      [BoostType.SPEED]: 0x00ff00,
      [BoostType.BOMBS]: 0xff9900,
      [BoostType.EXPLOSION_RANGE]: 0xff0000,
      [BoostType.INVINCIBILITY]: 0xffff00,
      [BoostType.RAPID_FIRE]: 0x00ffff,
    };

    const text = this.scene.add
      .text(
        this.scene.scale.width / 2,
        100,
        `${boostNames[type]}\nfrom ${username}!`,
        {
          fontFamily: "PressStart2P",
          fontSize: "12px",
          color: `#${boostColors[type].toString(16).padStart(6, "0")}`,
          stroke: "#000000",
          strokeThickness: 3,
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setDepth(1000);

    // Animate text
    this.scene.tweens.add({
      targets: text,
      y: 80,
      alpha: 0,
      duration: 2000,
      ease: "Power2",
      onComplete: () => {
        text.destroy();
      },
    });

    // Camera flash
    this.scene.cameras.main.flash(300, ...this.hexToRgb(boostColors[type]));
  }

  /**
   * Show boost expired feedback
   */
  private showBoostExpiredFeedback(type: BoostType): void {
    const text = this.scene.add
      .text(this.scene.scale.width / 2, 100, `Boost Expired`, {
        fontFamily: "PressStart2P",
        fontSize: "8px",
        color: "#888888",
        stroke: "#000000",
        strokeThickness: 2,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(1000);

    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        text.destroy();
      },
    });
  }

  /**
   * Convert hex color to RGB array
   */
  private hexToRgb(hex: number): [number, number, number] {
    return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
  }

  /**
   * Get current speed multiplier
   */
  public getSpeedMultiplier(): number {
    return this.speedMultiplier;
  }

  /**
   * Get current max bombs
   */
  public getMaxBombs(): number {
    return this.baseMaxBombs + this.bombsBonus;
  }

  /**
   * Get current explosion range
   */
  public getExplosionRange(): number {
    return this.baseExplosionRange + this.explosionRangeBonus;
  }

  /**
   * Check if player is invincible
   */
  public isPlayerInvincible(): boolean {
    return this.isInvincible;
  }

  /**
   * Get bomb cooldown
   */
  public getBombCooldown(): number {
    return this.rapidFireActive
      ? this.baseBombCooldown / 2
      : this.baseBombCooldown;
  }

  /**
   * Get active boosts
   */
  public getActiveBoosts(): ActiveBoost[] {
    return Array.from(this.activeBoosts.values());
  }

  /**
   * Update boost timers (call in scene update)
   */
  public update(): void {
    // Check for expired boosts
    const now = Date.now();
    for (const [type, boost] of this.activeBoosts.entries()) {
      if (now - boost.startTime >= boost.duration) {
        this.deactivateBoost(type);
      }
    }
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    // Clear all boosts
    for (const type of this.activeBoosts.keys()) {
      this.deactivateBoost(type);
    }
    this.activeBoosts.clear();
  }
}
