import { AI } from "./AI.js";
import { Chessboard } from "../Shapes/Chessboard.js";

export class SimpleAI extends AI {

    constructor(chessboard: Chessboard) {
        super(chessboard);
    }

    // 获取 AI 的下一步动作
    public getMove(): { row: number; col: number } | null {
        const scores: number[][] = this.initializeScores();

        // 遍历棋盘，计算每个空位置的分数
        for (let row = 0; row < this.chessboard.rows; row++) {
            for (let col = 0; col < this.chessboard.cols; col++) {
                if (this.chessboard.board[row][col] === null) {
                    // 这里谁是黑棋或白棋并不重要，因为我们都需要计算分数之和
                    // 模拟 AI 落子，计算分数
                    scores[row][col] = this.computeScore(row, col, true);

                    // 模拟对手落子，计算威胁分数
                    scores[row][col] += this.computeScore(row, col, false);
                }
            }
        }

        // 找到分数最高的位置
        let bestMove = null;
        let maxScore = -Infinity;
        for (let row = 0; row < this.chessboard.rows; row++) {
            for (let col = 0; col < this.chessboard.cols; col++) {
                if (scores[row][col] > maxScore && this.chessboard.board[row][col] === null) {
                    maxScore = scores[row][col];
                    bestMove = { row, col };
                }
            }
        }

        return bestMove;
    }

    // 初始化分数矩阵
    private initializeScores(): number[][] {
        return Array.from({ length: this.chessboard.rows }, () =>
            Array(this.chessboard.cols).fill(0)
        );
    }

    // 计算指定位置的分数
    private computeScore(row: number, col: number, isAI: boolean): number {
        const directions = [
            { dr: 0, dc: 1 },  // 水平方向
            { dr: 1, dc: 0 },  // 垂直方向
            { dr: 1, dc: 1 },  // 主对角线
            { dr: 1, dc: -1 }, // 副对角线
        ];

        let score = 0;
        for (const { dr, dc } of directions) {
            score += this.evaluateLine(row, col, dr, dc, isAI);
        }
        return score;
    }

    // 评估某个方向上的分数
    private evaluateLine(row: number, col: number, dr: number, dc: number, isAI: boolean): number {
        const target = isAI;
        let count = 0; // 连续的己方棋子数
        let block = 0; // 两端是否被堵住
        let empty = 0; // 空位数

        // 向反方向检查
        for (let step = 1; step <= 4; step++) {
            const r = row - dr * step;
            const c = col - dc * step;
            if (r < 0 || r >= this.chessboard.rows || c < 0 || c >= this.chessboard.cols) {
                block++;
                break;
            }
            const cell = this.chessboard.board[r][c];
            if (cell === target) {
                count++;
            } else if (cell === null) {
                empty++;
                break;
            } else {
                block++;
                break;
            }
        }

        // 向正方向检查
        for (let step = 1; step <= 4; step++) {
            const r = row + dr * step;
            const c = col + dc * step;
            if (r < 0 || r >= this.chessboard.rows || c < 0 || c >= this.chessboard.cols) {
                block++;
                break;
            }
            const cell = this.chessboard.board[r][c];
            if (cell === target) {
                count++;
            } else if (cell === null) {
                empty++;
                break;
            } else {
                block++;
                break;
            }
        }

        // 根据连子数和封堵情况计算分数
        if (count >= 4) return 100; // 五连
        if (count === 3 && block === 0) return 50; // 活四
        if (count === 3 && block === 1) return 10; // 冲四
        if (count === 2 && block === 0) return 5;  // 活三
        if (count === 2 && block === 1) return 2;  // 冲三
        if (count === 1 && block === 0) return 1;  // 活二
        if (count === 1 && block === 1) return 0;  // 冲二
        return 0;
    }
}