import { SudokuGrid, SudokuGridWithPencils, SudokuCellWithPencils, Position } from '@/types/sudoku';

// Create an empty 9x9 grid
export function createEmptyGrid(): SudokuGrid {
  return Array(9).fill(null).map(() => Array(9).fill(null));
}

// Check if a number can be placed at a specific position
export function isValidPlacement(grid: SudokuGrid, row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[boxRow + i][boxCol + j] === num) return false;
    }
  }

  return true;
}

// Solve sudoku using backtracking
export function solveSudoku(grid: SudokuGrid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) {
              return true;
            }
            grid[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Generate a complete valid sudoku solution
export function generateCompleteSudoku(): SudokuGrid {
  const grid = createEmptyGrid();
  
  // Fill diagonal 3x3 boxes first (they don't affect each other)
  fillDiagonalBoxes(grid);
  
  // Fill remaining cells
  solveSudoku(grid);
  
  return grid;
}

// Fill the three diagonal 3x3 boxes
function fillDiagonalBoxes(grid: SudokuGrid): void {
  for (let box = 0; box < 9; box += 3) {
    fillBox(grid, box, box);
  }
}

// Fill a 3x3 box with random valid numbers
function fillBox(grid: SudokuGrid, row: number, col: number): void {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffleArray(numbers);
  
  let index = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      grid[row + i][col + j] = numbers[index++];
    }
  }
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Count the number of solutions for a given puzzle
function countSolutions(grid: SudokuGrid): number {
  const gridCopy = grid.map(row => [...row]);
  return countSolutionsRecursive(gridCopy);
}

function countSolutionsRecursive(grid: SudokuGrid): number {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        let solutions = 0;
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            solutions += countSolutionsRecursive(grid);
            grid[row][col] = null;
            
            // If we find more than 1 solution, we can stop
            if (solutions > 1) return solutions;
          }
        }
        return solutions;
      }
    }
  }
  return 1; // Complete grid found
}

// Remove cells from a complete sudoku to create a puzzle
export function createPuzzle(completedGrid: SudokuGrid): SudokuGrid {
  const puzzle = completedGrid.map(row => [...row]);
  const positions: Position[] = [];
  
  // Create list of all positions
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      positions.push({ row, col });
    }
  }
  
  // Shuffle positions
  shuffleArray(positions);
  
  // Try to remove cells while maintaining unique solution
  let cellsRemoved = 0;
  const maxCellsToRemove = 45; // Leave about 36 clues
  
  for (const pos of positions) {
    if (cellsRemoved >= maxCellsToRemove) break;
    
    const originalValue = puzzle[pos.row][pos.col];
    puzzle[pos.row][pos.col] = null;
    
    // Check if puzzle still has unique solution
    if (countSolutions(puzzle) === 1) {
      cellsRemoved++;
    } else {
      // Restore the cell if removing it creates multiple solutions
      puzzle[pos.row][pos.col] = originalValue;
    }
  }
  
  return puzzle;
}

// Main function to generate a new sudoku puzzle
export function generateSudokuPuzzle(): SudokuGrid {
  const completedGrid = generateCompleteSudoku();
  return createPuzzle(completedGrid);
}

// Deep copy a grid
export function copyGrid(grid: SudokuGrid): SudokuGrid {
  return grid.map(row => [...row]);
}

// Create an empty grid with pencil marks
export function createEmptyGridWithPencils(): SudokuGridWithPencils {
  return Array(9).fill(null).map(() => 
    Array(9).fill(null).map(() => ({
      value: null,
      pencils: new Set<number>(),
      answer: null,
      showAnswer: false
    }))
  );
}

// Convert regular grid to grid with pencils
export function convertToGridWithPencils(grid: SudokuGrid): SudokuGridWithPencils {
  return grid.map(row => 
    row.map(cell => ({
      value: cell,
      pencils: new Set<number>(),
      answer: null,
      showAnswer: false
    }))
  );
}

// Convert grid with pencils back to regular grid
export function convertToRegularGrid(grid: SudokuGridWithPencils): SudokuGrid {
  return grid.map(row => row.map(cell => cell.value));
}

// Toggle pencil mark in a cell
export function togglePencilMark(cell: SudokuCellWithPencils, number: number): SudokuCellWithPencils {
  const newPencils = new Set(cell.pencils);
  if (newPencils.has(number)) {
    newPencils.delete(number);
  } else {
    newPencils.add(number);
  }
  return {
    ...cell,
    pencils: newPencils
  };
}

// Set all pencil marks (1-9) in a cell
export function setAllPencilMarks(cell: SudokuCellWithPencils): SudokuCellWithPencils {
  return {
    ...cell,
    pencils: new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])
  };
}

// Clear all pencil marks in a cell
export function clearPencilMarks(cell: SudokuCellWithPencils): SudokuCellWithPencils {
  return {
    ...cell,
    pencils: new Set()
  };
}

// Convert regular grid to grid with pencils and answers
export function convertToGridWithPencilsAndAnswers(puzzle: SudokuGrid, solution: SudokuGrid): SudokuGridWithPencils {
  return puzzle.map((row, rowIndex) => 
    row.map((cell, colIndex) => ({
      value: cell,
      pencils: new Set<number>(),
      answer: solution[rowIndex][colIndex],
      showAnswer: false
    }))
  );
}

// Toggle answer display for a cell
export function toggleAnswerDisplay(cell: SudokuCellWithPencils): SudokuCellWithPencils {
  return {
    ...cell,
    showAnswer: !cell.showAnswer
  };
}
