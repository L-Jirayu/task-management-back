// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TodolistModule } from './todolist/todolist.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

// ⬇️ เพิ่ม serve static
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get<string>('MONGODB_URI') || 'mongodb://root:example@localhost:27017/todolist?authSource=admin',
        dbName: 'todolist',
      }),
    }),

    // ✅ ชี้ไปที่โฟลเดอร์ build ของ Vite (เช่น client/dist)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'dist'),
      // กันไม่ให้ทับ API (เดี๋ยว fallback จัดการ)
      exclude: ['/api', '/api/:path*'],
    }),

    TodolistModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
