import { WorldObject } from "./worldObject";
import { Pnj } from "./pnj";
import { Map } from "./map";

export class Mentor extends Pnj {
    public constructor(o: WorldObject, map: Map) {
        super(map, "mentor");
    }
}
