'use client';

import { useState } from 'react';
import { SudokuGridWithPencils } from '@/types/sudoku';
import { 
  createEmptyGridWithPencils, 
  generateCompleteSudoku,
  createPuzzle,
  convertToGridWithPencilsAndAnswers
} from '@/lib/sudokuUtils';
import SudokuGrid from './SudokuGrid';
import GenerateButton from './GenerateButton';
import { stepSolve } from '@/lib/solver';

export default function SudokuGenerator() {
  const [grid, setGrid] = useState<SudokuGridWithPencils>(createEmptyGridWithPencils);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPencilMode, setIsPencilMode] = useState(false);
  const [stepCount, setStepCount] = useState(1);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStepCount(1);
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
      setIsGenerating(false);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isPencilMode) return;
    
    const cell = grid[row][col];
    if (cell.value !== null) return; // Can't add pencil marks to filled cells
    
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(gridRow => [...gridRow]);
      
      // Show answer "7" when cell is clicked in pencil mode
      newGrid[row][col] = {
        ...cell,
        answer: 7,
        showAnswer: true,
        pencils: new Set() // Clear pencil marks when showing answer
      };
      
      return newGrid;
    });
  };

  const togglePencilMode = () => {
    setIsPencilMode(!isPencilMode);
  };


  const solveSudokuStepwise = async () => {
    const newGrid = stepSolve(stepCount, grid);
    setGrid(newGrid);
    setStepCount(prevCount => prevCount + 1);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Sudoku Generator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Click the button below to generate a new sudoku puzzle
        </p>
      </div>
      
      <div className="flex gap-4 items-center">
        <GenerateButton onGenerate={handleGenerate} isGenerating={isGenerating} />
        <button
          onClick={solveSudokuStepwise}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${isPencilMode 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
            }
          `}
        >
          Solve
        </button>
        <button
          onClick={togglePencilMode}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${isPencilMode 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
            }
          `}
        >
          {isPencilMode ? 'Exit Pencil Mode' : 'Pencil Mode'}
        </button>
        <div>{stepCount} </div>
      </div>
      
      <SudokuGrid 
        grid={grid} 
        isPencilMode={isPencilMode}
        onCellClick={handleCellClick}
      />
      
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 max-w-md">
        <p>
          Each generated puzzle has a unique solution and follows standard sudoku rules:
          each row, column, and 3×3 box must contain all digits from 1 to 9.
        </p>
        {isPencilMode && (
          <p className="mt-2 text-blue-600 dark:text-blue-400">
            In pencil mode, click empty cells to toggle pencil marks (1-9).
          </p>
        )}
      </div>
    </div>
  );
}
