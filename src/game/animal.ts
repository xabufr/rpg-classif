import { SpritesheetDefinition } from "../engine/animatedSprite";
import { Pnj } from "./pnj";
import { Animation } from "../engine/animatedSprite";
import { WorldObject } from "./worldObject";
import { World } from "../world";
import { Player } from "./player";
import { Direction, Directions, getDirectionVector } from "./direction";
import { GameObject } from "./gameObject";
import { Rectangle } from "../engine/physics";

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
}, {
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
    public readonly talk: string;

    constructor(o: WorldObject, world: World, player: Player) {
        if (!o.properties || !o.properties.textureName) {
            throw `Missing textureName in animal ${o.name}`;
        }
        let spriteDef: SpritesheetDefinition = {
            frameWidth: o.properties.frameWidth || 32,
            frameHeight: o.properties.frameHeight || 32
        };
        let resources = PIXI.loader.resources;
        super(o,
              world,
              player,
              resources[o.properties.textureName].texture,
              spriteDef,
              frames);
        if (!o.properties || !o.properties.talk) {
            throw `Missing talk property in animal ${o.name}`;
        }
        let dialogKey: string = o.properties.talk;
        let dialogData = resources["dialogs"].data[dialogKey];
        if (!dialogData || !dialogData.text) {
            throw `Missing dialog ${dialogKey} for animal ${this.name}`;
        }
        this.talk = dialogData.text;
        this.behaviour = this.createBehaviour();
    }

    public update(delta: number) {
        super.update(delta);
        this.behaviour.update(delta);
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

const TALK_COOLDOWN = 1000;
abstract class Behaviour {
    protected canTalk: boolean;
    protected isTalking: boolean;
    protected lastTalkMs: number;

    constructor(protected animal: Animal, protected worldObject: WorldObject) {
        this.canTalk = true;
        this.isTalking = false;
        this.lastTalkMs = -TALK_COOLDOWN;
    }

    public abstract update(delta: number): void;

    public canTalkNow() {
        let time = window.performance.now();
        return !this.isTalking && this.canTalk && time >= this.lastTalkMs + TALK_COOLDOWN;
    }

    public onCollisionStart(other: GameObject) {
        if (other.type === "player" && this.canTalkNow()) {
            let player = <Player> other;
            let isTalking = this.animal
                .getWorld()
                .getHud()
                .getMonologDialog()
                .showTextToPlayer(this.animal.talk, () => {
                    player.canMove = true;
                    this.isTalking = false;
                    this.lastTalkMs = performance.now();
                });
            if (isTalking) {
                this.isTalking = true;
                player.canMove = false;
            }
        }
    }
}

class PassiveBehaviour extends Behaviour {
    constructor(animal: Animal, o: WorldObject) {
        super(animal, o);
        // this.animal.getBody().isStatic = true;
    }

    public update(delta: number) {
        // Nothing to do ?
    }

}

const WALL_WIDTH = 50;
class RandomBehaviour extends Behaviour {
    private zone: Rectangle;
    // private walls: AnimalZoneWall[];
    private currentDirection: Direction;
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
        this.lastDecitionMs = 0;
        this.zone = new Rectangle(zone.x,
                                  zone.y,
                                  zone.width,
                                  zone.height);
        this.animal.getBody().setWorldBounds(this.zone);
        this.animal.getBody().onCollideWithBounds(() => this.collideWithBounds());
        this.chooseRandomDirection();
    }

    public update(delta: number) {
        let body = this.animal.getBody();
        let time = window.performance.now();
        if (!this.isTalking && this.lastDecitionMs + this.directionDuration <= time) {
            this.changeWalkDirection(time);
        }
        // Nothing todo ?
        if (!this.isTalking) {
            let vel = getDirectionVector(this.currentDirection, 100);
            body.velocity.copyFrom(vel);
        } else {
            body.velocity.set(0, 0);
        }
    }

    private changeWalkDirection(now: number) {
        this.lastDecitionMs = now;
        this.chooseRandomDirection();
        this.currentAnimation.play();
    }

    private collideWithBounds() {
        this.changeWalkDirection(window.performance.now());
    }

    private chooseRandomDirection() {
        const allowedDirections = this.getAllowedDirectionConsideringZoneBounds();
        const dirIndex = Math.floor(Math.random() * 1000) % allowedDirections.length;

        this.currentDirection = allowedDirections[dirIndex];
        this.directionDuration = Math.random() * 500 + 500;

        const animation = this.animal.getSprite()
            .getAnimation(Direction[this.currentDirection].toLocaleLowerCase());
        this.currentAnimation = animation;
    }

    private getAllowedDirectionConsideringZoneBounds() {
        let allowedDirections = [];
        let body = this.animal.getBody();
        if (body.position.y - this.zone.position.y > 10) {
            allowedDirections.push(Direction.UP);
        }
        if ((this.zone.position.y + this.zone.size.y) - (body.position.y + body.size.y) > 10) {
            allowedDirections.push(Direction.DOWN);
        }
        if (body.position.x - this.zone.position.x > 10) {
            allowedDirections.push(Direction.LEFT);
        }
        if ((this.zone.position.x + this.zone.size.x) - (body.position.x + body.size.x) > 10) {
            allowedDirections.push(Direction.RIGHT);
        }
        return allowedDirections;
    }
}


// Player position
/* export class Player extends GameObject {
    private directions: Direction[];
    private lastDirection: Direction;
    public canMove: boolean;
    private animations: {
        [dir: number]: Animation;
        current: Animation;
    };

constructor(world: World, texture: PIXI.Texture, position: PIXI.Point) {
	let playerPosition = o.player.getPosition;
} */

// alert(playerPosition); <- doesn't work

// FugitiveBehaviour
/* class FugitiveBehaviour extends Behaviour {
    private zone: PIXI.Rectangle;
    private walls: AnimalZoneWall[];
    private currentDirection: Direction;
    private lastDecitionMs: number;
    private directionDuration: number;
    private currentAnimation: Animation;

} */

// JE COMPRENDS RIEN A TON CODE CHOUQUETTE
