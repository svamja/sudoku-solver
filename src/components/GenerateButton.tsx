interface GenerateButtonProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function GenerateButton({ onGenerate, isGenerating }: GenerateButtonProps) {
  return (
    <button
      onClick={onGenerate}
      disabled={isGenerating}
      className={`
        px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200
        ${isGenerating 
          ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 hover:scale-105 active:scale-95'
        }
        text-white shadow-lg hover:shadow-xl
        focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
      `}
    >
      {isGenerating ? (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Generating...
        </div>
      ) : (
        'Generate New Puzzle'
      )}
    </button>
  );
}
