import { Scene } from 'phaser';
import { Crate } from './Crate';

export class Level {
    private scene: Scene;
    private crates: Crate[] = [];
    private levelData: number[][];
    public map: Phaser.Tilemaps.Tilemap;
    public layer: Phaser.Tilemaps.TilemapLayer | null;

    constructor(scene: Scene) {
        this.scene = scene;
        this.levelData = [
            [ 85, 70, 70, 70, 70, 70, 70, 70, 70, 85 ],
            [ 85, 1,  2,  1,  2,  1,  2,  1,  1,  85 ],
            [ 85, 1,  70, 1,  70, 70, 1,  70, 1,  85 ],
            [ 85, 1,  1,  1,  1,  1,  1,  1,  1,  85 ],
            [ 85, 1,  70, 1,  70, 70, 1,  70, 1,  85 ],
            [ 85, 1,  2,  1,  2,  1,  2,  1,  1,  85 ],
            [ 85, 1,  70, 1,  70, 70, 1,  70, 1,  85 ],
            [ 85, 1,  1,  1,  1,  1,  1,  1,  1,  85 ],
            [ 85, 1,  1,  1,  1,  1,  1,  1,  1,  85 ],
            [ 70, 70, 70, 70, 70, 70, 70, 70, 70, 70 ],
        ];
    }

    create(): void {
        this.map = this.scene.make.tilemap({
            data: this.levelData, 
            tileWidth: 16, 
            tileHeight: 16
        });
        
        const tiles = this.map.addTilesetImage('tiles');

        if (!tiles) {
            console.error('Failed to load tileset!');
            return;
        }

        this.layer = this.map.createLayer(0, tiles, 0, 0);

        for (let y = 0; y < this.levelData.length; y++) {
            for (let x = 0; x < this.levelData[y].length; x++) {
                if (this.levelData[y][x] === 2) {
                    const crate = new Crate(this.scene, x, y);
                    this.crates.push(crate);
                }
            }
        }
    }

    getLevelData(): number[][] {
        return this.levelData;
    }

    getWidth(): number {
        return this.levelData[0].length;
    }

    getHeight(): number {
        return this.levelData.length;
    }

    getTileAt(x: number, y: number): number {
        if (y >= 0 && y < this.levelData.length && 
            x >= 0 && x < this.levelData[y].length) {
            return this.levelData[y][x];
        }
        return -1; // Invalid position
    }

    getCrateAt(gridX: number, gridY: number): Crate | undefined {
        return this.crates.find(crate => 
            crate.getGridX() === gridX && crate.getGridY() === gridY
        );
    }

    removeCrate(crate: Crate): void {
        const index = this.crates.indexOf(crate);
        if (index > -1) {
            this.crates.splice(index, 1);
            // Update the level data
            this.levelData[crate.getGridY()][crate.getGridX()] = 1; // 1 = empty space
        }
    }
    
    hasCrateAt(gridX: number, gridY: number): boolean {
        return this.crates.some(crate => 
            crate.getGridX() === gridX && crate.getGridY() === gridY
        );
    }

    getCrates(): Crate[] {
        return this.crates;
    }
}