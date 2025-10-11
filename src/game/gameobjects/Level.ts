import { Scene } from 'phaser';

export class Level {
    private scene: Scene;
    private levelData: number[][];
    public map: Phaser.Tilemaps.Tilemap;
    public layer: Phaser.Tilemaps.TilemapLayer | null;

    constructor(scene: Scene) {
        this.scene = scene;
        this.levelData = [
            [ 85, 70, 70, 70, 70, 70, 70, 70, 70, 85 ],
            [ 85, 1,  1,  1,  1,  1,  1,  1,  1,  85 ],
            [ 85, 1,  70, 1,  70, 70, 1,  70, 1,  85 ],
            [ 85, 1,  1,  1,  1,  1,  1,  1,  1,  85 ],
            [ 85, 1,  70, 1,  70, 70, 1,  70, 1,  85 ],
            [ 85, 1,  1,  1,  1,  1,  1,  1,  1,  85 ],
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
}