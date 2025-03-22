
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, RefreshCw, Play, Pause, ChevronRight, Database, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from '@/components/ui/separator';
import { useDiscoveryService } from '@/hooks/useDiscoveryService';
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

const DiscoveryDashboardV2: React.FC = () => {
  const { 
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
  } = useDiscoveryService();
  
  const [nameFilter, setNameFilter] = useState("");
  
  const filteredNames = stats.uniqueNames.filter(name => 
    name.toLowerCase().includes(nameFilter.toLowerCase())
  );
  
  const efficiencyRatio = stats.successfulRequests > 0 
    ? (stats.uniqueNames.length / stats.successfulRequests).toFixed(2)
    : "0.00";
  
  return (
    <Card className="glass overflow-hidden border-border/30">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Zap size={18} className="opacity-70" />
          Name Discovery Dashboard v2
        </CardTitle>
        <CardDescription>
          Enhanced algorithm to extract all possible names with fewer API requests
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass p-4 rounded-lg flex flex-col">
              <div className="text-sm text-muted-foreground">Discovered Names</div>
              <div className="text-2xl font-mono font-semibold mt-1">{stats.uniqueNames.length}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.successfulRequests > 0 
                  ? `${efficiencyRatio} names per request` 
                  : "No requests yet"}
              </div>
            </div>
            
            <div className="glass p-4 rounded-lg flex flex-col">
              <div className="text-sm text-muted-foreground">Successful Requests</div>
              <div className="text-2xl font-mono font-semibold mt-1">{stats.successfulRequests}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.totalRequests > 0 
                  ? `${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)}% success rate` 
                  : "No requests yet"}
              </div>
            </div>
            
            <div className="glass p-4 rounded-lg flex flex-col">
              <div className="text-sm text-muted-foreground">Skipped Prefixes</div>
              <div className="text-2xl font-mono font-semibold mt-1">{stats.skippedPrefixes.length}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Intelligent pruning saved {stats.skippedPrefixes.length} requests
              </div>
            </div>
          </div>
          
          <div className="glass p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Discovery Progress</span>
              <span className="text-xs font-mono">{Math.round(stats.progress)}%</span>
            </div>
            <Progress value={stats.progress} className="h-2" />
            
            {stats.currentPrefixes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {stats.currentPrefixes.slice(0, 5).map((prefix, i) => (
                  <Badge key={i} variant="outline" className="animate-pulse">
                    <RefreshCw size={12} className="mr-1 animate-spin-slow" />
                    {prefix}
                  </Badge>
                ))}
                {stats.currentPrefixes.length > 5 && (
                  <Badge variant="outline">+{stats.currentPrefixes.length - 5} more</Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="glass p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Discovery Stats</div>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div>Total Requests:</div>
              <div className="font-mono text-right">{stats.totalRequests}</div>
              
              <div>Failed Requests:</div>
              <div className="font-mono text-right">{stats.failedRequests}</div>
              
              <div>Rate Limited:</div>
              <div className="font-mono text-right">{stats.rateLimited}</div>
              
              <div>Elapsed Time:</div>
              <div className="font-mono text-right">{getElapsedTime()}</div>
              
              <div>Names per Request:</div>
              <div className="font-mono text-right">{efficiencyRatio}</div>
              
              <div>Explored Prefixes:</div>
              <div className="font-mono text-right">{stats.exploredPrefixes.length}</div>
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
                variant={strategy === 'v1' ? 'default' : 'outline'} 
                onClick={() => updateStrategy('v1')}
                disabled={stats.isRunning}
                className="flex-1"
              >
                Standard v1
              </Button>
              <Button 
                variant={strategy === 'v2' ? 'default' : 'outline'} 
                onClick={() => updateStrategy('v2')}
                disabled={stats.isRunning}
                className="flex-1"
              >
                Enhanced v2
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {strategy === 'v1' ? (
                <div className="flex items-start gap-2">
                  <ChevronRight size={16} className="mt-0.5 flex-shrink-0" />
                  <div>Standard approach that explores all possible prefixes systematically. Good for complete coverage.</div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <ChevronRight size={16} className="mt-0.5 flex-shrink-0" />
                  <div>Enhanced algorithm that learns patterns, prioritizes promising prefixes, and skips unlikely paths.</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="glass p-4 rounded-lg space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Delay between requests:</span>
                <span className="text-sm font-mono">{searchDelay}ms</span>
              </div>
              <Slider
                value={[searchDelay]}
                min={100}
                max={2000}
                step={100}
                onValueChange={values => updateSearchDelay(values[0])}
                disabled={stats.isRunning}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Faster (may hit rate limits)</span>
                <span>Slower (more reliable)</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Concurrent requests:</span>
                <span className="text-sm font-mono">{maxConcurrentRequests}</span>
              </div>
              <Slider
                value={[maxConcurrentRequests]}
                min={1}
                max={5}
                step={1}
                onValueChange={values => updateMaxConcurrentRequests(values[0])}
                disabled={stats.isRunning}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>
          </div>
          
          <div className="glass p-4 rounded-lg space-y-3">
            <div className="text-sm font-medium">V2 Algorithm Improvements</div>
            <div className="space-y-1 text-sm">
              <div className="flex items-start gap-2">
                <ChevronRight size={16} className="mt-0.5 flex-shrink-0" />
                <div>Pattern recognition to prioritize promising prefixes</div>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight size={16} className="mt-0.5 flex-shrink-0" />
                <div>Intelligent path pruning to skip unlikely name patterns</div>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight size={16} className="mt-0.5 flex-shrink-0" />
                <div>Parallel requests with adaptive throttling</div>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight size={16} className="mt-0.5 flex-shrink-0" />
                <div>Result caching to avoid duplicate API calls</div>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight size={16} className="mt-0.5 flex-shrink-0" />
                <div>Common prefix extraction from discovered names</div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          <div className="px-4 pt-2 pb-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Discovered Names</h3>
                <Badge variant="outline" className="font-mono">
                  {filteredNames.length}
                </Badge>
              </div>
              
              {stats.uniqueNames.length > 0 && (
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                  <Database size={14} />
                  Export
                </Button>
              )}
            </div>
            
            <div>
              <Input
                placeholder="Filter names..."
                value={nameFilter}
                onChange={e => setNameFilter(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          <Separator className="opacity-30" />
          
          <ScrollArea className="h-[250px] px-4">
            {filteredNames.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filteredNames.map((name, index) => (
                  <div key={index} className="glass p-2 rounded-md font-mono text-sm truncate">
                    {name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="text-muted-foreground mb-2">
                  {stats.uniqueNames.length > 0 
                    ? "No names match your filter" 
                    : "No names discovered yet"}
                </div>
                <div className="text-sm">
                  {stats.uniqueNames.length > 0 
                    ? "Try adjusting your filter" 
                    : "Start the discovery process to begin extracting names from the API"}
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

export default DiscoveryDashboardV2;
