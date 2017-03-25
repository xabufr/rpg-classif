import { SpritesheetDefinition } from "../engine/animatedSprite";
import { Pnj } from "./pnj";
import { WorldObject } from "./worldObject";
import { World } from "../world";
import { Player } from "./player";
import { Direction, Directions, getDirectionVector } from "./direction";


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
            return new RandomBehaviour(this, this.worldObject);
        }
        throw `Unknown behaviour ${this.worldObject.properties.behaviour}`;
    }
}

abstract class Behaviour {
    constructor(protected animal: Animal, protected worldObject: WorldObject) {
    }

    public abstract update(): void;
}

class PassiveBehaviour extends Behaviour {
    constructor(animal: Animal, o: WorldObject) {
        super(animal, o);
        this.animal.getBody().isStatic = true;
    }

    public update() {
        // Nothing todo ?
    }
}

class RandomBehaviour extends Behaviour {
    private zone: PIXI.Rectangle;
    private zoneCollideBodies: Matter.Body[];
    private currentDirection: Direction | null;
    private lastDecitionMs: number;
    private directionDuration: number;
    constructor(animal: Animal, o: WorldObject) {
        super(animal, o);
        if (!this.worldObject.properties || !this.worldObject.properties.zone) {
            throw `Missing zone for animal ${this.worldObject.name}`;
        }
        let zoneName = this.worldObject.properties.zone;
        let zone = this.animal.getWorld().getMap().getZoneNamed(zoneName);
        this.currentDirection = null;
        this.zone = new PIXI.Rectangle(zone.x,
                                       zone.y,
                                       zone.width,
                                       zone.height);
        this.zoneCollideBodies = [Matter.Bodies.rectangle(this.zone.x + this.zone.width * 0.5,
                                                          this.zone.y - 12,
                                                          this.zone.width,
                                                          24),
                                  Matter.Bodies.rectangle(this.zone.x + this.zone.width * 0.5,
                                                          this.zone.y + this.zone.height + 12,
                                                          this.zone.width,
                                                          24),
                                  Matter.Bodies.rectangle(this.zone.x - 12,
                                                          this.zone.y + this.zone.height * 0.5,
                                                          24,
                                                          this.zone.height),
                                  Matter.Bodies.rectangle(this.zone.x + this.zone.width + 12,
                                                          this.zone.y + this.zone.height * 0.5,
                                                          24,
                                                          this.zone.height)];
        this.animal.getBody().collisionFilter.group = 0x2;
        console.log(this.zoneCollideBodies[0].bounds);
        this.zoneCollideBodies.forEach(b => {
            b.isStatic = true;
            b.collisionFilter.group = 0x2;
            b.collisionFilter.category = 0x2;
            b.collisionFilter.mask = 0x2;
        });
        Matter.World.add(this.animal.getWorld().engine.world, this.zoneCollideBodies);
    }

    public update() {
        let time = window.performance.now();
        if (this.currentDirection === null ||
            this.lastDecitionMs + this.directionDuration <= time) {
            let dirIndex = Math.floor(Math.random() * 1000) % 4;
            this.currentDirection = Directions[dirIndex];
            this.lastDecitionMs = time;
            this.directionDuration = 1000;
        }
        // Nothing todo ?
        let vel = getDirectionVector(this.currentDirection, 1);
        Matter.Body.setVelocity(this.animal.getBody(), vel);
    }
}
