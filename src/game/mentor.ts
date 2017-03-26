import { World } from "../world";
import { WorldObject } from "./worldObject";
import { Pnj } from "./pnj";
import { Map } from "./map";
import { Player } from "./player";
import { distance } from "../utils";
import { DEBUGGING } from "../debug";

const MIN_DIST = 50;
const MAX_DIST = 300;

export class Mentor extends Pnj {
    private hasTalk: boolean;
    private talkText: string;
    private isTalking: boolean;
    private talkZone: PIXI.Rectangle | null;

    public constructor(o: WorldObject, world: World, player: Player) {
        let texture = PIXI.loader.resources["mentor"].texture;
        super(o, world, player, texture, {
            frameWidth: 24,
            frameHeight: 32
        }, [{
            name: "down",
            frames: [{x: 0, y: 0 }]
        }]);
        this.getBody().isStatic = true;

        this.hasTalk = false;
        this.isTalking = false;

        let talkZoneObject = this.world.getMap().getZoneNamedOptional(`${o.name}_zone`);
        if (talkZoneObject) {
            this.talkZone = new PIXI.Rectangle(talkZoneObject.x,
                                               talkZoneObject.y,
                                               talkZoneObject.width,
                                               talkZoneObject.height);
        } else {
            this.talkZone = null;
        }

        if (o.properties) {
            this.talkText = PIXI.loader.resources["dialogs"].data[o.properties.talk].text;
        } else {
            throw `Missing properties in mentor ${o.name}`;
        }
    }

    public update(delta: number) {
        super.update(delta);
        let dist = this.distanceToPlayer(this.player);
        if (dist > MAX_DIST) {
            this.getSprite().visible = false;
        } else {
            this.getSprite().visible = true;
            this.getSprite().alpha = this.getAlpha(dist);
            if ( DEBUGGING === false &&
                this.talkZone !== null &&
                this.hasTalk === false &&
                this.talkZone.contains(this.player.getPosition().x,
                                       this.player.getPosition().y)) {
                this.talk();
            }
        }
    }

    protected onCollideWithPlayer() {
        this.talk();
    }

    private talk() {
        if (!this.isTalking) {
            this.isTalking = true;
            this.hasTalk = true;
            this.player.canMove = false;
            this.world.getHud().getMonologDialog().showTextToPlayer(this.talkText, () => {
                this.player.canMove = true;
                this.isTalking = false;
            });
        }
    }

    private distanceToPlayer(player: Player) {
        return distance(this.getSprite().position, player.getPosition());
    }

    private getAlpha(distance: number) {
        if (distance <= MIN_DIST) {
            return 1.0;
        }
        return 1 - ((distance - MIN_DIST) / MAX_DIST);
    }
}
