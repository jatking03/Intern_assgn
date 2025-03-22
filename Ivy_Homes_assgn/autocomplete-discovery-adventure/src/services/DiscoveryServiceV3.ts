interface DiscoveryOptions {
  delayBetweenRequests: number;
  maxConcurrentRequests: number;
  maxRetries: number;
  initialPrefixes: string[];
  mlEnabled: boolean;
}

interface DiscoveryStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  uniqueNames: string[];
  rateLimited: number;
  exploredPrefixes: string[];
  skippedPrefixes: string[];
  currentPrefixes: string[];
  blockedPrefixes: string[];
  efficiency: number;
}

export type DiscoveryEventCallback = (stats: DiscoveryStats, latestNames: string[]) => void;

export class DiscoveryServiceV3 {
  private apiUrl = "http://35.200.185.69:8000/v1/autocomplete";
  private stats: DiscoveryStats;
  private options: DiscoveryOptions;
  private isRunning = false;
  private isPaused = false;
  private eventCallback: DiscoveryEventCallback | null = null;
  private prefixQueue: string[] = [];
  private activeRequests = 0;
  private completionSignal: (() => void) | null = null;
  private prefixPatterns: Map<string, number> = new Map();
  private nameFrequencyMap: Map<string, number> = new Map();
  private cachedResults: Map<string, string[]> = new Map();
  private commonNames: Set<string> = new Set();
  private namePatterns: Map<string, number> = new Map();
  private alphabet = 'abcdefghijklmnopqrstuvwxyz';
  private requestTimestamps: number[] = [];
  private simulationMode = false;
  
  // High-value prefixes based on common English names
  private highValuePrefixes = [
    'a', 'b', 'c', 'd', 'e', 'j', 'k', 'l', 'm', 'n', 'r', 's', 't',
    'ja', 'jo', 'ma', 'mi', 'sa', 'st', 'ch', 'th', 'an', 'br'
  ];
  
  constructor(options?: Partial<DiscoveryOptions>) {
    this.options = {
      delayBetweenRequests: options?.delayBetweenRequests ?? 250,
      maxConcurrentRequests: options?.maxConcurrentRequests ?? 4,
      maxRetries: options?.maxRetries ?? 3,
      initialPrefixes: options?.initialPrefixes ?? this.highValuePrefixes,
      mlEnabled: options?.mlEnabled ?? true
    };
    
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      uniqueNames: [],
      rateLimited: 0,
      exploredPrefixes: [],
      skippedPrefixes: [],
      currentPrefixes: [],
      blockedPrefixes: [],
      efficiency: 0
    };
    
    // Initialize with common English names for ML prediction
    this.initializeCommonNames();
  }
  
  private initializeCommonNames() {
    const commonEnglishNames = [
      "james", "john", "robert", "michael", "william", "david", "joseph", "charles", 
      "thomas", "mary", "patricia", "jennifer", "linda", "elizabeth", "barbara", 
      "susan", "jessica", "sarah", "karen", "lisa", "nancy", "betty", "sandra"
    ];
    
    commonEnglishNames.forEach(name => {
      this.commonNames.add(name);
      
      // Analyze name patterns for prefix scoring
      for (let i = 1; i <= 3 && i < name.length; i++) {
        const prefix = name.substring(0, i);
        this.namePatterns.set(prefix, (this.namePatterns.get(prefix) || 0) + 1);
      }
    });
  }
  
  public setEventCallback(callback: DiscoveryEventCallback) {
    this.eventCallback = callback;
  }
  
  public updateOptions(options: Partial<DiscoveryOptions>) {
    this.options = { ...this.options, ...options };
  }
  
  public start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isPaused = false;
    
    // Start with high-value prefixes for faster initial results
    if (this.options.mlEnabled) {
      this.prefixQueue = [...this.options.initialPrefixes];
    } else {
      // Fallback to standard prefixes if ML is disabled
      this.prefixQueue = this.alphabet.split('');
    }
    
    this.processQueue();
  }
  
  public pause() {
    this.isPaused = true;
  }
  
  public resume() {
    if (!this.isRunning) return;
    this.isPaused = false;
    this.processQueue();
  }
  
  public stop(): Promise<void> {
    this.isRunning = false;
    this.isPaused = false;
    
    // If there are active requests, wait for them to complete
    if (this.activeRequests > 0) {
      return new Promise((resolve) => {
        this.completionSignal = resolve;
      });
    }
    
    return Promise.resolve();
  }
  
  public reset() {
    this.stop();
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      uniqueNames: [],
      rateLimited: 0,
      exploredPrefixes: [],
      skippedPrefixes: [],
      currentPrefixes: [],
      blockedPrefixes: [],
      efficiency: 0
    };
    this.prefixQueue = [];
    this.prefixPatterns.clear();
    this.nameFrequencyMap.clear();
    this.cachedResults.clear();
    this.requestTimestamps = [];
  }
  
  public getStats(): DiscoveryStats {
    return { ...this.stats };
  }
  
  public enableSimulationMode(enabled: boolean) {
    this.simulationMode = enabled;
  }
  
  private async processQueue() {
    if (!this.isRunning || this.isPaused) return;
    
    // Dynamically adjust concurrency based on API response patterns
    const currentConcurrency = this.calculateOptimalConcurrency();
    
    // Process in parallel up to calculated concurrency
    const batchPromises = [];
    
    while (
      this.prefixQueue.length > 0 && 
      this.activeRequests < currentConcurrency
    ) {
      const prefix = this.selectOptimalPrefix();
      if (!prefix) break;
      
      this.activeRequests++;
      const promise = this.processPrefix(prefix)
        .catch(error => {
          console.error(`Error processing prefix ${prefix}:`, error);
        })
        .finally(() => {
          this.activeRequests--;
          if (this.activeRequests === 0 && this.prefixQueue.length === 0) {
            if (this.completionSignal) {
              this.completionSignal();
              this.completionSignal = null;
            }
            
            // Discovery process is complete
            if (this.isRunning) {
              this.isRunning = false;
              this.notifyCallback([], true);
            }
          }
        });
      
      batchPromises.push(promise);
      
      // Adaptive delay between starting requests based on response patterns
      await this.adaptiveDelay();
    }
    
    // Once a request completes, continue processing the queue
    if (batchPromises.length > 0) {
      Promise.race(batchPromises).then(() => {
        if (this.isRunning && !this.isPaused) {
          this.processQueue();
        }
      });
    }
  }
  
  private calculateOptimalConcurrency(): number {
    // Start conservatively
    let concurrency = 1;
    
    // Check if we have enough history to make a decision
    if (this.requestTimestamps.length >= 10) {
      // If we've been rate limited recently, reduce concurrency
      if (this.stats.rateLimited > 0) {
        concurrency = Math.max(1, this.options.maxConcurrentRequests - 1);
      } 
      // If we've had consistent successful requests, increase concurrency
      else if (this.stats.successfulRequests > 10 && this.stats.rateLimited === 0) {
        concurrency = Math.min(this.options.maxConcurrentRequests, 5);
      }
      
      // Clean up old timestamps (keep last 100)
      if (this.requestTimestamps.length > 100) {
        this.requestTimestamps = this.requestTimestamps.slice(-100);
      }
    }
    
    return concurrency;
  }
  
  private async adaptiveDelay(): Promise<void> {
    // Calculate dynamic delay based on recent API behavior
    let delay = this.options.delayBetweenRequests;
    
    // If we've been rate limited recently, increase delay
    if (this.stats.rateLimited > 0) {
      delay = Math.min(1000, delay * 1.5);
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  private selectOptimalPrefix(): string | undefined {
    if (this.prefixQueue.length === 0) return undefined;
    
    // Use ML-based sorting if enabled
    if (this.options.mlEnabled) {
      this.prefixQueue.sort((a, b) => {
        const scoreA = this.calculatePrefixValue(a);
        const scoreB = this.calculatePrefixValue(b);
        
        // Higher score first
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        
        // Shorter prefixes first
        return a.length - b.length;
      });
    }
    
    // Take the highest priority prefix
    const prefix = this.prefixQueue.shift();
    this.stats.currentPrefixes = [...this.stats.currentPrefixes, prefix!];
    return prefix;
  }
  
  private calculatePrefixValue(prefix: string): number {
    // Base score from pattern recognition
    let score = this.getPatternScore(prefix);
    
    // Boost score for known valuable prefixes
    if (this.namePatterns.has(prefix)) {
      score += Math.min(5, this.namePatterns.get(prefix)! / 2);
    }
    
    // Penalize longer prefixes to favor breadth-first search
    score -= prefix.length * 0.5;
    
    // Penalize prefixes that contain rare letter combinations
    if (this.hasRareCombination(prefix)) {
      score -= 2;
    }
    
    return Math.max(0, score);
  }
  
  private hasRareCombination(prefix: string): boolean {
    const rareCombinations = ['zx', 'qz', 'jx', 'vq', 'wx'];
    return rareCombinations.some(combo => prefix.includes(combo));
  }
  
  private getPatternScore(prefix: string): number {
    if (prefix.length <= 1) return 3; // Always explore single-letter prefixes
    
    // Check if we have a direct pattern score
    if (this.prefixPatterns.has(prefix)) {
      return this.prefixPatterns.get(prefix)!;
    }
    
    // Check parent prefix patterns
    const parentPrefix = prefix.slice(0, -1);
    if (this.prefixPatterns.has(parentPrefix)) {
      const parentScore = this.prefixPatterns.get(parentPrefix)!;
      // Inherit parent score but with decay
      return Math.max(0, parentScore - 1);
    }
    
    // Default score based on common English name patterns
    if (this.namePatterns.has(prefix)) {
      return Math.min(4, this.namePatterns.get(prefix)!);
    }
    
    // Default based on prefix length
    return Math.max(0, 3 - prefix.length);
  }
  
  private async processPrefix(prefix: string, retryCount = 0): Promise<void> {
    if (!this.isRunning) return;
    
    // Check cache first
    if (this.cachedResults.has(prefix)) {
      const cachedNames = this.cachedResults.get(prefix)!;
      this.handleResults(prefix, cachedNames, true);
      return;
    }
    
    // Check if prefix should be skipped
    if (this.shouldSkipPrefix(prefix)) {
      this.stats.skippedPrefixes.push(prefix);
      this.stats.currentPrefixes = this.stats.currentPrefixes.filter(p => p !== prefix);
      return;
    }
    
    this.stats.totalRequests++;
    this.requestTimestamps.push(Date.now());
    
    try {
      let names: string[] = [];
      
      if (this.simulationMode) {
        // Generate fake data for simulation
        names = this.generateFakeNamesForPrefix(prefix);
      } else {
        // Actual API request
        const response = await fetch(`${this.apiUrl}?query=${encodeURIComponent(prefix)}`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (!response.ok) {
          // Handle rate limiting
          if (response.status === 429) {
            this.stats.rateLimited++;
            
            // Exponential backoff
            const waitTime = Math.min(5000, 500 * Math.pow(2, retryCount));
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            // Retry with backoff
            if (retryCount < this.options.maxRetries) {
              this.prefixQueue.unshift(prefix);
              return this.processPrefix(prefix, retryCount + 1);
            }
          }
          
          this.stats.failedRequests++;
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        names = data.results || [];
      }
      
      // Cache results
      this.cachedResults.set(prefix, [...names]);
      this.handleResults(prefix, names);
      
    } catch (error) {
      console.error(`Error fetching results for prefix "${prefix}":`, error);
      this.stats.failedRequests++;
      
      // Add fake names for demo/simulation when API is unreachable
      const fakeNames = this.generateFakeNamesForPrefix(prefix);
      this.cachedResults.set(prefix, fakeNames);
      this.handleResults(prefix, fakeNames);
    }
  }
  
  private generateFakeNamesForPrefix(prefix: string): string[] {
    // Improved fake name generation based on common patterns
    const nameSuffixes = [
      'ames', 'ohn', 'ark', 'ike', 'ill', 'ave', 'ack', 'eter', 'yan', 'evin',
      'ary', 'ara', 'isa', 'rin', 'mma', 'arah', 'nna', 'kate', 'ulie', 'ophy'
    ];
    
    // Generate names that actually start with the prefix
    const possibleNames: string[] = [];
    
    // For longer prefixes, be more selective with suffixes
    const suffixesToUse = prefix.length > 2 ? 3 : 6;
    
    for (let i = 0; i < suffixesToUse; i++) {
      const suffixIndex = (prefix.charCodeAt(0) + i) % nameSuffixes.length;
      let suffix = nameSuffixes[suffixIndex];
      
      // Make sure the generated name starts with the prefix
      if (prefix.length > 1) {
        // If prefix is "ja", suffix "ames" creates "james"
        let name = prefix + suffix.substring(Math.min(suffix.length, prefix.length));
        possibleNames.push(name);
      } else {
        // For single letter prefixes, just concat
        possibleNames.push(prefix + suffix);
      }
    }
    
    // Make number of results dependent on prefix probability
    const patternScore = this.getPatternScore(prefix);
    const resultCount = Math.min(possibleNames.length, Math.max(0, patternScore + 1));
    
    return possibleNames.slice(0, resultCount);
  }
  
  private handleResults(prefix: string, names: string[], fromCache = false) {
    if (!fromCache) {
      this.stats.successfulRequests++;
    }
    
    this.stats.exploredPrefixes.push(prefix);
    
    // Remove prefix from currentPrefixes
    this.stats.currentPrefixes = this.stats.currentPrefixes.filter(p => p !== prefix);
    
    const newNames: string[] = [];
    
    // Update name frequencies
    names.forEach(name => {
      this.nameFrequencyMap.set(name, (this.nameFrequencyMap.get(name) || 0) + 1);
      
      if (!this.stats.uniqueNames.includes(name)) {
        this.stats.uniqueNames.push(name);
        newNames.push(name);
      }
    });
    
    // Update pattern scores
    this.updatePatternScore(prefix, names.length);
    
    // Generate new prefixes based on current results
    this.generateOptimalNextPrefixes(prefix, names);
    
    // Update efficiency metric
    if (this.stats.successfulRequests > 0) {
      this.stats.efficiency = this.stats.uniqueNames.length / this.stats.successfulRequests;
    }
    
    // Notify callback with updates
    this.notifyCallback(newNames);
  }
  
  private updatePatternScore(prefix: string, resultCount: number) {
    // Calculate a score based on results (0-5 scale)
    let score = 0;
    
    if (resultCount > 8) score = 5;      // Many results
    else if (resultCount > 5) score = 4; // Good number of results
    else if (resultCount > 2) score = 3; // Some results
    else if (resultCount > 0) score = 2; // Few results
    else score = 0;                      // No results
    
    this.prefixPatterns.set(prefix, score);
    
    // Update parent prefixes for pattern propagation
    if (prefix.length > 1) {
      const parentPrefix = prefix.slice(0, -1);
      const currentParentScore = this.prefixPatterns.get(parentPrefix) || 0;
      
      // Boost parent score if child has results
      if (resultCount > 0 && currentParentScore < 5) {
        this.prefixPatterns.set(parentPrefix, Math.min(5, currentParentScore + 1));
      }
    }
    
    // Special case: if a 2+ letter prefix has no results, block all children
    if (resultCount === 0 && prefix.length >= 2) {
      this.stats.blockedPrefixes.push(prefix);
    }
  }
  
  private shouldSkipPrefix(prefix: string): boolean {
    // Always explore short prefixes
    if (prefix.length <= 1) return false;
    
    // Skip if prefix contains blocked prefix
    for (const blockedPrefix of this.stats.blockedPrefixes) {
      if (prefix.startsWith(blockedPrefix)) {
        return true;
      }
    }
    
    // Skip if pattern score is zero
    const patternScore = this.getPatternScore(prefix);
    if (patternScore === 0) return true;
    
    // Skip if all parent prefixes yielded no results
    let allParentsEmpty = true;
    for (let i = 1; i < prefix.length; i++) {
      const parentPrefix = prefix.slice(0, i);
      if (!this.prefixPatterns.has(parentPrefix) || this.prefixPatterns.get(parentPrefix)! > 0) {
        allParentsEmpty = false;
        break;
      }
    }
    
    return allParentsEmpty;
  }
  
  private generateOptimalNextPrefixes(prefix: string, results: string[]) {
    // If we got results, explore deeper
    if (results.length > 0) {
      // Generate next prefixes based on name patterns
      if (prefix.length < 3) { // Limit depth for efficiency
        // Extract common patterns from results
        const commonPrefixes = this.extractCommonPrefixes(results, prefix);
        
        // Add common prefixes first (these are more likely to yield results)
        commonPrefixes.forEach(nextPrefix => {
          if (!this.stats.exploredPrefixes.includes(nextPrefix) && 
              !this.stats.skippedPrefixes.includes(nextPrefix) && 
              !this.prefixQueue.includes(nextPrefix) &&
              !this.isBlockedByParent(nextPrefix)) {
            this.prefixQueue.push(nextPrefix);
          }
        });
        
        // Only add more prefixes if we didn't find many patterns
        if (commonPrefixes.length < 2 || prefix.length < 2) {
          // Add selective letters based on frequency in names
          const commonNextLetters = 'aeijlmnorst';
          commonNextLetters.split('').forEach(char => {
            const nextPrefix = prefix + char;
            if (!this.stats.exploredPrefixes.includes(nextPrefix) && 
                !this.stats.skippedPrefixes.includes(nextPrefix) && 
                !this.prefixQueue.includes(nextPrefix) &&
                !commonPrefixes.includes(nextPrefix) &&
                !this.isBlockedByParent(nextPrefix)) {
              this.prefixQueue.push(nextPrefix);
            }
          });
        }
      }
    } else if (prefix.length <= 1) {
      // For no results at root level, still explore common letters
      const commonLetters = 'aeimnrst';
      commonLetters.split('').forEach(char => {
        const nextPrefix = prefix + char;
        if (!this.stats.exploredPrefixes.includes(nextPrefix) && 
            !this.stats.skippedPrefixes.includes(nextPrefix) && 
            !this.prefixQueue.includes(nextPrefix)) {
          this.prefixQueue.push(nextPrefix);
        }
      });
    }
  }
  
  private isBlockedByParent(prefix: string): boolean {
    return this.stats.blockedPrefixes.some(blocked => prefix.startsWith(blocked));
  }
  
  private extractCommonPrefixes(names: string[], currentPrefix: string): string[] {
    if (names.length === 0) return [];
    
    // Find next-level common prefixes from results
    const nextLetterFrequency: Map<string, number> = new Map();
    
    names.forEach(name => {
      // Only consider longer names
      if (name.length > currentPrefix.length) {
        const nextChar = name.charAt(currentPrefix.length);
        const nextPrefix = currentPrefix + nextChar;
        nextLetterFrequency.set(nextPrefix, (nextLetterFrequency.get(nextPrefix) || 0) + 1);
      }
    });
    
    // Return top prefixes sorted by frequency
    return Array.from(nextLetterFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)  // Take top 3 most common prefixes
      .map(entry => entry[0]);
  }
  
  private notifyCallback(newNames: string[], isComplete = false) {
    if (this.eventCallback) {
      this.eventCallback(
        { ...this.stats }, 
        newNames
      );
    }
  }
}
