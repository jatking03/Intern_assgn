import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, RefreshCw, Play, Pause, ChevronRight, Database, BarChart2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface DiscoveryStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  uniqueNames: string[];
  startTime: Date | null;
  endTime: Date | null;
  isRunning: boolean;
  progress: number;
  exploredPrefixes: string[];
  currentPrefix: string | null;
  rateLimited: number;
}

// Mock discovery algorithm
const DiscoveryDashboard: React.FC = () => {
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
    currentPrefix: null,
    rateLimited: 0
  });

  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const [strategy, setStrategy] = useState<'breadth-first' | 'depth-first'>('breadth-first');
  const [prefixQueue, setPrefixQueue] = useState<string[]>([]);
  const [searchDelay, setSearchDelay] = useState<number>(500); // ms between requests
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recentNames, setRecentNames] = useState<string[]>([]);

  const resetDiscovery = () => {
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
      currentPrefix: null,
      rateLimited: 0
    });
    setPrefixQueue([]);
    setRecentNames([]);
  };

  const startDiscovery = () => {
    resetDiscovery();
    
    // Initialize with single letters
    const initialPrefixes = alphabet.split('');
    setPrefixQueue(initialPrefixes);
    
    setStats(prev => ({
      ...prev,
      isRunning: true,
      startTime: new Date(),
      progress: 0
    }));
    
    toast.success('Discovery process started', {
      description: 'Exploring the autocomplete API for names...'
    });
  };

  const stopDiscovery = () => {
    setStats(prev => ({
      ...prev,
      isRunning: false,
      endTime: new Date()
    }));
    
    toast.info('Discovery process stopped', {
      description: `Found ${stats.uniqueNames.length} unique names in ${getElapsedTime()}`
    });
  };

  const pauseDiscovery = () => {
    setIsPaused(!isPaused);
    
    toast(isPaused ? 'Discovery resumed' : 'Discovery paused', {
      description: isPaused ? 'Continuing to explore the API...' : 'Process paused. Resume when ready.'
    });
  };

  // Simulate API call for demo purposes
  const mockApiCall = async (prefix: string): Promise<string[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate some names that would be returned
    if (prefix.length === 1) {
      return [`${prefix}lice`, `${prefix}ndrew`, `${prefix}my`].slice(0, Math.floor(Math.random() * 4));
    } else if (prefix.length === 2) {
      return [`${prefix}n`, `${prefix}lex`, `${prefix}nna`].slice(0, Math.floor(Math.random() * 3));
    } else if (prefix.length === 3 && Math.random() > 0.7) {
      return [`${prefix}nie`, `${prefix}ndy`];
    }
    
    // Sometimes return empty results
    return [];
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const processNextPrefix = async () => {
      if (!stats.isRunning || isPaused || prefixQueue.length === 0) return;
      
      const prefix = prefixQueue.shift() as string;
      
      setStats(prev => ({
        ...prev,
        currentPrefix: prefix,
        totalRequests: prev.totalRequests + 1
      }));
      
      try {
        // In a real implementation, use actual API call
        const results = await mockApiCall(prefix);
        
        // Process results
        if (results.length > 0) {
          const newNames = results.filter(name => !stats.uniqueNames.includes(name));
          
          setStats(prev => ({
            ...prev,
            successfulRequests: prev.successfulRequests + 1,
            uniqueNames: [...prev.uniqueNames, ...newNames],
            exploredPrefixes: [...prev.exploredPrefixes, prefix],
            progress: Math.min(100, prev.progress + (1 / (alphabet.length * 26)) * 100)
          }));
          
          // Add new names to recent discoveries
          setRecentNames(prev => [...newNames, ...prev].slice(0, 50));
          
          // If using breadth-first, add all combinations for the next level
          if (strategy === 'breadth-first' && prefix.length < 3) {
            const newPrefixes = alphabet.split('').map(char => prefix + char);
            setPrefixQueue(prev => [...prev, ...newPrefixes]);
          }
          // If using depth-first, continue down this path
          else if (strategy === 'depth-first' && prefix.length < 3 && results.length > 0) {
            const newPrefixes = alphabet.split('').map(char => prefix + char);
            setPrefixQueue(prev => [...newPrefixes, ...prev]);
          }
        } else {
          setStats(prev => ({
            ...prev,
            exploredPrefixes: [...prev.exploredPrefixes, prefix],
            progress: Math.min(100, prev.progress + (1 / (alphabet.length * 26)) * 100)
          }));
        }
      } catch (error) {
        setStats(prev => ({
          ...prev,
          failedRequests: prev.failedRequests + 1,
          rateLimited: prev.rateLimited + 1
        }));
        
        // Put the prefix back in the queue to try again later
        setPrefixQueue(prev => [...prev, prefix]);
        
        // Increase delay if we're being rate limited
        setSearchDelay(prev => Math.min(prev * 1.5, 2000));
        
        toast.error('Request failed', {
          description: 'Adjusting delay between requests...'
        });
      }
      
      // Schedule next request with delay
      timeoutId = setTimeout(processNextPrefix, searchDelay);
    };
    
    if (stats.isRunning && !isPaused && prefixQueue.length > 0) {
      timeoutId = setTimeout(processNextPrefix, searchDelay);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [stats.isRunning, isPaused, prefixQueue, searchDelay, strategy]);

  // Automatically stop when queue is empty
  useEffect(() => {
    if (stats.isRunning && prefixQueue.length === 0 && !stats.currentPrefix) {
      stopDiscovery();
    }
  }, [stats.isRunning, prefixQueue, stats.currentPrefix]);

  // Format elapsed time
  const getElapsedTime = () => {
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
  };

  return (
    <Card className="glass overflow-hidden border-border/30">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Database size={18} className="opacity-70" />
          Name Discovery Dashboard
        </CardTitle>
        <CardDescription>
          Extract all possible names from the autocomplete API
        </CardDescription>
      </CardHeader>
      
      <Separator className="opacity-30" />
      
      <Tabs defaultValue="dashboard" className="w-full">
        <div className="px-4 pt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="dashboard" className="p-4 pt-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-4 rounded-lg flex flex-col">
              <div className="text-sm text-muted-foreground">Discovered Names</div>
              <div className="text-2xl font-mono font-semibold mt-1">{stats.uniqueNames.length}</div>
            </div>
            <div className="glass p-4 rounded-lg flex flex-col">
              <div className="text-sm text-muted-foreground">Total Requests</div>
              <div className="text-2xl font-mono font-semibold mt-1">{stats.totalRequests}</div>
            </div>
          </div>
          
          <div className="glass p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Discovery Progress</span>
              <span className="text-xs font-mono">{Math.round(stats.progress)}%</span>
            </div>
            <Progress value={stats.progress} className="h-2" />
            
            {stats.currentPrefix && (
              <div className="flex items-center gap-2 text-sm animate-pulse-slow">
                <RefreshCw size={14} className="animate-spin-slow" />
                <span>Exploring: <span className="font-mono font-bold">{stats.currentPrefix}</span></span>
              </div>
            )}
          </div>
          
          <div className="glass p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Discovery Stats</div>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div>Successful Requests:</div>
              <div className="font-mono text-right">{stats.successfulRequests}</div>
              
              <div>Failed Requests:</div>
              <div className="font-mono text-right">{stats.failedRequests}</div>
              
              <div>Rate Limited:</div>
              <div className="font-mono text-right">{stats.rateLimited}</div>
              
              <div>Elapsed Time:</div>
              <div className="font-mono text-right">{getElapsedTime()}</div>
              
              <div>Queue Size:</div>
              <div className="font-mono text-right">{prefixQueue.length}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!stats.isRunning ? (
              <Button onClick={startDiscovery} className="flex-1 gap-1 flex items-center">
                <Play size={16} />
                Start Discovery
              </Button>
            ) : (
              <>
                <Button onClick={pauseDiscovery} variant="outline" className="flex-1 gap-1 flex items-center">
                  {isPaused ? <Play size={16} /> : <Pause size={16} />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button onClick={stopDiscovery} variant="destructive" className="flex-1 gap-1 flex items-center">
                  <AlertCircle size={16} />
                  Stop
                </Button>
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="strategy" className="p-4 pt-2 space-y-4">
          <div className="glass p-4 rounded-lg space-y-3">
            <div className="text-sm font-medium">Search Strategy</div>
            <div className="flex gap-2">
              <Button 
                variant={strategy === 'breadth-first' ? 'default' : 'outline'} 
                onClick={() => setStrategy('breadth-first')}
                disabled={stats.isRunning}
                className="flex-1"
              >
                Breadth-First
              </Button>
              <Button 
                variant={strategy === 'depth-first' ? 'default' : 'outline'} 
                onClick={() => setStrategy('depth-first')}
                disabled={stats.isRunning}
                className="flex-1"
              >
                Depth-First
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {strategy === 'breadth-first' ? (
                <div className="flex items-start gap-2">
                  <ChevronRight size={16} className="mt-0.5 flex-shrink-0" />
                  <div>Explores all possible prefixes of a given length before moving to longer prefixes. Good for wide coverage.</div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <ChevronRight size={16} className="mt-0.5 flex-shrink-0" />
                  <div>Follows a single prefix path as deeply as possible before backtracking. Efficiently finds complete names.</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="glass p-4 rounded-lg space-y-3">
            <div className="text-sm font-medium">Request Timing</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Delay between requests:</span>
                <span className="text-sm font-mono">{searchDelay}ms</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="2000" 
                step="100" 
                value={searchDelay}
                onChange={(e) => setSearchDelay(parseInt(e.target.value))}
                disabled={stats.isRunning}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Faster (may hit rate limits)</span>
                <span>Slower (more reliable)</span>
              </div>
            </div>
          </div>
          
          <div className="glass p-4 rounded-lg space-y-3">
            <div className="text-sm font-medium">Recent Activity</div>
            {stats.exploredPrefixes.length > 0 ? (
              <div className="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto">
                {stats.exploredPrefixes.slice(-50).map((prefix, index) => (
                  <Badge key={index} variant="secondary" className="font-mono text-xs">
                    {prefix}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No prefixes explored yet. Start the discovery process.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          <div className="px-4 pt-2 pb-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Discovered Names</h3>
              <Badge variant="outline" className="font-mono">
                {stats.uniqueNames.length}
              </Badge>
            </div>
            
            {stats.uniqueNames.length > 0 && (
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                <Database size={14} />
                Export
              </Button>
            )}
          </div>
          
          <Separator className="opacity-30" />
          
          <ScrollArea className="h-[300px] px-4">
            {stats.uniqueNames.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {stats.uniqueNames.map((name, index) => (
                  <div key={index} className="glass p-2 rounded-md font-mono text-sm truncate animate-fade-in">
                    {name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="text-muted-foreground mb-2">No names discovered yet</div>
                <div className="text-sm">
                  Start the discovery process to begin extracting names from the API
                </div>
              </div>
            )}
          </ScrollArea>
          
          {recentNames.length > 0 && (
            <>
              <Separator className="opacity-30" />
              <div className="px-4 pb-4">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock size={14} className="opacity-70" />
                  Recently Discovered
                </h3>
                <div className="flex flex-wrap gap-1">
                  {recentNames.slice(0, 10).map((name, index) => (
                    <Badge key={index} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default DiscoveryDashboard;
