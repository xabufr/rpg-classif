export interface Vector {
    x: number;
    y: number;
}
class VectorImpl implements Vector {
    public x: number;
    public y: number;

    constructor() {
        this.x = 0;
        this.y = 0;
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

    public update(delta: number) {
        for (let i = 0; i < this.bodies.length; ++i) {
            let willCollide = false;
            let body = this.bodies[i];
            if (this.collideWithMap(body) || body.computeNewPosition(delta)) {
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

    constructor() {
        this.position = new VectorImpl();
        this.size = new VectorImpl();
        this.velocity = new VectorImpl();
        this.oldPosition = new VectorImpl();
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
        let startX = Math.floor(body.position.x / this.tileWidth);
        let endX = Math.floor((body.position.x + body.size.x) / this.tileWidth);
        let startY = Math.floor(body.position.y / this.tileHeight);
        let endY = Math.floor((body.position.y + body.size.y) / this.tileHeight);
        for (let x = startX; x <= endX; ++x) {
            for (let y = startY; y <= endY; ++y) {
                if (this.collision[x][y] === true) {
                    console.log(x, y);
                    return true;
                }
            }
        }
        return false;
    }
}
