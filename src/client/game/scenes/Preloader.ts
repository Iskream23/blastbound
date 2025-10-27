import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    this.add
      .image(0, 0, "background")
      .setOrigin(0, 0)
      .setDisplaySize(this.scale.width, this.scale.height);

    //  A simple progress bar. This is the outline of the bar.
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    this.add.rectangle(centerX, centerY, 234, 16).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(centerX - 115, centerY, 4, 14, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      //  Update the progress bar (our bar is 230px wide, so 100% = 230px)
      bar.width = 4 + 226 * progress;
    });
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("MainMenu");
  }
}
