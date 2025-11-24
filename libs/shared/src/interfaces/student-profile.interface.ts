/**
 * CogniLingua - Digital Twin Interface
 * Represents the cognitive state and learning profile of a student
 */

/**
 * FSRS (Free Spaced Repetition Scheduler) parameters for memory modeling
 */
export interface FsrsParams {
  /**
   * Stability: How long the memory can be retained before forgetting
   * Measured in days
   */
  stability: number;

  /**
   * Retrievability: Current probability of successfully recalling the information
   * Value between 0 and 1
   */
  retrievability: number;
}

/**
 * Record of a student's interaction with the learning system
 */
export interface InteractionRecord {
  /**
   * Timestamp when the interaction occurred
   */
  timestamp: Date;

  /**
   * ID of the concept involved in the interaction
   */
  conceptId: string;

  /**
   * Type of interaction (e.g., 'exercise', 'review', 'lesson', 'assessment')
   */
  interactionType: string;

  /**
   * Whether the student succeeded in this interaction
   */
  success: boolean;

  /**
   * Optional additional data about the interaction
   */
  metadata?: Record<string, any>;
}

/**
 * Student Profile - Digital Twin Interface
 * Represents the complete cognitive state and learning history of a student
 */
export interface StudentProfile {
  /**
   * Unique identifier for the student
   */
  studentId: string;

  /**
   * Proficiency levels mapped by concept ID
   * Key: concept ID (e.g., 'pronomes-pessoais')
   * Value: proficiency score (0-1 or 0-100)
   */
  proficiencyLevels: Record<string, number>;

  /**
   * FSRS parameters for spaced repetition
   * Key: concept ID
   * Value: FSRS parameters (stability and retrievability)
   */
  fsrsParams: Record<string, FsrsParams>;

  /**
   * Complete history of student interactions
   * Ordered chronologically with newest items last
   */
  interactionHistory: InteractionRecord[];

  /**
   * When this profile was last updated
   */
  lastUpdated: Date;

  /**
   * Optional metadata about the student
   */
  metadata?: {
    preferredLanguage?: string;
    targetProficiencyLevel?: string;
    learningGoals?: string[];
    [key: string]: any;
  };
}
