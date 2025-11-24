import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BKTEngine } from './bkt/bkt.engine';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [],
  providers: [BKTEngine],
  exports: [BKTEngine],
})
export class AppModule {}
