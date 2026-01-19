// API service for PromptBattle frontend

const API_BASE = '/api';

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
  createdAt: string;
  status: string;
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

export interface CreateBattleRequest {
  promptA: string;
  promptB: string;
  topic?: string;
}

export interface VoteRequest {
  vote: 'A' | 'B' | 'tie';
}

export interface VoteResponse {
  battleId: string;
  vote: 'A' | 'B' | 'tie';
  votes: {
    A: number;
    B: number;
    tie: number;
  };
  totalVotes: number;
  winner: 'A' | 'B' | 'tie' | null;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs: number = 60000 // 60 second default timeout
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    
    // Add timeout with AbortController
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(error.error?.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Create a new battle
   */
  async createBattle(data: CreateBattleRequest): Promise<Battle> {
    return this.request<Battle>('/battles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get a specific battle by ID
   */
  async getBattle(battleId: string): Promise<Battle> {
    return this.request<Battle>(`/battles/${battleId}`);
  }

  /**
   * List recent battles
   */
  async listBattles(
    limit: number = 10,
    sortBy: 'recent' | 'popular' = 'recent'
  ): Promise<{ battles: BattleListItem[]; pagination: { total: number } }> {
    return this.request(`/battles?limit=${limit}&sortBy=${sortBy}`);
  }

  /**
   * Cast a vote on a battle
   */
  async vote(battleId: string, choice: 'A' | 'B' | 'tie'): Promise<VoteResponse> {
    return this.request<VoteResponse>(`/battles/${battleId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote: choice }),
    });
  }
}

export const api = new ApiService();
