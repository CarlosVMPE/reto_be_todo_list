import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Todo } from './schema/todo.schema';
import * as mongoose from 'mongoose';
import { Query } from 'express-serve-static-core';
import { User } from '../auth/schemas/user.schema';
import { exceptionFn } from '../shared/utils';

@Injectable()
export class TodoService {
  constructor(
    @InjectModel(Todo.name)
    private todoModel: mongoose.Model<Todo>,
  ) {}

  async findAllById(query: Query, user: User): Promise<Todo[]> {
    try {
      //const resPerPage = 2;
      //const currentPage = Number(query.page) || 1;
      //const skip = resPerPage * (currentPage - 1);

      const todos = await this.todoModel.find({
        user: user._id,
      });
      return todos;
    } catch (error) {
      return exceptionFn(error?.status) as any;
    }
  }

  async createTodo(book: Todo, user: User): Promise<Todo> {
    try {
      const data = Object.assign(book, { user: user._id });
      const res = await this.todoModel.create(data);
      return res;
    } catch (error) {
      return exceptionFn(error?.status) as any;
    }
  }

  async findById(id: string): Promise<Todo> {
    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      throw new BadRequestException('Ingrese un id válido.');
    }

    const todo = await this.todoModel.findById(id);

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return todo;
  }

  async updateById(id: string, todo: Todo): Promise<Todo> {
    try {
      return await this.todoModel.findByIdAndUpdate(id, todo, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      return exceptionFn(error?.status) as any;
    }
  }

  async deleteById(id: string): Promise<{ deleted: boolean }> {
    try {
      await this.todoModel.findByIdAndDelete(id);
      return { deleted: true };
    } catch (error) {
      return exceptionFn(error?.status) as any;
    }
  }
}
