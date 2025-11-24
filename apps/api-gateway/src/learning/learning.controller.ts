import { Controller, Post, Body, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

interface LessonCompleteDto {
  studentId: string;
  conceptId: string;
  success: boolean;
}

@Controller('webhook')
export class LearningController {
  private readonly logger = new Logger(LearningController.name);

  constructor(
    @Inject('STUDENT_PROFILER_SERVICE') private client: ClientProxy
  ) {}

  @Post('lesson-complete')
  async handleLessonComplete(@Body() payload: LessonCompleteDto) {
    this.logger.log(`Lesson completed for student ${payload.studentId}`);
    
    // Basic validation (in production use class-validator)
    if (!payload.studentId || !payload.conceptId) {
      throw new Error('Invalid Payload');
    }

    // Trigger async event to recalculate BKT without blocking HTTP response
    this.client.emit('calculate_mastery', payload);

    return { status: 'processing', timestamp: new Date() };
  }
}
