
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Terminal, Search, CornerDownRight, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

interface ApiResponse {
  query: string;
  results: string[];
  timestamp: Date;
  status: 'success' | 'error';
  message?: string;
}

const API_URL = "http://35.200.185.69:8000/v1/autocomplete";

const ApiExplorer = () => {
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responses, setResponses] = useState<ApiResponse[]>([]);
  const [rateLimit, setRateLimit] = useState<{ limit: number; remaining: number; reset: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const responseEndRef = useRef<HTMLDivElement>(null);

  const fetchAutocomplete = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}?query=${encodeURIComponent(query)}`);
      
      // Capture rate limit headers if they exist
      const limit = response.headers.get('X-RateLimit-Limit');
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const reset = response.headers.get('X-RateLimit-Reset');
      
      if (limit && remaining && reset) {
        setRateLimit({
          limit: parseInt(limit),
          remaining: parseInt(remaining),
          reset: parseInt(reset)
        });
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const newResponse: ApiResponse = {
        query,
        results: data.results || [],
        timestamp: new Date(),
        status: 'success'
      };
      
      setResponses(prev => [...prev, newResponse]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      setError(errorMessage);
      
      const newResponse: ApiResponse = {
        query,
        results: [],
        timestamp: new Date(),
        status: 'error',
        message: errorMessage
      };
      
      setResponses(prev => [...prev, newResponse]);
    } finally {
      setIsLoading(false);
      setQuery("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAutocomplete();
  };

  // Auto-scroll to bottom when new responses arrive
  useEffect(() => {
    responseEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responses]);

  return (
    <div className="space-y-4">
      <Card className="glass overflow-hidden border-border/30">
        <CardHeader className="space-y-1 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Terminal size={18} className="opacity-70" />
              API Explorer
            </CardTitle>
            {rateLimit && (
              <div className="flex items-center">
                <Badge variant="outline" className="text-xs font-mono">
                  Rate: {rateLimit.remaining}/{rateLimit.limit}
                </Badge>
              </div>
            )}
          </div>
          <CardDescription>
            Test the autocomplete API and explore its behavior
          </CardDescription>
        </CardHeader>
        
        <Separator className="opacity-30" />
        
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter query for autocomplete..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="font-mono flex-1"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !query.trim()}
              className="flex items-center gap-1"
            >
              {isLoading ? (
                <RefreshCw size={16} className="animate-spin-slow" />
              ) : (
                <Search size={16} />
              )}
              Query
            </Button>
          </form>
          
          {error && (
            <div className="mt-3 p-3 bg-destructive/10 text-destructive rounded-md flex items-start gap-2 text-sm">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
        
        <Separator className="opacity-30" />
        
        <div className="max-h-[300px] overflow-y-auto terminal">
          {responses.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No queries yet. Start by entering a search term above.
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {responses.map((response, index) => (
                <div key={index} className="animate-fade-in">
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <CornerDownRight size={14} className="opacity-60" />
                    <span className="font-bold">{response.query}</span>
                    <span className="text-xs opacity-60 ml-auto">
                      {response.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {response.status === 'error' ? (
                    <div className="bg-destructive/10 text-destructive rounded px-3 py-2 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      {response.message}
                    </div>
                  ) : response.results.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pl-5">
                      {response.results.map((result, resultIdx) => (
                        <Badge key={resultIdx} variant="secondary" className="animate-fade-in">
                          {result}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="pl-5 text-sm text-muted-foreground">
                      No results found
                    </div>
                  )}
                  
                  {index < responses.length - 1 && (
                    <Separator className="my-2 opacity-10" />
                  )}
                </div>
              ))}
              <div ref={responseEndRef} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ApiExplorer;
