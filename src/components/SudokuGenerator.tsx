'use client';

import { useState } from 'react';
import { SudokuGrid as SudokuGridType } from '@/types/sudoku';
import { createEmptyGrid, generateSudokuPuzzle } from '@/lib/sudokuUtils';
import SudokuGrid from './SudokuGrid';
import GenerateButton from './GenerateButton';

export default function SudokuGenerator() {
  const [grid, setGrid] = useState<SudokuGridType>(createEmptyGrid);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Add a small delay to show the loading state
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const newPuzzle = generateSudokuPuzzle();
      setGrid(newPuzzle);
    } catch (error) {
      console.error('Error generating puzzle:', error);
      // Fallback to empty grid if generation fails
      setGrid(createEmptyGrid());
    } finally {
      setIsGenerating(false);
    }
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
      
      <SudokuGrid grid={grid} />
      
      <GenerateButton onGenerate={handleGenerate} isGenerating={isGenerating} />
      
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 max-w-md">
        <p>
          Each generated puzzle has a unique solution and follows standard sudoku rules:
          each row, column, and 3×3 box must contain all digits from 1 to 9.
        </p>
      </div>
    </div>
  );
}
