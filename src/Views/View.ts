import { Chessboard } from "../Shapes/Chessboard.js";
import { ChessPiece } from "../Shapes/ChessPiece.js";

export class View {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;
    }

    // 绘制棋盘
    public drawChessboard(chessboard: Chessboard): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        chessboard.drawOn(this.ctx);
    }

    // 绘制棋子
    public drawChess(chessboard: Chessboard, row: number, col: number, isBlack: boolean): void {
        const cellSize = chessboard.cellSize;
        const originX = chessboard.originX;
        const originY = chessboard.originY;

        const x = originX + col * cellSize;
        const y = originY + row * cellSize;
        const chessPiece = new ChessPiece(x, y, cellSize / 2 - 3, isBlack); // 棋子半径为单元格大小的一半减去边距
        chessPiece.drawOn(this.ctx);
    }
}