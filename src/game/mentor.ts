import { WorldObject } from "./worldObject";
import { Pnj } from "./pnj";
import { Map } from "./map";
import { Player } from "./player";

export class Mentor extends Pnj {
    private hasTalk: boolean;
    private autoTalkZone: Phaser.Sprite;

    public constructor(o: WorldObject, map: Map) {
        super(o, map, "mentor");
        this.hasTalk = false;
        let talkZoneObject = this.map.getZoneNamed(`${o.name}_zone`);
        this.autoTalkZone = this.game.add.sprite(talkZoneObject.x, talkZoneObject.y, null);
        this.game.physics.enable(this.autoTalkZone);
        let body = this.autoTalkZone.body;
        body.setSize(talkZoneObject.width, talkZoneObject.height);
    }

    public updateForPlayer(player: Player) {
        if (!this.hasTalk) {
            if (this.game.physics.arcade.overlap(player, this.autoTalkZone)) {
                this.hasTalk = true;
            }
        }
    }
}
