import { useState, useEffect, useCallback, useRef } from 'react';
import { DiscoveryService, DiscoveryEventCallback } from '@/services/DiscoveryService';
import { toast } from 'sonner';

export interface DiscoveryStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  uniqueNames: string[];
  startTime: Date | null;
  endTime: Date | null;
  isRunning: boolean;
  progress: number;
  exploredPrefixes: string[];
  skippedPrefixes: string[];
  currentPrefixes: string[];
  rateLimited: number;
}

interface UseDiscoveryServiceOptions {
  delayBetweenRequests?: number;
  maxConcurrentRequests?: number;
  strategy?: 'v1' | 'v2';
}

export const useDiscoveryService = (options: UseDiscoveryServiceOptions = {}) => {
  const [stats, setStats] = useState<DiscoveryStats>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    uniqueNames: [],
    startTime: null,
    endTime: null,
    isRunning: false,
    progress: 0,
    exploredPrefixes: [],
    skippedPrefixes: [],
    currentPrefixes: [],
    rateLimited: 0
  });
  
  const [isPaused, setIsPaused] = useState(false);
  const [recentNames, setRecentNames] = useState<string[]>([]);
  const [searchDelay, setSearchDelay] = useState(options.delayBetweenRequests || 300);
  const [maxConcurrentRequests, setMaxConcurrentRequests] = useState(options.maxConcurrentRequests || 3);
  const [strategy, setStrategy] = useState<'v1' | 'v2'>(options.strategy || 'v2');
  
  const serviceRef = useRef<DiscoveryService | null>(null);
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  
  // Initialize the service
  useEffect(() => {
    console.log("Initializing discovery service with strategy:", strategy);
    
    // Create a new instance of DiscoveryService
    serviceRef.current = new DiscoveryService({
      delayBetweenRequests: searchDelay,
      maxConcurrentRequests: maxConcurrentRequests,
      initialPrefixes: strategy === 'v1' ? alphabet.split('') : ['a', 'b', 'c', 'd', 'e', 'm', 'j', 's', 't']
    });
    
    const handleDiscoveryUpdate: DiscoveryEventCallback = (serviceStats, newNames) => {
      console.log("Discovery update received:", serviceStats, newNames);
      
      setStats(prev => {
        // Calculate progress - this is an estimation
        const totalPossiblePrefixes = Math.pow(26, 2) + 26; // Single chars + double chars
        const progress = Math.min(
          100, 
          ((serviceStats.exploredPrefixes.length + serviceStats.skippedPrefixes.length) / totalPossiblePrefixes) * 100
        );
        
        return {
          ...prev,
          totalRequests: serviceStats.totalRequests,
          successfulRequests: serviceStats.successfulRequests,
          failedRequests: serviceStats.failedRequests,
          uniqueNames: serviceStats.uniqueNames,
          exploredPrefixes: serviceStats.exploredPrefixes,
          skippedPrefixes: serviceStats.skippedPrefixes,
          currentPrefixes: serviceStats.currentPrefixes,
          rateLimited: serviceStats.rateLimited,
          progress
        };
      });
      
      // Update recent names
      if (newNames.length > 0) {
        setRecentNames(prev => [...newNames, ...prev].slice(0, 50));
      }
    };
    
    serviceRef.current.setEventCallback(handleDiscoveryUpdate);
    
    return () => {
      if (serviceRef.current) {
        serviceRef.current.stop();
      }
    };
  }, [searchDelay, maxConcurrentRequests, strategy]);
  
  // Update service options when they change
  useEffect(() => {
    if (serviceRef.current) {
      serviceRef.current.updateOptions({
        delayBetweenRequests: searchDelay,
        maxConcurrentRequests
      });
    }
  }, [searchDelay, maxConcurrentRequests]);
  
  const startDiscovery = useCallback(() => {
    console.log("Starting discovery process");
    if (!serviceRef.current) {
      console.error("Discovery service not initialized");
      return;
    }
    
    setStats(prev => ({
      ...prev,
      isRunning: true,
      startTime: new Date(),
      endTime: null,
      progress: 0
    }));
    
    serviceRef.current.reset();
    serviceRef.current.start();
    
    toast.success('Discovery process started', {
      description: 'Using V2 algorithm for efficient name extraction'
    });
  }, []);
  
  const stopDiscovery = useCallback(async () => {
    console.log("Stopping discovery process");
    if (!serviceRef.current) return;
    
    await serviceRef.current.stop();
    
    setStats(prev => ({
      ...prev,
      isRunning: false,
      endTime: new Date()
    }));
    
    toast.info('Discovery process stopped', {
      description: `Found ${stats.uniqueNames.length} unique names`
    });
  }, [stats.uniqueNames.length]);
  
  const pauseDiscovery = useCallback(() => {
    console.log("Toggling pause state:", !isPaused);
    if (!serviceRef.current) return;
    
    if (isPaused) {
      serviceRef.current.resume();
      toast('Discovery resumed', {
        description: 'Continuing to explore the API...'
      });
    } else {
      serviceRef.current.pause();
      toast('Discovery paused', {
        description: 'Process paused. Resume when ready.'
      });
    }
    
    setIsPaused(!isPaused);
  }, [isPaused]);
  
  const resetDiscovery = useCallback(() => {
    console.log("Resetting discovery process");
    if (serviceRef.current) {
      serviceRef.current.reset();
    }
    
    setStats({
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      uniqueNames: [],
      startTime: null,
      endTime: null,
      isRunning: false,
      progress: 0,
      exploredPrefixes: [],
      skippedPrefixes: [],
      currentPrefixes: [],
      rateLimited: 0
    });
    
    setRecentNames([]);
  }, []);
  
  const updateSearchDelay = useCallback((delay: number) => {
    setSearchDelay(delay);
  }, []);
  
  const updateMaxConcurrentRequests = useCallback((count: number) => {
    setMaxConcurrentRequests(count);
  }, []);
  
  const updateStrategy = useCallback((newStrategy: 'v1' | 'v2') => {
    setStrategy(newStrategy);
  }, []);
  
  // Format elapsed time helper
  const getElapsedTime = useCallback(() => {
    if (!stats.startTime) return '0s';
    
    const endTime = stats.endTime || new Date();
    const elapsedMs = endTime.getTime() - stats.startTime.getTime();
    
    const seconds = Math.floor(elapsedMs / 1000) % 60;
    const minutes = Math.floor(elapsedMs / (1000 * 60)) % 60;
    const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, [stats.startTime, stats.endTime]);
  
  return {
    stats,
    recentNames,
    isPaused,
    searchDelay,
    maxConcurrentRequests,
    strategy,
    startDiscovery,
    stopDiscovery,
    pauseDiscovery,
    resetDiscovery,
    updateSearchDelay,
    updateMaxConcurrentRequests,
    updateStrategy,
    getElapsedTime
  };
};
