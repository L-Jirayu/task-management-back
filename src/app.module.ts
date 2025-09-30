// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TodolistModule } from './todolist/todolist.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri:
          cfg.get<string>('MONGODB_URI') ||
          'mongodb://root:example@localhost:27017/todolist?authSource=admin',
        dbName: 'todolist',
      }),
    }),

    // ✅ ใช้ RegExp กันไว้เลย ปลอดภัยสุดกับ path-to-regexp v6
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'dist'),
      exclude: [/^\/api(?:\/|$)/ as any],   // <— ตัดทุก route ที่ขึ้นต้นด้วย /api ออก (เช่น /api, /api/..., /api/auth/...)
    }),

    TodolistModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
