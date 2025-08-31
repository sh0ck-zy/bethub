export interface AdminUser {
  id: string; // Matches Supabase auth.users.id
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  
  // Activity tracking
  last_login_at?: string;
  matches_imported_count: number;
  matches_published_count: number;
  
  created_at: string;
  updated_at: string;
}

export interface AdminDashboardStats {
  total_matches: number;
  total_pulled: number;
  total_analyzed: number;
  total_published: number;
  pending_analysis: number;
  failed_analysis: number;
  recent_activity: AdminActivity[];
}

export interface AdminActivity {
  id: string;
  action: 'pull_matches' | 'request_analysis' | 'publish_matches' | 'login';
  details: string;
  user_email: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AdminMatchesResponse {
  success: boolean;
  data: {
    matches: Match[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      has_more: boolean;
      next_offset: number | null;
    };
    summary: {
      total_pulled: number;
      total_analyzed: number;
      total_published: number;
    };
  };
}

export interface PublishMatchesRequest {
  match_ids: string[];
  publish_immediately?: boolean;
}

export interface PublishMatchesResponse {
  success: boolean;
  data: {
    published_count: number;
    matches_updated: Array<{
      match_id: string;
      status: 'published' | 'failed';
      error?: string;
    }>;
  };
}

// For match management actions
export interface MatchAction {
  type: 'analyze' | 'publish' | 'unpublish' | 'delete';
  match_ids: string[];
  options?: {
    priority?: 'low' | 'normal' | 'high';
    force?: boolean;
  };
}

import { Match } from './match.types';