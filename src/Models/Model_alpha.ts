import { Chessboard } from "../Shapes/Chessboard.js";
import { AlphaAI } from "../AIs/AlphaAI.js";

export class Model {
    public chessboard: Chessboard;
    public currentPlayer: "black" | "white" = "black";
    public moves: { row: number; col: number; isBlack: boolean }[] = []; // 记录落子顺序
    public gameIsOver: boolean = false;
    private ai;

    constructor(rows: number, cols: number, cellSize: number, computerFirst: boolean) {
        this.chessboard = new Chessboard(0, 0, rows, cols, cellSize);
        this.ai = new AlphaAI(this.chessboard, computerFirst); // AI 初始化
    }

    // 玩家在指定位置落子
    public putChess(row: number, col: number): boolean {
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
    private checkWin(row: number, col: number): boolean {
        return (
            this.checkDirection(row, col, 0, 1) || // 横向
            this.checkDirection(row, col, 1, 0) || // 纵向
            this.checkDirection(row, col, 1, 1) || // 主对角线
            this.checkDirection(row, col, 1, -1)  // 副对角线
        );
    }

    // 检查某个方向是否有五子连珠
    private checkDirection(row: number, col: number, deltaRow: number, deltaCol: number): boolean {
        const isBlack = this.currentPlayer === "black";
        let count = 1;

        // 检查正方向
        count += this.countInDirection(row, col, deltaRow, deltaCol, isBlack);

        // 检查反方向
        count += this.countInDirection(row, col, -deltaRow, -deltaCol, isBlack);

        return count >= 5;
    }

    // 统计某个方向上的连续棋子数
    private countInDirection(row: number, col: number, deltaRow: number, deltaCol: number, isBlack: boolean): number {
        let count = 0;
        let currentRow = row + deltaRow;
        let currentCol = col + deltaCol;

        while (
            currentRow >= 0 &&
            currentRow < this.chessboard.rows &&
            currentCol >= 0 &&
            currentCol < this.chessboard.cols &&
            this.chessboard.board[currentRow][currentCol] === isBlack
        ) {
            count++;
            currentRow += deltaRow;
            currentCol += deltaCol;
        }

        return count;
    }

    public async getMove(lastMove?: { row: number; col: number }): Promise<{ row: number; col: number } | null> {
        if (this.gameIsOver) {
            return null;
        }
        const aiMove = await this.ai.getMove(lastMove);
        return aiMove;
    }

    public undoLastMove(): void {
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