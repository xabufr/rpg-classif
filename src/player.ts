const SPEED = 300.0;

enum Direction {
    UP = -Math.PI / 2,
    DOWN = Math.PI / 2,
    RIGHT = 0,
    LEFT = Math.PI,
    UP_RIGHT = Math.PI / 4,
    UP_LEFT = 3 * Math.PI / 4,
    DOWN_LEFT = 5 * Math.PI / 4,
    DOWN_RIGHT = 7 * Math.PI / 4,
}
export class Player extends Phaser.Sprite {
    private cursors: Phaser.CursorKeys;
    private direction: Direction;
    private currentAnimation: Phaser.Animation;

    constructor(game: Phaser.Game, texture: string, position: Phaser.Point) {
        super(game, 0, 0, texture);
        this.direction = Direction.DOWN;
        game.add.existing(this);
        this.position = position.add(-this.width / 2, -this.height / 2);

        this.currentAnimation = this.registerAnimation("walk-down", [0, 1, 2]);
        this.registerAnimation("walk-up", [36, 37, 38]);
        this.registerAnimation("walk-left", [12, 13, 14]);
        this.registerAnimation("walk-right", [24, 25, 26]);
        this.registerAnimation("walk-up-left", [15, 16, 17]);
        this.registerAnimation("walk-up-right", [39, 40, 41]);
        this.registerAnimation("walk-down-left", [3, 4, 5]);
        this.registerAnimation("walk-down-right", [27, 28, 29]);

        this.setupControls();
        this.setupPhysics();
        this.debug = true;
    }

    private setupControls() {
        this.cursors = this.game.input.keyboard.createCursorKeys();
    }

    private setupPhysics() {
        this.game.physics.enable(this);
        this.body.collideWorldBounds = true;
    }

    public update(): void {
        let velocity: Phaser.Point = this.body.velocity;
        let newDirection = this.computeNewDirection();
        if (newDirection !== null) {
            velocity.x = Math.cos(newDirection) * SPEED;
            velocity.y = Math.sin(newDirection) * SPEED;

            let isMoving = (velocity.x !== 0 || velocity.y !== 0);

            if (newDirection !== this.direction) {
                this.direction = newDirection;
                this.currentAnimation = this.getWalkAnimation(newDirection);
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
    }

    private computeNewDirection() {
        let newDirection: Direction = null;
        if (this.cursors.up.isDown && !this.body.blocked.up) {
            newDirection = Direction.UP;
        } else if (this.cursors.down.isDown && !this.body.blocked.down) {
            newDirection = Direction.DOWN;
        }

        if (this.cursors.left.isDown && !this.body.blocked.left) {
            if (newDirection === Direction.UP) {
                newDirection = Direction.UP_LEFT;
            } else if (newDirection === Direction.DOWN) {
                newDirection = Direction.DOWN_LEFT;
            } else {
                newDirection = Direction.LEFT;
            }
        } else if (this.cursors.right.isDown && !this.body.blocked.right) {
            if (newDirection === Direction.UP) {
                newDirection = Direction.UP_RIGHT;
            } else if (newDirection === Direction.DOWN) {
                newDirection = Direction.DOWN_RIGHT;
            } else {
                newDirection = Direction.RIGHT;
            }
        }
        return newDirection;
    }

    private getWalkAnimation(direction: Direction) {
        switch (direction) {
        case Direction.UP:
            return this.animations.getAnimation("walk-up");
        case Direction.DOWN:
            return this.animations.getAnimation("walk-down");
        case Direction.LEFT:
            return this.animations.getAnimation("walk-left");
        case Direction.RIGHT:
            return this.animations.getAnimation("walk-right");
        case Direction.UP_RIGHT:
            return this.animations.getAnimation("walk-up-right");
        case Direction.UP_LEFT:
            return this.animations.getAnimation("walk-up-left");
        case Direction.DOWN_RIGHT:
            return this.animations.getAnimation("walk-down-right");
        case Direction.DOWN_LEFT:
            return this.animations.getAnimation("walk-down-left");
        }
        return null;
    }

    private registerAnimation(name: string, indexes: number[]) {
        let anim = this.animations.add(name, indexes, 10, true);
        return anim;
    }

    public collide() {
        // this.body.velocity.setTo(0, 0);
    }
}
