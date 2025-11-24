/**
 * CogniLingua - Content Brain Application Module
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CurriculumService } from './agents/curriculum.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [CurriculumService],
  exports: [CurriculumService],
})
export class AppModule {}
