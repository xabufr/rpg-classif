import { Boot } from "./boot.state";
import { Start } from "./start.state";
import { MainMenu } from "./mainMenu.state";
import { GameState } from "./game.state";

export class Game extends Phaser.Game {
    constructor() {
        super(800, 600, Phaser.AUTO, "game", null, false, false);
        this.state.add("boot", Boot);
        this.state.add("start", Start);
        this.state.add("mainMenu", MainMenu);
        this.state.add("game", GameState);

        this.state.start("game");
    }
}
