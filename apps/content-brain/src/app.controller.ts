import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'get_concept' })
  getConcept(data: { conceptId: string }): object {
    return this.appService.getConcept(data.conceptId);
  }

  @MessagePattern({ cmd: 'get_dependencies' })
  getDependencies(data: { conceptId: string }): object {
    return this.appService.getDependencies(data.conceptId);
  }
}
