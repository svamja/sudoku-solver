import { SudokuCellWithPencils, SudokuGridWithPencils } from '@/types/sudoku';


export function stepSolve(stepCount: number, prevGrid: SudokuGridWithPencils): SudokuGridWithPencils {
  const CYCLE_SIZE = 6;
  if (stepCount%CYCLE_SIZE == 0 || stepCount%CYCLE_SIZE == 3) {
    // mark everything with pencil marks
    return markAllCellsWithPencils(prevGrid);
  }
  if (stepCount%CYCLE_SIZE == 1 || stepCount%CYCLE_SIZE == 4) {
    // strike out pencil marks using pairs
    return strikePencilsUsingPairs(prevGrid);
  }
  if (stepCount%CYCLE_SIZE == 2) {
    // mark single pencil mark as answers
    return convertSinglesToAnswers(prevGrid);
  }
  if (stepCount%CYCLE_SIZE == 5) {
    // mark single candidates as answers
    return spotSingleCandidates(prevGrid);
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


const spotSingleCandidates = (prevGrid: SudokuGridWithPencils): SudokuGridWithPencils => {
  const newGrid = prevGrid.map(gridRow => [...gridRow]);
  for (let row = 0; row < 9; row += 3) {
    for (let col = 0; col < 9; col += 3) {
      const cells = getBoxCells(newGrid, row, col);
      spotAndMarkSingleCandidates(cells, newGrid, row, col);
    }
  }
  return newGrid;
};

const spotAndMarkSingleCandidates = (cells: SudokuGridWithPencils, grid: SudokuGridWithPencils, startRow: number, startCol: number) => {
  console.log(startRow, startCol, cells);
  const candidatesCount: Record<number, number> = {};
  const cellPositions: Record<number, { row: number, col: number }> = {};
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cell = cells[r][c];
      if (cell.value !== null || cell.showAnswer) continue; // Skip filled or answered cells
      for (const pencil of cell.pencils) {
        if (!candidatesCount[pencil]) {
          candidatesCount[pencil] = 0;
          cellPositions[pencil] = { row: -1, col: -1 };
        }
        candidatesCount[pencil]++;
        cellPositions[pencil] = { row: startRow + r, col: startCol + c };
      }
    }
  }

  // Check for single candidates
  for (const pencil in candidatesCount) {
    if (candidatesCount[pencil] === 1) {
      const pos = cellPositions[Number(pencil)];
      const cell = grid[pos.row][pos.col];
      grid[pos.row][pos.col] = {
        ...cell,
        answer: Number(pencil),
        pencils: new Set(),
        showAnswer: true
      };
    }
  }

};

const getBoxCells = (grid: SudokuGridWithPencils, startRow: number, startCol: number): SudokuGridWithPencils => {
  const cells: SudokuGridWithPencils = [];
  for (let r = startRow; r < startRow + 3; r++) {
    const rowCells = [];
    for (let c = startCol; c < startCol + 3; c++) {
      rowCells.push(grid[r][c]);
    }
    cells.push(rowCells);
  }
  return cells;
};

const strikePencilsUsingPairs = (prevGrid: SudokuGridWithPencils): SudokuGridWithPencils => {
  const newGrid = prevGrid.map(gridRow => [...gridRow]);
  for (let row = 0; row < 9; row++) {
    // create map of pairs
    const cells = getRowCells(newGrid, row);
    const pencilPairs = getPencilPairs(cells);
    for (const [pencils] of Object.entries(pencilPairs)) {
      const [pencil1, pencil2] = pencils.split(',').map(Number);
      // Remove these pencils from all other cells in the row
      for (let col = 0; col < 9; col++) {
        const cell = newGrid[row][col];
        if (cell.value !== null || cell.showAnswer) continue; // Skip filled or answered cells
        // if the cell has exactly 2 pencils and they match the pair, skip it
        if (cell.pencils.size === 2 && cell.pencils.has(pencil1) && cell.pencils.has(pencil2)) {
          continue;
        }
        if (cell.pencils.has(pencil1)) {
          cell.pencils.delete(pencil1);
        }
        if (cell.pencils.has(pencil2)) {
          cell.pencils.delete(pencil2);
        }
      }
    }
  }

  return newGrid;
};

const getRowCells = (grid: SudokuGridWithPencils, row: number): SudokuCellWithPencils[] => {
  return grid[row]
};

const getPencilPairs = (cells: SudokuCellWithPencils[]): Record<string, number> => {
  const pencilPairs: Record<string, number> = {};
  for (const cell of cells) {
    if (cell.value !== null || cell.showAnswer) continue; // Skip filled or answered cells
    if (cell.pencils.size !== 2) continue; // Only consider cells with 2 pencils
    const pencils = Array.from(cell.pencils).sort().join(',');
    if (!pencilPairs[pencils]) {
      pencilPairs[pencils] = 0;
    }
    pencilPairs[pencils]++;
  }
  // Filter out pairs that have more than 2 occurrences
  for (const pencil in pencilPairs) {
    if (pencilPairs[pencil] !== 2) {
      delete pencilPairs[pencil];
    }
  }
  return pencilPairs;
};  