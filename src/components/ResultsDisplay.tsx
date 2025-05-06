
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, X } from 'lucide-react';
import type { AnalysisResult } from './AnalysisForm';

type ResultsDisplayProps = {
  result: AnalysisResult | null;
};

const ResultsDisplay = ({ result }: ResultsDisplayProps) => {
  if (!result) return null;

  const { algorithm, matches, executionTime, dnaLength, patternLength } = result;

  const algorithmNames = {
    'naive': 'Naive Algorithm',
    'kmp': 'Knuth-Morris-Pratt (KMP)',
    'rabin-karp': 'Rabin-Karp'
  };
  
  const algorithmName = algorithmNames[algorithm as keyof typeof algorithmNames] || algorithm;

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center">
          Analysis Results
          <Badge variant="outline" className="ml-2 bg-muted">
            {algorithmName}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between text-sm">
          <div className="mb-2 md:mb-0">
            <span className="text-muted-foreground">DNA Sequence Length:</span> {dnaLength} bp
          </div>
          <div className="mb-2 md:mb-0">
            <span className="text-muted-foreground">Pattern Length:</span> {patternLength} bp
          </div>
          <div>
            <span className="text-muted-foreground">Execution Time:</span> {executionTime.toFixed(4)} ms
          </div>
        </div>
        
        <Separator />
        
        {matches.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center text-green-600">
              <Check className="mr-2 h-5 w-5" />
              <span className="font-medium">Pattern found at {matches.length} position{matches.length > 1 ? 's' : ''}</span>
            </div>
            
            <div className="bg-muted p-4 rounded-md max-h-40 overflow-y-auto">
              <p className="font-medium mb-2">Matches at positions:</p>
              <div className="flex flex-wrap gap-2">
                {matches.map((pos, index) => (
                  <Badge key={index} variant="secondary">
                    {pos}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <div className="flex items-center">
              <X className="h-5 w-5 mr-2 text-red-500" />
              <AlertDescription className="text-red-800">
                Pattern not found in the DNA sequence.
              </AlertDescription>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;
