export class Start extends Phaser.State {
    public create() {
        const lines = [[
            "PhaserOS/086DX Rel. 2.6.1",
            "Copyright (c) Photon Research 1959-1983",
            "All Rights Reserved.",
            "",
            "Welcome, user."
        ], [
            "This is a second text..."
        ]];

        this.printTexts(lines, () => {
            this.game.state.start("mainMenu");
        });
    }

    public printTexts(lines: string[][], callback: Function) {
        let line = lines.shift();
        let innerCb = () => {
            let nextLine = lines.shift();
            if (nextLine !== undefined) {
                this.printText(nextLine, innerCb);
            } else {
                callback();
            }
        }
        this.printText(line, innerCb);
    }

    public printText(lines: string[], callback: Function) {
        const textStyle = {
            fill: "#FFFFFF",
            font: "px437_ati_8x16regular",
            fontSize: "24px"
        };

        let textLines: Phaser.Text[] = [];
        let y = 20;
        for (const line of lines) {
            let text = this.game.add.text(20, y, line, textStyle);
            text.alpha = 0;
            textLines.push(text);
            y += 26;
        }
        let stateCompleted = new Phaser.Signal();
        stateCompleted.addOnce(() => {
            callback();
        });
        textLines.forEach(textLine => {
            let tween = this.game.add.tween(textLine);
            tween.to({ alpha: 1 }, 2000, Phaser.Easing.Quadratic.In);
            tween.to({ alpha: 0 }, 2000, Phaser.Easing.Quadratic.In);
            tween.onComplete.add(() => {
                stateCompleted.dispatch();
            }, this);
            tween.start();
        });
    }
}
