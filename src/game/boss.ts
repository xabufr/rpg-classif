import { SpritesheetDefinition } from "../engine/animatedSprite";
import { Pnj } from "./pnj";
import { WorldObject } from "./worldObject";
import { Player } from "./player";
import { World } from "../world";
import { GameObject } from "../game/gameObject";
import { Vector, Rectangle } from "../engine/physics";
import { RandomBehaviour } from "./behaviour";

const frames = [{
    name: "down",
    frames: [
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 2, y: 0}
    ]
}, {
    name: "left",
    frames: [
        {x: 0, y: 1},
        {x: 1, y: 1},
        {x: 2, y: 1}
    ]
}, {
    name: "right",
    frames: [
        {x: 0, y: 2},
        {x: 1, y: 2},
        {x: 2, y: 2}
    ]
}, {
    name: "up",
    frames: [
        {x: 0, y: 3},
        {x: 1, y: 3},
        {x: 2, y: 3}
    ]
}];

enum BossState {
    InQcm, Dead, Alive
};
type QuestioningElement = QuestioningText | QuestioningQuestion;
interface QuestioningText {
    text: string;
}
interface Answer {
    text: string;
    good?: boolean;
}
interface QuestioningQuestion {
    question: {
        title: string;
        answers: Answer[];
        wrongAnswer: string;
    };
}

export class Boss extends Pnj {
    private zone: Rectangle;
    private state: BossState;
    private questioning: QuestioningElement[];
    private currentQuestion: number;
    private lastOutPlayerPosition: Vector;

    public constructor(o: WorldObject, world: World, player: Player) {
        if (!o.properties || !o.properties.textureName) {
            throw `Missing textureName in boss ${o.name}`;
        }
        let spriteDef: SpritesheetDefinition = {
            frameWidth: o.properties.frameWidth || 32,
            frameHeight: o.properties.frameHeight || 32
        };
        let resources = PIXI.loader.resources;
        super(o,
              world,
              player,
              resources[o.properties.textureName].texture,
              spriteDef,
              frames);
        let interceptZone = this.world.getMap().getZoneNamed(`${o.name}_zone`);
        this.zone = new Rectangle(interceptZone.x,
                                  interceptZone.y,
                                  interceptZone.width,
                                  interceptZone.height);
        this.state = BossState.Alive;
        this.behaviour = new RandomBehaviour(this, o, 1000);
        this.questioning = PIXI.loader.resources["dialogs"].data[o.properties.questioning].questioning;
        if (!this.questioning || this.questioning.length === 0) {
            throw `Unable to load questioning ${o.properties.questioning}`;
        }
    }

    public update(delta: number) {
        super.update(delta);
        if (this.state === BossState.Alive) {
            let playerBody = <Rectangle> this.player.getBody();
            if (! playerBody.intersects(this.zone)) {
                this.lastOutPlayerPosition = this.player.getPosition().clone();
            }
        }
    }

    public interactWithPlayer(): Promise<void> {
        this.currentQuestion = 0;
        this.player.canMove = false;
        return this.doIntercept(this.questioning[this.currentQuestion]);
    }

    private doIntercept(step: QuestioningElement): Promise<void> {
        return new Promise(resolve => {
            if ("text" in step) {
                let textStep = <QuestioningText> step;
                this.world
                    .getHud()
                    .getMonologDialog()
                    .showTextToPlayer(textStep.text, () => {
                        this.nextStep().then(resolve);
                    });
            } else if ("question" in step) {
                let questionStep = <QuestioningQuestion> step;
                this.world
                    .getHud()
                    .getQuesrtionDialog()
                    .showQuestionToPlayer(questionStep.question, a => {
                        let answer = <Answer> a;
                        if (answer.good === true) {
                            this.nextStep().then(resolve);
                        } else {
                            this.onWrongAnswer(questionStep, answer).then(resolve);
                        }
                    });
            } else {
                resolve();
            }
        });
    }

    private onWrongAnswer(question: QuestioningQuestion, answer: Answer): Promise<void> {
        return new Promise(resolve => {
            this.world
                .getHud()
                .getMonologDialog()
                .showTextToPlayer(question.question.wrongAnswer, () => {
                    this.state = BossState.Alive;
                    let pBody = this.player.getBody();
                    if (pBody) {
                        pBody.position.copyFrom(this.lastOutPlayerPosition);
                    }
                    this.player.canMove = true;
                    this.player.removeLife();
                    resolve();
                });
        });
    }

    private nextStep(): Promise<void> {
        return new Promise(resolve => {
            if (++this.currentQuestion < this.questioning.length) {
                this.doIntercept(this.questioning[this.currentQuestion])
                    .then(resolve);
            } else {
                this.player.canMove = true;
                this.kill();
                resolve();
            }
        });
    }

    private kill() {
        this.state = BossState.Dead;
        this.getSprite().visible = false;
        this.world.physics.removeBody(this.getBody());
    }
}
