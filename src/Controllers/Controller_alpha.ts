import { Model } from "../Models/Model_alpha.js";
import { View } from "../Views/View.js";

export class Controller {
    private model: Model;
    private view: View;

    private canvas: HTMLCanvasElement;
    private originX: number;
    private originY: number;
    private computerFirst: boolean = true; // 是否电脑先手

    constructor(canvasId: string, rows: number, cols: number, cellSize: number) {
        // 动态计算棋盘的起始坐标
        this.model = new Model(rows, cols, cellSize, this.computerFirst);
        const boardWidth = (cols - 1) * cellSize;
        const boardHeight = (rows - 1) * cellSize;
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.originX = (this.canvas.width - boardWidth) / 2;
        this.originY = (this.canvas.height - boardHeight) / 2;
        this.model.chessboard.originX = this.originX;
        this.model.chessboard.originY = this.originY;

        this.view = new View(canvasId);
        this.view.drawChessboard(this.model.chessboard);

        this.registerClickEvent(cellSize);
        this.registerStartGameEvent();
        this.registerUndoEvent();
        this.registerComputerFirstEvent();
        this.registerToggleNumberEvent();

        // 如果电脑先手，AI 落子
        if (this.computerFirst) {
            const aiMove = { row: Math.floor(rows / 2), col: Math.floor(cols / 2) }; // AI 的第一步
            if (aiMove) {
                const { row: aiRow, col: aiCol } = aiMove;
                if (this.model.putChess(aiRow, aiCol)) {
                    this.view.drawChess(this.model.chessboard, aiRow, aiCol, this.model.currentPlayer !== "black");
                }
            }
        }
    }

    private registerClickEvent(cellSize: number): void {
        this.canvas.addEventListener("click", async (event) => {
            const rect = this.canvas.getBoundingClientRect(); // 获取 Canvas 的边界
            const x = event.clientX - rect.left; // 鼠标点击的 X 坐标
            const y = event.clientY - rect.top;  // 鼠标点击的 Y 坐标
            const col = Math.round((x - this.originX) / cellSize); // 使用 Math.round 计算列号
            const row = Math.round((y - this.originY) / cellSize); // 使用 Math.round 计算行号

            if (this.model.putChess(row, col)) {
                this.view.drawChess(this.model.chessboard, row, col, this.model.currentPlayer !== "black"); // 先修改棋盘状态，再绘制棋子，因此传入的 isBlack 需要取反
                if (this.model.gameIsOver) {
                    alert(`${this.model.currentPlayer === "black" ? "白方" : "黑方"}获胜！`);
                    return; // 游戏结束后不再处理 AI 落子
                }

                const aiMove = await this.model.getMove({ row, col }); // 获取 AI 的落子位置
                if (aiMove) {
                    const { row: aiRow, col: aiCol } = aiMove;
                    if (this.model.putChess(aiRow, aiCol)) {
                        this.view.drawChess(this.model.chessboard, aiRow, aiCol, this.model.currentPlayer !== "black");
                        if (this.model.gameIsOver) {
                            alert(`${this.model.currentPlayer === "black" ? "白方" : "黑方"}获胜！`);
                        }
                    }
                }
            }
        });
    }

    private registerStartGameEvent(): void {
        const startButton = document.getElementById("startButton") as HTMLButtonElement;
        if (startButton) {
            startButton.addEventListener("click", () => {
                // 重置模型和视图
                this.model = new Model(this.model.chessboard.rows, this.model.chessboard.cols, this.model.chessboard.cellSize, this.computerFirst);
                this.model.chessboard.originX = this.originX;
                this.model.chessboard.originY = this.originY;
                this.view.redrawChessboard(this.model.chessboard, []);

                // 如果电脑先手，AI 落子
                if (this.computerFirst) {
                    const aiMove = { row: Math.floor(this.model.chessboard.rows / 2), col: Math.floor(this.model.chessboard.cols / 2) }; // AI 的第一步
                    if (aiMove) {
                        const { row: aiRow, col: aiCol } = aiMove;
                        if (this.model.putChess(aiRow, aiCol)) {
                            this.view.drawChess(this.model.chessboard, aiRow, aiCol, this.model.currentPlayer !== "black");
                        }
                    }
                }
            });
        }
    }

    private registerUndoEvent(): void {
        const undoButton = document.getElementById("undoButton") as HTMLButtonElement;
        if (undoButton) {
            undoButton.addEventListener("click", () => {
                this.model.undoLastMove(); // 撤销最近的两步棋（玩家和 AI）
                this.view.redrawChessboard(this.model.chessboard, this.model.moves); // 重新绘制棋盘
            });
        }
    }

    private registerComputerFirstEvent(): void {
        const computerFirstSwitch = document.getElementById("computerFirstSwitch") as HTMLInputElement;
        if (computerFirstSwitch) {
            computerFirstSwitch.addEventListener("change", () => {
                this.computerFirst = computerFirstSwitch.checked; // 更新电脑先手状态
            });
        }
    }

    private registerToggleNumberEvent(): void {
        const toggleSwitch = document.getElementById("toggleNumbers") as HTMLInputElement;
        if (toggleSwitch) {
            toggleSwitch.addEventListener("change", () => {
                this.view.toggleShowNumbers(); // 切换是否显示棋子序号
                this.view.redrawChessboard(this.model.chessboard, this.model.moves); // 重新绘制棋盘
            });
        }
    }
}