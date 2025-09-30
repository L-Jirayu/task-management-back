import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TodolistModule } from './todolist/todolist.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    // MongooseModule.forRoot('mongodb://root:example@localhost:27017/todolist?authSource=admin'), 

    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get<string>('MONGODB_URI') || 'mongodb://root:example@localhost:27017/todolist?authSource=admin',
        dbName: 'todolist',
      }),
    }),
    TodolistModule,
    AuthModule,
    UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
