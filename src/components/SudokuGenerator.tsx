'use client';

import { useState } from 'react';
import { SudokuGridWithPencils } from '@/types/sudoku';
import { 
  createEmptyGridWithPencils, 
  generateCompleteSudoku,
  createPuzzle,
  convertToGridWithPencilsAndAnswers,
  importSudoku,
  createEmptyGrid
} from '@/lib/sudokuUtils';
import SudokuGrid from './SudokuGrid';
import { stepSolve } from '@/lib/solver';

export default function SudokuGenerator() {
  const [grid, setGrid] = useState<SudokuGridWithPencils>(createEmptyGridWithPencils);
  const [stepCount, setStepCount] = useState(1);
  const [description, setDescription] = useState('Click "Generate" to create a new puzzle');

  const handleGenerate = async () => {
    setStepCount(-1);
    setDescription(getDescription(-1));
    // Add a small delay to show the loading state
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Generate complete solution first
      const completeSolution = generateCompleteSudoku();
      // Create puzzle by removing cells
      const puzzle = createPuzzle(completeSolution);
      // Convert to grid with pencils and answers
      const gridWithPencils = convertToGridWithPencilsAndAnswers(puzzle, completeSolution);
      setGrid(gridWithPencils);
    } catch (error) {
      console.error('Error generating puzzle:', error);
      // Fallback to empty grid if generation fails
      setGrid(createEmptyGridWithPencils());
    } finally {
    }
  };

  const handleImport = async () => {
    const sudokuString = '000100304010000600405070080020089001860014709000002003000800000002050010000900200';
    const grid = importSudoku(sudokuString);
    const emptySolution = createEmptyGrid();
    const gridWithPencils = convertToGridWithPencilsAndAnswers(grid, emptySolution);
    setGrid(gridWithPencils);
  }

  const handleCellClick = (row: number, col: number) => {
    console.log(`Cell clicked: Row ${row}, Col ${col}`);
  }

  const solveSudokuStepwise = async () => {
    const prevCount = stepCount;
    setStepCount(stepCount + 1);
    const newGrid = stepSolve(prevCount + 1, grid);
    setGrid(newGrid);
    setDescription(getDescription(prevCount + 1));
    verifyGridSolved(newGrid);
  };

  const verifyGridSolved = (grid: SudokuGridWithPencils) => {
    // Check if the grid is completely filled with answers
    const isSolved = grid.every(row => 
      row.every(cell => cell.value !== null || cell.showAnswer)
    );
    
    if (isSolved) {
      setDescription('Sudoku puzzle solved!');
    }
  };

  const getDescription = (step: number) => {
    switch (step % 4) {
      case -1:
        return 'New puzzle generated';
      case 0:
      case 2:
        return 'Updated pencils';
      case 1:
        return 'Marked single pencil marks as answers';
      case 3:
        return 'Applied single candidates in a box';
      default:
        return `Step ${step}`;
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Sudoku Step Solver
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Click the button below to generate a new sudoku puzzle
        </p>
      </div>
      
      <div className="flex gap-4 items-center">
        <button
          onClick={handleGenerate}
          className='px-4 py-2 rounded-lg font-medium transition-colors
            bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
        >
          Generate
        </button>
        <button
          onClick={handleImport}
          className='px-4 py-2 rounded-lg font-medium transition-colors
            bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
        >
          Import
        </button>
        <button
          onClick={solveSudokuStepwise}
          className='px-4 py-2 rounded-lg font-medium transition-colors
            bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
        >
          Solve
        </button>
      </div>
      
      <div className="flex gap-2 items-center">
        <h3>{description}</h3>
      </div>

      <SudokuGrid 
        grid={grid} 
        isPencilMode={false}
        onCellClick={handleCellClick}
      />
    </div>
  );
}
