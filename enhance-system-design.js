const fs = require('fs');
const path = require('path');

// Enhanced keyword extraction focused on algorithms and technical terms
function extractTechnicalKeywords(content) {
  const keywords = new Set();
  
  // Algorithm and data structure terms
  const algorithmTerms = [
    'dijkstra', 'bellman-ford', 'floyd-warshall', 'dfs', 'bfs', 'binary-search',
    'merge-sort', 'quick-sort', 'heap-sort', 'radix-sort', 'counting-sort',
    'hash-table', 'hash-map', 'binary-tree', 'b-tree', 'red-black-tree', 'avl-tree',
    'trie', 'suffix-tree', 'bloom-filter', 'skip-list', 'segment-tree', 'fenwick-tree',
    'union-find', 'disjoint-set', 'graph', 'tree', 'heap', 'stack', 'queue',
    'priority-queue', 'deque', 'linked-list', 'array', 'matrix', 'adjacency-list',
    'adjacency-matrix', 'topological-sort', 'tarjan', 'kosaraju', 'articulation-points',
    'bridges', 'shortest-path', 'minimum-spanning-tree', 'kruskal', 'prim',
    'ford-fulkerson', 'edmonds-karp', 'bipartite-matching', 'hungarian-algorithm',
    'knapsack', 'dynamic-programming', 'greedy', 'divide-conquer', 'backtracking',
    'two-pointers', 'sliding-window', 'prefix-sum', 'suffix-array'
  ];
  
  // System design and architecture terms
  const systemDesignTerms = [
    'load-balancer', 'cdn', 'api-gateway', 'microservices', 'monolith', 'service-mesh',
    'circuit-breaker', 'bulkhead', 'rate-limiting', 'throttling', 'caching', 'cache-aside',
    'write-through', 'write-behind', 'read-replica', 'master-slave', 'sharding',
    'horizontal-scaling', 'vertical-scaling', 'auto-scaling', 'eventual-consistency',
    'strong-consistency', 'cap-theorem', 'acid', 'base', 'nosql', 'sql', 'oltp', 'olap',
    'etl', 'data-warehouse', 'data-lake', 'stream-processing', 'batch-processing',
    'message-queue', 'pub-sub', 'event-driven', 'saga-pattern', 'cqrs', 'event-sourcing',
    'consensus', 'raft', 'paxos', 'byzantine-fault-tolerance', 'gossip-protocol',
    'consistent-hashing', 'merkle-tree', 'vector-clocks', 'lamport-timestamps'
  ];
  
  // Database and storage terms
  const databaseTerms = [
    'indexing', 'b+tree', 'lsm-tree', 'wal', 'mvcc', 'isolation-levels', 'deadlock',
    'two-phase-commit', 'three-phase-commit', 'distributed-transaction', 'xa-transaction',
    'optimistic-locking', 'pessimistic-locking', 'phantom-read', 'dirty-read',
    'non-repeatable-read', 'serializable', 'read-committed', 'read-uncommitted',
    'repeatable-read', 'row-level-locking', 'table-level-locking', 'page-level-locking'
  ];
  
  // Network and protocol terms
  const networkTerms = [
    'tcp', 'udp', 'http', 'https', 'http/2', 'http/3', 'quic', 'websocket', 'grpc',
    'rest', 'graphql', 'soap', 'rpc', 'json-rpc', 'protobuf', 'avro', 'thrift',
    'dns', 'dhcp', 'nat', 'vpn', 'ssl', 'tls', 'oauth', 'jwt', 'saml', 'openid',
    'cors', 'csrf', 'xss', 'sql-injection', 'ddos', 'firewall', 'proxy', 'reverse-proxy'
  ];
  
  // Performance and optimization terms
  const performanceTerms = [
    'lazy-loading', 'eager-loading', 'prefetching', 'memoization', 'compression',
    'minification', 'bundling', 'tree-shaking', 'code-splitting', 'virtualization',
    'pagination', 'infinite-scroll', 'debouncing', 'throttling', 'batching',
    'connection-pooling', 'thread-pooling', 'memory-pool', 'object-pool'
  ];
  
  // All terms combined
  const allTerms = [
    ...algorithmTerms,
    ...systemDesignTerms,
    ...databaseTerms,
    ...networkTerms,
    ...performanceTerms
  ];
  
  // Convert content to lowercase for matching
  const lowerContent = content.toLowerCase();
  
  // Extract terms that appear in content
  for (const term of allTerms) {
    if (lowerContent.includes(term.replace('-', '')) || 
        lowerContent.includes(term.replace('-', ' ')) ||
        lowerContent.includes(term)) {
      keywords.add(term);
    }
  }
  
  // Extract words from headers and bold text
  const headerMatches = content.match(/^#+\s+(.+)$/gm) || [];
  const boldMatches = content.match(/\*\*([^*]+)\*\*/g) || [];
  
  [...headerMatches, ...boldMatches].forEach(match => {
    const words = match.replace(/^#+\s+|\*\*/g, '').toLowerCase().split(/\s+/);
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z0-9-]/g, '');
      if (cleanWord.length > 3 && allTerms.includes(cleanWord)) {
        keywords.add(cleanWord);
      }
    });
  });
  
  // Extract technology names (common patterns)
  const techPatterns = [
    /\b(redis|mongodb|postgresql|mysql|cassandra|elasticsearch|kafka|rabbitmq)\b/gi,
    /\b(react|vue|angular|nodejs|express|django|flask|spring|laravel)\b/gi,
    /\b(docker|kubernetes|terraform|ansible|jenkins|github|gitlab)\b/gi,
    /\b(aws|azure|gcp|heroku|vercel|netlify)\b/gi,
    /\b(nginx|apache|haproxy|cloudflare|fastly)\b/gi
  ];
  
  techPatterns.forEach(pattern => {
    const matches = content.match(pattern) || [];
    matches.forEach(match => keywords.add(match.toLowerCase()));
  });
  
  return Array.from(keywords).sort();
}

// Generate table of contents from markdown content
function generateTableOfContents(content) {
  const headers = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const title = match[2];
      const anchor = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      headers.push({ level, title, anchor });
    }
  }
  
  // Generate TOC markdown
  let toc = '## 📋 Table of Contents\n\n';
  headers.forEach(header => {
    const indent = '  '.repeat(header.level - 1);
    toc += `${indent}- [${header.title}](#${header.anchor})\n`;
  });
  
  return { toc, headers };
}

// Add navigation links to content
function addNavigationLinks(content) {
  const lines = content.split('\n');
  const result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    result.push(line);
    
    // Add "Back to Top" link after each major section
    if (line.match(/^#{2,6}\s+/) && !line.includes('Table of Contents')) {
      // Look ahead to find the next non-empty line to add spacing
      let nextNonEmptyIndex = i + 1;
      while (nextNonEmptyIndex < lines.length && !lines[nextNonEmptyIndex].trim()) {
        nextNonEmptyIndex++;
      }
      
      if (nextNonEmptyIndex < lines.length) {
        result.push('');
        result.push('[⬆️ Back to Top](#-table-of-contents)');
        result.push('');
        result.push('---');
        result.push('');
      }
    }
  }
  
  return result.join('\n');
}

// Process a single README file
function processReadmeFile(filePath, designType) {
  console.log(`Processing: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Extract keywords first
    const keywords = extractTechnicalKeywords(content);
    console.log(`  Keywords found: ${keywords.join(', ')}`);
    
    // Check if TOC already exists
    if (content.includes('## 📋 Table of Contents')) {
      console.log('  TOC already exists, skipping...');
      return { keywords };
    }
    
    // Generate TOC
    const { toc } = generateTableOfContents(content);
    
    // Add TOC after the main title
    const lines = content.split('\n');
    let titleIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^#\s+/)) {
        titleIndex = i;
        break;
      }
    }
    
    if (titleIndex === -1) {
      console.log('  No main title found, skipping...');
      return { keywords };
    }
    
    // Insert TOC after title and any existing description
    let insertIndex = titleIndex + 1;
    while (insertIndex < lines.length && 
           (lines[insertIndex].trim() === '' || 
            !lines[insertIndex].match(/^#{2,6}\s+/))) {
      insertIndex++;
    }
    
    lines.splice(insertIndex, 0, '', toc, '---', '');
    
    // Add navigation links
    const newContent = addNavigationLinks(lines.join('\n'));
    
    // Write back to file
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('  ✅ Enhanced with TOC and navigation links');
    
    return { keywords };
    
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
    return { keywords: [] };
  }
}

// Main function to process all system design files
function enhanceSystemDesignFiles() {
  const backendDir = path.join(__dirname, 'backend-system-design');
  const frontendDir = path.join(__dirname, 'frontend-system-design');
  
  const allKeywords = {};
  
  // Process backend files
  console.log('\n🔧 Processing Backend System Design Files...\n');
  if (fs.existsSync(backendDir)) {
    const backendFolders = fs.readdirSync(backendDir);
    backendFolders.forEach(folder => {
      const readmePath = path.join(backendDir, folder, 'README.md');
      if (fs.existsSync(readmePath)) {
        const result = processReadmeFile(readmePath, 'backend');
        allKeywords[`backend-${folder}`] = result.keywords;
      }
    });
  }
  
  // Process frontend files
  console.log('\n🎨 Processing Frontend System Design Files...\n');
  if (fs.existsSync(frontendDir)) {
    const frontendFolders = fs.readdirSync(frontendDir);
    frontendFolders.forEach(folder => {
      const readmePath = path.join(frontendDir, folder, 'README.md');
      if (fs.existsSync(readmePath)) {
        const result = processReadmeFile(readmePath, 'frontend');
        allKeywords[`frontend-${folder}`] = result.keywords;
      }
    });
  }
  
  // Save keywords summary
  const keywordsSummary = path.join(__dirname, 'system-design-keywords.json');
  fs.writeFileSync(keywordsSummary, JSON.stringify(allKeywords, null, 2));
  
  console.log('\n✅ Enhancement Complete!');
  console.log(`📊 Keywords summary saved to: ${keywordsSummary}`);
  console.log('\n📋 Summary:');
  Object.keys(allKeywords).forEach(key => {
    console.log(`  ${key}: ${allKeywords[key].length} keywords`);
  });
}

// Run the enhancement
if (require.main === module) {
  enhanceSystemDesignFiles();
}

module.exports = {
  extractTechnicalKeywords,
  generateTableOfContents,
  addNavigationLinks,
  processReadmeFile,
  enhanceSystemDesignFiles
}; 