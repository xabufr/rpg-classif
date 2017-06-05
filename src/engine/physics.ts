import { GameObject } from "../game/gameObject";

export class Vector {
    public x: number;
    public y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    public clone() {
        return new Vector(this.x, this.y);
    }

    public copyFrom(other: Vector) {
        this.x = other.x;
        this.y = other.y;
    }
    public copyTo(other: Vector) {
        other.x = this.x;
        other.y = this.y;
    }
}
export class PhysicsWorld {
    private bodies: Body[];
    private map?: PhysicTiledMap;

    constructor() {
        this.bodies = [];
    }

    public setMap(map: PhysicTiledMap) {
        this.map = map;
    }

    public addBody(body: Body) {
        this.bodies.push(body);
    }

    public removeBody(body: Body) {
        let index = this.bodies.indexOf(body);
        if (index === -1) {
            throw `Cannot find body to remove`;
        }
        this.bodies.splice(index, 1);
    }

    public update(delta: number) {
        for (let i = 0; i < this.bodies.length; ++i) {
            let body = this.bodies[i];
            body.computeNewPosition(delta);
            if (this.collideWithMap(body) || this.willCollide(body)) {
                body.rollback();
            }
        }
    }

    public collideWithMap(body: Body) {
        if (this.map) {
            return this.map.isBodyInCollision(body);
        }
        return false;
    }

    private willCollide(body: Body) {
        for (let j = 0; j < this.bodies.length; ++j) {
            let body2 = this.bodies[j];
            if (body !== body2) {
                if (body.collides(body2)) {
                    return true;
                }
            }
        }
        return false;
    }
}

export class Body {
    public readonly position: Vector;
    public readonly size: Vector;
    public readonly velocity: Vector;
    private oldPosition: Vector;
    private gameObject: GameObject;

    constructor() {
        this.position = new Vector();
        this.size = new Vector();
        this.velocity = new Vector();
        this.oldPosition = new Vector();
    }

    public collides(other: Body): boolean {
        return this.position.x + this.size.x > other.position.x &&
            this.position.x < other.position.x + other.size.x &&
            this.position.y + this.size.y > other.position.y &&
            this.position.y < other.position.y + other.size.y;
    }

    public computeNewPosition(delta: number) {
        this.oldPosition.x = this.position.x;
        this.oldPosition.y = this.position.y;
        this.position.x += this.velocity.x * delta / 1000;
        this.position.y += this.velocity.y * delta / 1000;
    }

    public rollback() {
        this.position.x = this.oldPosition.x;
        this.position.y = this.oldPosition.y;
    }

    public setGameObject(gameObject: GameObject) {
        this.gameObject = gameObject;
    }

    public getGameObject() {
        return this.gameObject;
    }
}

export class PhysicTiledMap {
    private readonly collision: boolean[][];

    constructor(private tileWidth: number,
                private tileHeight: number,
                private mapWidth: number,
                private mapHeight: number) {
        this.collision = [];
        for (let i = 0; i < mapWidth; ++i) {
            this.collision[i] = [];
            for (let j = 0; j < mapHeight; ++j) {
                this.collision[i][j] = false;
            }
        }
    }

    public setCollide(tileX: number, tileY: number, collide: boolean) {
        this.collision[tileX][tileY] = collide;
    }

    public isBodyInCollision(body: Body) {
        if (!this.bodyInBounds(body)) {
            return true;
        }

        let startX = Math.floor(body.position.x / this.tileWidth);
        let endX = Math.floor((body.position.x + body.size.x) / this.tileWidth);
        let startY = Math.floor(body.position.y / this.tileHeight);
        let endY = Math.floor((body.position.y + body.size.y) / this.tileHeight);
        for (let x = startX; x <= endX; ++x) {
            for (let y = startY; y <= endY; ++y) {
                if (this.collision[x][y] === true) {
                    return true;
                }
            }
        }
        return false;
    }

    private bodyInBounds(body: Body) {
        return body.position.x >= 0 &&
            body.position.x + body.size.x <= this.mapWidth * this.tileHeight &&
            body.position.y >= 0 &&
            body.position.y + body.size.y <= this.mapHeight * this.tileHeight;
    }
}
