import {
  IsArray,
  IsBoolean,
  IsEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { User } from '../../auth/schemas/user.schema';
import { TodoItem } from '../schema/todo.schema';

export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  readonly title: string;

  @IsOptional()
  @IsBoolean()
  readonly terminada: boolean;

  @IsOptional()
  @IsArray()
  readonly items: TodoItem[];

  @IsEmpty({ message: 'You cannot pass user id' })
  readonly user: User;
}
