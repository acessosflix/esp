import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LearningController } from './learning.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'STUDENT_PROFILER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.STUDENT_PROFILER_HOST || 'localhost',
          port: parseInt(process.env.STUDENT_PROFILER_PORT || '3001', 10),
        },
      },
    ]),
  ],
  controllers: [LearningController],
  providers: [],
})
export class LearningModule {}
