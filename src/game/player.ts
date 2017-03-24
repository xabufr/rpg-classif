import { AnimatedSprite, Animation } from "../engine/animatedSprite";
import { World } from "../world";
const SPEED = 300.0;

// let listener = new window.keypress.Listener();
enum PlayerKeys {
    UP = 38, DOWN = 40, RIGHT = 39, LEFT = 37
}
export enum Direction {
    UP = -Math.PI / 2,
    DOWN = Math.PI / 2,
    RIGHT = 0,
    LEFT = Math.PI,
}
export class Player {
    private sprite: AnimatedSprite;
    private directions: Direction[];
    private lastDirection: Direction;
    private canMove: boolean;
    private body: Matter.Body;
    private animations: {
        [dir: number]: Animation;
        current: Animation;
    };

    constructor(private world: World, texture: PIXI.Texture, position: PIXI.Point) {
        this.directions = [];

        this.sprite = new AnimatedSprite(texture, {
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
        }]);
        this.body = Matter.Bodies.circle(position.x, position.y, 12);
        Matter.World.add(this.world.engine.world, [this.body]);
        world.stage.addChild(this.sprite);
        world.cameraFollow(this.sprite);
        // this.sprite.anchor.set(0.5, 0.5);
        // this.sprite.position.set(position.x, position.y);

        this.animations = this.initAnimations();

        this.setupControls();
        this.setupPhysics();
        this.canMove = true;
        console.log(this.sprite);
    }

    private setupControls() {
        this.registerKeyDirection("right", Direction.RIGHT);
        this.registerKeyDirection("left", Direction.LEFT);
        this.registerKeyDirection("up", Direction.UP);
        this.registerKeyDirection("down", Direction.DOWN);
    }

    private initAnimations() {
        let down = this.sprite.getAnimation("down");
        return {
            [Direction.DOWN]: down,
            [Direction.UP]: this.sprite.getAnimation("up"),
            [Direction.RIGHT]: this.sprite.getAnimation("right"),
            [Direction.LEFT]: this.sprite.getAnimation("left"),
            current: down
        };
    }

    private registerKeyDirection(key: string, direction: Direction) {
        keyboardJS.bind(key, e => {
            if (this.canMove) {
                this.directions.push(direction);
            }
            if(e) {
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

    public update(): void {
        let velocity = new PIXI.Point();
        if (this.canMove) {
            let direction = this.findFreeDirection();
            if (direction !== null) {
                velocity.x = Math.cos(direction) * SPEED / 100;
                velocity.y = Math.sin(direction) * SPEED / 100;

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
            this.animations.current.stop();
        }
        // this.body.velocity.x = velocity.x;
        // this.body.velocity.y = velocity.y;
        this.body.speed = 10;
        Matter.Body.setVelocity(this.body, velocity);
        this.sprite.position.x = this.body.position.x;
        this.sprite.position.y = this.body.position.y;
        // this.sprite.position.x += velocity.x * 0.1;
        // this.sprite.position.y += velocity.y * 0.1;
        // this.game.debug.body(this, 'rgba(255, 255, 0, 1)');
    }

    private registerAnimation(direction: Direction, name: string, dico: any) {
        let anim = this.sprite.getAnimation(name);
        dico[direction] = anim;
        return anim;
    }

    // public collide() {
        // this.body.velocity.setTo(0, 0);
    // }

    // public setCanMove(canMove: boolean) {
    //     this.canMove = canMove;
    //     if (!this.canMove) {
    //         this.directions = [];
    //         let velocity: Phaser.Point = this.body.velocity;
    //         velocity.x = velocity.y = 0;
    //     }
    // }

    private findFreeDirection() {
        if (this.directions.length > 0) {
            return this.directions[this.directions.length - 1];
        }
        // for (let i = this.directions.length - 1; i >= 0; --i) {
            // let direction = this.directions[i];
            // if (!this.isDirectionBlocked(direction)) {
                // return direction;
            // }
        // }
        return null;
    }
    // private isDirectionBlocked(direction: Direction) {
        // let body = <Phaser.Physics.Arcade.Body> this.body;
        // let blocked = body.blocked;
        // switch (direction) {
        // case Direction.UP:
        //     return blocked.up;
        // case Direction.DOWN:
        //     return blocked.down;
        // case Direction.LEFT:
        //     return blocked.left;
        // case Direction.RIGHT:
        //     return blocked.right;
        // }
        // return false;
    // }

    // public goBack(count: number) {
        // let angle = this.lastDirection + Math.PI;
        // angle = Phaser.Math.radToDeg(angle);
        // (<Phaser.Physics.Arcade.Body> this.body).moveTo(50, count, angle);
    // }
}
