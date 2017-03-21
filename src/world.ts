export class World {
    public readonly stage: PIXI.Container;
    public readonly uiStage: PIXI.Container;

    private root: PIXI.Container;

    constructor(
        public readonly renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer
    ) {
        this.stage = new PIXI.Container();
        this.uiStage = new PIXI.Container();
        this.root = new PIXI.Container();
        this.root.addChild(this.stage);
        this.root.addChild(this.uiStage);
    }

    public render() {
        this.renderer.render(this.root);
    }
}
