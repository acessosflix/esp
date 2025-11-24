import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'get_profile' })
  getProfile(data: { studentId: string }): object {
    return this.appService.getProfile(data.studentId);
  }

  @MessagePattern({ cmd: 'update_profile' })
  updateProfile(data: { studentId: string; interaction: any }): object {
    return this.appService.updateProfile(data.studentId, data.interaction);
  }
}
