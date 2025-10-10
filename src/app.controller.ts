import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // ✅ เปลี่ยนชื่อเป็น /ready สำหรับตรวจระบบจริง (DB, module)
  @Get('ready')
  async ready() {
    const state = connection?.readyState ?? 0; // ป้องกัน undefined
    const isConnected = state === 1;

    return {
      dbConnected: isConnected,
      state,
      message: isConnected ? 'Database connected' : 'Database not connected',
    };
  }
}
