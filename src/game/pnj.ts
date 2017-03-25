import { GameObject } from "./gameObject";
import { World } from "../world";
import { Map } from "./map";
import { WorldObject } from "./worldObject";
import { Player } from "./player";
import { AnimatedSprite, AnimationDefinition, SpritesheetDefinition } from "../engine/animatedSprite";

export abstract class Pnj extends GameObject {
    protected worldObject: WorldObject;
    protected readonly player: Player;

    constructor(worldObject: WorldObject, world: World, player: Player, texture: PIXI.Texture, spriteDef: SpritesheetDefinition, animationDefs: AnimationDefinition[]) {
        let sprite = new AnimatedSprite(texture, spriteDef, animationDefs);
        sprite.anchor.set(0.5, 0.5);
        sprite.position.set(worldObject.x, worldObject.y);

        let body = Matter.Bodies.circle(worldObject.x, worldObject.y, sprite.texture.width / 2);

        super("pnj", world, body, sprite);

        Matter.World.add(this.world.engine.world, this.body);
        world.stage.addChild(sprite);

        this.worldObject = worldObject;
        this.player = player;
    }

    public update() {
        this.sprite.position.set(this.body.position.x, this.body.position.y);
    }

    public getPlayer() {
        return this.player;
    }

    public onCollisionStart(other: GameObject) {
        if (other.type === "player") {
            this.onCollideWithPlayer();
        }
    }

    protected onCollideWithPlayer() {
    }
}
