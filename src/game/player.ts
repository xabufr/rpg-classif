import { GameObject } from "./gameObject";
import { AnimatedSprite, Animation } from "../engine/animatedSprite";
import { World } from "../world";
import { Direction } from "./direction";
import { Body } from "../engine/physics";
import Matter = require("matter-js");
import keyboardJS = require("keyboardjs");

const SPEED = 300.0;

// let listener = new window.keypress.Listener();
enum PlayerKeys {
    UP = 38, DOWN = 40, RIGHT = 39, LEFT = 37
}
export class Player extends GameObject {
    private directions: Direction[];
    private lastDirection: Direction;
    private body2: Body;
    public canMove: boolean;
    private animations: {
        [dir: number]: Animation;
        current: Animation;
    };

    constructor(world: World, texture: PIXI.Texture, position: PIXI.Point) {
        let body = Matter.Bodies.circle(position.x, position.y, 12);
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
        sprite.anchor.set(0.5, 0.5);
        super("player", world, null, sprite);

        this.body2 = new Body();
        this.body2.position.x = position.x;
        this.body2.position.y = position.y;
        this.body2.size.x = 2;
        this.body2.size.y = 2;

        this.directions = [];
        world.stage.addChild(sprite);
        world.cameraFollow(this);

        this.animations = this.initAnimations();

        this.setupControls();
        this.setupPhysics();
        this.canMove = true;
        world.physics.addBody(this.body2);
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

    private setupPhysics() {
        // this.game.physics.enable(this);
        // this.body.collideWorldBounds = true;
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
        // let body = <Matter.Body> this.body;
        // Matter.Body.setVelocity(body, velocity);
        this.body2.velocity.x = velocity.x;
        this.body2.velocity.y = velocity.y;
        if (this.sprite) {
            this.sprite.position.set(this.body2.position.x,
                                     this.body2.position.y);
        }
        // super.update(delta);
    }

    private registerAnimation(direction: Direction, name: string, dico: any) {
        let anim = (<AnimatedSprite>this.sprite).getAnimation(name);
        dico[direction] = anim;
        return anim;
    }

    public getPosition() {
        // return (<Matter.Body> this.body).position;
        return this.body2.position;
    }

    private findFreeDirection() {
        if (this.directions.length > 0) {
            return this.directions[this.directions.length - 1];
        }
        return null;
    }
}
