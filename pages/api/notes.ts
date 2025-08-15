import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Note {
  id: string;
  topic: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  keywords?: string[];
  isSystemDesign?: boolean;
  designType?: 'backend' | 'frontend';
  folderName?: string;
}

const notesDirectory = path.join(process.cwd(), 'notes');
const backendSystemDesignDirectory = path.join(process.cwd(), 'backend-system-design');
const frontendSystemDesignDirectory = path.join(process.cwd(), 'frontend-system-design');
const javascriptFrontendDirectory = path.join(process.cwd(), 'companies', 'microsoft', 'javascript-frontend');

// Ensure notes directory exists
if (!fs.existsSync(notesDirectory)) {
  fs.mkdirSync(notesDirectory, { recursive: true });
}

// Function to load system design notes
function loadSystemDesignNotes(): Note[] {
  const systemDesignNotes: Note[] = [];

  // Load backend system design notes
  if (fs.existsSync(backendSystemDesignDirectory)) {
    const backendFolders = fs.readdirSync(backendSystemDesignDirectory);
    
    for (const folder of backendFolders) {
      const folderPath = path.join(backendSystemDesignDirectory, folder);
      const readmePath = path.join(folderPath, 'README.md');
      
      if (fs.existsSync(readmePath) && fs.statSync(folderPath).isDirectory()) {
        try {
          const content = fs.readFileSync(readmePath, 'utf8');
          const stats = fs.statSync(readmePath);
          
          // Generate a readable topic from folder name
          const topic = folder.replace(/^\d+-/, '').replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          
          const note: Note = {
            id: `backend-${folder}`,
            topic: `Backend: ${topic}`,
            content,
            createdAt: stats.birthtime.toISOString(),
            updatedAt: stats.mtime.toISOString(),
            isSystemDesign: true,
            designType: 'backend',
            folderName: folder,
            keywords: ['system-design', 'backend', ...extractKeywordsFromContent(content, `backend-${folder}`)]
          };
          
          systemDesignNotes.push(note);
        } catch (error) {
          console.error(`Error reading backend system design file ${folder}:`, error);
        }
      }
    }
  }

  // Load frontend system design notes
  if (fs.existsSync(frontendSystemDesignDirectory)) {
    const frontendFolders = fs.readdirSync(frontendSystemDesignDirectory);
    
    for (const folder of frontendFolders) {
      const folderPath = path.join(frontendSystemDesignDirectory, folder);
      const readmePath = path.join(folderPath, 'README.md');
      
      if (fs.existsSync(readmePath) && fs.statSync(folderPath).isDirectory()) {
        try {
          const content = fs.readFileSync(readmePath, 'utf8');
          const stats = fs.statSync(readmePath);
          
          // Generate a readable topic from folder name
          const topic = folder.replace(/^\d+-/, '').replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          
          const note: Note = {
            id: `frontend-${folder}`,
            topic: `Frontend: ${topic}`,
            content,
            createdAt: stats.birthtime.toISOString(),
            updatedAt: stats.mtime.toISOString(),
            isSystemDesign: true,
            designType: 'frontend',
            folderName: folder,
            keywords: ['system-design', 'frontend', ...extractKeywordsFromContent(content, `frontend-${folder}`)]
          };
          
          systemDesignNotes.push(note);
        } catch (error) {
          console.error(`Error reading frontend system design file ${folder}:`, error);
        }
      }
    }
  }

  // Load JavaScript & Frontend interview notes
  if (fs.existsSync(javascriptFrontendDirectory)) {
    const jsFiles = fs.readdirSync(javascriptFrontendDirectory);
    
    for (const file of jsFiles) {
      const filePath = path.join(javascriptFrontendDirectory, file);
      
      // Only process .md files that aren't README.md
      if (file.endsWith('.md') && file !== 'README.md' && fs.statSync(filePath).isFile()) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const stats = fs.statSync(filePath);
          
          // Generate a readable topic from filename
          const topic = file.replace('.md', '').replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          
          const note: Note = {
            id: `js-frontend-${file.replace('.md', '')}`,
            topic: `JS/Frontend: ${topic}`,
            content,
            createdAt: stats.birthtime.toISOString(),
            updatedAt: stats.mtime.toISOString(),
            isSystemDesign: true,
            designType: 'frontend',
            folderName: file.replace('.md', ''),
            keywords: ['javascript', 'frontend', 'microsoft', 'interview', ...extractKeywordsFromContent(content, `js-frontend-${file.replace('.md', '')}`)]
          };
          
          systemDesignNotes.push(note);
        } catch (error) {
          console.error(`Error reading JavaScript frontend file ${file}:`, error);
        }
      }
    }
  }

  return systemDesignNotes;
}

// Load enhanced keywords from the generated file
let enhancedKeywords: Record<string, string[]> = {};
try {
  const keywordsPath = path.join(process.cwd(), 'system-design-keywords.json');
  if (fs.existsSync(keywordsPath)) {
    enhancedKeywords = JSON.parse(fs.readFileSync(keywordsPath, 'utf8'));
  }
} catch (error) {
  console.error('Failed to load enhanced keywords:', error);
}

// Function to extract keywords from markdown content
function extractKeywordsFromContent(content: string, noteId?: string): string[] {
  // If this is a system design note and we have enhanced keywords, use them
  if (noteId && enhancedKeywords[noteId]) {
    return enhancedKeywords[noteId];
  }
  const keywords = new Set<string>();
  const contentLower = content.toLowerCase();
  
  // Extract words from headers
  const headerMatches = content.match(/^#+\s+(.+)$/gm) || [];
  headerMatches.forEach(header => {
    const words = header.replace(/^#+\s+/, '').toLowerCase().split(/\s+/);
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w-]/g, '');
      if (cleanWord.length > 2) keywords.add(cleanWord);
    });
  });
  
  // Algorithms and Data Structures
  const algorithms = [
    'binary search', 'merge sort', 'quick sort', 'heap sort', 'dfs', 'bfs', 
    'dijkstra', 'bellman-ford', 'floyd-warshall', 'kruskal', 'prim', 'topological sort',
    'union find', 'disjoint set', 'segment tree', 'fenwick tree', 'trie', 'suffix array',
    'kmp', 'rabin-karp', 'aho-corasick', 'lru', 'lfu', 'fifo', 'lifo',
    'dynamic programming', 'greedy', 'backtracking', 'divide and conquer',
    'sliding window', 'two pointers', 'hash table', 'binary tree', 'avl tree',
    'red-black tree', 'b-tree', 'b+ tree', 'bloom filter', 'consistent hashing',
    'merkle tree', 'patricia trie', 'suffix tree', 'skip list'
  ];
  
  // System Design Patterns and Concepts
  const systemDesignTerms = [
    'load balancer', 'reverse proxy', 'cdn', 'caching', 'sharding', 'replication',
    'partitioning', 'horizontal scaling', 'vertical scaling', 'auto-scaling',
    'circuit breaker', 'bulkhead', 'timeout', 'retry', 'exponential backoff',
    'jitter', 'rate limiting', 'throttling', 'debouncing', 'batching',
    'event sourcing', 'cqrs', 'saga pattern', 'microservices', 'monolith',
    'serverless', 'event-driven', 'pub-sub', 'message queue', 'streaming',
    'eventual consistency', 'strong consistency', 'cap theorem', 'acid',
    'base', 'two-phase commit', '3pc', 'consensus', 'raft', 'paxos',
    'leader election', 'split-brain', 'quorum', 'gossip protocol'
  ];
  
  // Databases and Storage
  const databaseTerms = [
    'sql', 'nosql', 'relational', 'document', 'key-value', 'column-family',
    'graph database', 'time-series', 'in-memory', 'distributed database',
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'cassandra',
    'dynamodb', 'bigquery', 'snowflake', 'clickhouse', 'influxdb',
    'indexing', 'primary key', 'foreign key', 'normalization', 'denormalization',
    'transaction', 'isolation', 'serializable', 'read committed', 'mvcc'
  ];
  
  // Technologies and Frameworks
  const techTerms = [
    'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt.js', 'gatsby',
    'typescript', 'javascript', 'python', 'java', 'go', 'rust', 'scala',
    'node.js', 'express', 'fastapi', 'spring', 'django', 'flask',
    'graphql', 'rest', 'grpc', 'websocket', 'sse', 'long polling',
    'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'terraform',
    'kafka', 'rabbitmq', 'activemq', 'pulsar', 'nats', 'zeromq',
    'nginx', 'apache', 'cloudflare', 'fastly', 'akamai'
  ];
  
  // Security and Authentication
  const securityTerms = [
    'authentication', 'authorization', 'jwt', 'oauth', 'saml', 'ldap',
    'encryption', 'hashing', 'salt', 'bcrypt', 'scrypt', 'argon2',
    'tls', 'ssl', 'https', 'csrf', 'xss', 'sql injection', 'cors',
    'rbac', 'abac', 'zero trust', 'mfa', '2fa', 'session management'
  ];
  
  // Performance and Monitoring
  const performanceTerms = [
    'latency', 'throughput', 'qps', 'rps', 'p99', 'p95', 'p50',
    'sla', 'slo', 'sli', 'mttr', 'mtbf', 'availability', 'reliability',
    'monitoring', 'logging', 'tracing', 'metrics', 'alerting',
    'prometheus', 'grafana', 'elk stack', 'jaeger', 'zipkin',
    'apm', 'profiling', 'benchmarking', 'load testing', 'stress testing'
  ];
  
  // Combine all term lists
  const allTerms = [
    ...algorithms,
    ...systemDesignTerms, 
    ...databaseTerms,
    ...techTerms,
    ...securityTerms,
    ...performanceTerms
  ];
  
  // Check for each term in content
  allTerms.forEach(term => {
    if (contentLower.includes(term.toLowerCase())) {
      keywords.add(term);
    }
  });
  
  // Extract code block languages
  const codeBlockMatches = content.match(/```(\w+)/g) || [];
  codeBlockMatches.forEach(match => {
    const language = match.replace('```', '');
    if (language && language.length > 1) {
      keywords.add(language);
    }
  });
  
  // Extract important patterns from content
  const patterns = [
    /\b(O\([^)]+\))/g, // Big O notation
    /\b\d+\s*(GB|MB|KB|TB|PB)\b/gi, // Storage sizes
    /\b\d+\s*(TPS|QPS|RPS)\b/gi, // Performance metrics
    /\b\d+\s*ms\b/gi, // Latency
    /\b99\.9%\b/g, // Availability
  ];
  
  patterns.forEach(pattern => {
    const matches = content.match(pattern) || [];
    matches.forEach(match => {
      keywords.add(match.toLowerCase());
    });
  });
  
  return Array.from(keywords).slice(0, 20); // Increased to 20 keywords
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PUT':
        return handlePut(req, res);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Notes API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (id) {
    const idStr = Array.isArray(id) ? id[0] : id;
    
    // Check if it's a system design note or JavaScript frontend note
    if (idStr.startsWith('backend-') || idStr.startsWith('frontend-') || idStr.startsWith('js-frontend-')) {
      const systemDesignNotes = loadSystemDesignNotes();
      const note = systemDesignNotes.find(note => note.id === idStr);
      
      if (!note) {
        return res.status(404).json({ error: 'System design note or JavaScript/Frontend note not found' });
      }
      
      return res.status(200).json({ data: note });
    }
    
    // Handle regular notes
    const files = fs.readdirSync(notesDirectory).filter(file => 
      file.endsWith('.json') && file.startsWith(idStr)
    );

    if (files.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const notePath = path.join(notesDirectory, files[0]);
    const noteData = JSON.parse(fs.readFileSync(notePath, 'utf8'));
    return res.status(200).json({ data: noteData });
  } else {
    // Get all notes (both regular and system design)
    const allNotes: Note[] = [];
    
    // Load regular notes
    const files = fs.readdirSync(notesDirectory).filter(file => file.endsWith('.json'));
    for (const file of files) {
      try {
        const filePath = path.join(notesDirectory, file);
        const noteData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        allNotes.push(noteData);
      } catch (error) {
        console.error(`Error reading note file ${file}:`, error);
      }
    }
    
    // Load system design notes
    const systemDesignNotes = loadSystemDesignNotes();
    allNotes.push(...systemDesignNotes);

    // Sort by updatedAt descending
    allNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return res.status(200).json({ data: allNotes });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { topic, content, keywords = [] } = req.body;

  if (!topic || !content) {
    return res.status(400).json({ error: 'Topic and content are required' });
  }

  const id = generateId();
  const now = new Date().toISOString();

  const note: Note = {
    id,
    topic,
    content,
    createdAt: now,
    updatedAt: now,
    keywords
  };

  const noteFile = `${id}.json`;
  const notePath = path.join(notesDirectory, noteFile);

  fs.writeFileSync(notePath, JSON.stringify(note, null, 2));

  return res.status(201).json({ data: note });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { topic, content, keywords } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Note ID is required' });
  }

  const idStr = Array.isArray(id) ? id[0] : id;
  
  // Handle system design notes
  if (idStr.startsWith('backend-') || idStr.startsWith('frontend-') || idStr.startsWith('js-frontend-')) {
    let designType: 'backend' | 'frontend';
    let folderName: string;
    let filePath: string;
    
    if (idStr.startsWith('js-frontend-')) {
      designType = 'frontend';
      folderName = idStr.replace('js-frontend-', '');
      filePath = path.join(javascriptFrontendDirectory, `${folderName}.md`);
    } else {
      designType = idStr.startsWith('backend-') ? 'backend' : 'frontend';
      folderName = idStr.replace(`${designType}-`, '');
      
      const systemDesignDir = designType === 'backend' 
        ? backendSystemDesignDirectory 
        : frontendSystemDesignDirectory;
      
      filePath = path.join(systemDesignDir, folderName, 'README.md');
    }
    
    const readmePath = filePath;
    
    if (!fs.existsSync(readmePath)) {
      return res.status(404).json({ error: 'System design note not found' });
    }
    
    try {
      // Update the README.md file
      if (content) {
        fs.writeFileSync(readmePath, content, 'utf8');
      }
      
      // Return updated note data
      const stats = fs.statSync(readmePath);
      const updatedContent = fs.readFileSync(readmePath, 'utf8');
      
      const readableTopic = folderName.replace(/^\d+-/, '').replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      let topicPrefix: string;
      let defaultKeywords: string[];
      
      if (idStr.startsWith('js-frontend-')) {
        topicPrefix = 'JS/Frontend';
        defaultKeywords = ['javascript', 'frontend', 'microsoft', 'interview'];
      } else {
        topicPrefix = designType === 'backend' ? 'Backend' : 'Frontend';
        defaultKeywords = ['system-design', designType];
      }
      
      const updatedNote: Note = {
        id: idStr,
        topic: topic || `${topicPrefix}: ${readableTopic}`,
        content: updatedContent,
        createdAt: stats.birthtime.toISOString(),
        updatedAt: new Date().toISOString(),
        isSystemDesign: true,
        designType,
        folderName,
        keywords: keywords || [...defaultKeywords, ...extractKeywordsFromContent(updatedContent)]
      };
      
      return res.status(200).json({ data: updatedNote });
    } catch (error) {
      console.error('Error updating system design note:', error);
      return res.status(500).json({ error: 'Failed to update system design note' });
    }
  }
  
  // Handle regular notes
  const files = fs.readdirSync(notesDirectory).filter(file => 
    file.endsWith('.json') && file.startsWith(idStr)
  );

  if (files.length === 0) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const notePath = path.join(notesDirectory, files[0]);

  const existingNote = JSON.parse(fs.readFileSync(notePath, 'utf8'));

  const updatedNote: Note = {
    ...existingNote,
    ...(topic && { topic }),
    ...(content && { content }),
    ...(keywords && { keywords }),
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(notePath, JSON.stringify(updatedNote, null, 2));

  return res.status(200).json({ data: updatedNote });
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Note ID is required' });
  }

  const idStr = Array.isArray(id) ? id[0] : id;
  
  // Prevent deleting system design notes and JavaScript frontend notes (only regular notes can be deleted)
  if (idStr.startsWith('backend-') || idStr.startsWith('frontend-') || idStr.startsWith('js-frontend-')) {
    return res.status(403).json({ error: 'System design notes and JavaScript/Frontend notes cannot be deleted' });
  }
  
  const files = fs.readdirSync(notesDirectory).filter(file => 
    file.endsWith('.json') && file.startsWith(idStr)
  );

  if (files.length === 0) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const notePath = path.join(notesDirectory, files[0]);

  fs.unlinkSync(notePath);

  return res.status(200).json({ message: 'Note deleted successfully' });
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
} 