import { GameObject } from "./gameObject";
import { World } from "../world";
import { Map } from "./map";
import { WorldObject } from "./worldObject";
import { Player } from "./player";
import { Body } from "../engine/physics";
import { AnimatedSprite, AnimationDefinition, SpritesheetDefinition } from "../engine/animatedSprite";
import { Behaviour } from "./behaviour";

export abstract class Pnj extends GameObject {
    protected worldObject: WorldObject;
    protected readonly player: Player;
    public readonly name: string;
    protected behaviour?: Behaviour;

    constructor(worldObject: WorldObject, world: World, player: Player, texture: PIXI.Texture, spriteDef: SpritesheetDefinition, animationDefs: AnimationDefinition[], behaviour?: Behaviour) {
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
        this.behaviour = behaviour;
    }

    public interactWithPlayer(): Promise<void> {
        return Promise.resolve();
    }

    public update(deltaTime: number) {
        super.update(deltaTime);
        if (this.behaviour) {
            this.behaviour.update(deltaTime);
        }
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
        if(this.behaviour) {
            this.behaviour.onCollisionStart(other);
        }
        if (other.type === "player") {
            this.onCollideWithPlayer();
        }
    }

    protected onCollideWithPlayer() {
    }
}
