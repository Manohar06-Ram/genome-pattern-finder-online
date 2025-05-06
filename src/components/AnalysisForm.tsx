
import { useState, FormEvent, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { readTextFile, parseFastaFile, validateDnaSequence } from '@/utils/fileUtils';
import { naiveStringMatch, kmpStringMatch, rabinKarpStringMatch } from '@/utils/algorithms';
import { useToast } from '@/components/ui/use-toast';
import { Upload } from 'lucide-react';

export type AnalysisResult = {
  algorithm: string;
  matches: number[];
  executionTime: number;
  dnaLength: number;
  patternLength: number;
};

type AnalysisFormProps = {
  onAnalysisComplete: (result: AnalysisResult) => void;
};

const AnalysisForm = ({ onAnalysisComplete }: AnalysisFormProps) => {
  const [dnaSequence, setDnaSequence] = useState<string>('');
  const [pattern, setPattern] = useState<string>('');
  const [algorithm, setAlgorithm] = useState<string>('naive');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Check file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'txt' && fileExtension !== 'fasta') {
      toast({
        variant: "destructive",
        title: "Invalid file format",
        description: "Please upload a .txt or .fasta file",
      });
      return;
    }

    try {
      const content = await readTextFile(file);
      let sequence = content;
      
      // If it's a FASTA file, parse it
      if (fileExtension === 'fasta') {
        sequence = parseFastaFile(content);
      } else {
        // For txt files, just clean up and convert to uppercase
        sequence = content.toUpperCase().replace(/\s/g, '');
      }
      
      // Validate the sequence
      if (validateDnaSequence(sequence)) {
        setDnaSequence(sequence);
        toast({
          title: "File uploaded successfully",
          description: `DNA sequence of length ${sequence.length} loaded.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid DNA sequence",
          description: "The file contains characters other than A, C, G, T.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error reading file",
        description: "There was a problem reading the uploaded file.",
      });
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    
    if (!dnaSequence.trim()) {
      toast({
        variant: "destructive",
        title: "Missing DNA sequence",
        description: "Please enter a DNA sequence or upload a file.",
      });
      return;
    }
    
    if (!pattern.trim()) {
      toast({
        variant: "destructive",
        title: "Missing pattern",
        description: "Please enter a pattern to search for.",
      });
      return;
    }
    
    // Validate the input sequence
    if (!validateDnaSequence(dnaSequence)) {
      toast({
        variant: "destructive",
        title: "Invalid DNA sequence",
        description: "DNA sequence should only contain A, C, G, T characters.",
      });
      return;
    }
    
    // Validate the pattern
    if (!validateDnaSequence(pattern)) {
      toast({
        variant: "destructive",
        title: "Invalid pattern",
        description: "Pattern should only contain A, C, G, T characters.",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Use setTimeout to avoid blocking the UI thread
    setTimeout(() => {
      let result;
      const upperDna = dnaSequence.toUpperCase();
      const upperPattern = pattern.toUpperCase();
      
      switch (algorithm) {
        case 'kmp':
          result = kmpStringMatch(upperDna, upperPattern);
          break;
        case 'rabin-karp':
          result = rabinKarpStringMatch(upperDna, upperPattern);
          break;
        case 'naive':
        default:
          result = naiveStringMatch(upperDna, upperPattern);
          break;
      }
      
      onAnalysisComplete({
        algorithm,
        matches: result.matches,
        executionTime: result.executionTime,
        dnaLength: upperDna.length,
        patternLength: upperPattern.length
      });
      
      setIsLoading(false);
    }, 0);
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-xl text-primary">DNA Sequence Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="dna-sequence">DNA Sequence</Label>
            <Textarea 
              id="dna-sequence" 
              placeholder="Enter DNA sequence (A, C, G, T)" 
              className="min-h-[100px]"
              value={dnaSequence}
              onChange={(e) => setDnaSequence(e.target.value.toUpperCase())}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file-upload">OR Upload DNA Sequence File (.txt or .fasta)</Label>
            <div className="flex items-center space-x-2">
              <Input 
                id="file-upload" 
                type="file" 
                accept=".txt,.fasta"
                onChange={handleFileUpload} 
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-white hover:file:bg-primary/80"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pattern">Pattern to Search</Label>
            <Input 
              id="pattern" 
              placeholder="Enter pattern (A, C, G, T)" 
              value={pattern}
              onChange={(e) => setPattern(e.target.value.toUpperCase())}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="algorithm">Algorithm</Label>
            <Select 
              value={algorithm} 
              onValueChange={setAlgorithm}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Algorithm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="naive">Naive</SelectItem>
                <SelectItem value="kmp">Knuth-Morris-Pratt (KMP)</SelectItem>
                <SelectItem value="rabin-karp">Rabin-Karp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⟳</span> Analyzing...
              </span>
            ) : (
              <span className="flex items-center">
                <Upload className="mr-2 h-4 w-4" /> Analyze Sequence
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AnalysisForm;
