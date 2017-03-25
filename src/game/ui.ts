import { GameState } from "../game.state";
import { World } from "../world";

const UI_RES_PREFIX = "__ui__";

export class GameHub {
    private monologDialog: MonologDialog;

    public constructor(private world: World) {
        world.setHud(this);
        this.monologDialog = new MonologDialog(this.world);
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
    private text: PIXI.Text;
    private internalDim: PIXI.Point;
    private group: PIXI.Container;
    private dialogImg: PIXI.Sprite;
    private dialogBtn: PIXI.Sprite;
    private internalMargin: PIXI.Point;
    private onTextShown: () => void;
    private style: PIXI.TextStyleOptions;

    private readPosition: number;

    public constructor(private world: World) {
        this.internalMargin = new PIXI.Point(25, 25);
    }

    public preload() {
        PIXI.loader
            .add( "images/dialog-box.png")
            .add( "images/dialog-button.png");
    }

    public setup() {
        this.group = new PIXI.Container();
        this.dialogBtn = new PIXI.Sprite(PIXI.loader.resources["images/dialog-button.png"].texture);
        this.dialogImg = new PIXI.Sprite(PIXI.loader.resources["images/dialog-box.png"].texture);
        this.group.addChild(this.dialogImg);
        this.group.addChild(this.dialogBtn);

        this.group.y = this.world.renderer.height - this.dialogImg.height;
        this.group.x = (this.world.renderer.width - this.dialogImg.width) / 2;
        this.group.visible = false;

        this.internalDim = new PIXI.Point(this.dialogImg.width - this.internalMargin.x * 2, this.dialogImg.height - this.internalMargin.y * 2);

        this.world.uiStage.addChild(this.group);
        // let mask = this.game.add.graphics(this.internalMargin.x, this.internalMargin.y, this.group);
        // mask.beginFill(0xFFFFFF);
        // mask.drawRect(0, 0, this.internalDim.x, this.internalDim.y);
        // mask.endFill();


        this.style = {
            fontSize: 32,
            wordWrap: true,
            wordWrapWidth: this.internalDim.x,
            fill: "black"
        };

        this.dialogBtn.anchor.set(0.5, 0.5);
        this.dialogBtn.position.set(this.internalMargin.x + this.internalDim.x - 3, this.internalMargin.y + this.internalDim.y - 15);

        // this.text = this.game.add.text(0, 0, "", this.style, this.group);
        this.text = new PIXI.Text("", this.style);
        this.text.position.set(this.internalMargin.x, this.internalMargin.y);
        this.group.addChild(this.text);
        // this.text.mask = mask;
        // this.text.useAdvancedWrap = true;
        // this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR).onDown.add(() => {
        //     if (this.group.visible) {
        //         this.showNext();
        //     }
        // });
        keyboardJS.bind("space", e => {
            if (this.group.visible) {
                this.showNext();
            }
            if(e && this.group.visible) {
                // e.preventRepeat();
            }
        });
    }

    public showTextToPlayer(text: string, cb: () => void) {
        this.readPosition = 0;
        this.text.text = text;
        //Force texture refresh
        this.text.getBounds();
        this.computeDisplayTextRect();
        this.onTextShown = cb;
        this.group.visible = true;
        let hasNext = this.hasNext(this.readPosition);
        this.dialogBtn.visible = hasNext;
    }

    public update(): void {
        if (this.group.visible) {
        }
    }

    private computeDisplayTextRect() {
        let width = this.text.texture.width;
        let y = this.readPosition;
        let height = Math.min(this.text.texture.orig.height - y, this.internalDim.y);

        let displayRect = new PIXI.Rectangle(0, y, width, height);

        this.text.texture.frame = displayRect;
        this.text.texture.trim = displayRect;
        this.text.position.y = this.internalMargin.y - this.readPosition;
    }

    private showNext() {
        if (!this.hasNext(this.readPosition)) {
            this.group.visible = false;
            this.onTextShown();
        }
        this.readPosition += this.internalDim.y;
        this.computeDisplayTextRect();
        let hasNext = this.hasNext(this.readPosition);
        this.dialogBtn.visible = hasNext;
    }

    private hasNext(position: number) {
        return position + this.internalDim.y < this.text.texture.height;
    }
}
