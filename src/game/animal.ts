import { Pnj } from "./pnj";
import { WorldObject } from "./worldObject";
import { GameState } from "../game.state";
import { Player } from "./player";

type BehaviourString = "passive" | "follower" | "fugitive" | "random";

export class Animal extends Pnj {
    private behaviour: Behaviour;
    constructor(o: WorldObject, gameState: GameState) {
        super(o, gameState, o.properties.textureName, 1);
        this.position.setTo(o.x, o.y);
        this.game.add.existing(this);
        this.game.physics.arcade.enable(this);
        this.behaviour = this.createBehaviour();
        this.behaviour.setup();
    }

    public updateForPlayer(player: Player) {
        this.game.physics.arcade.collide(player, this);
        this.behaviour.updateForPlayer(player);
    }

    private createBehaviour(): Behaviour {
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
    protected body: Phaser.Physics.Arcade.Body;
    constructor(protected animal: Animal, protected worldObject: WorldObject) {
        this.body = animal.body;
    }

    public abstract updateForPlayer(player: Player): void;
    public abstract setup(): void;
}

class PassiveBehaviour extends Behaviour {
    constructor(animal: Animal, o: WorldObject) {
        super(animal, o);
    }

    public setup() {
        this.body.immovable = true;
    }

    public updateForPlayer(player: Player) {
        // Nothing todo ?
    }
}

class RandomBehavious extends Behaviour {
    constructor(animal: Animal, o: WorldObject) {
        super(animal, o);
    }

    public setup() {
        let zoneName = this.worldObject.properties.zone;
    }

    public updateForPlayer(player: Player) {
        // Nothing todo ?
    }
}
