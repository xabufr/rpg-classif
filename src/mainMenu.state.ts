export class MainMenu extends Phaser.State {

    public preload() {
        console.log("Menu preload");
    }

    public create() {
        console.log("create");
        this.game.state.start("game");
    }
}
