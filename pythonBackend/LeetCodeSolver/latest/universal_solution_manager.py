#!/usr/bin/env python3
"""
Universal Solution Storage Manager
Handles storage for all types of question solvers (LeetCode, JavaScript, React, System Design, etc.)
with category-based organization
"""

import os
import sys
import json
import re
import hashlib
from typing import Dict, Any, Optional, List
from datetime import datetime
from pathlib import Path


class UniversalSolutionManager:
    """Universal solution storage manager for all question types"""
    
    # Supported question categories
    CATEGORIES = {
        'leetcode': 'LeetCode Problems',
        'javascript': 'JavaScript Problems', 
        'react': 'React/Frontend Problems',
        'system_design': 'System Design Questions',
        'algorithms': 'Algorithm Problems',
        'data_structures': 'Data Structure Problems',
        'web_research': 'Web Research & Documentation',
        'interview': 'Interview Questions',
        'general': 'General Programming'
    }
    
    # File extensions for different solution types
    FILE_EXTENSIONS = {
        'leetcode': '.js',
        'javascript': '.js', 
        'react': '.html',
        'system_design': '.md',
        'algorithms': '.js',
        'data_structures': '.js',
        'web_research': '.md',
        'interview': '.md',
        'general': '.txt'
    }
    
    def __init__(self, base_path: str = None, enabled: bool = True):
        """
        Initialize the universal solution manager
        
        Args:
            base_path: Base directory for storing solutions (default: pythonBackend/solutions/)
            enabled: Whether storage is enabled
        """
        self.enabled = enabled
        
        if base_path:
            self.base_path = Path(base_path)
        else:
            # Default to pythonBackend/solutions/
            current_dir = Path(__file__).parent
            self.base_path = current_dir.parent.parent / "solutions"
        
        # Create base directory if it doesn't exist
        if self.enabled:
            self.base_path.mkdir(parents=True, exist_ok=True)
            self._create_category_directories()
    
    def _create_category_directories(self):
        """Create directories for each supported category"""
        for category in self.CATEGORIES.keys():
            category_path = self.base_path / category
            category_path.mkdir(exist_ok=True)
    
    def _sanitize_filename(self, text: str, max_length: int = 50) -> str:
        """Clean text for use in filenames"""
        # Remove or replace problematic characters
        sanitized = "".join(c if c.isalnum() or c in "._- " else "_" for c in text)
        # Replace multiple spaces/underscores with single underscore
        sanitized = "_".join(sanitized.split())
        # Truncate if too long
        return sanitized[:max_length]
    
    def _extract_problem_title(self, problem_text: str, category: str = 'general') -> str:
        """Extract a meaningful title from the problem text"""
        lines = problem_text.strip().split('\n')
        
        # Try to find a title in the first few lines
        for line in lines[:3]:
            line = line.strip()
            if line and len(line.split()) <= 10:  # Likely a title
                # Remove common prefixes
                for prefix in ['Problem:', 'Question:', 'Task:', '#', '##', '###']:
                    if line.startswith(prefix):
                        line = line[len(prefix):].strip()
                
                if line:
                    return self._sanitize_filename(line)
        
        # Fallback: use first sentence or first 50 characters
        first_sentence = problem_text.split('.')[0].strip()
        if len(first_sentence) <= 100:
            return self._sanitize_filename(first_sentence)
        
        return self._sanitize_filename(problem_text[:50])
    
    def _generate_solution_hash(self, problem_text: str, solution_content: str) -> str:
        """Generate a short hash for the solution"""
        content = f"{problem_text}{solution_content}"
        return hashlib.md5(content.encode()).hexdigest()[:8]
    
    def _get_today_folder(self, category: str) -> Path:
        """Get or create today's folder for the given category"""
        today = datetime.now().strftime("%Y-%m-%d")
        folder_path = self.base_path / category / today
        folder_path.mkdir(parents=True, exist_ok=True)
        return folder_path
    
    def _detect_category(self, problem_text: str, solution_data: Dict[str, Any]) -> str:
        """Auto-detect category based on problem text and solution"""
        problem_lower = problem_text.lower()
        
        # Check for explicit category indicators
        if any(term in problem_lower for term in ['leetcode', 'two sum', 'binary tree', 'linked list']):
            return 'leetcode'
        
        if any(term in problem_lower for term in ['react', 'component', 'jsx', 'usestate', 'useeffect']):
            return 'react'
        
        if any(term in problem_lower for term in ['system design', 'architecture', 'scalability', 'microservices']):
            return 'system_design'
        
        if any(term in problem_lower for term in ['algorithm', 'sorting', 'searching', 'complexity']):
            return 'algorithms'
        
        if any(term in problem_lower for term in ['interview', 'company', 'technical interview']):
            return 'interview'
        
        # Check solution for JavaScript/React patterns
        solution_code = solution_data.get('optimized_solution', solution_data.get('solution', ''))
        if solution_code:
            if 'function' in solution_code or 'const' in solution_code or '=>' in solution_code:
                if any(pattern in solution_code for pattern in ['React', 'jsx', 'useState', 'useEffect']):
                    return 'react'
                return 'javascript'
        
        return 'general'
    
    def store_solution(self, 
                      problem_text: str, 
                      solution_data: Dict[str, Any], 
                      category: str = None,
                      input_type: str = "text") -> Optional[Dict[str, str]]:
        """
        Store a solution with metadata in the appropriate category
        
        Args:
            problem_text: The original problem statement
            solution_data: Complete solution data from the solver
            category: Category of the problem (auto-detected if not provided)
            input_type: Type of input (text/image)
        
        Returns:
            Dictionary with file paths or None if storage disabled
        """
        if not self.enabled:
            return None
        
        try:
            # Auto-detect category if not provided
            if not category:
                category = self._detect_category(problem_text, solution_data)
            
            # Validate category
            if category not in self.CATEGORIES:
                print(f"⚠️ Unknown category '{category}', using 'general'")
                category = 'general'
            
            # Get today's folder for this category
            today_folder = self._get_today_folder(category)
            
            # Extract problem title and generate hash
            problem_title = self._extract_problem_title(problem_text, category)
            solution_hash = self._generate_solution_hash(
                problem_text, 
                solution_data.get('optimized_solution', solution_data.get('solution', ''))
            )
            
            # Generate timestamp
            timestamp = datetime.now().strftime("%H%M%S")
            
            # Create filename base
            filename_base = f"{timestamp}_{problem_title}_{solution_hash}"
            
            # Get appropriate file extension
            solution_ext = self.FILE_EXTENSIONS.get(category, '.txt')
            
            # File paths
            paths = {
                'solution_file': today_folder / f"{filename_base}_solution{solution_ext}",
                'metadata_file': today_folder / f"{filename_base}_metadata.json",
                'problem_file': today_folder / f"{filename_base}_problem.txt"
            }
            
            # Store the solution file
            solution_code = (solution_data.get('optimized_solution') or 
                           solution_data.get('solution', ''))
            
            if solution_code:
                with open(paths['solution_file'], 'w', encoding='utf-8') as f:
                    # Add header based on category
                    if category == 'system_design':
                        f.write(f"# {problem_title}\n\n")
                        f.write(f"**Generated:** {datetime.now().isoformat()}\n")
                        f.write(f"**Category:** {self.CATEGORIES[category]}\n")
                        f.write(f"**Input Type:** {input_type}\n\n")
                        f.write("---\n\n")
                    elif category in ['react', 'javascript', 'leetcode']:
                        f.write(f"// {problem_title}\n")
                        f.write(f"// Generated: {datetime.now().isoformat()}\n")
                        f.write(f"// Category: {self.CATEGORIES[category]}\n")
                        f.write(f"// Input Type: {input_type}\n")
                        f.write(f"// Success: {solution_data.get('success', False)}\n\n")
                    
                    f.write(solution_code)
            
            # Store the problem text
            with open(paths['problem_file'], 'w', encoding='utf-8') as f:
                f.write(f"Problem: {problem_title}\n")
                f.write(f"Category: {self.CATEGORIES[category]}\n")
                f.write(f"Generated: {datetime.now().isoformat()}\n")
                f.write(f"Input Type: {input_type}\n")
                f.write("=" * 50 + "\n\n")
                f.write(problem_text)
            
            # Store comprehensive metadata
            metadata = {
                'problem_title': problem_title,
                'category': category,
                'category_name': self.CATEGORIES[category],
                'generated_at': datetime.now().isoformat(),
                'input_type': input_type,
                'solution_hash': solution_hash,
                'success': solution_data.get('success', False),
                'processing_time': solution_data.get('processing_time'),
                'iterations': solution_data.get('iterations'),
                'self_corrected': solution_data.get('self_corrected', False),
                'file_paths': {
                    'solution': str(paths['solution_file']),
                    'problem': str(paths['problem_file']),
                    'metadata': str(paths['metadata_file'])
                },
                'analysis': {
                    'explanation': solution_data.get('explanation'),
                    'complexity_analysis': solution_data.get('complexity_analysis'),
                    'brute_force_approach': solution_data.get('brute_force_approach'),
                    'test_cases_covered': solution_data.get('test_cases_covered')
                },
                'execution_result': solution_data.get('execution_result'),
                'correction_history': solution_data.get('correction_history', [])
            }
            
            with open(paths['metadata_file'], 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
            
            # Return relative paths for API response
            relative_paths = {
                'solution_file': str(paths['solution_file'].relative_to(self.base_path)),
                'metadata_file': str(paths['metadata_file'].relative_to(self.base_path)),
                'problem_file': str(paths['problem_file'].relative_to(self.base_path)),
                'storage_folder': str(today_folder.relative_to(self.base_path)),
                'absolute_folder': str(today_folder),
                'category': category,
                'category_name': self.CATEGORIES[category]
            }
            
            print(f"✅ Solution stored in {category}: {relative_paths['solution_file']}")
            return relative_paths
            
        except Exception as e:
            print(f"⚠️ Failed to store solution: {str(e)}")
            return None
    
    def list_solutions_by_date(self, date: str = None, category: str = None) -> List[Dict[str, Any]]:
        """
        List metadata for solutions on a given date and/or category
        
        Args:
            date: Date in YYYY-MM-DD format (default: today)
            category: Category to filter by (optional)
        
        Returns:
            List of solution metadata dictionaries
        """
        if not self.enabled:
            return []
        
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")
        
        solutions = []
        
        categories_to_search = [category] if category else self.CATEGORIES.keys()
        
        for cat in categories_to_search:
            date_folder = self.base_path / cat / date
            if date_folder.exists():
                for metadata_file in date_folder.glob("*_metadata.json"):
                    try:
                        with open(metadata_file, 'r', encoding='utf-8') as f:
                            metadata = json.load(f)
                        solutions.append(metadata)
                    except Exception as e:
                        print(f"Error reading {metadata_file}: {e}")
        
        return sorted(solutions, key=lambda x: x.get('generated_at', ''), reverse=True)
    
    def get_available_dates(self, category: str = None) -> List[str]:
        """
        Get list of dates with stored solutions
        
        Args:
            category: Category to filter by (optional)
        
        Returns:
            List of dates in YYYY-MM-DD format
        """
        if not self.enabled:
            return []
        
        dates = set()
        
        categories_to_search = [category] if category else self.CATEGORIES.keys()
        
        for cat in categories_to_search:
            category_path = self.base_path / cat
            if category_path.exists():
                for date_folder in category_path.iterdir():
                    if date_folder.is_dir() and re.match(r'\d{4}-\d{2}-\d{2}', date_folder.name):
                        dates.add(date_folder.name)
        
        return sorted(list(dates), reverse=True)
    
    def get_storage_stats(self) -> Dict[str, Any]:
        """Get statistics about stored solutions"""
        if not self.enabled:
            return {'enabled': False}
        
        stats = {
            'enabled': True,
            'total_solutions': 0,
            'categories': {},
            'dates_with_solutions': len(self.get_available_dates()),
            'storage_path': str(self.base_path)
        }
        
        for category in self.CATEGORIES.keys():
            category_path = self.base_path / category
            category_count = 0
            
            if category_path.exists():
                for date_folder in category_path.iterdir():
                    if date_folder.is_dir():
                        metadata_files = list(date_folder.glob("*_metadata.json"))
                        category_count += len(metadata_files)
            
            stats['categories'][category] = {
                'name': self.CATEGORIES[category],
                'count': category_count
            }
            stats['total_solutions'] += category_count
        
        return stats
    
    def cleanup_old_solutions(self, days_to_keep: int = 30) -> int:
        """
        Delete solutions older than specified days
        
        Args:
            days_to_keep: Number of days to keep (default: 30)
        
        Returns:
            Number of solutions deleted
        """
        if not self.enabled:
            return 0
        
        from datetime import timedelta
        
        cutoff_date = (datetime.now() - timedelta(days=days_to_keep)).strftime("%Y-%m-%d")
        deleted_count = 0
        
        for category in self.CATEGORIES.keys():
            category_path = self.base_path / category
            if category_path.exists():
                for date_folder in category_path.iterdir():
                    if date_folder.is_dir() and date_folder.name < cutoff_date:
                        try:
                            import shutil
                            shutil.rmtree(date_folder)
                            deleted_count += len(list(date_folder.glob("*_metadata.json")))
                            print(f"🗑️ Deleted old solutions from {category}/{date_folder.name}")
                        except Exception as e:
                            print(f"Error deleting {date_folder}: {e}")
        
        return deleted_count


if __name__ == "__main__":
    # Example usage
    manager = UniversalSolutionManager()
    
    # Example LeetCode problem
    leetcode_problem = """
    Given an array of integers nums and an integer target, return indices of the 
    two numbers such that they add up to target.
    """
    
    leetcode_solution = {
        'success': True,
        'optimized_solution': 'function twoSum(nums, target) { return [0, 1]; }',
        'explanation': 'Use hash map for O(n) solution',
        'complexity_analysis': 'Time: O(n), Space: O(n)'
    }
    
    # Store with auto-detection
    result = manager.store_solution(leetcode_problem, leetcode_solution)
    if result:
        print(f"Stored in category: {result['category_name']}")
        print(f"File path: {result['solution_file']}")
    
    # Example React problem  
    react_problem = "Create a React component with state management using useState hook"
    react_solution = {
        'success': True,
        'solution': '<div>React component with useState</div>',
        'explanation': 'Simple stateful component'
    }
    
    # Store with explicit category
    result2 = manager.store_solution(react_problem, react_solution, category='react')
    
    # Get stats
    stats = manager.get_storage_stats()
    print(f"\n📊 Storage Stats:")
    print(f"Total solutions: {stats['total_solutions']}")
    for cat, info in stats['categories'].items():
        if info['count'] > 0:
            print(f"  {info['name']}: {info['count']}")