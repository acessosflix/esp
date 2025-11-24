import { Injectable } from '@nestjs/common';
import { KnowledgeState } from '@cognilingua/shared';

/**
 * Interface for a concept candidate from Neo4j
 */
interface ConceptCandidate {
  id: string;
  name: string;
  difficulty: number;
  dependencies: string[];
}

/**
 * Curriculum Service
 * 
 * Responsible for determining the next learning topic for a student
 * based on their current knowledge state and the curriculum graph.
 * Uses a mock 'Psychometrician Agent' to make pedagogically sound decisions.
 */
@Injectable()
export class CurriculumService {
  /**
   * Determines the next topic for the student to learn
   * 
   * @param studentId - Unique identifier for the student
   * @param knowledgeStates - Map of concept IDs to their current knowledge states
   * @returns The ID of the next concept to learn
   */
  async determineNextTopic(
    studentId: string,
    knowledgeStates: Map<string, KnowledgeState>,
  ): Promise<string> {
    // Step 1: Get candidate concepts from Neo4j (mocked for now)
    const candidates = await this.getCandidateConceptsFromNeo4j(knowledgeStates);

    // Step 2: Use the mock Psychometrician Agent to select the best candidate
    const nextConcept = await this.psychometricianAgentDecision(
      candidates,
      knowledgeStates,
    );

    return nextConcept.id;
  }

  /**
   * Mock implementation: Fetches candidate concepts from Neo4j
   * 
   * In a real implementation, this would:
   * 1. Query Neo4j for concepts where all dependencies are mastered
   * 2. Filter out concepts that are already mastered
   * 3. Return concepts that are ready to be learned
   * 
   * @param knowledgeStates - Current knowledge states
   * @returns Array of candidate concepts
   */
  private async getCandidateConceptsFromNeo4j(
    knowledgeStates: Map<string, KnowledgeState>,
  ): Promise<ConceptCandidate[]> {
    // Mock data representing concepts from Neo4j
    const allConcepts: ConceptCandidate[] = [
      {
        id: 'concept_pronomes_pessoais',
        name: 'Pronomes Pessoais',
        difficulty: 1,
        dependencies: [],
      },
      {
        id: 'concept_presente_indicativo',
        name: 'Presente do Indicativo',
        difficulty: 2,
        dependencies: ['concept_pronomes_pessoais'],
      },
    ];

    // Filter to get only learnable concepts
    // (concepts where dependencies are mastered and concept itself is not mastered)
    const candidates = allConcepts.filter((concept) => {
      // Check if concept is already mastered
      const conceptState = knowledgeStates.get(concept.id);
      if (conceptState && conceptState.mastery >= 0.8) {
        return false; // Already mastered
      }

      // Check if all dependencies are mastered
      const dependenciesMastered = concept.dependencies.every((depId) => {
        const depState = knowledgeStates.get(depId);
        return depState && depState.mastery >= 0.8;
      });

      // Include if dependencies are mastered (or no dependencies)
      return dependenciesMastered || concept.dependencies.length === 0;
    });

    return candidates;
  }

  /**
   * Mock Psychometrician Agent
   * 
   * Makes pedagogical decisions about which concept to teach next.
   * Uses a simple heuristic: select the concept with lowest difficulty
   * that the student is ready to learn.
   * 
   * In a real implementation, this could use:
   * - LLM-based reasoning
   * - Complex pedagogical models
   * - Student learning preferences
   * - Time constraints
   * 
   * @param candidates - Available concepts to learn
   * @param knowledgeStates - Current knowledge states
   * @returns The selected concept
   */
  private async psychometricianAgentDecision(
    candidates: ConceptCandidate[],
    knowledgeStates: Map<string, KnowledgeState>,
  ): Promise<ConceptCandidate> {
    if (candidates.length === 0) {
      throw new Error('No available concepts to learn');
    }

    // Simple heuristic: choose the concept with the lowest difficulty
    // that hasn't been seen or has the lowest mastery
    candidates.sort((a, b) => {
      const masteryA = knowledgeStates.get(a.id)?.mastery || 0;
      const masteryB = knowledgeStates.get(b.id)?.mastery || 0;

      // First, prioritize by mastery level (lower is better)
      if (masteryA !== masteryB) {
        return masteryA - masteryB;
      }

      // Then by difficulty (lower is better)
      return a.difficulty - b.difficulty;
    });

    return candidates[0];
  }

  /**
   * Gets the learning path for a student
   * 
   * @param studentId - Unique identifier for the student
   * @param knowledgeStates - Current knowledge states
   * @param pathLength - Number of concepts to include in the path
   * @returns Array of concept IDs representing the learning path
   */
  async getLearningPath(
    studentId: string,
    knowledgeStates: Map<string, KnowledgeState>,
    pathLength: number = 5,
  ): Promise<string[]> {
    const path: string[] = [];
    const tempKnowledgeStates = new Map(knowledgeStates);

    for (let i = 0; i < pathLength; i++) {
      try {
        const nextConcept = await this.determineNextTopic(
          studentId,
          tempKnowledgeStates,
        );
        path.push(nextConcept);

        // Mark this concept as "mastered" in the temporary state
        // to get the next concept in the sequence
        tempKnowledgeStates.set(nextConcept, {
          conceptId: nextConcept,
          mastery: 1.0,
          lastSeen: new Date(),
          reviewCount: 1,
        });
      } catch (error) {
        // No more concepts available
        break;
      }
    }

    return path;
  }
}
