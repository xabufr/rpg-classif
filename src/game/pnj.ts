import { GameObject } from "./gameObject";
import { World } from "../world";
import { Map } from "./map";
import { WorldObject } from "./worldObject";
import { Player } from "./player";
import { AnimatedSprite, AnimationDefinition, SpritesheetDefinition } from "../engine/animatedSprite";
import Matter = require("matter-js");

export abstract class Pnj extends GameObject {
    protected worldObject: WorldObject;
    protected readonly player: Player;

    constructor(worldObject: WorldObject, world: World, player: Player, texture: PIXI.Texture, spriteDef: SpritesheetDefinition, animationDefs: AnimationDefinition[]) {
        let sprite = new AnimatedSprite(texture, spriteDef, animationDefs);
        sprite.anchor.set(0.5, 0.5);
        sprite.position.set(worldObject.x, worldObject.y);

        let body = Matter.Bodies.circle(worldObject.x, worldObject.y, sprite.texture.width / 2);

        super("pnj", world, body, sprite);

        world.stage.addChild(sprite);

        this.worldObject = worldObject;
        this.player = player;
    }

    public getBody() {
        return <Matter.Body> this.body;
    }

    public getSprite(): AnimatedSprite {
        return <AnimatedSprite> this.sprite;
    }

    public update() {
        this.getSprite().position.set(this.getBody().position.x,
                                      this.getBody().position.y);
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
