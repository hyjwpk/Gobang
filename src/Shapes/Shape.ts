export abstract class Shape {
    static DefaultLineWidth = 1;
    static DefaultLineColor = "black";
    static DefualtFillColor = "white";

    originX: number;
    originY: number;

    lineWidth: number;
    strokeColor: string;
    fillColor: string;

    constructor(originX: number, originY: number) {
        this.originX = originX;
        this.originY = originY;
        this.lineWidth = Shape.DefaultLineWidth;
        this.strokeColor = Shape.DefaultLineColor;
        this.fillColor = Shape.DefualtFillColor;
    }

    // 抽象方法，子类必须实现
    abstract drawOn(ctx: CanvasRenderingContext2D): void;
}