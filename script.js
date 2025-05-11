document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const themeToggle = document.getElementById('theme-toggle');
  const analysisForm = document.getElementById('analysis-form');
  const fileUpload = document.getElementById('file-upload');
  const fileUploadLabel = document.getElementById('file-upload-label');
  const dnaSequenceInput = document.getElementById('dna-sequence');
  const patternInput = document.getElementById('pattern');
  const algorithmSelect = document.getElementById('algorithm');
  const resultsSection = document.getElementById('results-section');
  const algorithmBadge = document.getElementById('algorithm-badge');
  const dnaLengthEl = document.getElementById('dna-length');
  const patternLengthEl = document.getElementById('pattern-length');
  const executionTimeEl = document.getElementById('execution-time');
  const matchesFoundEl = document.getElementById('matches-found');
  const noMatchesEl = document.getElementById('no-matches');
  const matchCountEl = document.getElementById('match-count');
  const matchesContainer = document.getElementById('matches-container');
  const dnaAnimationEl = document.getElementById('dna-animation');
  const dna3DContainer = document.getElementById('dna-3d-container');
  
  // Update file input display
  fileUpload.addEventListener('change', function() {
    const fileName = this.files[0]?.name || "No file selected";
    const fileNameDisplay = fileUploadLabel.querySelector('span');
    if (fileNameDisplay) {
      fileNameDisplay.textContent = fileName;
    }
  });
  
  // Initialize DNA Animation
  initDnaAnimation();
  
  // Initialize 3D DNA visualization - ensure Three.js is loaded
  if (window.THREE) {
    initDna3D();
  } else {
    console.error("Three.js library not loaded properly.");
    // Add a fallback message
    dna3DContainer.innerHTML = '<div class="p-4 text-center">3D visualization could not be loaded. Please check if Three.js is properly loaded.</div>';
  }
  
  // Theme Toggle Functionality
  initTheme();
  themeToggle.addEventListener('click', toggleTheme);

  // Initialize Accordion
  initAccordion();
  
  // File Upload Handling
  fileUpload.addEventListener('change', handleFileUpload);
  
  // Form Submission
  analysisForm.addEventListener('submit', handleFormSubmit);
  
  // Initialize DNA Animation
  function initDnaAnimation() {
    // Create 6 strands for the helix
    dnaAnimationEl.innerHTML = ''; // Clear any existing strands
    for (let i = 1; i <= 6; i++) {
      const strand = document.createElement('div');
      strand.className = 'dna-strand';
      strand.style.transform = `rotateY(${i * 60}deg)`;
      strand.style.left = '45%';
      dnaAnimationEl.appendChild(strand);
    }
  }

  // Initialize Theme
  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    }
  }

  // Toggle Theme
  function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // If 3D visualization is loaded, update its background
    if (window.THREE && dna3DContainer.__scene) {
      dna3DContainer.__scene.background = isDark 
        ? new THREE.Color(0x111827) 
        : new THREE.Color(0xf4f6f9);
    }
  }

  // Initialize Accordion
  function initAccordion() {
    const accordionButtons = document.querySelectorAll('.accordion-button');
    
    accordionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        
        button.classList.toggle('active');
        content.classList.toggle('active');
        
        // Close other accordion items
        accordionButtons.forEach(otherButton => {
          if (otherButton !== button) {
            otherButton.classList.remove('active');
            otherButton.nextElementSibling.classList.remove('active');
          }
        });
      });
    });
  }

  // Handle File Upload
  async function handleFileUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Check file extension
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'txt' && fileExtension !== 'fasta') {
      showToast('Invalid file format. Please upload a .txt or .fasta file', 'error');
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
        sequence = content.toUpperCase().replace(/\\s/g, '');
      }
      
      // Validate the sequence
      if (validateDnaSequence(sequence)) {
        dnaSequenceInput.value = sequence;
        showToast(`DNA sequence of length ${sequence.length} loaded successfully`, 'success');
      } else {
        showToast('Invalid DNA sequence. The file contains characters other than A, C, G, T.', 'error');
      }
    } catch (error) {
      showToast('Error reading file', 'error');
      console.error(error);
    }
  }

  // Handle Form Submit
  function handleFormSubmit(event) {
    event.preventDefault();
    
    const dnaSequence = dnaSequenceInput.value.trim().toUpperCase();
    const pattern = patternInput.value.trim().toUpperCase();
    const selectedAlgorithm = algorithmSelect.value;
    
    if (!dnaSequence) {
      showToast('Please enter a DNA sequence or upload a file', 'error');
      return;
    }
    
    if (!pattern) {
      showToast('Please enter a pattern to search for', 'error');
      return;
    }
    
    // Validate inputs
    if (!validateDnaSequence(dnaSequence)) {
      showToast('DNA sequence should only contain A, C, G, T characters', 'error');
      return;
    }
    
    if (!validateDnaSequence(pattern)) {
      showToast('Pattern should only contain A, C, G, T characters', 'error');
      return;
    }
    
    // Disable button during analysis
    const submitBtn = analysisForm.querySelector('button[type=submit]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner">⟳</span> Analyzing...';
    submitBtn.disabled = true;
    
    // Use setTimeout to avoid blocking the UI thread
    setTimeout(() => {
      let result;
      
      switch (selectedAlgorithm) {
        case 'kmp':
          result = kmpStringMatch(dnaSequence, pattern);
          break;
        case 'rabin-karp':
          result = rabinKarpStringMatch(dnaSequence, pattern);
          break;
        case 'naive':
        default:
          result = naiveStringMatch(dnaSequence, pattern);
          break;
      }
      
      displayResults(result, selectedAlgorithm, dnaSequence.length, pattern.length);
      
      // Re-enable button
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
      
      // Scroll to results
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }

  // Display Results
  function displayResults(result, algorithm, dnaLength, patternLength) {
    // Update algorithm badge
    const algorithmNames = {
      'naive': 'Naive Algorithm',
      'kmp': 'Knuth-Morris-Pratt (KMP)',
      'rabin-karp': 'Rabin-Karp'
    };
    
    algorithmBadge.textContent = algorithmNames[algorithm] || algorithm;
    dnaLengthEl.textContent = dnaLength;
    patternLengthEl.textContent = patternLength;
    executionTimeEl.textContent = result.executionTime.toFixed(4);
    
    // Display matches or no matches message
    if (result.matches.length > 0) {
      matchesFoundEl.classList.remove('hidden');
      noMatchesEl.classList.add('hidden');
      
      matchCountEl.textContent = result.matches.length;
      
      // Generate match badges
      matchesContainer.innerHTML = '';
      result.matches.forEach(position => {
        const badge = document.createElement('span');
        badge.className = 'match-badge';
        badge.textContent = position;
        matchesContainer.appendChild(badge);
      });
    } else {
      matchesFoundEl.classList.add('hidden');
      noMatchesEl.classList.remove('hidden');
    }
    
    resultsSection.classList.remove('hidden');
  }

  // String Matching Algorithms
  // Naive string matching algorithm
  function naiveStringMatch(text, pattern) {
    const startTime = performance.now();
    const n = text.length;
    const m = pattern.length;
    const matches = [];

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
  function kmpStringMatch(text, pattern) {
    const startTime = performance.now();
    const n = text.length;
    const m = pattern.length;
    const matches = [];

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
  function computeLPSArray(pattern) {
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
  function rabinKarpStringMatch(text, pattern) {
    const startTime = performance.now();
    const n = text.length;
    const m = pattern.length;
    const matches = [];
    
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

  // Utility Functions
  function readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  }

  function parseFastaFile(content) {
    // Remove header lines (lines starting with '>') and merge all sequence lines
    const lines = content.split('\\n');
    const sequenceLines = lines.filter(line => !line.startsWith('>'));
    return sequenceLines.join('').toUpperCase().replace(/\\s/g, '');
  }

  function validateDnaSequence(sequence) {
    const dnaPattern = /^[ACGT]+$/i;
    return dnaPattern.test(sequence);
  }

  function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon based on type
    const iconSvg = type === 'success' 
      ? '<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      : '<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    
    toast.innerHTML = `
      ${iconSvg}
      <span>${message}</span>
      <button class="toast-close">×</button>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
    
    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 300);
    });
  }

  // 3D DNA Visualization using Three.js
  function initDna3D() {
    const container = document.getElementById('dna-3d-container');
    if (!container) {
      console.error("Container for 3D visualization not found.");
      return;
    }
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    // Store reference to scene for theme updates
    container.__scene = scene;
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(width, height);
    container.innerHTML = ''; // Clear any existing content
    container.appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Get theme colors - safely parse HSL values
    function parseHslColor(hslString) {
      const match = hslString.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
      return match ? { h: parseInt(match[1]), s: parseInt(match[2]), l: parseInt(match[3]) } : null;
    }
    
    const primaryHsl = parseHslColor(getComputedStyle(document.documentElement)
      .getPropertyValue('--primary')
      .trim()) || { h: 258, s: 58, l: 75 }; // Default purple
    
    const accentHsl = parseHslColor(getComputedStyle(document.documentElement)
      .getPropertyValue('--accent')
      .trim()) || { h: 199, s: 91, l: 49 }; // Default blue
    
    // Function to convert HSL values to hex color
    function hslToHex(h, s, l) {
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    }
    
    const primaryColor = hslToHex(primaryHsl.h, primaryHsl.s, primaryHsl.l);
    const accentColor = hslToHex(accentHsl.h, accentHsl.s, accentHsl.l);
    
    // Create DNA helix
    const createDNAHelix = () => {
      const dnaGroup = new THREE.Group();
      
      // Parameters for the helix
      const turns = 3; // Number of complete turns
      const pointsPerTurn = 20; // Points per turn
      const radius = 2; // Radius of helix
      const height = 8; // Height of helix
      const baseDistance = 0.8; // Distance between base pairs
      
      // Create the two strands
      for (let strand = 0; strand < 2; strand++) {
        const points = [];
        const strandColor = strand === 0 ? primaryColor : accentColor;
        
        for (let i = 0; i <= turns * pointsPerTurn; i++) {
          const t = i / pointsPerTurn;
          const angle = t * Math.PI * 2;
          const x = radius * Math.cos(angle + (strand * Math.PI));
          const y = t * height / turns - height / 2;
          const z = radius * Math.sin(angle + (strand * Math.PI));
          
          points.push(new THREE.Vector3(x, y, z));
        }
        
        // Create a tube geometry for the strand
        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, turns * pointsPerTurn, 0.15, 8, false);
        const material = new THREE.MeshPhongMaterial({ color: strandColor });
        const tube = new THREE.Mesh(geometry, material);
        
        dnaGroup.add(tube);
      }
      
      // Add base pairs (connections between strands)
      for (let i = 0; i < turns * 10; i++) {
        const t = i / (turns * 10) * turns;
        const angle = t * Math.PI * 2;
        
        const x1 = radius * Math.cos(angle);
        const y = t * height / turns - height / 2;
        const z1 = radius * Math.sin(angle);
        
        const x2 = radius * Math.cos(angle + Math.PI);
        const z2 = radius * Math.sin(angle + Math.PI);
        
        // Create the base pair connection
        const baseGeometry = new THREE.BoxGeometry(2 * radius, 0.1, 0.1);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        
        base.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
        base.lookAt(new THREE.Vector3(x2, y, z2));
        
        dnaGroup.add(base);
      }
      
      return dnaGroup;
    };
    
    const dnaHelix = createDNAHelix();
    scene.add(dnaHelix);
    
    // Position camera
    camera.position.z = 10;
    
    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    document.addEventListener('mousedown', (e) => {
      // Only react if the event happened on the canvas
      if (e.target === renderer.domElement) {
        isDragging = true;
      }
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaMove = {
          x: e.clientX - previousMousePosition.x,
          y: e.clientY - previousMousePosition.y
        };
        
        dnaHelix.rotation.y += deltaMove.x * 0.01;
        dnaHelix.rotation.x += deltaMove.y * 0.01;
      }
      
      previousMousePosition = {
        x: e.clientX,
        y: e.clientY
      };
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    // Zoom controls
    renderer.domElement.addEventListener('wheel', (e) => {
      camera.position.z += e.deltaY * 0.01;
      // Limit zoom range
      camera.position.z = Math.max(5, Math.min(15, camera.position.z));
      e.preventDefault();
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    });
    
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      // Automatic rotation when not dragging
      if (!isDragging) {
        dnaHelix.rotation.y += 0.005;
      }
      
      renderer.render(scene, camera);
    }
    
    animate();
    
    // Set initial background color based on theme
    scene.background = document.body.classList.contains('dark') 
      ? new THREE.Color(0x111827) 
      : new THREE.Color(0xf4f6f9);
  }
});
