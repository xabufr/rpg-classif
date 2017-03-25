import { SpritesheetDefinition } from "../engine/animatedSprite";
import { Pnj } from "./pnj";
import { WorldObject } from "./worldObject";
import { World } from "../world";
import { Player } from "./player";

type BehaviourString = "passive" | "follower" | "fugitive" | "random";

const frames = [{
    name: "down",
    frames: [
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 2, y: 0}
    ]
}, {
    name: "left",
    frames: [
        {x: 0, y: 1},
        {x: 1, y: 1},
        {x: 2, y: 1}
    ]
},{
    name: "right",
    frames: [
        {x: 0, y: 2},
        {x: 1, y: 2},
        {x: 2, y: 2}
    ]
}, {
    name: "up",
    frames: [
        {x: 0, y: 3},
        {x: 1, y: 3},
        {x: 2, y: 3}
    ]
}];

export class Animal extends Pnj {
    private behaviour: Behaviour;
    constructor(o: WorldObject, world: World, player: Player) {
        if (!o.properties || !o.properties.textureName) {
            throw `Missing textureName in animal ${o.name}`;
        }
        let spriteDef: SpritesheetDefinition = {
            frameWidth: o.properties.frameWidth || 24,
            frameHeight: o.properties.frameHeight || 32
        };
        super(o, world, player, PIXI.loader.resources[o.properties.textureName].texture, spriteDef, frames);
        this.behaviour = this.createBehaviour();
        this.behaviour.setup();
    }

    public update() {
        super.update();
        this.behaviour.update();
    }

    private createBehaviour(): Behaviour {
        if (!this.worldObject.properties || !this.worldObject.properties.behaviour) {
            throw `Missing behaviour on animal ${this.worldObject.name}`;
        }
        switch (<BehaviourString> this.worldObject.properties.behaviour) {
        case "passive":
            return new PassiveBehaviour(this, this.worldObject);
        case "follower":
            // return BehaviourType.Follower;
        case "fugitive":
            // return BehaviourType.Fugitive;
        case "random":
            // return BehaviourType.Random;
        }
        throw `Unknown behaviour ${this.worldObject.properties.behaviour}`;
    }
}

abstract class Behaviour {
    constructor(protected animal: Animal, protected worldObject: WorldObject) {
    }

    public abstract update(): void;
    public abstract setup(): void;
}

class PassiveBehaviour extends Behaviour {
    constructor(animal: Animal, o: WorldObject) {
        super(animal, o);
    }

    public setup() {
        this.animal.getBody().isStatic = true;
    }

    public update() {
        // Nothing todo ?
    }
}

class RandomBehavious extends Behaviour {
    constructor(animal: Animal, o: WorldObject) {
        super(animal, o);
    }

    public setup() {
        // let zoneName = this.worldObject.properties.zone;
    }

    public update() {
        // Nothing todo ?
    }
}
