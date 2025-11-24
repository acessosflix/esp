import { Injectable, Logger } from '@nestjs/common';
import { BKTEngine } from './bkt/bkt.engine';

interface LessonCompletePayload {
  studentId: string;
  conceptId: string;
  success: boolean;
}

@Injectable()
export class StudentProfilerService {
  private readonly logger = new Logger(StudentProfilerService.name);

  async updateStudentProfile(payload: LessonCompletePayload): Promise<void> {
    this.logger.log(`Updating profile for student ${payload.studentId}, concept ${payload.conceptId}`);
    
    // Simulated current mastery (in real app, would fetch from database)
    const currentMastery = 0.5;
    
    // Update mastery using BKT
    const newMastery = BKTEngine.updateMastery(currentMastery, payload.success);
    
    this.logger.log(`New mastery for ${payload.conceptId}: ${newMastery.toFixed(3)}`);
    
    // In a real application, would persist to database here
  }
}
