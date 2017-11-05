import { GameObject } from "./gameObject";
import { Player } from "./player";
import { Pnj } from "./pnj";
import { WorldObject } from "./worldObject";
import { Direction, Directions, getDirectionVector } from "./direction";
import { Body, Rectangle, IVector } from "../engine/physics";
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
                });
        }
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
    private currentVelocity: number;
    private readonly withPlayerVelocity: number;
    private readonly standbyVelocity: number;

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

    private goToPlayer() {
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