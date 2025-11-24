/**
 * BKT Engine Unit Tests
 */

import { BktEngine, BktParameters } from './bkt.engine';

describe('BktEngine', () => {
  let bktEngine: BktEngine;

  beforeEach(() => {
    bktEngine = new BktEngine();
  });

  describe('updateMastery', () => {
    it('should increase mastery probability after a correct response', () => {
      const params: BktParameters = {
        priorKnowledge: 0.3,
        learnRate: 0.1,
        guessRate: 0.2,
        slipRate: 0.1,
      };

      const result = bktEngine.updateMastery(params, 0.3, true);

      expect(result.probabilityOfMastery).toBeGreaterThan(0.3);
      expect(result.correctResponse).toBe(true);
    });

    it('should decrease mastery probability after an incorrect response', () => {
      const params: BktParameters = {
        priorKnowledge: 0.7,
        learnRate: 0.1,
        guessRate: 0.2,
        slipRate: 0.1,
      };

      const result = bktEngine.updateMastery(params, 0.7, false);

      expect(result.probabilityOfMastery).toBeLessThan(0.7);
      expect(result.correctResponse).toBe(false);
    });

    it('should mark as mastered when probability >= 0.95', () => {
      const params: BktParameters = {
        priorKnowledge: 0.9,
        learnRate: 0.2,
        guessRate: 0.1,
        slipRate: 0.05,
      };

      const result = bktEngine.updateMastery(params, 0.92, true);

      expect(result.isMastered).toBe(true);
    });

    it('should apply learning transition after update', () => {
      const params: BktParameters = {
        priorKnowledge: 0.5,
        learnRate: 0.3,
        guessRate: 0.25,
        slipRate: 0.1,
      };

      const result = bktEngine.updateMastery(params, 0.5, true);

      // With learning rate, final probability should reflect transition
      expect(result.probabilityOfMastery).toBeGreaterThan(0.5);
    });
  });

  describe('getInitialMastery', () => {
    it('should return the prior knowledge value', () => {
      const params: BktParameters = {
        priorKnowledge: 0.4,
        learnRate: 0.1,
        guessRate: 0.2,
        slipRate: 0.1,
      };

      const initial = bktEngine.getInitialMastery(params);

      expect(initial).toBe(0.4);
    });
  });

  describe('batchUpdate', () => {
    it('should process multiple responses sequentially', () => {
      const params: BktParameters = {
        priorKnowledge: 0.3,
        learnRate: 0.15,
        guessRate: 0.25,
        slipRate: 0.1,
      };

      const responses = [true, true, false, true, true];
      const result = bktEngine.batchUpdate(params, 0.3, responses);

      // After mostly correct responses, mastery should increase
      expect(result.probabilityOfMastery).toBeGreaterThan(0.3);
      expect(result.correctResponse).toBe(true); // Last response was true
    });

    it('should handle empty responses array', () => {
      const params: BktParameters = {
        priorKnowledge: 0.5,
        learnRate: 0.1,
        guessRate: 0.2,
        slipRate: 0.1,
      };

      const result = bktEngine.batchUpdate(params, 0.5, []);

      expect(result.probabilityOfMastery).toBe(0.5);
    });

    it('should converge to high mastery with many correct responses', () => {
      const params: BktParameters = {
        priorKnowledge: 0.2,
        learnRate: 0.2,
        guessRate: 0.25,
        slipRate: 0.05,
      };

      const responses = Array(10).fill(true);
      const result = bktEngine.batchUpdate(params, 0.2, responses);

      expect(result.probabilityOfMastery).toBeGreaterThan(0.8);
      expect(result.isMastered).toBe(true);
    });
  });
});
