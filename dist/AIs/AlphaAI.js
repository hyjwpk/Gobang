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
export class AlphaAI extends AI {
    constructor(chessboard, isBlack) {
        super(chessboard);
        this.modelPath = "dist/AIs/Models/policy_value_net.onnx";
        this.isBlack = isBlack; // 记录当前玩家是否为黑棋
        this.session = null;
        this.loadModel();
    }
    // 加载 ONNX 模型
    loadModel() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.session = yield ort.InferenceSession.create(this.modelPath);
            }
            catch (error) {
                console.error("加载 ONNX 模型失败:", error);
            }
        });
    }
    // 获取 AI 的下一步动作
    getMove(lastMove) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.session) {
                console.error("模型未加载");
                return null;
            }
            try {
                // 将棋盘状态转换为模型输入
                const inputTensor = this.createInputTensor(lastMove);
                // 推理
                const feeds = { input: inputTensor };
                const results = yield this.session.run(feeds);
                // 获取模型输出
                const policy = results.policy.data;
                const value = results.value.data;
                // 从 policy 中选择概率最大的落子位置
                const [row, col] = this.parsePolicy(policy);
                console.log(`评估值: ${value[0]}`); // 输出评估值
                return { row, col };
            }
            catch (error) {
                console.error("模型推理失败:", error);
                return null;
            }
        });
    }
    // 创建输入张量
    createInputTensor(lastMove) {
        const rows = this.chessboard.rows; // 棋盘高度
        const cols = this.chessboard.cols; // 棋盘宽度
        // 初始化输入张量，维度为 [4, rows, cols]
        const squareState = Array.from({ length: 4 }, () => Array.from({ length: rows }, () => new Float32Array(cols)));
        // 遍历棋盘状态，填充 squareState
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = this.chessboard.board[row][col];
                if (cell === this.isBlack) {
                    // 当前玩家的棋子
                    squareState[0][row][col] = 1.0;
                }
                else if (cell !== null) {
                    // 对手玩家的棋子
                    squareState[1][row][col] = 1.0;
                }
            }
        }
        // 标记最后一步棋子位置
        if (lastMove) {
            const { row, col } = lastMove;
            squareState[2][row][col] = 1.0;
        }
        // 标记是否先手
        const totalMoves = this.chessboard.board.flat().filter(cell => cell !== null).length;
        if (totalMoves % 2 === 0) {
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    squareState[3][row][col] = 1.0;
                }
            }
        }
        // 翻转棋盘状态（沿行方向）
        squareState.forEach((plane, index) => {
            squareState[index] = plane.reverse();
        });
        // 将 squareState 转换为一维 Float32Array 并创建张量
        const inputData = new Float32Array(rows * cols * 4);
        let offset = 0;
        for (let plane of squareState) {
            for (let row of plane) {
                inputData.set(row, offset);
                offset += cols;
            }
        }
        return new ort.Tensor("float32", inputData, [1, 4, rows, cols]); // 假设模型输入为 [1, 4, rows, cols]
    }
    // 从 policy 中解析落子位置
    parsePolicy(policy) {
        const cols = this.chessboard.cols;
        let maxValue = -Infinity;
        let maxIndex = null;
        for (let i = 0; i < policy.length; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            if (this.chessboard.board[row][col] === null && policy[i] > maxValue) {
                maxValue = policy[i];
                maxIndex = i;
            }
        }
        if (maxIndex === null) {
            return null;
        }
        const row = Math.floor(maxIndex / cols);
        const col = maxIndex % cols;
        return [row, col];
    }
    undoLastMove(lastMove) { }
}
//# sourceMappingURL=AlphaAI.js.map