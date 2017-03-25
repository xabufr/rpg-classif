import { WorldObject } from "./worldObject";
import { World } from "../world";
import { createPnj } from "./pnjFactory";
import { Player } from "./player";

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

interface Tile {
    texture: PIXI.Texture;
    collide: boolean;
}

const MAP_SPLIT_SIZE = 1024;

export class Map {
    private mapContainer: PIXI.Container;
    private mapData: TiledMapData;
    public constructor(private world: World, private mapName: string) {
        world.setMap(this);
    }

    public load() {
        PIXI.loader.add(this.mapName);
        return new Promise(r => {
            PIXI.loader.load(r);
        }).then(() => {
            this.mapData = <TiledMapData> PIXI.loader.resources[this.mapName].data;
            return this.mapData;
        }).then((d: TiledMapData) => this.loadMap(d));
    }

    private loadMap(mapData: TiledMapData) {
        return this.loadMapTextures(mapData).then(() => {
            let tileTextures = this.createTilesets(mapData);
            let container = this.createMapTiles(tileTextures, mapData);
            this.mapContainer = this.createFastCachedDisplay(container);
            this.world.stage.addChild(this.mapContainer);
            let bodies = this.createMapBody(tileTextures, mapData);
            Matter.World.add(this.world.engine.world, bodies);
        });
    }

    private createTilesets(mapData: TiledMapData) {
        console.log(mapData);
        let tileTextures: Tile[] = [];
        mapData.tilesets.forEach((v, i) => {
            let texture = PIXI.loader.resources[v.image].texture;
            let columns = v.imagewidth / v.tilewidth;
            let lines = v.imageheight / v.tileheight;
            console.log(v);
            for (let x = 0; x < columns; ++x) {
                for (let y = 0; y < lines; ++y) {
                    let collide: boolean = false;
                    if (v.tileproperties) {
                        let properties = v.tileproperties[y * v.columns + x];
                        if (properties && properties.collide === true) {
                            collide = true;
                        }
                    }
                    tileTextures[v.firstgid + y * v.columns + x] = {
                        texture: new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(x * v.tilewidth, y * v.tileheight, v.tilewidth, v.tileheight)),
                        collide: collide
                    };
                }
            }
        });
        return tileTextures;
    }

    private createMapTiles(tileTextures: Tile[], mapData: TiledMapData) {
        let container = new PIXI.Container();
        mapData.layers.filter(l =>  l.type === "tilelayer").forEach((layer: ITilesetLayer) => {
            layer.data.forEach((v, i) => {
                if (v === 0) {
                    return;
                }
                let col = i % mapData.width;
                let lin = Math.floor(i / mapData.width);
                let sprite = new PIXI.Sprite(tileTextures[v].texture);
                sprite.x = col * mapData.tilewidth;
                sprite.y = lin * mapData.tileheight;
                container.addChild(sprite);
            });
        });
        return container;
    }

    private createMapBody(tiles: Tile[], mapData: TiledMapData) {
        let bodies: Matter.Body[] = [];
        mapData.layers.filter(l =>  l.type === "tilelayer").forEach((layer: ITilesetLayer) => {
            layer.data.forEach((v, i) => {
                if (v === 0) {
                    return;
                }
                let col = i % mapData.width;
                let lin = Math.floor(i / mapData.width);
                let x = col * mapData.tilewidth;
                let y = lin * mapData.tileheight;
                if (tiles[v].collide === true) {
                    let tex = tiles[v].texture;
                    bodies.push(Matter.Bodies.rectangle(x, y, tex.width, tex.height, {
                        isStatic: true
                    }));
                }
            });
        });
        return bodies;
    }

    private createFastCachedDisplay(container: PIXI.Container) {
        let parent = new PIXI.Container();
        let bounds = container.getBounds();
        let col = bounds.width / MAP_SPLIT_SIZE;
        let lin = bounds.height / MAP_SPLIT_SIZE;
        for (let x = 0; x < col; ++x) {
            for (let y = 0; y < lin; ++y) {
                container.x = -x * MAP_SPLIT_SIZE;
                container.y = -y * MAP_SPLIT_SIZE;
                let rt = PIXI.RenderTexture.create(MAP_SPLIT_SIZE, MAP_SPLIT_SIZE);
                this.world.renderer.render(container, rt);
                let sprite = new PIXI.Sprite(rt);
                sprite.x = x * MAP_SPLIT_SIZE;
                sprite.y = y * MAP_SPLIT_SIZE;
                parent.addChild(sprite);
            }
        }
        return parent;
    }

    private loadMapTextures(mapData: TiledMapData) {
        mapData.tilesets.map((v, i) => {
            PIXI.loader.add(v.image, this.mapName + "/../" + v.image);
        });
        return new Promise(r => {
            PIXI.loader.load(r);
        });
    }

    public findSpawnZone() {
        let spawnZone = this.getZoneNamed("player-spawn");
        return new PIXI.Point(spawnZone.x, spawnZone.y);
    }

    public getZoneNamed(name: string) {
        let zone = this.getZoneNamedOptional(name);
        if (zone !== null) {
            return zone;
        }
        throw `No valid unique zone ${name} detected !`;
    }

    public getZoneNamedOptional(name: string) {
        let zones = this.getZonesLayer().filter(z => z.name === name);
        if (zones.length === 1) {
            return zones[0];
        }
        return null;
    }

    public getCreaturesLayer() {
        return this.getObjectLayer("world-creatures");
    }

    public getZonesLayer() {
        return this.getObjectLayer("world-zones");
    }

    public getObjectLayer(layerName: string) {
        let layers = this.mapData.layers.filter(l => l.type === "objectgroup" && l.name === layerName);
        if (layers.length === 1) {
            return (<IObjectLayer> layers[0]).objects;
        }
        throw `Cannot find object layer ${layerName}`;
    }

    public loadCreatures(player: Player) {
        return this.getCreaturesLayer().map(object => createPnj(object, this.world, player));
    }
}
