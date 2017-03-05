import { Player } from "./game/player";
import { Map } from "./game/map";

export class GameState extends Phaser.State {
    private map: Map;
    private debugPhysics: boolean = true;
    private player: Player;

    public preload() {
        this.map = new Map(this.game);
        this.map.load();
        this.game.load.spritesheet("player", "/assets/images/player.png", 32, 32);
    }

    public create() {
        this.game.stage.backgroundColor = "#787878";
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.map.setup();


        this.player = new Player(this.game, "player", this.map.findSpawnZone());
        this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER, 0.1, 0.1);
    }

    public update() {
        this.player.update();
        this.game.physics.arcade.collide(this.player, this.map.getLayer());
    }

    public render()  {
    }
}
