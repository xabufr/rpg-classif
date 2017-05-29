import { World } from "../world";
import { Mentor } from "./mentor";
import { Animal } from "./animal";
import { Boss } from "./boss";
import { Pnj } from "./pnj";
import { WorldObject } from "./worldObject";
import { Player } from "./player";
import { Map } from "./map";

const PNJ_TYPES: FactoryData = {
    mentor: (o: WorldObject, w: World, p: Player) => new Mentor(o, w, p),
    animal: (o: WorldObject, w: World, p: Player) => new Animal(o, w, p),
    boss: (o: WorldObject, w: World, p: Player) => new Boss(o, w, p)
};

interface FactoryData {
    [name: string]: (o: WorldObject, w: World, p: Player) => Pnj;
}

export function createPnj(object: WorldObject, world: World, player: Player): Pnj {
    if (object.type in PNJ_TYPES) {
        return PNJ_TYPES[object.type](object, world, player);
    }
    throw `Unknown PNJ type ${object.type}`;
}
