import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TodolistService } from './todolist.service';
import { CreateTodoListDto } from './dto/create-todolist.dto';
import { UpdateTodoListDto } from './dto/update-todolist.dto';

import { Query } from '@nestjs/common';
import { QueryTodoListDto } from './dto/query-todolist.dto';

@Controller('todolist')
export class TodolistController {
  constructor(private readonly todolistService: TodolistService) {}

  @Post()
  create(@Body() createTodolistDto: CreateTodoListDto) {
    return this.todolistService.create(createTodolistDto);
  }

  @Get()
  findAll(@Query() query: QueryTodoListDto) {
    return this.todolistService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todolistService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodolistDto: UpdateTodoListDto) {
    return this.todolistService.update(id, updateTodolistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todolistService.remove(id);
  }
}
