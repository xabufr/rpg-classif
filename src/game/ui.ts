import { GameState } from "../game.state";

const UI_RES_PREFIX = "__ui__";

export class GameHub {
    private monologDialog: MonologDialog;
    private game: Phaser.Game;

    public constructor(private gameState: GameState) {
        this.game = gameState.game;
        this.monologDialog = new MonologDialog(this.game);
    }

    public setup() {
        this.monologDialog.setup();
    }

    public preload(): void {
        this.monologDialog.preload();
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
    private text: Phaser.Text;
    private internalDim: Phaser.Point;
    private group: Phaser.Group;
    private dialogImg: Phaser.Image;
    private internalMargin: Phaser.Point;
    private onTextShown: () => void;
    private style: Phaser.PhaserTextStyle;

    public constructor(private game: Phaser.Game) {
        this.internalMargin = new Phaser.Point(25, 25);
    }

    public preload() {
        this.game.load.image(UI_RES_PREFIX + "dialog-box", "./assets/images/dialog-box.png");
    }

    public setup() {
        this.group = this.game.add.group();
        this.group.fixedToCamera = true;
        this.group.z = 10000;
        this.dialogImg = this.game.add.image(0, 0, UI_RES_PREFIX + "dialog-box", null, this.group);

        this.group.cameraOffset.y = this.game.height - this.dialogImg.height;
        this.group.cameraOffset.x = (this.game.width - this.dialogImg.width) / 2;
        this.group.position.x = -100;

        this.internalDim = new Phaser.Point(this.dialogImg.width - this.internalMargin.x * 2, this.dialogImg.height - this.internalMargin.y * 2);
        let mask = this.game.add.graphics(this.internalMargin.x, this.internalMargin.y, this.group);
        mask.beginFill(0xFFFFFF);
        mask.drawRect(0, 0, this.internalDim.x, this.internalDim.y);
        mask.endFill();


        this.style = {
            fontSize: 32,
            wordWrap: true,
            wordWrapWidth: this.internalDim.x,
            maxLines: 9999,
            fill: "black"
        };

        this.text = this.game.add.text(this.internalMargin.x, this.internalMargin.y, "", this.style, this.group);
        this.text.mask = mask;
        this.text.useAdvancedWrap = true;
        this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR).onDown.add(() => {
            if (this.group.visible) {
                this.showNext();
            }
        });
    }

    public showTextToPlayer(text: string, cb: () => void) {
        this.text.setText(text, true);
        this.onTextShown = cb;
        this.group.visible = true;
    }

    public update(): void {
        if (this.group.visible) {
        }
    }

    private showNext() {
        if (this.text.bottom < this.internalMargin.y + this.internalDim.y) {
            this.group.visible = false;
            this.onTextShown();
        }
        this.text.position.y -= this.style.fontSize;
    }
}
