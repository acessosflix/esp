/**
 * CogniLingua - Content Brain Main Entry Point
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.CONTENT_BRAIN_PORT || 3003;
  await app.listen(port);
  
  console.log(`Content Brain is running on: http://localhost:${port}`);
}

bootstrap();
