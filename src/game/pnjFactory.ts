import { GameState } from "../game.state";
import { Mentor } from "./mentor";
import { Pnj } from "./pnj";
import { WorldObject } from "./worldObject";
import { Map } from "./map";

const PNJ_TYPES: FactoryData = {
    mentor: (o: WorldObject, s: GameState) => new Mentor(o, s)
};

interface FactoryData {
    [name: string]: (o: WorldObject, s: GameState) => Pnj;
}

export function createPnj(object: WorldObject, gameState: GameState): Pnj {
    if (object.type in PNJ_TYPES) {
        return PNJ_TYPES[object.type](object, gameState);
    }
    throw `Unknown PNJ type ${object.type}`;
}
