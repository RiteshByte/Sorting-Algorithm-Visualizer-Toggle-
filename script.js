class SortingVisualizer {
  constructor() {
    this.selectedAlgorithm = null;
    this.originalArray = [];
    this.sortedArray = [];
    this.steps = [];
    this.isAnimating = false;
    this.animationSpeed = 300;
    this.currentStep = 0;
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    
    this.init();
  }

  init() {
    this.initializeTheme();
    this.setupEventListeners();
    this.loadAlgorithmDescriptions();
  }

  initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (this.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.classList.add('active');
    }
  }

  setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
      this.toggleTheme();
    });

    // Algorithm card selection
    document.querySelectorAll('.algo-card').forEach(card => {
      card.addEventListener('click', (e) => {
        this.selectAlgorithm(card.getAttribute('data-algo'));
      });
    });

    // Form submission
    document.getElementById('sortForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSort();
    });

    // Random number generation
    document.getElementById('randomBtn').addEventListener('click', () => {
      this.generateRandomNumbers();
    });

    // Input validation
    document.getElementById('userInput').addEventListener('input', (e) => {
      this.validateInput(e.target.value);
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.target.getAttribute('data-tab'));
      });
    });

    // Result controls
    document.getElementById('copyBtn').addEventListener('click', () => {
      this.copyResults();
    });

    document.getElementById('newSortBtn').addEventListener('click', () => {
      this.resetVisualizer();
    });

    // Modal
    document.getElementById('aboutLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.showModal();
    });

    document.querySelector('.close').addEventListener('click', () => {
      this.hideModal();
    });

    // Close modal on outside click
    document.getElementById('aboutModal').addEventListener('click', (e) => {
      if (e.target.id === 'aboutModal') {
        this.hideModal();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    const themeToggle = document.getElementById('themeToggle');
    
    if (this.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.classList.add('active');
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.classList.remove('active');
    }
    
    localStorage.setItem('darkMode', this.darkMode);
  }

  selectAlgorithm(algorithm) {
    // Remove previous selection
    document.querySelectorAll('.algo-card').forEach(card => {
      card.classList.remove('selected');
    });

    // Add selection to clicked card
    document.querySelector(`[data-algo="${algorithm}"]`).classList.add('selected');
    
    this.selectedAlgorithm = algorithm;
    
    // Update UI
    const titleElement = document.getElementById('selected-algo-title');
    const algorithmNames = {
      bubble: 'Bubble Sort',
      selection: 'Selection Sort',
      insertion: 'Insertion Sort',
      merge: 'Merge Sort',
      quick: 'Quick Sort'
    };
    
    titleElement.textContent = `Selected: ${algorithmNames[algorithm]}`;
    document.getElementById('solveBtn').disabled = false;
  }

  validateInput(input) {
    const numbers = input.split(',').map(n => n.trim()).filter(n => n !== '');
    const isValid = numbers.every(n => !isNaN(n) && n !== '');
    const solveBtn = document.getElementById('solveBtn');
    
    if (isValid && numbers.length > 0 && this.selectedAlgorithm) {
      solveBtn.disabled = false;
    } else {
      solveBtn.disabled = true;
    }
  }

  generateRandomNumbers() {
    const count = Math.floor(Math.random() * 8) + 5; // 5-12 numbers
    const numbers = [];
    
    for (let i = 0; i < count; i++) {
      numbers.push(Math.floor(Math.random() * 99) + 1); // 1-99
    }
    
    document.getElementById('userInput').value = numbers.join(', ');
    this.validateInput(document.getElementById('userInput').value);
  }

  parseInput() {
    const input = document.getElementById('userInput').value;
    return input.split(',')
               .map(n => parseInt(n.trim()))
               .filter(n => !isNaN(n));
  }

  async handleSort() {
    if (!this.selectedAlgorithm || this.isAnimating) return;

    const inputArray = this.parseInput();
    if (inputArray.length === 0) {
      alert('Please enter valid numbers separated by commas.');
      return;
    }

    this.originalArray = [...inputArray];
    this.steps = [];
    this.currentStep = 0;

    // Show result area
    document.getElementById('resultArea').classList.remove('hidden');
    
    // Scroll to results
    document.getElementById('resultArea').scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });

    // Start timing
    const startTime = performance.now();

    // Perform sorting based on selected algorithm
    switch (this.selectedAlgorithm) {
      case 'bubble':
        this.sortedArray = await this.bubbleSort([...inputArray]);
        break;
      case 'selection':
        this.sortedArray = await this.selectionSort([...inputArray]);
        break;
      case 'insertion':
        this.sortedArray = await this.insertionSort([...inputArray]);
        break;
      case 'merge':
        this.sortedArray = await this.mergeSort([...inputArray]);
        break;
      case 'quick':
        this.sortedArray = await this.quickSort([...inputArray]);
        break;
    }

    const endTime = performance.now();
    const timeTaken = (endTime - startTime).toFixed(2);

    // Update UI with results
    this.displayResults(timeTaken);
    
    // Start visualization
    this.visualizeArray(inputArray);
    await this.animateSorting();
  }

  async bubbleSort(arr) {
    const n = arr.length;
    this.steps.push(`Starting Bubble Sort with array: [${arr.join(', ')}]`);
    
    for (let i = 0; i < n - 1; i++) {
      this.steps.push(`\nPass ${i + 1}:`);
      let swapped = false;
      
      for (let j = 0; j < n - i - 1; j++) {
        this.steps.push(`Comparing ${arr[j]} and ${arr[j + 1]}`);
        
        if (arr[j] > arr[j + 1]) {
          // Swap elements
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          this.steps.push(`Swapped: [${arr.join(', ')}]`);
          swapped = true;
        } else {
          this.steps.push(`No swap needed`);
        }
      }
      
      if (!swapped) {
        this.steps.push(`Array is sorted after ${i + 1} passes`);
        break;
      }
    }
    
    this.steps.push(`\nFinal sorted array: [${arr.join(', ')}]`);
    return arr;
  }

  async selectionSort(arr) {
    const n = arr.length;
    this.steps.push(`Starting Selection Sort with array: [${arr.join(', ')}]`);
    
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      this.steps.push(`\nPass ${i + 1}: Finding minimum from index ${i}`);
      
      for (let j = i + 1; j < n; j++) {
        this.steps.push(`Comparing ${arr[j]} with current minimum ${arr[minIdx]}`);
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          this.steps.push(`New minimum found: ${arr[minIdx]} at index ${minIdx}`);
        }
      }
      
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        this.steps.push(`Swapped ${arr[minIdx]} with ${arr[i]}: [${arr.join(', ')}]`);
      } else {
        this.steps.push(`No swap needed, element already in correct position`);
      }
    }
    
    this.steps.push(`\nFinal sorted array: [${arr.join(', ')}]`);
    return arr;
  }

  async insertionSort(arr) {
    const n = arr.length;
    this.steps.push(`Starting Insertion Sort with array: [${arr.join(', ')}]`);
    
    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;
      
      this.steps.push(`\nPass ${i}: Inserting ${key} into sorted portion`);
      
      while (j >= 0 && arr[j] > key) {
        this.steps.push(`Moving ${arr[j]} one position ahead`);
        arr[j + 1] = arr[j];
        j--;
      }
      
      arr[j + 1] = key;
      this.steps.push(`Inserted ${key} at position ${j + 1}: [${arr.join(', ')}]`);
    }
    
    this.steps.push(`\nFinal sorted array: [${arr.join(', ')}]`);
    return arr;
  }

  async mergeSort(arr) {
    this.steps.push(`Starting Merge Sort with array: [${arr.join(', ')}]`);
    
    const mergeSortHelper = (arr, left, right) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        this.steps.push(`Dividing array from index ${left} to ${right}, mid: ${mid}`);
        
        mergeSortHelper(arr, left, mid);
        mergeSortHelper(arr, mid + 1, right);
        merge(arr, left, mid, right);
      }
    };
    
    const merge = (arr, left, mid, right) => {
      const leftArr = arr.slice(left, mid + 1);
      const rightArr = arr.slice(mid + 1, right + 1);
      
      this.steps.push(`Merging [${leftArr.join(', ')}] and [${rightArr.join(', ')}]`);
      
      let i = 0, j = 0, k = left;
      
      while (i < leftArr.length && j < rightArr.length) {
        if (leftArr[i] <= rightArr[j]) {
          arr[k] = leftArr[i];
          i++;
        } else {
          arr[k] = rightArr[j];
          j++;
        }
        k++;
      }
      
      while (i < leftArr.length) {
        arr[k] = leftArr[i];
        i++;
        k++;
      }
      
      while (j < rightArr.length) {
        arr[k] = rightArr[j];
        j++;
        k++;
      }
      
      this.steps.push(`Merged result: [${arr.slice(left, right + 1).join(', ')}]`);
    };
    
    mergeSortHelper(arr, 0, arr.length - 1);
    this.steps.push(`\nFinal sorted array: [${arr.join(', ')}]`);
    return arr;
  }

  async quickSort(arr) {
    this.steps.push(`Starting Quick Sort with array: [${arr.join(', ')}]`);
    
    const quickSortHelper = (arr, low, high) => {
      if (low < high) {
        const pi = partition(arr, low, high);
        
        this.steps.push(`Pivot ${arr[pi]} is in correct position`);
        
        quickSortHelper(arr, low, pi - 1);
        quickSortHelper(arr, pi + 1, high);
      }
    };
    
    const partition = (arr, low, high) => {
      const pivot = arr[high];
      this.steps.push(`Choosing pivot: ${pivot}`);
      
      let i = low - 1;
      
      for (let j = low; j < high; j++) {
        this.steps.push(`Comparing ${arr[j]} with pivot ${pivot}`);
        
        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          this.steps.push(`Swapped ${arr[j]} with ${arr[i]}: [${arr.join(', ')}]`);
        }
      }
      
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      this.steps.push(`Placed pivot at position ${i + 1}: [${arr.join(', ')}]`);
      
      return i + 1;
    };
    
    quickSortHelper(arr, 0, arr.length - 1);
    this.steps.push(`\nFinal sorted array: [${arr.join(', ')}]`);
    return arr;
  }

  visualizeArray(array) {
    const container = document.getElementById('arrayVisualization');
    container.innerHTML = '';
    
    const maxValue = Math.max(...array);
    const containerHeight = container.offsetHeight || 150;
    
    array.forEach((value, index) => {
      const bar = document.createElement('div');
      bar.className = 'array-bar';
      bar.style.height = `${(value / maxValue) * (containerHeight - 30)}px`;
      bar.setAttribute('data-value', value);
      bar.setAttribute('data-index', index);
      
      const valueLabel = document.createElement('span');
      valueLabel.className = 'value';
      valueLabel.textContent = value;
      bar.appendChild(valueLabel);
      
      container.appendChild(bar);
    });
  }

  async animateSorting() {
    // Simple animation - just highlight the final sorted state
    const bars = document.querySelectorAll('.array-bar');
    
    for (let i = 0; i < bars.length; i++) {
      await this.sleep(100);
      bars[i].classList.add('sorted');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  displayResults(timeTaken) {
    // Update summary
    document.getElementById('originalArray').textContent = `[${this.originalArray.join(', ')}]`;
    document.getElementById('sortedOutput').textContent = `[${this.sortedArray.join(', ')}]`;
    document.getElementById('timeTaken').textContent = `${timeTaken} ms`;
    
    // Update steps
    document.getElementById('stepsContent').textContent = this.steps.join('\n');
    
    // Update complexity analysis
    this.displayComplexityAnalysis();
    
    // Update code
    this.displayCode();
  }

  displayComplexityAnalysis() {
    const complexityData = {
      bubble: {
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)',
        space: 'O(1)',
        stable: 'Yes',
        description: 'Bubble sort is a simple comparison-based algorithm. It repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.'
      },
      selection: {
        best: 'O(n²)',
        average: 'O(n²)',
        worst: 'O(n²)',
        space: 'O(1)',
        stable: 'No',
        description: 'Selection sort divides the input list into a sorted and an unsorted region, and repeatedly selects the smallest element from the unsorted region.'
      },
      insertion: {
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)',
        space: 'O(1)',
        stable: 'Yes',
        description: 'Insertion sort builds the final sorted array one item at a time. It is efficient for small datasets and nearly sorted arrays.'
      },
      merge: {
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n)',
        space: 'O(n)',
        stable: 'Yes',
        description: 'Merge sort is a divide-and-conquer algorithm that divides the array into halves, sorts them, and then merges them back together.'
      },
      quick: {
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n²)',
        space: 'O(log n)',
        stable: 'No',
        description: 'Quick sort uses a divide-and-conquer approach by selecting a pivot element and partitioning the array around it.'
      }
    };

    const data = complexityData[this.selectedAlgorithm];
    const complexityContent = document.getElementById('complexityContent');
    
    complexityContent.innerHTML = `
      <div class="complexity-grid">
        <h3>Time Complexity Analysis</h3>
        <div class="complexity-item">
          <strong>Best Case:</strong> ${data.best}
        </div>
        <div class="complexity-item">
          <strong>Average Case:</strong> ${data.average}
        </div>
        <div class="complexity-item">
          <strong>Worst Case:</strong> ${data.worst}
        </div>
        <div class="complexity-item">
          <strong>Space Complexity:</strong> ${data.space}
        </div>
        <div class="complexity-item">
          <strong>Stable:</strong> ${data.stable}
        </div>
        <h3>Algorithm Description</h3>
        <p>${data.description}</p>
        <h3>Performance Analysis</h3>
        <p><strong>Array Size:</strong> ${this.originalArray.length} elements</p>
        <p><strong>Total Comparisons:</strong> Approximately ${this.estimateComparisons()}</p>
      </div>
    `;
  }

  estimateComparisons() {
    const n = this.originalArray.length;
    switch (this.selectedAlgorithm) {
      case 'bubble':
        return Math.floor(n * (n - 1) / 2);
      case 'selection':
        return Math.floor(n * (n - 1) / 2);
      case 'insertion':
        return Math.floor(n * n / 4);
      case 'merge':
        return Math.floor(n * Math.log2(n));
      case 'quick':
        return Math.floor(n * Math.log2(n));
      default:
        return 'N/A';
    }
  }

  displayCode() {
    const codeExamples = {
      bubble: `function bubbleSort(arr) {
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap elements
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        
        // If no swapping occurred, array is sorted
        if (!swapped) break;
    }
    
    return arr;
}`,
      selection: `function selectionSort(arr) {
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        
        // Find minimum element in remaining array
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        
        // Swap minimum element with first element
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        }
    }
    
    return arr;
}`,
      insertion: `function insertionSort(arr) {
    const n = arr.length;
    
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        
        // Move elements greater than key one position ahead
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        
        arr[j + 1] = key;
    }
    
    return arr;
}`,
      merge: `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
}`,
      quick: `function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        const pi = partition(arr, low, high);
        
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
    
    return arr;
}

function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}`
    };

    document.getElementById('codeContent').textContent = codeExamples[this.selectedAlgorithm];
  }

  switchTab(tabName) {
    // Remove active class from all tabs and panes
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });

    // Add active class to selected tab and pane
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
  }

  async copyResults() {
    const resultsText = `
Sorting Algorithm: ${this.selectedAlgorithm.charAt(0).toUpperCase() + this.selectedAlgorithm.slice(1)} Sort
Original Array: [${this.originalArray.join(', ')}]
Sorted Array: [${this.sortedArray.join(', ')}]

Steps:
${this.steps.join('\n')}
    `.trim();

    try {
      await navigator.clipboard.writeText(resultsText);
      
      // Show temporary feedback
      const copyBtn = document.getElementById('copyBtn');
      const originalHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i>';
      copyBtn.style.background = '#4caf50';
      
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.style.background = '';
      }, 1500);
    } catch (err) {
      console.error('Failed to copy results:', err);
      alert('Failed to copy results to clipboard');
    }
  }

  resetVisualizer() {
    // Clear selections
    document.querySelectorAll('.algo-card').forEach(card => {
      card.classList.remove('selected');
    });

    // Reset form
    document.getElementById('userInput').value = '';
    document.getElementById('selected-algo-title').textContent = 'Select an algorithm above';
    document.getElementById('solveBtn').disabled = true;

    // Hide results
    document.getElementById('resultArea').classList.add('hidden');

    // Reset state
    this.selectedAlgorithm = null;
    this.originalArray = [];
    this.sortedArray = [];
    this.steps = [];
    this.isAnimating = false;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showModal() {
    document.getElementById('aboutModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  hideModal() {
    document.getElementById('aboutModal').style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  handleKeyboardShortcuts(e) {
    // Escape key to close modal
    if (e.key === 'Escape') {
      this.hideModal();
    }
    
    // Ctrl/Cmd + Enter to sort
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!document.getElementById('solveBtn').disabled) {
        this.handleSort();
      }
    }
    
    // Ctrl/Cmd + R to reset
    if ((e.ctrlKey || e.metaKey) && e.key === 'r' && !document.getElementById('resultArea').classList.contains('hidden')) {
      e.preventDefault();
      this.resetVisualizer();
    }
  }

  loadAlgorithmDescriptions() {
    // This could be expanded to load more detailed descriptions
    // from an external source or API
    console.log('Algorithm descriptions loaded');
  }

  // Utility method for debugging
  logState() {
    console.log({
      selectedAlgorithm: this.selectedAlgorithm,
      originalArray: this.originalArray,
      sortedArray: this.sortedArray,
      stepsCount: this.steps.length,
      isAnimating: this.isAnimating,
      darkMode: this.darkMode
    });
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.sortingVisualizer = new SortingVisualizer();
  
  // Add some fun easter eggs
  console.log('%c🔄 Sorting Algorithm Visualizer Loaded!', 'color: #4a6bff; font-size: 16px; font-weight: bold;');
  console.log('%cKeyboard shortcuts:', 'color: #666; font-size: 12px;');
  console.log('%c• Ctrl/Cmd + Enter: Start sorting', 'color: #666; font-size: 12px;');
  console.log('%c• Ctrl/Cmd + R: Reset (when results visible)', 'color: #666; font-size: 12px;');
  console.log('%c• Escape: Close modal', 'color: #666; font-size: 12px;');
});

// Handle page visibility changes to pause animations if needed
document.addEventListener('visibilitychange', () => {
  if (document.hidden && window.sortingVisualizer) {
    window.sortingVisualizer.isAnimating = false;
  }
});

// Add some additional CSS for the complexity analysis
const additionalStyles = `
<style>
.complexity-grid {
  display: grid;
  gap: 1rem;
}

.complexity-item {
  padding: 0.5rem;
  background-color: var(--light-bg);
  border-radius: 5px;
  border-left: 3px solid var(--primary-color);
}

.complexity-item strong {
  color: var(--primary-color);
}

@media (min-width: 768px) {
  .complexity-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .complexity-grid h3 {
    grid-column: 1 / -1;
  }
  
  .complexity-grid p {
    grid-column: 1 / -1;
  }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);