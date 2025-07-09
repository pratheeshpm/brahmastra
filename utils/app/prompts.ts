import { Prompt } from '@/types/prompt';

export const updatePrompt = (updatedPrompt: Prompt, allPrompts: Prompt[]) => {
  const updatedPrompts = allPrompts.map((c) => {
    if (c.id === updatedPrompt.id) {
      return updatedPrompt;
    }

    return c;
  });

  savePrompts(updatedPrompts);

  return {
    single: updatedPrompt,
    all: updatedPrompts,
  };
};

export const savePrompts = (prompts: Prompt[]) => {
  localStorage.setItem('prompts', JSON.stringify(prompts));
};

export const SUMMARIZATION_PROMPT = `You are an expert at analyzing and summarizing YouTube video transcripts. Your task is to analyze this YouTube transcript and create a comprehensive summary following these rules:

## Description Filtering Rules:
**IMPORTANT**: From the video description, ONLY include:
- Links to technical resources (GitHub repos, documentation, tools, diagrams, whitepapers,excalidraw,etc)
- References to books, courses, or educational content mentioned in the video
- Links to related technical videos or tutorials
- Architecture diagrams, flowcharts, or visual aids

**EXCLUDE from description**:
- Promotional content, sponsor links, affiliate links
- Social media links (Twitter, Instagram, etc.) unless specifically technical
- Merchandise or course sales links
- Timing/chapter markers (00:00, 05:30, etc.)
- Generic promotional text
- Subscribe/like requests

## Technical Detail Requirements:

### For LeetCode/Coding Problems:
- **Problem statement** with constraints and examples
- **Problem analysis** including pattern recognition and approach selection
- **Multiple solution approaches** if discussed (brute force → optimized)
- **Complete code implementation** with detailed line-by-line explanation
- **Algorithm walkthrough** with step-by-step execution on examples
- **Time and space complexity analysis** with mathematical reasoning
- **Edge cases and corner cases** handling
- **Alternative approaches** and trade-offs discussed
- **Debugging tips** and common mistakes to avoid
- **Related problems** and pattern variations mentioned

### For Algorithms & Data Structures:
**CRITICAL: Provide COMPREHENSIVE detail. Do not summarize - expand every concept with full explanations.**

- **Algorithm Overview**: Complete description of what the algorithm does, its purpose, and when to use it
- **Detailed Step-by-Step Breakdown**: 
  * Every phase of the algorithm explained in detail
  * Why each step is necessary
  * How each step contributes to the overall solution
- **Complete Implementation Details**: 
  * Data structures used and why they were chosen
  * Helper functions or methods required
  * Memory layout and data organization
- **Full Code Walkthrough**: If code is provided, explain every line, every variable, every condition
- **Mathematical Analysis**: 
  * Detailed time complexity derivation with mathematical proof
  * Space complexity analysis with memory usage breakdown
  * Best, average, and worst-case scenarios with examples
- **Comprehensive Examples**: 
  * Multiple input/output examples with complete step-by-step execution
  * Trace through the algorithm showing state at each step
  * Visual representation if described in the video
  * Edge Cases & Constraints: 
  * All possible edge cases and how they're handled
  * Input constraints and validation
  * Boundary conditions and special cases
- **Optimization Techniques**: 
  * All optimization strategies discussed
  * Trade-offs between time and space
  * Alternative approaches and their pros/cons
- **Related Concepts**: Add relevant information about related algorithms, data structures, or techniques that would help understand the topic better

### For System Design (HLD/LLD):
**CRITICAL: Provide EXHAUSTIVE detail for every component. Expand on each point with comprehensive explanations.**

- **Problem definition**: Complete problem statement, functional/non-functional requirements, constraints, scale requirements (users, data, requests/sec)
- **High-Level Architecture**: Detailed explanation of each service, how they communicate, protocols used, why each component is needed
- **Low-Level Design**: 
  * **Database Design**: Complete schema with all tables, columns, data types, relationships, indexes, partitioning strategies
  * **API Design**: All endpoints with complete request/response schemas, error codes, authentication methods
  * **Class/Module Design**: If discussed, include all classes, methods, interfaces, design patterns used
- **Data Flow**: Step-by-step detailed walkthrough of how data moves through the system for each major operation
- **Scalability Deep Dive**: 
  * Specific bottlenecks and how to address them
  * Horizontal vs vertical scaling strategies
  * Load balancing algorithms and configurations
  * Database sharding/partitioning strategies with examples
  * Caching at multiple levels (browser, CDN, application, database) with specific TTL and invalidation strategies
- **Technology Choices**: Detailed explanation of why specific technologies were chosen, alternatives considered, trade-offs
- **Security Architecture**: Authentication flows, authorization mechanisms, data encryption, network security, input validation
- **Monitoring & Observability**: Metrics to track, alerting strategies, logging formats, distributed tracing
- **Failure Scenarios**: Detailed failure modes, recovery mechanisms, disaster recovery, backup strategies
- **Performance Optimization**: Specific optimization techniques, performance benchmarks, latency requirements

### For Programming Tutorials/Implementation:
- **Complete code implementation** with full source code if provided
- **Step-by-step coding process** with explanation of each section
- **Configuration and setup** instructions
- **Code structure and architecture** explanation
- **Best practices** and coding patterns used
- **Troubleshooting steps** and common pitfalls
- **Testing approaches** and debugging techniques
- **Performance considerations** and optimization tips

## Structure Requirements:
1. **Filtered Video Resources** (only relevant technical links)
2. **Video Overview** (identify video type: LeetCode/System Design/Tutorial/etc., main topic, target audience)
3. **Detailed Technical Content** (adapt structure based on video type):
   - **LeetCode**: Problem → Analysis → Solutions → Code → Complexity → Edge Cases
   - **System Design**: Problem → Requirements → Architecture → Components → Scalability
   - **Tutorials**: Overview → Implementation → Code Examples → Best Practices
   - **Algorithms**: Concept → Implementation → Examples → Complexity → Applications
4. **Key Takeaways** (actionable insights and important points)

**CRITICAL INSTRUCTIONS**: 
- **Identify the video type first** and adapt the detailed content structure accordingly
- **For coding problems**: Include complete code implementations with line-by-line explanations
- **For system design**: Focus on architecture, data flow, and scalability considerations  
- **For tutorials**: Emphasize step-by-step implementation and practical examples

**MAXIMUM DETAIL REQUIREMENT**:
- **DO NOT SUMMARIZE** - Expand every concept into comprehensive explanations
- **Write 3-5 paragraphs minimum** for each major technical concept discussed
- **Include ALL technical details** mentioned in the video, no matter how small
- **Add relevant context** and background information that would help understand the topic
- **Explain WHY** behind every design decision, algorithm choice, or implementation detail
- **Provide complete examples** with full walkthroughs for every concept
- **If the video mentions specific numbers, metrics, or benchmarks** - include them all with context
- **For any abbreviation or technical term** - provide full explanation of what it means
- **Think of this as creating a comprehensive technical document** that someone could use to fully understand and implement the concepts without watching the video

**LENGTH EXPECTATION**: Each major section should be detailed enough to serve as a standalone technical reference. Aim for comprehensive coverage rather than brevity.`;

export const SHORT_SUMMARIZATION_PROMPT = `# YouTube Video Analysis Prompt

Analyze this YouTube transcript and create a comprehensive technical summary. **CRITICAL**: Provide EXHAUSTIVE detail - expand every concept with full explanations, complete code implementations, and step-by-step walkthroughs.

**For System Design**: Include complete HLD/LLD with detailed architecture diagrams, database schemas, API designs, data flow analysis, scalability strategies, and failure handling mechanisms.

**For Algorithms**: Provide full implementation details, mathematical complexity analysis, multiple examples with complete execution traces, edge cases, and optimization techniques.

**For Coding Problems**: Include problem analysis, multiple solution approaches, complete code with line-by-line explanations, complexity analysis, and debugging strategies.

**Structure**: 1) Filtered Resources (technical links only), 2) Video Overview, 3) Detailed Technical Content (adapted to video type), 4) Key Takeaways.

**Requirements**: Write 9-15 paragraphs minimum per major concept. Include ALL technical details, metrics, and design decisions. highlight the imp keywords, 
Add relevant context and explain WHY behind every choice.
 Create comprehensive technical documentation that serves as a standalone reference without needing the video transcript.`;
