import { Game } from "./game";
import { GameHud } from "./game/ui";
import { Map } from "./game/map";
import { GameObject } from "./game/gameObject";
import { DEBUGGING } from "./options";
import { PhysicsWorld } from "./engine/physics";

export class World {
    public readonly stage: PIXI.Container;
    public readonly uiStage: PIXI.Container;

    private root: PIXI.Container;

    private camera: Camera;
    private map: Map;
    private hud: GameHud;

    private bodiesRegistry: GameObject[];
    private lastDelta: number;

    constructor(
        public readonly game: Game,
        public readonly renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer,
        public readonly physics: PhysicsWorld
    ) {
        this.bodiesRegistry = [];
        this.stage = new PIXI.Container();
        this.uiStage = new PIXI.Container();
        this.root = new PIXI.Container();
        this.root.addChild(this.stage);
        this.root.addChild(this.uiStage);

        this.lastDelta = 60 / 1000;
        if (DEBUGGING) {
        }
    }

    public render() {
        this.renderer.render(this.root);
    }

    public cameraFollow(target: GameObject) {
        if (DEBUGGING) {
            this.camera = new DebugCamera(this, target);
        } else {
            this.camera = new TimedCamera(this, target);
        }
    }

    public updatePhysics(delta: number) {
        this.lastDelta = delta;
        if (this.camera) {
            this.camera.update(delta);
        }
    }

    public preRender() {
        this.updateCamera();
    }

    private updateCamera() {
        if (this.camera) {
            let pos = this.camera.getPosition();
            this.stage.x = -pos.x + this.renderer.width / 2;
            this.stage.y = -pos.y + this.renderer.height / 2;
            if (DEBUGGING) {
            }
        }
    }

    public setMap(map: Map) {
        this.map = map;
    }

    public getMap() {
        return this.map;
    }

    public setHud(hud: GameHud) {
        this.hud = hud;
    }

    public getHud() {
        return this.hud;
    }

    public getGame() {
        return this.game;
    }
}

abstract class Camera {
    constructor(
        protected world: World,
        protected target: GameObject) {
    }

    public update(delta: number) {
    }

    public abstract getPosition(): {x: number, y: number};
}

class DebugCamera extends Camera {
    public getPosition() {
        return this.target.getPosition();
    }
}

class BasicCamera extends Camera {
    private pCache: {x: number, y: number};
    constructor(
        world: World,
        target: GameObject) {
        super(world, target);
        this.pCache = {x: 0, y: 0};
    }

    public update(delta: number) {
        let mapBounds = this.world.getMap().getBounds();
        let position = this.target.getPosition();
        let x = position.x;
        let y = position.y;
        this.pCache.x = Math.min(Math.max(x, this.world.renderer.width / 2),
                                 mapBounds.width - this.world.renderer.width / 2);
        this.pCache.y = Math.min(Math.max(y, this.world.renderer.height / 2),
                     mapBounds.height - this.world.renderer.height / 2);
    }

    public getPosition() {
        return this.pCache;
    }
}

const CAM_VEL = 5;
class TimedCamera extends BasicCamera {
    private currentPosition: {x: number, y: number};
    constructor(
        world: World,
        target: GameObject) {
        super(world, target);
        let bounds = world.getMap().getBounds();
        this.currentPosition = {
            x: bounds.width / 2,
            y: bounds.height / 2
        };
    }

    public update(delta: number) {
        super.update(delta);
        let idealPosition = super.getPosition();
        let diff = {
            x: idealPosition.x - this.currentPosition.x,
            y: idealPosition.y - this.currentPosition.y
        };
        this.currentPosition.x += diff.x * (delta / 1000) * CAM_VEL;
        this.currentPosition.y += diff.y * (delta / 1000) * CAM_VEL;
    }

    public getPosition() {
        return this.currentPosition;
    }
}
