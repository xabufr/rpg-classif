import { GameObject } from "./gameObject";
import { World } from "../world";
import { Map } from "./map";
import { WorldObject } from "./worldObject";
import { Player } from "./player";
import { Body } from "../engine/physics";
import { AnimatedSprite, AnimationDefinition, SpritesheetDefinition } from "../engine/animatedSprite";

export abstract class Pnj extends GameObject {
    protected worldObject: WorldObject;
    protected readonly player: Player;
    public readonly name: string;

    constructor(worldObject: WorldObject, world: World, player: Player, texture: PIXI.Texture, spriteDef: SpritesheetDefinition, animationDefs: AnimationDefinition[]) {
        let sprite = new AnimatedSprite(texture, spriteDef, animationDefs);
        let position = {
            x: worldObject.x - sprite.texture.width / 2,
            y: worldObject.y - sprite.texture.height / 2
        };
        sprite.position.set(position.x, position.y);

        let body = new Body(position.x,
                            position.y,
                            sprite.texture.width,
                            sprite.texture.height);

        super("pnj", world, body, sprite);

        world.stage.addChild(sprite);

        this.worldObject = worldObject;
        this.player = player;
        this.name = worldObject.name;
    }

    public update(deltaTime: number) {
        super.update(deltaTime);
    }

    public getBody() {
        return <Body> this.body;
    }

    public getSprite(): AnimatedSprite {
        return <AnimatedSprite> this.sprite;
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
