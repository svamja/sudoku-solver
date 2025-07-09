import { SudokuGrid as SudokuGridType } from '@/types/sudoku';

interface SudokuGridProps {
  grid: SudokuGridType;
}

export default function SudokuGrid({ grid }: SudokuGridProps) {
  return (
    <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="grid grid-cols-9 gap-0 border-2 border-gray-800 dark:border-gray-200">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            // Determine border classes for 3x3 sub-grid separation
            const borderClasses = [
              'border-gray-400 dark:border-gray-500',
              colIndex % 3 === 2 && colIndex !== 8 ? 'border-r-2 border-r-gray-800 dark:border-r-gray-200' : '',
              rowIndex % 3 === 2 && rowIndex !== 8 ? 'border-b-2 border-b-gray-800 dark:border-b-gray-200' : '',
            ].filter(Boolean).join(' ');

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-12 h-12 border flex items-center justify-center
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  font-bold text-lg
                  ${borderClasses}
                `}
              >
                {cell || ''}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
