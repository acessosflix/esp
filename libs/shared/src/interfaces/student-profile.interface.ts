export interface FSRSParameters {
  stability: number;      // Interval in days for 90% recall
  retrievability: number; // Current recall probability
}

export interface KnowledgeState {
  masteryProbability: number; // Calculated by BKT (0.0 to 1.0)
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
  // Map of ConceptID -> Knowledge State
  knowledgeMap: Record<string, KnowledgeState>;
  interactionHistory: StudentInteraction[];
}
