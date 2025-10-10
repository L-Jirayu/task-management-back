import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();

  // ✅ เพิ่ม /health ให้ตอบได้ไวสุด (Render ใช้เช็กว่า container ตื่นแล้ว)
  expressApp.get('/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:5173',          // dev (Vite)
      'https://minitaskmanage.vercel.app', // prod (Vercel deploy)
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
