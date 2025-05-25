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
        if (this.checkWin(row, col)) {
            this.gameIsOver = true;
        }
        this.currentPlayer = this.currentPlayer === "black" ? "white" : "black";
        return true;
    }
    // 检查是否获胜
    checkWin(row, col) {
        return (this.checkDirection(row, col, 0, 1) || // 横向
            this.checkDirection(row, col, 1, 0) || // 纵向
            this.checkDirection(row, col, 1, 1) || // 主对角线
            this.checkDirection(row, col, 1, -1) // 副对角线
        );
    }
    // 检查某个方向是否有五子连珠
    checkDirection(row, col, deltaRow, deltaCol) {
        const isBlack = this.currentPlayer === "black";
        let count = 1;
        // 检查正方向
        count += this.countInDirection(row, col, deltaRow, deltaCol, isBlack);
        // 检查反方向
        count += this.countInDirection(row, col, -deltaRow, -deltaCol, isBlack);
        return count >= 5;
    }
    // 统计某个方向上的连续棋子数
    countInDirection(row, col, deltaRow, deltaCol, isBlack) {
        let count = 0;
        let currentRow = row + deltaRow;
        let currentCol = col + deltaCol;
        while (currentRow >= 0 &&
            currentRow < this.chessboard.rows &&
            currentCol >= 0 &&
            currentCol < this.chessboard.cols &&
            this.chessboard.board[currentRow][currentCol] === isBlack) {
            count++;
            currentRow += deltaRow;
            currentCol += deltaCol;
        }
        return count;
    }
}
//# sourceMappingURL=Model.js.map