import { Pnj } from "./game/pnj";
import { Player } from "./game/player";
import { World } from "./world";
import { Map, MapZone } from "./game/map";
import { GameHud } from "./game/ui";
import { AnimatedSprite } from "./engine/animatedSprite";
import { DEBUGGING, LANG } from "./options";
import { PhysicsWorld } from "./engine/physics";
import Stats = require("stats.js");

let stats: Stats | null = null;

if (DEBUGGING) {
    stats = new Stats();
}

export class Game {
    private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    private world: World;
    private map: Map;
    private player: Player;
    private pnjs: Pnj[];
    private hud: GameHud;
    private lastUpdate: number;
    private zones: MapZone[];
    private gameLoopFn: FrameRequestCallback;
    private physics: PhysicsWorld;

    constructor() {
        this.physics = new PhysicsWorld();
        if (DEBUGGING) {
            console.log("Loading game in debugging mode !");
            console.log("Zone with mentor desactivated !");
        }
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        this.renderer = PIXI.autoDetectRenderer(800, 600, {
            antialias: false
        });

        document.body.appendChild(this.renderer.view);
        if (stats) {
            stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild( stats.dom );
        }
        this.gameLoopFn = this.gameLoop.bind(this);

        this.world = new World(this.renderer, this.physics);
        this.hud = new GameHud(this.world);

        this.renderer.options.backgroundColor = 0x061639;
        this.renderer.view.style.border = "1px dashed red";

        let stage = this.world.stage;
        this.load().then(() => this.start());
    }

    private load() {
        PIXI.loader.baseUrl = "./assets/";

        this.hud.preload();

        // LOADING : sprites player & mentor + dialogs
        PIXI.loader.add("images/player_f.png");
        PIXI.loader.add("mentor", "images/mentor_ghost.png");
        PIXI.loader.add("dialogs", `dialogs-${LANG}.json`);
        // LOADING : creatures
        PIXI.loader.add("grey_wolf", "images/creatures/grey_wolf.png"); // Grey wolf
        PIXI.loader.add("ostrich", "images/creatures/passive/chocobo-temp.png"); // Ostrich - passive
        PIXI.loader.add("bee", "images/creatures/bee.png"); // Bee
        PIXI.loader.add("fish", "images/creatures/passive/fish-temp.png"); // Fish - passive
        PIXI.loader.add("wild_rabbit", "images/creatures/wild_rabbit.png"); // Wild rabbit
        PIXI.loader.add("mouse", "images/creatures/mouse.png"); // Mouse
        PIXI.loader.add("rabbit", "images/creatures/rabbit.png"); // Rabbit (white one)
        PIXI.loader.add("snake", "images/creatures/snake.png"); // Snake - passive
        PIXI.loader.add("butterfly", "images/creatures/butterfly.png"); // Butterfly
        PIXI.loader.add("chicken", "images/creatures/chicken.png"); // Chicken
        PIXI.loader.add("white_wolf", "images/creatures/white_wolf.png"); // White wolf
        PIXI.loader.add("frog", "images/creatures/frog.png"); // Frog
        // LOADING : enemies
        //PIXI.loader.add("e_grey_wolf", "images/creatures/grey_wolf_bad.png");
        PIXI.loader.add("boss1", "images/creatures/chocobo_bad.png");
        /*PIXI.loader.add("e_bee", "images/creatures/bee_bad.png");
        // PIXI.loader.add("e_fish", "images/creatures/fish_bad.png"); // Doesn't exist yet
        PIXI.loader.add("e_wild_rabbit", "images/creatures/wild_rabbit_bad.png");
        PIXI.loader.add("e_mouse", "images/creatures/mouse_bad.png");
        PIXI.loader.add("e_rabbit", "images/creatures/rabbit_bad.png");
        PIXI.loader.add("e_snake", "images/creatures/snake_bad.png");
        // PIXI.loader.add("e_butterfly", "images/creatures/buttrfly_bad.png"); // Doesn't exist yet
        PIXI.loader.add("e_chicken", "images/creatures/chicken_bad.png");
        PIXI.loader.add("e_white_wolf", "images/creatures/white_wolf_bad.png");
        PIXI.loader.add("e_frog", "images/creatures/frog_bad.png");
*/
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
        return map.load().then(() => {
            this.zones = this.map.createMapZones();
            this.physics.setMap(this.map.getPhysics());
        });
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
        this.lastUpdate = performance.now();
        requestAnimationFrame(this.gameLoopFn);
    }

    public computeDelta(): number {
        let now = performance.now();
        let delta = now - this.lastUpdate;
        this.lastUpdate = now;
        return delta;
    }

    public gameLoop(now: number) {
        requestAnimationFrame(this.gameLoopFn);

        if (stats) {
            stats.begin();
        }
        let delta = this.computeDelta();

        this.physics.update(delta);
        this.world.updatePhysics(delta);
        this.player.update(delta);
        this.pnjs.forEach(p => p.update(delta));
        this.zones.forEach(z => z.update(this.player));
        this.world.getHud().update();
        this.world.preRender();
        this.world.render();

        if (stats) {
            stats.end();
        }
    }
}
