import { Map } from "./map";

export class Pnj extends Phaser.Sprite  {
    constructor(map: Map, texture: string) {
        super(map.getGame(), 0, 0, texture);
    }
}
