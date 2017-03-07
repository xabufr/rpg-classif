import { GameState } from "../game.state";

export class GameHub {
    private monologDialog: MonologDialog;
    private game: Phaser.Game;

    public constructor(private gameState: GameState) {
        this.game = gameState.game;
        this.monologDialog = new MonologDialog(this.game);
    }

    public preload(): void {
    }

    public update(): void {
        this.monologDialog.update();
    }

    public preRender(): void {
    }

    public getMonologDialog() {
        return this.monologDialog;
    }
}

export class MonologDialog {
    private graphics: Phaser.Graphics;
    private text: Phaser.Text;
    private isShowingText: boolean;
    private internalDim: Phaser.Point;
    private group: Phaser.Group;

    public constructor(private game: Phaser.Game) {
        this.group = this.game.add.group();
        this.group.fixedToCamera = true;
        this.group.z = 10000;
        this.graphics = this.game.add.graphics(0, 0, this.group);
        this.isShowingText = false;

        let width = this.game.width * 0.2;
        let height = this.game.width * 0.2;
        this.internalDim = new Phaser.Point(width - 10, height - 10);

        this.graphics.beginFill(0x000000);
        this.graphics.drawRoundedRect(0, 0, width, height, 10);
        this.graphics.endFill();

        this.text = this.game.add.text(0, 0, "", {
            wordWrap: true,
            wordWrapWidth: this.internalDim.x,
            maxLines: 999,
            fill: "grey"
        }, this.group);
    }

    public showTextToPlayer(text: string) {
        this.isShowingText = true;
        console.log(text);
        this.text.setText(text, true);
    }

    public update(): void {
        if (this.isShowingText) {
            this.group.visible = true;
        } else {
            this.group.visible = false;
        }
    }
}
