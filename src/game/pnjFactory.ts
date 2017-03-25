import { World } from "../world";
import { Mentor } from "./mentor";
import { Animal } from "./animal";
import { Pnj } from "./pnj";
import { WorldObject } from "./worldObject";
import { Player } from "./player";
import { Map } from "./map";

const PNJ_TYPES: FactoryData = {
    mentor: (o: WorldObject, w: World, p: Player) => new Mentor(o, w, p),
    animal: (o: WorldObject, w: World, p: Player) => new Dummy()
};

class Dummy extends Pnj {
    constructor() {
    }
    public update() {
    }
}

interface FactoryData {
    [name: string]: (o: WorldObject, w: World, p: Player) => Pnj;
}

export function createPnj(object: WorldObject, world: World, player: Player): Pnj {
    if (object.type in PNJ_TYPES) {
        return PNJ_TYPES[object.type](object, world, player);
    }
    throw `Unknown PNJ type ${object.type}`;
}
