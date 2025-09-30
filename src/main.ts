// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      'http://localhost:5173',              // ถ้าพัฒนาแบบแยก dev server
      'http://localhost:3000',              // ถ้าเปิดจาก Nest โดยตรง
      'https://minitaskmanage.vercel.app',
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });

  // ✅ SPA fallback: path ไหนที่ไม่ใช่ /api/* ให้ส่ง index.html
  const adapter = app.getHttpAdapter();
  (adapter as any).get('*', (req: any, res: any) => {
    if (req.url.startsWith('/api')) {
      return res.status(404).send('Not Found');
    }
    res.sendFile(join(__dirname, '..', 'client', 'dist', 'index.html'));
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
