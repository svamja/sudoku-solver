'use client';

import { SudokuGridWithPencils, SudokuCellWithPencils } from '@/types/sudoku';

interface SudokuGridProps {
  grid: SudokuGridWithPencils;
  isPencilMode: boolean;
  onCellClick: (row: number, col: number) => void;
}

export default function SudokuGrid({ grid, isPencilMode, onCellClick }: SudokuGridProps) {
  const renderCell = (cell: SudokuCellWithPencils, rowIndex: number, colIndex: number) => {
    // Determine border classes for 3x3 sub-grid separation
    const borderClasses = [
      'border-gray-400 dark:border-gray-500',
      colIndex % 3 === 2 && colIndex !== 8 ? 'border-r-2 border-r-gray-800 dark:border-r-gray-200' : '',
      rowIndex % 3 === 2 && rowIndex !== 8 ? 'border-b-2 border-b-gray-800 dark:border-b-gray-200' : '',
    ].filter(Boolean).join(' ');

    const isClickable = cell.value === null;
    const cursorClass = isClickable ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900' : '';

    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        className={`
          w-12 h-12 border flex items-center justify-center
          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
          ${borderClasses}
          ${cursorClass}
        `}
        onClick={() => isClickable && onCellClick(rowIndex, colIndex)}
      >
        {cell.value ? (
          // Show the actual number if cell has a value
          <span className="font-bold text-lg">{cell.value}</span>
        ) : cell.showAnswer && cell.answer ? (
          // Show answer in green if showAnswer is true
          <span className="font-bold text-lg text-green-600 dark:text-green-400">{cell.answer}</span>
        ) : cell.pencils.size > 0 ? (
          // Show pencil marks if cell is empty but has pencil marks
          <div className="grid grid-cols-3 gap-0 w-full h-full text-xs text-gray-500 dark:text-gray-400">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <div
                key={num}
                className="flex items-center justify-center text-[8px] leading-none"
              >
                {cell.pencils.has(num) ? num : ''}
              </div>
            ))}
          </div>
        ) : (
          // Empty cell
          ''
        )}
      </div>
    );
  };

  return (
    <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="grid grid-cols-9 gap-0 border-2 border-gray-800 dark:border-gray-200">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
        )}
      </div>
      {isPencilMode && (
        <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Pencil Mode: Click empty cells to show/hide pencil marks
        </div>
      )}
    </div>
  );
}
