import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:5173',           // ต้องระบุ origin ตรง ๆ ห้ามใช้ '*'
    credentials: true,                          // <<< สำคัญมาก
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: [],                         // ถ้าอยาก expose header เพิ่มเติมค่อยใส่
  });

  await app.listen(3000);
}
bootstrap();
