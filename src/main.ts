import { Controller } from "./Controllers/Controller.js";
import { VERSION } from "./config.js";

window.onload = () => {
    const canvas = document.getElementById("game") as HTMLCanvasElement;

    // 定义棋盘参数
    const rows = 15; // 行数
    const cols = 15; // 列数

    // 动态计算单元格大小，确保棋盘适配页面大小
    const maxWidth = window.innerWidth - 50; // 页面宽度减去边距
    const maxHeight = window.innerHeight - 200; // 页面高度减去顶部和底部的空间
    const cellSize = Math.min(Math.floor(maxWidth / cols), Math.floor(maxHeight / rows));

    // 设置 Canvas 尺寸
    const boardWidth = (cols - 1) * cellSize;
    const boardHeight = (rows - 1) * cellSize;
    canvas.width = boardWidth + 50; // 给棋盘留出边距
    canvas.height = boardHeight + 50;

    // 初始化控制器并传递棋盘参数
    new Controller("game", rows, cols, cellSize);

    // 显示版本号
    const versionElement = document.getElementById("version");
    if (versionElement) {
        versionElement.textContent = `Version: ${VERSION}`;
    }
};