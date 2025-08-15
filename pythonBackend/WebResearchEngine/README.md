# WebResearchEngine

Comprehensive web research engine that generates detailed documentation with Mermaid diagrams for technical questions.

## Features

### 🌐 **Web Research Capabilities**
- **OpenRouter Sonar Integration**: Uses multiple Sonar models (Pro, Deep Research, Reasoning, Basic)
- **Intelligent Model Selection**: Automatically selects the best model based on research depth
- **Comprehensive Analysis**: Generates detailed documentation with multiple sections

### 📊 **Custom Prompt System**
- **Predefined Templates**: 7 specialized prompt templates for different domains
- **Auto-Selection**: Automatically chooses the best prompt based on query content
- **Categories**: Frontend, Backend, Full-Stack, DevOps, Database, UI/UX, General Technical

### 🎨 **Mermaid Diagram Generation**
- **Algorithm Visualizations**: Flowcharts, sequence diagrams, system architectures
- **Automatic Extraction**: Parses and extracts Mermaid diagrams from AI responses
- **Multiple Types**: Support for flowcharts, ERDs, Gantt charts, git graphs, etc.

### 💾 **Universal Storage Integration**
- **Category-Based Storage**: Organizes research by category (web_research, system_design, etc.)
- **Day-Wise Organization**: Stores research in YYYY-MM-DD folders
- **Comprehensive Metadata**: Tracks all research details, processing time, models used
- **File Generation**: Creates solution.md, problem.txt, and metadata.json files

## Files

- **`web_research_engine.py`**: Main research engine with OpenRouter integration
- **`research_prompts.py`**: Custom prompt templates library with auto-selection

## Prompt Templates

### 1. Frontend System Design
- **Category**: `frontend_system_design`
- **Focus**: UI/UX architecture, component design, state management
- **Mermaid Types**: Component diagrams, data flow, state management

### 2. UI Component Design System
- **Category**: `frontend_system_design`
- **Focus**: Design systems, component hierarchies, accessibility
- **Mermaid Types**: Component hierarchy, design tokens, responsive charts

### 3. Microservices Architecture
- **Category**: `backend_system_design`
- **Focus**: Service decomposition, inter-service communication, scalability
- **Mermaid Types**: Architecture diagrams, communication patterns, deployment

### 4. Database Architecture Design
- **Category**: `backend_system_design`
- **Focus**: Schema design, data modeling, performance optimization
- **Mermaid Types**: ERDs, data flow, replication strategies

### 5. Full-Stack System Architecture
- **Category**: `fullstack_system_design`
- **Focus**: End-to-end system design across all layers
- **Mermaid Types**: Complete system diagrams, data flow, infrastructure

### 6. DevOps & Infrastructure Design
- **Category**: `devops_infrastructure`
- **Focus**: CI/CD pipelines, container orchestration, monitoring
- **Mermaid Types**: Pipeline flows, infrastructure, monitoring setups

### 7. General Technical Analysis
- **Category**: `general_technical`
- **Focus**: Comprehensive technical analysis for any topic
- **Mermaid Types**: High-level architecture, implementation flows, interactions

## Usage

```python
from WebResearchEngine.web_research_engine import WebResearchEngine

# Initialize the research engine
engine = WebResearchEngine()

# Conduct research with auto-prompt selection
result = engine.research_and_document(
    query="How to design a scalable microservices architecture?",
    depth="comprehensive",
    include_diagrams=True,
    store_result=True
)

# Use specific prompt template
result = engine.research_and_document(
    query="Database optimization strategies",
    prompt_name="database_design",
    depth="deep"
)

# Get available prompts
prompts = engine.get_available_prompts()
categories = engine.get_prompt_categories()
```

## Research Depths

- **`basic`**: Quick overview with essential information
- **`comprehensive`**: Detailed analysis with examples and best practices  
- **`deep`**: In-depth research with advanced topics and edge cases

## OpenRouter Models

The engine uses different Sonar models based on research depth:

- **Basic**: `perplexity/sonar-basic`
- **Comprehensive**: `perplexity/sonar-pro` 
- **Deep**: `perplexity/sonar-deep-research`

## Storage Structure

Research results are stored in:
```
solutions/
├── web_research/
│   └── 2025-08-01/
│       ├── HHMMSS_Title_hash_solution.md
│       ├── HHMMSS_Title_hash_problem.txt
│       └── HHMMSS_Title_hash_metadata.json
└── system_design/
    └── 2025-08-01/
        └── ...
```

## Integration

The WebResearchEngine integrates with:
- **Universal Solution Manager**: For organized storage and retrieval
- **FastAPI Server**: Via REST API endpoints
- **Custom Prompt System**: For specialized research templates

## API Endpoints

When integrated with the API server:

### GET /research/prompts
Get all available research prompt templates

```bash
curl -X GET "http://localhost:8000/research/prompts"
```

**Response:**
```json
{
  "prompts": {
    "frontend_architecture": {
      "name": "Frontend System Design Interview",
      "category": "frontend_system_design",
      "description": "Frontend system design following interview best practices",
      "expected_sections": ["Requirements Clarification", "High-Level Frontend Architecture", ...],
      "mermaid_types": ["graph", "flowchart", "sequenceDiagram"]
    }
  },
  "count": 5
}
```

### GET /research/categories
Get all available prompt categories

```bash
curl -X GET "http://localhost:8000/research/categories"
```

**Response:**
```json
{
  "categories": ["frontend_system_design", "backend_system_design", "system_design_interview"],
  "count": 3
}
```

### POST /research/query
Conduct research with automatic prompt selection

```bash
curl -X POST "http://localhost:8000/research/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How to design a scalable microservices architecture?",
    "depth": "comprehensive",
    "include_diagrams": true,
    "store_result": true,
    "max_timeout": 300
  }'
```

**Response:**
```json
{
  "success": true,
  "query": "How to design a scalable microservices architecture?",
  "research_content": "## 1. Requirements Clarification...",
  "mermaid_diagrams": ["graph TB\n  A[Client Apps] --> B[Load Balancer]..."],
  "sources": ["https://example.com/microservices-patterns"],
  "processing_time": 45.2,
  "model_used": "perplexity/sonar-pro",
  "tokens_used": 2500,
  "depth": "comprehensive",
  "include_diagrams": true,
  "timestamp": "2025-01-08T12:34:56",
  "category": "backend_system_design",
  "storage": {
    "stored": true,
    "solution_path": "solutions/web_research/2025-01-08/123456_How_to_design_scalable_microservices_abc123_solution.md",
    "problem_path": "solutions/web_research/2025-01-08/123456_How_to_design_scalable_microservices_abc123_problem.txt",
    "metadata_path": "solutions/web_research/2025-01-08/123456_How_to_design_scalable_microservices_abc123_metadata.json"
  }
}
```

### POST /research/prompt/{prompt_name}
Use a specific prompt template

```bash
curl -X POST "http://localhost:8000/research/prompt/microservices_architecture" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "E-commerce platform backend design",
    "depth": "deep",
    "include_diagrams": true,
    "store_result": false
  }'
```

### GET /examples/research-microservices
Get an example research analysis

```bash
curl -X GET "http://localhost:8000/examples/research-microservices"
```