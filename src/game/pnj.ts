import { Map } from "./map";
import { WorldObject } from "./worldObject";
import { Player } from "./player";

export class Pnj extends Phaser.Sprite  {
    protected worldObject: WorldObject;
    protected map: Map;

    constructor(object: WorldObject, map: Map, texture: string) {
        super(map.getGame(), 0, 0, texture);
        this.worldObject = object;
        this.map = map;
    }

    public abstract updateForPlayer(player: Player): void;
