import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  Logger,
  BadRequestException
} from '@nestjs/common';
import { IsString, IsArray, IsNumber, IsBoolean, ValidateNested, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { LessonCompletePayload } from '@cognilingua/shared';

/**
 * DTO for exercise data in lesson completion
 */
class ExerciseDto {
  @IsString()
  exerciseId: string;

  @IsString()
  type: string;

  @IsBoolean()
  correct: boolean;

  @IsNumber()
  timeSpent: number;

  @IsNumber()
  attempts: number;
}

/**
 * DTO for lesson completion webhook payload
 */
class LessonCompleteDto implements Omit<LessonCompletePayload, 'timestamp'> {
  @IsString()
  studentId: string;

  @IsString()
  conceptId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  exercises: ExerciseDto[];

  @IsNumber()
  sessionDuration: number;

  @IsOptional()
  @IsNumber()
  confidenceRating?: number;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}

/**
 * Learning Controller - API Gateway
 * 
 * Main entry point for learning-related operations.
 * Handles webhooks and events from frontend/learning platforms.
 * 
 * This controller validates incoming requests and dispatches
 * events to the appropriate microservices:
 * - student-profiler: for profile updates and BKT calculations
 * - content-brain: for curriculum decisions and recommendations
 */
@Controller('learning')
export class LearningController {
  private readonly logger = new Logger(LearningController.name);

  constructor() {
    this.logger.log('LearningController initialized');
  }

  /**
   * POST /learning/webhook/lesson-complete
   * 
   * Webhook endpoint called when a student completes a lesson.
   * Validates the payload and triggers profile update events.
   * 
   * @param dto Lesson completion data
   * @returns Success confirmation
   */
  @Post('webhook/lesson-complete')
  @HttpCode(HttpStatus.OK)
  async lessonComplete(@Body() dto: LessonCompleteDto) {
    this.logger.log(`Lesson complete webhook received for student: ${dto.studentId}`);
    
    try {
      // Validate business rules
      this.validateLessonData(dto);

      // Build the complete payload with timestamp
      const payload: LessonCompletePayload = {
        ...dto,
        timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date()
      };

      // Log the event
      this.logger.log(
        `Processing lesson completion: ` +
        `Student=${payload.studentId}, ` +
        `Concept=${payload.conceptId}, ` +
        `Exercises=${payload.exercises.length}, ` +
        `Duration=${payload.sessionDuration}s`
      );

      // Calculate session performance
      const performance = this.calculatePerformance(payload.exercises);
      
      this.logger.log(
        `Session performance: ${performance.correctCount}/${performance.totalCount} ` +
        `(${performance.percentage.toFixed(1)}%)`
      );

      // TODO: Dispatch event to student-profiler microservice
      // This would use BullMQ or gRPC to send the event
      // await this.eventEmitter.emit('lesson.completed', payload);
      
      // TODO: Update student profile in student-profiler service
      // - Update BKT state with exercise results
      // - Update FSRS parameters
      // - Recalculate mastery levels
      // - Store learning session history

      // TODO: Request next lesson recommendation from content-brain
      // const nextLesson = await this.contentBrainClient.getNextLesson(studentId);

      return {
        success: true,
        message: 'Lesson completion processed successfully',
        data: {
          studentId: payload.studentId,
          conceptId: payload.conceptId,
          performance: {
            score: performance.percentage,
            correct: performance.correctCount,
            total: performance.totalCount,
            averageTime: performance.averageTime
          },
          timestamp: payload.timestamp
        }
      };

    } catch (error) {
      this.logger.error(
        `Error processing lesson completion: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Validate lesson data according to business rules
   */
  private validateLessonData(dto: LessonCompleteDto): void {
    // Validate exercises exist
    if (!dto.exercises || dto.exercises.length === 0) {
      throw new BadRequestException('At least one exercise is required');
    }

    // Validate session duration is reasonable (1 second to 4 hours)
    if (dto.sessionDuration < 1 || dto.sessionDuration > 14400) {
      throw new BadRequestException(
        'Session duration must be between 1 second and 4 hours'
      );
    }

    // Validate confidence rating if provided (1-5 scale)
    if (dto.confidenceRating !== undefined && 
        (dto.confidenceRating < 1 || dto.confidenceRating > 5)) {
      throw new BadRequestException(
        'Confidence rating must be between 1 and 5'
      );
    }

    // Validate exercise time spent
    const totalExerciseTime = dto.exercises.reduce(
      (sum, ex) => sum + ex.timeSpent, 
      0
    );

    if (totalExerciseTime > dto.sessionDuration * 1.5) {
      throw new BadRequestException(
        'Total exercise time exceeds session duration significantly'
      );
    }

    // Validate exercise attempts
    for (const exercise of dto.exercises) {
      if (exercise.attempts < 1 || exercise.attempts > 20) {
        throw new BadRequestException(
          `Invalid attempt count for exercise ${exercise.exerciseId}`
        );
      }

      if (exercise.timeSpent < 1) {
        throw new BadRequestException(
          `Invalid time spent for exercise ${exercise.exerciseId}`
        );
      }
    }
  }

  /**
   * Calculate performance metrics from exercises
   */
  private calculatePerformance(exercises: ExerciseDto[]): {
    totalCount: number;
    correctCount: number;
    incorrectCount: number;
    percentage: number;
    averageTime: number;
  } {
    const totalCount = exercises.length;
    
    // Guard against division by zero
    if (totalCount === 0) {
      return {
        totalCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        percentage: 0,
        averageTime: 0
      };
    }
    
    const correctCount = exercises.filter(ex => ex.correct).length;
    const incorrectCount = totalCount - correctCount;
    const percentage = (correctCount / totalCount) * 100;
    const totalTime = exercises.reduce((sum, ex) => sum + ex.timeSpent, 0);
    const averageTime = totalTime / totalCount;

    return {
      totalCount,
      correctCount,
      incorrectCount,
      percentage,
      averageTime
    };
  }

  /**
   * GET /learning/health
   * Health check endpoint
   */
  @Post('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return {
      status: 'ok',
      service: 'api-gateway',
      controller: 'learning',
      timestamp: new Date().toISOString()
    };
  }
}
