import { Injectable } from '@nestjs/common';
import { BKTState } from '@cognilingua/shared';

/**
 * BKT Engine - Bayesian Knowledge Tracing
 * 
 * Implements the BKT algorithm to track student knowledge acquisition.
 * BKT models learning as a Hidden Markov Model with two states:
 * - Known: Student has mastered the skill
 * - Unknown: Student has not mastered the skill
 * 
 * Four key parameters:
 * - pL0 (pInit): Initial probability of knowing
 * - pT (pTransit): Probability of learning (transitioning from unknown to known)
 * - pG (pGuess): Probability of guessing correctly when in unknown state
 * - pS (pSlip): Probability of making a mistake when in known state
 */
@Injectable()
export class BKTEngine {
  /**
   * Default BKT parameters
   * These can be tuned based on domain and student population
   */
  private readonly DEFAULT_PARAMS = {
    pInit: 0.1,      // 10% initial knowledge
    pTransit: 0.3,   // 30% chance of learning per opportunity
    pGuess: 0.25,    // 25% chance of guessing (4 options = 1/4)
    pSlip: 0.1,      // 10% chance of slip/mistake
  };

  /**
   * Initialize a new BKT state for a concept
   */
  initializeBKTState(
    customParams?: Partial<typeof this.DEFAULT_PARAMS>
  ): BKTState {
    const params = { ...this.DEFAULT_PARAMS, ...customParams };

    return {
      pLearned: params.pInit,
      pInit: params.pInit,
      pTransit: params.pTransit,
      pGuess: params.pGuess,
      pSlip: params.pSlip,
      correctCount: 0,
      incorrectCount: 0,
      lastUpdated: new Date(),
    };
  }

  /**
   * Update BKT state based on student response
   * 
   * Uses Bayes' theorem to update the probability of mastery:
   * 
   * P(Learned | Correct) = P(Correct | Learned) * P(Learned) / P(Correct)
   * 
   * Where:
   * - P(Correct | Learned) = 1 - pSlip
   * - P(Correct | Not Learned) = pGuess
   * - P(Correct) = P(Correct | Learned) * P(Learned) + P(Correct | Not Learned) * P(Not Learned)
   * 
   * @param state Current BKT state
   * @param correct Whether the response was correct
   * @returns Updated BKT state
   */
  updateBKTState(state: BKTState, correct: boolean): BKTState {
    const pLearned = state.pLearned;
    const pTransit = state.pTransit;
    const pGuess = state.pGuess;
    const pSlip = state.pSlip;

    let newPLearned: number;

    if (correct) {
      // Student answered correctly
      // Update using Bayes' theorem
      const pCorrectIfLearned = 1 - pSlip;
      const pCorrectIfNotLearned = pGuess;
      
      const pCorrect = 
        pCorrectIfLearned * pLearned + 
        pCorrectIfNotLearned * (1 - pLearned);

      // Guard against division by zero
      if (pCorrect > 0) {
        newPLearned = (pCorrectIfLearned * pLearned) / pCorrect;
      } else {
        newPLearned = pLearned; // Keep current probability if denominator is 0
      }

    } else {
      // Student answered incorrectly
      const pIncorrectIfLearned = pSlip;
      const pIncorrectIfNotLearned = 1 - pGuess;
      
      const pIncorrect = 
        pIncorrectIfLearned * pLearned + 
        pIncorrectIfNotLearned * (1 - pLearned);

      // Guard against division by zero
      if (pIncorrect > 0) {
        newPLearned = (pIncorrectIfLearned * pLearned) / pIncorrect;
      } else {
        newPLearned = pLearned; // Keep current probability if denominator is 0
      }
    }

    // Apply learning opportunity (transition probability)
    // Even if currently in "not learned" state, there's a chance of learning
    const finalPLearned = newPLearned + (1 - newPLearned) * pTransit;

    // Ensure probability stays within [0, 1]
    const clampedPLearned = Math.max(0, Math.min(1, finalPLearned));

    return {
      ...state,
      pLearned: clampedPLearned,
      correctCount: correct ? state.correctCount + 1 : state.correctCount,
      incorrectCount: correct ? state.incorrectCount : state.incorrectCount + 1,
      lastUpdated: new Date(),
    };
  }

  /**
   * Batch update BKT state based on multiple responses
   * Useful for updating after a complete session
   * 
   * @param state Current BKT state
   * @param responses Array of correct/incorrect responses
   * @returns Updated BKT state
   */
  batchUpdateBKTState(state: BKTState, responses: boolean[]): BKTState {
    let currentState = state;

    for (const correct of responses) {
      currentState = this.updateBKTState(currentState, correct);
    }

    return currentState;
  }

  /**
   * Calculate mastery level percentage (0-100)
   * 
   * @param state BKT state
   * @returns Mastery percentage
   */
  calculateMasteryLevel(state: BKTState): number {
    return Math.round(state.pLearned * 100);
  }

  /**
   * Determine if concept is mastered
   * Typically mastery threshold is 80% (0.8 probability)
   * 
   * @param state BKT state
   * @param threshold Mastery threshold (default: 0.8)
   * @returns Whether concept is mastered
   */
  isMastered(state: BKTState, threshold: number = 0.8): boolean {
    return state.pLearned >= threshold;
  }

  /**
   * Calculate expected accuracy based on current state
   * This is the probability of answering correctly
   * 
   * P(Correct) = P(Correct | Learned) * P(Learned) + P(Correct | Not Learned) * P(Not Learned)
   * 
   * @param state BKT state
   * @returns Expected accuracy (0-1)
   */
  calculateExpectedAccuracy(state: BKTState): number {
    const pLearned = state.pLearned;
    const pGuess = state.pGuess;
    const pSlip = state.pSlip;

    const pCorrectIfLearned = 1 - pSlip;
    const pCorrectIfNotLearned = pGuess;

    return pCorrectIfLearned * pLearned + pCorrectIfNotLearned * (1 - pLearned);
  }

  /**
   * Recommend practice intensity based on BKT state
   * Returns suggested number of exercises
   * 
   * @param state BKT state
   * @returns Recommended number of exercises
   */
  recommendPracticeIntensity(state: BKTState): {
    exerciseCount: number;
    rationale: string;
  } {
    const mastery = state.pLearned;

    if (mastery < 0.3) {
      return {
        exerciseCount: 10,
        rationale: 'Low mastery - intensive practice needed',
      };
    } else if (mastery < 0.6) {
      return {
        exerciseCount: 7,
        rationale: 'Moderate mastery - regular practice recommended',
      };
    } else if (mastery < 0.8) {
      return {
        exerciseCount: 5,
        rationale: 'Good mastery - light practice to solidify',
      };
    } else {
      return {
        exerciseCount: 3,
        rationale: 'High mastery - maintenance practice only',
      };
    }
  }

  /**
   * Get diagnostic information about learning progress
   * 
   * @param state BKT state
   * @returns Diagnostic information
   */
  getDiagnostics(state: BKTState): {
    masteryLevel: number;
    expectedAccuracy: number;
    totalAttempts: number;
    accuracy: number;
    strengthAssessment: string;
  } {
    const totalAttempts = state.correctCount + state.incorrectCount;
    const accuracy = totalAttempts > 0 
      ? state.correctCount / totalAttempts 
      : 0;

    let strengthAssessment: string;
    if (state.pLearned >= 0.8) {
      strengthAssessment = 'Strong - Concept mastered';
    } else if (state.pLearned >= 0.6) {
      strengthAssessment = 'Good - Nearly mastered';
    } else if (state.pLearned >= 0.4) {
      strengthAssessment = 'Developing - Making progress';
    } else if (state.pLearned >= 0.2) {
      strengthAssessment = 'Weak - Needs more practice';
    } else {
      strengthAssessment = 'Very Weak - Fundamental difficulties';
    }

    return {
      masteryLevel: this.calculateMasteryLevel(state),
      expectedAccuracy: this.calculateExpectedAccuracy(state),
      totalAttempts,
      accuracy,
      strengthAssessment,
    };
  }
}
