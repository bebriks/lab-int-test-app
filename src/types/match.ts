export type Team = {
  name: string;
  city?: string;
};

export type Match = {
  id: string;
  startsAt: string | null;
  status: string;
  minute?: number;
  home: Team;
  away: Team;
  score: { home: number; away: number } | null;
};

export type MatchFilter = 'all' | 'upcoming' | 'finished';

export type MatchesResponse = {
  matches: Match[];
};