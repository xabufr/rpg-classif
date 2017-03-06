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
    }

    public preRender(): void {
    }

    public getMonologDialog() {
        return this.monologDialog;
    }
}

export class MonologDialog {
    private graphics: Phaser.Graphics;

    public constructor(private game: Phaser.Game) {
        this.graphics = this.game.add.graphics(0, 0);
        this.graphics.beginFill(1.0, 1.0);
        let width = this.game.width * 0.2;
        let height = this.game.width * 0.2;
        this.graphics.drawRoundedRect(0, 0, width, height, 10);
        this.graphics.endFill();
        this.graphics.fixedToCamera = true;
        this.graphics.visible = false;
    }

    public showTextToPlayer(text: string) {
        console.log("From monolog");
        console.log(text);
    }
}
