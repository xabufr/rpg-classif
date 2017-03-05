import { Player } from "./game/player";
import { Map } from "./game/map";
import { Pnj } from "./game/pnj";

export class GameState extends Phaser.State {
    private map: Map;
    private debugPhysics: boolean = true;
    private player: Player;
    private pnjs: Pnj[];

    public preload() {
        this.map = new Map(this.game);
        this.map.load();
        this.game.load.spritesheet("player", "/assets/images/player.png", 32, 32);
        this.game.load.json("dialogs", "/assets/dialogs.json");
    }

    public create() {
        this.game.stage.backgroundColor = "#787878";
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.map.setup();
        this.pnjs = this.map.loadCreatures();


        this.player = new Player(this.game, "player", this.map.findSpawnZone());
        this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER, 0.1, 0.1);
    }

    public update() {
        this.player.update();
        this.game.physics.arcade.collide(this.player, this.map.getLayer());
        this.pnjs.forEach(p => p.updateForPlayer(this.player));
    }

    public render()  {
    }
}
