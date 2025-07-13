"""
OpenTelemetry instrumentation for distributed tracing
"""
from opentelemetry import trace, metrics
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.logging import LoggingInstrumentor
from opentelemetry.propagate import set_global_textmap
from opentelemetry.propagators.b3 import B3MultiFormat
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from opentelemetry.baggage.propagation import W3CBaggagePropagator
from opentelemetry.propagators.composite import CompositePropagator
import logging
from contextlib import contextmanager
from typing import Dict, Any, Optional
from functools import wraps
from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

class TelemetryConfig:
    """OpenTelemetry configuration"""
    
    def __init__(self):
        self.service_name = "al-hidaya-backend"
        self.service_version = settings.APP_VERSION
        self.environment = settings.ENVIRONMENT
        self.otlp_endpoint = os.getenv("OTLP_ENDPOINT", "localhost:4317")
        self.resource = None
        self.tracer_provider = None
        self.meter_provider = None
        self.tracer = None
        self.meter = None
    
    def setup(self):
        """Initialize OpenTelemetry"""
        # Create resource
        self.resource = Resource.create({
            "service.name": self.service_name,
            "service.version": self.service_version,
            "deployment.environment": self.environment,
            "telemetry.sdk.language": "python",
            "telemetry.sdk.name": "opentelemetry",
            "host.name": os.getenv("HOSTNAME", "unknown"),
        })
        
        # Setup tracing
        self._setup_tracing()
        
        # Setup metrics
        self._setup_metrics()
        
        # Setup propagators
        self._setup_propagators()
        
        # Instrument libraries
        self._instrument_libraries()
        
        logger.info("OpenTelemetry instrumentation initialized")
    
    def _setup_tracing(self):
        """Setup distributed tracing"""
        # Create tracer provider
        self.tracer_provider = TracerProvider(resource=self.resource)
        
        # Configure OTLP exporter
        otlp_exporter = OTLPSpanExporter(
            endpoint=self.otlp_endpoint,
            insecure=True,  # Use secure=True in production
        )
        
        # Add batch processor
        span_processor = BatchSpanProcessor(
            otlp_exporter,
            max_queue_size=2048,
            max_export_batch_size=512,
            max_export_timeout_millis=30000,
        )
        
        self.tracer_provider.add_span_processor(span_processor)
        
        # Set global tracer provider
        trace.set_tracer_provider(self.tracer_provider)
        
        # Get tracer
        self.tracer = trace.get_tracer(
            self.service_name,
            self.service_version,
        )
    
    def _setup_metrics(self):
        """Setup metrics collection"""
        # Create metric reader
        metric_reader = PeriodicExportingMetricReader(
            exporter=OTLPMetricExporter(
                endpoint=self.otlp_endpoint,
                insecure=True,
            ),
            export_interval_millis=60000,  # Export every minute
        )
        
        # Create meter provider
        self.meter_provider = MeterProvider(
            resource=self.resource,
            metric_readers=[metric_reader],
        )
        
        # Set global meter provider
        metrics.set_meter_provider(self.meter_provider)
        
        # Get meter
        self.meter = metrics.get_meter(
            self.service_name,
            self.service_version,
        )
    
    def _setup_propagators(self):
        """Setup context propagators"""
        # Use composite propagator for multiple formats
        set_global_textmap(
            CompositePropagator([
                TraceContextTextMapPropagator(),
                B3MultiFormat(),
                W3CBaggagePropagator(),
            ])
        )
    
    def _instrument_libraries(self):
        """Auto-instrument libraries"""
        # FastAPI
        FastAPIInstrumentor.instrument(
            tracer_provider=self.tracer_provider,
            excluded_urls="health,metrics",
        )
        
        # SQLAlchemy
        SQLAlchemyInstrumentor().instrument(
            tracer_provider=self.tracer_provider,
            enable_commenter=True,
        )
        
        # Redis
        RedisInstrumentor().instrument(
            tracer_provider=self.tracer_provider,
        )
        
        # HTTP requests
        RequestsInstrumentor().instrument(
            tracer_provider=self.tracer_provider,
        )
        
        # Logging
        LoggingInstrumentor().instrument(
            set_logging_format=True,
        )

# Global telemetry instance
telemetry = TelemetryConfig()

# Custom span decorators
def traced(span_name: Optional[str] = None, attributes: Optional[Dict[str, Any]] = None):
    """Decorator to add tracing to functions"""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            name = span_name or f"{func.__module__}.{func.__name__}"
            with telemetry.tracer.start_as_current_span(name) as span:
                # Add attributes
                if attributes:
                    for key, value in attributes.items():
                        span.set_attribute(key, value)
                
                # Add function arguments as attributes
                span.set_attribute("function.args", str(args))
                span.set_attribute("function.kwargs", str(kwargs))
                
                try:
                    result = await func(*args, **kwargs)
                    span.set_status(trace.Status(trace.StatusCode.OK))
                    return result
                except Exception as e:
                    span.set_status(
                        trace.Status(trace.StatusCode.ERROR, str(e))
                    )
                    span.record_exception(e)
                    raise
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            name = span_name or f"{func.__module__}.{func.__name__}"
            with telemetry.tracer.start_as_current_span(name) as span:
                # Add attributes
                if attributes:
                    for key, value in attributes.items():
                        span.set_attribute(key, value)
                
                # Add function arguments as attributes
                span.set_attribute("function.args", str(args))
                span.set_attribute("function.kwargs", str(kwargs))
                
                try:
                    result = func(*args, **kwargs)
                    span.set_status(trace.Status(trace.StatusCode.OK))
                    return result
                except Exception as e:
                    span.set_status(
                        trace.Status(trace.StatusCode.ERROR, str(e))
                    )
                    span.record_exception(e)
                    raise
        
        import asyncio
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    
    return decorator

# Context managers for tracing
@contextmanager
def trace_span(name: str, attributes: Optional[Dict[str, Any]] = None):
    """Context manager for creating spans"""
    with telemetry.tracer.start_as_current_span(name) as span:
        if attributes:
            for key, value in attributes.items():
                span.set_attribute(key, value)
        
        try:
            yield span
            span.set_status(trace.Status(trace.StatusCode.OK))
        except Exception as e:
            span.set_status(
                trace.Status(trace.StatusCode.ERROR, str(e))
            )
            span.record_exception(e)
            raise

# Custom metrics
class CustomMetrics:
    """Application-specific metrics using OpenTelemetry"""
    
    def __init__(self, meter):
        self.meter = meter
        
        # Create counters
        self.prayer_counter = self.meter.create_counter(
            name="prayers_logged",
            description="Number of prayers logged",
            unit="1",
        )
        
        self.quran_read_counter = self.meter.create_counter(
            name="quran_verses_read",
            description="Number of Quran verses read",
            unit="1",
        )
        
        # Create histograms
        self.api_latency = self.meter.create_histogram(
            name="api_request_duration",
            description="API request duration",
            unit="ms",
        )
        
        self.db_query_duration = self.meter.create_histogram(
            name="db_query_duration",
            description="Database query duration",
            unit="ms",
        )
        
        # Create gauges
        self.active_users_gauge = self.meter.create_up_down_counter(
            name="active_users",
            description="Number of active users",
            unit="1",
        )
    
    def record_prayer(self, prayer_name: str, user_id: int):
        """Record prayer metric"""
        self.prayer_counter.add(
            1,
            attributes={
                "prayer.name": prayer_name,
                "user.id": str(user_id),
            }
        )
    
    def record_quran_read(self, surah: int, ayah: int, user_id: int):
        """Record Quran reading metric"""
        self.quran_read_counter.add(
            1,
            attributes={
                "quran.surah": str(surah),
                "quran.ayah": str(ayah),
                "user.id": str(user_id),
            }
        )
    
    def record_api_latency(self, endpoint: str, method: str, duration_ms: float):
        """Record API latency"""
        self.api_latency.record(
            duration_ms,
            attributes={
                "http.endpoint": endpoint,
                "http.method": method,
            }
        )
    
    def record_db_query(self, operation: str, table: str, duration_ms: float):
        """Record database query duration"""
        self.db_query_duration.record(
            duration_ms,
            attributes={
                "db.operation": operation,
                "db.table": table,
            }
        )
    
    def update_active_users(self, delta: int):
        """Update active users count"""
        self.active_users_gauge.add(delta)

# Initialize custom metrics
custom_metrics = CustomMetrics(telemetry.meter) if telemetry.meter else None

# Baggage utilities
def set_baggage(key: str, value: str):
    """Set baggage item for propagation"""
    from opentelemetry import baggage
    ctx = baggage.set_baggage(key, value)
    return ctx

def get_baggage(key: str) -> Optional[str]:
    """Get baggage item"""
    from opentelemetry import baggage
    return baggage.get_baggage(key)

# Trace context utilities
def get_current_trace_id() -> Optional[str]:
    """Get current trace ID"""
    span = trace.get_current_span()
    if span and span.get_span_context().is_valid:
        return format(span.get_span_context().trace_id, '032x')
    return None

def get_current_span_id() -> Optional[str]:
    """Get current span ID"""
    span = trace.get_current_span()
    if span and span.get_span_context().is_valid:
        return format(span.get_span_context().span_id, '016x')
    return None

# Error tracking
def track_exception(exception: Exception, context: Optional[Dict[str, Any]] = None):
    """Track exception with context"""
    span = trace.get_current_span()
    if span:
        span.record_exception(exception, attributes=context or {})
        span.set_status(
            trace.Status(trace.StatusCode.ERROR, str(exception))
        )

# Initialize on import
if settings.ENVIRONMENT != "test":
    telemetry.setup()