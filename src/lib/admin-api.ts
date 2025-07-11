import { authService } from './auth';

export async function adminApiCall(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    const token = await authService.getAuthToken();
    
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    // Add authorization header if token is available
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      // For demo admin users, we'll rely on the server-side role check
      // The server will check the demo role from localStorage or session
      console.warn('No auth token available, relying on server-side role check');
    }

    return fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error('Admin API call error:', error);
    throw error;
  }
}

export async function adminApiGet(url: string): Promise<Response> {
  return adminApiCall(url, { method: 'GET' });
}

export async function adminApiPost(url: string, data?: any): Promise<Response> {
  return adminApiCall(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function adminApiPut(url: string, data: any): Promise<Response> {
  return adminApiCall(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function adminApiDelete(url: string): Promise<Response> {
  return adminApiCall(url, { method: 'DELETE' });
} 