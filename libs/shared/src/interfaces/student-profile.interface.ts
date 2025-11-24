/**
 * Free Spaced Repetition Scheduler (FSRS) parameters for adaptive learning
 */
export interface FSRSParameters {
  /** Memory stability - how well the concept is retained over time */
  stability: number;
  /** Current retrievability - probability of successful recall */
  retrievability: number;
}

/**
 * Represents the current knowledge state for a specific concept
 */
export interface KnowledgeState {
  /** Estimated probability that the student has mastered this concept */
  masteryProbability: number;
  /** FSRS parameters for spaced repetition scheduling */
  fsrs: FSRSParameters;
  /** Timestamp of the most recent review/interaction */
  lastReview: Date;
}

/**
 * Records a single student interaction with learning content
 */
export interface StudentInteraction {
  /** When the interaction occurred */
  timestamp: Date;
  /** ID of the concept being practiced */
  conceptId: string;
  /** Result of the interaction */
  outcome: 'CORRECT' | 'INCORRECT' | 'HINT';
  /** Time taken to respond in milliseconds */
  responseTimeMs: number;
}

/**
 * Digital twin representing a student's complete learning profile
 */
export interface StudentProfile {
  /** Unique identifier for the student */
  studentId: string;
  /** Map of concept IDs to their current knowledge states */
  knowledgeMap: Record<string, KnowledgeState>;
  /** Historical log of all student interactions */
  interactions: StudentInteraction[];
  /** Optional metadata for tracking profile changes */
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
  };
}
