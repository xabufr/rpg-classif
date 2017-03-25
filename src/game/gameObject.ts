import { World } from "../world";

export class GameObject {
    constructor(
        public readonly type: string,
        protected world: World,
        protected body: Matter.Body,
        protected sprite: PIXI.Sprite) {
        this.world.registerBody(this.body, this);
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
