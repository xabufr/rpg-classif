import { GameHud } from "./game/ui";
import { Map } from "./game/map";
import { GameObject } from "./game/gameObject";
import { DEBUGGING } from "./debug";
import Matter = require("matter-js");

export class World {
    public readonly stage: PIXI.Container;
    public readonly uiStage: PIXI.Container;
    public readonly engine: Matter.Engine;

    private root: PIXI.Container;

    private cameraTarget: PIXI.DisplayObject;
    private matterRenderer: Matter.Render;
    private map: Map;
    private hud: GameHud;

    private bodiesRegistry: GameObject[];

    constructor(
        public readonly renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer
    ) {
        this.bodiesRegistry = [];
        this.stage = new PIXI.Container();
        this.uiStage = new PIXI.Container();
        this.root = new PIXI.Container();
        this.root.addChild(this.stage);
        this.root.addChild(this.uiStage);

        this.engine = Matter.Engine.create();
        if (DEBUGGING) {
            this.matterRenderer = Matter.Render.create({
                engine: this.engine,
                element: document.body,
                options: {
                    // showAxes: false,
                    // showPositions: true,
                },
                bounds: {
                    min: {
                        x: 100,
                        y: 100
                    },
                    max: {
                        x: 900,
                        y: 700
                    }
                },

            });
            Matter.Render.run(this.matterRenderer);
        }
        Matter.Events.on(this.engine, "collisionStart", e => {
            e.pairs.forEach(p => {
                let a = this.bodiesRegistry[p.bodyA.id];
                let b = this.bodiesRegistry[p.bodyB.id];
                if (a && b) {
                    a.onCollisionStart(b);
                    b.onCollisionStart(a);
                }
            });
        });
        this.engine.world.gravity.y = 0;
    }

    public render() {
        this.renderer.render(this.root);
    }

    public cameraFollow(target: PIXI.DisplayObject) {
        this.cameraTarget = target;
    }

    public update() {
        Matter.Engine.update(this.engine, 1000 / 60);
        this.updateCamera();
    }

    private updateCamera() {
        if (this.cameraTarget && this.map) {
            let mapBounds = this.map.getBounds();
            let x = this.cameraTarget.x - this.renderer.width / 2;
            let y = this.cameraTarget.y - this.renderer.height / 2;
            x = Math.min(Math.max(x, 0),
                         mapBounds.width - this.renderer.width);
            y = Math.min(Math.max(y, 0),
                         mapBounds.height - this.renderer.height);
            this.stage.x = -x;
            this.stage.y = -y;
            if (DEBUGGING) {
                this.matterRenderer.bounds = {
                    min: {
                        x: this.cameraTarget.x - this.renderer.width / 2,
                        y: this.cameraTarget.y - this.renderer.height / 2
                    },
                    max: {
                        x: this.cameraTarget.x + this.renderer.width / 2,
                        y: this.cameraTarget.y + this.renderer.height / 2
                    }
                };
            }
        }
    }

    public setMap(map: Map) {
        this.map = map;
    }

    public getMap() {
        return this.map;
    }

    public registerBody(body: Matter.Body, owner: GameObject) {
        this.bodiesRegistry[body.id] = owner;
    }

    public setHud(hud: GameHud) {
        this.hud = hud;
    }

    public getHud() {
        return this.hud;
    }
}
