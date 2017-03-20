// import { Boot } from "./boot.state";
// import { Start } from "./start.state";
// import { MainMenu } from "./mainMenu.state";
// import { GameState } from "./game.state";

import { Map } from "./game/map";
import { AnimatedSprite } from "./engine/animatedSprite";

let stats = new Stats();

export class Game {
    private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    private stage: PIXI.Container;
    constructor() {
        this.renderer = PIXI.autoDetectRenderer(800, 600, {
            antialias: false
        });
        document.body.appendChild(this.renderer.view);
        stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( stats.dom );
        this.renderer.backgroundColor = 0x061639;
        this.renderer.view.style.border = "1px dashed red";
        this.stage = new PIXI.Container();
        //Tell the `renderer` to `render` the `stage`
        this.renderer.render(this.stage);
        PIXI.loader.baseUrl = "./assets/";
        PIXI.loader.add("map.json", (data: any) => {
            console.log(data.data);
            new Map(this.stage, data.data);
        }).add("images/player_f.png").load(() => {

            let sprite = new AnimatedSprite("images/player_f.png", {
                frameWidth: 24,
                frameHeight: 32
            }, [{
                name: "up",
                frames: [
                    {x: 0, y: 3},
                    {x: 1, y: 3},
                    {x: 2, y: 3}]
            }, {
                name: "down",
                frames: [
                    {x: 0, y: 0},
                    {x: 1, y: 0},
                    {x: 2, y: 0}]
            }]);
            sprite.setCurrentAnimation("up");
            sprite.play();
            let cont = new PIXI.particles.ParticleContainer();
            cont.addChild(sprite);

            let sprite2 = new PIXI.Sprite(PIXI.loader.resources["images/player_f.png"].texture);
            sprite2.texture.frame = new PIXI.Rectangle(10, 10, 50, 32);
            sprite2.x = 100;
            cont.addChild(sprite2);
            this.stage.addChild(cont);
            this.gameLoopEnter();
        });
    }

    public gameLoopEnter() {
        requestAnimationFrame(() => this.gameLoopEnter());
	      stats.begin();
        this.renderer.render(this.stage);
        stats.end();
        this.stage.x-= 10;
        this.stage.y-= 10;
    }
}
