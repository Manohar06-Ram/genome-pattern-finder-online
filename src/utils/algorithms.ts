
// DNA Sequence Matching Algorithms

// Naive string matching algorithm
export function naiveStringMatch(text: string, pattern: string): { matches: number[], executionTime: number } {
  const startTime = performance.now();
  const n = text.length;
  const m = pattern.length;
  const matches: number[] = [];

  // Edge cases
  if (m > n) return { matches: [], executionTime: performance.now() - startTime };
  if (m === 0) return { matches: [], executionTime: performance.now() - startTime };

  // Brute force search
  for (let i = 0; i <= n - m; i++) {
    let j;
    for (j = 0; j < m; j++) {
      if (text[i + j] !== pattern[j]) break;
    }
    if (j === m) {
      matches.push(i);
    }
  }

  const executionTime = performance.now() - startTime;
  return { matches, executionTime };
}

// KMP (Knuth-Morris-Pratt) algorithm
export function kmpStringMatch(text: string, pattern: string): { matches: number[], executionTime: number } {
  const startTime = performance.now();
  const n = text.length;
  const m = pattern.length;
  const matches: number[] = [];

  // Edge cases
  if (m > n) return { matches: [], executionTime: performance.now() - startTime };
  if (m === 0) return { matches: [], executionTime: performance.now() - startTime };

  // Compute LPS (Longest Prefix Suffix) array
  const lps = computeLPSArray(pattern);
  
  let i = 0; // index for text
  let j = 0; // index for pattern
  
  while (i < n) {
    if (pattern[j] === text[i]) {
      i++;
      j++;
    }
    
    if (j === m) {
      // Found a match
      matches.push(i - j);
      j = lps[j - 1];
    } else if (i < n && pattern[j] !== text[i]) {
      if (j !== 0) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
  }

  const executionTime = performance.now() - startTime;
  return { matches, executionTime };
}

// Helper function to compute LPS array for KMP
function computeLPSArray(pattern: string): number[] {
  const m = pattern.length;
  const lps = new Array(m).fill(0);
  
  let len = 0;
  let i = 1;
  
  while (i < m) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
    } else {
      if (len !== 0) {
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        i++;
      }
    }
  }
  
  return lps;
}

// Rabin-Karp algorithm
export function rabinKarpStringMatch(text: string, pattern: string): { matches: number[], executionTime: number } {
  const startTime = performance.now();
  const n = text.length;
  const m = pattern.length;
  const matches: number[] = [];
  
  // Edge cases
  if (m > n) return { matches: [], executionTime: performance.now() - startTime };
  if (m === 0) return { matches: [], executionTime: performance.now() - startTime };
  
  // Prime number for hash calculation
  const prime = 101;
  // Base value for hash (can be any value)
  const d = 256;
  
  // Calculate hash value for pattern and first window of text
  let p = 0; // hash value for pattern
  let t = 0; // hash value for first window of text
  let h = 1;
  
  // The value of h would be "pow(d, m-1) % prime"
  for (let i = 0; i < m - 1; i++) {
    h = (h * d) % prime;
  }
  
  // Calculate initial hash values
  for (let i = 0; i < m; i++) {
    p = (d * p + pattern.charCodeAt(i)) % prime;
    t = (d * t + text.charCodeAt(i)) % prime;
  }
  
  // Slide the pattern over text one by one
  for (let i = 0; i <= n - m; i++) {
    // Check if hash values match
    if (p === t) {
      // Check for characters one by one
      let j;
      for (j = 0; j < m; j++) {
        if (text[i + j] !== pattern[j]) break;
      }
      
      if (j === m) {
        matches.push(i);
      }
    }
    
    // Calculate hash value for next window
    if (i < n - m) {
      t = (d * (t - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % prime;
      // We might get negative value, converting it to positive
      if (t < 0) {
        t = (t + prime);
      }
    }
  }
  
  const executionTime = performance.now() - startTime;
  return { matches, executionTime };
}
