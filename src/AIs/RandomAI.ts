import { Chessboard } from "../Shapes/Chessboard.js";

export class RandomAI {
    private chessboard: Chessboard;

    constructor(chessboard: Chessboard) {
        this.chessboard = chessboard;
    }

    // 获取随机落子位置
    public getMove(): { row: number; col: number } | null {
        const emptyPositions: { row: number; col: number }[] = [];

        // 遍历棋盘，收集所有空位置
        for (let row = 0; row < this.chessboard.rows; row++) {
            for (let col = 0; col < this.chessboard.cols; col++) {
                if (this.chessboard.board[row][col] === null) {
                    emptyPositions.push({ row, col });
                }
            }
        }

        // 如果没有空位置，返回 null
        if (emptyPositions.length === 0) {
            return null;
        }

        // 从空位置中随机选择一个
        const randomIndex = Math.floor(Math.random() * emptyPositions.length);
        return emptyPositions[randomIndex];
    }
}