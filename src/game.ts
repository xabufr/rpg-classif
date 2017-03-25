import { Pnj } from "./game/pnj";
import { Player } from "./game/player";
import { World } from "./world";
import { Map } from "./game/map";
import { GameHud } from "./game/ui";
import { AnimatedSprite } from "./engine/animatedSprite";
import { DEBUGGING } from "./debug";

let stats = new Stats();

export class Game {
    private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    private world: World;
    private map: Map;
    private player: Player;
    private pnjs: Pnj[];
    private hud: GameHud;

    constructor() {
        if (DEBUGGING) {
            console.log("Loading game in debugging mode !");
            console.log("Zone with mentor desactivated !");
        }
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        this.renderer = PIXI.autoDetectRenderer(800, 600, {
            antialias: false
        });

        document.body.appendChild(this.renderer.view);
        stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( stats.dom );
        this.world = new World(this.renderer);
        this.hud = new GameHud(this.world);

        this.renderer.backgroundColor = 0x061639;
        this.renderer.view.style.border = "1px dashed red";

        let stage = this.world.stage;
        this.load().then(() => this.start());
    }

    private load() {
        PIXI.loader.baseUrl = "./assets/";

        this.hud.preload();

        PIXI.loader.add("images/player_f.png");
        PIXI.loader.add("mentor", "images/mentor_ghost.png");
        PIXI.loader.add("dialogs", "dialogs.json");
        PIXI.loader.add("creature1", "images/mentor_ghost.png");
        return new Promise(r => {
            PIXI.loader.load(r);
        }).then(() => this.loadMap("./map.json"))
            .then(() => this.loadPlayer())
            .then(() => this.loadCreatures())
            .then(() => this.loadHud());
    }

    private loadMap(mapName: string) {
        let map = new Map(this.world, mapName);
        this.map = map;
        return map.load();
    }

    private loadPlayer() {
        this.player = new Player(this.world,
                                 PIXI.loader.resources["images/player_f.png"].texture,
                                 this.map.findSpawnZone());
    }

    private loadCreatures() {
        this.pnjs = this.map.loadCreatures(this.player);
    }

    private loadHud() {
        this.hud.setup();
    }

    private start() {
        console.log(this);
        requestAnimationFrame(() => this.gameLoop());
    }

    public gameLoop() {
        requestAnimationFrame(() => this.gameLoop());

        stats.begin();
        this.player.update();
        this.world.update();
        this.pnjs.forEach(p => p.update());
        this.world.render();
        stats.end();
    }
}
