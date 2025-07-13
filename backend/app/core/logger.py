"""
Centralized logging configuration for the backend
"""
import logging
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional
from pythonjsonlogger import jsonlogger
from app.core.config import settings
import traceback

# Custom formatter for structured logging
class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """Custom JSON formatter with additional fields"""
    
    def add_fields(self, log_record: Dict[str, Any], record: logging.LogRecord, message_dict: Dict[str, Any]) -> None:
        super().add_fields(log_record, record, message_dict)
        
        # Add custom fields
        log_record['timestamp'] = datetime.utcnow().isoformat()
        log_record['service'] = 'al-hidaya-backend'
        log_record['environment'] = settings.ENVIRONMENT
        log_record['level'] = record.levelname
        
        # Add context if available
        if hasattr(record, 'user_id'):
            log_record['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_record['request_id'] = record.request_id
        if hasattr(record, 'trace_id'):
            log_record['trace_id'] = record.trace_id
        
        # Add exception info if present
        if record.exc_info:
            log_record['exception'] = {
                'type': record.exc_info[0].__name__,
                'message': str(record.exc_info[1]),
                'traceback': traceback.format_exception(*record.exc_info)
            }

class ContextFilter(logging.Filter):
    """Add request context to log records"""
    
    def filter(self, record: logging.LogRecord) -> bool:
        # Add request context from context vars
        from app.core.context import request_context
        
        ctx = request_context.get()
        if ctx:
            record.user_id = ctx.get('user_id')
            record.request_id = ctx.get('request_id')
            record.trace_id = ctx.get('trace_id')
        
        return True

def setup_logging() -> logging.Logger:
    """Configure application logging"""
    
    # Create logger
    logger = logging.getLogger('al-hidaya')
    
    # Set level based on environment
    if settings.DEBUG:
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)
    
    # Remove existing handlers
    logger.handlers = []
    
    # Console handler with JSON formatter for production
    console_handler = logging.StreamHandler(sys.stdout)
    
    if settings.ENVIRONMENT == 'production':
        # JSON format for production (easier to parse)
        formatter = CustomJsonFormatter(
            '%(timestamp)s %(level)s %(name)s %(message)s'
        )
    else:
        # Human-readable format for development
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    console_handler.setFormatter(formatter)
    
    # Add context filter
    console_handler.addFilter(ContextFilter())
    
    logger.addHandler(console_handler)
    
    # File handler for persistent logs
    if settings.ENVIRONMENT != 'test':
        file_handler = logging.handlers.RotatingFileHandler(
            'logs/app.log',
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5
        )
        file_handler.setFormatter(formatter)
        file_handler.addFilter(ContextFilter())
        logger.addHandler(file_handler)
    
    # Prevent logs from being propagated to the root logger
    logger.propagate = False
    
    return logger

# Initialize logger
logger = setup_logging()

# Convenience functions
def log_debug(message: str, **kwargs):
    """Log debug message with context"""
    logger.debug(message, extra=kwargs)

def log_info(message: str, **kwargs):
    """Log info message with context"""
    logger.info(message, extra=kwargs)

def log_warning(message: str, **kwargs):
    """Log warning message with context"""
    logger.warning(message, extra=kwargs)

def log_error(message: str, error: Optional[Exception] = None, **kwargs):
    """Log error message with context"""
    if error:
        logger.error(message, exc_info=error, extra=kwargs)
    else:
        logger.error(message, extra=kwargs)

def log_critical(message: str, error: Optional[Exception] = None, **kwargs):
    """Log critical message with context"""
    if error:
        logger.critical(message, exc_info=error, extra=kwargs)
    else:
        logger.critical(message, extra=kwargs)

# Performance logging
class LogTimer:
    """Context manager for timing operations"""
    
    def __init__(self, operation_name: str, **kwargs):
        self.operation_name = operation_name
        self.kwargs = kwargs
        self.start_time = None
    
    def __enter__(self):
        self.start_time = datetime.utcnow()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = (datetime.utcnow() - self.start_time).total_seconds() * 1000
        log_info(
            f"Operation completed: {self.operation_name}",
            operation=self.operation_name,
            duration_ms=duration,
            success=exc_type is None,
            **self.kwargs
        )

# Replace print statements
class PrintToLogger:
    """Redirect print statements to logger in production"""
    
    def __init__(self, logger_func):
        self.logger_func = logger_func
    
    def write(self, message):
        if message.strip():  # Ignore empty messages
            self.logger_func(message.strip())
    
    def flush(self):
        pass

# Redirect print in production
if settings.ENVIRONMENT == 'production':
    sys.stdout = PrintToLogger(log_info)
    sys.stderr = PrintToLogger(log_error)

# Configure third-party loggers
def configure_third_party_loggers():
    """Configure logging for third-party libraries"""
    
    # Reduce noise from third-party libraries
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
    logging.getLogger('aiohttp').setLevel(logging.WARNING)
    
    # Configure uvicorn logging
    logging.getLogger('uvicorn').setLevel(logging.INFO)
    logging.getLogger('uvicorn.error').setLevel(logging.INFO)
    logging.getLogger('uvicorn.access').handlers = []  # Remove default handler

configure_third_party_loggers()