var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AI } from "./AI.js";
// MCTS 树的节点类
class TreeNode {
    constructor(parent, priorP) {
        this.parent = parent;
        this.children = new Map(); // 子节点映射: action -> TreeNode
        this.nVisits = 0; // 访问次数
        this.Q = 0; // 节点价值
        this.u = 0; // 探索奖励
        this.P = priorP; // 先验概率
    }
    expand(actionProbs) {
        for (const [action, prob] of actionProbs) {
            if (!this.children.has(action)) {
                this.children.set(action, new TreeNode(this, prob));
            }
        }
    }
    select(cPuct) {
        let bestAction = null;
        let bestNode = null;
        let maxValue = -Infinity;
        for (const [action, node] of this.children) {
            const u = cPuct * node.P * Math.sqrt(this.nVisits) / (1 + node.nVisits);
            const value = node.Q + u;
            if (value > maxValue) {
                maxValue = value;
                bestAction = action;
                bestNode = node;
            }
        }
        return [bestAction, bestNode];
    }
    update(leafValue) {
        this.nVisits += 1;
        this.Q += (leafValue - this.Q) / this.nVisits;
    }
    updateRecursive(leafValue) {
        if (this.parent) {
            this.parent.updateRecursive(-leafValue);
        }
        this.update(leafValue);
    }
    isLeaf() {
        return this.children.size === 0;
    }
    isRoot() {
        return this.parent === null;
    }
}
// 使用 ONNX 推理的 AlphaAI 类（带 MCTS）
export class AlphaAI extends AI {
    constructor(chessboard, isBlack) {
        super(chessboard);
        this.modelPath = "dist/AIs/Models/policy_value_net.onnx";
        this.isBlack = isBlack; // 记录当前玩家是否为黑棋
        this.session = null;
        this.root = new TreeNode(null, 1.0); // MCTS 根节点
        this.cPuct = 5; // MCTS 探索因子
        this.nPlayout = 400; // 每次推理模拟次数
        this.loadModel();
    }
    loadModel() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.session = yield ort.InferenceSession.create(this.modelPath);
            }
            catch (err) {
                console.error("ONNX模型加载失败:", err);
            }
        });
    }
    // 获取 AI 的下一步动作
    getMove(lastMove) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.session)
                return null;
            // 判断 lastMove 的节点是否存在
            if (lastMove && this.root.children.has(lastMove.row * this.chessboard.cols + lastMove.col)) {
                this.root = this.root.children.get(lastMove.row * this.chessboard.cols + lastMove.col);
            }
            else {
                this.root = new TreeNode(null, 1.0); // 重置根节点
            }
            for (let i = 0; i < this.nPlayout; i++) {
                const boardCopy = this.copyBoard(this.chessboard);
                yield this.playout(boardCopy, lastMove);
            }
            // 从访问次数中选择最优动作
            let bestAction = null;
            let maxVisits = -1;
            for (const [action, node] of this.root.children) {
                if (node.nVisits > maxVisits) {
                    maxVisits = node.nVisits;
                    bestAction = action;
                }
            }
            console.log("评估值：", this.root.children.get(bestAction).Q);
            this.root = this.root.children.get(bestAction);
            const row = Math.floor(bestAction / this.chessboard.cols);
            const col = bestAction % this.chessboard.cols;
            return { row, col };
        });
    }
    // 执行一次模拟
    playout(state, lastMove) {
        return __awaiter(this, void 0, void 0, function* () {
            let node = this.root;
            let isBlackTurn = this.isBlack;
            let lastAction = lastMove.row * state.cols + lastMove.col;
            // 向下选择直到叶子节点
            while (!node.isLeaf()) {
                const [action, nextNode] = node.select(this.cPuct);
                const row = Math.floor(action / state.cols);
                const col = action % state.cols;
                state.putChess(row, col, isBlackTurn);
                isBlackTurn = !isBlackTurn;
                lastAction = action;
                node = nextNode;
            }
            // 调用策略价值函数进行推理
            const { policy, value } = yield this.policyValueFn(state, lastAction);
            let leafValue = value;
            // 非根节点则尝试判断胜负
            if (!node.isRoot()) {
                const lastAction = [...node.parent.children.keys()].find(key => node.parent.children.get(key) === node);
                const row = Math.floor(lastAction / state.cols);
                const col = lastAction % state.cols;
                const result = this.checkWinState(state, row, col);
                if (result.end) {
                    const currentPlayer = isBlackTurn;
                    if (result.winner === null) {
                        leafValue = 0.0;
                    }
                    else {
                        leafValue = result.winner === currentPlayer ? 1.0 : -1.0;
                    }
                }
                else {
                    node.expand(policy);
                }
            }
            else {
                node.expand(policy);
            }
            node.updateRecursive(-leafValue);
        });
    }
    // 调用模型返回策略概率与价值
    policyValueFn(board, lastAction) {
        return __awaiter(this, void 0, void 0, function* () {
            const input = this.createInputTensor(board, lastAction);
            const outputs = yield this.session.run({ input });
            const logProbs = Array.from(outputs.policy.data);
            const value = outputs.value.data[0];
            const legalMoves = this.getAvailableActions(board);
            const actProbs = legalMoves.map(i => [i, Math.exp(logProbs[i])]);
            return { policy: actProbs, value };
        });
    }
    // 构建模型输入张量
    createInputTensor(board, lastAction) {
        const rows = board.rows;
        const cols = board.cols;
        // 初始化输入张量，维度为 [4, rows, cols]
        const squareState = Array.from({ length: 4 }, () => Array.from({ length: rows }, () => new Float32Array(cols)));
        const totalMoves = board.board.flat().filter(c => c !== null).length;
        const isBlack = totalMoves % 2 === 0 ? true : false;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = board.board[row][col];
                // 当前玩家的棋子
                if (cell === isBlack)
                    squareState[0][row][col] = 1.0;
                // 对手玩家的棋子
                else if (cell !== null)
                    squareState[1][row][col] = 1.0;
            }
        }
        // 标记最后一步棋子位置
        const row_last = Math.floor(lastAction / cols);
        const col_last = lastAction % cols;
        squareState[2][row_last][col_last] = 1.0;
        // 标记是否先手
        if (totalMoves % 2 === 0) {
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    squareState[3][row][col] = 1.0;
                }
            }
        }
        // 翻转棋盘状态（沿行方向）
        squareState.forEach((plane, i) => {
            squareState[i] = plane.reverse();
        });
        // 将 squareState 转换为一维 Float32Array 并创建张量
        const inputData = new Float32Array(4 * rows * cols);
        let offset = 0;
        for (const plane of squareState) {
            for (const row of plane) {
                inputData.set(row, offset);
                offset += cols;
            }
        }
        return new ort.Tensor("float32", inputData, [1, 4, rows, cols]);
    }
    // 复制棋盘状态
    copyBoard(board) {
        const newBoard = Object.create(Object.getPrototypeOf(board));
        Object.assign(newBoard, board);
        newBoard.board = board.board.map(row => row.slice());
        return newBoard;
    }
    // 获取可行动作集合
    getAvailableActions(board) {
        const actions = [];
        for (let row = 0; row < board.rows; row++) {
            for (let col = 0; col < board.cols; col++) {
                if (board.board[row][col] === null) {
                    actions.push(row * board.cols + col);
                }
            }
        }
        return actions;
    }
    // 判断某一步是否胜利或平局
    checkWinState(board, lastRow, lastCol) {
        const isBlack = board.board[lastRow][lastCol] === true;
        const countInDirection = (dr, dc) => {
            let count = 0;
            let r = lastRow + dr, c = lastCol + dc;
            while (r >= 0 && r < board.rows &&
                c >= 0 && c < board.cols &&
                board.board[r][c] === isBlack) {
                count++;
                r += dr;
                c += dc;
            }
            return count;
        };
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1],
        ];
        for (const [dr, dc] of directions) {
            const total = 1 + countInDirection(dr, dc) + countInDirection(-dr, -dc);
            if (total >= 5)
                return { end: true, winner: isBlack };
        }
        const isFull = board.board.flat().every(cell => cell !== null);
        if (isFull)
            return { end: true, winner: null };
        return { end: false };
    }
    undoLastMove(lastMove) {
        this.root = new TreeNode(null, 1.0);
    }
}
//# sourceMappingURL=AlphaAI.js.map