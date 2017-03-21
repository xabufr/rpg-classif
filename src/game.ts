// import { Boot } from "./boot.state";
// import { Start } from "./start.state";
// import { MainMenu } from "./mainMenu.state";
// import { GameState } from "./game.state";

import { Player } from "./game/player";
import { World } from "./world";
import { Map } from "./game/map";
import { AnimatedSprite } from "./engine/animatedSprite";

let stats = new Stats();

export class Game {
    private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    private world: World;
    private map: Map;
    constructor() {
        this.renderer = PIXI.autoDetectRenderer(800, 600, {
            antialias: false
        });
        document.body.appendChild(this.renderer.view);
        stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( stats.dom );
        this.world = new World(this.renderer);

        this.renderer.backgroundColor = 0x061639;
        this.renderer.view.style.border = "1px dashed red";

        let stage = this.world.stage;
        this.load().then(() => this.start());
        // PIXI.loader.baseUrl = "./assets/";
        // PIXI.loader.add("map.json", (data: any) => {
        //     console.log(data.data);
        //     new Map(stage, data.data, this.world);
        // }).add("images/player_f.png").load(() => {

        //     let sprite = new AnimatedSprite("images/player_f.png", {
        //         frameWidth: 24,
        //         frameHeight: 32
        //     }, [{
        //         name: "up",
        //         frames: [
        //             {x: 0, y: 3},
        //             {x: 1, y: 3},
        //             {x: 2, y: 3}]
        //     }, {
        //         name: "down",
        //         frames: [
        //             {x: 0, y: 0},
        //             {x: 1, y: 0},
        //             {x: 2, y: 0}]
        //     }]);
        //     sprite.setCurrentAnimation("up");
        //     sprite.play();
        //     let cont = new PIXI.particles.ParticleContainer();
        //     cont.addChild(sprite);

        //     let sprite2 = new PIXI.Sprite(PIXI.loader.resources["images/player_f.png"].texture);
        //     sprite2.texture.frame = new PIXI.Rectangle(10, 10, 50, 32);
        //     sprite2.x = 100;
        //     cont.addChild(sprite2);
        //     stage.addChild(cont);
        //     this.gameLoopEnter();
        // });
    }

    private load() {
        PIXI.loader.baseUrl = "./assets/";
        PIXI.loader.add("images/player_f.png");
        return new Promise(r => {
            PIXI.loader.load(r);
        }).then(() => this.loadMap("./map.json"))
            .then(() => this.loadPlayer());
    }

    private loadMap(mapName: string) {
        let map = new Map(this.world, mapName);
        this.map = map;
        return map.load();
    }

    private loadPlayer() {
        let player = new Player(this.world, PIXI.loader.resources["images/player_f.png"].texture, this.map.findSpawnZone());
    }

    private start() {
        requestAnimationFrame(() => this.gameLoop());
    }

    public gameLoop() {
        requestAnimationFrame(() => this.gameLoop());

        stats.begin();
        this.world.update();
        this.world.render();
        stats.end();
    }
}
