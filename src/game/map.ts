import { GameState } from "../game.state";
import { WorldObject } from "./worldObject";
import { createPnj } from "./pnjFactory";

const MAP_CACHE_PREFIX = "map_private_resource_";
const MAP_CACHE_KEY = `${MAP_CACHE_PREFIX}_tilemap_json_tiled`;

export class Map {
    private group: Phaser.Group;
    private map: Phaser.Tilemap;
    private shownLayers: Phaser.TilemapLayer[];
    private game: Phaser.Game;

    public constructor(private gameState: GameState) {
        this.game = gameState.game;
        this.group = this.game.add.group();
    }

    public load() {
        this.game.load.onFileComplete.add((progress: any, cacheKey: any) => {
            console.log(cacheKey);
            if (cacheKey === MAP_CACHE_KEY) {
                let tilemap = this.game.cache.getTilemapData(MAP_CACHE_KEY);
                let baseUrl = tilemap.url + "/../";
                tilemap.data.tilesets.forEach((tileset: any) => {
                    this.game.load.image(MAP_CACHE_PREFIX + tileset.name, baseUrl + tileset.image);
                });
            }
        });
        this.game.load.tilemap(MAP_CACHE_KEY, "./assets/map.json", null, Phaser.Tilemap.TILED_JSON);
    }

    public setup() {
        this.map = this.game.add.tilemap(MAP_CACHE_KEY);
        this.map.tilesets.forEach(tileset => this.map.addTilesetImage(tileset.name, MAP_CACHE_PREFIX + tileset.name));
        let collidesIndexes = this.findCollisionTilesIndexes();
        this.shownLayers = this.findLayersToShow().map(layer => {
            let displayLayer = this.map.createLayer(layer.name);
            displayLayer.resizeWorld();
            // displayLayer.debug = true;
            this.group.addChild(displayLayer);
            this.map.setCollision(collidesIndexes, true, displayLayer);
            return displayLayer;
        });
    }

    public findCollisionTilesIndexes(): number[] {
        let indexes: number[] = [];
        console.log(this.map.tilesets);
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
        console.log(indexes);
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

    public getLayers() {
        return this.shownLayers;
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

    private findLayersToShow() {
        return this.map.layers.filter(layer => {
            return layer.visible && !("display" in layer.properties) || layer.properties.display === false;
        });
    }
}
