export type SudokuCell = number | null;
export type PencilMarks = Set<number>;
export type SudokuCellWithPencils = {
  value: SudokuCell;
  pencils: PencilMarks;
  answer: SudokuCell;
  showAnswer: boolean;
};
export type SudokuGrid = SudokuCell[][];
export type SudokuGridWithPencils = SudokuCellWithPencils[][];
export type Position = { row: number; col: number };

export interface SudokuState {
  grid: SudokuGrid;
  isGenerating: boolean;
}

export interface SudokuStateWithPencils {
  grid: SudokuGridWithPencils;
  isGenerating: boolean;
  isPencilMode: boolean;
}
