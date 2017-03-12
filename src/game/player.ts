const SPEED = 300.0;

enum Direction {
    UP = -Math.PI / 2,
    DOWN = Math.PI / 2,
    RIGHT = 0,
    LEFT = Math.PI,
}
export class Player extends Phaser.Sprite {
    private directions: Direction[];
    private lastDirection: Direction;
    private canMove: boolean;

    constructor(game: Phaser.Game, texture: string, position: Phaser.Point) {
        super(game, 0, 0, texture);
        this.directions = [];
        game.add.existing(this);
        this.anchor.setTo(0.5, 0.5);
        this.position.setTo(position.x, position.y);

        this.animations.currentAnim = this.registerAnimation(Direction.DOWN, [0, 1, 2]);
        this.registerAnimation(Direction.UP, [9, 10, 11]);
        this.registerAnimation(Direction.LEFT, [3, 4, 5]);
        this.registerAnimation(Direction.RIGHT, [6, 7, 8]);

        this.setupControls();
        this.setupPhysics();
        this.debug = true;
        this.canMove = true;
    }

    private setupControls() {
        this.registerKeyDirection(Phaser.Keyboard.RIGHT, Direction.RIGHT);
        this.registerKeyDirection(Phaser.Keyboard.LEFT, Direction.LEFT);
        this.registerKeyDirection(Phaser.Keyboard.UP, Direction.UP);
        this.registerKeyDirection(Phaser.Keyboard.DOWN, Direction.DOWN);
    }

    private registerKeyDirection(keyCode: number, direction: Direction) {
        let key = this.game.input.keyboard.addKey(keyCode);
        key.onDown.add(() => {
            this.directions.push(direction);
        });
        key.onUp.add(() => {
            let index = this.directions.indexOf(direction);
            if (index !== -1) {
                this.directions.splice(index, 1);
            }
        });
    }

    private setupPhysics() {
        this.game.physics.enable(this);
        this.body.collideWorldBounds = true;
        let body = <Phaser.Physics.Arcade.Body> this.body;
        body.setCircle(16, 0, 0);
        // this.debug = true;
    }

    public update(): void {
        if (this.canMove) {
            let velocity: Phaser.Point = this.body.velocity;
            let direction = this.findFreeDirection();
            if (direction !== null) {
                velocity.x = Math.cos(direction) * SPEED;
                velocity.y = Math.sin(direction) * SPEED;

                if (direction !== this.lastDirection) {
                    this.lastDirection = direction;
                    this.animations.currentAnim = this.getWalkAnimation(direction);
                    this.animations.currentAnim.play();
                } else if (!this.animations.currentAnim.isPlaying) {
                    this.animations.currentAnim.play();
                }
            } else {
                velocity.x = velocity.y = 0;
                this.animations.currentAnim.play();
            }
        } else {
            this.animations.currentAnim.stop();
        }
        this.game.debug.body(this, 'rgba(255, 255, 0, 1)');
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

    public setCanMove(canMove: boolean) {
        this.canMove = canMove;
    }

    private findFreeDirection() {
        for (let i = this.directions.length - 1; i >= 0; --i) {
            let direction = this.directions[i];
            if (!this.isDirectionBlocked(direction)) {
                return direction;
            }
        }
        return null;
    }
    private isDirectionBlocked(direction: Direction) {
        let body = <Phaser.Physics.Arcade.Body> this.body;
        let blocked = body.blocked;
        switch (direction) {
        case Direction.UP:
            return blocked.up;
        case Direction.DOWN:
            return blocked.down;
        case Direction.LEFT:
            return blocked.left;
        case Direction.RIGHT:
            return blocked.right;
        }
        return false;
    }
}
