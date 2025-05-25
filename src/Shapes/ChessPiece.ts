import { Circle } from "./Circle.js";

export class ChessPiece extends Circle {
    constructor(originX: number, originY: number, radius: number, isBlack: boolean) {
        super(originX, originY, radius);
        this.fillColor = isBlack ? "black" : "white";
    }

    drawOn(ctx: CanvasRenderingContext2D): void {
        super.drawOn(ctx);
    }
}