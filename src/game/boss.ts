import { SpritesheetDefinition } from "../engine/animatedSprite";
import { Pnj } from "./pnj";
import { WorldObject } from "./worldObject";
import { Player } from "./player";
import { World } from "../world";
import Matter = require("matter-js");

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
    private interceptZone: PIXI.Rectangle;
    private state: BossState;
    private questioning: QuestioningElement[];
    private currentQuestion: number;
    private lastOutPlayerPosition: Matter.Vector;

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
        Matter.Body.setStatic(this.getBody(), true);
        let interceptZone = this.world.getMap().getZoneNamed(`${o.name}_zone`);
        this.interceptZone = new PIXI.Rectangle(interceptZone.x,
                                                interceptZone.y,
                                                interceptZone.width,
                                                interceptZone.height);
        this.state = BossState.Alive;
        this.questioning = PIXI.loader.resources["dialogs"].data[o.properties.questioning].questioning;
        if (!this.questioning || this.questioning.length === 0) {
            throw `Unable to load questioning ${o.properties.questioning}`;
        }
    }

    public update(delta: number) {
        super.update(delta);
        if (this.state === BossState.Alive) {
            if (this.interceptZone.contains(this.player.getPosition().x,
                                            this.player.getPosition().y)) {
                this.currentQuestion = 0;
                this.player.canMove = false;
                this.state = BossState.InQcm;
                this.doIntercept(this.questioning[this.currentQuestion]);
            } else {
                this.lastOutPlayerPosition = Matter.Vector.clone(this.player.getPosition());
            }
        }
    }

    private doIntercept(step: QuestioningElement) {
        if ("text" in step) {
            let textStep = <QuestioningText> step;
            this.world
                .getHud()
                .getMonologDialog()
                .showTextToPlayer(textStep.text, () => {
                    this.nextStep();
                });
        } else if ("question" in step) {
            let questionStep = <QuestioningQuestion> step;
            this.world
                .getHud()
                .getQuesrtionDialog()
                .showQuestionToPlayer(questionStep.question, a => {
                    let answer = <Answer> a;
                    if (answer.good === true) {
                        this.nextStep();
                    } else {
                        this.onWrongAnswer(questionStep, answer);
                    }
                });
        }
    }

    private onWrongAnswer(question: QuestioningQuestion, answer: Answer) {
        this.world
            .getHud()
            .getMonologDialog()
            .showTextToPlayer(question.question.wrongAnswer, () => {
                this.state = BossState.Alive;
                let pBody = this.player.getBody();
                if (pBody) {
                    Matter.Body.setPosition(pBody, this.lastOutPlayerPosition);
                }
                this.player.canMove = true;
            });
    }

    private nextStep() {
        if (++this.currentQuestion < this.questioning.length) {
            this.doIntercept(this.questioning[this.currentQuestion]);
        } else {
            this.player.canMove = true;
            this.kill();
        }
    }

    private kill() {
        this.state = BossState.Dead;
        this.getSprite().visible = false;
        Matter.World.remove(this.world.engine.world, this.getBody());
    }
}
