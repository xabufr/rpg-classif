import { GameState } from "../game.state";
import { WorldObject } from "./worldObject";
import { createPnj } from "./pnjFactory";

const MAP_CACHE_PREFIX = "map_private_resource_";
const MAP_CACHE_KEY = `${MAP_CACHE_PREFIX}_tilemap_json_tiled`;

interface TiledMapData {
    height: number;
    width: number;
    tileheight: number;
    tilewidth: number;
    layers: BaseLayerData[];
    tilesets: TilesetData[];
}

interface TilesetData {
    columns: number;
    firstgid: number;
    image: string;
    imageheight: number;
    imagewidth: number;
    margin: number;
    name: string;
    spacing: number;
    tilecount: number;
    tileheight: number;
    tilewidth: number;
    tileproperties: {
        [id: number]: {
            collide?: boolean;
            [propName: string]: any | undefined;
        };
    };
}

type BaseLayerData = ITilesetLayer | IObjectLayer;

interface IBaseLayer {
    height: number;
    width: number;
    visible: boolean;
    opacity: number;
    name: string;
    x: number;
    y: number;
}

interface ITilesetLayer extends IBaseLayer {
    type: "tilelayer";
    data: number[];
}

interface IObjectLayer extends IBaseLayer {
    type: "objectgroup";
    objects: ObjectData[];
}

interface ObjectData {
    height: number;
    widsth: number;
    id: number;
    name: string;
    type: string;
    rotation: number;
    visible: boolean;
    x: number;
    y: number;
    properties: any;
}

export class Map {
    private container: PIXI.Container;

    public constructor(private parent: PIXI.Container, mapData: TiledMapData) {
        this.container = parent.addChild(new PIXI.Container());
        let loader = new PIXI.loaders.Loader("./assets");
        mapData.tilesets.map((v, i) => {
            loader.add(v.image);
        });
        loader.load(() => {
            let tileTextures: PIXI.Texture[] = [];
            mapData.tilesets.forEach((v, i) => {
                let texture = loader.resources[v.image].texture;
                let columns = v.imagewidth / v.tilewidth;
                let lines = v.imageheight / v.tileheight;
                for (let x = 0; x < columns; ++x) {
                    for (let y = 0; y < lines; ++y) {
                        tileTextures[v.firstgid + y * v.columns + x] = new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(x * v.tilewidth, y * v.tileheight, v.tilewidth, v.tileheight));
                    }
                }
            });
            mapData.layers.filter(l =>  l.type === "tilelayer").forEach((layer: ITilesetLayer) => {
                layer.data.forEach((v, i) => {
                    let col = i % mapData.width;
                    let lin = Math.floor(i / mapData.width);
                    let sprite = new PIXI.Sprite(tileTextures[v]);
                    sprite.x = col * mapData.tilewidth;
                    sprite.y = lin * mapData.tileheight;
                    this.container.addChild(sprite);
                });
            })
        });
    }

    public load() {
        // this.game.load.onFileComplete.add((progress: any, cacheKey: any) => {
        //     if (cacheKey === MAP_CACHE_KEY) {
        //         let tilemap = this.game.cache.getTilemapData(MAP_CACHE_KEY);
        //         let baseUrl = tilemap.url + "/../";
        //         tilemap.data.tilesets.forEach((tileset: any) => {
        //             this.game.load.image(MAP_CACHE_PREFIX + tileset.name, baseUrl + tileset.image);
        //         });
        //     }
        // });
        // this.game.load.tilemap(MAP_CACHE_KEY, "./assets/map.json", null, Phaser.Tilemap.TILED_JSON);
    }

    public setup() {
        // this.map = this.game.add.tilemap(MAP_CACHE_KEY);
        // this.map.tilesets.forEach(tileset => this.map.addTilesetImage(tileset.name, MAP_CACHE_PREFIX + tileset.name));
        // let collidesIndexes = this.findCollisionTilesIndexes();
        // this.shownLayers = this.findLayersToShow().map(layer => {
        //     let displayLayer = this.map.createLayer(layer.name);
        //     displayLayer.resizeWorld();
        //     if ("display" in layer.properties && layer.properties.display === false) {
        //         displayLayer.visible = false;
        //     }
        //     this.container.addChild(displayLayer);
        //     this.map.setCollision(collidesIndexes, true, displayLayer);
        //     return displayLayer;
        // });
    }

    public findCollisionTilesIndexes(): number[] {
        // let indexes: number[] = [];
        // this.map.tilesets.forEach((tileset, i) =>  {
        //     let tilesProperties: any = (<any>tileset)["tileProperties"];
        //     if (tilesProperties !== undefined) {
        //         Object.keys(tilesProperties).forEach((key: string) => {
        //             let tileProperties = tilesProperties[key];
        //             if (tileProperties["collide"] === true) {
        //                 indexes.push(tileset.firstgid + parseInt(key));
        //             }
        //         });
        //     }
        // });
        // return indexes;
        return null;
    }

    public findSpawnZone() {
        // let spawnZone = this.getZoneNamed("player-spawn");
        // return new Phaser.Point(spawnZone.x, spawnZone.y);
    }

    public getZoneNamed(name: string, required = true): WorldObject {
        // let zones = this.getZonesLayer().filter(z => z.name === name);
        // if (zones.length === 1) {
        //     return zones[0];
        // }
        // if (required === true) {
        //     throw `Multiple zones named ${name} detected !`;
        // }
        return null;
    }

    public getCreaturesLayer() {
        // return this.getObjectLayer("world-creatures");
    }

    public getZonesLayer() {
        // return this.getObjectLayer("world-zones");
    }

    public getObjectLayer(layerName: string): WorldObject[] {
        // if (layerName in this.map.objects) {
            // return (<any>this.map).objects[layerName];
        // }
        throw `Cannot find layer ${layerName}`;
    }

    public getLayers() {
        // return this.shownLayers;
    }

    public getGame() {
        // return this.game;
    }

    public getGameState() {
        // return this.gameState;
    // }

    public loadCreatures() {
        // return this.getCreaturesLayer().map(object => createPnj(object, this.gameState));
    }

    private findLayersToShow() {
        // return this.map.layers.filter(layer => {
        //     return layer.visible;
        // });
    }
}
