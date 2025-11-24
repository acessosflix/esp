import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as neo4j from 'neo4j-driver';
import { 
  StudentProfile, 
  ConceptState, 
  NextLessonRecommendation 
} from '@cognilingua/shared';

/**
 * Curriculum Service - "Round Table" Agent Orchestration
 * 
 * This service acts as the orchestrator for the multi-agent system.
 * It coordinates between:
 * - Knowledge Graph (Neo4j) for curriculum structure
 * - Psychometric Agent for cognitive load assessment
 * - BKT Engine for mastery tracking
 * - FSRS for spaced repetition scheduling
 * 
 * The "Round Table" metaphor represents collaborative decision-making
 * where different AI agents contribute their expertise to determine
 * the optimal next learning step.
 */
@Injectable()
export class CurriculumService {
  private readonly logger = new Logger(CurriculumService.name);
  private neo4jDriver: neo4j.Driver;

  constructor(private configService: ConfigService) {
    // Initialize Neo4j connection
    const neo4jUri = this.configService.get<string>('NEO4J_URI', 'bolt://localhost:7687');
    const neo4jUser = this.configService.get<string>('NEO4J_USER', 'neo4j');
    const neo4jPassword = this.configService.get<string>('NEO4J_PASSWORD', 'password');

    this.neo4jDriver = neo4j.driver(
      neo4jUri,
      neo4j.auth.basic(neo4jUser, neo4jPassword)
    );

    this.logger.log('CurriculumService initialized with Neo4j connection');
  }

  /**
   * Round Table Decision: Determine the next optimal concept to study
   * 
   * This method orchestrates multiple agents:
   * 1. Query Neo4j for available concepts and dependencies
   * 2. Consult psychometric agent for cognitive load
   * 3. Check BKT states for mastery levels
   * 4. Evaluate FSRS for review timing
   * 5. Apply pedagogical rules
   * 6. Make final recommendation
   * 
   * @param studentProfile Complete student profile with all states
   * @returns Recommendation for next lesson
   */
  async getNextLesson(
    studentProfile: StudentProfile
  ): Promise<NextLessonRecommendation> {
    this.logger.log(`Getting next lesson for student: ${studentProfile.studentId}`);

    try {
      // Step 1: Get available concepts from knowledge graph
      const availableConcepts = await this.getAvailableConcepts(studentProfile);

      // Step 2: Assess cognitive load
      const cognitiveLoad = this.assessCognitiveLoad(studentProfile);

      // Step 3: Filter concepts based on prerequisites
      const eligibleConcepts = this.filterByPrerequisites(
        availableConcepts,
        studentProfile
      );

      // Step 4: Check for review opportunities (FSRS)
      const reviewCandidates = this.identifyReviewCandidates(studentProfile);

      // Step 5: Apply pedagogical rules and scoring
      const scoredConcepts = this.scoreConceptCandidates(
        eligibleConcepts,
        reviewCandidates,
        studentProfile,
        cognitiveLoad
      );

      // Step 6: Select the best concept
      const selectedConcept = this.selectBestConcept(scoredConcepts);

      // Step 7: Build recommendation with reasoning
      return this.buildRecommendation(selectedConcept, studentProfile);

    } catch (error) {
      this.logger.error(`Error getting next lesson: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Query Neo4j for available concepts
   * Returns concepts that are in the curriculum and not yet mastered
   */
  private async getAvailableConcepts(
    studentProfile: StudentProfile
  ): Promise<any[]> {
    const session = this.neo4jDriver.session();

    try {
      const result = await session.run(`
        MATCH (c:Concept)
        WHERE NOT c.id IN $masteredIds
        RETURN c.id as id, 
               c.name as name, 
               c.category as category, 
               c.difficulty as difficulty,
               c.estimatedMinutes as estimatedMinutes,
               c.description as description
        ORDER BY c.difficulty, c.name
      `, {
        masteredIds: studentProfile.curriculum.masteredConceptIds
      });

      return result.records.map(record => ({
        id: record.get('id'),
        name: record.get('name'),
        category: record.get('category'),
        difficulty: record.get('difficulty'),
        estimatedMinutes: record.get('estimatedMinutes'),
        description: record.get('description'),
      }));

    } finally {
      await session.close();
    }
  }

  /**
   * Assess current cognitive load of the student
   * Returns a score from 0-100 indicating mental burden
   */
  private assessCognitiveLoad(studentProfile: StudentProfile): number {
    // Use psychometric data if available
    if (studentProfile.psychometrics) {
      return studentProfile.psychometrics.cognitiveLoad;
    }

    // Fallback: estimate based on recent performance
    const recentSessions = studentProfile.learningHistory.slice(-5);
    
    if (recentSessions.length === 0) {
      return 30; // Low load for new students
    }

    const avgPerformance = recentSessions.reduce(
      (sum, session) => sum + session.performanceScore, 0
    ) / recentSessions.length;

    // Higher performance = lower cognitive load
    return Math.max(0, Math.min(100, 100 - avgPerformance));
  }

  /**
   * Filter concepts based on prerequisite mastery
   * A concept is eligible only if all prerequisites are mastered
   */
  private async filterByPrerequisites(
    concepts: any[],
    studentProfile: StudentProfile
  ): Promise<any[]> {
    const session = this.neo4jDriver.session();
    const eligibleConcepts = [];

    try {
      for (const concept of concepts) {
        // Query Neo4j for prerequisites
        const result = await session.run(`
          MATCH (c:Concept {id: $conceptId})-[:DEPENDS_ON]->(prereq:Concept)
          RETURN prereq.id as prereqId
        `, { conceptId: concept.id });

        const prerequisites = result.records.map(r => r.get('prereqId'));

        // Check if all prerequisites are mastered
        const allPrereqsMastered = prerequisites.every(prereqId =>
          studentProfile.curriculum.masteredConceptIds.includes(prereqId)
        );

        if (allPrereqsMastered) {
          eligibleConcepts.push({
            ...concept,
            prerequisites
          });
        }
      }

      return eligibleConcepts;

    } finally {
      await session.close();
    }
  }

  /**
   * Identify concepts that need review based on FSRS
   */
  private identifyReviewCandidates(
    studentProfile: StudentProfile
  ): string[] {
    const now = new Date();
    const reviewCandidates: string[] = [];

    studentProfile.conceptStates.forEach((state, conceptId) => {
      // Check if concept is due for review
      if (state.fsrs.nextReview <= now && state.isMastered) {
        reviewCandidates.push(conceptId);
      }
    });

    return reviewCandidates;
  }

  /**
   * Score concept candidates based on multiple factors
   * Higher score = better candidate for next lesson
   */
  private scoreConceptCandidates(
    eligibleConcepts: any[],
    reviewCandidates: string[],
    studentProfile: StudentProfile,
    cognitiveLoad: number
  ): Array<{ concept: any; score: number; reasoning: string[] }> {
    return eligibleConcepts.map(concept => {
      const reasons: string[] = [];
      let score = 50; // Base score

      // Factor 1: Cognitive load vs difficulty
      if (cognitiveLoad > 70 && concept.difficulty <= 2) {
        score += 20;
        reasons.push('Lower difficulty matches current cognitive state');
      } else if (cognitiveLoad < 40 && concept.difficulty >= 2) {
        score += 15;
        reasons.push('Higher difficulty provides appropriate challenge');
      }

      // Factor 2: Category strength/weakness
      const categoryStates = Array.from(studentProfile.conceptStates.values())
        .filter(s => s.category === concept.category);
      
      if (categoryStates.length > 0) {
        const avgMastery = categoryStates.reduce((sum, s) => sum + s.masteryLevel, 0) 
          / categoryStates.length;
        
        if (avgMastery < 40) {
          score += 10;
          reasons.push('Strengthening weak category');
        }
      }

      // Factor 3: Review priority
      if (reviewCandidates.includes(concept.id)) {
        score += 25;
        reasons.push('Due for spaced repetition review');
      }

      // Factor 4: Learning pace
      if (studentProfile.learningProfile.learningPace === 'fast' && concept.difficulty >= 2) {
        score += 10;
        reasons.push('Fast pace supports challenging material');
      } else if (studentProfile.learningProfile.learningPace === 'slow' && concept.difficulty <= 2) {
        score += 10;
        reasons.push('Moderate pace matches comfort level');
      }

      // Factor 5: Session length compatibility
      const avgSessionLength = studentProfile.learningProfile.averageSessionLength;
      if (concept.estimatedMinutes <= avgSessionLength) {
        score += 5;
        reasons.push('Fits typical session length');
      }

      // Factor 6: Variety (avoid same category repeatedly)
      const lastFiveSessions = studentProfile.learningHistory.slice(-5);
      const recentCategories = lastFiveSessions.map(s => {
        const state = studentProfile.conceptStates.get(s.conceptId);
        return state?.category;
      });
      
      const categoryRepetition = recentCategories.filter(c => c === concept.category).length;
      if (categoryRepetition <= 1) {
        score += 8;
        reasons.push('Provides variety in learning topics');
      }

      return {
        concept,
        score,
        reasoning: reasons
      };
    });
  }

  /**
   * Select the best concept from scored candidates
   */
  private selectBestConcept(
    scoredConcepts: Array<{ concept: any; score: number; reasoning: string[] }>
  ): { concept: any; reasoning: string[] } {
    if (scoredConcepts.length === 0) {
      throw new Error('No eligible concepts available');
    }

    // Sort by score descending
    scoredConcepts.sort((a, b) => b.score - a.score);

    return {
      concept: scoredConcepts[0].concept,
      reasoning: scoredConcepts[0].reasoning
    };
  }

  /**
   * Build the final recommendation object
   */
  private async buildRecommendation(
    selectedData: { concept: any; reasoning: string[] },
    studentProfile: StudentProfile
  ): Promise<NextLessonRecommendation> {
    const { concept, reasoning } = selectedData;
    const session = this.neo4jDriver.session();

    try {
      // Get prerequisite details
      const result = await session.run(`
        MATCH (c:Concept {id: $conceptId})-[:DEPENDS_ON]->(prereq:Concept)
        RETURN prereq.id as id, 
               prereq.name as name
      `, { conceptId: concept.id });

      const prerequisites = result.records.map(record => {
        const prereqId = record.get('id');
        const state = studentProfile.conceptStates.get(prereqId);
        
        return {
          conceptId: prereqId,
          conceptName: record.get('name'),
          masteryLevel: state?.masteryLevel || 0
        };
      });

      return {
        conceptId: concept.id,
        conceptName: concept.name,
        category: concept.category,
        difficulty: concept.difficulty,
        estimatedMinutes: concept.estimatedMinutes,
        reasoning: reasoning.join('; '),
        prerequisites
      };

    } finally {
      await session.close();
    }
  }

  /**
   * Clean up resources
   */
  async onModuleDestroy() {
    await this.neo4jDriver.close();
    this.logger.log('Neo4j driver closed');
  }
}
