#!/usr/bin/env python3
"""
OpenAI Models Configuration for 2025
Best models for different LeetCode solving tasks
"""

# Latest OpenAI Models (2025) with their optimal use cases
OPENAI_MODELS_2025 = {
    # Vision-capable models (best for image processing)
    "vision": {
        "gpt-4o": {
            "description": "Best overall vision model for 2025",
            "strengths": ["High-quality image understanding", "Multimodal capabilities", "Good context window"],
            "context_window": "128K tokens",
            "cost": "Medium",
            "best_for": ["Complex image analysis", "LeetCode image problems", "General vision tasks"]
        },
        "gpt-4o-mini": {
            "description": "Most efficient vision model",
            "strengths": ["Fast inference", "Cost-effective", "Good for simple images"],
            "context_window": "128K tokens", 
            "cost": "Low",
            "best_for": ["Large images", "Budget-conscious tasks", "Fallback processing"]
        }
    },
    
    # Text-only models (best for pure coding)
    "text": {
        "gpt-4": {
            "description": "Reliable text model",
            "strengths": ["Strong reasoning", "Good code generation"],
            "context_window": "8K/32K tokens",
            "cost": "Medium-High",
            "best_for": ["Complex reasoning", "Code analysis"]
        },
        "o1": {
            "description": "Advanced reasoning model (2025)",
            "strengths": ["Deep reasoning", "Step-by-step thinking", "Complex problem solving"],
            "context_window": "128K tokens",
            "cost": "High",
            "best_for": ["Mathematical problems", "Complex algorithms", "Multi-step reasoning"]
        },
        "o1-mini": {
            "description": "Efficient reasoning model",
            "strengths": ["Fast reasoning", "Good for coding", "Cost-effective"],
            "context_window": "128K tokens",
            "cost": "Medium",
            "best_for": ["Coding problems", "Quick solutions", "Algorithm optimization"]
        }
    },
    
    # Latest 2025 models
    "latest_2025": {
        "gpt-4.5": {
            "description": "Enhanced GPT-4 with improved capabilities (2025)",
            "strengths": ["Better accuracy", "Improved reasoning", "Enhanced creativity"],
            "context_window": "128K tokens",
            "cost": "High",
            "best_for": ["Complex tasks", "High-quality output", "Creative solutions"]
        },
        "o3": {
            "description": "Next-generation reasoning model (2025)",
            "strengths": ["Advanced reasoning", "Scientific problems", "Complex analysis"],
            "context_window": "200K tokens",
            "cost": "Very High",
            "best_for": ["Research problems", "Complex algorithms", "Advanced mathematics"]
        },
        "o3-mini": {
            "description": "Efficient version of o3",
            "strengths": ["Good reasoning", "Faster inference", "Cost-effective"],
            "context_window": "200K tokens",
            "cost": "Medium",
            "best_for": ["Daily coding", "Standard algorithms", "Quick reasoning"]
        }
    }
}

def get_best_model_for_task(task_type: str, image_size: str = "medium", budget: str = "medium") -> dict:
    """
    Get the best model recommendation for a specific task
    
    Args:
        task_type: "vision", "text", "reasoning", "coding"
        image_size: "small", "medium", "large" (for vision tasks)
        budget: "low", "medium", "high"
    """
    
    if task_type == "vision":
        if budget == "low" or image_size == "large":
            return {
                "model": "gpt-4o-mini",
                "reason": "Most cost-effective for vision tasks, handles large images well"
            }
        else:
            return {
                "model": "gpt-4o", 
                "reason": "Best vision quality and understanding"
            }
    
    elif task_type == "reasoning":
        if budget == "high":
            return {
                "model": "o3",
                "reason": "Most advanced reasoning capabilities"
            }
        elif budget == "medium":
            return {
                "model": "o1",
                "reason": "Good balance of reasoning and cost"
            }
        else:
            return {
                "model": "o1-mini",
                "reason": "Efficient reasoning at lower cost"
            }
    
    elif task_type == "coding":
        if budget == "high":
            return {
                "model": "gpt-4.5",
                "reason": "Enhanced coding capabilities and accuracy"
            }
        else:
            return {
                "model": "gpt-4o",
                "reason": "Good balance of performance and cost for coding"
            }
    
    else:  # general text
        return {
            "model": "gpt-4o",
            "reason": "Best general-purpose model for 2025"
        }

# Model selection strategy for LeetCode solver
LEETCODE_MODEL_STRATEGY = {
    "primary_vision": "gpt-4o",
    "fallback_vision": "gpt-4o-mini", 
    "text_processing": "gpt-4o",
    "reasoning_heavy": "o1-mini",
    "budget_mode": "gpt-4o-mini"
}

# Context window limits (important for large images)
CONTEXT_LIMITS = {
    "gpt-4o": 128000,
    "gpt-4o-mini": 128000,
    "gpt-4": 32000,
    "o1": 128000,
    "o1-mini": 128000,
    "gpt-4.5": 128000,
    "o3": 200000,
    "o3-mini": 200000
}

# Token cost estimates (per 1M tokens, approximate)
COST_ESTIMATES = {
    "gpt-4o": {"input": 5.0, "output": 15.0},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    "o1": {"input": 15.0, "output": 60.0},
    "o1-mini": {"input": 3.0, "output": 12.0},
    "gpt-4.5": {"input": 10.0, "output": 30.0},
    "o3": {"input": 25.0, "output": 100.0},
    "o3-mini": {"input": 1.1, "output": 4.4}
}