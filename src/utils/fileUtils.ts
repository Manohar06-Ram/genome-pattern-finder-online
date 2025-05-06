
/**
 * Reads a text file and returns its contents
 */
export const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Parses a FASTA format file and returns the DNA sequence
 */
export const parseFastaFile = (content: string): string => {
  // Remove header lines (lines starting with '>') and merge all sequence lines
  const lines = content.split('\n');
  const sequenceLines = lines.filter(line => !line.startsWith('>'));
  return sequenceLines.join('').toUpperCase().replace(/\s/g, '');
};

/**
 * Validates whether a string is a valid DNA sequence (consisting of A, C, G, T)
 */
export const validateDnaSequence = (sequence: string): boolean => {
  const dnaPattern = /^[ACGT]+$/i;
  return dnaPattern.test(sequence);
};
