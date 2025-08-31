// Common API response wrapper
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  metadata?: {
    timestamp: string;
    request_id?: string;
    processing_time_ms?: number;
  };
}

// Pagination wrapper
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
    next_offset: number | null;
    prev_offset: number | null;
  };
}

// Standard error response
export interface APIError {
  success: false;
  error: string;
  details?: string;
  code?: string;
  timestamp: string;
}

// Health check response
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  environment: string;
  version?: string;
  database: 'connected' | 'disconnected';
  external_apis: {
    football_data: 'available' | 'unavailable';
  };
}

// Query parameters for list endpoints
export interface ListQueryParams {
  limit?: string;
  offset?: string;
  sort?: string;
  filter?: string;
  search?: string;
}

// Bulk operation response
export interface BulkOperationResponse {
  success: boolean;
  total_requested: number;
  total_processed: number;
  total_succeeded: number;
  total_failed: number;
  results: Array<{
    id: string;
    status: 'success' | 'failed';
    error?: string;
  }>;
  processing_time_ms: number;
}