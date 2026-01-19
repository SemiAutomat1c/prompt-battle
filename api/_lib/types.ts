// TypeScript type definitions for PromptBattle API

export interface Battle {
  battleId: string;
  promptA: string;
  promptB: string;
  responseA: string;
  responseB: string;
  topic: string | null;
  votes: {
    A: number;
    B: number;
    tie: number;
  };
  metadata: {
    createdAt: string;
    createdBy?: string;
    generationTime: number;
  };
  status: 'generating' | 'completed' | 'error';
  error?: {
    message: string;
    timestamp: string;
  };
}

export interface VoteRecord {
  voteId: string;
  battleId: string;
  vote: 'A' | 'B' | 'tie';
  voterId: string;
  timestamp: string;
}

export type VoteType = 'A' | 'B' | 'tie';

export interface CreateBattleRequest {
  promptA: string;
  promptB: string;
  topic?: string;
  userId?: string;
}

export interface CreateBattleResponse {
  battleId: string;
  promptA: string;
  promptB: string;
  responseA: string;
  responseB: string;
  topic: string | null;
  votes: {
    A: number;
    B: number;
    tie: number;
  };
  createdAt: string;
  status: 'completed';
}

export interface ListBattlesQuery {
  limit?: number;
  sortBy?: 'recent' | 'popular' | 'controversial';
  filter?: 'all' | 'decided' | 'tied';
  offset?: number;
}

export interface BattleListItem {
  battleId: string;
  promptA: string;
  promptB: string;
  topic: string | null;
  votes: {
    A: number;
    B: number;
    tie: number;
  };
  totalVotes: number;
  winner: 'A' | 'B' | 'tie' | null;
  createdAt: string;
}

export interface ListBattlesResponse {
  battles: BattleListItem[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface VoteRequest {
  vote: VoteType;
  voterId?: string;
}

export interface VoteResponse {
  battleId: string;
  vote: VoteType;
  votes: {
    A: number;
    B: number;
    tie: number;
  };
  totalVotes: number;
  winner: 'A' | 'B' | 'tie' | null;
}

export interface APIError {
  error: {
    code: ErrorCode;
    message: string;
    statusCode: number;
    details?: Record<string, unknown>;
    timestamp: string;
  };
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'BATTLE_NOT_FOUND'
  | 'ALREADY_VOTED'
  | 'RATE_LIMIT'
  | 'GEMINI_SAFETY'
  | 'GEMINI_ERROR'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'INVALID_VOTE';

export interface RateLimitInfo {
  count: number;
  resetAt: number;
}

export interface GeminiGenerationResult {
  responseA: string;
  responseB: string;
  generationTime: number;
}
