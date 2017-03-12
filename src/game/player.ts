const SPEED = 300.0;

enum Direction {
    UP = -Math.PI / 2,
    DOWN = Math.PI / 2,
    RIGHT = 0,
    LEFT = Math.PI,
}
export class Player extends Phaser.Sprite {
    // private cursors: Phaser.CursorKeys;
    private direction: Direction;
    private lastDirection: Direction;
    private currentAnimation: Phaser.Animation;
    private canMove: boolean;

    constructor(game: Phaser.Game, texture: string, position: Phaser.Point) {
        super(game, 0, 0, texture);
        this.direction = null;
        game.add.existing(this);
        this.anchor.setTo(0.5, 0.5);
        this.position.setTo(position.x, position.y);

        this.currentAnimation = this.registerAnimation(Direction.DOWN, [0, 1, 2]);
        this.registerAnimation(Direction.UP, [9, 10, 11]);
        this.registerAnimation(Direction.LEFT, [3, 4, 5]);
        this.registerAnimation(Direction.RIGHT, [6, 7, 8]);

        this.setupControls();
        this.setupPhysics();
        this.debug = true;
        this.canMove = true;
    }

    private setupControls() {
        // this.cursors = this.game.input.keyboard.createCursorKeys();
        let stack: Direction[] = [];
        this.registerKeyDirection(Phaser.Keyboard.RIGHT, Direction.RIGHT, stack);
        this.registerKeyDirection(Phaser.Keyboard.LEFT, Direction.LEFT, stack);
        this.registerKeyDirection(Phaser.Keyboard.UP, Direction.UP, stack);
        this.registerKeyDirection(Phaser.Keyboard.DOWN, Direction.DOWN, stack);
    }

    private registerKeyDirection(keyCode: number, direction: Direction, stack: Direction[]) {
        let key = this.game.input.keyboard.addKey(keyCode);
        key.onDown.add(() => {
            this.direction = direction;
            stack.push(direction);
        });
        key.onUp.add(() => {
            let index = stack.indexOf(direction);
            if (index !== -1) {
                stack.splice(index, 1);
            }
            if (this.direction === direction) {
                if (stack.length === 0) {
                    this.direction = null;
                } else {
                    this.direction = stack[stack.length - 1];
                }
            }
        });
    }

    private setupPhysics() {
        this.game.physics.enable(this);
        this.body.collideWorldBounds = true;
    }

    public update(): void {
        if (this.canMove) {
            let velocity: Phaser.Point = this.body.velocity;
            if (this.direction !== null) {
                velocity.x = Math.cos(this.direction) * SPEED;
                velocity.y = Math.sin(this.direction) * SPEED;

                let isMoving = (velocity.x !== 0 || velocity.y !== 0);

                if (this.direction !== this.lastDirection) {
                    this.lastDirection = this.direction;
                    this.currentAnimation = this.getWalkAnimation(this.direction);
                    this.currentAnimation.play();
                } else if (!isMoving) {
                    this.currentAnimation.stop();
                } else if (!this.currentAnimation.isPlaying) {
                    this.currentAnimation.play();
                }
            } else {
                velocity.x = velocity.y = 0;
                this.currentAnimation.play();
            }
        } else {
            this.currentAnimation.stop();
        }
    }

    // private computeNewDirection() {
    //     if (this.cursors.up.isDown && !this.body.blocked.up) {
    //         return Direction.UP;
    //     } else if (this.cursors.down.isDown && !this.body.blocked.down) {
    //         return Direction.DOWN;
    //     } else if (this.cursors.left.isDown && !this.body.blocked.left) {
    //         return Direction.LEFT;
    //     } else if (this.cursors.right.isDown && !this.body.blocked.right) {
    //         return Direction.RIGHT;
    //     }
    //     return null;
    // }

    private getWalkAnimation(direction: Direction) {
        let name = Direction[direction];
        return this.animations.getAnimation(name);
    }

    private registerAnimation(direction: Direction, indexes: number[]) {
        let name = Direction[direction];
        let anim = this.animations.add(name, indexes, 10, true);
        return anim;
    }

    public collide() {
        // this.body.velocity.setTo(0, 0);
    }

    public setCanMove(canMove: boolean) {
        this.canMove = canMove;
    }
}
