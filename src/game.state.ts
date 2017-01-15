import { Player } from "./player";

export class GameState extends Phaser.State {
    private map: Phaser.Tilemap;
    private layer: Phaser.TilemapLayer;
    private debugPhysics: boolean = true;
    private player: Player;

    public preload() {
        this.game.load.tilemap("map", "/assets/map.json", null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image("tileset", "/assets/Bureau/base prototype carte.png");
        this.game.load.spritesheet("player", "/assets/images/player.png", 32, 32);
    }

    public create() {
        this.game.stage.backgroundColor = "#787878";
        this.physics.startSystem(Phaser.Physics.ARCADE);


        this.map = this.add.tilemap("map");
        this.map.addTilesetImage("tileset", "tileset");
        this.map.addTilesetImage("test", "tileset");
        this.layer = this.map.createLayer("world-layer");
        this.layer.resizeWorld();
        this.layer.debug = true;
        this.map.setCollision(this.findCollisionTilesIndexes(this.map));
        // this.physics.p2.convertTilemap(this.map, layer).forEach(b => {
        //     b.debug = this.debugPhysics;
        // });
        this.player = new Player(this.game, "player", this.findSpawnZone(this.map));
        this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER, 0.1, 0.1);
    }

    public update() {
        this.player.update();
        this.game.physics.arcade.collide(this.player, this.layer, (player: any, tile: any) => {
        //     this.player.collide();
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

    public findSpawnZone(map: Phaser.Tilemap) {
        if ("world-zones" in map.objects) {
            let zones = (<any[]>(<any>map).objects["world-zones"]).filter((zone: any) => {
                return "properties" in zone && zone.properties.type === "player-spawn";
            });
            if (zones.length === 1) {
                return new Phaser.Point(zones[0].x, zones[0].y);
            }
            console.warn("Cannot find a valid spwn point !!!");
        }
        return new Phaser.Point(50, 50);
    }
}
