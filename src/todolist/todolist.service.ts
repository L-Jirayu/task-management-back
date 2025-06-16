import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { TodoList, TodoListDocument } from './schemas/todolist.schema';
import { CreateTodoListDto } from './dto/create-todolist.dto';
import { UpdateTodoListDto } from './dto/update-todolist.dto';
import { QueryTodoListDto } from './dto/query-todolist.dto';

type LocalizedField = { [key: string]: string | undefined };

type TodoListTranslated = {
  _id: string;
  name: string;
  description?: string;
  status: boolean;
  date: Date;
  datecomplete: Date;
  assignee?: string;
  subtasks: { title: string; done: boolean }[];
  language: string;
};

type TodoListFull = {
  _id: string;
  name: LocalizedField;
  description?: LocalizedField;
  status: boolean;
  date: Date;
  datecomplete: Date;
  assignee?: string;
  subtasks: { title: LocalizedField; done: boolean }[];
  language: string;
};

@Injectable()
export class TodolistService {
  constructor(
    @InjectModel(TodoList.name)
    private todoListModel: Model<TodoListDocument>,
  ) {}

  async create(dto: CreateTodoListDto): Promise<TodoList> {
    const { name, description, language, subtasks = [], ...rest } = dto;

    const localizedSubtasks = subtasks.map((s) => ({
      title: { [language]: s.title },
      done: s.done ?? false,
    }));

    const newTodo = new this.todoListModel({
      ...rest,
      name: { [language]: name },
      description: description ? { [language]: description } : undefined,
      subtasks: localizedSubtasks,
    });

    return newTodo.save();
  }

  async findAll(query: QueryTodoListDto): Promise<(TodoListTranslated | TodoListFull)[]> {
    const language = query.language === 'en' || query.language === 'th' ? query.language : '';
    const filter: Record<string, unknown> = {};

    if (query.name && language) {
      filter[`name.${language}`] = { $regex: query.name, $options: 'i' };
    }

    if (query.description && language) {
      filter[`description.${language}`] = { $regex: query.description, $options: 'i' };
    }

    if (query.assignee) {
      filter.assignee = { $regex: query.assignee, $options: 'i' };
    }

    if (query.status !== undefined) {
      filter.status = query.status === 'true';
    }

    if (query.date) {
      filter.date = { $gte: new Date(query.date) };
    }

    if (query.datecomplete) {
      filter.datecomplete = { $lte: new Date(query.datecomplete) };
    }

    const limit = Number(query.limit) || 100;
    const offset = Number(query.offset) || 0;

    const localizedFields = ['name', 'description'];
    let sort: Record<string, SortOrder> | undefined;

    if (query.sortBy) {
      if (localizedFields.includes(query.sortBy) && language) {
        sort = { [`${query.sortBy}.${language}`]: query.order === 'desc' ? -1 : 1 };
      } else {
        sort = { [query.sortBy]: query.order === 'desc' ? -1 : 1 };
      }
    }

    const result = await this.todoListModel
      .find(filter)
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();

    return result.map((doc): TodoListFull | TodoListTranslated => {
      const base = {
        _id: doc._id.toString(),
        status: doc.status,
        date: doc.date,
        datecomplete: doc.datecomplete,
        assignee: doc.assignee,
      };

      if (language) {
        return {
          ...base,
          name: doc.name?.[language] ?? Object.values(doc.name || {})[0] ?? '',
          description: doc.description?.[language] ?? Object.values(doc.description || {})[0] ?? '',
          subtasks: (doc.subtasks || []).map((s) => ({
            title: s.title?.[language] ?? Object.values(s.title || {})[0] ?? '',
            done: s.done,
          })),
          language,
        };
      } else {
        return {
          ...base,
          name: doc.name,
          description: doc.description,
          subtasks: doc.subtasks || [],
          language: 'all',
        };
      }
    });
  }

  async findOne(id: string): Promise<TodoList | null> {
    return this.todoListModel.findById(id).exec();
  }

  async update(id: string, dto: UpdateTodoListDto): Promise<TodoList | null> {
    const { name, description, language, subtasks, ...rest } = dto;
    const updateData: Record<string, unknown> = { ...rest };

    if (language && name) {
      updateData[`name.${language}`] = name;
    }

    if (language && description) {
      updateData[`description.${language}`] = description;
    }

    if (language && subtasks) {
      updateData.subtasks = subtasks.map((s) => ({
        title: { [language]: s.title },
        done: s.done ?? false,
      }));
    }

    return this.todoListModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
  }

  async remove(id: string) {
    const result = await this.todoListModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('ID not found');
    }
    return { message: 'Delete successfully' };
  }
}
