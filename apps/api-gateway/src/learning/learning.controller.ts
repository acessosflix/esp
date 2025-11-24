import {
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';

/**
 * DTO for lesson completion webhook payload
 */
class LessonCompleteDto {
  @IsString()
  studentId: string;

  @IsString()
  conceptId: string;

  @IsBoolean()
  success: boolean;

  @IsOptional()
  @IsNumber()
  timeSpent?: number;

  @IsOptional()
  @IsString()
  interactionType?: string;
}

/**
 * Learning Controller
 * 
 * Handles learning-related endpoints in the API Gateway.
 * Coordinates with microservices to process learning events.
 */
@Controller('learning')
export class LearningController {
  constructor(
    @Inject('STUDENT_PROFILER_SERVICE')
    private readonly studentProfilerClient: ClientProxy,
  ) {}

  /**
   * Webhook endpoint for lesson completion
   * 
   * This endpoint receives lesson completion events and triggers
   * mastery calculation in the student-profiler microservice.
   * 
   * @param payload - Lesson completion data
   * @returns Success response
   */
  @Post('webhook/lesson-complete')
  @HttpCode(HttpStatus.OK)
  async handleLessonComplete(@Body() payload: LessonCompleteDto) {
    // Validate payload
    if (!payload.studentId || !payload.conceptId) {
      throw new BadRequestException(
        'studentId and conceptId are required fields',
      );
    }

    if (typeof payload.success !== 'boolean') {
      throw new BadRequestException('success must be a boolean value');
    }

    // Prepare event data
    const eventData = {
      studentId: payload.studentId,
      conceptId: payload.conceptId,
      success: payload.success,
      timeSpent: payload.timeSpent,
      interactionType: payload.interactionType || 'lesson',
      timestamp: new Date(),
    };

    // Emit event to student-profiler microservice
    // Using fire-and-forget pattern (emit) rather than request-response
    this.studentProfilerClient.emit('calculate_mastery', eventData);

    return {
      message: 'Lesson completion recorded successfully',
      data: {
        studentId: payload.studentId,
        conceptId: payload.conceptId,
        success: payload.success,
      },
    };
  }

  /**
   * Health check endpoint for the learning controller
   * 
   * @returns Health status
   */
  @Post('health')
  @HttpCode(HttpStatus.OK)
  getHealth() {
    return {
      status: 'ok',
      service: 'learning-controller',
      timestamp: new Date().toISOString(),
    };
  }
}
