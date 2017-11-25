import { GameObject } from "./gameObject";
import { Player } from "./player";
import { Pnj } from "./pnj";
import { WorldObject } from "./worldObject";
import { Direction, Directions, getDirectionVector } from "./direction";
import { Body, Rectangle, IVector, Vector } from "../engine/physics";
import { Animation } from "../engine/animatedSprite";

export abstract class Behaviour {
    protected canDoAction: boolean;
    protected isInAction: boolean;
    protected lastActionMs: number;

    constructor(protected pnj: Pnj, protected worldObject: WorldObject, private collideCooldown: number) {
        this.canDoAction = true;
        this.isInAction = false;
        this.lastActionMs = -collideCooldown;
    }

    public abstract update(delta: number): void;

    public canEnterInActionNow() {
        let time = window.performance.now();
        return !this.isInAction && this.canDoAction && time >= this.lastActionMs + this.collideCooldown;
    }

    public onCollisionStart(other: GameObject) {
        if (other.type === "player" && this.canEnterInActionNow()) {
            this.isInAction = true;
            this.pnj.interactWithPlayer()
                .then(() => {
                    this.isInAction = false;
                    this.lastActionMs = performance.now();
                    this.afterTalk();
                });
        }
    }

    protected afterTalk(): void {
    }
}

export class PassiveBehaviour extends Behaviour {
    constructor(pnj: Pnj, o: WorldObject, collideCooldown: number) {
        super(pnj, o, collideCooldown);
    }

    public update(delta: number) {
        // Nothing to do ?
    }

}

export class RandomBehaviour extends Behaviour {
    protected zone: Rectangle;
    protected currentDirection: Direction;
    protected lastDecitionMs: number;
    protected directionDuration: number;
    protected currentAnimation: Animation;

    constructor(pnj: Pnj, o: WorldObject, collideCooldown: number) {
        super(pnj, o, collideCooldown);
        if (!this.worldObject.properties || !this.worldObject.properties.zone) {
            throw `Missing zone for pnj ${this.worldObject.name}`;
        }
        let zoneName = this.worldObject.properties.zone;
        let zone = this.pnj.getWorld().getMap().getZoneNamed(zoneName);
        this.lastDecitionMs = 0;
        this.zone = new Rectangle(zone.x,
                                  zone.y,
                                  zone.width,
                                  zone.height);
        this.pnj.getBody().setWorldBounds(this.zone);
        this.pnj.getBody().onCollideWithBounds(() => this.collideWithBounds());
        this.chooseRandomDirection();
    }

    public update(delta: number) {
        let body = this.pnj.getBody();
        let time = window.performance.now();
        if (!this.isInAction && this.lastDecitionMs + this.directionDuration <= time) {
            this.changeWalkDirection(time);
        }
        // Nothing todo ?
        if (!this.isInAction) {
            let vel = getDirectionVector(this.currentDirection, 100);
            body.velocity.copyFrom(vel);
        } else {
            body.velocity.set(0, 0);
        }
    }

    protected changeWalkDirection(now: number) {
        this.lastDecitionMs = now;
        this.chooseRandomDirection();
        this.currentAnimation.play();
    }

    protected collideWithBounds() {
        this.changeWalkDirection(window.performance.now());
    }

    protected chooseRandomDirection() {
        const allowedDirections = this.getAllowedDirectionConsideringZoneBounds();
        const dirIndex = Math.floor(Math.random() * 1000) % allowedDirections.length;

        this.currentDirection = allowedDirections[dirIndex];
        this.directionDuration = Math.random() * 500 + 500;

        this.setAnimation(this.currentDirection);
    }

    protected setAnimation(direction: Direction) {
        const animation = this.pnj.getSprite()
            .getAnimation(Direction[direction].toLocaleLowerCase());
        this.currentAnimation = animation;
    }

    protected getAllowedDirectionConsideringZoneBounds() {
        let allowedDirections = [];
        let body = this.pnj.getBody();
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


export class RandomAggressiveBehaviour extends RandomBehaviour {
    protected currentVelocity: number;
    protected readonly withPlayerVelocity: number;
    protected readonly standbyVelocity: number;

    public constructor(pnj: Pnj,
                       o: WorldObject,
                       collideCooldown: number,
                       standbyVelocity: number,
                       withPlayerVelocity: number) {
        super(pnj, o, collideCooldown);
        this.standbyVelocity = standbyVelocity;
        this.withPlayerVelocity = withPlayerVelocity;
    }

    public update(delta: number) {
        let player = this.pnj.getPlayer();
        let playerBody = <Body> player.getBody();
        let body = this.pnj.getBody();

        if (!this.isInAction) {
            if (this.zone.intersects(playerBody)) {
                this.goToPlayer();
                this.currentVelocity = this.withPlayerVelocity;
            } else {
                let time = window.performance.now();
                if (this.lastDecitionMs + this.directionDuration <= time) {
                    this.changeWalkDirection(time);
                }
                this.currentVelocity = this.standbyVelocity;
            }
            let vel = getDirectionVector(this.currentDirection, this.currentVelocity);
            body.velocity.copyFrom(vel);
        } else {
            body.velocity.set(0, 0);
        }
    }

    protected goToPlayer() {
        let player = this.pnj.getPlayer();
        let playerBody = <Body> player.getBody();
        let body = this.pnj.getBody();

        this.lastDecitionMs = 0;
        let thisCenter = body.position.plus(body.size.mult(0.5));
        let playerCenter = playerBody.position.plus(playerBody.size.mult(0.5));
        let diff = thisCenter.minus(playerCenter);

        let oldDirection = this.currentDirection;

        if (Math.abs(diff.x) > body.size.x / 2) {
            if (diff.x > 0) {
                this.currentDirection = Direction.LEFT;
            } else {
                this.currentDirection = Direction.RIGHT;
            }
        } else if (Math.abs(diff.y) > body.size.y / 2) {
            if (diff.y > 0) {
                this.currentDirection = Direction.UP;
            } else {
                this.currentDirection = Direction.DOWN;
            }
        }
        if (this.currentDirection !== oldDirection) {
            this.setAnimation(this.currentDirection);
            this.currentAnimation.play();
        }
    }
}

export class RandomItemRequiredBehaviour extends RandomAggressiveBehaviour {
    private readonly itemName: string;
    private hasItem: boolean;
    private hasTalk: boolean;

    public constructor(pnj: Pnj,
                       o: WorldObject,
                       collideCooldown: number,
                       standbyVelocity: number,
                       withPlayerVelocity: number) {
        super(pnj, o, collideCooldown, standbyVelocity, withPlayerVelocity);
        if (!o.properties || !o.properties.itemName) {
            throw `Missing itemName in ${JSON.stringify(o)}`;
        }
        this.itemName = o.properties.itemName;
        this.hasItem = false;
        this.hasTalk = false;
    }

    public update(delta: number) {
        let player = this.pnj.getPlayer();
        let playerBody = <Body> player.getBody();
        let body = this.pnj.getBody();

        if (!this.isInAction) {
            if (this.zone.intersects(playerBody)) {
                this.updateHasItem(player);
                if (this.hasItem && !this.hasTalk) {
                    this.currentVelocity = this.withPlayerVelocity;
                    this.goToPlayer();
                } else if (!this.hasItem) {
                    this.currentVelocity = this.withPlayerVelocity;
                    this.fearPlayer(player);
                }
            } else {
                let time = window.performance.now();
                if (this.lastDecitionMs + this.directionDuration <= time) {
                    this.changeWalkDirection(time);
                }
                this.currentVelocity = this.standbyVelocity;
            }
            let vel = getDirectionVector(this.currentDirection, this.currentVelocity);
            body.velocity.copyFrom(vel);
        } else {
            body.velocity.set(0, 0);
        }
    }

    private fearPlayer(player: Player) {
        this.lastDecitionMs = 0;

        let oldDirection = this.currentDirection;
        this.currentDirection = this.getBestDirection(player);
        if (this.currentDirection !== oldDirection) {
            this.setAnimation(this.currentDirection);
            this.currentAnimation.play();
        }
    }

    private getBestDirection(player: Player) {
        let body = this.pnj.getBody();
        let thisCenter = body.position.plus(body.size.mult(0.5));
        let destination = this.getBestDestination(player);
        let diffDest = thisCenter.minus(destination);

        if (Math.abs(diffDest.x) > body.size.x) {
            if (diffDest.x > 0) {
                return Direction.LEFT;
            } else {
                return Direction.RIGHT;
            }
        } else if (Math.abs(diffDest.y) > body.size.y * 1/2) {
            if (diffDest.y > 0) {
                return Direction.UP;
            } else {
                return Direction.DOWN;
            }
        }
        return Direction.DOWN;
    }

    private getBestDestination(player: Player) {
        let topLeft = this.zone.position.plus(this.zone.size.mult(1/4));
        let topRight = this.zone.position.plus({
            x: this.zone.size.x * 3 / 4,
            y: this.zone.size.y * 1 / 4,
        });
        let bottomLeft = this.zone.position.plus({
            x: this.zone.size.x * 1 / 4,
            y: this.zone.size.y * 3 / 4,
        });
        let bottomRight = this.zone.position.plus(this.zone.size.mult(3/4));

        // |0|1|
        // |3|2|
        let squaresDist = [
            topLeft, topRight,
            bottomRight, bottomLeft
        ].map((p, i) => {
            return  {
                value: p.distSquare(player.getPosition()),
                index: i
            };
        });
        let min = squaresDist.reduce((previous, current, index) => {
            if (previous.value > current.value) {
                return current;
            }
            return previous;
        }, {
            index: -1,
            value: 9999999
        }).index;
        let dest = (min + 2) % 4;
        if (dest === 0) {
            return this.zone.position;
        } else if (dest === 1) {
            return this.zone.position.plus({
                x: this.zone.size.x,
                y: 0
            });
        } else if (dest === 2) {
            return this.zone.position.plus(this.zone.size);
        } else {
            return this.zone.position.plus({
                x: 0,
                y: this.zone.size.y
            });
        }
    }

    private updateHasItem(player: Player) {
        if (!this.hasItem) {
            this.hasItem = player.hasItem(this.itemName);
        }
    }

    protected afterTalk(): void {
        this.hasTalk = true;
        console.log("After talk");
    }

    public canEnterInActionNow() {
        return this.hasItem && super.canEnterInActionNow();
    }
}
