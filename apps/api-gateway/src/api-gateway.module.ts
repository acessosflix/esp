import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LearningModule } from './learning/learning.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LearningModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiGatewayModule {}
