import { GameState } from "../game.state";
import { WorldObject } from "./worldObject";
import { Pnj } from "./pnj";
import { Map } from "./map";
import { Player } from "./player";

export class Mentor extends Pnj {
    private hasTalk: boolean;
    private autoTalkZone: Phaser.Sprite;
    private talkText: string;

    public constructor(o: WorldObject, gameState: GameState) {
        super(o, gameState, "mentor");
        this.hasTalk = false;

        let talkZoneObject = this.gameState.getMap().getZoneNamed(`${o.name}_zone`);
        this.autoTalkZone = this.game.add.sprite(talkZoneObject.x, talkZoneObject.y, null);
        this.game.physics.enable(this.autoTalkZone);
        let body = this.autoTalkZone.body;
        body.setSize(talkZoneObject.width, talkZoneObject.height);

        this.talkText = this.game.cache.getJSON("dialogs")[o.properties.talk].text;
    }

    public updateForPlayer(player: Player) {
        if (!this.hasTalk) {
            if (this.game.physics.arcade.overlap(player, this.autoTalkZone)) {
                this.hasTalk = true;
                player.setCanMove(false);
                this.gameState.getHub().getMonologDialog().showTextToPlayer(this.talkText, () => {
                    player.setCanMove(true);
                });
            }
        }
    }
}
