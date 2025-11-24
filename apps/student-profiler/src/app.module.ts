/**
 * CogniLingua - Student Profiler Application Module
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BktEngine } from './bkt/bkt.engine';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [BktEngine],
  exports: [BktEngine],
})
export class AppModule {}
