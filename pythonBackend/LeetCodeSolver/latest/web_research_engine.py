#!/usr/bin/env python3
"""
Web Research Engine using OpenRouter Sonar Models
Creates comprehensive documentation with mermaid diagrams for any research question
"""

import os
import sys
import json
import time
import asyncio
import requests
from typing import Dict, Any, Optional, List
from datetime import datetime
from dataclasses import dataclass

# Add timeout protection
import signal
from contextlib import contextmanager


class TimeoutError(Exception):
    """Custom timeout exception"""
    pass


@contextmanager
def timeout(seconds):
    """Context manager for timeout protection"""
    def signal_handler(signum, frame):
        raise TimeoutError(f"Operation timed out after {seconds} seconds")
    
    # Set the signal handler and alarm
    old_handler = signal.signal(signal.SIGALRM, signal_handler)
    signal.alarm(seconds)
    
    try:
        yield
    finally:
        signal.alarm(0)
        signal.signal(signal.SIGALRM, old_handler)


@dataclass
class ResearchRequest:
    """Data class for research requests"""
    query: str
    depth: str = "comprehensive"  # basic, comprehensive, deep
    include_diagrams: bool = True
    max_timeout: int = 300  # 5 minutes default
    category: str = "web_research"


@dataclass
class ResearchResult:
    """Data class for research results"""
    success: bool
    query: str
    content: str
    mermaid_diagrams: List[str]
    sources: List[str]
    processing_time: float
    model_used: str
    tokens_used: int
    error: Optional[str] = None


class OpenRouterClient:
    """Client for OpenRouter API with Sonar models"""
    
    SONAR_MODELS = {
        'basic': 'perplexity/sonar',  # $1/M input + $1/M output
        'comprehensive': 'perplexity/sonar-pro',  # $3/M input + $15/M output  
        'deep': 'perplexity/sonar-deep-research',  # $2/M input + $8/M output + $5/1000 searches
        'reasoning': 'perplexity/sonar-reasoning'  # $1/M input + $5/M output
    }
    
    def __init__(self):
        self.api_key = os.getenv('OPENROUTER_API_KEY')
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY environment variable not found")
        
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/your-app",  # Optional: for tracking
            "X-Title": "LeetCode Solver Research Engine"  # Optional: for tracking
        }
    
    def research_with_sonar(self, request: ResearchRequest) -> ResearchResult:
        """
        Conduct research using OpenRouter Sonar models
        
        Args:
            request: ResearchRequest object with query and parameters
            
        Returns:
            ResearchResult with comprehensive research findings
        """
        start_time = time.time()
        
        try:
            with timeout(request.max_timeout):
                # Select appropriate model
                model = self.SONAR_MODELS.get(request.depth, 'perplexity/sonar-pro')
                
                # Craft research prompt
                research_prompt = self._create_research_prompt(request)
                
                # Make API call
                payload = {
                    "model": model,
                    "messages": [
                        {
                            "role": "user", 
                            "content": research_prompt
                        }
                    ],
                    "temperature": 0.1,  # Low temperature for factual research
                    "max_tokens": 4000 if request.depth == "basic" else 8000
                }
                
                print(f"🔍 Researching with {model}...")
                response = requests.post(
                    self.base_url, 
                    headers=self.headers, 
                    json=payload,
                    timeout=request.max_timeout
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result['choices'][0]['message']['content']
                    
                    # Extract components
                    mermaid_diagrams = self._extract_mermaid_diagrams(content)
                    sources = self._extract_sources(content)
                    
                    processing_time = time.time() - start_time
                    
                    return ResearchResult(
                        success=True,
                        query=request.query,
                        content=content,
                        mermaid_diagrams=mermaid_diagrams,
                        sources=sources,
                        processing_time=processing_time,
                        model_used=model,
                        tokens_used=result.get('usage', {}).get('total_tokens', 0)
                    )
                else:
                    error_msg = f"OpenRouter API error: {response.status_code} - {response.text}"
                    print(f"❌ {error_msg}")
                    return ResearchResult(
                        success=False,
                        query=request.query,
                        content="",
                        mermaid_diagrams=[],
                        sources=[],
                        processing_time=time.time() - start_time,
                        model_used=model,
                        tokens_used=0,
                        error=error_msg
                    )
                    
        except TimeoutError as e:
            return ResearchResult(
                success=False,
                query=request.query,
                content="",
                mermaid_diagrams=[],
                sources=[],
                processing_time=time.time() - start_time,
                model_used=model,
                tokens_used=0,
                error=str(e)
            )
        except Exception as e:
            return ResearchResult(
                success=False,
                query=request.query,
                content="",
                mermaid_diagrams=[],
                sources=[],
                processing_time=time.time() - start_time,
                model_used="unknown",
                tokens_used=0,
                error=str(e)
            )
    
    def _create_research_prompt(self, request: ResearchRequest) -> str:
        """Create a comprehensive research prompt"""
        
        diagram_instructions = ""
        if request.include_diagrams:
            diagram_instructions = """
            
IMPORTANT: Include relevant Mermaid diagrams in your response to illustrate:
- System architectures 
- Process flows
- Component relationships
- Data flows
- Decision trees
- Timelines

Format Mermaid diagrams like this:
```mermaid
graph TD
    A[Component A] --> B[Component B]
    B --> C[Component C]
```

Use these Mermaid diagram types as appropriate:
- `graph` for flowcharts and system diagrams
- `sequenceDiagram` for interaction flows
- `classDiagram` for object relationships
- `gantt` for timelines and project planning
- `gitgraph` for branching strategies
- `erDiagram` for data models
"""
        
        base_prompt = f"""You are an expert research analyst tasked with providing comprehensive, well-structured documentation on the following topic:

RESEARCH QUERY: {request.query}

Please provide a detailed response that includes:

1. **Executive Summary** (2-3 sentences overview)

2. **Detailed Analysis** 
   - Core concepts and definitions
   - Key components and their relationships
   - Current best practices and methodologies
   - Advantages and limitations
   - Real-world applications and examples

3. **Technical Implementation** (if applicable)
   - Architecture patterns
   - Technology stack recommendations  
   - Step-by-step implementation guidance
   - Code examples or pseudocode

4. **Considerations & Trade-offs**
   - Performance implications
   - Scalability considerations
   - Security aspects
   - Cost factors
   - Maintenance requirements

5. **Recent Developments & Trends**
   - Latest innovations in this area
   - Industry adoption patterns
   - Future outlook

6. **Practical Recommendations**
   - When to use this approach
   - Getting started guide
   - Common pitfalls to avoid
   - Success metrics

{diagram_instructions}

7. **Additional Resources**
   - Key references and sources
   - Further reading recommendations
   - Relevant tools and frameworks

Please ensure your response is:
- Factually accurate and up-to-date
- Well-structured with clear headings
- Comprehensive yet accessible
- Includes specific examples and use cases
- Properly cited with sources

Research depth level: {request.depth.upper()}
"""
        
        return base_prompt
    
    def _extract_mermaid_diagrams(self, content: str) -> List[str]:
        """Extract Mermaid diagrams from the response"""
        import re
        
        # Find all mermaid code blocks
        mermaid_pattern = r'```mermaid\n(.*?)\n```'
        diagrams = re.findall(mermaid_pattern, content, re.DOTALL)
        
        # Clean up the diagrams
        cleaned_diagrams = []
        for diagram in diagrams:
            # Remove extra whitespace and normalize
            cleaned = '\n'.join(line.strip() for line in diagram.split('\n') if line.strip())
            if cleaned:
                cleaned_diagrams.append(cleaned)
        
        return cleaned_diagrams
    
    def _extract_sources(self, content: str) -> List[str]:
        """Extract source citations from the response"""
        import re
        
        sources = []
        
        # Common citation patterns
        patterns = [
            r'\[(\d+)\]\s*(.+)',  # [1] Source description
            r'Source:\s*(.+)',     # Source: description  
            r'Reference:\s*(.+)',  # Reference: description
            r'https?://[^\s\)]+',  # Direct URLs
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, content, re.MULTILINE)
            for match in matches:
                if isinstance(match, tuple):
                    sources.extend([m.strip() for m in match if m.strip()])
                else:
                    sources.append(match.strip())
        
        # Remove duplicates while preserving order
        unique_sources = []
        seen = set()
        for source in sources:
            if source not in seen and len(source) > 10:  # Filter out very short matches
                unique_sources.append(source)
                seen.add(source)
        
        return unique_sources[:10]  # Limit to top 10 sources


class WebResearchEngine:
    """Main research engine that orchestrates web research and documentation generation"""
    
    def __init__(self):
        self.client = OpenRouterClient()
        
        # Add the universal solution manager for storage
        current_dir = os.path.dirname(os.path.abspath(__file__))
        sys.path.append(current_dir)
        from universal_solution_manager import UniversalSolutionManager
        from research_prompts import ResearchPromptsLibrary
        self.storage_manager = UniversalSolutionManager()
        self.prompts_library = ResearchPromptsLibrary()
    
    def research_and_document(self, 
                            query: str, 
                            depth: str = "comprehensive",
                            include_diagrams: bool = True,
                            store_result: bool = True,
                            max_timeout: int = 300,
                            prompt_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Conduct comprehensive research and generate documentation
        
        Args:
            query: Research question or topic
            depth: Research depth (basic, comprehensive, deep)
            include_diagrams: Whether to include Mermaid diagrams
            store_result: Whether to store the result
            max_timeout: Maximum timeout in seconds
            
        Returns:
            Dictionary with research results and metadata
        """
        print(f"🚀 Starting research: {query}")
        print(f"📊 Depth: {depth}, Diagrams: {include_diagrams}")
        
        # Select and use custom prompt if specified
        if prompt_name:
            print(f"🎯 Using custom prompt: {prompt_name}")
            custom_prompt = self.prompts_library.format_prompt(prompt_name, query)
            selected_template = self.prompts_library.get_prompt_by_name(prompt_name)
        else:
            print(f"🔍 Auto-selecting best prompt for query...")
            custom_prompt, selected_template = self._auto_select_prompt(query)
            print(f"✅ Selected: {selected_template.name} ({selected_template.category})")
        
        # Create research request
        request = ResearchRequest(
            query=custom_prompt,  # Use the formatted custom prompt
            depth=depth,
            include_diagrams=include_diagrams,
            max_timeout=max_timeout,
            category=selected_template.category
        )
        
        # Conduct research
        result = self.client.research_with_sonar(request)
        
        # Prepare response data
        response_data = {
            'success': result.success,
            'query': result.query,
            'original_query': query,  # Store the original query separately
            'research_content': result.content,
            'mermaid_diagrams': result.mermaid_diagrams,
            'sources': result.sources,
            'processing_time': result.processing_time,
            'model_used': result.model_used,
            'tokens_used': result.tokens_used,
            'depth': depth,
            'include_diagrams': include_diagrams,
            'timestamp': datetime.now().isoformat(),
            'category': selected_template.category,
            'prompt_used': {
                'name': selected_template.name,
                'category': selected_template.category,
                'description': selected_template.description,
                'custom_prompt_name': prompt_name
            }
        }
        
        if result.error:
            response_data['error'] = result.error
        
    def _auto_select_prompt(self, query: str) -> tuple[str, Any]:
        """Auto-select the best prompt template for the query"""
        selected_template = self.prompts_library.auto_select_prompt(query)
        # Find the key for this template in the prompts dictionary
        template_key = None
        for key, template in self.prompts_library.prompts.items():
            if template.name == selected_template.name:
                template_key = key
                break
        
        if not template_key:
            raise ValueError(f"Template key not found for {selected_template.name}")
            
        formatted_prompt = self.prompts_library.format_prompt(template_key, query)
        return formatted_prompt, selected_template
    
    def get_available_prompts(self) -> Dict[str, Any]:
        """Get all available prompt templates"""
        prompts = self.prompts_library.list_all_prompts()
        return {
            name: {
                'name': template.name,
                'category': template.category,
                'description': template.description,
                'expected_sections': template.expected_sections,
                'mermaid_types': template.mermaid_types
            }
            for name, template in prompts.items()
        }
    
    def get_prompt_categories(self) -> List[str]:
        """Get all available prompt categories"""
        return self.prompts_library.get_categories()

        # Store result if requested and successful
        storage_paths = None
        if store_result and result.success:
            storage_paths = self._store_research_result(query, response_data)  # Use original query for storage
            if storage_paths:
                response_data['storage'] = storage_paths
        
        return response_data
    
    def _store_research_result(self, query: str, research_data: Dict[str, Any]) -> Optional[Dict[str, str]]:
        """Store research result using the universal solution manager"""
        try:
            # Prepare solution data for storage
            solution_data = {
                'success': research_data['success'],
                'solution': research_data['research_content'],  # Store as solution
                'explanation': f"Web research on: {query}",
                'processing_time': research_data['processing_time'],
                'execution_result': {
                    'model_used': research_data['model_used'],
                    'tokens_used': research_data['tokens_used'],
                    'sources_found': len(research_data['sources']),
                    'diagrams_created': len(research_data['mermaid_diagrams'])
                }
            }
            
            # Store using the universal manager
            storage_result = self.storage_manager.store_solution(
                problem_text=query,
                solution_data=solution_data,
                category='web_research',
                input_type='text'
            )
            
            return storage_result
            
        except Exception as e:
            print(f"⚠️ Failed to store research result: {str(e)}")
            return None


def test_research_engine():
    """Test function for the research engine"""
    try:
        # Initialize engine
        engine = WebResearchEngine()
        
        # Test query
        test_query = "How to design a scalable microservices architecture for an e-commerce platform"
        
        print(f"🧪 Testing Web Research Engine")
        print(f"Query: {test_query}")
        
        # Conduct research
        result = engine.research_and_document(
            query=test_query,
            depth="comprehensive",
            include_diagrams=True,
            store_result=True,
            max_timeout=120  # 2 minutes for testing
        )
        
        # Display results
        print(f"\n✅ Research completed successfully: {result['success']}")
        print(f"⏱️ Processing time: {result['processing_time']:.2f} seconds")
        print(f"🤖 Model used: {result['model_used']}")
        print(f"🔢 Tokens used: {result['tokens_used']}")
        print(f"📊 Mermaid diagrams found: {len(result['mermaid_diagrams'])}")
        print(f"📚 Sources found: {len(result['sources'])}")
        
        if result.get('storage'):
            print(f"💾 Stored at: {result['storage']['solution_file']}")
        
        # Show first 200 characters of content
        if result['research_content']:
            preview = result['research_content'][:200] + "..." if len(result['research_content']) > 200 else result['research_content']
            print(f"\n📄 Content preview:\n{preview}")
        
        # Show diagrams if any
        if result['mermaid_diagrams']:
            print(f"\n🎨 First diagram:")
            print(result['mermaid_diagrams'][0][:200] + "..." if len(result['mermaid_diagrams'][0]) > 200 else result['mermaid_diagrams'][0])
        
        return result
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return None


if __name__ == "__main__":
    # Run test if executed directly
    test_research_engine()