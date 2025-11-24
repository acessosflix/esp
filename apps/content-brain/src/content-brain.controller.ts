import { Controller, Get, Param, Logger } from '@nestjs/common';
import { CurriculumService } from './agents/curriculum.service';

@Controller('curriculum')
export class ContentBrainController {
  private readonly logger = new Logger(ContentBrainController.name);

  constructor(private readonly curriculumService: CurriculumService) {}

  @Get('next-topic/:studentId')
  async getNextTopic(@Param('studentId') studentId: string) {
    this.logger.log(`Determining next topic for student ${studentId}`);
    const nextTopic = await this.curriculumService.determineNextTopic(studentId);
    return { studentId, nextTopic };
  }
}
