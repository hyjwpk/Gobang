import { Chessboard } from "../Shapes/Chessboard.js";
export class Model {
    constructor(rows, cols, cellSize) {
        this.currentPlayer = "black";
        this.gameIsOver = false;
        this.chessboard = new Chessboard(0, 0, rows, cols, cellSize);
    }
    // 玩家在指定位置落子
    putChess(row, col) {
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
    checkWin(row, col) {
        // 检查横向、纵向、对角线是否有五子连珠
        this.gameIsOver = false; // 假设未结束
    }
}
//# sourceMappingURL=Model.js.map