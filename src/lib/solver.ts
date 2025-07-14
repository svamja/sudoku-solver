import { SudokuGridWithPencils } from '@/types/sudoku';


export function stepSolve(stepCount: number, prevGrid: SudokuGridWithPencils): SudokuGridWithPencils {
  if (stepCount%2 == 1) {
    // mark everything with pencil marks
    return markAllCellsWithPencils(prevGrid);
  }
  if (stepCount%2 == 0) {
    // remove pencil marks from all cells
    return convertSinglesToAnswers(prevGrid);
  }
  return prevGrid;
}

function markAllCellsWithPencils(prevGrid: SudokuGridWithPencils): SudokuGridWithPencils {
  const newGrid = prevGrid.map(gridRow => [...gridRow]);
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = newGrid[row][col];
      if (cell.value !== null) continue; // Skip filled cells
      if (cell.answer !== null && cell.showAnswer) continue; // Skip cells with answers
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
  const rowNumbers = getRowNumbers(grid, row);
  const colNumbers = getColNumbers(grid, col);
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
      const cell = getCellValue(grid, r, c);
      if (cell !== null) {
        numbers.add(cell);
      }
    }
  }

  return numbers;
};

const getRowNumbers = (grid: SudokuGridWithPencils, row: number): Set<number> => {
  const numbers = new Set<number>();
  for (let col = 0; col < 9; col++) {
    const cellValue = getCellValue(grid, row, col);
    if (cellValue !== null) {
      numbers.add(cellValue);
    }
  }
  return numbers;
};

const getColNumbers = (grid: SudokuGridWithPencils, col: number): Set<number> => {
  const numbers = new Set<number>();
  for (let row = 0; row < 9; row++) {
    const cell = getCellValue(grid, row, col);
    if (cell !== null) {
      numbers.add(cell);
    }
  }
  return numbers;
};

const getCellValue = (grid: SudokuGridWithPencils, row: number, col: number): number | null => {
  const cell = grid[row][col];
  if (cell.value !== null) {
    return cell.value;
  }
  if (cell.answer !== null && cell.showAnswer) {
    return cell.answer;
  }
  return null;
};


const convertSinglesToAnswers = (prevGrid: SudokuGridWithPencils): SudokuGridWithPencils => {
  const newGrid = prevGrid.map(gridRow => [...gridRow]);
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = newGrid[row][col];
      if (cell.value !== null) continue; // Skip filled cells
      if (cell.pencils.size === 1) {
        const answer = Array.from(cell.pencils)[0];
        newGrid[row][col] = {
          ...cell,
          answer: answer,
          pencils: new Set(),
          showAnswer: true
        };
      }
    }
  }
  return newGrid;
}
