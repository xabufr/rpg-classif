import { World } from "../world";
import { Body } from "../engine/physics";

export class GameObject {
    constructor(
        public readonly type: string,
        protected world: World,
        protected body: Body | null,
        protected sprite: PIXI.Sprite | null) {
        if (this.body) {
            this.body.onCollide(other => {
                if (other.getGameObject()) {
                    this.onCollisionStart(other.getGameObject());
                }
            });
            this.body.setGameObject(this);
            this.world.physics.addBody(this.body);
        }
        this.world.register(this);
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

    /**
      * @param deltaTime in millis
      */
    public update(deltaTime: number) {
        if (this.body && this.sprite) {
            this.sprite.position.set(this.body.position.x,
                                     this.body.position.y);
        }
    }

    public onCollisionEnd(other: GameObject) {
    }

    public onCollisionStart(other: GameObject) {
    }

    public getPosition(): {x: number, y: number} {
        if (this.body) {
            return this.body.position;
        }
        if (this.sprite) {
            return this.sprite.position;
        }
        throw `Cannot find position for gameobject ${this.type}`;
    }
}
