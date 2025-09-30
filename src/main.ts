// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // prefix ทุก API เป็น /api
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      'http://localhost:5173',                 // dev
      'https://minitaskmanage.vercel.app',     // prod (ตัวอย่างที่คุณใช้)
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
