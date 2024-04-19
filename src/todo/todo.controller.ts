import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { Todo } from './schema/todo.schema';
import { AuthGuard } from '@nestjs/passport';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('todos')
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Get()
  @UseGuards(AuthGuard())
  async getTodosById(
    @Query() query: ExpressQuery,
    @Req() req,
  ): Promise<Todo[]> {
    return this.todoService.findAllById(query, req.user);
  }

  @Post()
  @UseGuards(AuthGuard())
  async createTodo(
    @Body()
    todo: CreateTodoDto,
    @Req() req,
  ): Promise<Todo> {
    return this.todoService.createTodo(todo, req.user);
  }

  @Get(':id')
  async getTodoById(
    @Param('id')
    id: string,
  ): Promise<Todo> {
    return this.todoService.findById(id);
  }

  @Put(':id')
  async updateTodoById(
    @Param('id')
    id: string,
    @Body()
    todo: UpdateTodoDto,
  ): Promise<Todo> {
    return this.todoService.updateById(id, todo);
  }

  @Delete(':id')
  async deleteTodoById(
    @Param('id')
    id: string,
  ): Promise<{ deleted: boolean }> {
    return this.todoService.deleteById(id);
  }
}
