import { World } from "../world";
import { WorldObject } from "./worldObject";
import { Pnj } from "./pnj";
import { Map } from "./map";
import { Player, Direction } from "./player";
import { distance } from "../utils";

const MIN_DIST = 50;
const MAX_DIST = 300;

export class Mentor extends Pnj {
    private hasTalk: boolean;
    private talkText: string;
    private isTalking: boolean;

    public constructor(o: WorldObject, world: World, player: Player) {
        let texture = PIXI.loader.resources["mentor"].texture;
        super(o, world, player, texture, {
            frameWidth: 24,
            frameHeight: 32
        }, [{
            name: "down",
            frames: [{x: 0, y: 0 }]
        }]);
        this.body.isStatic = true;

        this.hasTalk = false;
        this.isTalking = false;

        let talkZoneObject = this.world.getMap().getZoneNamedOptional(`${o.name}_zone`);
        if (talkZoneObject) {
            // this.autoTalkZone = this.game.add.sprite(talkZoneObject.x, talkZoneObject.y, null);
            // this.game.physics.enable(this.autoTalkZone);
            // let body = this.autoTalkZone.body;
            // body.setSize(talkZoneObject.width, talkZoneObject.height);
        } else {
            // this.autoTalkZone = null;
        }

        if (o.properties) {
            this.talkText = PIXI.loader.resources["dialogs"].data[o.properties.talk].text;
        } else {
            throw `Missing properties in mentor ${o.name}`;
        }
    }

    public update() {
        super.update();
        let dist = this.distanceToPlayer(this.player);
        if (dist > MAX_DIST) {
            this.sprite.visible = false;
        } else {
            this.sprite.visible = true;
            this.sprite.alpha = this.getAlpha(dist);
        }
    }

    protected onCollideWithPlayer() {
        this.talk();
    }

    private talk() {
        if (!this.isTalking) {
            console.log(this.talkText);
            this.isTalking = true;
            this.hasTalk = true;
            this.world.getHud().getMonologDialog().showTextToPlayer(this.talkText, () => {
            });
            // player.setCanMove(false);
            // this.gameState.getHub().getMonologDialog().showTextToPlayer(this.talkText, () => {
            //     player.setCanMove(true);
            //     this.isTalking = false;
            // });
        }
    }

    private distanceToPlayer(player: Player) {
        return distance(this.sprite.position, player.getPosition());
    }

    private getAlpha(distance: number) {
        if (distance <= MIN_DIST) {
            return 1.0;
        }
        return 1 - ((distance - MIN_DIST) / MAX_DIST);
    }
}
