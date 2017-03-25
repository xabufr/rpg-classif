import { SpritesheetDefinition } from "../engine/animatedSprite";
import { Pnj } from "./pnj";
import { Animation } from "../engine/animatedSprite";
import { WorldObject } from "./worldObject";
import { World } from "../world";
import { Player } from "./player";
import { Direction, Directions, getDirectionVector } from "./direction";
import { GameObject } from "./gameObject";
import { rectToBody } from "../utils";
import Matter = require("matter-js");


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
            frameWidth: o.properties.frameWidth || 32,
            frameHeight: o.properties.frameHeight || 32
        };
        super(o, world, player, PIXI.loader.resources[o.properties.textureName].texture, spriteDef, frames);
        this.behaviour = this.createBehaviour();
    }

    public update() {
        super.update();
        this.behaviour.update();
    }

    public onCollisionStart(other: GameObject) {
        this.behaviour.onCollisionStart(other);
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
    public onCollisionStart(other: GameObject) {
    }
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

const ANIMAL_WALL_TYPE = "animal-wall";
class AnimalZoneWall extends GameObject {
    constructor(public readonly animal: Animal, rec: PIXI.Rectangle) {
        super("animal-wall", animal.getWorld(), rectToBody(rec), null);
        if(this.body) {
            this.body.isStatic = true;
            this.body.collisionFilter.group = 0x2;
            this.body.collisionFilter.category = 0x2;
            this.body.collisionFilter.mask = 0x2;
        }
    }
}
class RandomBehaviour extends Behaviour {
    private zone: PIXI.Rectangle;
    private walls: AnimalZoneWall[];
    private currentDirection: Direction | null;
    private lastDecitionMs: number;
    private directionDuration: number;
    private currentAnimation: Animation;

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
        this.walls = [new PIXI.Rectangle(this.zone.x,
                                         this.zone.y - 25,
                                         this.zone.width,
                                         25),
                     new PIXI.Rectangle(this.zone.x,
                                         this.zone.y + this.zone.height,
                                         this.zone.width,
                                         25),
                      new PIXI.Rectangle(this.zone.x - 25,
                                         this.zone.y,
                                         25,
                                         this.zone.height),
                      new PIXI.Rectangle(this.zone.x + this.zone.width,
                                         this.zone.y,
                                         25,
                                         this.zone.height),
                     ].map(r => new AnimalZoneWall(this.animal, r));
        this.animal.getBody().collisionFilter.group = 0x2;
    }

    public onCollisionStart(other: GameObject) {
        if (other.type === ANIMAL_WALL_TYPE) {
            let wall = <AnimalZoneWall> other;
            if (wall.animal === this.animal) {
                this.currentAnimation.stop();
            }
        }
    }
    public update() {
        let time = window.performance.now();
        if (this.currentDirection === null ||
            this.lastDecitionMs + this.directionDuration <= time) {
            let dirIndex = Math.floor(Math.random() * 1000) % 4;
            this.currentDirection = Directions[dirIndex];
            this.lastDecitionMs = time;
            this.directionDuration = 1000;

            let animation = this.animal.getSprite()
                .getAnimation(Direction[this.currentDirection].toLocaleLowerCase());
            this.currentAnimation = animation;
            this.currentAnimation.play();
        }
        // Nothing todo ?
        let vel = getDirectionVector(this.currentDirection, 1);
        Matter.Body.setVelocity(this.animal.getBody(), vel);
    }
}
