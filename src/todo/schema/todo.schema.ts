import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../../auth/schemas/user.schema';

export class TodoItem {
  description: string;
  complete: boolean;
}

@Schema({
  timestamps: true,
})
export class Todo {
  @Prop()
  title: string;

  @Prop()
  terminada: boolean;

  @Prop()
  items: TodoItem[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
