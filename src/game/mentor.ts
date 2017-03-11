import { GameState } from "../game.state";
import { WorldObject } from "./worldObject";
import { Pnj } from "./pnj";
import { Map } from "./map";
import { Player } from "./player";

const MIN_DIST = 20;
const MAX_DIST = 300;

export class Mentor extends Pnj {
    private hasTalk: boolean;
    private autoTalkZone: Phaser.Sprite;
    private talkText: string;
    // private sprite: Phaser.Sprite;

    public constructor(o: WorldObject, gameState: GameState) {
        super(o, gameState, "mentor");
        this.hasTalk = false;

        let talkZoneObject = this.gameState.getMap().getZoneNamed(`${o.name}_zone`);
        this.autoTalkZone = this.game.add.sprite(talkZoneObject.x, talkZoneObject.y, null);
        this.game.physics.enable(this.autoTalkZone);
        let body = this.autoTalkZone.body;
        body.setSize(talkZoneObject.width, talkZoneObject.height);

        this.talkText = this.game.cache.getJSON("dialogs")[o.properties.talk].text;
        this.game.add.existing(this);
        this.frame = 0;
        this.anchor.setTo(0.5, 0.5);
        this.position.setTo(o.x, o.y);
        this.game.physics.arcade.enable(this);
        (<Phaser.Physics.Arcade.Body>this.body).immovable = true;
    }

    public updateForPlayer(player: Player) {
        this.game.physics.arcade.collide(player, this);
        if (!this.hasTalk) {
            if (this.game.physics.arcade.overlap(player, this.autoTalkZone)) {
                this.hasTalk = true;
                player.setCanMove(false);
                this.gameState.getHub().getMonologDialog().showTextToPlayer(this.talkText, () => {
                    player.setCanMove(true);
                });
            }
        }
        let dist = this.distanceToPlayer(player);
        if (dist > MAX_DIST) {
            this.visible = false;
        } else {
            this.visible = true;
            this.alpha = this.getAlpha(dist);
        }
    }

    private distanceToPlayer(player: Player) {
        return this.position.distance(player.position, false);
    }

    private getAlpha(distance: number) {
        if (distance <= MIN_DIST) {
            return 1.0;
        }
        return 1 - ((distance - MIN_DIST) / MAX_DIST);
    }
}
