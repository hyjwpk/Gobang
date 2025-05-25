import { Chessboard } from "../Shapes/Chessboard.js";

export class Model {
    chessboard: Chessboard;
    currentPlayer: "black" | "white" = "black";
    gameIsOver: boolean = false;

    constructor(rows: number, cols: number, cellSize: number) {
        this.chessboard = new Chessboard(0, 0, rows, cols, cellSize);
    }

    // 玩家在指定位置落子
    public putChess(row: number, col: number): boolean {
        if (this.gameIsOver) {
            return false;
        }
        if (!this.chessboard.putChess(row, col, this.currentPlayer === "black")) {
            return false;
        }
        this.checkWin(row, col);
        this.currentPlayer = this.currentPlayer === "black" ? "white" : "black";
        return true;
    }

    // 检查是否获胜
    private checkWin(row: number, col: number): void {
        // 检查横向、纵向、对角线是否有五子连珠
        this.gameIsOver = false; // 假设未结束
    }
}