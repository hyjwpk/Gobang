import { Circle } from "./Circle.js";
export class ChessPiece extends Circle {
    constructor(originX, originY, radius, isBlack) {
        super(originX, originY, radius);
        this.fillColor = isBlack ? "black" : "white";
    }
    drawOn(ctx) {
        super.drawOn(ctx);
    }
}
//# sourceMappingURL=ChessPiece.js.map