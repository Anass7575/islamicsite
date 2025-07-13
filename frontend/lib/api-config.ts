// API configuration for both client and server side
export function getApiUrl() {
  // Server-side (SSR/SSG)
  if (typeof window === 'undefined') {
    // In Docker, use the internal service name
    return process.env.INTERNAL_API_URL || 'http://backend:5000';
  }
  
  // Client-side
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
}