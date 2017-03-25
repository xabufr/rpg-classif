export enum Direction {
    UP = -Math.PI / 2,
    DOWN = Math.PI / 2,
    RIGHT = 0,
    LEFT = Math.PI,
}

export const Directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];

export function getDirectionVector(dir: Direction, length: number) {
    return {
        x: Math.cos(dir) * length,
        y: Math.sin(dir) * length
    };
}
