const SPEED = 300.0;

enum Direction {
    UP = -Math.PI / 2,
    DOWN = Math.PI / 2,
    RIGHT = 0,
    LEFT = Math.PI,
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

        this.currentAnimation = this.registerAnimation(Direction.DOWN, [0, 1, 2]);
        this.registerAnimation(Direction.UP, [36, 37, 38]);
        this.registerAnimation(Direction.LEFT, [12, 13, 14]);
        this.registerAnimation(Direction.RIGHT, [24, 25, 26]);

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
        if (this.cursors.up.isDown && !this.body.blocked.up) {
            return Direction.UP;
        } else if (this.cursors.down.isDown && !this.body.blocked.down) {
            return Direction.DOWN;
        } else if (this.cursors.left.isDown && !this.body.blocked.left) {
            return Direction.LEFT;
        } else if (this.cursors.right.isDown && !this.body.blocked.right) {
            return Direction.RIGHT;
        }
        return null;
    }

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
}