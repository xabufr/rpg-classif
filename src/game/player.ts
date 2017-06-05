import { GameObject } from "./gameObject";
import { AnimatedSprite, Animation } from "../engine/animatedSprite";
import { World } from "../world";
import { Direction } from "./direction";
import { Body } from "../engine/physics";
import keyboardJS = require("keyboardjs");

const SPEED = 300.0;

enum PlayerKeys {
    UP = 38, DOWN = 40, RIGHT = 39, LEFT = 37
}
export class Player extends GameObject {
    private directions: Direction[];
    private lastDirection: Direction;
    public canMove: boolean;
    private animations: {
        [dir: number]: Animation;
        current: Animation;
    };

    constructor(world: World, texture: PIXI.Texture, position: PIXI.Point) {
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


        this.directions = [];
        world.stage.addChild(sprite);
        world.cameraFollow(this);

        this.animations = this.initAnimations();

        this.setupControls();
        this.setupPhysics();
        this.canMove = true;
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
}
