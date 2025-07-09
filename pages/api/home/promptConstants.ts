//give me js code for this with explanation in code comments
/* export const leetcodePromptOld =
  `For the below questions, give me these: 
  1. what question number leetcode question it is. 
  2. brute force approach with time complexity in one line. 
  3. Efficient algo(try avoiding dyanmic programming if possible) approach with time and space complexity in 1 line.
  4. Explain the efficient solution with an example step by step and the code for each step. 
  5. js full code of efficient solution with explanation in code comments. Question: `; */
export const leetcodePrompt = `For the given LeetCode problem for ideal 45mins -1hr interview, provide a structured breakdown:

1. Problem Identification(2-3 mins):
   - LeetCode Problem #: [Number]
   - Title: [Exact Problem Name]
   - Difficulty: Easy/Medium/Hard
   - Category/Pattern: [E.g., Two Pointers, Sliding Window, DFS/BFS, DP, etc.]
   - Key Problem Statement: [1-2 sentence summary]

2. Brute Force Approach (5-7 mins):
   - Approach Name: [E.g., "Nested Loops for All Pairs"]
   - Algorithm: One-line description of brute-force logic.
   - Time Complexity: O(?) + Reasoning (e.g., "Due to nested loops over all elements").
   - Space Complexity: O(?) + Reasoning (e.g., "No extra space used").

3. Optimal Solution(10-12 mins):
   - Optimal Technique: [E.g., "Sliding Window with Hash Map"]
   - Time Complexity: O(?) + Detailed reasoning (step-by-step breakdown).
   - Space Complexity: O(?) + Memory usage explanation.
   - Key Insight: The critical observation enabling optimization (e.g., "Sorting eliminates nested loops").

4. Step-by-Step Explanation with Example(8-10 mins):
   - Example Input: [Concrete input].
   - Walkthrough:
     1. Step 1: [Action] → [Result].
     2. Step 2: [Next action] → [Result].
     ...
   - Visualization (if helpful): Use tables/diagrams.
   - Why It Works: Brief explanation linking approach to constraints.

5. Clean JavaScript Implementation (15-25 mins):
/**
 * @param {ProblemInputType} input
 * @return {ExpectedOutputType}
 */
function solution(input) {
    // Edge case handling
    if (!input) return ...;

    // Main logic with comments per step
    let optimizedStep = ...;

    return result;
}
// Time: O(?), Space: O(?)

6. Test Cases & Edge Cases (3-5 mins):
   - Normal Case:
     Input: [Example] → Output: [Expected]
   - Edge Cases:
     1. Empty input: [] → Output: null
     2. Single element: [5] → Output: ...
   - Corner Case: [Problem-specific, e.g., "All duplicates"].
Question: `;
export const reactPrompt = 'For the below react question: 1. give short and simple functional modularized react components in js with css code with explanation in comments all in a single file. Question: ';
export const codeOutputPrompt = `For the below code, what is the expected output. Code: `
export const codeErrorPrompt = `For the below code, give the corrected code and tell me what is the error. Code: `

/* export const systemDesignPromptsOld = [
  'Assume you are giving system design interview For the below system design question, give functional and non functional requirements with what other possible questions we can ask the interviewer for more info gathering(highlight main ones). Question:',
  'give me the Requests Per Second, storage, bandwidth for a given 1 billion DAUs. with explanation. Include bandwidth and storage for the same with a back-of-envolop calc like 1Billion -> 1GB',
  'simple intro of top level HLD with detailed data flow using latest technologies',

  'Create an Entity-Relationship (ER) diagram with detailed db schema with relationships, sample apis(with data types) and major services',
  'High Level design with detailed explaination of data flow through the services',
  'Low level design of critical services involved and possible algorithms',

  'possible single point of failures and solutions for the same?',
]; */

export const systemDesignPrompts = [
  // Phase 1: Requirements & Scope (5 minutes)
  `You are starting a 1-hour system design interview in parts which i'll ask in steps. To start with:

 Phase 1: Requirements & Scope , this phase should take 5 minutes.

TIMING: Spend exactly 5 minutes on requirements gathering - keep answers concise and focused.

1. FUNCTIONAL REQUIREMENTS (2 minutes):
   - Define core features and user flows for the given system
   - Identify primary use cases with user personas
   - List optional features that could enhance the system

2. NON-FUNCTIONAL REQUIREMENTS (2 minutes):
   - Scale requirements: daily/monthly users, transactions, data volume
   - Performance requirements: latency, throughput expectations
   - Availability and consistency requirements
   - Data retention and compliance needs

3. QUICK CLARIFICATIONS (1 minute):
   - What is the expected scale and traffic patterns?
   - What are the critical performance requirements?
   - Any specific business constraints or preferences?
   - Geographic distribution and user demographics?

Keep each section brief - this is just scope setting, not detailed analysis. and the  QUESTION for SYSTEM_DESIGN is: `,

  // Phase 2: Capacity Estimation (3 minutes)
  `(Phase 2: Capacity Estimation)Continue with capacity estimation. This phase should take 3 minutes.

TIMING: Quick back-of-envelope calculations only - don't overcomplicate.

1. TRAFFIC ESTIMATION (1 minute):
   - Calculate writes per second from daily volume
   - Estimate reads per second based on read:write ratio
   - Factor in peak traffic multipliers (2-3x)

2. STORAGE ESTIMATION (1 minute):
   - Calculate total records over system lifetime
   - Estimate storage per record based on data structure
   - Account for replication and backup overhead

3. CACHE/MEMORY (1 minute):
   - Identify hot data percentage (typically 20%)
   - Calculate cache memory requirements
   - Estimate number of application servers needed

Keep numbers simple and round. Focus on orders of magnitude, not precision.`,

  // Phase 3: High-Level Design (12 minutes)
  `(Phase 3: High-Level Design) Continue with High-Level Design. This phase should take 12 minutes.
use mermaid diagram(double check syntax)) codes to explain the architecture.
TIMING: This is your main architecture discussion - allocate time wisely across components.

1. OVERALL ARCHITECTURE (3 minutes):
   - Client Layer: Define user interfaces and client types
   - CDN/Edge Layer: Global content delivery strategy
   - Load Balancing: Traffic distribution approach
   - Application Tier: Business logic and processing layer
   - Data Tier: Storage and caching strategy

2. DATABASE STRATEGY (3 minutes):
   Compare database options:
   - SQL (PostgreSQL/MySQL): ACID compliance, complex queries, structured data
   - NoSQL (DynamoDB/Cassandra): High throughput, horizontal scaling, flexible schema
   - Graph databases: Relationship-heavy data
   - Time-series databases: Time-based data patterns
   Choose based on system requirements and justify decision
   
3. CORE ALGORITHMS (3 minutes):
   Identify and compare key algorithmic approaches:
   - Present multiple viable options for core operations
   - Analyze trade-offs: performance, complexity, scalability
   - Select optimal approach based on system constraints
   - Justify the choice with concrete reasoning

4. how you can integrate AI into this design

5. SYSTEM FLOWS (3 minutes):
   - Define primary data flow through the system
   - Identify secondary flows and edge cases
   - Show component interactions and data transformations
   - Address synchronous vs asynchronous processing decisions

Focus on architectural decisions and trade-offs, not implementation details.`,

  // Phase 4: Database Design & APIs (8 minutes)
  `(Phase 4: Database Design & APIs) Continue with database design and APIs. This phase should take 8 minutes.

TIMING: Split between schema design and API specification.
use mermaid diagram(double check syntax)) codes to explain the database schema.
1. DATABASE SCHEMA (4 minutes):
   Design tables/collections based on system requirements:
   - Identify entities and their relationships
   - Define primary keys, foreign keys, and constraints
   - Choose appropriate data types for each field
   - Plan indexes for query optimization
   - Consider partitioning strategies if needed

   Schema should reflect the specific system's data model and access patterns.

2. API DESIGN (4 minutes):
   Design RESTful endpoints:
   - Define CRUD operations for main entities
   - Specify request/response formats with proper HTTP methods
   - Include authentication and authorization considerations
   - Plan for pagination, filtering, and sorting
   - Address error handling and status codes

   APIs should support the functional requirements identified earlier.

Keep schema simple - avoid over-engineering for 1-hour interview.`,

  // Phase 5: Deep Dive Algorithms (15 minutes)
  `(Phase 5: Deep Dive Algorithms) Continue with deep dive into core algorithms. This phase should take 15 minutes.

TIMING: Focus on the most critical algorithms for the given system.

1. CORE ALGORITHMS ANALYSIS (8 minutes):
   
   Identify the system's critical algorithmic challenges and compare approaches:
   use mermaid diagram(double check syntax)) codes to explain the algorithms if possible.
   For each core algorithm needed:
   • List all viable approaches (3-4 options minimum)
   • Analyze trade-offs: time complexity, space complexity, scalability
   • Consider implementation complexity and maintenance
   • Evaluate fit for system's specific requirements
   • Select optimal approach with clear justification
   
   Example analysis framework:
   - Algorithm A: Pros, cons, complexity, when to use
   - Algorithm B: Pros, cons, complexity, when to use  
   - Algorithm C: Pros, cons, complexity, when to use
   - Chosen approach: Algorithm X because [specific reasons]

2. CACHING STRATEGY (4 minutes):
   
   Compare caching approaches:
   - Write-through: Immediate consistency, higher latency
   - Write-around: Better write performance, cache misses on first read
   - Write-back: Fastest writes, risk of data loss
   - Cache-aside: Application manages cache, flexible but complex
   
   Choose strategy based on system's read/write patterns and consistency requirements

3. DISTRIBUTED COORDINATION (3 minutes):
   If system requires distributed components:
   - Consensus algorithms: Raft, Paxos, PBFT
   - Coordination services: ZooKeeper, etcd, Consul
   - Conflict resolution: Last-write-wins, vector clocks, CRDTs
4. how you can integrate AI into this design and what are the benefits of the same?
   
   Select approach based on consistency vs availability trade-offs

No code implementation - only algorithmic descriptions and trade-offs.`,

  // Phase 6: Scale & Reliability (12 minutes)
  `(Phase 6: Scale & Reliability) Continue with scaling and reliability solutions. This phase should take 12 minutes.

TIMING: Cover critical failure scenarios and solutions systematically.

1. DATABASE SCALING (4 minutes):
   
   Compare scaling approaches:
   - Vertical scaling: Increase server resources (limited scalability)
   - Read replicas: Handle read traffic (good for read-heavy systems)
   - Sharding: Partition data across servers (complex but highly scalable)
   - Caching: Reduce database load (immediate impact, easier implementation)
   - Denormalization: Trade storage for query performance
   
   Choose strategy based on system's specific read/write patterns and growth projections

2. SINGLE POINTS OF FAILURE (4 minutes):
   
   Systematically identify and address failure points:
   - Load balancer failure → Multiple LBs with health checks
   - Database failure → Master-slave replication with automatic failover
   - Cache layer failure → Distributed cache with consistent hashing
   - Application server failure → Auto-scaling groups with health monitoring
   - Network partition → Multi-region deployment with data replication
   - External service failure → Circuit breaker pattern and fallback mechanisms

3. MONITORING & RELIABILITY (4 minutes):
   
   Define key metrics and reliability patterns:
   
   Critical metrics to track:
   - Latency: p95, p99 response times for user experience
   - Throughput: Requests per second capacity planning
   - Error rates: System health and user impact
   - Resource utilization: Proactive scaling decisions
   
   Reliability patterns:
   - Circuit breaker: Prevent cascade failures
   - Retry with backoff: Handle transient failures
   - Graceful degradation: Maintain core functionality during issues
   - Rate limiting: Protect against abuse and overload

Focus on immediate, actionable solutions rather than theoretical concepts.`,

  // Phase 7: Wrap-up & Trade-offs (5 minutes)
  `(Phase 7: Wrap-up & Trade-offs) Final wrap-up and discussion. This phase should take 5 minutes.

TIMING: Summarize key decisions and discuss alternatives.

1. KEY DESIGN DECISIONS MADE (2 minutes):
   - URL Generation: Base62 encoding for simplicity
   - Database: SQL for consistency, NoSQL for scale
   - Caching: Write-around with LRU eviction
   - Redirection: 301 for SEO, 302 for analytics
   - Architecture: Microservices vs monolith trade-off

2. ALTERNATIVE APPROACHES (2 minutes):
   - Could use hash-based generation (MD5 + collision handling)
   - Could implement custom URL domains
   - Could add real-time analytics dashboard
   - Could support URL editing/deletion
   - Could implement URL categorization/tagging

3. EXTENSION OPPORTUNITIES (1 minute):
   - Analytics service: Detailed click tracking
   - Security service: Malicious URL detection
   - Premium features: Custom domains, bulk operations
   - API rate limiting: Prevent abuse
   - Mobile SDK: Native app integration

Summarize the complete solution and acknowledge any shortcuts taken due to time constraints.`
];
export const FESystemDesignPrompts = [
  'Assume you r giving frontend system design interview to Google/Facebook, give me all possible functional and few non functional requirements with what other possible questions we can ask the interviewer for more info gathering(highlight main ones). Question: ',
  'give me MVP specific Component architecture with props(dependencies graph, component tree of important ones other than basic ones like app, navbar, sidebar,footer) and FE data model with api structure  against each of the main components(with props) for the same question?',
  'which all main feature specific(suitable to the question) third party libraries(other than react/redux/axios/reactRouter/lodash/ReduxSaga/ReactHelmet/anyDevtools) can be used for this given question? Explain against each library with the features',
  
  'where all can we use feature specific performance optimizations like virtualization/debounce/throttling/optimistic updates/iframes/webWorkers/indexDb/webSockets/ServiceWorker/BrowserStorages etc?',
  'Can we use any famous known algorithms or libraries for performance and optimizations and also mention against each where we use in this design question?',
  'Pick up the top 4 important features(other than user registration/auth, can use 3rd party libs) of this design question (for MVP) and explain in depth of functionality?',

  'what all can we cache in this question? and how can we use do to improve the performance and to get these metrics better: FP, FCP, FMP, TTI, TTFB? Answer against each'
]

export const diagramPrompts = [
  "detailed requirementDiagram for frontend system design of ",
  "detailed graph  for  frontend system design of ",
  "detailed user journey  for  frontend system design of ",
  "detailed class diagram  for  frontend system design of ",
  "detailed component architecture diagram  for  frontend system design of ",
]
