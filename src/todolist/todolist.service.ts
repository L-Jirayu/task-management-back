import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { TodoList, TodoListDocument } from './schemas/todolist.schema';
import { CreateTodoListDto } from './dto/create-todolist.dto';
import { UpdateTodoListDto } from './dto/update-todolist.dto';
import { QueryTodoListDto } from './dto/query-todolist.dto';

@Injectable()
export class TodolistService {
  constructor(
    @InjectModel(TodoList.name)
    private todoListModel: Model<TodoListDocument>,
  ) {}

  private getLang(lang?: string): 'th' | 'en' | '' {
    if (lang === 'th' || lang === 'en') return lang;
    return ''; // all
  }

  // CREATE
  async create(dto: CreateTodoListDto): Promise<TodoList> {
    const lang = this.getLang(dto.language);
    const subtasks = (dto.subtasks || []).map(s => ({
      title: lang ? { [lang]: s.title } : s.title,
      done: s.done ?? false,
    }));

    const newTodo = new this.todoListModel({
      name: dto.name,
      description: dto.description,
      assignee: dto.assignee,
      subtasks,
      status: dto.status ?? false,
      date: dto.date,
      datecomplete: dto.datecomplete,
      language: dto.language,
    });

    return newTodo.save();
  }

  // FIND ALL
  async findAll(query: QueryTodoListDto): Promise<any[]> {
    const lang = this.getLang(query.language);
    const other = lang === 'en' ? 'th' : 'en';

    const filter: any = {};
    if (query.name && lang) filter[`name.${lang}`] = { $regex: query.name, $options: 'i' };
    if (query.description && lang) filter[`description.${lang}`] = { $regex: query.description, $options: 'i' };
    if (query.assignee && lang) filter[`assignee.${lang}`] = { $regex: query.assignee, $options: 'i' };
    if (query.status !== undefined) filter.status = query.status === 'true';
    if (query.date) filter.date = { $gte: new Date(query.date) };
    if (query.datecomplete) filter.datecomplete = { $lte: new Date(query.datecomplete) };
    if (query.subtasks && lang) {filter[`subtasks.title.${lang}`] = { $regex: query.subtasks, $options: 'i' };}

    const limit = Number(query.limit) || 100;
    const offset = Number(query.offset) || 0;
    const sortBy = query.sortBy || 'date';
    const order: SortOrder = query.order === 'desc' ? -1 : 1;
    const sortField = ['name', 'description', 'assignee'].includes(sortBy) && lang
      ? `${sortBy}.${lang}`
      : sortBy;

    const docs = await this.todoListModel
      .find(filter)
      .sort({ [sortField]: order })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();

    return docs.map(doc => ({
      _id: doc._id.toString(),
      name: lang
        ? doc.name?.[lang] ?? doc.name?.[other] ?? ''
        : doc.name,
      description: lang
        ? doc.description?.[lang] ?? doc.description?.[other] ?? ''
        : doc.description,
      assignee: lang
        ? typeof doc.assignee === 'object'
          ? doc.assignee[lang] ?? doc.assignee[other] ?? ''
          : doc.assignee
        : doc.assignee,
      subtasks: (doc.subtasks || []).map(s => ({
        title: lang
          ? typeof s.title === 'object'
            ? s.title[lang] ?? s.title[other] ?? ''
            : s.title
          : s.title,
        done: s.done,
      })),
      status: doc.status,
      date: doc.date,
      datecomplete: doc.datecomplete,
      language: lang || 'all',
    }));
  }

  // FIND ONE
  async findOne(id: string, language?: string): Promise<any> {
    const lang = this.getLang(language);
    const other = lang === 'en' ? 'th' : 'en';

    const doc = await this.todoListModel.findById(id).lean().exec();
    if (!doc) throw new NotFoundException('Not found');

    return {
      _id: doc._id.toString(),
      name: lang
        ? doc.name?.[lang] ?? doc.name?.[other] ?? ''
        : doc.name,
      description: lang
        ? doc.description?.[lang] ?? doc.description?.[other] ?? ''
        : doc.description,
      assignee: lang
        ? typeof doc.assignee === 'object'
          ? doc.assignee[lang] ?? doc.assignee[other] ?? ''
          : doc.assignee
        : doc.assignee,
      subtasks: (doc.subtasks || []).map(s => ({
        title: lang
          ? typeof s.title === 'object'
            ? s.title[lang] ?? s.title[other] ?? ''
            : s.title
          : s.title,
        done: s.done,
      })),
      status: doc.status,
      date: doc.date,
      datecomplete: doc.datecomplete,
      language: lang || 'all',
    };
  }

  // UPDATE
  async update(id: string, dto: UpdateTodoListDto): Promise<TodoList | null> {
    const { name, description, assignee, language, subtasks, ...rest } = dto;
    const updateData: Record<string, any> = { ...rest };

    // NAME
    if (name) {
      if (typeof name === 'object') {
        const nameObj = name as Record<string, string>;
        for (const key in nameObj) {
          updateData[`name.${key}`] = nameObj[key];
        }
      } else if (language) {
        updateData[`name.${language}`] = name;
      } else {
        throw new Error('Language must be provided when name is a string');
      }
    }

    // DESCRIPTION
    if (description) {
      if (typeof description === 'object') {
        const descObj = description as Record<string, string>;
        for (const key in descObj) {
          updateData[`description.${key}`] = descObj[key];
        }
      } else if (language) {
        updateData[`description.${language}`] = description;
      } else {
        throw new Error('Language must be provided when description is a string');
      }
    }

    // ASSIGNEE
    if (assignee) {
      if (typeof assignee === 'object') {
        const assigneeObj = assignee as Record<string, string>;
        for (const key in assigneeObj) {
          updateData[`assignee.${key}`] = assigneeObj[key];
        }
      } else if (language) {
        updateData[`assignee.${language}`] = assignee;
      } else {
        throw new Error('Language must be provided when assignee is a string');
      }
    }

    // SUBTASKS
    if (subtasks) {
      updateData.subtasks = subtasks.map((s) => ({
        title:
          typeof s.title === 'object'
            ? s.title
            : language
            ? { [language]: s.title }
            : (() => {
                throw new Error('Language must be provided when subtask.title is a string');
              })(),
        done: s.done ?? false,
      }));
    }

    // UPDATE
    return this.todoListModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
  }


  // DELETE
  async remove(id: string) {
    const result = await this.todoListModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Not found');
    return { message: 'Deleted successfully' };
  }
}
