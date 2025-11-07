
export interface Reading {
  id: string;
  date: string; // YYYY-MM-DD
  day: number; // 6am-6pm
  evening: number; // 6pm-10pm
  night: number; // 10pm-6am
  solar: number;
}

export interface Averages {
  day: string;
  evening: string;
  night: string;
  solar: string;
  count: number;
}

export interface Comparison {
  day: number | null;
  evening: number | null;
  night: number | null;
  solar: number | null;
}
