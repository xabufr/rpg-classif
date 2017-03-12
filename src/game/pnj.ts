import { GameState } from "../game.state";
import { Map } from "./map";
import { WorldObject } from "./worldObject";
import { Player } from "./player";

export abstract class Pnj extends Phaser.Sprite  {
    constructor(protected worldObject: WorldObject, protected gameState: GameState, texture: string, frame?: number) {
        super(gameState.game, 0, 0, texture, frame);
    }

    public abstract updateForPlayer(player: Player): void;
}
