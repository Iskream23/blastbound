import Phaser from "phaser";

export class Player extends Phaser.GameObjects.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player');

        scene.add.existing(this);

        if (!scene.anims.exists('idle')) {
            scene.anims.create({
                key: 'idle',
                frames: scene.anims.generateFrameNumbers('player', {start: 60, end: 60}),
                frameRate: 10,
                repeat: 1
            })
        }

        this.play('idle');
    }
}