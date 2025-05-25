import { Controller } from "./Controllers/Controller.js";

window.onload = () => {
    const canvas = document.getElementById("game") as HTMLCanvasElement;

    // 定义棋盘参数
    const cellSize = 30; // 单元格大小
    const rows = 15;
    const cols = 15;

    // 设置 Canvas 尺寸
    const boardWidth = cols * cellSize;
    const boardHeight = rows * cellSize;
    canvas.width = boardWidth + 100; // 给棋盘留出边距
    canvas.height = boardHeight + 100;

    // 初始化控制器并传递棋盘参数
    new Controller("game", rows, cols, cellSize);
};