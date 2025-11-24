/**
 * CogniLingua - Learning Controller (API Gateway)
 * Handles learning-related webhooks and triggers profile updates
 */

import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { IsString, IsBoolean, IsNumber, IsObject } from 'class-validator';

/**
 * DTO for lesson completion webhook payload
 */
export class LessonCompleteDto {
  /**
   * Unique identifier for the student
   */
  @IsString()
  studentId: string;

  /**
   * Unique identifier for the lesson
   */
  @IsString()
  lessonId: string;

  /**
   * ID of the concept covered in the lesson
   */
  @IsString()
  conceptId: string;

  /**
   * Whether the student successfully completed the lesson
   */
  @IsBoolean()
  success: boolean;

  /**
   * Score achieved (0-1 or 0-100)
   */
  @IsNumber()
  score: number;

  /**
   * Time spent on the lesson in seconds
   */
  @IsNumber()
  timeSpent: number;

  /**
   * Number of attempts made
   */
  @IsNumber()
  attempts: number;

  /**
   * Optional metadata about the lesson completion
   */
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Response for lesson completion webhook
 */
export interface LessonCompleteResponse {
  /**
   * Whether the webhook was processed successfully
   */
  success: boolean;

  /**
   * Message describing the result
   */
  message: string;

  /**
   * Unique identifier for this event
   */
  eventId: string;
}

/**
 * Learning Controller
 * 
 * Handles webhooks and API requests related to learning activities:
 * 1. Validates incoming payloads
 * 2. Triggers events to student-profiler microservice
 * 3. Returns acknowledgment responses
 */
@Controller('learning')
export class LearningController {
  private readonly logger = new Logger(LearningController.name);

  /**
   * Webhook endpoint for lesson completion events
   * 
   * Flow:
   * 1. Validate the incoming payload
   * 2. Log the lesson completion
   * 3. Send event to student-profiler via gRPC/MessagePattern (mocked)
   * 4. Return acknowledgment
   * 
   * @param payload - Lesson completion data
   * @returns Response indicating successful processing
   */
  @Post('webhook/lesson-complete')
  @HttpCode(HttpStatus.OK)
  async handleLessonComplete(
    @Body() payload: LessonCompleteDto,
  ): Promise<LessonCompleteResponse> {
    this.logger.log(
      `Received lesson-complete webhook for student: ${payload.studentId}, concept: ${payload.conceptId}`,
    );

    // Validate payload
    this.validatePayload(payload);

    // Generate unique event ID
    const eventId = this.generateEventId();

    // Send event to student-profiler microservice (MOCK)
    await this.triggerProfileUpdate(payload, eventId);

    this.logger.log(`Event ${eventId} processed successfully`);

    return {
      success: true,
      message: 'Lesson completion recorded. Profile update triggered.',
      eventId,
    };
  }

  /**
   * Validate the lesson completion payload
   * 
   * @param payload - Payload to validate
   * @throws BadRequestException if validation fails
   */
  private validatePayload(payload: LessonCompleteDto): void {
    // Additional custom validation beyond class-validator decorators
    if (payload.score < 0 || payload.score > 100) {
      throw new BadRequestException('Score must be between 0 and 100');
    }

    if (payload.timeSpent < 0) {
      throw new BadRequestException('Time spent cannot be negative');
    }

    if (payload.attempts < 1) {
      throw new BadRequestException('Attempts must be at least 1');
    }

    this.logger.debug(`Payload validation passed for student: ${payload.studentId}`);
  }

  /**
   * Trigger profile update in student-profiler microservice (MOCK)
   * 
   * In production, this would:
   * 1. Use @nestjs/microservices with gRPC or message queue
   * 2. Emit event with pattern: 'student.profile.update'
   * 3. Student-profiler would consume and process the event
   * 
   * Example with MessagePattern:
   * ```
   * this.studentProfilerClient.emit('student.profile.update', {
   *   studentId: payload.studentId,
   *   eventId: eventId,
   *   conceptId: payload.conceptId,
   *   success: payload.success,
   *   score: payload.score,
   *   timestamp: new Date(),
   * });
   * ```
   * 
   * @param payload - Lesson completion data
   * @param eventId - Unique event identifier
   */
  private async triggerProfileUpdate(
    payload: LessonCompleteDto,
    eventId: string,
  ): Promise<void> {
    this.logger.debug(
      `Triggering profile update for student ${payload.studentId} via gRPC/MessagePattern`,
    );

    // MOCK: Simulate sending event to student-profiler microservice
    const event = {
      pattern: 'student.profile.update',
      data: {
        eventId,
        studentId: payload.studentId,
        conceptId: payload.conceptId,
        lessonId: payload.lessonId,
        success: payload.success,
        score: payload.score,
        timeSpent: payload.timeSpent,
        attempts: payload.attempts,
        timestamp: new Date(),
        metadata: payload.metadata,
      },
    };

    this.logger.debug(`Event payload: ${JSON.stringify(event)}`);

    // In production, this would be:
    // await this.studentProfilerClient.emit(event.pattern, event.data).toPromise();

    // Simulate async processing delay
    await new Promise((resolve) => setTimeout(resolve, 10));

    this.logger.debug(`Event ${eventId} sent to student-profiler successfully`);
  }

  /**
   * Generate a unique event ID
   * 
   * @returns Unique event identifier
   */
  private generateEventId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `evt_${timestamp}_${random}`;
  }
}
