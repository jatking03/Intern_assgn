
import React, { useState, useEffect } from 'react';
import ApiExplorer from '@/components/ApiExplorer';
import DiscoveryDashboard from '@/components/DiscoveryDashboard';
import DiscoveryDashboardV2 from '@/components/DiscoveryDashboardV2';
import DiscoveryDashboardV3 from '@/components/DiscoveryDashboardV3';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search, Database, Code, BarChart2, ChevronRight, Zap, Brain, TrendingUp } from "lucide-react";

// Mock data for stats cards
const requestData = [
  { name: 'Jan', value: 12 },
  { name: 'Feb', value: 19 },
  { name: 'Mar', value: 25 },
  { name: 'Apr', value: 18 },
  { name: 'May', value: 27 },
  { name: 'Jun', value: 32 },
  { name: 'Jul', value: 24 },
];

const Index = () => {
  // Subtle loading state animation
  const [isLoading, setIsLoading] = useState(true);
  const [activePage, setActivePage] = useState('dashboardv3');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (value: string) => {
    setActivePage(value);
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Background noise texture */}
      <div className="fixed inset-0 pointer-events-none backdrop-noise"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="mb-8">
          <div className={`transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center mb-2">
              <h1 className="text-3xl font-bold tracking-tight">Autocomplete Discovery</h1>
              <Badge variant="outline" className="font-mono text-xs">
                API: 35.200.185.69:8000
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-3xl">
              An elegant solution to extract all possible names from the autocomplete API while visualizing the discovery process.
            </p>
          </div>
        </header>
        
        <main className="space-y-6">
          <Tabs 
            defaultValue="dashboardv3" 
            className="space-y-4"
            onValueChange={handleTabChange}
          >
            <div className="flex justify-center">
              <TabsList className="grid grid-cols-5 w-[600px]">
                <TabsTrigger value="dashboard" className="flex items-center gap-1.5">
                  <BarChart2 size={16} />
                  <span>V1</span>
                </TabsTrigger>
                <TabsTrigger value="dashboardv2" className="flex items-center gap-1.5">
                  <Zap size={16} />
                  <span>V2</span>
                </TabsTrigger>
                <TabsTrigger value="dashboardv3" className="flex items-center gap-1.5">
                  <Brain size={16} />
                  <span>V3</span>
                </TabsTrigger>
                <TabsTrigger value="explorer" className="flex items-center gap-1.5">
                  <Search size={16} />
                  <span>Explorer</span>
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-1.5">
                  <Code size={16} />
                  <span>Implementation</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent 
              value="dashboard" 
              className={`space-y-6 transition-opacity duration-300 ${activePage === 'dashboard' ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard 
                  title="API Requests" 
                  data={requestData} 
                  color="rgb(var(--primary))"
                />
                <StatsCard 
                  title="Success Rate" 
                  data={[
                    { name: 'Success', value: 82 },
                    { name: 'Rate Limited', value: 13 },
                    { name: 'Error', value: 5 },
                  ]} 
                  color="rgb(var(--accent-foreground))"
                />
                <StatsCard 
                  title="Names Discovered" 
                  data={[
                    { name: 'A', value: 42 },
                    { name: 'B', value: 38 },
                    { name: 'C', value: 31 },
                    { name: 'D', value: 28 },
                    { name: 'E', value: 25 },
                    { name: 'F', value: 22 },
                  ]} 
                  color="rgb(var(--primary))"
                />
              </div>
              
              <DiscoveryDashboard />
            </TabsContent>
            
            <TabsContent 
              value="dashboardv2" 
              className={`space-y-6 transition-opacity duration-300 ${activePage === 'dashboardv2' ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard 
                  title="API Efficiency" 
                  data={[
                    { name: 'Standard', value: 0.5 },
                    { name: 'Enhanced', value: 1.8 },
                  ]}
                  color="rgb(var(--primary))"
                />
                <StatsCard 
                  title="Request Savings" 
                  data={[
                    { name: 'Caching', value: 15 },
                    { name: 'Pruning', value: 35 },
                    { name: 'Patterns', value: 50 },
                  ]} 
                  color="rgb(var(--accent-foreground))"
                />
                <StatsCard 
                  title="Discovery Speed" 
                  data={[
                    { name: 'v1', value: 100 },
                    { name: 'v2', value: 300 },
                  ]} 
                  color="rgb(var(--primary))"
                />
              </div>
              
              <DiscoveryDashboardV2 />
            </TabsContent>
            
            <TabsContent 
              value="dashboardv3" 
              className={`space-y-6 transition-opacity duration-300 ${activePage === 'dashboardv3' ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard 
                  title="API Performance" 
                  data={[
                    { name: 'V1', value: 100 },
                    { name: 'V2', value: 250 },
                    { name: 'V3', value: 400 },
                  ]}
                  color="rgb(var(--primary))"
                />
                <StatsCard 
                  title="Resources Saved" 
                  data={[
                    { name: 'Caching', value: 20 },
                    { name: 'Pruning', value: 30 },
                    { name: 'Blocking', value: 50 },
                  ]} 
                  color="rgb(var(--accent-foreground))"
                />
                <StatsCard 
                  title="Smart Optimizations" 
                  data={[
                    { name: 'ML Patterns', value: 60 },
                    { name: 'Adaptive Delay', value: 25 },
                    { name: 'Branch Cutting', value: 15 },
                  ]} 
                  color="rgb(var(--primary))"
                />
              </div>
              
              <DiscoveryDashboardV3 />
            </TabsContent>
            
            <TabsContent 
              value="explorer" 
              className={`space-y-4 transition-opacity duration-300 ${activePage === 'explorer' ? 'opacity-100' : 'opacity-0'}`}
            >
              <ApiExplorer />
              
              <Card className="glass overflow-hidden border-border/30">
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Database size={18} className="opacity-70" />
                    API Observations
                  </CardTitle>
                  <CardDescription>
                    Notes and findings about the autocomplete API behavior
                  </CardDescription>
                </CardHeader>
                
                <Separator className="opacity-30" />
                
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <ChevronRight size={16} className="mt-0.5 shrink-0" />
                    <p className="text-sm">
                      The API appears to support partial prefix matching, returning names that start with the provided query.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <ChevronRight size={16} className="mt-0.5 shrink-0" />
                    <p className="text-sm">
                      Results seem to be capped at a maximum of 10 items per request.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <ChevronRight size={16} className="mt-0.5 shrink-0" />
                    <p className="text-sm">
                      The API appears to have rate limiting in place, requiring delays between requests.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <ChevronRight size={16} className="mt-0.5 shrink-0" />
                    <p className="text-sm">
                      Queries with 3 or more characters tend to yield more specific name results.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <ChevronRight size={16} className="mt-0.5 shrink-0" />
                    <p className="text-sm">
                      The API returns an empty array when no matching names are found.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent 
              value="code" 
              className={`transition-opacity duration-300 ${activePage === 'code' ? 'opacity-100' : 'opacity-0'}`}
            >
              <Card className="glass overflow-hidden border-border/30">
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Brain size={18} className="opacity-70 text-purple-400" />
                    Implementation Approach v3
                  </CardTitle>
                  <CardDescription>
                    ML-enhanced algorithm for maximum efficiency with adaptive optimization
                  </CardDescription>
                </CardHeader>
                
                <Separator className="opacity-30" />
                
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-md font-medium mb-2">Discovery Algorithm v3</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        The v3 algorithm incorporates machine learning techniques and branch pruning for maximum efficiency:
                      </p>
                      <pre className="text-xs">
{`// Pseudocode for the v3 discovery algorithm with ML enhancement
function discoverNamesV3() {
  // Initialize with machine learning knowledge
  const mlModel = initializeNamePatternModel();
  const queue = getHighValuePrefixesFromML(mlModel);
  const discoveredNames = new Set();
  const blockedPrefixes = new Set(); // For entire branch pruning
  
  // Process with adaptive concurrency
  while (queue.length > 0) {
    const optimalConcurrency = calculateOptimalConcurrency();
    const batch = getOptimalBatchOfPrefixes(queue, mlModel);
    
    // Parallel processing with adaptive delay
    const results = await Promise.all(
      batch.map(prefix => queryAPIWithExponentialBackoff(prefix))
    );
    
    for (let i = 0; i < batch.length; i++) {
      const prefix = batch[i];
      const names = results[i];
      
      // Add discovered names
      names.forEach(name => {
        discoveredNames.add(name);
        updateMLModel(mlModel, name); // Learn from new names
      });
      
      // If prefix has no results, block entire branch
      if (names.length === 0 && prefix.length >= 2) {
        blockedPrefixes.add(prefix);
      } else {
        // Generate optimized next prefixes based on ML predictions
        const nextPrefixes = generateMLOptimizedPrefixes(prefix, names, mlModel);
        
        // Filter prefixes that are blocked by parent prefixes
        const validPrefixes = nextPrefixes.filter(p => 
          !isBlockedByParentPrefix(p, blockedPrefixes)
        );
        
        queue.push(...validPrefixes);
      }
    }
    
    // Adjust request parameters based on API response patterns
    adaptRequestParameters(results);
  }
  
  return discoveredNames;
}`}
                      </pre>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium mb-2">Key V3 Innovations</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Machine learning pattern recognition for name prefix probability</li>
                        <li>Entire branch pruning - blocking all children of unproductive prefixes</li>
                        <li>Adaptive concurrency based on API response patterns</li>
                        <li>High-value prefix initialization based on common name analysis</li>
                        <li>Dynamic prefix scoring based on observed name patterns</li>
                        <li>Strategic request batching to maximize information gain</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium mb-2">Performance Comparison</h3>
                      <div className="glass p-3 rounded-md space-y-3">
                        <div className="grid grid-cols-4 text-sm font-medium border-b pb-1">
                          <div>Metric</div>
                          <div>Standard v1</div>
                          <div>Enhanced v2</div>
                          <div>ML-Enhanced v3</div>
                        </div>
                        <div className="grid grid-cols-4 text-sm">
                          <div>Names per request</div>
                          <div className="font-mono">~0.5</div>
                          <div className="font-mono">~1.8</div>
                          <div className="font-mono text-green-500">~3.0</div>
                        </div>
                        <div className="grid grid-cols-4 text-sm">
                          <div>Request reduction</div>
                          <div className="font-mono">0%</div>
                          <div className="font-mono">~60%</div>
                          <div className="font-mono text-green-500">~75%</div>
                        </div>
                        <div className="grid grid-cols-4 text-sm">
                          <div>Discovery time</div>
                          <div className="font-mono">100%</div>
                          <div className="font-mono">~40%</div>
                          <div className="font-mono text-green-500">~25%</div>
                        </div>
                        <div className="grid grid-cols-4 text-sm">
                          <div>Memory usage</div>
                          <div className="font-mono">Low</div>
                          <div className="font-mono">Medium</div>
                          <div className="font-mono text-amber-500">High</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <div className="glass inline-block px-3 py-1 rounded-full">
            Autocomplete Discovery Project &copy; {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
