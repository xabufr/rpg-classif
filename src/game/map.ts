import { WorldObject } from "./worldObject";

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
        this.map.createLayer("world-objects").visible = true;
        this.map.setCollision(this.findCollisionTilesIndexes());
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
        let spawnZones = this.getZonesLayer().filter(z => z.type === "player-spawn");
        if (spawnZones.length === 1) {
            return new Phaser.Point(spawnZones[0].x, spawnZones[0].y);
        }
        throw "Multiple spawn-zone detected !";
    }

    public getCreaturesLayer() {
        return this.getObjectLayer("world-creatures");
    }

    public getZonesLayer() {
        return this.getObjectLayer("world-zones");
    }

    public getObjectLayer(layerName: string): WorldObject[] {
        if (layerName in this.map.objects) {
            return (<any>this.map).objects[layerName];
        }
        throw `Cannot find layer ${layerName}`;
    }

    public getLayer() {
        return this.layer;
    }
}
