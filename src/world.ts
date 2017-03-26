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

    private camera: Camera;
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

    public cameraFollow(target: GameObject) {
        this.camera = new BasicCamera(this.renderer, this.map, target);
    }

    public update() {
        Matter.Engine.update(this.engine, 1000 / 60);
        this.updateCamera();
    }

    private updateCamera() {
        if (this.camera) {
            let pos = this.camera.getPosition();
            this.stage.x = -pos.x + this.renderer.width / 2;
            this.stage.y = -pos.y + this.renderer.height / 2;
            if (DEBUGGING) {
                this.matterRenderer.bounds = {
                    min: {
                        x: pos.x - this.renderer.width / 2,
                        y: pos.y - this.renderer.height / 2
                    },
                    max: {
                        x: pos.x + this.renderer.width / 2,
                        y: pos.y + this.renderer.height / 2
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

abstract class Camera {
    constructor(
        protected renderer: PIXI.SystemRenderer,
        protected map: Map,
        protected target: GameObject) {
    }
    public abstract getPosition(): {x: number, y: number};
}

class BasicCamera extends Camera {
    public getPosition() {
        let mapBounds = this.map.getBounds();
        let position = this.target.getPosition();
        let x = position.x;
        let y = position.y;
        x = Math.min(Math.max(x, this.renderer.width / 2),
                     mapBounds.width - this.renderer.width / 2);
        y = Math.min(Math.max(y, this.renderer.height / 2),
                     mapBounds.height - this.renderer.height / 2);
        return {x, y};
    }
}
