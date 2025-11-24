/**
 * Student Profile Interfaces for CogniLingua
 * 
 * These interfaces define the structure for tracking student learning progress,
 * knowledge states, and adaptive learning parameters.
 */

/**
 * FSRS (Free Spaced Repetition Scheduler) Parameters
 * Used for optimizing spaced repetition intervals based on student performance
 */
export interface FSRSParameters {
  /** Initial stability of a new card (in days) */
  w: number[];
  
  /** Request retention rate (0-1), target probability of recalling the card */
  requestRetention: number;
  
  /** Maximum interval between reviews (in days) */
  maximumInterval: number;
}

/**
 * Knowledge State for a specific concept
 * Tracks the student's mastery and understanding of a concept
 */
export interface KnowledgeState {
  /** Unique identifier for the concept */
  conceptId: string;
  
  /** Current mastery level (0-1), where 1 is complete mastery */
  mastery: number;
  
  /** Timestamp of the last interaction with this concept */
  lastSeen: Date;
  
  /** Number of times the concept has been reviewed */
  reviewCount: number;
  
  /** Stability value from FSRS (in days) */
  stability?: number;
  
  /** Difficulty value (0-10) representing the inherent difficulty of the concept for this student */
  difficulty?: number;
}

/**
 * Student Interaction event
 * Represents a single learning interaction (e.g., completing a lesson, answering a question)
 */
export interface StudentInteraction {
  /** Unique identifier for the interaction */
  interactionId: string;
  
  /** Student's unique identifier */
  studentId: string;
  
  /** Concept being learned or practiced */
  conceptId: string;
  
  /** Whether the student answered correctly or successfully completed the interaction */
  success: boolean;
  
  /** Optional: Time taken to complete the interaction (in seconds) */
  timeSpent?: number;
  
  /** Timestamp of the interaction */
  timestamp: Date;
  
  /** Type of interaction (e.g., 'lesson', 'quiz', 'practice') */
  interactionType: string;
  
  /** Optional: Additional metadata about the interaction */
  metadata?: Record<string, any>;
}

/**
 * Complete Student Profile
 * Represents the full learning state and parameters for a student
 */
export interface StudentProfile {
  /** Unique identifier for the student */
  studentId: string;
  
  /** Student's display name */
  name: string;
  
  /** FSRS parameters for this student (personalized over time) */
  fsrsParameters: FSRSParameters;
  
  /** Map of concept IDs to their knowledge states */
  knowledgeStates: Map<string, KnowledgeState>;
  
  /** Student's target language */
  targetLanguage: string;
  
  /** Student's native language */
  nativeLanguage: string;
  
  /** Overall proficiency level (e.g., A1, A2, B1, B2, C1, C2) */
  proficiencyLevel?: string;
  
  /** When the student profile was created */
  createdAt: Date;
  
  /** When the student profile was last updated */
  updatedAt: Date;
}
