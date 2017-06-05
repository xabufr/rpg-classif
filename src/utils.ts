export interface Position {
    x: number;
    y: number;
}

export function distance(p1: Position, p2: Position) {
    let x = p1.x - p2.x;
    let y = p1.y - p2.y;
    return Math.sqrt(x * x + y * y);
}
