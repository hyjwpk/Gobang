import { AI } from "./AI.js";
import { Chessboard } from "../Shapes/Chessboard.js";

export class MiniMaxAI extends AI {
    // 评分表：定义棋型及其对应的分数
    private static ScoreTable = {
        "11111": 50000,
        "+1111+": 4320,
        "+111++": 720,
        "++111+": 720,
        "+11+1+": 720,
        "+1+11+": 720,
        "1111+": 720,
        "+1111": 720,
        "11+11": 720,
        "1+111": 720,
        "111+1": 720,
        "++11++": 120,
        "++1+1+": 120,
        "+1+1++": 120,
        "+++1++": 20,
        "++1+++": 20,
    };

    private isBlack: boolean; // AI 的棋子颜色，true 表示黑棋，false 表示白棋
    private myLineScores: number[]; // 己方每条线的分数
    private opponentLineScores: number[]; // 对方每条线的分数
    private myTotalScore: number; // 己方的总分
    private opponentTotalScore: number; // 对方的总分

    constructor(chessboard: Chessboard, isBlack: boolean) {
        super(chessboard);
        this.isBlack = isBlack; // 初始化 AI 的棋子颜色

        // 初始化线分数矩阵
        const totalLines = chessboard.rows + chessboard.cols + (chessboard.rows + chessboard.cols - 1) * 2;;
        this.myLineScores = Array(totalLines).fill(0);
        this.opponentLineScores = Array(totalLines).fill(0);

        // 初始化总分
        this.myTotalScore = 0;
        this.opponentTotalScore = 0;
    }

    // 获取最佳落子位置
    public getMove(lastMove: { row: number; col: number }): { row: number; col: number } | null {
        this.updateLineScores(lastMove.row, lastMove.col); // 更新线分数

        const bestMove = this.minimax(5, true, -Infinity, Infinity).move; // 使用极大极小算法获取最佳落子位置

        if (bestMove) {
            this.chessboard.board[bestMove.row][bestMove.col] = this.isBlack; // 假设 AI 落子
            this.updateLineScores(bestMove.row, bestMove.col)
            this.chessboard.board[bestMove.row][bestMove.col] = null; // 恢复棋盘
        }

        return bestMove;
    }

    private updateLineScores(row: number, col: number): void {
        const directions = [
            { dr: 0, dc: 1 },  // 水平
            { dr: 1, dc: 0 },  // 垂直
            { dr: 1, dc: 1 },  // 主对角线
            { dr: 1, dc: -1 }, // 副对角线
        ];

        for (let i = 0; i < directions.length; i++) {
            const { dr, dc } = directions[i];

            // 直接计算线的起点
            let startRow = row;
            let startCol = col;

            if (dr === 0) {
                // 水平线
                startRow = row;
                startCol = 0;
            } else if (dc === 0) {
                // 垂直线
                startRow = 0;
                startCol = col;
            } else if (dr === 1 && dc === 1) {
                // 主对角线
                const offset = Math.min(row, col);
                startRow = row - offset;
                startCol = col - offset;
            } else if (dr === 1 && dc === -1) {
                // 副对角线
                const offset = Math.min(row, this.chessboard.cols - 1 - col);
                startRow = row - offset;
                startCol = col + offset;
            }

            // 获取线索引
            const lineIndex = this.getLineIndex(row, col, dr, dc);

            // 使用 getLine 获取整条线的字符串
            const myLine = this.getLine(startRow, startCol, dr, dc, this.isBlack);
            const opponentLine = this.getLine(startRow, startCol, dr, dc, !this.isBlack);

            // 更新分数矩阵
            this.myTotalScore -= this.myLineScores[lineIndex];
            this.opponentTotalScore -= this.opponentLineScores[lineIndex];
            this.myLineScores[lineIndex] = this.evaluateLine(myLine);
            this.opponentLineScores[lineIndex] = this.evaluateLine(opponentLine);
            this.myTotalScore += this.myLineScores[lineIndex];
            this.opponentTotalScore += this.opponentLineScores[lineIndex];
        }
    }

    private getLineIndex(row: number, col: number, dr: number, dc: number): number {
        if (dr === 0) {
            // 水平线
            return row;
        } else if (dc === 0) {
            // 垂直线
            return this.chessboard.rows + col;
        } else if (dr === 1 && dc === 1) {
            // 主对角线
            return this.chessboard.rows + this.chessboard.cols + (row - col + (this.chessboard.cols - 1));
        } else if (dr === 1 && dc === -1) {
            // 副对角线
            return this.chessboard.rows + this.chessboard.cols + (this.chessboard.rows + this.chessboard.cols - 1) + (row + col);
        }
        throw new Error("Invalid direction");
    }

    // 获取某个方向上的棋子状态
    private getLine(row: number, col: number, dr: number, dc: number, isBlack: boolean): string {
        const line = [];
        const rows = this.chessboard.rows;
        const cols = this.chessboard.cols;

        while (row >= 0 && row < rows && col >= 0 && col < cols) {
            const cell = this.chessboard.board[row][col];
            if (cell === null) {
                line.push("+"); // 空位
            } else if (cell === isBlack) {
                line.push("1"); // 己方棋子
            } else {
                line.push("0"); // 对手棋子
            }
            row += dr;
            col += dc;
        }

        return line.join("");
    }

    // 评估一行棋型的分数
    private evaluateLine(line: string): number {
        let score = 0;
        const matched: boolean[] = new Array(line.length).fill(false);

        for (const pattern of Object.keys(MiniMaxAI.ScoreTable) as Array<keyof typeof MiniMaxAI.ScoreTable>) {
            const patternLength = pattern.length;
            let startIndex = 0;

            while ((startIndex = line.indexOf(pattern, startIndex)) !== -1) {
                // 检查 pattern 中 '1' 对应的 line 区域是否已被标记
                let conflict = false;
                for (let i = 0; i < patternLength; i++) {
                    if (pattern[i] === '1' && matched[startIndex + i]) {
                        conflict = true;
                        break;
                    }
                }

                if (!conflict) {
                    score += MiniMaxAI.ScoreTable[pattern];

                    // 标记本次匹配中所有 '1' 所在的位置
                    for (let i = 0; i < patternLength; i++) {
                        if (pattern[i] === '1') {
                            matched[startIndex + i] = true;
                        }
                    }
                }

                startIndex++;
            }
        }

        return score;
    }

    // 极大极小搜索
    private minimax(depth: number, isMaximizing: boolean, alpha: number, beta: number): { score: number, move: { row: number, col: number } | null } {
        if (depth === 0) {
            // 到达最大深度，返回当前棋盘的评估分数
            return {
                score: this.evaluateBoard(),
                move: null
            };
        }

        let bestMove: { row: number, col: number } | null = null;
        let bestScore = isMaximizing ? -Infinity : Infinity;

        // 获取候选点
        const candidates = this.getCandidatePositions(isMaximizing);

        for (const { row, col } of candidates) {
            // 假设落子
            this.chessboard.board[row][col] = isMaximizing ? this.isBlack : !this.isBlack;
            this.updateLineScores(row, col); // 更新线分数

            // 检查游戏是否结束
            const result = this.checkWin(row, col)
                ? this.minimax(0, !isMaximizing, alpha, beta) // 如果游戏结束，直接调用 minimax，深度为 0
                : this.minimax(depth - 1, !isMaximizing, alpha, beta); // 否则继续递归调用 minimax

            // 恢复棋盘状态
            this.chessboard.board[row][col] = null;
            this.updateLineScores(row, col); // 恢复线分数

            // 更新最佳分数和最佳落子位置
            if (isMaximizing) {
                if (result.score > bestScore) {
                    bestScore = result.score;
                    bestMove = { row, col };
                }
                alpha = Math.max(alpha, bestScore); // 更新 alpha
            } else {
                if (result.score < bestScore) {
                    bestScore = result.score;
                    bestMove = { row, col };
                }
                beta = Math.min(beta, bestScore); // 更新 beta
            }

            // 剪枝
            if (alpha >= beta) {
                return {
                    score: bestScore,
                    move: bestMove
                };
            }
        }

        // 如果没有合法落点，返回当前局面分
        if (bestMove === null) {
            return {
                score: this.evaluateBoard(),
                move: null
            };
        }

        return {
            score: bestScore,
            move: bestMove
        };
    }

    private getCandidatePositions(isMaximizing: boolean): { row: number, col: number }[] {
        const candidates: { row: number, col: number, score: number }[] = [];
        const directions = [
            { dr: -1, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: 1 },
            { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
            { dr: 1, dc: -1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 },
        ];

        for (let row = 0; row < this.chessboard.rows; row++) {
            for (let col = 0; col < this.chessboard.cols; col++) {
                if (this.chessboard.board[row][col] === null) { // 检查是否为空
                    let hasNeighbor = false;

                    // 检查周围是否有棋子
                    for (const { dr, dc } of directions) {
                        const neighborRow = row + dr;
                        const neighborCol = col + dc;

                        if (
                            neighborRow >= 0 && neighborRow < this.chessboard.rows &&
                            neighborCol >= 0 && neighborCol < this.chessboard.cols &&
                            this.chessboard.board[neighborRow][neighborCol] !== null
                        ) {
                            hasNeighbor = true;
                            break;
                        }
                    }

                    if (hasNeighbor) {
                        // 模拟落子并计算分数
                        this.chessboard.board[row][col] = isMaximizing ? this.isBlack : !this.isBlack;
                        this.updateLineScores(row, col);
                        const score = this.evaluateBoard();
                        this.chessboard.board[row][col] = null;
                        this.updateLineScores(row, col);

                        candidates.push({ row, col, score });
                    }
                }
            }
        }

        // 根据分数排序
        candidates.sort((a, b) => isMaximizing ? b.score - a.score : a.score - b.score);

        // 只取前十个候选点
        const topCandidates = candidates.slice(0, 10);

        // 返回排序后的候选点（去掉分数字段）
        return topCandidates.map(({ row, col }) => ({ row, col }));
    }

    // 评估整个棋盘的分数
    private evaluateBoard(): number {
        return this.myTotalScore - this.opponentTotalScore;
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
        const isBlack = this.chessboard.board[row][col] === true;
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
}