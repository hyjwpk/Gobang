import { Shape } from "./Shape.js";
export class Rectangle extends Shape {
    constructor(originX, originY, width, height) {
        super(originX, originY);
        this.width = width;
        this.height = height;
    }
    drawOn(ctx) {
        ctx.fillRect(this.originX, this.originY, this.width, this.height);
    }
}
//# sourceMappingURL=Rectangle.js.map