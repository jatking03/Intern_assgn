
# API Discovery Explorer

## Project Overview

This project is an API exploration tool designed to discover and analyze endpoints using various intelligent search strategies. It features three progressively more sophisticated algorithms (V1, V2, and V3) for efficient API discovery while handling rate limiting and other challenges.

## Discovered Endpoints

### Core API Endpoint

- **Autocomplete API**: `http://35.200.185.69:8000/v1/autocomplete`
  - **Query Parameters**: `query` - The prefix to search for names
  - **Response Format**: JSON with `results` array containing matching names
  - **Example**: `http://35.200.185.69:8000/v1/autocomplete?query=j` might return names like "jack", "james", "john"

## Discovery Approaches

### V1: Basic Discovery

Our initial approach used a simple breadth-first search:

- Started with all 26 letters of the alphabet as initial prefixes
- Explored each prefix sequentially
- Generated new prefixes by appending each letter of the alphabet to successful prefixes
- **Limitations**: Inefficient with API resources, leading to many redundant or low-value requests

### V2: Intelligent Discovery

V2 improved upon V1 with these optimizations:

- **Strategic Initial Prefixes**: Instead of all 26 letters, started with high-value prefixes like 'a', 'b', 'c', 'd', 'e', 'm', 'j', 's', 't'
- **Pattern Recognition**: Tracked which prefixes yielded results and prioritized related prefixes
- **Prefix Scoring**: Implemented a scoring system to prioritize prefixes likely to yield results
- **Adaptive Concurrency**: Managed multiple concurrent requests to maximize throughput while avoiding rate limits
- **Prefix Pruning**: Skipped unlikely prefix paths based on historical results
- **Result Caching**: Prevented duplicate API calls for previously explored prefixes

### V3: ML-Enhanced Discovery

V3 represents our most advanced approach with major improvements:

- **ML-Based Pattern Recognition**: Uses machine learning techniques to identify patterns in successful prefixes
- **Aggressive Branch Pruning**: Quickly abandons unproductive search paths
- **Intelligent Concurrency Control**: Dynamically adjusts concurrency based on server response times
- **Efficiency Optimization**: Tracks names discovered per request to maximize discovery efficiency
- **Block List Management**: Identifies and avoids API paths that trigger rate limiting or blocks
- **Simulation Mode**: Falls back to generating realistic fake data when API is unreachable

## Challenges & Solutions

### Rate Limiting

**Challenge**: The API implements rate limiting that restricts the number of requests within a time period.

**Solutions**:
- **Exponential Backoff**: When rate limiting is detected, we wait for progressively longer periods before retrying
- **Concurrency Control**: Limit parallel requests to stay under rate thresholds
- **Request Delays**: Added configurable delays between requests to avoid triggering limits
- **Request Prioritization**: Focused on high-value prefixes first to maximize discoveries before hitting limits

### CORS Restrictions

**Challenge**: Cross-Origin Resource Sharing restrictions prevented direct browser access to the API.

**Solutions**:
- **Direct API Access**: Configured fetch requests with appropriate CORS mode
- **Simulation Mode**: Implemented a fallback mode that generates realistic data when the API is unreachable due to CORS

### Efficiency Optimization

**Challenge**: Discovering the maximum number of unique names with the minimum number of API requests.

**Solutions**:
- **Efficiency Metrics**: Tracked names discovered per request as a key performance indicator
- **Pattern Learning**: Analyzed result patterns to predict which prefixes would be most productive
- **Prefix Scoring**: Developed a sophisticated scoring system to prioritize high-value prefixes
- **Intelligent Exploration**: Used a combination of breadth-first and depth-first search strategies depending on context

## Performance Comparison

| Strategy | Request Efficiency | Naming Patterns | Concurrency | Rate Limit Handling |
|----------|-------------------|-----------------|-------------|---------------------|
| V1       | Basic             | None            | Fixed       | Simple retry        |
| V2       | Improved          | Manual patterns | Adaptive    | Backoff strategy    |
| V3       | Optimized         | ML-enhanced     | Dynamic     | Intelligent avoidance |

## Technical Implementation

The project uses React with TypeScript and features:
- React Query for state management
- Custom hooks for discovery service abstraction
- Real-time statistics and visualization
- Adaptive search algorithms

## Usage Instructions

1. Choose a discovery strategy (V1, V2, or V3)
2. Configure parameters like request delay and concurrency
3. Start the discovery process
4. Monitor real-time statistics on discovered names, efficiency, and progress
5. Pause, resume, or reset the process as needed

---

This project demonstrates progressive algorithm development for efficient API exploration while respecting rate limits and other constraints.
