var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Chessboard } from "../Shapes/Chessboard.js";
import { AlphaAI } from "../AIs/AlphaAI.js";
export class Model {
    constructor(rows, cols, cellSize, computerFirst) {
        this.currentPlayer = "black";
        this.moves = []; // 记录落子顺序
        this.gameIsOver = false;
        this.chessboard = new Chessboard(0, 0, rows, cols, cellSize);
        this.ai = new AlphaAI(this.chessboard, computerFirst); // AI 初始化
    }
    // 玩家在指定位置落子
    putChess(row, col) {
        if (this.gameIsOver) {
            return false;
        }
        if (!this.chessboard.putChess(row, col, this.currentPlayer === "black")) {
            return false;
        }
        this.moves.push({ row, col, isBlack: this.currentPlayer === "black" }); // 记录落子信息
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
    getMove(lastMove) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.gameIsOver) {
                return null;
            }
            const aiMove = yield this.ai.getMove(lastMove);
            return aiMove;
        });
    }
    undoLastMove() {
        if (this.gameIsOver === false && this.moves.length >= 2) {
            const lastMove = this.moves.pop(); // 移除最后一个落子
            if (lastMove) {
                this.chessboard.board[lastMove.row][lastMove.col] = null; // 清除棋盘上的最后一个落子
                this.ai.undoLastMove(lastMove);
            }
            const secondLastMove = this.moves.pop(); // 移除倒数第二个落子
            if (secondLastMove) {
                this.chessboard.board[secondLastMove.row][secondLastMove.col] = null; // 清除棋盘上的倒数第二个落子
                this.ai.undoLastMove(secondLastMove);
            }
        }
    }
}
//# sourceMappingURL=Model_alpha.js.map