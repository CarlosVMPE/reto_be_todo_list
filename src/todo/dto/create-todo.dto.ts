import {
  IsArray,
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { User } from '../../auth/schemas/user.schema';
import { TodoItem } from '../schema/todo.schema';

export class CreateTodoDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsBoolean()
  readonly terminada: boolean;

  @IsNotEmpty()
  @IsArray()
  readonly items: TodoItem[];

  @IsEmpty({ message: 'You cannot pass user id' })
  readonly user: User;
}
