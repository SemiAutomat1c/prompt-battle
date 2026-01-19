import { Battle, VoteRecord, BattleListItem } from './types';

// In-memory storage using Maps
class Storage {
  private battles: Map<string, Battle> = new Map();
  private voteRecords: Map<string, VoteRecord[]> = new Map();
  private battlesByDate: string[] = [];
  
  // LRU eviction settings
  private readonly MAX_BATTLES = 1000;
  private readonly MAX_VOTES_PER_BATTLE = 10000;

  /**
   * Save a new battle
   */
  saveBattle(battle: Battle): void {
    this.battles.set(battle.battleId, battle);
    this.battlesByDate.push(battle.battleId);
    this.voteRecords.set(battle.battleId, []);
    
    // Evict old battles if we exceed max
    this.evictIfNeeded();
  }

  /**
   * Get battle by ID
   */
  getBattle(battleId: string): Battle | undefined {
    return this.battles.get(battleId);
  }

  /**
   * Update battle
   */
  updateBattle(battleId: string, updates: Partial<Battle>): Battle | undefined {
    const battle = this.battles.get(battleId);
    if (!battle) return undefined;
    
    const updated = { ...battle, ...updates };
    this.battles.set(battleId, updated);
    return updated;
  }

  /**
   * Add a vote to a battle
   */
  addVote(battleId: string, vote: VoteRecord): Battle | undefined {
    const battle = this.battles.get(battleId);
    if (!battle) return undefined;

    // Add to vote records
    const records = this.voteRecords.get(battleId) || [];
    records.push(vote);
    this.voteRecords.set(battleId, records);

    // Update vote count
    battle.votes[vote.vote]++;
    this.battles.set(battleId, battle);

    return battle;
  }

  /**
   * Check if user already voted
   */
  hasVoted(battleId: string, voterId: string): boolean {
    const records = this.voteRecords.get(battleId) || [];
    return records.some(record => record.voterId === voterId);
  }

  /**
   * Get all battles with optional filtering and sorting
   */
  getBattles(
    offset: number = 0,
    limit: number = 20,
    sortBy: 'recent' | 'popular' | 'controversial' = 'recent',
    filter: 'all' | 'decided' | 'tied' = 'all'
  ): { battles: BattleListItem[]; total: number } {
    let battleList = Array.from(this.battles.values())
      .filter(b => b.status === 'completed');

    // Apply filter
    if (filter === 'decided') {
      battleList = battleList.filter(b => {
        const totalVotes = b.votes.A + b.votes.B + b.votes.tie;
        return totalVotes > 0 && b.votes.A !== b.votes.B;
      });
    } else if (filter === 'tied') {
      battleList = battleList.filter(b => {
        const totalVotes = b.votes.A + b.votes.B + b.votes.tie;
        return totalVotes > 0 && b.votes.A === b.votes.B;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        battleList.sort((a, b) => 
          b.metadata.createdAt.localeCompare(a.metadata.createdAt)
        );
        break;
      
      case 'popular':
        battleList.sort((a, b) => {
          const totalA = a.votes.A + a.votes.B + a.votes.tie;
          const totalB = b.votes.A + b.votes.B + b.votes.tie;
          if (totalA !== totalB) return totalB - totalA;
          return b.metadata.createdAt.localeCompare(a.metadata.createdAt);
        });
        break;
      
      case 'controversial':
        battleList.sort((a, b) => {
          const diffA = Math.abs(a.votes.A - a.votes.B);
          const diffB = Math.abs(b.votes.A - b.votes.B);
          return diffA - diffB; // Ascending - closest battles first
        });
        break;
    }

    const total = battleList.length;
    const paginated = battleList.slice(offset, offset + limit);

    // Convert to list items (truncate prompts)
    const battles: BattleListItem[] = paginated.map(battle => ({
      battleId: battle.battleId,
      promptA: this.truncate(battle.promptA, 100),
      promptB: this.truncate(battle.promptB, 100),
      topic: battle.topic,
      votes: battle.votes,
      totalVotes: battle.votes.A + battle.votes.B + battle.votes.tie,
      winner: this.determineWinner(battle.votes),
      createdAt: battle.metadata.createdAt
    }));

    return { battles, total };
  }

  /**
   * Get total battle count
   */
  getTotalBattles(): number {
    return this.battles.size;
  }

  /**
   * Determine winner based on votes
   */
  private determineWinner(votes: Battle['votes']): 'A' | 'B' | 'tie' | null {
    const totalVotes = votes.A + votes.B + votes.tie;
    if (totalVotes === 0) return null;
    
    if (votes.A > votes.B && votes.A > votes.tie) return 'A';
    if (votes.B > votes.A && votes.B > votes.tie) return 'B';
    if (votes.tie > votes.A && votes.tie > votes.B) return 'tie';
    
    // If there's a tie between A and B (or any combination)
    if (votes.A === votes.B && votes.A > votes.tie) return 'tie';
    if (votes.A === votes.tie && votes.A > votes.B) return 'tie';
    if (votes.B === votes.tie && votes.B > votes.A) return 'tie';
    
    return 'tie';
  }

  /**
   * Truncate text to max length
   */
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Evict old battles when limit is reached (LRU)
   */
  private evictIfNeeded(): void {
    if (this.battles.size <= this.MAX_BATTLES) return;

    const toRemove = this.battles.size - this.MAX_BATTLES;
    const oldestBattles = this.battlesByDate.slice(0, toRemove);

    oldestBattles.forEach(battleId => {
      this.battles.delete(battleId);
      this.voteRecords.delete(battleId);
    });

    this.battlesByDate = this.battlesByDate.slice(toRemove);
    
    console.log(`[Storage] Evicted ${toRemove} old battles (total: ${this.battles.size})`);
  }

  /**
   * Get storage stats
   */
  getStats() {
    const totalVotes = Array.from(this.voteRecords.values())
      .reduce((sum, records) => sum + records.length, 0);

    return {
      totalBattles: this.battles.size,
      totalVotes,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 // MB
    };
  }

  /**
   * Clear all data (for testing)
   */
  clear(): void {
    this.battles.clear();
    this.voteRecords.clear();
    this.battlesByDate = [];
  }
}

// Singleton instance
export const storage = new Storage();
