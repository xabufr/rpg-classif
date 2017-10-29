import { World } from "../world";
import keyboardJS = require("keyboardjs");
import { Tween } from "es6-tween/src/index.lite";
import { Player } from "./player";

const FONT_SIZE = 24;
const UP_ARROW = "↑";
const DOWN_ARROW = "↓";
const UP_DOWN_ARROW = "↕";

export class GameUi {
    private monologDialog: MonologDialog;
    private questionDialog: QuestionDialog;
    private gameHud: GameHud;

    public constructor(private world: World) {
        world.setHud(this);
        this.monologDialog = new MonologDialog(this.world);
        this.questionDialog = new QuestionDialog(this.world);
        this.gameHud = new GameHud(this.world);
    }

    public setup() {
        this.gameHud.setup();
        this.monologDialog.setup();
        this.questionDialog.setup();
    }

    public gameOver() {
        new GameOverScreen(this.world);
    }

    public preload(): void {
        this.gameHud.preload();
        this.monologDialog.preload();
        this.questionDialog.preload();
    }

    public update(): void {
        this.monologDialog.update();
        this.questionDialog.update();
    }

    public preRender(): void {
    }

    public getMonologDialog() {
        return this.monologDialog;
    }

    public getQuesrtionDialog() {
        return this.questionDialog;
    }
}

const GAME_HUD_ICONS = "hud-icons";
const HEART_WIDTH = 15;
const HEART_HEIGHT = 13;

class GameHud {
    private player: Player;
    private livesSprite: PIXI.Sprite;
    private missingLivesSprite: PIXI.Sprite;
    private layer: PIXI.Container;

    constructor(private world: World) {
    }

    public preload() {
        PIXI.loader.add(GAME_HUD_ICONS, "images/HUD-icons.png"); // HUD Icons
    }
    public setup() {
        this.player = this.world.getGame().getPlayer();
        this.player.on("life-changed", () => this.updateLives());

        this.layer = new PIXI.Container();
        this.world.uiStage.addChild(this.layer);

        const baseTexture = PIXI.loader.resources[GAME_HUD_ICONS].texture;
        const fullHearthTexture = new PIXI.Texture(baseTexture.baseTexture, new PIXI.Rectangle(HEART_WIDTH * 2, 0, HEART_WIDTH, HEART_HEIGHT));
        const missingHeartTexture = new PIXI.Texture(baseTexture.baseTexture, new PIXI.Rectangle(HEART_WIDTH * 3, 0, HEART_WIDTH, HEART_HEIGHT));
        this.livesSprite = new PIXI.extras.TilingSprite(fullHearthTexture, HEART_WIDTH * 0, HEART_HEIGHT);
        this.missingLivesSprite = new PIXI.extras.TilingSprite(missingHeartTexture, HEART_WIDTH * 0, HEART_HEIGHT);
        let livesContainer = new PIXI.Container();
        livesContainer.addChild(this.missingLivesSprite);
        livesContainer.addChild(this.livesSprite);
        this.layer.addChild(livesContainer);

        this.updateLives();
    }

    private updateLives() {
        const maxLives = this.player.getMaxLives();
        const lives = this.player.getLives();

        this.missingLivesSprite.width = HEART_WIDTH * maxLives;
        this.livesSprite.width = HEART_WIDTH * lives;
    }
}

export class Question {
    title: string;
    answers: {
        text: string;
    }[];
}

class GameOverScreen {
    private gameOverText: PIXI.Text;
    private retryText: PIXI.Text;
    private background: PIXI.Graphics;
    private group: PIXI.Container;

    constructor(private world: World) {
        this.gameOverText = new PIXI.Text("Game Over", {
            fontSize: FONT_SIZE * 3,
            fontFamily: "Perfect",
            // fontStyle: "justify",
            fill: "#EEEEEE",
        });
        this.retryText = new PIXI.Text("Try again Looser !", {
            fontSize: FONT_SIZE,
            fontFamily: "Perfect",
            // fontStyle: "justify",
            fill: "#EEEEEE",
        });
        this.gameOverText.anchor.set(0.5, 0.5);
        this.retryText.anchor.set(0.5, 0.5);

        this.gameOverText.position.y = -this.retryText.height / 2;
        this.retryText.position.y = this.gameOverText.height / 2;

        this.background = new PIXI.Graphics();
        this.background.beginFill(0x363636);
        const bWidth = (this.gameOverText.width + this.retryText.width) * 1.2
        const bHeight = (this.gameOverText.height + this.retryText.height) * 1.2;
        this.background.drawRoundedRect(0, 0, bWidth, bHeight, 10);
        this.background.position.set(-bWidth / 2, -bHeight / 2);

        this.group = new PIXI.Container();
        this.group.addChild(this.background);
        this.group.addChild(this.gameOverText);
        this.group.addChild(this.retryText);
        this.group.position.set(this.world.renderer.width / 2,
                                this.world.renderer.height / 2);

        this.world.uiStage.addChild(this.group);
        this.group.scale.set(0, 0);
        new Tween(this.group.scale)
            .to({x: 1, y: 1}, 500)
            .start()
            .onComplete(() => {
                const retry = () => {
                    keyboardJS.unbind("enter", retry);
                    this.world.getGame().restart();
                };
                keyboardJS.bind("enter", retry);
            });
    }
}

export class QuestionDialog {
    private question: Question;

    private text: PIXI.Text;
    private internalMargin: PIXI.Point;
    private internalDim: PIXI.Point;
    private group: PIXI.Container;
    private dialogImg: PIXI.Sprite;
    private onResponse: (answer: any) => void;
    private style: PIXI.TextStyleOptions;

    private currentAnswer: number;
    private onUpdate: (() => void)[];

    public constructor(private world: World) {
        this.internalMargin = new PIXI.Point(25, 25);
        this.onUpdate = [];
    }

    public preload() {
        PIXI.loader
            .add("question-box", "images/dialog-box.png");
    }

    public update() {
        this.onUpdate.forEach(f => f());
        this.onUpdate.length = 0;
    }

    public setup() {
        this.group = new PIXI.Container();
        this.dialogImg = new PIXI.Sprite(PIXI.loader.resources["question-box"].texture);

        this.group.addChild(this.dialogImg);

        this.group.y = this.world.renderer.height - this.dialogImg.height;
        this.group.x = (this.world.renderer.width - this.dialogImg.width) / 2;
        this.group.visible = false;

        let internalHeight = Math.floor((this.dialogImg.height - this.internalMargin.y * 2) / FONT_SIZE) * FONT_SIZE;
        this.internalDim = new PIXI.Point(this.dialogImg.width - this.internalMargin.x * 2, internalHeight);

        this.world.uiStage.addChild(this.group);

        this.style = {
            fontSize: FONT_SIZE,
            fontFamily: "Perfect",
            // fontStyle: "justify",
            fill: "#EEEEEE",
            wordWrap: true,
            wordWrapWidth: this.internalDim.x,
        };

        this.text = new PIXI.Text("", this.style);
        this.text.position.set(this.internalMargin.x, this.internalMargin.y);
        this.group.addChild(this.text);

        keyboardJS.bind("down", e => {
            if (this.group.visible) {
                this.nextAnswer();
            }
            if (e && this.group.visible) {
                // e.preventRepeat();
            }
        });
        keyboardJS.bind("up", e => {
            if (this.group.visible) {
                this.previousAnswer();
            }
            if (e && this.group.visible) {
                // e.preventRepeat();
            }
        });
        keyboardJS.bind("space", e => {
            if (this.group.visible) {
                this.doAnswer();
            }
        });
    }

    private previousAnswer() {
        if (--this.currentAnswer < 0) {
            this.currentAnswer = 0;
        }
        this.computeText();
    }

    private nextAnswer() {
        if (++this.currentAnswer >= this.question.answers.length) {
            this.currentAnswer = this.question.answers.length - 1;
        }
        this.computeText();
    }

    public showQuestionToPlayer(question: Question, cb: (answer: any) => void) {
        this.question = question;
        this.onResponse = cb;
        this.currentAnswer = 0;
        this.onUpdate.push(() => {
            this.group.visible = true;
            this.computeText();
        });
    }

    private computeText() {
        let text = this.question.title + "\n";
        const answers = this.question.answers;
        if (this.currentAnswer == 0) {
            text += DOWN_ARROW;
        } else if (this.currentAnswer == answers.length - 1) {
            text += UP_ARROW;
        } else {
            text += UP_DOWN_ARROW;
        }
        text += " "+ answers[this.currentAnswer].text;
        this.text.text = text;
    }

    private doAnswer() {
        this.onUpdate.push(() => {
            this.group.visible = false;
        });
        this.onResponse(this.question.answers[this.currentAnswer]);
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
            .add( "images/press-space-button.png");
    }

    public setup() {
        this.group = new PIXI.Container();
        this.dialogBtn = new PIXI.Sprite(PIXI.loader.resources["images/press-space-button.png"].texture);
        this.dialogImg = new PIXI.Sprite(PIXI.loader.resources["images/dialog-box.png"].texture);

        this.group.addChild(this.dialogImg);
        this.group.addChild(this.dialogBtn);

        this.group.y = this.world.renderer.height - this.dialogImg.height;
        this.group.x = (this.world.renderer.width - this.dialogImg.width) / 2;
        this.group.visible = false;

        let internalHeight = Math.floor((this.dialogImg.height - this.internalMargin.y * 2) / FONT_SIZE) * FONT_SIZE;
        this.internalDim = new PIXI.Point(this.dialogImg.width - this.internalMargin.x * 2, internalHeight);

        this.world.uiStage.addChild(this.group);

        this.style = {
            fontSize: FONT_SIZE,
            fontFamily: "Perfect",
            // fontStyle: "justify",
            fill: "#EEEEEE",
            wordWrap: true,
            wordWrapWidth: this.internalDim.x,
        };

        this.dialogBtn.anchor.set(0.5, 1);
        this.dialogBtn.position.set(this.dialogImg.width * 0.5, this.dialogImg.height - 13);

        this.text = new PIXI.Text("", this.style);
        this.text.position.set(this.internalMargin.x, this.internalMargin.y);
        this.group.addChild(this.text);

        keyboardJS.bind("space", e => {
            if (this.group.visible) {
                this.showNext();
            }
        });
    }

    public showTextToPlayer(text: string, cb: () => void) {
        if (this.group.visible === true) {
            return false;
        }
        this.readPosition = 0;
        this.text.text = text;
        // Force texture refresh
        this.text.getBounds();
        this.computeDisplayTextRect();
        this.onTextShown = cb;
        this.group.visible = true;
        let hasNext = this.hasNext(this.readPosition);
        this.dialogBtn.visible = hasNext;
        return true;
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
        this.readPosition += this.internalDim.y - FONT_SIZE;
        this.computeDisplayTextRect();
        let hasNext = this.hasNext(this.readPosition);
        this.dialogBtn.visible = hasNext;
    }

    private hasNext(position: number) {
        return position + this.internalDim.y < this.text.texture.height;
    }
}
