const SPEED = 250.0;

export class Player extends Phaser.Sprite {
    private cursors: Phaser.CursorKeys;
    constructor(game: Phaser.Game, texture: string) {
        super(game, 0, 0, texture);
        game.add.existing(this);
        this.position.set(50, 50);

        this.setupControls();
        this.setupPhysics();
        this.debug = true;
    }

    private setupControls() {
        this.cursors = this.game.input.keyboard.createCursorKeys();
    }

    private setupPhysics() {
        this.game.physics.enable(this);
    }

    public update(): void {
        let velocity: Phaser.Point = this.body.velocity;
        if (this.cursors.left.isDown) {
            velocity.x = SPEED * -1.0;
        } else if (this.cursors.right.isDown) {
            velocity.x = SPEED;
        } else {
            velocity.x = 0;
        }

        if (this.cursors.up.isDown) {
            velocity.y = SPEED * -1.0;
        } else if (this.cursors.down.isDown) {
            velocity.y = SPEED;
        } else {
            velocity.y = 0;
        }
    }

    public collide() {
        // this.body.velocity.setTo(0, 0);
    }
}
