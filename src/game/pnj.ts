import { GameState } from "../game.state";
import { Map } from "./map";
import { WorldObject } from "./worldObject";
import { Player } from "./player";

export abstract class Pnj extends Phaser.Sprite  {
    constructor(protected worldObject: WorldObject, protected gameState: GameState, texture: string) {
        super(gameState.game, 0, 0, texture);
    }

    public abstract updateForPlayer(player: Player): void;
}
