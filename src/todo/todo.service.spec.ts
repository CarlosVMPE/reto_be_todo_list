import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import mongoose, { Model } from 'mongoose';
import { Todo } from './schema/todo.schema';
import { getModelToken } from '@nestjs/mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ERROR_MESSAGES } from '../shared/constants';

describe('TodoService', () => {
  let service: TodoService;
  let model: Model<Todo>;

  const mockUser = {
    _id: '75e8d0873fa70cecd1fabae3',
    name: 'Test',
    email: 'test@gmail.com',
  };

  const mockTodo = {
    _id: '65f8697c6b832cc164751a69',
    title: 'Todo 1',
    terminada: false,
    user: '65ef588ac96bfe97e4b2e207',
    createdAt: '2024-03-18T16:19:08.676Z',
    updatedAt: '2024-03-18T16:19:08.676Z',
  };

  const mockTodoService = {
    find: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        { provide: getModelToken(Todo.name), useValue: mockTodoService },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    model = module.get<Model<Todo>>(getModelToken(Todo.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllById', () => {
    it('should return an array of todos by ID', async () => {
      const query = { page: '1', keyword: 'test' };
      /* jest.spyOn(model, 'find').mockImplementation(
        () =>
          ({
            limit: () => ({
              skip: jest.fn().mockResolvedValue([mockTodo]),
            }),
            skip: jest.fn().mockResolvedValue([mockTodo]),
          }) as any,
      ); */
      jest.spyOn(model, 'find').mockResolvedValue([mockTodo]);
      const result = await service.findAllById(query, mockUser as User);
      expect(model.find).toHaveBeenCalledWith({
        user: mockUser._id,
      });
      expect(result).toEqual([mockTodo]);
    });

    it('should return an error when filter todos', async () => {
      const query = { page: '1', keyword: 'test' };

      jest.spyOn(model, 'find').mockRejectedValueOnce(
        new BadRequestException(ERROR_MESSAGES.ERROR_400, {
          cause: new Error(),
          description: 'Some error description',
        }),
      );

      const result = await service.findAllById(query, mockUser as User);
      expect(result).toBeInstanceOf(BadRequestException);
    });
  });

  describe('createTodo', () => {
    it('should create and return a todo', async () => {
      const newTodo = {
        title: 'New Todo',
        terminada: false,
      };

      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockTodo) as any);

      const result = await service.createTodo(
        newTodo as CreateTodoDto,
        mockUser as User,
      );

      expect(result).toEqual(mockTodo);
    });

    it('should fail when create a new todo', async () => {
      const newTodo = {
        title: 'New Todo',
        terminada: false,
      };

      jest.spyOn(model, 'create').mockRejectedValueOnce(
        new BadRequestException(ERROR_MESSAGES.ERROR_400, {
          cause: new Error(),
          description: 'Some error description',
        }),
      );

      const result = await service.createTodo(
        newTodo as CreateTodoDto,
        mockUser as User,
      );

      expect(result).toEqual(
        new BadRequestException(ERROR_MESSAGES.ERROR_400, {
          cause: new Error(),
          description: 'Some error description',
        }),
      );
    });
  });

  describe('findById', () => {
    it('should find and return a todo by ID', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(mockTodo);
      const result = await service.findById(mockTodo._id);
      expect(model.findById).toHaveBeenCalledWith(mockTodo._id);
      expect(result).toEqual(mockTodo);
    });

    it('should throw BadRequestException if invalid ID is provided', async () => {
      const id = 'invalid-id';
      const isValidObjectIDMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(service.findById(id)).rejects.toThrow(BadRequestException);
      expect(isValidObjectIDMock).toHaveBeenCalledWith(id);
      isValidObjectIDMock.mockRestore();
    });

    it('should throw NotFoundException if book is not found', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(null);
      await expect(service.findById(mockTodo._id)).rejects.toThrow(
        NotFoundException,
      );
      expect(model.findById).toHaveBeenCalledWith(mockTodo._id);
    });
  });

  describe('updateById', () => {
    it('should update and return a todo', async () => {
      const updatedTodo = { ...mockTodo, title: 'Updated title' };
      const todo = { title: 'Updated title' };

      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValue(updatedTodo);

      const result = await service.updateById(mockTodo._id, todo as any);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(mockTodo._id, todo, {
        new: true,
        runValidators: true,
      });
      expect(result.title).toEqual(todo.title);
    });

    it('should return an error when try to update a todo', async () => {
      const todo = { title: 'Updated title' };

      jest.spyOn(model, 'findByIdAndUpdate').mockRejectedValueOnce(
        new BadRequestException(ERROR_MESSAGES.ERROR_400, {
          cause: new Error(),
          description: 'Some error description',
        }),
      );

      const result = await service.updateById(mockTodo._id, todo as any);

      expect(result).toEqual(
        new BadRequestException(ERROR_MESSAGES.ERROR_400, {
          cause: new Error(),
          description: 'Some error description',
        }),
      );
    });
  });

  describe('deleteById', () => {
    it('should delete and return a todo', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockResolvedValue(mockTodo);

      const result = await service.deleteById(mockTodo._id);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockTodo._id);
      expect(result).toEqual({ deleted: true });
    });

    it('should return an error when try to delete a todo', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockRejectedValueOnce(
        new BadRequestException(ERROR_MESSAGES.ERROR_400, {
          cause: new Error(),
          description: 'Some error description',
        }),
      );

      const result = await service.deleteById(mockTodo._id);

      expect(result).toEqual(
        new BadRequestException(ERROR_MESSAGES.ERROR_400, {
          cause: new Error(),
          description: 'Some error description',
        }),
      );
    });
  });
});
