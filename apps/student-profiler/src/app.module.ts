import { Module } from '@nestjs/common';
import { StudentProfilerController } from './student-profiler.controller';
import { StudentProfilerService } from './student-profiler.service';

@Module({
  controllers: [StudentProfilerController],
  providers: [StudentProfilerService],
})
export class AppModule {}
