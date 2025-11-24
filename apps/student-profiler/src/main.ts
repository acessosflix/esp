/**
 * CogniLingua - Student Profiler Main Entry Point
 */

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create hybrid application (both HTTP and microservice)
  const app = await NestFactory.create(AppModule);

  // Connect microservice for receiving events from API Gateway
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3001,
    },
  });

  await app.startAllMicroservices();
  
  const port = process.env.STUDENT_PROFILER_PORT || 3002;
  await app.listen(port);
  
  console.log(`Student Profiler is running on: http://localhost:${port}`);
  console.log(`Student Profiler microservice is listening on: tcp://0.0.0.0:3001`);
}

bootstrap();
