import { GameObject } from "./gameObject";
import { AnimatedSprite, Animation } from "../engine/animatedSprite";
import { World } from "../world";
import { Direction } from "./direction";
import { Body } from "../engine/physics";
import { Tween } from "es6-tween/src/index.lite";
import { Animal } from "./animal";
import keyboardJS = require("keyboardjs");

export const SPEED = 300.0;

enum PlayerKeys {
    UP = 38, DOWN = 40, RIGHT = 39, LEFT = 37
}

export type PlayerEvents = "life-changed" | "animal-met";

export class Player extends GameObject {
    private directions: Direction[];
    private lastDirection: Direction;
    private lives: number;
    private maxLives: number;
    public canMove: boolean;
    private listeners: {
        [eventName: string]: ((player: Player) => void)[];
    };
    private metAnimals: Animal[];
    private animations: {
        [dir: number]: Animation;
        current: Animation;
    };
    private collectedObjects: string[];

    constructor(world: World, texture: PIXI.Texture, position: PIXI.Point, lives: number, maxLives: number) {
        let body = new Body();
        body.position.x = position.x;
        body.position.y = position.y;
        body.size.x = 24;
        body.size.y = 26;
        let sprite = new AnimatedSprite(texture, {
            frameWidth: 24,
            frameHeight: 32
        }, [{
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
        }]);
        super("player", world, body, sprite);

        this.listeners = {
            "life-changed": [],
            "animal-met": [],
        };
        this.collectedObjects = [];
        this.lives = lives;
        this.directions = [];
        this.maxLives = maxLives;
        this.metAnimals = [];
        world.stage.addChild(sprite);
        world.cameraFollow(this);

        this.animations = this.initAnimations();

        this.setupControls();
        this.canMove = true;
    }

    public addLife(): boolean {
        if (this.lives < this.maxLives) {
            ++this.lives;
            this.fire("life-changed");
            return true;
        }
        return false;
    }

    public removeLife() {
        if (this.lives != 0 && --this.lives == 0) {
            this.canMove = false;
            let sprite = <AnimatedSprite> this.sprite;
            new Tween(sprite)
                .to({alpha: 0}, 1000)
                .start()
                .onComplete(() => this.world.getHud().gameOver());
        }
        this.fire("life-changed");
    }

    public getLives() {
        return this.lives;
    }

    public getMaxLives() {
        return this.maxLives;
    }

    public on(event: PlayerEvents, cb: () => void) {
        this.listeners[event].push(cb);
    }

    private fire(event: PlayerEvents) {
        const listeners = this.listeners[event];
        if (listeners) {
            listeners.forEach(cb => cb(this));
        }
    }

    private setupControls() {
        this.registerKeyDirection("right", Direction.RIGHT);
        this.registerKeyDirection("left", Direction.LEFT);
        this.registerKeyDirection("up", Direction.UP);
        this.registerKeyDirection("down", Direction.DOWN);
    }

    private initAnimations() {
        let sprite = (<AnimatedSprite>this.sprite);
        let down = sprite.getAnimation("down");
        return {
            [Direction.DOWN]: down,
            [Direction.UP]: sprite.getAnimation("up"),
            [Direction.RIGHT]: sprite.getAnimation("right"),
            [Direction.LEFT]: sprite.getAnimation("left"),
            current: down
        };
    }

    private registerKeyDirection(key: string, direction: Direction) {
        keyboardJS.bind(key, e => {
            if (this.canMove) {
                this.directions.push(direction);
            }
            if (e) {
                e.preventRepeat();
            }
        }, () => {
            let index = this.directions.indexOf(direction);
            if (index !== -1) {
                this.directions.splice(index, 1);
            }
        });
    }

    public update(delta: number): void {
        let velocity = new PIXI.Point();
        if (this.canMove) {
            let direction = this.findFreeDirection();
            if (direction !== null) {
                velocity.x = Math.cos(direction) * SPEED;
                velocity.y = Math.sin(direction) * SPEED;

                if (direction !== this.lastDirection) {
                    this.lastDirection = direction;
                    this.animations.current = this.animations[direction];
                    this.animations.current.play();
                } else if (!this.animations.current.isPlaying) {
                    this.animations.current.play();
                }
            } else {
                velocity.x = velocity.y = 0;
                this.animations.current.stop();
            }
        } else {
            velocity.x = velocity.y = 0;
            this.animations.current.stop();
        }
        let sprite = <AnimatedSprite> this.sprite;
        let body = <Body> this.body;
        body.velocity.x = velocity.x;
        body.velocity.y = velocity.y;
        if (this.sprite) {
            this.sprite.position.set(body.position.x,
                                     body.position.y);
        }
        super.update(delta);
    }

    private registerAnimation(direction: Direction, name: string, dico: any) {
        let anim = (<AnimatedSprite>this.sprite).getAnimation(name);
        dico[direction] = anim;
        return anim;
    }

    public getPosition() {
        return (<Body> this.body).position;
    }

    private findFreeDirection() {
        if (this.directions.length > 0) {
            return this.directions[this.directions.length - 1];
        }
        return null;
    }

    public animalMet(animal: Animal) {
        if (this.metAnimals.indexOf(animal) === -1) {
            this.metAnimals.push(animal);
            this.fire("animal-met");
        }
    }

    public getMetAnimals() {
        return this.metAnimals;
    }

    public addCollectedObject(itemName: string) {
        this.collectedObjects.push(itemName);
    }

    public hasItem(itemName: string) {
        return this.collectedObjects.indexOf(itemName) !== -1;
    }
}
