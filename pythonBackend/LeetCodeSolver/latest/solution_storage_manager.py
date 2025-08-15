#!/usr/bin/env python3
"""
Solution Storage Manager
Manages storage of LeetCode solutions organized by date with comprehensive metadata
"""

import os
import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List
import re

class SolutionStorageManager:
    """Manages storage and retrieval of LeetCode solutions organized by date"""
    
    def __init__(self, base_storage_path: Optional[str] = None, enabled: bool = True):
        """
        Initialize the storage manager
        
        Args:
            base_storage_path: Base directory for storing solutions (default: ./solutions)
            enabled: Whether to enable storage (can be disabled for testing)
        """
        self.enabled = enabled
        
        if base_storage_path:
            self.base_path = Path(base_storage_path)
        else:
            # Default to solutions folder in parent directory of LeetCodeSolver
            current_dir = Path(__file__).parent
            self.base_path = current_dir.parent / "solutions"
        
        # Create base directory if it doesn't exist
        if self.enabled:
            self.base_path.mkdir(parents=True, exist_ok=True)
            print(f"📁 Solution storage initialized at: {self.base_path}")
    
    def _sanitize_filename(self, text: str, max_length: int = 50) -> str:
        """Sanitize text for use as filename"""
        # Remove special characters and replace with underscores
        sanitized = re.sub(r'[<>:"/\\|?*]', '_', text)
        # Replace multiple underscores with single
        sanitized = re.sub(r'_+', '_', sanitized)
        # Remove leading/trailing underscores
        sanitized = sanitized.strip('_')
        # Truncate if too long
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length].rstrip('_')
        
        return sanitized or "unnamed_problem"
    
    def _extract_problem_title(self, problem_text: str) -> str:
        """Extract problem title from problem text"""
        lines = problem_text.strip().split('\n')
        
        # Try to find the title in the first few lines
        for line in lines[:5]:
            line = line.strip()
            if line and not line.startswith('Given') and not line.startswith('Example'):
                # Remove common prefixes
                title = re.sub(r'^(Problem|Question|LeetCode)\s*:?\s*', '', line, flags=re.IGNORECASE)
                title = re.sub(r'^[\d\.\s]+', '', title)  # Remove numbering
                if len(title) > 5:  # Must be substantial
                    return self._sanitize_filename(title)
        
        # Fallback: use first substantial line
        for line in lines:
            line = line.strip()
            if len(line) > 10:
                return self._sanitize_filename(line.split('.')[0])
        
        return "untitled_problem"
    
    def _generate_solution_hash(self, problem_text: str, solution: str) -> str:
        """Generate a short hash for the solution"""
        content = f"{problem_text}{solution}"
        return hashlib.md5(content.encode()).hexdigest()[:8]
    
    def _get_today_folder(self) -> Path:
        """Get today's folder path"""
        today = datetime.now().strftime("%Y-%m-%d")
        folder_path = self.base_path / today
        folder_path.mkdir(parents=True, exist_ok=True)
        return folder_path
    
    def store_solution(self, 
                      problem_text: str, 
                      solution_data: Dict[str, Any], 
                      input_type: str = "text") -> Optional[Dict[str, str]]:
        """
        Store a solution with metadata
        
        Args:
            problem_text: The original problem statement
            solution_data: Complete solution data from the solver
            input_type: Type of input (text/image)
        
        Returns:
            Dictionary with file paths or None if storage disabled
        """
        if not self.enabled:
            return None
        
        try:
            # Get today's folder
            today_folder = self._get_today_folder()
            
            # Extract problem title and generate hash
            problem_title = self._extract_problem_title(problem_text)
            solution_hash = self._generate_solution_hash(
                problem_text, 
                solution_data.get('optimized_solution', solution_data.get('solution', ''))
            )
            
            # Generate timestamp
            timestamp = datetime.now().strftime("%H%M%S")
            
            # Create filename base
            filename_base = f"{timestamp}_{problem_title}_{solution_hash}"
            
            # File paths
            paths = {
                'solution_file': today_folder / f"{filename_base}_solution.js",
                'metadata_file': today_folder / f"{filename_base}_metadata.json",
                'problem_file': today_folder / f"{filename_base}_problem.txt"
            }
            
            # Store the JavaScript solution
            solution_code = (solution_data.get('optimized_solution') or 
                           solution_data.get('solution', ''))
            
            if solution_code:
                with open(paths['solution_file'], 'w', encoding='utf-8') as f:
                    f.write(f"// {problem_title}\n")
                    f.write(f"// Generated on: {datetime.now().isoformat()}\n")
                    f.write(f"// Input type: {input_type}\n")
                    f.write(f"// Success: {solution_data.get('success', False)}\n")
                    if solution_data.get('complexity_analysis'):
                        f.write(f"// Complexity: {solution_data['complexity_analysis'][:100]}...\n")
                    f.write("\n")
                    f.write(solution_code)
            
            # Store the problem text
            with open(paths['problem_file'], 'w', encoding='utf-8') as f:
                f.write(f"Problem: {problem_title}\n")
                f.write(f"Generated: {datetime.now().isoformat()}\n")
                f.write(f"Input Type: {input_type}\n")
                f.write("=" * 50 + "\n\n")
                f.write(problem_text)
            
            # Store comprehensive metadata
            metadata = {
                'problem_title': problem_title,
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
                'absolute_folder': str(today_folder)
            }
            
            print(f"✅ Solution stored: {relative_paths['solution_file']}")
            return relative_paths
            
        except Exception as e:
            print(f"⚠️ Failed to store solution: {str(e)}")
            return None
    
    def list_solutions_by_date(self, date_str: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List solutions for a specific date
        
        Args:
            date_str: Date in YYYY-MM-DD format (default: today)
        
        Returns:
            List of solution metadata
        """
        if not self.enabled:
            return []
        
        if date_str:
            folder_path = self.base_path / date_str
        else:
            folder_path = self._get_today_folder()
        
        if not folder_path.exists():
            return []
        
        solutions = []
        for metadata_file in folder_path.glob("*_metadata.json"):
            try:
                with open(metadata_file, 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
                    solutions.append(metadata)
            except Exception as e:
                print(f"⚠️ Failed to read metadata file {metadata_file}: {e}")
        
        # Sort by generation time
        solutions.sort(key=lambda x: x.get('generated_at', ''))
        return solutions
    
    def get_available_dates(self) -> List[str]:
        """Get list of dates with stored solutions"""
        if not self.enabled:
            return []
        
        dates = []
        for item in self.base_path.iterdir():
            if item.is_dir() and re.match(r'\d{4}-\d{2}-\d{2}', item.name):
                dates.append(item.name)
        
        return sorted(dates, reverse=True)  # Most recent first
    
    def get_storage_stats(self) -> Dict[str, Any]:
        """Get storage statistics"""
        if not self.enabled:
            return {'enabled': False}
        
        stats = {
            'enabled': True,
            'base_path': str(self.base_path),
            'total_dates': 0,
            'total_solutions': 0,
            'available_dates': [],
            'today_solutions': 0
        }
        
        try:
            dates = self.get_available_dates()
            stats['available_dates'] = dates
            stats['total_dates'] = len(dates)
            
            total_solutions = 0
            for date in dates:
                date_solutions = self.list_solutions_by_date(date)
                total_solutions += len(date_solutions)
                
                if date == datetime.now().strftime("%Y-%m-%d"):
                    stats['today_solutions'] = len(date_solutions)
            
            stats['total_solutions'] = total_solutions
            
        except Exception as e:
            stats['error'] = str(e)
        
        return stats
    
    def cleanup_old_solutions(self, days_to_keep: int = 30) -> Dict[str, Any]:
        """
        Clean up solutions older than specified days
        
        Args:
            days_to_keep: Number of days to keep (default: 30)
        
        Returns:
            Cleanup statistics
        """
        if not self.enabled:
            return {'enabled': False}
        
        from datetime import timedelta
        
        cutoff_date = datetime.now() - timedelta(days=days_to_keep)
        cutoff_str = cutoff_date.strftime("%Y-%m-%d")
        
        stats = {
            'enabled': True,
            'cutoff_date': cutoff_str,
            'deleted_dates': [],
            'deleted_solutions': 0,
            'errors': []
        }
        
        try:
            for item in self.base_path.iterdir():
                if item.is_dir() and re.match(r'\d{4}-\d{2}-\d{2}', item.name):
                    if item.name < cutoff_str:
                        try:
                            # Count solutions before deletion
                            solution_count = len(list(item.glob("*_metadata.json")))
                            
                            # Delete the directory
                            import shutil
                            shutil.rmtree(item)
                            
                            stats['deleted_dates'].append(item.name)
                            stats['deleted_solutions'] += solution_count
                            
                        except Exception as e:
                            stats['errors'].append(f"Failed to delete {item.name}: {str(e)}")
        
        except Exception as e:
            stats['errors'].append(f"Cleanup failed: {str(e)}")
        
        return stats


# Convenience functions
def create_storage_manager(base_path: Optional[str] = None, enabled: bool = True) -> SolutionStorageManager:
    """Create a storage manager instance"""
    return SolutionStorageManager(base_path, enabled)

def store_solution(storage_manager: SolutionStorageManager, 
                  problem_text: str, 
                  solution_data: Dict[str, Any], 
                  input_type: str = "text") -> Optional[Dict[str, str]]:
    """Convenience function to store a solution"""
    return storage_manager.store_solution(problem_text, solution_data, input_type)


if __name__ == "__main__":
    # Example usage and testing
    print("🧪 Testing Solution Storage Manager")
    print("=" * 50)
    
    # Create storage manager
    storage = SolutionStorageManager()
    
    # Test data
    test_problem = """
    Two Sum Problem:
    
    Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
    
    Example 1:
    Input: nums = [2,7,11,15], target = 9
    Output: [0,1]
    """
    
    test_solution = {
        'success': True,
        'optimized_solution': '''function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}''',
        'explanation': 'Use a hash map to store numbers and their indices...',
        'complexity_analysis': 'Time Complexity: O(n), Space Complexity: O(n)',
        'brute_force_approach': 'Nested loops: O(n²) time complexity',
        'test_cases_covered': 'Empty array, no solution, duplicate numbers',
        'processing_time': 15.3,
        'iterations': 1,
        'self_corrected': False
    }
    
    # Store solution
    paths = storage.store_solution(test_problem, test_solution, "text")
    
    if paths:
        print(f"\n✅ Solution stored successfully!")
        print(f"📁 Folder: {paths['storage_folder']}")
        print(f"📄 Solution: {paths['solution_file']}")
        print(f"📋 Metadata: {paths['metadata_file']}")
        print(f"📝 Problem: {paths['problem_file']}")
    
    # Get storage stats
    stats = storage.get_storage_stats()
    print(f"\n📊 Storage Stats:")
    print(f"Total solutions: {stats['total_solutions']}")
    print(f"Today's solutions: {stats['today_solutions']}")
    print(f"Available dates: {stats['available_dates']}")