import "es6-promise";
import "pixi.js";
import { Game } from "./game";

let game: Game | null;
window.onload = () => {
    launch();
};

if (document.readyState === "complete") {
    launch();
}

function launch() {
    if (!game) {
        game = new Game();
    }
}
