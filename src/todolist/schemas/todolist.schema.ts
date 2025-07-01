import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TodoListDocument = TodoList & Document;

class LocalizedString {
  [key: string]: string | undefined;
}

class SubTask {
  @Prop({ type: Object, required: true }) // Localized title
  title: LocalizedString;

  @Prop({ default: false })
  done: boolean;
}

@Schema({ timestamps: true})
export class TodoList {
  @Prop({ type: Object, required: true })
  name: LocalizedString;

  @Prop({ type: Object })
  description: LocalizedString;

  @Prop() status: boolean;

  @Prop() date: Date;

  @Prop() datecomplete: Date;

  @Prop({ type: Object })
  assignee?: { [lang: string]: string };

  @Prop({ type: [SubTask], default: [] })
  subtasks: SubTask[];
}

export const TodoListSchema = SchemaFactory.createForClass(TodoList);

