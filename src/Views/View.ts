import { Chessboard } from "../Shapes/Chessboard.js";
import { ChessPiece } from "../Shapes/ChessPiece.js";

export class View {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private showNumbers: boolean = false; // 是否显示棋子序号
    private stepNumber: number = 1; // 当前步数

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;
    }

    // 切换是否显示棋子序号
    public toggleShowNumbers(): void {
        this.showNumbers = !this.showNumbers;
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

        // 绘制序号
        if (this.showNumbers) {
            this.ctx.fillStyle = isBlack ? "white" : "black"; // 序号颜色与棋子颜色相反
            this.ctx.font = "12px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.stepNumber.toString(), x, y + 4); // 序号居中显示
            this.stepNumber++; // 增加步数
        }
    }

    // 重绘棋盘
    public redrawChessboard(chessboard: Chessboard, moves: { row: number; col: number; isBlack: boolean }[]): void {
        this.stepNumber = 1; // 重置步数
        this.drawChessboard(chessboard); // 重新绘制棋盘
        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            this.drawChess(chessboard, move.row, move.col, move.isBlack);
        }
    }
}