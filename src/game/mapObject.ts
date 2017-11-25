import { GameObject } from "./gameObject";
import { WorldObject } from "./worldObject";
import { World } from "../world";
import { Player } from "./player";
import { Body, Vector, Rectangle } from "../engine/physics";
import { HUD_ICON_WIDTH, HUD_ICON_HEIGHT } from "./ui";

type MapObjectType = "life" | "collectible";

export function createMapObject(world: World, wObject: WorldObject, player: Player): MapObject {
    if (!wObject.properties) {
        throw `Missing properties in ${JSON.stringify(wObject)}`;
    }
    let oType = <MapObjectType> wObject.properties.type;
    switch(oType) {
    case "life":
        return new LifeMapObject(world, wObject, player);
    case "collectible":
    default:
        throw `Unknown MapObject type ${oType} on object ${JSON.stringify(wObject)}`;
    }
}

export abstract class MapObject extends GameObject {
    private alive:  boolean;
    constructor(world: World,
                protected worldObject: WorldObject,
                sprite: PIXI.Sprite,
                protected player: Player,
                protected zone: Rectangle) {
        super("mapObject", world, null, sprite);
        this.world.stage.addChildAt(sprite, 1);
        this.alive = true;
    }

    public onCollisionStart(other: GameObject) {
        if (other.type === "player") {
            this.onCollisionWithPlayer(<Player> other);
        }
    }

    public update(delta: number) {
        let playerBody = this.player.getBody();
        if (this.alive && playerBody) {
            if (this.zone.intersects(playerBody)) {
                this.onCollisionWithPlayer(this.player);
            }
        }
    }

    protected abstract onCollisionWithPlayer(player: Player): void;

    protected destroy() {
        if (this.sprite) {
            this.sprite.parent.removeChild(this.sprite);
        }
        if (this.body) {
            this.world.physics.removeBody(this.body);
        }
    }
}

export class LifeMapObject extends MapObject {
    constructor(world: World, worldObject: WorldObject, player: Player) {
        let baseTexture = PIXI.loader.resources["icons"].texture;
        let icon = 2;
        let heart = new PIXI.Texture(baseTexture.baseTexture,
                                     new PIXI.Rectangle(HUD_ICON_WIDTH * icon, 0, HUD_ICON_WIDTH, HUD_ICON_HEIGHT));
        let position = new Vector(worldObject.x, worldObject.y)
            .minus({
                x: HUD_ICON_WIDTH / 2,
                y: HUD_ICON_HEIGHT / 2
            });
        let sprite = new PIXI.Sprite(heart);
        let rectangle = new Rectangle(position.x, position.y, HUD_ICON_WIDTH, HUD_ICON_HEIGHT);
        sprite.position.set(rectangle.position.x, rectangle.position.y);
        super(world, worldObject, sprite, player, rectangle);
    }

    protected onCollisionWithPlayer(player: Player): void {
        if(player.addLife()) {
            this.destroy();
        }
    }
}
