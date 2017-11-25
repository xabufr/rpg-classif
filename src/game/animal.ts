import { SpritesheetDefinition } from "../engine/animatedSprite";
import { Pnj } from "./pnj";
import { Animation } from "../engine/animatedSprite";
import { WorldObject } from "./worldObject";
import { World } from "../world";
import { Player, SPEED as PlayerSpeed } from "./player";
import { Direction, Directions, getDirectionVector } from "./direction";
import { GameObject } from "./gameObject";
import { Rectangle, IVector } from "../engine/physics";
import { Behaviour, RandomBehaviour, PassiveBehaviour, RandomItemRequiredBehaviour } from "./behaviour";

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

const TALK_COOLDOWN = 1000;
export class Animal extends Pnj {
    public readonly talk: string;
    public readonly bestiaryIndex: IVector;

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
        if (o.properties.bestiary_x === undefined || o.properties.bestiary_y === undefined) {
            throw `Missing bestiary index for animal ${o.name} (${JSON.stringify(o.properties)})`;
        }
        this.bestiaryIndex = {
            x: o.properties.bestiary_x,
            y: o.properties.bestiary_y,
        };
        let dialogKey: string = o.properties.talk;
        let dialogData = resources["dialogs"].data[dialogKey];
        if (!dialogData || !dialogData.text) {
            throw `Missing dialog ${dialogKey} for animal ${this.name}`;
        }
        this.talk = dialogData.text;
        this.behaviour = this.createBehaviour();
    }

    public getBestiaryIndex() {
        return this.bestiaryIndex;
    }

    public interactWithPlayer(): Promise<void> {
        return new Promise(resolve => {
            let isTalking = this.getWorld()
                .getHud()
                .getMonologDialog()
                .showTextToPlayer(this.talk, () => {
                    this.player.canMove = true;
                    this.player.animalMet(this);
                    resolve();
                });
            if (isTalking) {
                this.player.canMove = false;
            } else {
                resolve();
            }
        });
    }

    private createBehaviour(): Behaviour {
        if (!this.worldObject.properties || !this.worldObject.properties.behaviour) {
            throw `Missing behaviour on animal ${this.worldObject.name}`;
        }
        switch (<BehaviourString> this.worldObject.properties.behaviour) {
        case "passive":
            return new PassiveBehaviour(this, this.worldObject, TALK_COOLDOWN);
        case "follower":
            // return BehaviourType.Follower;
        case "fugitive":
            return new RandomItemRequiredBehaviour(this, this.worldObject, TALK_COOLDOWN, 100, PlayerSpeed * 2);
            // return BehaviourType.Fugitive;
        case "random":
            return new RandomBehaviour(this, this.worldObject, TALK_COOLDOWN);
        }
        throw `Unknown behaviour ${this.worldObject.properties.behaviour}`;
    }
}

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
