
import { useState } from 'react';
import DnaHelix from '@/components/DnaHelix';
import AnalysisForm, { AnalysisResult } from '@/components/AnalysisForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import AlgorithmInfo from '@/components/AlgorithmInfo';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalysisComplete = (analysisResult: AnalysisResult) => {
    setResult(analysisResult);
    // Scroll to results if they're not already in view
    setTimeout(() => {
      const resultsElement = document.getElementById('results-section');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm py-6">
        <div className="container flex items-center justify-center">
          <div className="mr-4">
            <DnaHelix />
          </div>
          <h1 className="text-3xl font-bold text-primary">DNA Sequence Analyzer</h1>
        </div>
      </header>

      <main className="container py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnalysisForm onAnalysisComplete={handleAnalysisComplete} />
            
            {result && (
              <div id="results-section" className="mt-8 scroll-mt-4">
                <ResultsDisplay result={result} />
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <AlgorithmInfo />
          </div>
        </div>
      </main>

      <footer className="bg-muted py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>DNA Sequence Analyzer &copy; 2025</p>
          <p className="mt-1">A web application for analyzing DNA sequences using string matching algorithms</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
