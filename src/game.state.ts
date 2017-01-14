export class GameState extends Phaser.State {
    private map: Phaser.Tilemap;
    private debugPhysics: boolean = true;

    public preload() {
        this.game.load.tilemap("map", "/assets/map.json", null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image("tileset", "/assets/Bureau/base prototype carte.png");
    }

    public create() {
        this.game.stage.backgroundColor = "#787878";
        this.physics.startSystem(Phaser.Physics.P2JS);

        this.map = this.add.tilemap("map");
        this.map.addTilesetImage("tileset", "tileset");
        this.map.addTilesetImage("test", "tileset");
        console.log(this.map);
        let layer = this.map.createLayer("world-layer");
        console.log(this.findCollisionTilesIndexes(this.map));
        layer.resizeWorld();
        this.map.setCollision(this.findCollisionTilesIndexes(this.map));
        this.physics.p2.convertTilemap(this.map, layer).forEach(b => {
            b.debug = this.debugPhysics;
        });
    }

    public render()  {
    }

    public findCollisionTilesIndexes(map: Phaser.Tilemap): number[] {
        let indexes: number[] = [];
        map.tilesets.forEach((tileset, i) =>  {
            let tilesProperties: any = (<any>tileset)["tileProperties"];
            if (tilesProperties !== undefined) {
                Object.keys(tilesProperties).forEach((key: string) => {
                    let tileProperties = tilesProperties[key];
                    if (tileProperties["collide"] === true) {
                        indexes.push(tileset.firstgid + parseInt(key));
                    }
                });
            }
        });
        return indexes;
    }
}
