import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TodoList, TodoListSchema } from './schemas/todolist.schema';
import { TodolistService } from './todolist.service';
import { TodolistController } from './todolist.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { 
        name: TodoList.name, 
        schema: TodoListSchema 
      },
    ]),
  ],
  controllers: [TodolistController],
  providers: [TodolistService],
})
export class TodolistModule {}
