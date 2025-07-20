# Keyword Generation for System Design Notes

## 📝 **How Keywords Are Generated**

The keywords for system design notes are **NOT randomly generated**. They are systematically extracted from the actual content of each README file using an intelligent algorithm.

---

## 🔍 **Keyword Extraction Process**

### **1. Content Analysis**
- The algorithm reads the entire content of each README file
- It analyzes headers, bold text, and technical terminology
- It scans for specific algorithm and technology patterns

### **2. Targeted Categories**

#### **🧮 Algorithms & Data Structures**
- **Algorithms**: `dijkstra`, `bellman-ford`, `binary-search`, `merge-sort`, `quick-sort`, `dfs`, `bfs`
- **Trees**: `binary-tree`, `b-tree`, `red-black-tree`, `avl-tree`, `trie`, `suffix-tree`
- **Data Structures**: `hash-table`, `bloom-filter`, `skip-list`, `segment-tree`, `union-find`
- **Techniques**: `dynamic-programming`, `greedy`, `backtracking`, `divide-conquer`, `sliding-window`

#### **🏗️ System Design Patterns**
- **Scaling**: `load-balancer`, `horizontal-scaling`, `vertical-scaling`, `auto-scaling`
- **Reliability**: `circuit-breaker`, `bulkhead`, `rate-limiting`, `throttling`
- **Architecture**: `microservices`, `monolith`, `service-mesh`, `api-gateway`
- **Messaging**: `message-queue`, `pub-sub`, `event-driven`, `streaming`
- **Consensus**: `raft`, `paxos`, `consistent-hashing`, `gossip-protocol`

#### **🗄️ Database & Storage**
- **Concepts**: `acid`, `base`, `mvcc`, `isolation-levels`, `indexing`
- **Transactions**: `two-phase-commit`, `distributed-transaction`, `optimistic-locking`
- **Types**: `sql`, `nosql`, `oltp`, `olap`, `time-series`, `in-memory`

#### **🌐 Network & Protocols**
- **Protocols**: `http`, `https`, `http/2`, `websocket`, `grpc`, `rest`, `graphql`
- **Security**: `ssl`, `tls`, `oauth`, `jwt`, `cors`, `csrf`
- **Infrastructure**: `dns`, `cdn`, `proxy`, `reverse-proxy`

#### **⚡ Performance & Optimization**
- **Techniques**: `lazy-loading`, `prefetching`, `compression`, `batching`, `debouncing`
- **Caching**: `caching`, `write-through`, `write-behind`, `cache-aside`
- **Frontend**: `code-splitting`, `tree-shaking`, `minification`, `bundling`

#### **🛠️ Technologies**
- **Databases**: `redis`, `postgresql`, `mongodb`, `elasticsearch`, `cassandra`
- **Frameworks**: `react`, `vue`, `angular`, `express`, `spring`
- **Infrastructure**: `docker`, `kubernetes`, `nginx`, `apache`, `kafka`
- **Cloud**: `aws`, `azure`, `gcp`, `cloudflare`

---

## 📊 **Storage & Usage**

### **Where Keywords Are Stored**
- **File**: `system-design-keywords.json` (root directory)
- **Format**: JSON object with note IDs as keys and keyword arrays as values
- **Loading**: Automatically loaded by the notes API at startup

### **API Integration**
- Keywords are loaded and served through `/api/notes`
- Enhanced keyword extraction is used for system design notes
- Regular notes use the existing keyword extraction method

---

## 🎯 **Example Keywords by Note**

### **Backend Chat Messaging (33 keywords)**
```json
[
  "api-gateway", "auto-scaling", "websocket", "load-balancer", 
  "redis", "message-queue", "rate-limiting", "circuit-breaker",
  "horizontal-scaling", "strong-consistency", "vector-clocks",
  "compression", "connection-pooling", "batch-processing"
]
```

### **Frontend Chat Application (47 keywords)**
```json
[
  "react", "websocket", "graphql", "jwt", "sharding", "caching",
  "consistent-hashing", "eventual-consistency", "microservices",
  "rate-limiting", "circuit-breaker", "horizontal-scaling",
  "load-balancer", "nginx", "postgresql", "redis"
]
```

---

## 🔄 **Regeneration Process**

### **How to Update Keywords**
1. Run the enhancement script: `node enhance-system-design.js`
2. Keywords are automatically extracted from current README content
3. Results are saved to `system-design-keywords.json`
4. Notes API automatically uses the updated keywords

### **When Keywords Update**
- When README content changes significantly
- When new technical terms are added to documents
- When the extraction algorithm is improved

---

## ✅ **Quality Assurance**

### **Keyword Accuracy**
- **Content-based**: Only terms that actually appear in the documents
- **Context-aware**: Considers technical relevance and frequency
- **Category-focused**: Emphasizes algorithms, patterns, and technologies
- **Verified**: Manual review of high-frequency technical terms

### **Benefits**
- **Better Search**: Find notes by specific algorithms or technologies
- **Topic Discovery**: Explore related concepts across different designs
- **Technical Focus**: Keywords emphasize important technical concepts
- **Cross-Reference**: Discover connections between different system designs

The keyword generation process ensures that each system design note has relevant, technical keywords that accurately represent its content and make it easier to search and discover related information. 