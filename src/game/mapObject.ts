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
        return new CollectibleMapObject(world, wObject, player);
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
        if (this.alive) {
            this.alive = false;
            if (this.sprite) {
                this.sprite.parent.removeChild(this.sprite);
            }
            if (this.body) {
                this.world.physics.removeBody(this.body);
            }
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

export class CollectibleMapObject extends MapObject {
    private itemName: string;
    private dialog: string;
    private playerCollecting: boolean;

    constructor(world: World, worldObject: WorldObject, player: Player) {
        if (! worldObject.properties) {
            throw `Missing properties in MapObject ${JSON.stringify(worldObject)}`;
        }
        if (!worldObject.properties.texture) {
            throw `Missing texture property in MapObject ${JSON.stringify(worldObject)}`;
        }
        if (!worldObject.properties.dialog) {
            throw `Missing dialog property in MapObject ${JSON.stringify(worldObject)}`;
        }
        let texture = PIXI.loader.resources[worldObject.properties.texture].texture;
        let position = new Vector(worldObject.x, worldObject.y)
            .minus({
                x: texture.width / 2,
                y: texture.height / 2
            });
        let sprite = new PIXI.Sprite(texture);
        let rectangle = new Rectangle(position.x, position.y, HUD_ICON_WIDTH, HUD_ICON_HEIGHT);
        sprite.position.set(rectangle.position.x, rectangle.position.y);
        super(world, worldObject, sprite, player, rectangle);
        if (! worldObject.properties) {
            throw `Missing properties in MapObject ${JSON.stringify(worldObject)}`;
        }
        if (!worldObject.properties.itemName) {
            throw `Missing itemName property in MapObject ${JSON.stringify(worldObject)}`;
        }
        this.itemName = worldObject.properties.itemName;
        this.dialog = PIXI.loader.resources["dialogs"].data[worldObject.properties.dialog].text;
        this.playerCollecting = false;
    }

    protected onCollisionWithPlayer(player: Player): void {
        if (!this.playerCollecting) {
            this.playerCollecting = true;
            let isTalking = this.world.getHud()
                .getMonologDialog()
                .showTextToPlayer(this.dialog, () => {
                    player.canMove = true;
                    player.addCollectedObject(this.itemName);
                    this.destroy();
                });
            if (isTalking) {
                player.canMove = false;
            }
        }
    }
}
