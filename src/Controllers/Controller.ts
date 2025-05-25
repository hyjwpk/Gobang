import { Model } from "../Models/Model.js";
import { View } from "../Views/View.js";
import { AI } from "../AIs/AI.js";
import { RandomAI } from "../AIs/RandomAI.js";
import { SimpleAI } from "../AIs/SimpleAI.js";

export class Controller {
    private game: Model;
    private view: View;
    private ai: AI;

    private canvas: HTMLCanvasElement;
    private originX: number;
    private originY: number;

    constructor(canvasId: string, rows: number, cols: number, cellSize: number) {
        this.game = new Model(rows, cols, cellSize);
        this.view = new View(canvasId);
        this.ai = new SimpleAI(this.game.chessboard);

        // 动态计算棋盘的起始坐标
        const boardWidth = cols * cellSize;
        const boardHeight = rows * cellSize;
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.originX = (this.canvas.width - boardWidth) / 2;
        this.originY = (this.canvas.height - boardHeight) / 2;

        this.game.chessboard.originX = this.originX;
        this.game.chessboard.originY = this.originY;
        this.view.drawChessboard(this.game.chessboard);
        this.registerEvents(cellSize);
    }

    private registerEvents(cellSize: number): void {
        this.canvas.addEventListener("click", (event) => {
            const rect = this.canvas.getBoundingClientRect(); // 获取 Canvas 的边界
            const x = event.clientX - rect.left; // 鼠标点击的 X 坐标
            const y = event.clientY - rect.top;  // 鼠标点击的 Y 坐标
            const col = Math.round((x - this.originX) / cellSize); // 使用 Math.round 计算列号
            const row = Math.round((y - this.originY) / cellSize); // 使用 Math.round 计算行号
        
            if (this.game.putChess(row, col)) {
                this.view.drawChess(this.game.chessboard, row, col, this.game.currentPlayer !== "black"); // 先修改棋盘状态，再绘制棋子，因此传入的 isBlack 需要取反

                const aiMove = this.ai.getMove();
                if (aiMove) {
                    const { row: aiRow, col: aiCol } = aiMove;
                    if (this.game.putChess(aiRow, aiCol)) {
                        this.view.drawChess(this.game.chessboard, aiRow, aiCol, this.game.currentPlayer !== "black");
                    }
                }
            }
        });
    }
}