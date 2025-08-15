#!/usr/bin/env python3
"""
FastAPI Server for LeetCode Problem Solver
Exposes the LeetCode solver functionality as REST APIs
"""

import os
import sys
import base64
import asyncio
import tempfile
import traceback
import time
from typing import Optional, Dict, Any, List
from datetime import datetime
from pathlib import Path

# FastAPI and server imports
from fastapi import FastAPI, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

# Import our solver
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))  # Add parent directory to path

from LeetCodeSolver.olderTriedCode.simplified_leetcode_solver import SimplifiedLeetCodeSolver, EnvironmentManager
from LeetCodeSolver.latest.enhanced_leetcode_solver import EnhancedLeetCodeSolver
from LeetCodeSolver.latest.universal_solution_manager import UniversalSolutionManager
from WebResearchEngine.web_research_engine import WebResearchEngine

# =====================
# Pydantic Models
# =====================

class ProblemRequest(BaseModel):
    """Request model for text-based problem solving"""
    problem_text: str = Field(..., description="The LeetCode problem description", min_length=1)
    timeout: Optional[int] = Field(15, description="Execution timeout in seconds", ge=5, le=60)
    max_corrections: Optional[int] = Field(3, description="Maximum self-correction attempts (1-5)", ge=1, le=5)
    store_solution: Optional[bool] = Field(True, description="Whether to store the solution for future reference")

class SolutionResponse(BaseModel):
    """Response model for problem solutions"""
    success: bool = Field(..., description="Whether the problem was solved successfully")
    solution: Optional[str] = Field(None, description="Generated JavaScript solution")
    execution_result: Optional[Dict[str, Any]] = Field(None, description="JavaScript execution results")
    agent_response: Optional[str] = Field(None, description="Raw AI agent response")
    input_type: Optional[str] = Field(None, description="Type of input (text/image)")
    error: Optional[str] = Field(None, description="Error message if unsuccessful")
    processing_time: Optional[float] = Field(None, description="Total processing time in seconds")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Response timestamp")
    # Self-correction fields
    iterations: Optional[int] = Field(None, description="Number of AI correction iterations")
    self_corrected: Optional[bool] = Field(None, description="Whether solution required self-correction")
    correction_history: Optional[List[str]] = Field(None, description="History of correction attempts")

class StorageInfo(BaseModel):
    """Storage information for saved solutions"""
    stored: bool = Field(..., description="Whether the solution was stored")
    solution_file: Optional[str] = Field(None, description="Path to the stored JavaScript solution file")
    problem_file: Optional[str] = Field(None, description="Path to the stored problem description file")
    metadata_file: Optional[str] = Field(None, description="Path to the stored metadata file")
    storage_folder: Optional[str] = Field(None, description="Relative path to the storage folder")
    absolute_folder: Optional[str] = Field(None, description="Absolute path to the storage folder")
    category: Optional[str] = Field(None, description="Solution category")
    category_name: Optional[str] = Field(None, description="Human-readable category name")

class WebResearchRequest(BaseModel):
    """Request model for web research"""
    query: str = Field(..., description="Research question or topic", min_length=5)
    depth: Optional[str] = Field("comprehensive", description="Research depth: basic, comprehensive, deep")
    include_diagrams: Optional[bool] = Field(True, description="Whether to include Mermaid diagrams")
    store_result: Optional[bool] = Field(True, description="Whether to store the research result")
    max_timeout: Optional[int] = Field(300, description="Maximum timeout in seconds", ge=30, le=600)

class WebResearchResponse(BaseModel):
    """Response model for web research"""
    success: bool = Field(..., description="Whether the research was completed successfully")
    query: str = Field(..., description="Original research query")
    research_content: str = Field(..., description="Comprehensive research documentation")
    mermaid_diagrams: List[str] = Field(default_factory=list, description="Generated Mermaid diagrams")
    sources: List[str] = Field(default_factory=list, description="Source citations and references")
    processing_time: float = Field(..., description="Time taken to complete research")
    model_used: str = Field(..., description="OpenRouter model used for research")
    tokens_used: int = Field(..., description="Total tokens consumed")
    depth: str = Field(..., description="Research depth level used")
    include_diagrams: bool = Field(..., description="Whether diagrams were included")
    timestamp: str = Field(..., description="Timestamp when research was completed")
    category: str = Field(..., description="Research category")
    storage: Optional[StorageInfo] = Field(None, description="Information about stored research")
    error: Optional[str] = Field(None, description="Error message if research failed")

class EnhancedSolutionResponse(BaseModel):
    """Enhanced response model for comprehensive problem analysis"""
    success: bool = Field(..., description="Whether the problem was solved successfully")
    optimized_solution: Optional[str] = Field(None, description="Optimized JavaScript solution")
    explanation: Optional[str] = Field(None, description="Detailed step-by-step explanation with sample walkthrough")
    complexity_analysis: Optional[str] = Field(None, description="Time and space complexity analysis")
    brute_force_approach: Optional[str] = Field(None, description="Brute force approach explanation and complexities")
    test_cases_covered: Optional[str] = Field(None, description="Test case types and edge cases handled")
    execution_result: Optional[Dict[str, Any]] = Field(None, description="JavaScript execution results")
    agent_response: Optional[str] = Field(None, description="Raw AI agent response")
    input_type: Optional[str] = Field(None, description="Type of input (text/image)")
    error: Optional[str] = Field(None, description="Error message if unsuccessful")
    processing_time: Optional[float] = Field(None, description="Total processing time in seconds")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Response timestamp")
    # Self-correction fields
    iterations: Optional[int] = Field(None, description="Number of AI correction iterations")
    self_corrected: Optional[bool] = Field(None, description="Whether solution required self-correction")
    correction_history: Optional[List[str]] = Field(None, description="History of correction attempts")
    # Storage information
    storage: Optional[StorageInfo] = Field(None, description="Information about stored solution files")

class HealthResponse(BaseModel):
    """Health check response model"""
    status: str = Field(..., description="Service status")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    version: str = Field("1.0.0", description="API version")
    system_info: Dict[str, Any] = Field(..., description="System information")

class SystemInfoResponse(BaseModel):
    """System information response model"""
    python_version: str
    nodejs_version: Optional[str]
    conda_environment: str
    openai_api_key_configured: bool
    praisonai_available: bool
    system_requirements_met: bool
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

# =====================
# FastAPI Application
# =====================

app = FastAPI(
    title="LeetCode Problem Solver API",
    description="AI-powered LeetCode problem solver using PraisonAI and OpenAI GPT-4o",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
solver = None
universal_storage_manager = None
web_research_engine = None

# =====================
# Startup and Shutdown
# =====================

@app.on_event("startup")
async def startup_event():
    """Initialize the solver, universal storage manager, and web research engine on startup"""
    global solver, universal_storage_manager, web_research_engine
    try:
        print("🚀 Starting Enhanced LeetCode Solver & Research API Server")
        print("=" * 60)
        
        # Check system requirements
        requirements = EnvironmentManager.check_system_requirements()
        
        if not requirements['python']:
            raise RuntimeError("Python 3.8+ is required")
        
        if not requirements['nodejs']:
            raise RuntimeError("Node.js is required but not found")
        
        # Initialize solver
        print("🤖 Initializing LeetCode solver...")
        solver = SimplifiedLeetCodeSolver()
        print("✅ LeetCode solver initialized successfully")
        
        # Initialize universal storage manager
        print("📁 Initializing Universal Solution Storage Manager...")
        universal_storage_manager = UniversalSolutionManager(enabled=True)
        print("✅ Universal Solution Storage Manager initialized successfully")
        
        # Initialize web research engine
        print("🔍 Initializing Web Research Engine...")
        try:
            web_research_engine = WebResearchEngine()
            print("✅ Web Research Engine initialized successfully")
        except Exception as e:
            print(f"⚠️ Web Research Engine initialization failed: {e}")
            print("   Research endpoints will not be available")
            web_research_engine = None
        
        print("🌐 Enhanced API server ready to accept requests")
        print("   - LeetCode solving available")
        print("   - Universal solution storage available") 
        if web_research_engine:
            print("   - Web research & documentation available")
        
    except Exception as e:
        print(f"❌ Failed to initialize services: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global solver, storage_manager
    print("🛑 Shutting down LeetCode Solver API Server")
    solver = None
    storage_manager = None

# =====================
# Helper Functions
# =====================

def store_solution_if_enabled(problem_text: str, solution_data: Dict[str, Any], 
                             input_type: str = "text", store_enabled: bool = True) -> Optional[Dict[str, str]]:
    """Store solution if storage is enabled and available"""
    global storage_manager
    
    if not store_enabled or not storage_manager or not storage_manager.enabled:
        return None
    
    try:
        return storage_manager.store_solution(problem_text, solution_data, input_type)
    except Exception as e:
        print(f"⚠️ Failed to store solution: {e}")
        return None

def create_storage_info(storage_paths: Optional[Dict[str, str]]) -> StorageInfo:
    """Create StorageInfo object from storage paths"""
    if storage_paths:
        return StorageInfo(
            stored=True,
            solution_file=storage_paths.get('solution_file'),
            problem_file=storage_paths.get('problem_file'),
            metadata_file=storage_paths.get('metadata_file'),
            storage_folder=storage_paths.get('storage_folder'),
            absolute_folder=storage_paths.get('absolute_folder')
        )
    else:
        return StorageInfo(stored=False)

def get_system_info() -> Dict[str, Any]:
    """Get comprehensive system information"""
    try:
        requirements = EnvironmentManager.check_system_requirements()
        
        # Get Python version
        python_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
        
        # Get Node.js version
        nodejs_version = None
        try:
            import subprocess
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                nodejs_version = result.stdout.strip()
        except:
            pass
        
        return {
            "python_version": python_version,
            "nodejs_version": nodejs_version,
            "conda_environment": os.getenv('CONDA_DEFAULT_ENV', 'Unknown'),
            "openai_api_key_configured": bool(os.getenv('OPENAI_API_KEY')),
            "praisonai_available": True,  # If we got this far, it's available
            "system_requirements_met": all(requirements.values()),
            "requirements_detail": requirements
        }
    except Exception as e:
        return {
            "error": f"Failed to get system info: {str(e)}",
            "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            "system_requirements_met": False
        }

async def solve_problem_async(problem_func, *args) -> Dict[str, Any]:
    """Asynchronously solve a problem"""
    start_time = datetime.now()
    
    try:
        # Run the solver in a thread pool to avoid blocking
        import asyncio
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, problem_func, *args)
        
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds()
        
        # Add processing time to result
        result["processing_time"] = processing_time
        result["timestamp"] = end_time.isoformat()
        
        return result
        
    except Exception as e:
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds()
        
        return {
            "success": False,
            "error": f"Problem solving failed: {str(e)}",
            "processing_time": processing_time,
            "timestamp": end_time.isoformat()
        }

# =====================
# API Endpoints
# =====================

@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "LeetCode Problem Solver API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "system_info": "/system-info"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        system_info = get_system_info()
        
        status = "healthy" if system_info.get("system_requirements_met", False) else "degraded"
        
        return HealthResponse(
            status=status,
            system_info=system_info
        )
    except Exception as e:
        return HealthResponse(
            status="unhealthy",
            system_info={"error": str(e)}
        )

@app.get("/system-info", response_model=SystemInfoResponse)
async def get_system_information():
    """Get detailed system information"""
    try:
        info = get_system_info()
        
        return SystemInfoResponse(
            python_version=info.get("python_version", "Unknown"),
            nodejs_version=info.get("nodejs_version"),
            conda_environment=info.get("conda_environment", "Unknown"),
            openai_api_key_configured=info.get("openai_api_key_configured", False),
            praisonai_available=info.get("praisonai_available", False),
            system_requirements_met=info.get("system_requirements_met", False)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system information: {str(e)}"
        )

@app.post("/solve/text", response_model=SolutionResponse)
async def solve_from_text(request: ProblemRequest):
    """Solve a LeetCode problem from text description"""
    global solver
    
    if not solver:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Solver not initialized"
        )
    
    try:
        print(f"📝 Received text problem: {request.problem_text[:100]}...")
        
        # Solve the problem asynchronously with self-correction
        result = await solve_problem_async(
            lambda: solver.solve_from_text(request.problem_text, request.max_corrections)
        )
        
        print(f"✅ Text problem solved: {'Success' if result['success'] else 'Failed'}")
        
        return SolutionResponse(**result)
        
    except Exception as e:
        print(f"❌ Text solving error: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to solve problem: {str(e)}"
        )

@app.post("/solve/image", response_model=SolutionResponse)
async def solve_from_image(file: UploadFile = File(...)):
    """Solve a LeetCode problem from image upload"""
    global solver
    
    if not solver:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Solver not initialized"
        )
    
    # Validate file type
    allowed_types = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/bmp", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}. Allowed: {allowed_types}"
        )
    
    # Validate file size (20MB limit)
    max_size = 20 * 1024 * 1024  # 20MB
    
    try:
        print(f"🖼️  Received image: {file.filename} ({file.content_type})")
        
        # Read file content
        content = await file.read()
        
        if len(content) > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large: {len(content)/(1024*1024):.1f}MB (max 20MB)"
            )
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name
        
        try:
            # Solve the problem asynchronously
            result = await solve_problem_async(solver.solve_from_image, temp_path)
            
            print(f"✅ Image problem solved: {'Success' if result['success'] else 'Failed'}")
            
            return SolutionResponse(**result)
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_path)
            except:
                pass
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Image solving error: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process image: {str(e)}"
        )

@app.post("/solve/base64", response_model=SolutionResponse)
async def solve_from_base64_image(request: Dict[str, str]):
    """Solve a LeetCode problem from base64 encoded image"""
    global solver
    
    if not solver:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Solver not initialized"
        )
    
    if "image_data" not in request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing 'image_data' field in request body"
        )
    
    try:
        print("🖼️  Received base64 image")
        
        # Decode base64 image
        image_data = request["image_data"]
        
        # Handle data URLs (remove data:image/png;base64, prefix if present)
        if image_data.startswith("data:"):
            image_data = image_data.split(",", 1)[1]
        
        # Decode base64
        try:
            image_bytes = base64.b64decode(image_data)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid base64 data: {str(e)}"
            )
        
        # Validate size
        max_size = 20 * 1024 * 1024  # 20MB
        if len(image_bytes) > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Image too large: {len(image_bytes)/(1024*1024):.1f}MB (max 20MB)"
            )
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
            temp_file.write(image_bytes)
            temp_path = temp_file.name
        
        try:
            # Solve the problem asynchronously
            result = await solve_problem_async(solver.solve_from_image, temp_path)
            
            print(f"✅ Base64 image problem solved: {'Success' if result['success'] else 'Failed'}")
            
            return SolutionResponse(**result)
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_path)
            except:
                pass
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Base64 image solving error: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process base64 image: {str(e)}"
        )

@app.get("/examples/two-sum", response_model=SolutionResponse)
async def solve_two_sum_example():
    """Solve the classic Two Sum problem as an example"""
    global solver
    
    if not solver:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Solver not initialized"
        )
    
    two_sum_problem = """
    Given an array of integers nums and an integer target, return indices of the 
    two numbers such that they add up to target.
    
    You may assume that each input would have exactly one solution, and you may not use the same element twice.
    You can return the answer in any order.
    
    Example 1:
    Input: nums = [2,7,11,15], target = 9
    Output: [0,1]
    Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
    
    Example 2:
    Input: nums = [3,2,4], target = 6
    Output: [1,2]
    
    Example 3:
    Input: nums = [3,3], target = 6
    Output: [0,1]
    
    Constraints:
    - 2 <= nums.length <= 10^4
    - -10^9 <= nums[i] <= 10^9
    - -10^9 <= target <= 10^9
    - Only one valid answer exists.
    """
    
    try:
        print("🧪 Solving Two Sum example...")
        
        result = await solve_problem_async(solver.solve_from_text, two_sum_problem)
        
        print(f"✅ Two Sum example: {'Success' if result['success'] else 'Failed'}")
        
        return SolutionResponse(**result)
        
    except Exception as e:
        print(f"❌ Two Sum example error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to solve Two Sum example: {str(e)}"
        )

# =====================
# Enhanced LeetCode Endpoints  
# =====================

@app.post("/solve/enhanced", response_model=EnhancedSolutionResponse)
async def solve_enhanced_text(request: ProblemRequest):
    """Solve LeetCode problem with comprehensive analysis (optimized solution, explanation, complexity analysis, brute force comparison)"""
    try:
        logger.info(f"Enhanced solve request: {len(request.problem_text)} chars, max_corrections={request.max_corrections}, store={request.store_solution}")
        
        # Use enhanced solver for comprehensive analysis
        enhanced_solver = EnhancedLeetCodeSolver()
        
        result = await solve_problem_async(
            lambda: enhanced_solver.solve_from_text(request.problem_text, request.max_corrections)
        )
        
        # Store solution if enabled and successful
        storage_paths = None
        if result.get('success') and request.store_solution:
            storage_paths = store_solution_if_enabled(
                request.problem_text, 
                result, 
                input_type="text",
                store_enabled=request.store_solution
            )
        
        # Add storage information to result
        result['storage'] = create_storage_info(storage_paths)
        
        # Clean up
        enhanced_solver.cleanup()
        
        return EnhancedSolutionResponse(**result)
        
    except Exception as e:
        logger.error(f"Enhanced solve from text failed: {str(e)}")
        return EnhancedSolutionResponse(
            success=False,
            error=f"Enhanced analysis failed: {str(e)}",
            input_type="text",
            storage=create_storage_info(None)
        )

@app.post("/solve/enhanced-image", response_model=EnhancedSolutionResponse)
async def solve_enhanced_image(file: UploadFile = File(...)):
    """Solve LeetCode problem from image with comprehensive analysis"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            return EnhancedSolutionResponse(
                success=False,
                error="Invalid file type. Please upload an image file.",
                input_type="image"
            )
        
        logger.info(f"Enhanced image solve request: {file.filename}, type: {file.content_type}")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            # Use enhanced solver for comprehensive analysis
            enhanced_solver = EnhancedLeetCodeSolver()
            
            result = await solve_problem_async(
                lambda: enhanced_solver.solve_from_image(tmp_file_path, 3)
            )
            
            # Clean up
            enhanced_solver.cleanup()
            
            return EnhancedSolutionResponse(**result)
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(tmp_file_path)
            except Exception as cleanup_error:
                logger.warning(f"Failed to cleanup temp file: {cleanup_error}")
        
    except Exception as e:
        logger.error(f"Enhanced solve from image failed: {str(e)}")
        return EnhancedSolutionResponse(
            success=False,
            error=f"Enhanced image analysis failed: {str(e)}",
            input_type="image"
        )

@app.get("/examples/enhanced-two-sum", response_model=EnhancedSolutionResponse)
async def get_enhanced_two_sum_example():
    """Get a comprehensive Two Sum analysis example"""
    try:
        example_problem = """
        Two Sum Problem:
        
        Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
        
        You may assume that each input would have exactly one solution, and you may not use the same element twice.
        
        Example 1:
        Input: nums = [2,7,11,15], target = 9
        Output: [0,1]
        Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
        
        Example 2:
        Input: nums = [3,2,4], target = 6
        Output: [1,2]
        
        Example 3:
        Input: nums = [3,3], target = 6
        Output: [0,1]
        
        Constraints:
        - 2 <= nums.length <= 10^4
        - -10^9 <= nums[i] <= 10^9
        - -10^9 <= target <= 10^9
        - Only one valid answer exists.
        """
        
        # Use enhanced solver for comprehensive analysis
        enhanced_solver = EnhancedLeetCodeSolver()
        
        result = await solve_problem_async(
            lambda: enhanced_solver.solve_from_text(example_problem, 3)
        )
        
        # Clean up
        enhanced_solver.cleanup()
        
        return EnhancedSolutionResponse(**result)
        
    except Exception as e:
        logger.error(f"Enhanced Two Sum example failed: {str(e)}")
        return EnhancedSolutionResponse(
            success=False,
            error=f"Failed to generate enhanced Two Sum example: {str(e)}",
            input_type="example"
        )

# =====================
# Storage Management Endpoints
# =====================

@app.get("/storage/stats")
async def get_storage_stats():
    """Get storage statistics"""
    global storage_manager
    
    if not storage_manager:
        return {"enabled": False, "error": "Storage manager not initialized"}
    
    try:
        stats = storage_manager.get_storage_stats()
        return stats
    except Exception as e:
        return {"enabled": False, "error": str(e)}

@app.get("/storage/solutions/{date}")
async def list_solutions_by_date(date: str):
    """List solutions for a specific date (YYYY-MM-DD format)"""
    global storage_manager
    
    if not storage_manager:
        return {"error": "Storage manager not initialized", "solutions": []}
    
    try:
        # Validate date format
        from datetime import datetime
        datetime.strptime(date, "%Y-%m-%d")
        
        solutions = storage_manager.list_solutions_by_date(date)
        return {
            "date": date,
            "count": len(solutions),
            "solutions": solutions
        }
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM-DD", "solutions": []}
    except Exception as e:
        return {"error": str(e), "solutions": []}

@app.get("/storage/solutions")
async def list_todays_solutions():
    """List today's solutions"""
    global storage_manager
    
    if not storage_manager:
        return {"error": "Storage manager not initialized", "solutions": []}
    
    try:
        solutions = storage_manager.list_solutions_by_date()  # Default to today
        today = datetime.now().strftime("%Y-%m-%d")
        return {
            "date": today,
            "count": len(solutions),
            "solutions": solutions
        }
    except Exception as e:
        return {"error": str(e), "solutions": []}

@app.get("/storage/dates")
async def get_available_dates():
    """Get list of dates with stored solutions"""
    global storage_manager
    
    if not storage_manager:
        return {"error": "Storage manager not initialized", "dates": []}
    
    try:
        dates = storage_manager.get_available_dates()
        return {
            "available_dates": dates,
            "count": len(dates)
        }
    except Exception as e:
        return {"error": str(e), "dates": []}

# =====================
# Web Research Endpoints
# =====================

@app.post("/research/query", response_model=WebResearchResponse)
async def research_query(request: WebResearchRequest):
    """Conduct comprehensive web research with auto-prompt selection"""
    if not web_research_engine:
        raise HTTPException(status_code=503, detail="Web research engine not initialized")
    
    try:
        start_time = time.time()
        
        # Conduct research using the web research engine
        result = web_research_engine.research_and_document(
            query=request.query,
            depth=request.depth,
            include_diagrams=request.include_diagrams,
            store_result=request.store_result,
            max_timeout=request.max_timeout
        )
        
        processing_time = time.time() - start_time
        
        # Create storage info if result was stored
        storage_info = None
        if request.store_result and result.get('storage'):
            storage_info = create_storage_info(result['storage'])
        
        return WebResearchResponse(
            success=result.get('success', False),
            query=result.get('query', request.query),
            research_content=result.get('research_content'),
            mermaid_diagrams=result.get('mermaid_diagrams', []),
            sources=result.get('sources', []),
            processing_time=processing_time,
            model_used=result.get('model_used', 'unknown'),
            tokens_used=result.get('tokens_used', 0),
            depth=request.depth,
            include_diagrams=request.include_diagrams,
            timestamp=result.get('timestamp', datetime.now().isoformat()),
            category=result.get('category', 'web_research'),
            storage=storage_info,
            error=result.get('error')
        )
        
    except Exception as e:
        print(f"❌ Research query failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")

@app.post("/research/prompt/{prompt_name}", response_model=WebResearchResponse)
async def research_with_prompt(prompt_name: str, request: WebResearchRequest):
    """Conduct research using a specific prompt template"""
    if not web_research_engine:
        raise HTTPException(status_code=503, detail="Web research engine not initialized")
    
    try:
        start_time = time.time()
        
        # Conduct research using specified prompt
        result = web_research_engine.research_and_document(
            query=request.query,
            depth=request.depth,
            include_diagrams=request.include_diagrams,
            store_result=request.store_result,
            max_timeout=request.max_timeout,
            prompt_name=prompt_name
        )
        
        processing_time = time.time() - start_time
        
        # Create storage info if result was stored
        storage_info = None
        if request.store_result and result.get('storage'):
            storage_info = create_storage_info(result['storage'])
        
        return WebResearchResponse(
            success=result.get('success', False),
            query=result.get('query', request.query),
            research_content=result.get('research_content'),
            mermaid_diagrams=result.get('mermaid_diagrams', []),
            sources=result.get('sources', []),
            processing_time=processing_time,
            model_used=result.get('model_used', 'unknown'),
            tokens_used=result.get('tokens_used', 0),
            depth=request.depth,
            include_diagrams=request.include_diagrams,
            timestamp=result.get('timestamp', datetime.now().isoformat()),
            category=result.get('category', 'web_research'),
            storage=storage_info,
            error=result.get('error')
        )
        
    except Exception as e:
        print(f"❌ Research with prompt failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")

@app.get("/research/prompts")
async def get_research_prompts():
    """Get all available research prompt templates"""
    if not web_research_engine:
        raise HTTPException(status_code=503, detail="Web research engine not initialized")
    
    try:
        prompts = web_research_engine.get_available_prompts()
        return {
            "prompts": prompts,
            "count": len(prompts)
        }
    except Exception as e:
        print(f"❌ Failed to get research prompts: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get prompts: {str(e)}")

@app.get("/research/categories")
async def get_research_categories():
    """Get all available research prompt categories"""
    if not web_research_engine:
        raise HTTPException(status_code=503, detail="Web research engine not initialized")
    
    try:
        categories = web_research_engine.get_prompt_categories()
        return {
            "categories": categories,
            "count": len(categories)
        }
    except Exception as e:
        print(f"❌ Failed to get research categories: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get categories: {str(e)}")

@app.get("/examples/research-microservices")
async def example_research_microservices():
    """Example: Research microservices architecture using auto-prompt selection"""
    if not web_research_engine:
        raise HTTPException(status_code=503, detail="Web research engine not initialized")
    
    try:
        start_time = time.time()
        
        result = web_research_engine.research_and_document(
            query="How to design a scalable microservices architecture for e-commerce?",
            depth="comprehensive",
            include_diagrams=True,
            store_result=True
        )
        
        processing_time = time.time() - start_time
        
        # Create storage info if result was stored
        storage_info = None
        if result.get('storage'):
            storage_info = create_storage_info(result['storage'])
        
        return WebResearchResponse(
            success=result.get('success', False),
            query=result.get('query', "Example microservices research"),
            research_content=result.get('research_content'),
            mermaid_diagrams=result.get('mermaid_diagrams', []),
            sources=result.get('sources', []),
            processing_time=processing_time,
            model_used=result.get('model_used', 'unknown'),
            tokens_used=result.get('tokens_used', 0),
            depth="comprehensive",
            include_diagrams=True,
            timestamp=result.get('timestamp', datetime.now().isoformat()),
            category=result.get('category', 'web_research'),
            storage=storage_info,
            error=result.get('error')
        )
        
    except Exception as e:
        print(f"❌ Example research failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Example research failed: {str(e)}")

# =====================
# Error Handlers
# =====================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    print(f"❌ Unhandled exception: {exc}")
    traceback.print_exc()
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

# =====================
# Main Application
# =====================

if __name__ == "__main__":
    print("🚀 Starting LeetCode Solver API Server")
    print("=" * 50)
    print("📍 API Documentation: http://localhost:8000/docs")
    print("🔍 API Explorer: http://localhost:8000/redoc")
    print("💚 Health Check: http://localhost:8000/health")
    print("=" * 50)
    
    # Run with uvicorn
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=["pythonBackend"],
        log_level="info"
    )