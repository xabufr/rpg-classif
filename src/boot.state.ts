export class Boot extends Phaser.State {

    public preload() {

    }

    public create() {
        this.stage.disableVisibilityChange = true;
        this.game.state.start("start");
    }
}
