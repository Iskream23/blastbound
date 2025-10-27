export interface WinCondition {
  description: string;
  check: (scene: any) => boolean;
}

export interface LevelConfig {
  id: number;
  name: string;
  data: number[][];
  playerStartX: number;
  playerStartY: number;
  enemies: EnemyConfig[];
  winCondition: WinCondition;
}

export interface EnemyConfig {
  x: number;
  y: number;
  type: "horizontal" | "vertical";
}

export class LevelManager {
  private static levels: LevelConfig[] = [
    {
      id: 1,
      name: "Level 1",
      data: [
        [4, 4, 4, 4, 85, 70, 70, 70, 70, 70, 70, 70, 70, 85],
        [4, 4, 4, 4, 85, 1, 1, 2, 1, 1, 2, 1, 1, 85],
        [4, 4, 4, 4, 85, 1, 70, 1, 70, 70, 1, 70, 1, 85],
        [4, 4, 4, 4, 85, 2, 1, 1, 1, 1, 1, 1, 2, 85],
        [4, 4, 4, 4, 85, 1, 70, 2, 70, 70, 2, 70, 1, 85],
        [4, 4, 4, 4, 85, 1, 2, 1, 1, 1, 1, 2, 1, 85],
        [4, 4, 4, 4, 85, 2, 70, 2, 70, 70, 2, 70, 2, 85],
        [4, 4, 4, 4, 85, 1, 2, 1, 1, 1, 1, 2, 1, 85],
        [4, 4, 4, 4, 85, 1, 2, 1, 1, 1, 1, 2, 1, 85],
        [4, 4, 4, 4, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70],
      ],
      playerStartX: 5,
      playerStartY: 1,
      enemies: [
        { x: 7, y: 3, type: "horizontal" },
        { x: 10, y: 5, type: "horizontal" },
        { x: 7, y: 7, type: "vertical" },
        { x: 12, y: 5, type: "vertical" },
      ],
      winCondition: {
        description: "Defeat all enemies",
        check: (scene: any) => {
          return scene.enemies && scene.enemies.length === 0;
        },
      },
    },
    {
      id: 2,
      name: "Level 2",
      data: [
        [70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70],
        [85, 1, 1, 1, 1, 70, 1, 1, 70, 1, 1, 1, 1, 85],
        [85, 1, 70, 2, 1, 1, 1, 1, 1, 1, 2, 70, 1, 85],
        [85, 1, 2, 1, 70, 1, 70, 70, 1, 70, 1, 2, 1, 85],
        [85, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 85],
        [85, 70, 1, 70, 1, 70, 2, 2, 70, 1, 70, 1, 70, 85],
        [85, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 85],
        [85, 1, 2, 1, 70, 1, 70, 70, 1, 70, 1, 2, 1, 85],
        [85, 1, 70, 2, 1, 1, 1, 1, 1, 1, 2, 70, 1, 85],
        [70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70],
      ],
      playerStartX: 1,
      playerStartY: 1,
      enemies: [
        { x: 5, y: 2, type: "horizontal" },
        { x: 8, y: 4, type: "vertical" },
        { x: 3, y: 6, type: "horizontal" },
        { x: 11, y: 6, type: "vertical" },
        { x: 6, y: 7, type: "horizontal" },
      ],
      winCondition: {
        description: "Destroy all breakable blocks",
        check: (scene: any) => {
          if (!scene.level || !scene.level.layer) return false;
          const layer = scene.level.layer;
          for (let y = 0; y < layer.height; y++) {
            for (let x = 0; x < layer.width; x++) {
              const tile = layer.getTileAt(x, y);
              if (tile && tile.index === 2) {
                return false;
              }
            }
          }
          return true;
        },
      },
    },
  ];

  static getLevel(id: number): LevelConfig | undefined {
    return this.levels.find((level) => level.id === id);
  }

  static getLevelCount(): number {
    return this.levels.length;
  }

  static getAllLevels(): LevelConfig[] {
    return this.levels;
  }
}
