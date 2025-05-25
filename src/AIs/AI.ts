import { Chessboard } from "../Shapes/Chessboard.js";

export abstract class AI {
    protected chessboard: Chessboard;

    constructor(chessboard: Chessboard) {
        this.chessboard = chessboard;
    }

    public abstract getMove(lastMove?: { row: number; col: number }): { row: number; col: number } | null;
}