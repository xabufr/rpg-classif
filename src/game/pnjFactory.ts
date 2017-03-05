import { Mentor } from "./mentor";
import { Pnj } from "./pnj";
import { WorldObject } from "./worldObject";
import { Map } from "./map";

const PNJ_TYPES: FactoryData = {
    mentor: (o: WorldObject, m: Map) => new Mentor(o, m)
};

interface FactoryData {
    [name: string]: (o: WorldObject, m: Map) => Mentor;
}

export function createPnj(object: WorldObject, map: Map): Pnj {
    if (object.name in PNJ_TYPES) {
        return PNJ_TYPES[object.name](object, map);
    }
    throw `Unknown PNJ type ${object.name}`;
}
