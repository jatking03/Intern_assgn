
import { useState, useEffect, useCallback, useRef } from 'react';
import { DiscoveryServiceV3, DiscoveryEventCallback } from '@/services/DiscoveryServiceV3';
import { toast } from 'sonner';

export interface DiscoveryStatsV3 {
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
  blockedPrefixes: string[];
  rateLimited: number;
  efficiency: number;
}

interface UseDiscoveryServiceV3Options {
  delayBetweenRequests?: number;
  maxConcurrentRequests?: number;
  strategy?: 'v1' | 'v2' | 'v3';
  mlEnabled?: boolean;
}

export const useDiscoveryServiceV3 = (options: UseDiscoveryServiceV3Options = {}) => {
  const [stats, setStats] = useState<DiscoveryStatsV3>({
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
    blockedPrefixes: [],
    rateLimited: 0,
    efficiency: 0
  });
  
  const [isPaused, setIsPaused] = useState(false);
  const [recentNames, setRecentNames] = useState<string[]>([]);
  const [searchDelay, setSearchDelay] = useState(options.delayBetweenRequests || 250);
  const [maxConcurrentRequests, setMaxConcurrentRequests] = useState(options.maxConcurrentRequests || 4);
  const [strategy, setStrategy] = useState<'v1' | 'v2' | 'v3'>(options.strategy || 'v3');
  const [mlEnabled, setMlEnabled] = useState(options.mlEnabled ?? true);
  
  const serviceRef = useRef<DiscoveryServiceV3 | null>(null);
  
  // Initialize the service
  useEffect(() => {
    console.log("Initializing discovery service v3 with strategy:", strategy);
    
    // High-value initial prefixes for v3
    const v3Prefixes = ['a', 'b', 'c', 'd', 'e', 'j', 'k', 'l', 'm', 'n', 'r', 's', 't'];
    
    // Create a new instance of DiscoveryServiceV3
    serviceRef.current = new DiscoveryServiceV3({
      delayBetweenRequests: searchDelay,
      maxConcurrentRequests: maxConcurrentRequests,
      initialPrefixes: v3Prefixes,
      mlEnabled: mlEnabled
    });
    
    const handleDiscoveryUpdate: DiscoveryEventCallback = (serviceStats, newNames) => {
      console.log("Discovery v3 update received:", serviceStats, newNames);
      
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
          blockedPrefixes: serviceStats.blockedPrefixes,
          rateLimited: serviceStats.rateLimited,
          efficiency: serviceStats.efficiency,
          progress
        };
      });
      
      // Update recent names
      if (newNames.length > 0) {
        setRecentNames(prev => [...newNames, ...prev].slice(0, 50));
      }
    };
    
    serviceRef.current.setEventCallback(handleDiscoveryUpdate);
    
    // Enable simulation mode for demo purposes to handle the API being unreachable
    serviceRef.current.enableSimulationMode(true);
    
    return () => {
      if (serviceRef.current) {
        serviceRef.current.stop();
      }
    };
  }, [searchDelay, maxConcurrentRequests, strategy, mlEnabled]);
  
  // Update service options when they change
  useEffect(() => {
    if (serviceRef.current) {
      serviceRef.current.updateOptions({
        delayBetweenRequests: searchDelay,
        maxConcurrentRequests,
        mlEnabled
      });
    }
  }, [searchDelay, maxConcurrentRequests, mlEnabled]);
  
  const startDiscovery = useCallback(() => {
    console.log("Starting discovery v3 process");
    if (!serviceRef.current) {
      console.error("Discovery service v3 not initialized");
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
    
    toast.success('Discovery v3 process started', {
      description: 'Using ML-enhanced algorithm for maximum efficiency'
    });
  }, []);
  
  const stopDiscovery = useCallback(async () => {
    console.log("Stopping discovery v3 process");
    if (!serviceRef.current) return;
    
    await serviceRef.current.stop();
    
    setStats(prev => ({
      ...prev,
      isRunning: false,
      endTime: new Date()
    }));
    
    toast.info('Discovery v3 process stopped', {
      description: `Found ${stats.uniqueNames.length} unique names with ${stats.efficiency.toFixed(2)} names per request`
    });
  }, [stats.uniqueNames.length, stats.efficiency]);
  
  const pauseDiscovery = useCallback(() => {
    console.log("Toggling pause state:", !isPaused);
    if (!serviceRef.current) return;
    
    if (isPaused) {
      serviceRef.current.resume();
      toast('Discovery v3 resumed', {
        description: 'Continuing to explore the API with enhanced algorithm...'
      });
    } else {
      serviceRef.current.pause();
      toast('Discovery v3 paused', {
        description: 'Process paused. Resume when ready.'
      });
    }
    
    setIsPaused(!isPaused);
  }, [isPaused]);
  
  const resetDiscovery = useCallback(() => {
    console.log("Resetting discovery v3 process");
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
      blockedPrefixes: [],
      rateLimited: 0,
      efficiency: 0
    });
    
    setRecentNames([]);
  }, []);
  
  const updateSearchDelay = useCallback((delay: number) => {
    setSearchDelay(delay);
  }, []);
  
  const updateMaxConcurrentRequests = useCallback((count: number) => {
    setMaxConcurrentRequests(count);
  }, []);
  
  const updateStrategy = useCallback((newStrategy: 'v1' | 'v2' | 'v3') => {
    setStrategy(newStrategy);
  }, []);
  
  const toggleMlEnabled = useCallback(() => {
    setMlEnabled(prev => !prev);
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
    mlEnabled,
    startDiscovery,
    stopDiscovery,
    pauseDiscovery,
    resetDiscovery,
    updateSearchDelay,
    updateMaxConcurrentRequests,
    updateStrategy,
    toggleMlEnabled,
    getElapsedTime
  };
};
