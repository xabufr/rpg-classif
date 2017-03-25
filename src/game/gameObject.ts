import { World } from "../world";
import Matter = require("matter-js");

export class GameObject {
    constructor(
        public readonly type: string,
        protected world: World,
        protected body: Matter.Body | null,
        protected sprite: PIXI.Sprite | null) {
        if (this.body) {
            this.world.registerBody(this.body, this);
            Matter.World.add(this.world.engine.world, this.body);
        }
    }

    public getBody() {
        return this.body;
    }

    public getSprite() {
        return this.sprite;
    }

    public getWorld() {
        return this.world;
    }

    public onCollisionEnd(other: GameObject) {
    }

    public onCollisionStart(other: GameObject) {
    }
}
