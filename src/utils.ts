import Matter = require("matter-js");

interface Position {
    x: number;
    y: number;
}

export function distance(p1: Position, p2: Position) {
    let x = p1.x - p2.x;
    let y = p1.y - p2.y;
    return Math.sqrt(x * x + y * y);
}

interface Rectange {
    x: number;
    y: number;
    width: number;
    height: number;
}
export function rectToBody(rec: Rectange) {
    return Matter.Bodies.rectangle(rec.x + rec.width * 0.5,
                                   rec.y + rec.height * 0.5,
                                   rec.width,
                                   rec.height);
}
