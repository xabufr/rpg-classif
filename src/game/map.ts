
export class Map {
    private map: Phaser.Tilemap;
    private layer: Phaser.TilemapLayer;
    private game: Phaser.Game;

    public constructor(game: Phaser.Game) {
        this.game = game;
    }

    public load() {
        this.game.load.tilemap("map", "/assets/map.json", null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image("tileset", "/assets/Bureau/base prototype carte.png");
    }

    public setup() {
        this.map = this.game.add.tilemap("map");
        this.map.addTilesetImage("tileset", "tileset");
        this.map.addTilesetImage("test", "tileset");
        this.layer = this.map.createLayer("world-layer");
        this.layer.resizeWorld();
        this.layer.debug = true;
        this.map.setCollision(this.findCollisionTilesIndexes());
        // this.physics.p2.convertTilemap(this.map, layer).forEach(b => {
        //     b.debug = this.debugPhysics;
        // });
    }

    public findCollisionTilesIndexes(): number[] {
        let indexes: number[] = [];
        this.map.tilesets.forEach((tileset, i) =>  {
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

    public findSpawnZone() {
        if ("world-zones" in this.map.objects) {
            let zones = (<any[]>(<any>this.map).objects["world-zones"]).filter((zone: any) => {
                return "properties" in zone && zone.properties.type === "player-spawn";
            });
            if (zones.length === 1) {
                return new Phaser.Point(zones[0].x, zones[0].y);
            }
            console.warn("Cannot find a valid spwn point !!!");
        }
        return new Phaser.Point(50, 50);
    }

    public getLayer() {
        return this.layer;
    }
}
