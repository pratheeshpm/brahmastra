export const createKeywordsPrompt = (summary: string, maxKeywords: number = 10) => {
  return `Extract the most important keywords and key phrases from the following video summary. Focus primarily on algorithms, techniques, data structures, system design components, and major technical concepts.

PRIORITY ORDER (extract in this order):
1. Algorithms and algorithmic techniques (e.g., "binary search", "dynamic programming", "greedy algorithm")
2. Data structures (e.g., "hash table", "binary tree", "graph")
3. System design patterns and components (e.g., "load balancer", "microservices", "database sharding")
4. Technical concepts and methodologies (e.g., "API design", "caching strategy", "event-driven")
5. Programming paradigms and best practices (e.g., "object-oriented", "functional programming", "SOLID principles")
6. Other relevant technical terms and concepts

REQUIREMENTS:
- Extract exactly ${maxKeywords} keywords
- Each keyword should be no more than 3 words
- Prioritize technical terms over general concepts
- Focus on actionable/implementable concepts
- Avoid generic words like "video", "content", "discussion", "important", "system"
- Include specific algorithm names, data structure types, and design patterns mentioned

Summary:
${summary}

Please respond with a JSON object containing an array of keywords like this:
{
  "keywords": ["keyword1", "keyword2", "keyword3", ...]
}

Make sure each keyword is:
- No more than 3 words
- Technically relevant and specific
- Useful for categorization or search
- Prioritizes algorithms, techniques, and system design components as specified above`;
};

export const createKeywordExplanationPrompt = (keyword: string, context: string) => {
  return `You are an expert system design and algorithms instructor. Provide a comprehensive yet concise explanation of the following technical concept: "${keyword}"

Context (from video summary):
${context}

Please provide:
1. A clear, brief explanation of what "${keyword}" is (2-3 sentences)
2. How it relates to the context provided
3. A bullet points summary of the main concepts from the context, highlighting key technical terms in **bold**
4. A practical Mermaid diagram that illustrates the concept
5. Also if relevant, provide a code example in javascript

IMPORTANT: The Mermaid diagram must be syntactically correct and use proper Mermaid syntax. Use appropriate diagram types:
- Use "graph TD" for flowcharts and system architectures
- Use "sequenceDiagram" for process flows and interactions
- Use "classDiagram" for data structures and relationships
- Use "gitgraph" for version control or state transitions

Format your response as follows:

## ${keyword}

[Your explanation here]

### How it applies in this context:
[Context-specific explanation]

### Summary Breakdown:
[Provide 4-6 bullet points summarizing the main concepts from the context, with key technical terms in **bold**. Focus on algorithms, data structures, system design patterns, and technical concepts mentioned.]

### Diagram:
\`\`\`mermaid
[Your Mermaid diagram code here]
\`\`\`

### Code Example (if applicable):
\`\`\`javascript
[Your JavaScript code example here]
\`\`\`

Make sure the Mermaid syntax is perfect and the diagram clearly illustrates the concept. In the Summary Breakdown section, highlight important technical keywords using **bold** formatting.`;
}; 