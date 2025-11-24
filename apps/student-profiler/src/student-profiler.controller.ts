import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { StudentProfilerService } from './student-profiler.service';

interface LessonCompletePayload {
  studentId: string;
  conceptId: string;
  success: boolean;
}

@Controller()
export class StudentProfilerController {
  private readonly logger = new Logger(StudentProfilerController.name);

  constructor(private readonly profilerService: StudentProfilerService) {}

  @EventPattern('calculate_mastery')
  async handleCalculateMastery(@Payload() data: LessonCompletePayload) {
    this.logger.log(`Processing mastery calculation for student ${data.studentId}`);
    await this.profilerService.updateStudentProfile(data);
  }
}
