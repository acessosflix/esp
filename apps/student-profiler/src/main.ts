import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Create hybrid application (HTTP + Microservice)
  const app = await NestFactory.create(AppModule);

  // Configure as Redis-based microservice for event handling
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
  });

  await app.startAllMicroservices();
  
  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`Student Profiler is running on: http://localhost:${port}`);
}

bootstrap();
