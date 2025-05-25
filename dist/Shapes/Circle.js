import { Shape } from "./Shape.js";
export class Circle extends Shape {
    constructor(originX, originY, radius) {
        super(originX, originY);
        this.radius = radius;
    }
    drawOn(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.arc(this.originX, this.originY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.fillColor;
        ctx.fill();
        ctx.strokeStyle = this.strokeColor;
        ctx.stroke();
        ctx.restore();
    }
}
//# sourceMappingURL=Circle.js.map