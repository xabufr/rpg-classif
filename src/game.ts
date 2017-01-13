import { Boot } from "./boot.state";
import { Start } from "./start.state";
import { MainMenu } from "./mainMenu.state";

export class Game extends Phaser.Game {
    constructor() {
        super(800, 600, Phaser.AUTO);
        this.state.add("boot", Boot);
        this.state.add("start", Start);
        this.state.add("mainMenu", MainMenu);

        this.state.start("boot");
    }
}
