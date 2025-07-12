import { SudokuGridWithPencils } from '@/types/sudoku';


export function stepSolve(prevGrid: SudokuGridWithPencils): SudokuGridWithPencils {
  const newGrid = prevGrid.map(gridRow => [...gridRow]);
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = newGrid[row][col];
      if (cell.value !== null) continue; // Skip filled cells
      const newCell = markPencilForCell(newGrid, row, col);
      newGrid[row][col] = newCell;
    }
  }
  return newGrid;
}

const markPencilForCell = (grid: SudokuGridWithPencils, row: number, col: number) => {
  const cell = grid[row][col];
  if (cell.value !== null) return cell; // Can't add pencil marks to filled cells

  const newPencils = new Set<number>([ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);
  const rowNumbers = new Set(grid[row].filter((c, cCol) => cCol !== col && c.value !== null).map(c => c.value));
  const colNumbers = new Set(grid.map(r => r[col]).filter((c, rRow) => rRow !== row && c.value !== null).map(c => c.value));
  const boxNumbers = getBoxNumbers(grid, row, col);

  // remove numbers already in the same row and column
  rowNumbers.forEach(num => newPencils.delete(num));
  colNumbers.forEach(num => newPencils.delete(num));
  boxNumbers.forEach(num => newPencils.delete(num));

  return {
    ...cell,
    pencils: newPencils,
    showAnswer: false // Don't show answer in pencil mode
  };
};

const getBoxNumbers = (grid: SudokuGridWithPencils, row: number, col: number) => {
  const boxRowStart = Math.floor(row / 3) * 3;
  const boxColStart = Math.floor(col / 3) * 3;
  const numbers = new Set<number>();

  for (let r = boxRowStart; r < boxRowStart + 3; r++) {
    for (let c = boxColStart; c < boxColStart + 3; c++) {
      const cell = grid[r][c];
      if (cell.value !== null) {
        numbers.add(cell.value);
      }
    }
  }

  return numbers;
};
