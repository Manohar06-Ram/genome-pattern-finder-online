
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const AlgorithmInfo = () => {
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-xl text-primary">DNA Sequence Matching Algorithms</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="naive">
            <AccordionTrigger>Naive Algorithm</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2 text-sm">
                The naive approach checks for a match at each position in the DNA sequence by comparing each character of the pattern.
              </p>
              <p className="mb-2 text-sm">
                <strong>Time Complexity:</strong> O(n * m), where n is the length of the DNA sequence and m is the length of the pattern.
              </p>
              <p className="text-sm">
                <strong>Best For:</strong> Short patterns and sequences or when the pattern rarely matches.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="kmp">
            <AccordionTrigger>Knuth-Morris-Pratt (KMP)</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2 text-sm">
                KMP uses information about the pattern itself to avoid redundant comparisons when a mismatch occurs.
              </p>
              <p className="mb-2 text-sm">
                <strong>Time Complexity:</strong> O(n + m), where n is the length of the DNA sequence and m is the length of the pattern.
              </p>
              <p className="text-sm">
                <strong>Best For:</strong> Long patterns with repeating subpatterns.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="rabin-karp">
            <AccordionTrigger>Rabin-Karp Algorithm</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2 text-sm">
                Rabin-Karp uses hashing to quickly compare the pattern with substrings of the text, reducing unnecessary character comparisons.
              </p>
              <p className="mb-2 text-sm">
                <strong>Time Complexity:</strong> Average O(n + m), worst case O(n * m), where n is the length of the DNA sequence and m is the length of the pattern.
              </p>
              <p className="text-sm">
                <strong>Best For:</strong> Searching for multiple patterns simultaneously in a text.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Separator className="my-4" />
        
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">
            <strong>DNA Sequence Validity:</strong> Only sequences containing A, C, G, T characters are considered valid.
          </p>
          <p>
            <strong>File Formats:</strong> Upload DNA sequences in .txt (raw sequence) or .fasta format (with header lines starting with &gt;).
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlgorithmInfo;
