import { GameState } from "../game.state";
import { Map } from "./map";
import { WorldObject } from "./worldObject";
import { Player } from "./player";

export abstract class Pnj extends Phaser.Sprite  {
    protected test: boolean;

    constructor(protected worldObject: WorldObject, protected gameState: GameState, texture: string, frame?: number) {
        super(gameState.game, 0, 0, texture, frame);
        this.test = false;
    }

    public abstract updateForPlayer(player: Player): void;

    public setTest(test: boolean) {
        this.test = test;
    }
}
