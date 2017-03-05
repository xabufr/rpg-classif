export interface WorldObject {
    name: string;
    type: string;
    x: number;
    y: number;
    height?: number;
    width?: number;
    rectangle?: boolean;
}
