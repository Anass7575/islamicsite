"""
Request context management using contextvars
"""
from contextvars import ContextVar
from typing import Dict, Any, Optional
import uuid

# Context variable for request information
request_context: ContextVar[Optional[Dict[str, Any]]] = ContextVar('request_context', default=None)

def set_request_context(
    user_id: Optional[int] = None,
    request_id: Optional[str] = None,
    trace_id: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """Set request context for logging and tracing"""
    
    context = {
        'user_id': user_id,
        'request_id': request_id or str(uuid.uuid4()),
        'trace_id': trace_id,
        **kwargs
    }
    
    request_context.set(context)
    return context

def get_request_context() -> Optional[Dict[str, Any]]:
    """Get current request context"""
    return request_context.get()

def clear_request_context():
    """Clear request context"""
    request_context.set(None)