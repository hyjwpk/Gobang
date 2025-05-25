import { Shape } from "./Shape.js";

export class Chessboard extends Shape {
    rows: number;
    cols: number;
    cellSize: number;
    board: (boolean | null)[][]; // 棋盘状态

    constructor(originX: number, originY: number, rows: number, cols: number, cellSize: number) {
        super(originX, originY);
        this.rows = rows;
        this.cols = cols;
        this.cellSize = cellSize;

        // 初始化棋盘状态为全空
        this.board = Array.from({ length: rows }, () => Array(cols).fill(null));
    }

    drawOn(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        // 绘制横线
        for (let i = 0; i <= this.rows; i++) {
            const y = this.originY + i * this.cellSize;
            ctx.beginPath();
            ctx.moveTo(this.originX, y);
            ctx.lineTo(this.originX + this.cols * this.cellSize, y);
            ctx.stroke();
        }

        // 绘制竖线
        for (let i = 0; i <= this.cols; i++) {
            const x = this.originX + i * this.cellSize;
            ctx.beginPath();
            ctx.moveTo(x, this.originY);
            ctx.lineTo(x, this.originY + this.rows * this.cellSize);
            ctx.stroke();
        }

        ctx.restore();
    }

    // 检查指定位置是否已有棋子
    hasChess(row: number, col: number): boolean {
        return this.board[row][col] !== null;
    }

    // 在指定位置放置棋子
    putChess(row: number, col: number, isBlack: boolean): boolean {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return false; // 超出棋盘范围
        }
        if (this.hasChess(row, col)) {
            return false; // 该位置已有棋子，无法放置
        }
        this.board[row][col] = isBlack;
        return true;
    }
}