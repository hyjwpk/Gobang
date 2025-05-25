import { ChessPiece } from "../Shapes/ChessPiece.js";
export class View {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
    }
    // 绘制棋盘
    drawChessboard(chessboard) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        chessboard.drawOn(this.ctx);
    }
    // 绘制棋子
    drawChess(chessboard, row, col, isBlack) {
        const cellSize = chessboard.cellSize;
        const originX = chessboard.originX;
        const originY = chessboard.originY;
        const x = originX + col * cellSize;
        const y = originY + row * cellSize;
        const chessPiece = new ChessPiece(x, y, cellSize / 2 - 3, isBlack); // 棋子半径为单元格大小的一半减去边距
        chessPiece.drawOn(this.ctx);
    }
}
//# sourceMappingURL=View.js.map