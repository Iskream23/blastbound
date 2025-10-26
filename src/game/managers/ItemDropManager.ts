import { Scene } from "phaser";
import { Player } from "../gameobjects/Player";
import { ItemDropEvent } from "../services/ArenaIntegrationService";

export enum ItemType {
  HEALTH = "health",
  BOMB_POWER = "bomb_power",
  SPEED = "speed",
  SHIELD = "shield",
  SCORE = "score",
  MYSTERY = "mystery",
}

export interface ItemPickup {
  id: string;
  sprite: Phaser.GameObjects.Sprite;
  gridX: number;
  gridY: number;
  type: ItemType;
  value: number;
  itemName: string;
  purchaserUsername: string;
}

export class ItemDropManager {
  private scene: Scene;
  private player: Player;
  private items: Map<string, ItemPickup> = new Map();
  private itemColors: Record<ItemType, number> = {
    [ItemType.HEALTH]: 0xff0000,
    [ItemType.BOMB_POWER]: 0xff9900,
    [ItemType.SPEED]: 0x00ff00,
    [ItemType.SHIELD]: 0x0099ff,
    [ItemType.SCORE]: 0xffff00,
    [ItemType.MYSTERY]: 0xff00ff,
  };

  constructor(scene: Scene, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  /**
   * Spawn item from Arena drop event
   */
  public spawnItem(drop: ItemDropEvent): void {
    console.log("[ItemDropManager] Spawning item:", drop);

    // Determine item type from effects
    const itemType = this.determineItemType(drop);

    // Find empty grid position near player
    const { gridX, gridY } = this.findSpawnPosition();

    // Create item sprite
    const pixelX = gridX * 16 + 8;
    const pixelY = gridY * 16 + 8;

    const sprite = this.scene.add
      .sprite(pixelX, pixelY, "tiles")
      .setFrame(this.getItemFrame(itemType))
      .setDepth(5);

    // Add glow effect
    sprite.setTint(this.itemColors[itemType]);

    // Add floating animation
    this.scene.tweens.add({
      targets: sprite,
      y: pixelY - 4,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Add pulsing scale animation
    this.scene.tweens.add({
      targets: sprite,
      scale: 1.2,
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Add sparkle particles
    this.createSparkleEffect(pixelX, pixelY, this.itemColors[itemType]);

    const item: ItemPickup = {
      id: drop.itemId,
      sprite,
      gridX,
      gridY,
      type: itemType,
      value: this.getItemValue(drop),
      itemName: drop.itemName,
      purchaserUsername: drop.purchaserUsername,
    };

    this.items.set(drop.itemId, item);

    // Show item drop notification
    this.showItemDropNotification(drop);

    // Auto-collect after 30 seconds if not picked up
    this.scene.time.delayedCall(30000, () => {
      this.removeItem(drop.itemId);
    });
  }

  /**
   * Determine item type from drop event
   */
  private determineItemType(drop: ItemDropEvent): ItemType {
    const itemName = drop.itemName.toLowerCase();

    if (itemName.includes("health") || itemName.includes("heal")) {
      return ItemType.HEALTH;
    } else if (itemName.includes("bomb") || itemName.includes("power")) {
      return ItemType.BOMB_POWER;
    } else if (itemName.includes("speed") || itemName.includes("fast")) {
      return ItemType.SPEED;
    } else if (itemName.includes("shield") || itemName.includes("protect")) {
      return ItemType.SHIELD;
    } else if (itemName.includes("coin") || itemName.includes("score")) {
      return ItemType.SCORE;
    } else {
      return ItemType.MYSTERY;
    }
  }

  /**
   * Get item value from drop event
   */
  private getItemValue(drop: ItemDropEvent): number {
    if (drop.effects.stats && drop.effects.stats.length > 0) {
      // Use first stat value
      return drop.effects.stats[0].currentValue;
    }
    // Default value based on cost
    return Math.max(1, Math.floor(drop.cost / 10));
  }

  /**
   * Get sprite frame for item type
   */
  private getItemFrame(type: ItemType): number {
    // Map item types to sprite frames
    const frames: Record<ItemType, number> = {
      [ItemType.HEALTH]: 10, // Red tile
      [ItemType.BOMB_POWER]: 11, // Orange tile
      [ItemType.SPEED]: 12, // Green tile
      [ItemType.SHIELD]: 13, // Blue tile
      [ItemType.SCORE]: 14, // Yellow tile
      [ItemType.MYSTERY]: 15, // Purple tile
    };
    return frames[type] || 15;
  }

  /**
   * Find empty spawn position near player
   */
  private findSpawnPosition(): { gridX: number; gridY: number } {
    const playerGridX = this.player.gridX;
    const playerGridY = this.player.gridY;

    // Try positions in a spiral around player
    const offsets = [
      { x: 0, y: -2 },
      { x: 2, y: 0 },
      { x: 0, y: 2 },
      { x: -2, y: 0 },
      { x: 1, y: -1 },
      { x: 1, y: 1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 },
    ];

    for (const offset of offsets) {
      const gridX = playerGridX + offset.x;
      const gridY = playerGridY + offset.y;

      if (this.isValidSpawnPosition(gridX, gridY)) {
        return { gridX, gridY };
      }
    }

    // Fallback to random position
    return this.findRandomSpawnPosition();
  }

  /**
   * Check if position is valid for spawning
   */
  private isValidSpawnPosition(gridX: number, gridY: number): boolean {
    // Check bounds
    if (gridX < 1 || gridX > 30 || gridY < 1 || gridY > 22) {
      return false;
    }

    // Check if position is empty (would need level reference)
    // For now, just check if item already exists there
    for (const item of this.items.values()) {
      if (item.gridX === gridX && item.gridY === gridY) {
        return false;
      }
    }

    return true;
  }

  /**
   * Find random valid spawn position
   */
  private findRandomSpawnPosition(): { gridX: number; gridY: number } {
    const maxAttempts = 100;
    for (let i = 0; i < maxAttempts; i++) {
      const gridX = Phaser.Math.Between(2, 29);
      const gridY = Phaser.Math.Between(2, 21);

      if (this.isValidSpawnPosition(gridX, gridY)) {
        return { gridX, gridY };
      }
    }

    // Ultimate fallback
    return { gridX: 15, gridY: 11 };
  }

  /**
   * Create sparkle particle effect
   */
  private createSparkleEffect(x: number, y: number, color: number): void {
    const particles = this.scene.add.particles(x, y, "tiles", {
      frame: 0,
      tint: color,
      scale: { start: 0.3, end: 0 },
      alpha: { start: 1, end: 0 },
      speed: { min: 20, max: 50 },
      angle: { min: 0, max: 360 },
      lifespan: 1000,
      frequency: 200,
      quantity: 2,
    });

    // Stop emitting after 3 seconds
    this.scene.time.delayedCall(3000, () => {
      particles.stop();
      this.scene.time.delayedCall(1000, () => {
        particles.destroy();
      });
    });
  }

  /**
   * Show item drop notification
   */
  private showItemDropNotification(drop: ItemDropEvent): void {
    const text = this.scene.add
      .text(
        this.scene.scale.width / 2,
        120,
        `${drop.itemName}\nfrom ${drop.purchaserUsername}!`,
        {
          fontFamily: "PressStart2P",
          fontSize: "10px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 3,
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setDepth(1000);

    this.scene.tweens.add({
      targets: text,
      y: 100,
      alpha: 0,
      duration: 2500,
      ease: "Power2",
      onComplete: () => {
        text.destroy();
      },
    });
  }

  /**
   * Check for item pickup (call in scene update)
   */
  public checkPickups(): void {
    const playerGridX = this.player.gridX;
    const playerGridY = this.player.gridY;

    for (const [id, item] of this.items.entries()) {
      if (item.gridX === playerGridX && item.gridY === playerGridY) {
        this.collectItem(id);
      }
    }
  }

  /**
   * Collect item
   */
  private collectItem(id: string): void {
    const item = this.items.get(id);
    if (!item) return;

    console.log("[ItemDropManager] Collecting item:", item.itemName);

    // Apply item effect
    this.applyItemEffect(item);

    // Show collection feedback
    this.showCollectionFeedback(item);

    // Remove item
    this.removeItem(id);

    // Emit event
    this.scene.events.emit("item-collected", {
      itemId: id,
      itemType: item.type,
      itemName: item.itemName,
      value: item.value,
    });
  }

  /**
   * Apply item effect to player
   */
  private applyItemEffect(item: ItemPickup): void {
    switch (item.type) {
      case ItemType.HEALTH:
        // Heal player (if health system exists)
        console.log("[ItemDropManager] Heal effect:", item.value);
        break;

      case ItemType.BOMB_POWER:
        // Increase bomb power temporarily
        console.log("[ItemDropManager] Bomb power effect:", item.value);
        break;

      case ItemType.SPEED:
        // Increase speed temporarily
        console.log("[ItemDropManager] Speed effect:", item.value);
        break;

      case ItemType.SHIELD:
        // Add shield/invincibility
        console.log("[ItemDropManager] Shield effect:", item.value);
        break;

      case ItemType.SCORE:
        // Add score points
        console.log("[ItemDropManager] Score effect:", item.value);
        break;

      case ItemType.MYSTERY:
        // Random effect
        const randomEffects = [
          ItemType.HEALTH,
          ItemType.BOMB_POWER,
          ItemType.SPEED,
          ItemType.SHIELD,
        ];
        const randomType =
          randomEffects[Math.floor(Math.random() * randomEffects.length)];
        console.log("[ItemDropManager] Mystery effect:", randomType);
        break;
    }
  }

  /**
   * Show collection feedback
   */
  private showCollectionFeedback(item: ItemPickup): void {
    // Flash effect
    this.scene.cameras.main.flash(200, 255, 255, 255);

    // Collect animation
    this.scene.tweens.add({
      targets: item.sprite,
      scale: 2,
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        item.sprite.destroy();
      },
    });

    // Show text
    const text = this.scene.add
      .text(
        item.sprite.x,
        item.sprite.y,
        `+${item.itemName}`,
        {
          fontFamily: "PressStart2P",
          fontSize: "8px",
          color: `#${this.itemColors[item.type].toString(16).padStart(6, "0")}`,
          stroke: "#000000",
          strokeThickness: 2,
        }
      )
      .setOrigin(0.5)
      .setDepth(1000);

    this.scene.tweens.add({
      targets: text,
      y: item.sprite.y - 30,
      alpha: 0,
      duration: 1000,
      ease: "Power2",
      onComplete: () => {
        text.destroy();
      },
    });

    // Play sound effect (if exists)
    if (this.scene.sound.get("collect")) {
      this.scene.sound.play("collect");
    }
  }

  /**
   * Remove item
   */
  private removeItem(id: string): void {
    const item = this.items.get(id);
    if (!item) return;

    // Destroy sprite
    if (item.sprite && !item.sprite.scene) {
      // Sprite already destroyed
    } else if (item.sprite) {
      this.scene.tweens.killTweensOf(item.sprite);
      item.sprite.destroy();
    }

    this.items.delete(id);
  }

  /**
   * Get active items
   */
  public getActiveItems(): ItemPickup[] {
    return Array.from(this.items.values());
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    for (const id of this.items.keys()) {
      this.removeItem(id);
    }
    this.items.clear();
  }
}
