"""
Enhanced API documentation with OpenAPI/Swagger
"""
from typing import Dict, Any
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from fastapi.responses import HTMLResponse

def custom_openapi(app: FastAPI) -> Dict[str, Any]:
    """Generate custom OpenAPI schema"""
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Al-Hidaya Platform API",
        version="1.0.0",
        description="""
# Al-Hidaya Platform API Documentation 🕌

Welcome to the Al-Hidaya Platform API. This comprehensive Islamic platform provides access to:

## Features

### 📖 Quran
- Complete Quran text with multiple translations
- Search functionality across all verses
- Audio recitations from renowned reciters
- Tafsir (interpretation) in multiple languages

### 📿 Hadith
- Access to authentic Hadith collections
- Search across multiple books
- Categorized by topics
- Chain of narration (Isnad) information

### 🕰️ Prayer Times
- Accurate prayer times for any location
- Multiple calculation methods
- Qibla direction
- Prayer notifications

### 📅 Islamic Calendar
- Hijri calendar with important dates
- Convert between Hijri and Gregorian
- Islamic events and holidays

### 💰 Zakat Calculator
- Calculate Zakat on various assets
- Save calculations for records
- Educational resources about Zakat

### 🤖 AI Assistant
- Islamic knowledge chatbot
- Answer questions about Islam
- Provide guidance based on Quran and Hadith

## Authentication

The API uses **JWT Bearer tokens** for authentication. 

To authenticate:
1. Register a new account or login
2. Use the returned token in the Authorization header: `Bearer YOUR_TOKEN`

## Rate Limiting

- General endpoints: 60 requests/minute
- Authentication endpoints: 5 requests/minute
- Prayer time calculations: 30 requests/minute

## Response Format

All responses follow this format:

```json
{
    "success": true,
    "data": { ... },
    "message": "Success message",
    "timestamp": "2024-01-09T12:00:00Z"
}
```

Error responses:

```json
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "Human readable error message",
        "details": { ... }
    },
    "timestamp": "2024-01-09T12:00:00Z"
}
```

## Supported Languages

The API supports **193 languages** including:
- Arabic (ar)
- English (en)
- French (fr)
- Spanish (es)
- Turkish (tr)
- Urdu (ur)
- Indonesian (id)
- And many more...

Use the `Accept-Language` header to specify your preferred language.

## Versioning

The API uses URL versioning. Current version: `v1`

Example: `https://api.al-hidaya.com/v1/quran/surahs`

## Terms of Service

By using this API, you agree to:
- Use the data respectfully and accurately
- Not misrepresent Islamic teachings
- Provide proper attribution when required
- Respect rate limits and fair usage

## Contact

- **Email**: api@al-hidaya.com
- **Documentation**: https://docs.al-hidaya.com
- **Support**: https://support.al-hidaya.com
- **Discord**: https://discord.gg/al-hidaya

---

Made with ❤️ for the Muslim Ummah
        """,
        routes=app.routes,
        tags=[
            {
                "name": "Authentication",
                "description": "User registration, login, and account management"
            },
            {
                "name": "Quran",
                "description": "Access Quran verses, translations, and audio"
            },
            {
                "name": "Hadith",
                "description": "Browse and search Hadith collections"
            },
            {
                "name": "Prayer Times",
                "description": "Calculate prayer times and Qibla direction"
            },
            {
                "name": "Islamic Calendar",
                "description": "Hijri calendar and date conversions"
            },
            {
                "name": "Zakat",
                "description": "Calculate and manage Zakat obligations"
            },
            {
                "name": "AI Assistant",
                "description": "Islamic knowledge chatbot"
            },
            {
                "name": "User",
                "description": "User profile and preferences"
            },
            {
                "name": "Bookmarks",
                "description": "Save and manage bookmarks"
            },
            {
                "name": "Health",
                "description": "API health and status endpoints"
            }
        ],
        servers=[
            {
                "url": "https://api.al-hidaya.com",
                "description": "Production server"
            },
            {
                "url": "https://staging-api.al-hidaya.com",
                "description": "Staging server"
            },
            {
                "url": "http://localhost:5001",
                "description": "Development server"
            }
        ],
        components={
            "securitySchemes": {
                "bearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT",
                    "description": "JWT Bearer token authentication"
                },
                "apiKey": {
                    "type": "apiKey",
                    "in": "header",
                    "name": "X-API-Key",
                    "description": "API Key authentication (for specific endpoints)"
                }
            },
            "responses": {
                "UnauthorizedError": {
                    "description": "Authentication required",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "success": {"type": "boolean", "example": False},
                                    "error": {
                                        "type": "object",
                                        "properties": {
                                            "code": {"type": "string", "example": "UNAUTHORIZED"},
                                            "message": {"type": "string", "example": "Authentication required"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "ForbiddenError": {
                    "description": "Insufficient permissions",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "success": {"type": "boolean", "example": False},
                                    "error": {
                                        "type": "object",
                                        "properties": {
                                            "code": {"type": "string", "example": "FORBIDDEN"},
                                            "message": {"type": "string", "example": "Insufficient permissions"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "NotFoundError": {
                    "description": "Resource not found",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "success": {"type": "boolean", "example": False},
                                    "error": {
                                        "type": "object",
                                        "properties": {
                                            "code": {"type": "string", "example": "NOT_FOUND"},
                                            "message": {"type": "string", "example": "Resource not found"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "ValidationError": {
                    "description": "Validation error",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "success": {"type": "boolean", "example": False},
                                    "error": {
                                        "type": "object",
                                        "properties": {
                                            "code": {"type": "string", "example": "VALIDATION_ERROR"},
                                            "message": {"type": "string", "example": "Validation failed"},
                                            "details": {
                                                "type": "array",
                                                "items": {
                                                    "type": "object",
                                                    "properties": {
                                                        "field": {"type": "string"},
                                                        "message": {"type": "string"}
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "RateLimitError": {
                    "description": "Rate limit exceeded",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "success": {"type": "boolean", "example": False},
                                    "error": {
                                        "type": "object",
                                        "properties": {
                                            "code": {"type": "string", "example": "RATE_LIMIT_EXCEEDED"},
                                            "message": {"type": "string", "example": "Too many requests"},
                                            "retry_after": {"type": "integer", "example": 60}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        external_docs={
            "description": "Full API Documentation",
            "url": "https://docs.al-hidaya.com/api"
        }
    )
    
    # Add custom logo
    openapi_schema["info"]["x-logo"] = {
        "url": "https://al-hidaya.com/logo.png",
        "altText": "Al-Hidaya Logo"
    }
    
    # Add code samples
    for path in openapi_schema["paths"]:
        for method in openapi_schema["paths"][path]:
            if method in ["get", "post", "put", "delete"]:
                openapi_schema["paths"][path][method]["x-codeSamples"] = generate_code_samples(
                    method, path
                )
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

def generate_code_samples(method: str, path: str) -> list:
    """Generate code samples for different languages"""
    base_url = "https://api.al-hidaya.com/v1"
    full_url = f"{base_url}{path}"
    
    samples = []
    
    # cURL example
    curl_cmd = f"curl -X {method.upper()} '{full_url}'"
    if method != "get":
        curl_cmd += " \\\n  -H 'Content-Type: application/json'"
    curl_cmd += " \\\n  -H 'Authorization: Bearer YOUR_TOKEN'"
    if method in ["post", "put"]:
        curl_cmd += " \\\n  -d '{\"key\": \"value\"}'"
    
    samples.append({
        "lang": "cURL",
        "source": curl_cmd
    })
    
    # Python example
    python_code = f"""import requests

url = "{full_url}"
headers = {{
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
}}
"""
    if method in ["post", "put"]:
        python_code += """data = {
    "key": "value"
}

response = requests.""" + method + """(url, headers=headers, json=data)"""
    else:
        python_code += f"\nresponse = requests.{method}(url, headers=headers)"
    
    python_code += "\nprint(response.json())"
    
    samples.append({
        "lang": "Python",
        "source": python_code
    })
    
    # JavaScript example
    js_code = f"""const url = '{full_url}';
const headers = {{
  'Authorization': 'Bearer YOUR_TOKEN',
  'Content-Type': 'application/json'
}};
"""
    
    if method in ["post", "put"]:
        js_code += """
const data = {
  key: 'value'
};

fetch(url, {
  method: '""" + method.upper() + """',
  headers: headers,
  body: JSON.stringify(data)
})"""
    else:
        js_code += f"""
fetch(url, {{
  method: '{method.upper()}',
  headers: headers
}})"""
    
    js_code += """
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));"""
    
    samples.append({
        "lang": "JavaScript",
        "source": js_code
    })
    
    return samples

# Custom documentation pages
def get_custom_swagger_ui_html() -> HTMLResponse:
    """Custom Swagger UI with branding"""
    return HTMLResponse(
        content="""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Al-Hidaya API - Swagger UI</title>
            <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
            <link rel="icon" type="image/png" href="https://al-hidaya.com/favicon.png">
            <style>
                .swagger-ui .topbar {
                    display: none;
                }
                .swagger-ui .info {
                    margin: 50px 0;
                }
                .swagger-ui .info .title {
                    color: #1a5f3f;
                }
                .swagger-ui .btn.authorize {
                    background-color: #1a5f3f;
                    border-color: #1a5f3f;
                }
                .swagger-ui .btn.authorize:hover {
                    background-color: #2a7f5f;
                    border-color: #2a7f5f;
                }
                body {
                    background: #f5f5f5;
                }
                .swagger-ui {
                    max-width: 1200px;
                    margin: 0 auto;
                }
            </style>
        </head>
        <body>
            <div id="swagger-ui"></div>
            <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
            <script>
                window.onload = function() {
                    window.ui = SwaggerUIBundle({
                        url: "/openapi.json",
                        dom_id: '#swagger-ui',
                        deepLinking: true,
                        presets: [
                            SwaggerUIBundle.presets.apis,
                            SwaggerUIStandalonePreset
                        ],
                        plugins: [
                            SwaggerUIBundle.plugins.DownloadUrl
                        ],
                        layout: "StandaloneLayout",
                        persistAuthorization: true,
                        tryItOutEnabled: true,
                        requestSnippetsEnabled: true,
                        onComplete: function() {
                            console.log("Swagger UI loaded");
                        }
                    });
                }
            </script>
        </body>
        </html>
        """,
        media_type="text/html"
    )

def get_custom_redoc_html() -> HTMLResponse:
    """Custom ReDoc with branding"""
    return HTMLResponse(
        content="""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Al-Hidaya API - Documentation</title>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
            <link rel="icon" type="image/png" href="https://al-hidaya.com/favicon.png">
            <style>
                body {
                    margin: 0;
                    padding: 0;
                }
                .menu-content {
                    background: #1a5f3f !important;
                }
                .api-content h1 {
                    color: #1a5f3f;
                }
            </style>
        </head>
        <body>
            <redoc spec-url="/openapi.json" 
                   hide-download-button
                   native-scrollbars
                   theme='{
                       "colors": {
                           "primary": {
                               "main": "#1a5f3f"
                           }
                       },
                       "typography": {
                           "fontSize": "14px",
                           "headings": {
                               "fontFamily": "Montserrat, sans-serif"
                           }
                       }
                   }'></redoc>
            <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"></script>
        </body>
        </html>
        """,
        media_type="text/html"
    )