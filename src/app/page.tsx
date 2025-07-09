import SudokuGenerator from '@/components/SudokuGenerator';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SudokuGenerator />
    </div>
  );
}
