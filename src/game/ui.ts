import { World } from "../world";
import keyboardJS = require("keyboardjs");

const FONT_SIZE = 24;

export class GameHud {
    private monologDialog: MonologDialog;
    private questionDialog: QuestionDialog;

    public constructor(private world: World) {
        world.setHud(this);
        this.monologDialog = new MonologDialog(this.world);
        this.questionDialog = new QuestionDialog(this.world);
    }

    public setup() {
        this.monologDialog.setup();
        this.questionDialog.setup();
    }

    public preload(): void {
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

export class Question {
    title: string;
    answers: {
        text: string;
    }[];
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
    private readyToComplete: boolean;

    public constructor(private world: World) {
        this.internalMargin = new PIXI.Point(25, 25);
    }

    public preload() {
        PIXI.loader
            .add("question-box", "images/dialog-box.png");
    }

    public update() {
        this.readyToComplete = true;
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
            if (this.group.visible && this.readyToComplete) {
                this.nextAnswer();
            }
            if (e && this.group.visible) {
                // e.preventRepeat();
            }
        });
        keyboardJS.bind("up", e => {
            if (this.group.visible && this.readyToComplete) {
                this.previousAnswer();
            }
            if (e && this.group.visible) {
                // e.preventRepeat();
            }
        });
        keyboardJS.bind("space", e => {
            if (this.group.visible && this.readyToComplete) {
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
        this.readyToComplete = false;
        this.question = question;
        this.onResponse = cb;
        this.currentAnswer = 0;
        this.group.visible = true;
        this.computeText();
    }

    private computeText() {
        this.text.text = this.question.title +
            "\n" +
            this.question.answers[this.currentAnswer].text;
    }

    private doAnswer() {
        this.onResponse(this.question.answers[this.currentAnswer]);
        this.group.visible = false;
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
