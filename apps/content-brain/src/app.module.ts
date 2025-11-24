import { Module } from '@nestjs/common';
import { CurriculumService } from './agents/curriculum.service';
import { ContentBrainController } from './content-brain.controller';

@Module({
  controllers: [ContentBrainController],
  providers: [CurriculumService],
})
export class AppModule {}
