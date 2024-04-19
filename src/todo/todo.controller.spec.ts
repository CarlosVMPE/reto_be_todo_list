import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { PassportModule } from '@nestjs/passport';
import { User } from 'src/auth/schemas/user.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

describe('TodoController', () => {
  let controller: TodoController;
  let service: TodoService;

  const mockUser = {
    _id: '75e8d0873fa70cecd1fabae3',
    name: 'Test',
    email: 'test@gmail.com',
  };

  const mockTodos = [
    {
      _id: '65ef5920c96bfe97e4b2e20c',
      title: 'TODO 2',
      terminada: false,
      category: 'Adventure',
      user: '65ef588ac96bfe97e4b2e207',
      createdAt: '2024-03-11T19:18:56.718Z',
      updatedAt: '2024-03-11T20:15:48.173Z',
    },
    {
      _id: '65f8697c6b832cc164751a69',
      title: 'Todo 1',
      terminada: false,
      user: '65ef588ac96bfe97e4b2e207',
      createdAt: '2024-03-18T16:19:08.676Z',
      updatedAt: '2024-03-18T16:19:08.676Z',
    },
  ];

  const mockTodo = {
    _id: '65f8697c6b832cc164751a69',
    title: 'Todo 1',
    terminada: false,
    user: '65ef588ac96bfe97e4b2e207',
    createdAt: '2024-03-18T16:19:08.676Z',
    updatedAt: '2024-03-18T16:19:08.676Z',
  };

  const mockTodoService = {
    findAllById: jest.fn().mockResolvedValueOnce(mockTodos),
    createTodo: jest.fn(),
    updateById: jest.fn(),
    findById: jest.fn().mockResolvedValueOnce(mockTodo),
    deleteById: jest.fn().mockResolvedValueOnce({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: mockTodoService,
        },
      ],
    }).compile();

    controller = module.get<TodoController>(TodoController);
    service = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTodosById', () => {
    it('should get all todos by ID', async () => {
      const result = await controller.getTodosById(
        {
          keyword: 'test',
          page: '1',
        },
        mockUser as User,
      );
      expect(service.findAllById).toHaveBeenCalled();
      expect(result).toEqual(mockTodos);
    });
  });

  describe('createTodo', () => {
    it('should create a new book', async () => {
      const newTodo = {
        title: 'New Todo',
        terminada: false,
      };

      service.createTodo = jest.fn().mockResolvedValueOnce(mockTodo);

      const result = await controller.createTodo(
        newTodo as CreateTodoDto,
        mockUser as User,
      );
      expect(service.createTodo).toHaveBeenCalled();
      expect(result).toEqual(mockTodo);
    });
  });

  describe('getTodoById', () => {
    it('should get a book by ID', async () => {
      const result = await controller.getTodoById(mockTodo._id);
      expect(service.findById).toHaveBeenCalled();
      expect(result).toEqual(mockTodo);
    });
  });

  describe('updateTodoById', () => {
    it('should update a todo by ID', async () => {
      const updatedTodo = { ...mockTodo, title: 'Updated title' };
      const todo = { title: 'Updated title' };
      service.updateById = jest.fn().mockResolvedValueOnce(updatedTodo);
      const result = await controller.updateTodoById(
        mockTodo._id,
        todo as UpdateTodoDto,
      );
      expect(service.updateById).toHaveBeenCalled();
      expect(result).toEqual(updatedTodo);
    });
  });

  describe('deleteTodoById', () => {
    it('should delete a todo by ID', async () => {
      const result = await controller.deleteTodoById(mockTodo._id);
      expect(service.deleteById).toHaveBeenCalled();
      expect(result).toEqual({ deleted: true });
    });
  });
});
