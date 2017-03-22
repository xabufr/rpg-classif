import { AnimatedSprite } from "../engine/animatedSprite";
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

    constructor(private world: World, texture: PIXI.Texture, position: PIXI.Point) {
        this.directions = [];

        this.sprite = new AnimatedSprite(texture, {
            frameWidth: 24,
            frameHeight: 32
        }, [{
            name: "up",
            frames: [
                {x: 1, y: 1}
            ]
        }]);
        world.stage.addChild(this.sprite);
        world.cameraFollow(this.sprite);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.position.set(position.x, position.y);

        // this.animations.currentAnim = this.registerAnimation(Direction.DOWN, [0, 1, 2]);
        // this.registerAnimation(Direction.UP, [9, 10, 11]);
        // this.registerAnimation(Direction.LEFT, [3, 4, 5]);
        // this.registerAnimation(Direction.RIGHT, [6, 7, 8]);

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
                velocity.x = Math.cos(direction) * SPEED;
                velocity.y = Math.sin(direction) * SPEED;

                // if (direction !== this.lastDirection) {
                //     this.lastDirection = direction;
                //     this.animations.currentAnim = this.getWalkAnimation(direction);
                //     this.animations.currentAnim.play();
                // } else if (!this.animations.currentAnim.isPlaying) {
                //     this.animations.currentAnim.play();
                // }
            } else {
                velocity.x = velocity.y = 0;
                // this.animations.currentAnim.stop();
            }
        } else {
            // this.animations.currentAnim.stop();
        }
        this.sprite.position.x += velocity.x * 0.1;
        this.sprite.position.y += velocity.y * 0.1;
        // this.game.debug.body(this, 'rgba(255, 255, 0, 1)');
    }

    // private getWalkAnimation(direction: Direction) {
    //     let name = Direction[direction];
    //     return this.animations.getAnimation(name);
    // }

    // private registerAnimation(direction: Direction, indexes: number[]) {
    //     let name = Direction[direction];
    //     let anim = this.animations.add(name, indexes, 10, true);
    //     return anim;
    // }

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
