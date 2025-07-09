export type SudokuCell = number | null;
export type SudokuGrid = SudokuCell[][];
export type Position = { row: number; col: number };

export interface SudokuState {
  grid: SudokuGrid;
  isGenerating: boolean;
}
