import { GameState } from "../game.state";
import { WorldObject } from "./worldObject";
import { createPnj } from "./pnjFactory";

export class Map {
    private map: Phaser.Tilemap;
    private layer: Phaser.TilemapLayer;
    private game: Phaser.Game;

    public constructor(private gameState: GameState) {
        this.game = gameState.game;
    }

    public load() {
        this.game.load.tilemap("map", "./assets/map.json", null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image("tileset", "./assets/Bureau/base prototype carte.png");
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
        let spawnZone = this.getZoneNamed("player-spawn");
        return new Phaser.Point(spawnZone.x, spawnZone.y);
    }

    public getZoneNamed(name: string): WorldObject {
        let zones = this.getZonesLayer().filter(z => z.name === name);
        if (zones.length === 1) {
            return zones[0];
        }
        throw `Multiple zones named ${name} detected !`;
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

    public getGame() {
        return this.game;
    }

    public getGameState() {
        return this.gameState;
    }

    public loadCreatures() {
        return this.getCreaturesLayer().map(object => createPnj(object, this.gameState));
    }
}
