import { Module } from '@nestjs/common';
import { LearningController } from './learning/learning.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'STUDENT_PROFILER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.STUDENT_PROFILER_HOST || 'localhost',
          port: parseInt(process.env.STUDENT_PROFILER_PORT || '3001'),
        },
      },
    ]),
  ],
  controllers: [LearningController],
})
export class AppModule {}
