/**
 * CogniLingua - API Gateway Application Module
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LearningController } from './learning/learning.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [LearningController],
  providers: [],
})
export class AppModule {}
