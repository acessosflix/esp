export interface FSRSParameters {
  stability: number;
  retrievability: number;
}

export interface KnowledgeState {
  masteryProbability: number;
  fsrs: FSRSParameters;
  lastReview: Date;
}

export interface StudentInteraction {
  timestamp: Date;
  conceptId: string;
  outcome: 'CORRECT' | 'INCORRECT' | 'HINT';
  responseTimeMs: number;
}

export interface StudentProfile {
  studentId: string;
  knowledgeMap: Record<string, KnowledgeState>;
  interactions: StudentInteraction[];
  createdAt: Date;
  updatedAt: Date;
}
